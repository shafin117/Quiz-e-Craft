import React from 'react';
import { DifficultyLevel, QuizStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    primary: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    purple: 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  };

  const sizeStyles = {
    sm: 'text-[11px] font-semibold px-2 py-0.5 rounded-md',
    md: 'text-xs font-semibold px-2.5 py-1 rounded-lg',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 border border-transparent font-medium tracking-wide ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const DifficultyBadge: React.FC<{ difficulty: DifficultyLevel; size?: 'sm' | 'md' }> = ({
  difficulty,
  size = 'md',
}) => {
  const variantMap: Record<DifficultyLevel, 'success' | 'warning' | 'danger'> = {
    Easy: 'success',
    Medium: 'warning',
    Hard: 'danger',
  };

  return (
    <Badge variant={variantMap[difficulty]} size={size}>
      {difficulty}
    </Badge>
  );
};

export const StatusBadge: React.FC<{ status: QuizStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  return (
    <Badge variant={status === 'published' ? 'success' : 'secondary'} size={size}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'
        }`}
      />
      {status === 'published' ? 'Published' : 'Draft'}
    </Badge>
  );
};
