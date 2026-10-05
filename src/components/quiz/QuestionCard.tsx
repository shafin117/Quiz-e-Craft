import React, { useEffect, useRef } from 'react';
import { Question } from '../../types';
import { Flag, CheckSquare, Square, CheckCircle2, Circle, HelpCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  currentAnswer: string | string[] | undefined;
  isFlagged: boolean;
  onAnswerChange: (answer: string | string[]) => void;
  onToggleFlag: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  currentAnswer,
  isFlagged,
  onAnswerChange,
  onToggleFlag,
}) => {
  const textInputRef = useRef<HTMLInputElement>(null);

  // Focus input for text questions
  useEffect(() => {
    if (question.type === 'text') {
      textInputRef.current?.focus();
    }
  }, [question.id, question.type]);

  // Handle single choice selection
  const handleSingleSelect = (optionId: string) => {
    onAnswerChange(optionId);
  };

  // Handle multiple select selection
  const handleMultipleSelect = (optionId: string) => {
    const current = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
    const index = current.indexOf(optionId);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(optionId);
    }
    onAnswerChange(current);
  };

  // Key labels helper
  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
      {/* Question Header & Meta */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="font-extrabold text-base sm:text-lg text-indigo-600 dark:text-indigo-400">
            Question {questionNumber}
          </span>
          <span className="text-slate-400 font-medium text-sm">of {totalQuestions}</span>
          <Badge variant="purple" size="sm">
            {question.points} {question.points === 1 ? 'Point' : 'Points'}
          </Badge>
          {question.type === 'multiple' && (
            <Badge variant="info" size="sm">
              Multi-Select
            </Badge>
          )}
          {question.type === 'text' && (
            <Badge variant="warning" size="sm">
              Short Answer
            </Badge>
          )}
          {question.type === 'boolean' && (
            <Badge variant="secondary" size="sm">
              True / False
            </Badge>
          )}
        </div>

        {/* Flag for Review Button */}
        <button
          onClick={onToggleFlag}
          type="button"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            isFlagged
              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700 shadow-xs'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
          }`}
          title="Flag this question to review later (Hotkey: F)"
        >
          <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
          <span>{isFlagged ? 'Flagged for Review' : 'Flag for Review'}</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 font-mono">
            F
          </kbd>
        </button>
      </div>

      {/* Question Text */}
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed mb-6">
        {question.text}
      </h2>

      {/* Optional Image */}
      {question.imageUrl && (
        <div className="mb-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-72 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <img
            src={question.imageUrl}
            alt="Question illustration"
            className="w-full h-full object-contain max-h-72"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Answer Options */}
      <div className="space-y-3">
        {/* Type: Single Choice & True/False */}
        {(question.type === 'single' || question.type === 'boolean') && (
          <div className="space-y-3">
            {question.options.map((option, idx) => {
              const isSelected = currentAnswer === option.id;
              const letter = optionLetters[idx] || `${idx + 1}`;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSingleSelect(option.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl text-left border-2 transition-all cursor-pointer group ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:border-indigo-500 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                    }`}
                  >
                    {letter}
                  </div>
                  <span className="flex-1 text-sm sm:text-base text-slate-800 dark:text-slate-200 font-medium">
                    {option.text}
                  </span>
                  <div className="shrink-0 text-indigo-600 dark:text-indigo-400">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 fill-indigo-600 text-white dark:fill-indigo-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-slate-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Type: Multiple Select */}
        {question.type === 'multiple' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
              Select all options that apply (multiple answers are correct):
            </div>
            {question.options.map((option, idx) => {
              const selectedArray = Array.isArray(currentAnswer) ? currentAnswer : [];
              const isSelected = selectedArray.includes(option.id);
              const letter = optionLetters[idx] || `${idx + 1}`;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleMultipleSelect(option.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl text-left border-2 transition-all cursor-pointer group ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:border-indigo-500 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                    }`}
                  >
                    {letter}
                  </div>
                  <span className="flex-1 text-sm sm:text-base text-slate-800 dark:text-slate-200 font-medium">
                    {option.text}
                  </span>
                  <div className="shrink-0 text-indigo-600 dark:text-indigo-400">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 fill-indigo-600 text-white dark:fill-indigo-500" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-slate-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Type: Short Answer (Text) */}
        {question.type === 'text' && (
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Type your answer below:
            </label>
            <input
              ref={textInputRef}
              type="text"
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Enter concise answer here..."
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-600 dark:focus:border-indigo-500 font-medium text-base transition-colors"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Answers are case-insensitive. Provide standard terms or concise numbers.
            </p>
          </div>
        )}
      </div>

      {/* Keyboard Shortcut Guidance */}
      <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 gap-2">
        <span className="flex items-center gap-2">
          <span>Shortcuts:</span>
          {question.type !== 'text' && (
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">1-4</kbd> select
            </span>
          )}
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">&larr;</kbd> Prev
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">&rarr;</kbd> Next
          </span>
        </span>
      </div>
    </div>
  );
};
