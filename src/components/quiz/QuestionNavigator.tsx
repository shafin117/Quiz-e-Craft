import React from 'react';
import { Flag, Check, CircleDot } from 'lucide-react';
import { Question } from '../../types';

interface QuestionNavigatorProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string | string[]>;
  flaggedQuestionIds: string[];
  onSelectQuestion: (index: number) => void;
  className?: string;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  currentIndex,
  answers,
  flaggedQuestionIds,
  onSelectQuestion,
  className = '',
}) => {
  const isAnswered = (q: Question) => {
    const ans = answers[q.id];
    if (ans === undefined || ans === null) return false;
    if (typeof ans === 'string') return ans.trim().length > 0;
    if (Array.isArray(ans)) return ans.length > 0;
    return false;
  };

  const answeredCount = questions.filter(isAnswered).length;
  const flaggedCount = flaggedQuestionIds.length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CircleDot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Question Navigator
        </h4>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {answeredCount}/{questions.length} completed
        </span>
      </div>

      {/* Grid of question buttons */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-5">
        {questions.map((q, idx) => {
          const answered = isAnswered(q);
          const flagged = flaggedQuestionIds.includes(q.id);
          const isCurrent = currentIndex === idx;

          let btnClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-transparent';

          if (isCurrent) {
            btnClass = 'bg-indigo-600 text-white ring-2 ring-indigo-400 dark:ring-indigo-300 font-extrabold shadow-sm';
          } else if (answered) {
            btnClass = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/80 font-semibold';
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(idx)}
              className={`relative h-10 rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer border ${btnClass}`}
              title={`Jump to Question ${idx + 1}`}
            >
              <span>{idx + 1}</span>

              {/* Answered check indicator */}
              {answered && !isCurrent && (
                <Check className="w-3 h-3 absolute top-1 right-1 text-emerald-600 dark:text-emerald-400" />
              )}

              {/* Flag indicator badge */}
              {flagged && (
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xs"
                  title="Flagged for review"
                >
                  <Flag className="w-2.5 h-2.5 fill-current" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-100 dark:bg-emerald-900 border border-emerald-400" />
            <span>Answered</span>
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{answeredCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
            <span>Unanswered</span>
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{unansweredCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-100 dark:bg-amber-900 border border-amber-400 flex items-center justify-center text-amber-600">
              <Flag className="w-2 h-2 fill-current" />
            </span>
            <span>Flagged</span>
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{flaggedCount}</span>
        </div>
      </div>
    </div>
  );
};
