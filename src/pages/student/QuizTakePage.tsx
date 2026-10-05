import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getQuizById,
  getActiveAttempt,
  saveActiveAttempt,
  clearActiveAttempt,
  evaluateQuizAttempt,
  saveAttempt,
} from '../../services/storage';
import { Quiz, Question, ActiveAttemptState } from '../../types';
import { Timer } from '../../components/quiz/Timer';
import { QuestionCard } from '../../components/quiz/QuestionCard';
import { QuestionNavigator } from '../../components/quiz/QuestionNavigator';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  ArrowLeft,
  ArrowRight,
  Send,
  AlertTriangle,
  Menu,
  CheckCircle2,
  Clock,
  Flag,
} from 'lucide-react';

export const QuizTakePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { warning, error: toastError, info } = useToast();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showMobileNavigator, setShowMobileNavigator] = useState(false);

  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const startedAtMsRef = useRef<number>(Date.now());
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const currentQuestion = questions[currentIndex];

  // Initialize or restore active attempt
  useEffect(() => {
    if (!id || !user) return;
    const loadedQuiz = getQuizById(id);
    if (!loadedQuiz || loadedQuiz.questions.length === 0) {
      toastError('Quiz not available or has no questions.');
      navigate('/student');
      return;
    }

    setQuiz(loadedQuiz);

    const existingState = getActiveAttempt(id, user.id);

    if (existingState && existingState.questionOrder.length > 0) {
      // Restore ordered questions
      const orderMap = new Map(loadedQuiz.questions.map((q) => [q.id, q]));
      const restoredQuestions = existingState.questionOrder
        .map((qid) => orderMap.get(qid))
        .filter(Boolean) as Question[];

      // Restore option order if applicable
      const reorderedQuestions = restoredQuestions.map((q) => {
        const optOrder = existingState.optionOrders[q.id];
        if (optOrder && q.options.length > 0) {
          const optMap = new Map(q.options.map((o) => [o.id, o]));
          const restoredOpts = optOrder.map((oid) => optMap.get(oid)).filter(Boolean) as any[];
          return { ...q, options: restoredOpts };
        }
        return q;
      });

      setQuestions(reorderedQuestions);
      setCurrentIndex(Math.min(existingState.currentQuestionIndex, reorderedQuestions.length - 1));
      setAnswers(existingState.answers || {});
      setFlaggedIds(existingState.flaggedQuestions || []);
      startedAtMsRef.current = existingState.startedAtMs;

      // Calculate remaining time
      const elapsedSeconds = Math.floor((Date.now() - existingState.startedAtMs) / 1000);
      const limitSeconds = loadedQuiz.timeLimit * 60;
      setTotalSeconds(limitSeconds);

      if (loadedQuiz.timeLimit > 0) {
        const left = Math.max(0, limitSeconds - elapsedSeconds);
        setRemainingSeconds(left);
      } else {
        setRemainingSeconds(0);
      }

      info('Restored your in-progress quiz session.');
    } else {
      // New Attempt Setup: Handle Shuffling
      let preparedQuestions = [...loadedQuiz.questions];
      if (loadedQuiz.shuffleQuestions) {
        preparedQuestions = preparedQuestions.sort(() => Math.random() - 0.5);
      }

      const optionOrdersRecord: Record<string, string[]> = {};
      if (loadedQuiz.shuffleOptions) {
        preparedQuestions = preparedQuestions.map((q) => {
          if (q.type !== 'text' && q.options.length > 0) {
            const shuffledOpts = [...q.options].sort(() => Math.random() - 0.5);
            optionOrdersRecord[q.id] = shuffledOpts.map((o) => o.id);
            return { ...q, options: shuffledOpts };
          }
          return q;
        });
      }

      setQuestions(preparedQuestions);
      setCurrentIndex(0);
      setAnswers({});
      setFlaggedIds([]);
      startedAtMsRef.current = Date.now();

      const limitSec = loadedQuiz.timeLimit * 60;
      setTotalSeconds(limitSec);
      setRemainingSeconds(limitSec);

      // Save initial active state
      const newState: ActiveAttemptState = {
        attemptId: `active_${Date.now()}`,
        quizId: loadedQuiz.id,
        questionOrder: preparedQuestions.map((q) => q.id),
        optionOrders: optionOrdersRecord,
        currentQuestionIndex: 0,
        answers: {},
        flaggedQuestions: [],
        startedAtMs: Date.now(),
        totalDurationSeconds: limitSec,
        lastUpdatedMs: Date.now(),
      };
      saveActiveAttempt(newState, user.id);
    }
  }, [id, user, navigate, toastError, info]);

  // Persist state updates to localStorage
  const persistState = useCallback(
    (newAnswers: Record<string, string | string[]>, newIndex: number, newFlags: string[]) => {
      if (!quiz || !user || questions.length === 0) return;

      const state: ActiveAttemptState = {
        attemptId: `active_${startedAtMsRef.current}`,
        quizId: quiz.id,
        questionOrder: questions.map((q) => q.id),
        optionOrders: {},
        currentQuestionIndex: newIndex,
        answers: newAnswers,
        flaggedQuestions: newFlags,
        startedAtMs: startedAtMsRef.current,
        totalDurationSeconds: totalSeconds,
        lastUpdatedMs: Date.now(),
      };
      saveActiveAttempt(state, user.id);
    },
    [quiz, user, questions, totalSeconds]
  );

  // Warn before leaving page mid-quiz
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Answer change handler
  const handleAnswerChange = (val: string | string[]) => {
    if (!currentQuestion) return;
    const updated = {
      ...answers,
      [currentQuestion.id]: val,
    };
    setAnswers(updated);
    persistState(updated, currentIndex, flaggedIds);
  };

  // Toggle Flag handler
  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    let nextFlags: string[];
    if (flaggedIds.includes(currentQuestion.id)) {
      nextFlags = flaggedIds.filter((id) => id !== currentQuestion.id);
    } else {
      nextFlags = [...flaggedIds, currentQuestion.id];
    }
    setFlaggedIds(nextFlags);
    persistState(answers, currentIndex, nextFlags);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing inside text input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (currentIndex < questions.length - 1) {
            goToQuestion(currentIndex + 1);
          }
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < questions.length - 1) {
          goToQuestion(currentIndex + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          goToQuestion(currentIndex - 1);
        }
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handleToggleFlag();
      } else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        if (currentQuestion && currentQuestion.type !== 'text') {
          const optIndex = parseInt(e.key) - 1;
          if (currentQuestion.options[optIndex]) {
            const optId = currentQuestion.options[optIndex].id;
            if (currentQuestion.type === 'single' || currentQuestion.type === 'boolean') {
              handleAnswerChange(optId);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions.length, currentQuestion]);

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
      persistState(answers, index, flaggedIds);
      setShowMobileNavigator(false);
    }
  };

  // Final Submit Handler
  const handleFinalSubmit = useCallback(async () => {
    if (!quiz || !user || isSubmitting) return;

    setIsSubmitting(true);
    setShowSubmitModal(false);

    try {
      const timeTakenSeconds = Math.max(
        1,
        Math.floor((Date.now() - startedAtMsRef.current) / 1000)
      );

      // Evaluate score using our robust evaluation engine
      const completedAttempt = evaluateQuizAttempt(
        quiz,
        answersRef.current,
        timeTakenSeconds,
        user
      );
      completedAttempt.flaggedQuestions = flaggedIds;

      // Save to storage
      saveAttempt(completedAttempt);

      // Clear the active session
      clearActiveAttempt(quiz.id, user.id);

      // Navigate to results
      navigate(`/quiz/${quiz.id}/result/${completedAttempt.id}`, { replace: true });
    } catch (err: any) {
      console.error('Error submitting quiz attempt:', err);
      toastError('Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  }, [quiz, user, isSubmitting, flaggedIds, navigate, toastError]);

  // Handle timer expiration (Auto-submit)
  const handleTimeUp = useCallback(() => {
    warning('Time is up! Your answers are being submitted automatically.');
    handleFinalSubmit();
  }, [warning, handleFinalSubmit]);

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAnswered = (q: Question) => {
    const ans = answers[q.id];
    if (ans === undefined || ans === null) return false;
    if (typeof ans === 'string') return ans.trim().length > 0;
    if (Array.isArray(ans)) return ans.length > 0;
    return false;
  };

  const answeredCount = questions.filter(isAnswered).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Sticky Top Assessment Header */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
              {quiz.title}
            </h1>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-400">
              Q {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer component */}
            <Timer
              totalSeconds={totalSeconds}
              initialRemainingSeconds={remainingSeconds}
              onTimeUp={handleTimeUp}
              onTick={(left) => {
                // optionally update remaining seconds
              }}
            />

            {/* Mobile Navigator toggle */}
            <button
              onClick={() => setShowMobileNavigator(!showMobileNavigator)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
              title="Toggle question navigator"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Submit Quiz button */}
            <Button
              variant="success"
              size="sm"
              onClick={() => setShowSubmitModal(true)}
              disabled={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <ProgressBar
            value={answeredCount}
            max={questions.length}
            color="indigo"
          />
        </div>
      </div>

      {/* Main Taking Area: Question Card + Navigator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left 3 cols: Question Card */}
        <div className="lg:col-span-3 space-y-4">
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              currentAnswer={answers[currentQuestion.id]}
              isFlagged={flaggedIds.includes(currentQuestion.id)}
              onAnswerChange={handleAnswerChange}
              onToggleFlag={handleToggleFlag}
            />
          )}

          {/* Bottom Action Controls: Previous, Next / Finish */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => goToQuestion(currentIndex - 1)}
              disabled={currentIndex === 0}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentIndex < questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => goToQuestion(currentIndex + 1)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="md"
                  onClick={() => setShowSubmitModal(true)}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Finish &amp; Submit
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 col: Question Navigator (Desktop) */}
        <div className="hidden lg:block lg:col-span-1 sticky top-40">
          <QuestionNavigator
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            flaggedQuestionIds={flaggedIds}
            onSelectQuestion={goToQuestion}
          />
        </div>
      </div>

      {/* Mobile Navigator Drawer / Modal */}
      {showMobileNavigator && (
        <Modal
          isOpen={showMobileNavigator}
          onClose={() => setShowMobileNavigator(false)}
          title="Question Navigator"
          maxWidth="sm"
        >
          <QuestionNavigator
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            flaggedQuestionIds={flaggedIds}
            onSelectQuestion={goToQuestion}
          />
        </Modal>
      )}

      {/* Confirmation Modal before Final Submit */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Ready to submit your quiz?"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Please review your progress before completing this attempt. You will not be able to change answers after submitting.
          </p>

          {/* Progress summary stats */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center text-xs">
            <div>
              <span className="text-slate-400 block font-semibold">Answered</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {answeredCount}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Unanswered</span>
              <span className={`text-base font-extrabold ${unansweredCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {unansweredCount}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Flagged</span>
              <span className="text-base font-extrabold text-amber-500">
                {flaggedIds.length}
              </span>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                You have {unansweredCount} unanswered question(s). Unanswered questions will receive 0 points.
              </span>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSubmitModal(false)}
              disabled={isSubmitting}
            >
              Continue Quiz
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Submit Final Answers
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
