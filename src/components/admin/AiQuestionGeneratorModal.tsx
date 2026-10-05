import React, { useState } from 'react';
import { Question } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { generateQuestionsWithAI } from '../../services/gemini';
import { Sparkles, Check, CheckSquare, Square, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '../common/Badge';

interface AiQuestionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestions: (questions: Question[]) => void;
}

export const AiQuestionGeneratorModal: React.FC<AiQuestionGeneratorModalProps> = ({
  isOpen,
  onClose,
  onAddQuestions,
}) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [count, setCount] = useState(5);
  const [questionType, setQuestionType] = useState<
    'mixed' | 'single' | 'multiple' | 'boolean' | 'text'
  >('mixed');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please provide a subject or topic for question generation.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const questions = await generateQuestionsWithAI({
        topic: topic.trim(),
        difficulty,
        count,
        questionType,
      });

      setGeneratedQuestions(questions);
      setSelectedIds(questions.map((q) => q.id)); // select all by default
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate questions. Please verify topic and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === generatedQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(generatedQuestions.map((q) => q.id));
    }
  };

  const handleAddSelected = () => {
    const toAdd = generatedQuestions.filter((q) => selectedIds.includes(q.id));
    onAddQuestions(toAdd);
    handleResetAndClose();
  };

  const handleResetAndClose = () => {
    setGeneratedQuestions([]);
    setSelectedIds([]);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="AI Question Generator"
      description="Leverage Gemini AI to generate customized, structured quiz questions instantly."
      maxWidth="3xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        {/* Form controls */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Topic or Subject *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Modern JavaScript Promises, Cell Biology, Roman History"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 font-medium"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                disabled={isLoading}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Question Type
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as any)}
                disabled={isLoading}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium"
              >
                <option value="mixed">Mixed Types</option>
                <option value="single">Single Choice MCQ</option>
                <option value="multiple">Multiple Select</option>
                <option value="boolean">True / False</option>
                <option value="text">Short Answer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Number of Questions ({count})
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                disabled={isLoading}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleGenerate}
              isLoading={isLoading}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Generate Questions
            </Button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Generating {count} questions about &quot;{topic}&quot; with Gemini AI...
            </p>
            <p className="text-xs text-slate-500">
              Formulating questions, verifying options, and composing explanations...
            </p>
          </div>
        )}

        {/* Generated Questions Preview & Selection */}
        {generatedQuestions.length > 0 && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Generated Questions ({selectedIds.length} of {generatedQuestions.length} selected)
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {selectedIds.length === generatedQuestions.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-3">
              {generatedQuestions.map((q, idx) => {
                const isSelected = selectedIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleSelect(q.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-slate-800 opacity-60 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-indigo-600 dark:text-indigo-400">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 fill-indigo-600 text-white dark:fill-indigo-500" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">Q{idx + 1}</span>
                          <Badge variant="purple" size="sm">{q.type}</Badge>
                          <Badge variant="secondary" size="sm">{q.points} pt</Badge>
                        </div>

                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {q.text}
                        </p>

                        {q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-xs text-slate-600 dark:text-slate-400">
                            {q.options.map((opt) => (
                              <div
                                key={opt.id}
                                className={`px-2 py-1 rounded-md ${
                                  q.correctAnswers.includes(opt.id)
                                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-semibold'
                                    : 'bg-slate-100 dark:bg-slate-800'
                                }`}
                              >
                                {opt.text}
                              </div>
                            ))}
                          </div>
                        )}

                        {q.explanation && (
                          <p className="text-xs text-slate-500 italic pt-1">
                            Explanation: {q.explanation}
                          </p>
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

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button variant="outline" size="sm" onClick={handleResetAndClose}>
          Cancel
        </Button>
        {generatedQuestions.length > 0 && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddSelected}
            disabled={selectedIds.length === 0}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Add Selected ({selectedIds.length}) Questions
          </Button>
        )}
      </div>
    </Modal>
  );
};
