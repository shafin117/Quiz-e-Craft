import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getQuizById, saveQuiz } from '../../services/storage';
import { Quiz, Question, DifficultyLevel, QuizStatus } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { QuestionBuilderModal } from '../../components/admin/QuestionBuilderModal';
import { AiQuestionGeneratorModal } from '../../components/admin/AiQuestionGeneratorModal';
import {
  ArrowLeft,
  Save,
  Plus,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  AlertTriangle,
  HelpCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const QuizEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');
  const { user } = useAuth();
  const { success, error: toastError, warning } = useToast();
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General Knowledge');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [timeLimit, setTimeLimit] = useState<number>(10);
  const [passingScore, setPassingScore] = useState<number>(70);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);
  const [maxAttempts, setMaxAttempts] = useState<number>(3);
  const [status, setStatus] = useState<QuizStatus>('draft');
  const [questions, setQuestions] = useState<Question[]>([]);

  // Modals state
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const existing = getQuizById(id);
      if (existing) {
        setTitle(existing.title);
        setDescription(existing.description || '');
        setCategory(existing.category);
        setDifficulty(existing.difficulty);
        setTimeLimit(existing.timeLimit);
        setPassingScore(existing.passingScore);
        setShuffleQuestions(existing.shuffleQuestions);
        setShuffleOptions(existing.shuffleOptions);
        setMaxAttempts(existing.maxAttempts);
        setStatus(existing.status);
        setQuestions(existing.questions);
      } else {
        toastError('Quiz not found.');
        navigate('/admin');
      }
    }
  }, [id, isEditing, navigate, toastError]);

  const handleAddOrUpdateQuestion = (question: Question) => {
    if (editingQuestion) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === question.id ? question : q))
      );
      success('Question updated.');
    } else {
      setQuestions((prev) => [...prev, question]);
      success('Question added to quiz.');
    }
    setEditingQuestion(null);
  };

  const handleAiQuestionsAdded = (newQuestions: Question[]) => {
    setQuestions((prev) => [...prev, ...newQuestions]);
    success(`Added ${newQuestions.length} AI-generated questions!`);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    success('Question removed.');
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const copy = [...questions];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setQuestions(copy);
  };

  const handleSaveQuiz = (desiredStatus?: QuizStatus) => {
    if (!title.trim()) {
      toastError('Please enter a quiz title.');
      return;
    }

    const saveStatus = desiredStatus || status;

    // Edge Case: Quizzes with zero questions cannot be published
    if (saveStatus === 'published' && questions.length === 0) {
      toastError('Cannot publish a quiz with 0 questions. Add at least one question or save as Draft.');
      return;
    }

    const quizId = isEditing && id ? id : `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newQuiz: Quiz = {
      id: quizId,
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'General',
      difficulty,
      timeLimit: Math.max(0, timeLimit),
      passingScore: Math.min(Math.max(1, passingScore), 100),
      shuffleQuestions,
      shuffleOptions,
      maxAttempts: Math.max(0, maxAttempts),
      status: saveStatus,
      createdBy: user?.id || 'admin',
      createdAt: isEditing ? (getQuizById(quizId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions,
    };

    saveQuiz(newQuiz);
    success(
      isEditing
        ? `Quiz updated successfully! (${saveStatus})`
        : `Quiz created successfully! (${saveStatus})`
    );
    navigate('/admin');
  };

  const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <button className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {questions.length} Questions &bull; {totalPoints} Total Points
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            onClick={() => handleSaveQuiz('draft')}
            className="flex-1 sm:flex-none"
          >
            Save as Draft
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => handleSaveQuiz('published')}
            leftIcon={<Save className="w-4 h-4" />}
            className="flex-1 sm:flex-none"
          >
            Publish Quiz
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Questions List & Builder Trigger */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Questions ({questions.length})
              </h2>
              <p className="text-xs text-slate-500">
                Organize, edit, or generate questions for this quiz.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAiModalOpen(true)}
                leftIcon={<Sparkles className="w-4 h-4 text-indigo-500" />}
                className="bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold"
              >
                Generate with AI
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingQuestion(null);
                  setIsQuestionModalOpen(true);
                }}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Question
              </Button>
            </div>
          </div>

          {/* Zero questions warning if published */}
          {questions.length === 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                No Questions Added Yet
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 max-w-sm mx-auto leading-relaxed">
                Add questions manually with the question builder, or click &quot;Generate with AI&quot; to auto-generate questions using Gemini!
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAiModalOpen(true)}
                  leftIcon={<Sparkles className="w-4 h-4 text-indigo-500" />}
                >
                  Generate with AI
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setEditingQuestion(null);
                    setIsQuestionModalOpen(true);
                  }}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Manually
                </Button>
              </div>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-3 sm:gap-4 group hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-1 text-slate-400 mt-0.5">
                  <button
                    onClick={() => handleMoveQuestion(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                    title="Move question up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-center text-slate-500">
                    {idx + 1}
                  </span>
                  <button
                    onClick={() => handleMoveQuestion(idx, 'down')}
                    disabled={idx === questions.length - 1}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                    title="Move question down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Question Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="purple" size="sm">{q.type}</Badge>
                    <Badge variant="secondary" size="sm">{q.points} pt</Badge>
                    {q.options.length > 0 && (
                      <span className="text-xs text-slate-400">
                        {q.options.length} options
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                    {q.text}
                  </p>

                  {/* Options Preview */}
                  {q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                      {q.options.map((opt) => {
                        const isCorrect = q.correctAnswers.includes(opt.id);
                        return (
                          <div
                            key={opt.id}
                            className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/60'
                                : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {isCorrect && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            <span className="truncate">{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'text' && (
                    <div className="text-xs text-slate-500">
                      Accepted answers:{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {q.correctAnswers.join(' / ')}
                      </span>
                    </div>
                  )}

                  {q.explanation && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                      Explanation: {q.explanation}
                    </p>
                  )}
                </div>

                {/* Edit & Delete Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingQuestion(q);
                      setIsQuestionModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit question"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Quiz Settings & Rules */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Quiz Settings
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Quiz Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. JavaScript Basics"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of test topics..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category & Difficulty */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Programming"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Time limit & Passing Score */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Time Limit (min)
                </label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
                <span className="text-[10px] text-slate-400">0 = Untimed</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
                <span className="text-[10px] text-slate-400">e.g. 70% to pass</span>
              </div>
            </div>

            {/* Max attempts */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Max Attempts per Student
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
              <span className="text-[10px] text-slate-400">0 = Unlimited attempts</span>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Shuffle Questions
                </span>
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Shuffle Answer Options
                </span>
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Question Builder Modal */}
      <QuestionBuilderModal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleAddOrUpdateQuestion}
        initialQuestion={editingQuestion}
      />

      {/* AI Question Generator Modal */}
      <AiQuestionGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onAddQuestions={handleAiQuestionsAdded}
      />
    </div>
  );
};
