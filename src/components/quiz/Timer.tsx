import React, { useEffect, useState, useRef } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface TimerProps {
  totalSeconds: number;
  initialRemainingSeconds?: number;
  onTimeUp: () => void;
  onTick?: (remainingSeconds: number) => void;
}

export const Timer: React.FC<TimerProps> = ({
  totalSeconds,
  initialRemainingSeconds,
  onTimeUp,
  onTick,
}) => {
  const [remaining, setRemaining] = useState<number>(
    initialRemainingSeconds !== undefined ? initialRemainingSeconds : totalSeconds
  );

  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (totalSeconds <= 0) return; // Untimed quiz

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUpRef.current();
          return 0;
        }
        const next = prev - 1;
        if (onTickRef.current) {
          onTickRef.current(next);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [totalSeconds]);

  if (totalSeconds <= 0) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
        <Clock className="w-4 h-4 text-slate-400" />
        <span>No Time Limit</span>
      </div>
    );
  }

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isUrgent = remaining <= 60;
  const isWarning = remaining <= 180 && !isUrgent;

  const formattedTime = `${minutes < 10 ? '0' : ''}${minutes}:${
    seconds < 10 ? '0' : ''
  }${seconds}`;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-bold tracking-wider transition-all duration-300 ${
        isUrgent
          ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
          : isWarning
          ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
          : 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
      }`}
      role="timer"
      aria-live="polite"
      aria-label={`Time remaining: ${minutes} minutes and ${seconds} seconds`}
    >
      {isUrgent ? (
        <AlertCircle className="w-4 h-4 animate-bounce" />
      ) : (
        <Clock className="w-4 h-4" />
      )}
      <span className="font-mono text-base">{formattedTime}</span>
      {isUrgent && <span className="text-[11px] font-semibold uppercase">Hurry!</span>}
    </div>
  );
};
