import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { User, Mail, LogIn, AlertCircle, Lock } from 'lucide-react';
import { COLORS, MESSAGES } from '../config';

const CustomerLogin: React.FC = () => {
  const { login, isAuthenticated, isEmployee } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={isEmployee ? "/admin" : "/"} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || MESSAGES.login.authFailedText);
      }
    } catch (err) {
      setError(MESSAGES.error.generic);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: COLORS.secondary[50] }}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div 
            className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: COLORS.primary[100] }}
          >
            <User className="h-8 w-8" style={{ color: COLORS.primary[600] }} />
          </div>
          <h2 className="text-3xl font-bold text-stone-800">
            {MESSAGES.login.customerLogin}
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            {MESSAGES.login.customerLoginText}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div 
                className="rounded-lg p-4 flex items-start"
                style={{ backgroundColor: `${COLORS.status.error}15`, borderColor: COLORS.status.error, borderWidth: '1px' }}
              >
                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" style={{ color: COLORS.status.error }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: COLORS.status.error }}>
                    {MESSAGES.login.authError}
                  </p>
                  <p className="text-sm mt-1" style={{ color: COLORS.status.error }}>{error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                {MESSAGES.form.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-stone-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg transition-colors"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = COLORS.primary[500];
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.primary[500]}40`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d6d3d1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="seu.email@exemplo.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-2">
                {MESSAGES.form.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-stone-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg transition-colors"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = COLORS.primary[500];
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.primary[500]}40`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d6d3d1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: COLORS.primary[600] }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary[700])}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary[600])}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {MESSAGES.login.entering}
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  {MESSAGES.login.submit}
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-stone-600">
              Não tem uma conta?{' '}
              <Link 
                to="/cadastro" 
                className="font-medium transition-colors"
                style={{ color: COLORS.primary[600] }}
                onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.primary[700])}
                onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.primary[600])}
              >
                {MESSAGES.register.createAccount}
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm font-medium transition-colors"
            style={{ color: COLORS.secondary[500] }}
            onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.secondary[700])}
            onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.secondary[500])}
          >
            {MESSAGES.login.backHome}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
