import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../../components/shared/Button/Button';
import Input from '../../components/shared/Input/Input';
import { useAuth } from '../../contexts/AuthContext';
import styles from './LoginPage.module.css';

const schema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur'
  });

  const onSubmit = async (data) => {
    try {
      await login({
        email: data.email,
        password: data.password,
        remember: rememberMe
      });
      navigate('/dashboard');
    } catch (err) {
      setError('root', {
        message: err.message || 'Login failed. Please check your credentials.'
      });
    }
  };

  return (
    <div className={styles.authPage}>
      {/* Left Side - Branding */}
      <div className={styles.authBranding}>
        <div className={styles.brandingContent}>
          <h1 className={styles.brandingTitle}>
            Your Complete Health Story in One Place
          </h1>
          <p className={styles.brandingSubtitle}>
            Securely manage, organize, and share your medical records with AI-powered insights and healthcare-grade security.
          </p>
          <div className={styles.brandingFeatures}>
            <div className={styles.brandingFeature}>Request records from any provider instantly</div>
            <div className={styles.brandingFeature}>AI-powered organization and insights</div>
            <div className={styles.brandingFeature}>HIPAA compliant and secure sharing</div>
            <div className={styles.brandingFeature}>Complete control over your health data</div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className={styles.authContainer}>
        <div className={styles.formWrapper}>
          <div className={styles.logo}>
            <h1 className={styles.logoText}>Fountain</h1>
            <p className={styles.logoSubtext}>Health Records Management</p>
          </div>

        <div className={styles.header}>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to your account to continue</p>
        </div>

        {(error || errors.root) && (
          <div className={styles.errorMessage}>
            {error || errors.root?.message}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email Address"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            required
          />

          <div className={styles.passwordToggle}>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              error={errors.password?.message}
              required
            />
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️‍🗨️' : '👁️'}
            </button>
          </div>

          <div className={styles.rememberForgot}>
            <div className={styles.checkboxWrapper}>
              <input
                type="checkbox"
                id="remember"
                className={styles.checkbox}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" className={styles.checkboxLabel}>
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={isLoading}
            className={styles.submitButton}
          >
            Sign In
          </Button>
        </form>

        <div className={styles.divider}>
          <span className={styles.dividerText}>or continue with</span>
        </div>

        <div className={styles.oauthButtons}>
          <button className={styles.oauthButton} type="button">
            <span>🔍</span>
            Continue with Google
          </button>
          <button className={styles.oauthButton} type="button">
            <span>🍎</span>
            Continue with Apple
          </button>
        </div>

        <div className={styles.switchAuth}>
          <span className={styles.switchText}>
            Don't have an account?
            <Link to="/signup" className={styles.switchLink}>
              Sign up
            </Link>
          </span>
        </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;