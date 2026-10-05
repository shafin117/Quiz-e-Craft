import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getQuizzes, getAttempts, getAttemptsByQuiz, getQuizById } from '../../services/storage';
import { exportAttemptsToCSV } from '../../services/export';
import { Attempt, Quiz } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  ArrowLeft,
  Download,
  Search,
  Filter,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const QuizAnalyticsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const quizzes = getQuizzes();
  const allAttempts = getAttempts();

  const [selectedQuizId, setSelectedQuizId] = useState<string>(
    id || (quizzes[0]?.id ?? '')
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [sortField, setSortField] = useState<'date' | 'score' | 'time'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const currentQuiz = quizzes.find((q) => q.id === selectedQuizId);

  // Filter attempts for this quiz
  const quizAttempts = useMemo(() => {
    if (!selectedQuizId) return [];
    return allAttempts.filter((a) => a.quizId === selectedQuizId);
  }, [selectedQuizId, allAttempts]);

  // Overall KPI statistics
  const totalAttempts = quizAttempts.length;
  const passedAttempts = quizAttempts.filter((a) => a.passed).length;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
  const avgScore =
    totalAttempts > 0
      ? Math.round((quizAttempts.reduce((acc, a) => acc + a.percentage, 0) / totalAttempts) * 10) / 10
      : 0;

  const avgTimeSeconds =
    totalAttempts > 0
      ? Math.round(quizAttempts.reduce((acc, a) => acc + a.timeTaken, 0) / totalAttempts)
      : 0;
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}m ${remaining < 10 ? '0' : ''}${remaining}s`;
  };

  // Score distribution for Recharts
  const distributionData = useMemo(() => {
    const buckets = [
      { range: '0-20%', count: 0 },
      { range: '21-40%', count: 0 },
      { range: '41-60%', count: 0 },
      { range: '61-80%', count: 0 },
      { range: '81-100%', count: 0 },
    ];

    quizAttempts.forEach((a) => {
      if (a.percentage <= 20) buckets[0].count++;
      else if (a.percentage <= 40) buckets[1].count++;
      else if (a.percentage <= 60) buckets[2].count++;
      else if (a.percentage <= 80) buckets[3].count++;
      else buckets[4].count++;
    });

    return buckets;
  }, [quizAttempts]);

  // Per-question accuracy calculation
  const questionAccuracyData = useMemo(() => {
    if (!currentQuiz || quizAttempts.length === 0) return [];

    return currentQuiz.questions.map((q, idx) => {
      let correctCount = 0;
      quizAttempts.forEach((att) => {
        const studentAns = att.answers[q.id];
        if (!studentAns) return;

        if (q.type === 'single' || q.type === 'boolean') {
          if (q.correctAnswers.includes(studentAns as string)) correctCount++;
        } else if (q.type === 'multiple') {
          if (Array.isArray(studentAns)) {
            const sortedS = [...studentAns].sort();
            const sortedC = [...q.correctAnswers].sort();
            if (
              sortedS.length === sortedC.length &&
              sortedS.every((v, i) => v === sortedC[i])
            ) {
              correctCount++;
            }
          }
        } else if (q.type === 'text') {
          if (typeof studentAns === 'string') {
            const norm = studentAns.trim().toLowerCase();
            if (q.correctAnswers.some((a) => a.trim().toLowerCase() === norm)) {
              correctCount++;
            }
          }
        }
      });

      const accuracy = Math.round((correctCount / quizAttempts.length) * 100);

      return {
        questionNumber: `Q${idx + 1}`,
        accuracy,
        text: q.text,
        isHard: accuracy < 50,
      };
    });
  }, [currentQuiz, quizAttempts]);

  // Filtered and sorted attempts table
  const displayedAttempts = useMemo(() => {
    return quizAttempts
      .filter((a) => {
        const matchesSearch =
          a.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === 'all'
            ? true
            : statusFilter === 'passed'
            ? a.passed
            : !a.passed;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'date') {
          cmp = new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        } else if (sortField === 'score') {
          cmp = b.percentage - a.percentage;
        } else if (sortField === 'time') {
          cmp = b.timeTaken - a.timeTaken;
        }
        return sortAsc ? -cmp : cmp;
      });
  }, [quizAttempts, searchTerm, statusFilter, sortField, sortAsc]);

  const handleExportCSV = () => {
    if (!currentQuiz) return;
    exportAttemptsToCSV(currentQuiz.title, displayedAttempts);
  };

  return (
    <div className="space-y-8">
      {/* Top Bar with Quiz Selector and CSV export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <button className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Quiz Analytics &amp; Reports
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              In-depth performance metrics, score distributions, and question difficulty breakdown.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Quiz Selector */}
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
          >
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title} ({getAttemptsByQuiz(q.id).length} attempts)
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="md"
            onClick={handleExportCSV}
            disabled={displayedAttempts.length === 0}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export to CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Submissions</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalAttempts}
          </div>
          <div className="text-xs text-slate-400 mt-1">Student attempt records</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Average Score</span>
            <Award className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {avgScore}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Passing target: {currentQuiz?.passingScore || 70}%
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Pass Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {passRate}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {passedAttempts} of {totalAttempts} passed
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Completion Time</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {formatTime(avgTimeSeconds)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Limit: {currentQuiz?.timeLimit ? `${currentQuiz.timeLimit} mins` : 'Untimed'}
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts: Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Distribution Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Score Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Number of students falling into each percentage bracket
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Students">
                  {distributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index >= 3 ? '#10b981' : index === 2 ? '#6366f1' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Per-Question Accuracy Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Per-Question Accuracy
              </h3>
              <p className="text-xs text-slate-500">
                Identify toughest questions (&lt;50% accuracy highlighted in red)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1 text-rose-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Hard
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Normal
              </span>
            </div>
          </div>

          {questionAccuracyData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No attempt data available to calculate question difficulty.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={questionAccuracyData}>
                  <XAxis dataKey="questionNumber" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis unit="%" stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-xs shadow-lg max-w-xs">
                            <div className="font-bold mb-1 text-indigo-300">
                              {data.questionNumber}: {data.accuracy}% Accuracy
                            </div>
                            <div className="text-slate-300 leading-snug">{data.text}</div>
                            {data.isHard && (
                              <div className="text-rose-400 mt-1 font-bold">
                                High difficulty question
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                    {questionAccuracyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.accuracy < 50 ? '#f43f5e' : '#10b981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Attempts Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Student Submissions ({displayedAttempts.length})
            </h3>
            <p className="text-xs text-slate-500">
              Detailed logs of individual test completions
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student or email..."
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
              <option value="time">Sort by Time Taken</option>
            </select>
          </div>
        </div>

        {displayedAttempts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No submissions matched your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Student</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Time Taken</th>
                  <th className="py-3 px-4 rounded-r-xl">Submitted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {displayedAttempts.map((attempt) => (
                  <tr
                    key={attempt.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{attempt.userName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {attempt.userEmail}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {attempt.score} / {attempt.totalPoints}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                      {attempt.percentage}%
                    </td>
                    <td className="py-3 px-4">
                      {attempt.passed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      {formatTime(attempt.timeTaken)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(attempt.submittedAt).toLocaleDateString()}{' '}
                      <span className="text-[11px] opacity-75">
                        {new Date(attempt.submittedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
