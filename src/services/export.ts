import { Attempt } from '../types';

export function exportAttemptsToCSV(quizTitle: string, attempts: Attempt[]): void {
  const headers = [
    'Attempt ID',
    'Student Name',
    'Student Email',
    'Score',
    'Total Points',
    'Percentage (%)',
    'Status',
    'Time Taken (seconds)',
    'Time Taken (formatted)',
    'Started At',
    'Submitted At',
  ];

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}m ${remainingSecs < 10 ? '0' : ''}${remainingSecs}s`;
  };

  const rows = attempts.map((att) => [
    `"${att.id}"`,
    `"${att.userName.replace(/"/g, '""')}"`,
    `"${att.userEmail.replace(/"/g, '""')}"`,
    att.score,
    att.totalPoints,
    `${att.percentage}%`,
    att.passed ? 'PASSED' : 'FAILED',
    att.timeTaken,
    `"${formatSeconds(att.timeTaken)}"`,
    `"${new Date(att.startedAt).toLocaleString()}"`,
    `"${new Date(att.submittedAt).toLocaleString()}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const sanitizedTitle = quizTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `quiz_${sanitizedTitle}_results_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
