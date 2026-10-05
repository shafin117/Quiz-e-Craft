import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { GraduationCap, Mail, Lock, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginAsDemoAdmin, loginAsDemoStudent } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/student';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toastError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      success('Logged in successfully!');
      // Navigate based on user role
      if (email.includes('admin')) {
        navigate('/admin');
      } else {
        navigate(from === '/admin' ? '/student' : from);
      }
    } catch (err: any) {
      toastError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    loginAsDemoAdmin();
    success('Logged in as Demo Admin!');
    navigate('/admin');
  };

  const handleDemoStudent = () => {
    loginAsDemoStudent();
    success('Logged in as Demo Student!');
    navigate('/student');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-500/20 mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome to Quiz<span className="text-indigo-600 dark:text-indigo-400">Craft</span>
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Sign in to start taking quizzes or managing assessments.
          </p>
        </div>

        {/* Quick Demo Login Cards */}
        <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Quick 1-Click Demo Testing
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDemoAdmin}
              leftIcon={<ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              className="bg-white dark:bg-slate-900 justify-start"
            >
              Demo Admin
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDemoStudent}
              leftIcon={<UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              className="bg-white dark:bg-slate-900 justify-start"
            >
              Demo Student
            </Button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 text-center">
            Credentials: <span className="font-mono">admin@demo.com</span> / <span className="font-mono">admin123</span> &bull; <span className="font-mono">student@demo.com</span> / <span className="font-mono">student123</span>
          </p>
        </div>

        {/* Standard Login Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 font-medium placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 font-medium placeholder-slate-400"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
