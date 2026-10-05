import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getQuizzes, getAttemptsByUser } from '../../services/storage';
import { Quiz, DifficultyLevel } from '../../types';
import { Button } from '../../components/common/Button';
import { DifficultyBadge, Badge } from '../../components/common/Badge';
import {
  Search,
  BookOpen,
  Clock,
  Layers,
  Award,
  ArrowRight,
  CheckCircle2,
  Trophy,
  Sparkles,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const allQuizzes = getQuizzes();
  const userAttempts = user ? getAttemptsByUser(user.id) : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Only show published quizzes to students
  const publishedQuizzes = useMemo(() => {
    return allQuizzes.filter((q) => q.status === 'published');
  }, [allQuizzes]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    publishedQuizzes.forEach((q) => set.add(q.category));
    return ['all', ...Array.from(set)];
  }, [publishedQuizzes]);

  // Filtered quizzes
  const filteredQuizzes = useMemo(() => {
    return publishedQuizzes.filter((q) => {
      const matchesSearch =
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || q.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [publishedQuizzes, searchTerm, selectedCategory, selectedDifficulty]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-10 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Interactive Learning &amp; Certification</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Welcome back, {user?.name.split(' ')[0] || 'Learner'}!
          </h1>
          <p className="text-sm sm:text-base text-indigo-200/90 leading-relaxed">
            Choose a quiz below to challenge your skills. Get instant scoring, comprehensive answer explanations, and climb the leaderboard!
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by quiz title, keyword, or topic..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 font-medium"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Difficulty:
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {cat === 'all' ? 'All Topics' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Cards Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No quizzes found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search keywords or category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => {
            const attemptsForQuiz = userAttempts.filter((a) => a.quizId === quiz.id);
            const hasAttempted = attemptsForQuiz.length > 0;
            const highestScore = hasAttempted
              ? Math.max(...attemptsForQuiz.map((a) => a.percentage))
              : null;
            const hasPassed = attemptsForQuiz.some((a) => a.passed);
            const attemptsUsed = attemptsForQuiz.length;
            const maxAttemptsReached =
              quiz.maxAttempts > 0 && attemptsUsed >= quiz.maxAttempts;

            const totalPoints = quiz.questions.reduce((acc, q) => acc + q.points, 0);

            return (
              <div
                key={quiz.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all group"
              >
                <div>
                  {/* Category & Difficulty */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="purple" size="sm">{quiz.category}</Badge>
                    <DifficultyBadge difficulty={quiz.difficulty} size="sm" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {quiz.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {quiz.description}
                  </p>

                  {/* Meta Specs */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl mb-4">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{quiz.questions.length} Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{quiz.timeLimit > 0 ? `${quiz.timeLimit} mins` : 'Untimed'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>Pass: {quiz.passingScore}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {totalPoints} pts
                      </span>
                    </div>
                  </div>

                  {/* Student Attempt History Pill */}
                  {hasAttempted && (
                    <div className="mb-4 flex items-center justify-between px-3 py-1.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 text-[11px]">
                      <span className="flex items-center gap-1 text-indigo-800 dark:text-indigo-300 font-semibold">
                        {hasPassed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        Best Score: {highestScore}%
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Attempts: {attemptsUsed}
                        {quiz.maxAttempts > 0 ? `/${quiz.maxAttempts}` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action CTA */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <Link
                    to={`/quiz/${quiz.id}/leaderboard`}
                    className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    Board
                  </Link>

                  <Link to={`/quiz/${quiz.id}`} className="flex-1 max-w-[140px]">
                    <Button
                      variant={maxAttemptsReached ? 'secondary' : 'primary'}
                      size="sm"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      className="w-full text-xs"
                    >
                      {maxAttemptsReached
                        ? 'View Details'
                        : hasAttempted
                        ? 'Retake Quiz'
                        : 'Start Quiz'}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
