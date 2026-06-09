import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import { setAuth, isAuthenticated } from '../utils/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authAPI.login(email.trim(), password);
      if (data.success) {
        setAuth(data.data.token, data.data.user);
        navigate('/');
      }
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach server. Make sure backend is running on port 4000.');
      } else {
        setError(err.response.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-brand-700 via-brand-800 to-gray-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
            <Shield size={22} className="text-white" />
          </div>
          <span className="text-lg font-semibold text-white">API Gateway</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight text-white">
            Enterprise-grade API
            <br />
            management & analytics
          </h2>
          <p className="mt-4 max-w-md text-brand-200">
            Monitor traffic, manage API keys, and gain real-time insights into your microservices
            architecture.
          </p>
        </div>
        <p className="text-sm text-brand-300">© 2026 API Gateway Dashboard</p>
      </div>

      <div className="flex w-full flex-col justify-center px-6 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <Shield size={24} className="text-brand-600" />
              <span className="text-lg font-semibold">API Gateway</span>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to your admin dashboard</p>

          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@gateway.io"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Use your admin email and password
          </p>
        </div>
      </div>
    </div>
  );
}
