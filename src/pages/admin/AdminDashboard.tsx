import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getQuizzes,
  deleteQuiz,
  duplicateQuiz,
  getAttempts,
  getAttemptsByQuiz,
} from '../../services/storage';
import { Quiz } from '../../types';
import { Button } from '../../components/common/Button';
import { DifficultyBadge, StatusBadge, Badge } from '../../components/common/Badge';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import {
  Plus,
  BookOpen,
  Users,
  Award,
  BarChart3,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  Search,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => getQuizzes());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

  const attempts = getAttempts();

  const reloadQuizzes = () => {
    setQuizzes(getQuizzes());
  };

  const handleDuplicate = (quizId: string) => {
    if (!user) return;
    const duplicated = duplicateQuiz(quizId, user.id);
    if (duplicated) {
      reloadQuizzes();
      success(`Duplicated "${duplicated.title}" as draft!`);
    } else {
      toastError('Failed to duplicate quiz.');
    }
  };

  const confirmDeleteQuiz = () => {
    if (!quizToDelete) return;
    const deleted = deleteQuiz(quizToDelete.id);
    if (deleted) {
      reloadQuizzes();
      success(`Deleted "${quizToDelete.title}".`);
    } else {
      toastError('Could not delete quiz.');
    }
    setQuizToDelete(null);
  };

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true : q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate high-level metrics
  const totalQuizzes = quizzes.length;
  const publishedCount = quizzes.filter((q) => q.status === 'published').length;
  const totalAttempts = attempts.length;
  const avgScore =
    attempts.length > 0
      ? Math.round(
          (attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length) * 10
        ) / 10
      : 0;

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Teacher &amp; Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create, manage quizzes, review performance analytics, and generate questions with Gemini AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/analytics">
            <Button variant="outline" size="md" leftIcon={<BarChart3 className="w-4 h-4" />}>
              All Analytics
            </Button>
          </Link>
          <Link to="/admin/quizzes/new">
            <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Create Quiz
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Quizzes</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalQuizzes}
          </div>
          <div className="text-xs text-slate-400 mt-1">{publishedCount} published live</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Published</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {publishedCount}
          </div>
          <div className="text-xs text-slate-400 mt-1">Available to students</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Attempts</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalAttempts}
          </div>
          <div className="text-xs text-slate-400 mt-1">Submissions recorded</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Average Score</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {avgScore}%
          </div>
          <div className="text-xs text-slate-400 mt-1">Across all submissions</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes by title or category..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'published', 'draft'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                statusFilter === filter
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz List Cards */}
      {filteredQuizzes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 mx-auto flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No quizzes found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto mb-6">
            {search
              ? `No quizzes matched "${search}". Try adjusting your search query.`
              : 'You haven’t created any quizzes in this view yet.'}
          </p>
          <Link to="/admin/quizzes/new">
            <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Create Your First Quiz
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => {
            const quizAttempts = getAttemptsByQuiz(quiz.id);
            const totalPoints = quiz.questions.reduce((acc, q) => acc + q.points, 0);

            return (
              <div
                key={quiz.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="purple" size="sm">{quiz.category}</Badge>
                    <div className="flex items-center gap-1.5">
                      <DifficultyBadge difficulty={quiz.difficulty} size="sm" />
                      <StatusBadge status={quiz.status} size="sm" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {quiz.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {quiz.description || 'No description provided.'}
                  </p>

                  {/* Specs */}
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
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{quizAttempts.length} Attempts</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Link to={`/admin/quizzes/${quiz.id}/edit`}>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Edit className="w-3.5 h-3.5" />}
                        className="w-full text-xs"
                      >
                        Edit
                      </Button>
                    </Link>

                    <Link to={`/admin/quizzes/${quiz.id}/analytics`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<BarChart3 className="w-3.5 h-3.5" />}
                        className="w-full text-xs"
                      >
                        Analytics
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Link
                      to={`/quiz/${quiz.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title="Preview how students experience this quiz"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Preview
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicate(quiz.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Duplicate quiz as draft"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setQuizToDelete(quiz)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete quiz"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal (warns if quiz has attempts) */}
      {quizToDelete && (
        <ConfirmModal
          isOpen={!!quizToDelete}
          onClose={() => setQuizToDelete(null)}
          onConfirm={confirmDeleteQuiz}
          title={`Delete "${quizToDelete.title}"?`}
          message={
            getAttemptsByQuiz(quizToDelete.id).length > 0
              ? `Warning: This quiz has ${
                  getAttemptsByQuiz(quizToDelete.id).length
                } recorded student attempt(s). Deleting it will remove the quiz from student view. Are you sure you wish to proceed?`
              : 'Are you sure you want to permanently delete this quiz? This action cannot be undone.'
          }
          confirmText="Yes, Delete Quiz"
          variant="danger"
        />
      )}
    </div>
  );
};
