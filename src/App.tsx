import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { QuizEditorPage } from './pages/admin/QuizEditorPage';
import { QuizAnalyticsPage } from './pages/admin/QuizAnalyticsPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { QuizOverviewPage } from './pages/student/QuizOverviewPage';
import { QuizTakePage } from './pages/student/QuizTakePage';
import { QuizResultPage } from './pages/student/QuizResultPage';
import { QuizReviewPage } from './pages/student/QuizReviewPage';
import { StudentHistoryPage } from './pages/student/StudentHistoryPage';
import { LeaderboardPage } from './pages/student/LeaderboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === 'admin' ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/student" replace />
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Main App Layout */}
              <Route element={<AppLayout />}>
                {/* Root Redirect based on session and role */}
                <Route path="/" element={<RootRedirect />} />

                {/* Admin Only Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/quizzes/new"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <QuizEditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/quizzes/:id/edit"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <QuizEditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <QuizAnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/quizzes/:id/analytics"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <QuizAnalyticsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Student & Quiz Assessment Routes */}
                <Route
                  path="/student"
                  element={
                    <ProtectedRoute>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/history"
                  element={
                    <ProtectedRoute>
                      <StudentHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/leaderboard"
                  element={
                    <ProtectedRoute>
                      <LeaderboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quiz/:id"
                  element={
                    <ProtectedRoute>
                      <QuizOverviewPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quiz/:id/take"
                  element={
                    <ProtectedRoute>
                      <QuizTakePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quiz/:id/result/:attemptId"
                  element={
                    <ProtectedRoute>
                      <QuizResultPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quiz/:id/review/:attemptId"
                  element={
                    <ProtectedRoute>
                      <QuizReviewPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quiz/:id/leaderboard"
                  element={
                    <ProtectedRoute>
                      <LeaderboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
