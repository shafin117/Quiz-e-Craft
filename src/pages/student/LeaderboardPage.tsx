import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getQuizzes, getAttemptsByQuiz } from '../../services/storage';
import { Trophy, Medal, Clock, Award, ArrowLeft, Users } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const LeaderboardPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const quizzes = getQuizzes().filter((q) => q.status === 'published');

  const [selectedQuizId, setSelectedQuizId] = useState<string>(
    id || (quizzes[0]?.id ?? '')
  );

  const currentQuiz = quizzes.find((q) => q.id === selectedQuizId);

  // Ranked attempts: sorted by score descending, then timeTaken ascending (faster is better)
  const rankedAttempts = useMemo(() => {
    if (!selectedQuizId) return [];
    const attempts = getAttemptsByQuiz(selectedQuizId);

    // Keep highest attempt per unique user, or list top attempts
    const userBestMap = new Map<string, typeof attempts[0]>();

    attempts.forEach((att) => {
      const existing = userBestMap.get(att.userId);
      if (!existing) {
        userBestMap.set(att.userId, att);
      } else {
        // Tie break: higher score, then faster time
        if (
          att.score > existing.score ||
          (att.score === existing.score && att.timeTaken < existing.timeTaken)
        ) {
          userBestMap.set(att.userId, att);
        }
      }
    });

    return Array.from(userBestMap.values()).sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timeTaken - b.timeTaken;
    });
  }, [selectedQuizId]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}m ${remainingSecs < 10 ? '0' : ''}${remainingSecs}s`;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center font-bold text-sm shadow-xs border border-amber-300">
          <Trophy className="w-4 h-4 fill-current" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center font-bold text-sm shadow-xs border border-slate-300">
          <Medal className="w-4 h-4" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-800 dark:text-amber-500 flex items-center justify-center font-bold text-sm shadow-xs border border-amber-600/30">
          <Medal className="w-4 h-4" />
        </div>
      );
    }
    return (
      <span className="w-8 h-8 flex items-center justify-center font-bold text-xs text-slate-500">
        #{rank}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link to="/student">
            <button className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              Quiz Leaderboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Top performing students ranked by score and fastest completion time.
            </p>
          </div>
        </div>

        {/* Quiz Selector */}
        <select
          value={selectedQuizId}
          onChange={(e) => setSelectedQuizId(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
        >
          {quizzes.map((q) => (
            <option key={q.id} value={q.id}>
              {q.title}
            </option>
          ))}
        </select>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {currentQuiz?.title || 'Leaderboard Rankings'}
            </h3>
            <p className="text-xs text-slate-500">
              {rankedAttempts.length} qualified ranking(s) recorded
            </p>
          </div>

          {currentQuiz && (
            <Link to={`/quiz/${currentQuiz.id}`}>
              <Button variant="primary" size="sm">
                Take This Quiz
              </Button>
            </Link>
          )}
        </div>

        {rankedAttempts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300" />
            <p>No attempts have been recorded for this quiz yet.</p>
            <p>Be the first to complete it and take the #1 spot!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl w-16">Rank</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Time Taken</th>
                  <th className="py-3 px-4 rounded-r-xl">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {rankedAttempts.map((att, idx) => (
                  <tr
                    key={att.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                      idx === 0
                        ? 'bg-amber-50/30 dark:bg-amber-950/10'
                        : idx === 1
                        ? 'bg-slate-50/50 dark:bg-slate-800/20'
                        : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">{getRankBadge(idx + 1)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div>{att.userName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {att.userEmail}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {att.score} / {att.totalPoints}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-black text-slate-900 dark:text-white">
                        {att.percentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      {formatSeconds(att.timeTaken)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(att.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
