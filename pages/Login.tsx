import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Lock, Mail, LogIn, AlertCircle } from 'lucide-react';
import { COLORS, MESSAGES } from '../config';

const Login: React.FC = () => {
  const { login, isAuthenticated, isEmployee, logout } = useStore();
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
        // Check role again from result or store (store might not update immediately in this closure)
        // But login function in store updates state. 
        // We can just rely on the fact that if login succeeded, we can navigate.
        // However, we need to know where to navigate.
        // Since we don't have isEmployee updated immediately here, we might need to check the result data.
        if (result.data?.role === 'employee' || result.data?.role === 'admin') {
            navigate('/admin');
        } else {
            setError('Acesso negado. Esta área é restrita para funcionários.');
            logout();
        }
      } else {
        setError(result.error || 'Falha no login. Verifique suas credenciais.');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ 
        background: `linear-gradient(to bottom right, ${COLORS.primary[50]}, ${COLORS.secondary[50]}, ${COLORS.primary[100]})` 
      }}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div 
            className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: COLORS.primary[700] }}
          >
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-stone-800">
            {MESSAGES.login.employeeArea}
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            {MESSAGES.login.employeeAccessText}
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
                  <p className="text-sm mt-1" style={{ color: COLORS.status.error }}>
                    {error}
                  </p>
                  {error.toLowerCase().includes('email') && error.toLowerCase().includes('confirme') && (
                    <p className="text-sm mt-2" style={{ color: COLORS.status.error }}>
                      {MESSAGES.login.confirmedEmailError}
                    </p>
                  )}
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
                  style={{ 
                    '--focus-ring-color': COLORS.primary[500],
                    '--focus-border-color': COLORS.primary[500]
                  } as React.CSSProperties}
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
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: COLORS.primary[700],
                border: 'none'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary[800])}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary[700])}
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

          {/* Footer Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-stone-500">
              {MESSAGES.login.onlyEmployees}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              {MESSAGES.login.accountsCreatedByAdmin}
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm font-medium transition-colors"
            style={{ color: COLORS.primary[700] }}
            onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.primary[800])}
            onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.primary[700])}
          >
            {MESSAGES.login.backHome}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
