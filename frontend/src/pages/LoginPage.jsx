import { useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, LoadingSpinner, ErrorBanner } from '../components/shared';

/**
 * Login page component
 * Dark theme login form with email/password fields
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { login, loginAsLocal, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Redirect to original destination after login, or farm overview
  const from = location.state?.from?.pathname || '/farm-overview';

  // If already authenticated, redirect to farm overview
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Checking authentication..." size="lg" />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login(email, password);
    
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
    }
    // If success, the isAuthenticated check above will handle the redirect
  };

  const handleLocalLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    
    const result = await loginAsLocal();
    
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
    }
    // If success, the isAuthenticated check above will handle the redirect
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and tagline */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">🌱</span>
            <h1 className="text-3xl font-bold text-white">IgranSense</h1>
          </div>
          <p className="text-slate-400">Farm intelligence, offline-first</p>
        </div>

        {/* Login form card */}
        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>
            </div>

            {error && (
              <ErrorBanner message={error} variant="error" />
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@demo.com"
                autoComplete="email"
                required
                disabled={isSubmitting}
                className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  error ? 'border-red-500' : 'border-slate-600 hover:border-slate-500'
                }`}
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors pr-12 ${
                    error ? 'border-red-500' : 'border-slate-600 hover:border-slate-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">or</span>
              </div>
            </div>

            {/* Local user button */}
            <button
              type="button"
              onClick={handleLocalLogin}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors border border-slate-600"
            >
              Continue as Local User
            </button>
          </form>
        </Card>

        {/* Demo credentials hint */}
        <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400 text-center mb-2">Demo credentials:</p>
          <div className="text-xs text-slate-500 space-y-1">
            <p><span className="text-slate-400">Farmer:</span> farmer@demo.com / demo123</p>
            <p><span className="text-slate-400">Enterprise:</span> enterprise@demo.com / demo123</p>
            <p><span className="text-slate-400">Admin:</span> admin@igransense.com / demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
