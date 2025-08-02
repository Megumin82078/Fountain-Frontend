import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import SignupForm from '../../components/auth/SignupForm';
import { useApp } from '../../context/AppContext';
import { ROUTES } from '../../constants';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useApp();
  const [isSignup, setIsSignup] = useState(false);

  // Get the page user was trying to access before login
  const from = location.state?.from || ROUTES.DASHBOARD;

  // Redirect if already authenticated
  if (state.auth.isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleAuthSuccess = () => {
    console.log('🎉 LoginPage: handleAuthSuccess called');
    console.log('🎉 LoginPage: Navigating to:', from);
    // Small delay to ensure state is updated
    setTimeout(() => {
      console.log('🎉 LoginPage: Actually navigating now to:', from);
      navigate(from, { replace: true });
    }, 100);
  };

  const switchToSignup = () => {
    setIsSignup(true);
  };

  const switchToLogin = () => {
    setIsSignup(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="hidden lg:block">
            <div className="text-center lg:text-left">
              <div className="mb-8">
                <h1 className="text-5xl font-bold text-black mb-4 tracking-tight" style={{fontFamily: 'var(--font-display)'}}>
                  Fountain
                </h1>
                <p className="text-xl text-gray-800 mb-6 font-medium" style={{fontFamily: 'var(--font-body)'}}>
                  Your complete health record companion
                </p>
                <p className="text-gray-700 leading-relaxed font-medium" style={{fontFamily: 'var(--font-body)'}}>
                  Effortlessly collect, understand, and manage your full medical history. Fountain helps you stay in control—securely, intelligently, and on your terms.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 max-w-md">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1 text-lg" style={{fontFamily: 'var(--font-body)'}}>Secure & Private</h3>
                    <p className="text-sm text-gray-700 font-medium" style={{fontFamily: 'var(--font-body)'}}>Your data is encrypted and protected. You decide who can access it.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1 text-lg" style={{fontFamily: 'var(--font-body)'}}>Instant Access</h3>
                    <p className="text-sm text-gray-700 font-medium" style={{fontFamily: 'var(--font-body)'}}>View and share your health records anytime, from any device.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1 text-lg" style={{fontFamily: 'var(--font-body)'}}>Smart Insights</h3>
                    <p className="text-sm text-gray-700 font-medium" style={{fontFamily: 'var(--font-body)'}}>AI turns messy files into clear timelines and actionable insights for better decisions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Form */}
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12 backdrop-blur-sm border border-gray-100">
              {isSignup ? (
                <SignupForm 
                  onSuccess={handleAuthSuccess}
                  onSwitchToLogin={switchToLogin}
                />
              ) : (
                <LoginForm 
                  onSuccess={handleAuthSuccess}
                  onSwitchToSignup={switchToSignup}
                />
              )}
            </div>
          </div>
        </div>

        {/* Mobile branding */}
        <div className="lg:hidden text-center mt-8">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 font-medium">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Fast
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Smart
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;