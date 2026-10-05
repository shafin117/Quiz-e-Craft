import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getQuizById, getAttemptsByUser, getActiveAttempt } from '../../services/storage';
import { Button } from '../../components/common/Button';
import { DifficultyBadge, Badge } from '../../components/common/Badge';
import {
  ArrowLeft,
  Clock,
  Award,
  Layers,
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Trophy,
  History,
  ShieldCheck,
} from 'lucide-react';

export const QuizOverviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const quiz = id ? getQuizById(id) : undefined;
  const userAttempts = (user && id) ? getAttemptsByUser(user.id).filter((a) => a.quizId === id) : [];
  const activeAttempt = (user && id) ? getActiveAttempt(id, user.id) : null;

  if (!quiz) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quiz Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          The requested quiz may have been removed or unpublished.
        </p>
        <Link to="/student">
          <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Quizzes
          </Button>
        </Link>
      </div>
    );
  }

  const attemptsUsed = userAttempts.length;
  const maxAttemptsReached = quiz.maxAttempts > 0 && attemptsUsed >= quiz.maxAttempts;
  const totalPoints = quiz.questions.reduce((acc, q) => acc + q.points, 0);

  const handleStartOrResume = () => {
    navigate(`/quiz/${quiz.id}/take`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Back button */}
      <div>
        <Link
          to="/student"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all quizzes
        </Link>
      </div>

      {/* Main Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        {/* Header badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="purple" size="md">{quiz.category}</Badge>
          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={quiz.difficulty} />
            <Link to={`/quiz/${quiz.id}/leaderboard`}>
              <button className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                <Trophy className="w-3.5 h-3.5" />
                Leaderboard
              </button>
            </Link>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {quiz.title}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {quiz.description || 'Test your knowledge on this topic.'}
          </p>
        </div>

        {/* Quick Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Questions
            </span>
            <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>{quiz.questions.length}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Time Limit
            </span>
            <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{quiz.timeLimit > 0 ? `${quiz.timeLimit} mins` : 'Untimed'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Passing Score
            </span>
            <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-500" />
              <span>{quiz.passingScore}%</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Points
            </span>
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {totalPoints} pts
            </div>
          </div>
        </div>

        {/* Rules & Instructions */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Important Assessment Rules
          </h3>
          <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside">
            <li>
              Once you start, {quiz.timeLimit > 0 ? `the timer will count down from ${quiz.timeLimit} minutes.` : 'take as much time as you need.'}
            </li>
            <li>
              You can flag any question to easily jump back and review it before final submission.
            </li>
            <li>
              Your responses are automatically preserved in browser storage in case of accidental refresh.
            </li>
            {quiz.timeLimit > 0 && (
              <li className="text-amber-600 dark:text-amber-400 font-medium">
                When the timer expires, all answered questions will automatically submit.
              </li>
            )}
            <li>
              Attempts allowed: {quiz.maxAttempts > 0 ? `${quiz.maxAttempts} attempt(s) maximum` : 'Unlimited attempts'}.
            </li>
          </ul>
        </div>

        {/* In-Progress Active Attempt Banner */}
        {activeAttempt && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                You have an in-progress session for this quiz! Would you like to resume where you left off?
              </span>
            </div>
            <Button size="sm" variant="primary" onClick={handleStartOrResume}>
              Resume Quiz
            </Button>
          </div>
        )}

        {/* Max Attempts Reached Warning */}
        {maxAttemptsReached && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>
              You have reached the maximum allowed attempts ({quiz.maxAttempts}) for this quiz.
            </span>
          </div>
        )}

        {/* Previous Attempts History */}
        {userAttempts.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Your Previous Attempts ({userAttempts.length})
            </h4>

            <div className="space-y-2">
              {userAttempts.map((att, idx) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Attempt #{userAttempts.length - idx}:</span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {att.score}/{att.totalPoints} ({att.percentage}%)
                    </span>
                    <span
                      className={`font-bold ${
                        att.passed ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {att.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  <Link
                    to={`/quiz/${quiz.id}/result/${att.id}`}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View Result &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start Button CTA */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
          <Link to="/student" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Cancel
            </Button>
          </Link>

          <Button
            variant="primary"
            size="lg"
            onClick={handleStartOrResume}
            disabled={maxAttemptsReached}
            leftIcon={activeAttempt ? <RotateCcw className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            className="w-full sm:w-auto px-8 font-bold shadow-md shadow-indigo-500/20"
          >
            {activeAttempt ? 'Resume In-Progress Quiz' : 'Begin Assessment'}
          </Button>
        </div>
      </div>
    </div>
  );
};
