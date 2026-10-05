import React, { useState, useEffect } from 'react';
import { Question, QuestionType, Option } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Plus, Trash2, CheckCircle2, Circle, Eye, Edit3, Image, AlertCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

interface QuestionBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Question) => void;
  initialQuestion?: Question | null;
}

export const QuestionBuilderModal: React.FC<QuestionBuilderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuestion,
}) => {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [type, setType] = useState<QuestionType>('single');
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [points, setPoints] = useState(1);
  const [explanation, setExplanation] = useState('');
  const [options, setOptions] = useState<Option[]>([
    { id: 'opt_1', text: '' },
    { id: 'opt_2', text: '' },
    { id: 'opt_3', text: '' },
    { id: 'opt_4', text: '' },
  ]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (initialQuestion) {
      setType(initialQuestion.type);
      setText(initialQuestion.text);
      setImageUrl(initialQuestion.imageUrl || '');
      setPoints(initialQuestion.points || 1);
      setExplanation(initialQuestion.explanation || '');
      setOptions(
        initialQuestion.options.length > 0
          ? initialQuestion.options.map((o) => ({ ...o }))
          : [
              { id: 'opt_1', text: '' },
              { id: 'opt_2', text: '' },
            ]
      );
      setCorrectAnswers([...initialQuestion.correctAnswers]);
    } else {
      setType('single');
      setText('');
      setImageUrl('');
      setPoints(1);
      setExplanation('');
      setOptions([
        { id: 'opt_1', text: 'Option 1' },
        { id: 'opt_2', text: 'Option 2' },
        { id: 'opt_3', text: 'Option 3' },
        { id: 'opt_4', text: 'Option 4' },
      ]);
      setCorrectAnswers(['opt_1']);
    }
    setTab('edit');
    setErrors([]);
  }, [initialQuestion, isOpen]);

  // When type changes to boolean, reset options to True / False
  const handleTypeChange = (newType: QuestionType) => {
    setType(newType);
    if (newType === 'boolean') {
      setOptions([
        { id: 'opt_true', text: 'True' },
        { id: 'opt_false', text: 'False' },
      ]);
      setCorrectAnswers(['opt_true']);
    } else if (newType === 'text') {
      setOptions([]);
      setCorrectAnswers(['']);
    } else if (options.length < 2) {
      setOptions([
        { id: 'opt_1', text: 'Option 1' },
        { id: 'opt_2', text: 'Option 2' },
        { id: 'opt_3', text: 'Option 3' },
        { id: 'opt_4', text: 'Option 4' },
      ]);
      setCorrectAnswers(['opt_1']);
    }
  };

  const handleAddOption = () => {
    if (options.length >= 6) return;
    const newId = `opt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setOptions([...options, { id: newId, text: `Option ${options.length + 1}` }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    const removedId = options[index].id;
    const newOpts = options.filter((_, i) => i !== index);
    setOptions(newOpts);
    setCorrectAnswers((prev) => prev.filter((id) => id !== removedId));
  };

  const handleOptionTextChange = (index: number, newText: string) => {
    const updated = [...options];
    updated[index].text = newText;
    setOptions(updated);
  };

  const toggleCorrectAnswer = (optionId: string) => {
    if (type === 'single' || type === 'boolean') {
      setCorrectAnswers([optionId]);
    } else if (type === 'multiple') {
      if (correctAnswers.includes(optionId)) {
        setCorrectAnswers(correctAnswers.filter((id) => id !== optionId));
      } else {
        setCorrectAnswers([...correctAnswers, optionId]);
      }
    }
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!text.trim()) {
      errs.push('Question text cannot be empty.');
    }

    if (type === 'single' || type === 'multiple') {
      if (options.length < 2) {
        errs.push('Must provide at least 2 options.');
      }
      const emptyOpt = options.some((o) => !o.text.trim());
      if (emptyOpt) {
        errs.push('All option fields must have text.');
      }
      if (correctAnswers.length === 0) {
        errs.push('Please mark at least one correct option.');
      }
      if (type === 'multiple' && correctAnswers.length < 2) {
        errs.push('Multiple-select questions should have at least 2 correct options.');
      }
    } else if (type === 'boolean') {
      if (correctAnswers.length !== 1) {
        errs.push('Please select either True or False as the correct answer.');
      }
    } else if (type === 'text') {
      const validAnswers = correctAnswers.filter((a) => a.trim().length > 0);
      if (validAnswers.length === 0) {
        errs.push('Please provide at least one accepted answer for the short answer question.');
      }
    }

    setErrors(errs);
    return errs.length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const questionToSave: Question = {
      id: initialQuestion?.id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      text: text.trim(),
      imageUrl: imageUrl.trim() || undefined,
      options: type === 'text' ? [] : options.map((o) => ({ id: o.id, text: o.text.trim() })),
      correctAnswers:
        type === 'text'
          ? correctAnswers.map((a) => a.trim()).filter(Boolean)
          : correctAnswers,
      points: Math.max(1, points),
      explanation: explanation.trim() || undefined,
    };

    onSave(questionToSave);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialQuestion ? 'Edit Question' : 'Add New Question'}
      description="Configure question prompt, response type, options, and explanations."
      maxWidth="3xl"
    >
      {/* Tab Switcher: Edit vs Live Preview */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setTab('edit')}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
            tab === 'edit'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Edit Form
        </button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
            tab === 'preview'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          Live Student Preview
        </button>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 space-y-1">
          {errors.map((e, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{e}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'edit' ? (
        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
          {/* Question Type & Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Question Type
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="single">Single Choice (One correct answer)</option>
                <option value="multiple">Multiple Select (Multiple correct answers)</option>
                <option value="boolean">True / False</option>
                <option value="text">Short Answer (Text match)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Points
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={points}
                onChange={(e) => setPoints(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium"
              />
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Question Text *
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. What is the output of typeof null in JavaScript?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
            />
          </div>

          {/* Optional Image URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5" />
              Optional Illustration Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/diagram.png"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          {/* Options Management */}
          {(type === 'single' || type === 'multiple') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Options (Click radio/checkbox to mark correct answer)
                </label>
                {options.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Option
                  </Button>
                )}
              </div>

              <div className="space-y-2.5">
                {options.map((opt, idx) => {
                  const isCorrect = correctAnswers.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-2 p-2 rounded-xl border ${
                        isCorrect
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleCorrectAnswer(opt.id)}
                        className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                        title={isCorrect ? 'Correct option' : 'Mark as correct'}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-900" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1} text`}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      />

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete option"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Boolean Type Options */}
          {type === 'boolean' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Select the correct answer:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['opt_true', 'opt_false'].map((id) => {
                  const label = id === 'opt_true' ? 'True' : 'False';
                  const isCorrect = correctAnswers.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setCorrectAnswers([id])}
                      className={`p-4 rounded-xl border-2 font-bold text-base flex items-center justify-between transition-colors ${
                        isCorrect
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{label}</span>
                      {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Short Answer Match Strings */}
          {type === 'text' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Accepted Answer Variation(s)
              </label>
              <div className="space-y-2">
                {correctAnswers.map((ans, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ans}
                      onChange={(e) => {
                        const copy = [...correctAnswers];
                        copy[idx] = e.target.value;
                        setCorrectAnswers(copy);
                      }}
                      placeholder="e.g. H2O or Water"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                    {correctAnswers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setCorrectAnswers(correctAnswers.filter((_, i) => i !== idx))}
                        className="p-2 text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCorrectAnswers([...correctAnswers, ''])}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Acceptable Synonym / Format
                </Button>
              </div>
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Explanation (Displayed to students after submission)
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why this answer is correct..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>
        </div>
      ) : (
        /* Live Student Preview */
        <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-indigo-600 uppercase">Student Live View</span>
            <Badge variant="purple" size="sm">{points} Point(s)</Badge>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {text || 'Question text preview will appear here...'}
          </h3>

          {imageUrl && (
            <div className="rounded-xl overflow-hidden max-h-48 border border-slate-200 dark:border-slate-800">
              <img src={imageUrl} alt="preview" className="object-contain max-h-48 w-full" />
            </div>
          )}

          <div className="space-y-2 pt-2">
            {type === 'text' ? (
              <input
                disabled
                placeholder="Student types answer here..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              />
            ) : (
              options.map((opt, idx) => (
                <div
                  key={opt.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
                >
                  <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt.text || `Option ${idx + 1}`}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave}>
          {initialQuestion ? 'Update Question' : 'Save Question'}
        </Button>
      </div>
    </Modal>
  );
};
