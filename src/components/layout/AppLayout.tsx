import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { resetStorage } from '../../services/storage';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../common/ConfirmModal';
import { RotateCcw } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { success } = useToast();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetData = () => {
    resetStorage();
    setShowResetConfirm(false);
    success('Demo quizzes, users, and attempts reset to original defaults!');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">QuizCraft Platform</span>
            <span>&bull;</span>
            <span>AI-Powered Assessments &amp; Analytics</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              title="Reset all quizzes, attempts, and demo accounts to factory defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Data
            </button>
            <span>&bull;</span>
            <span>Production SPA Architecture</span>
          </div>
        </div>
      </footer>

      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetData}
        title="Reset All Sample Data?"
        message="This will re-initialize localStorage with the default 3 sample quizzes (JavaScript, Geography, Science), sample students, and initial attempt records."
        confirmText="Reset Everything"
        variant="warning"
      />
    </div>
  );
};
