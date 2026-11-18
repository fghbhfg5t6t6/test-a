import { useState, type FormEvent } from 'react';
import { ShieldCheck, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import type { ApiError } from '@/lib/apiClient';
import { isApiError } from '@/lib/apiClient';

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setError(null);
    setSubmitting(true);

    try {
      await login(username.trim(), password);
    } catch (err) {
      if (isApiError(err)) {
        if (err.status === 401 || err.status === 400) {
          setError('Invalid username or password.');
        } else if (err.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Unable to connect to the server. Check your connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full h-11 pl-10 pr-3 rounded-lg bg-bg-base border border-border text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand-primary/60 focus:ring-1 focus:ring-brand-primary/40 transition-colors';

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-primary/5 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[400px]">
        {/* Logo / title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-primary/15 ring-1 ring-brand-primary/40 flex items-center justify-center mb-4 shadow-soft">
            <ShieldCheck className="w-7 h-7 text-brand-primary" />
          </div>
          <h1 className="text-xl font-semibold text-ink">Admin Console</h1>
          <p className="text-xs text-ink-muted mt-1">Sign in to manage your dashboard</p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-bg-card/80 backdrop-blur-sm shadow-soft p-6 space-y-4"
        >
          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 ring-1 ring-red-500/30 text-xs text-red-400 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-ink-muted mb-1.5">Username</label>
            <div className="relative">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoFocus
                disabled={submitting}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-ink-muted mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={submitting}
                className="w-full h-11 pl-10 pr-10 rounded-lg bg-bg-base border border-border text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand-primary/60 focus:ring-1 focus:ring-brand-primary/40 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !username.trim() || !password.trim()}
            className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium bg-brand-primary text-white hover:bg-blue-600 transition-colors shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-ink-faint mt-6">
          Authorized personnel only. All actions are logged.
        </p>
      </div>
    </div>
  );
}
