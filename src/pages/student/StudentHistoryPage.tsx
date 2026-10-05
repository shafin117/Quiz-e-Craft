import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAttemptsByUser, getQuizzes } from '../../services/storage';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Award,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

export const StudentHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const allQuizzes = getQuizzes();
  const attempts = user ? getAttemptsByUser(user.id) : [];

  // Metrics
  const totalAttempts = attempts.length;
  const passedCount = attempts.filter((a) => a.passed).length;
  const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;
  const avgScore =
    totalAttempts > 0
      ? Math.round(
          (attempts.reduce((acc, a) => acc + a.percentage, 0) / totalAttempts) * 10
        ) / 10
      : 0;

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}m ${remainingSecs < 10 ? '0' : ''}${remainingSecs}s`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          My Assessment History
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track your past quiz attempts, review solutions, and monitor your score improvements.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Quizzes Taken</span>
            <History className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalAttempts}
          </div>
          <div className="text-xs text-slate-400 mt-1">Total completed submissions</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Average Score</span>
            <Award className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {avgScore}%
          </div>
          <div className="text-xs text-slate-400 mt-1">Overall percentage average</div>
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
            {passedCount} of {totalAttempts} passed
          </div>
        </div>
      </div>

      {/* Attempts List */}
      {attempts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No quiz attempts recorded yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven’t taken any quizzes yet. Explore available quizzes on the dashboard to test your knowledge!
          </p>
          <Link to="/student">
            <Button variant="primary" size="md">
              Explore Quizzes
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            All Submissions
          </h3>

          <div className="space-y-3">
            {attempts.map((attempt) => {
              const quiz = allQuizzes.find((q) => q.id === attempt.quizId);
              const userAttemptsForThis = attempts.filter((a) => a.quizId === attempt.quizId);
              const maxReached =
                quiz && quiz.maxAttempts > 0 && userAttemptsForThis.length >= quiz.maxAttempts;

              return (
                <div
                  key={attempt.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {attempt.quizTitle}
                      </h4>
                      {quiz && <Badge variant="purple" size="sm">{quiz.category}</Badge>}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        Date: {new Date(attempt.submittedAt).toLocaleDateString()}{' '}
                        {new Date(attempt.submittedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {formatSeconds(attempt.timeTaken)}
                      </span>
                    </div>
                  </div>

                  {/* Score & Actions */}
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        {attempt.score}/{attempt.totalPoints} ({attempt.percentage}%)
                      </div>
                      <div className="text-xs">
                        {attempt.passed ? (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                          </span>
                        ) : (
                          <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Failed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/quiz/${attempt.quizId}/result/${attempt.id}`}>
                        <Button variant="outline" size="sm">
                          Results
                        </Button>
                      </Link>

                      {quiz && !maxReached && (
                        <Link to={`/quiz/${quiz.id}`}>
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                          >
                            Retake
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
