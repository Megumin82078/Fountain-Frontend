import React, { useState } from 'react';
import { useAuth } from '../../hooks/useApi';
import { validateEmail, validatePassword } from '../../utils/helpers';
import { VALIDATION_RULES } from '../../constants';

const LoginForm = ({ onSuccess, onSwitchToSignup }) => {
  const { login, forgotPassword, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = VALIDATION_RULES.EMAIL.REQUIRED;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = VALIDATION_RULES.EMAIL.INVALID;
    }

    if (!formData.password) {
      newErrors.password = VALIDATION_RULES.PASSWORD.REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      onSuccess?.();
    } catch (error) {
      setErrors({
        submit: error.message || 'Login failed. Please check your credentials.'
      });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setErrors({ forgotPassword: 'Please enter your email address' });
      return;
    }
    
    if (!validateEmail(forgotPasswordEmail)) {
      setErrors({ forgotPassword: 'Please enter a valid email address' });
      return;
    }

    try {
      const result = await forgotPassword(forgotPasswordEmail);
      setForgotPasswordMessage(result.message);
      setErrors({});
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordMessage('');
        setForgotPasswordEmail('');
      }, 3000);
    } catch (error) {
      setErrors({
        forgotPassword: error.message || 'Failed to send reset email. Please try again.'
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-black mb-2 tracking-tight" style={{fontFamily: 'var(--font-display)'}}>
          Welcome Back
        </h2>
        <p className="text-gray-700 font-medium" style={{fontFamily: 'var(--font-body)'}}>
          Sign in to your Fountain account
        </p>
      </div>

      {/* Demo Credentials Info */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 mb-6 shadow-lg backdrop-blur-sm">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <p className="font-bold text-gray-800" style={{fontFamily: 'var(--font-body)'}}>Demo Credentials:</p>
            <p className="text-gray-700 font-medium" style={{fontFamily: 'var(--font-body)'}}>Email: demo@fountain.health</p>
            <p className="text-gray-700 font-medium" style={{fontFamily: 'var(--font-body)'}}>Password: demo123</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-error-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-error-700 text-sm">{errors.submit}</span>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-bold text-gray-800 mb-2" style={{fontFamily: 'var(--font-body)'}}>
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`input-primary ${errors.email ? 'border-error-300 focus:ring-error-500' : ''}`}
            placeholder="Enter your email"
            disabled={loading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-bold text-gray-800 mb-2" style={{fontFamily: 'var(--font-body)'}}>
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`input-primary pr-12 ${errors.password ? 'border-error-300 focus:ring-error-500' : ''}`}
              placeholder="Enter your password"
              disabled={loading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? (
                <svg className="w-5 h-5 text-neutral-400 hover:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M20.1 14.1L4.929 4.929" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-neutral-400 hover:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-error-600">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-black focus:ring-gray-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700 font-medium" style={{fontFamily: 'var(--font-body)'}}>Remember me</span>
          </label>
          
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-black hover:text-gray-700 font-bold transition-all duration-200 hover:scale-105" style={{fontFamily: 'var(--font-body)'}}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full relative"
        >
          {loading ? (
            <>
              <div className="loading-spinner absolute left-4"></div>
              <span className="ml-6">Signing In...</span>
            </>
          ) : (
            'Sign In'
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-700 font-medium" style={{fontFamily: 'var(--font-body)'}}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-black hover:text-gray-700 font-bold underline transition-all duration-200 hover:scale-105" style={{fontFamily: 'var(--font-body)'}}
            >
              Create one now
            </button>
          </p>
        </div>
      </form>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-black mb-4 text-center" style={{fontFamily: 'var(--font-display)'}}>
              Reset Password
            </h3>
            
            {forgotPasswordMessage ? (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <svg className="w-6 h-6 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-700 font-medium" style={{fontFamily: 'var(--font-body)'}}>
                    {forgotPasswordMessage}
                  </p>
                </div>
                <p className="text-sm text-gray-600 font-medium" style={{fontFamily: 'var(--font-body)'}}>
                  This modal will close automatically in a few seconds.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <p className="text-gray-700 mb-4 font-medium" style={{fontFamily: 'var(--font-body)'}}>
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                
                {errors.forgotPassword && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-700 text-sm font-medium">{errors.forgotPassword}</p>
                  </div>
                )}
                
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-800 mb-2" style={{fontFamily: 'var(--font-body)'}}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="input-primary"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmail('');
                      setErrors({});
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors relative"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Reset Email'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;