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
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup
    .string()
    .required('Please select your role'),
  userType: yup
    .string()
    .required('Please select your user type'),
  terms: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions')
});

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      await signup({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        user_type: data.userType
      });
      navigate('/dashboard');
    } catch (err) {
      setError('root', {
        message: err.message || 'Sign up failed. Please try again.'
      });
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.logo}>
          <h1 className={styles.logoText}>Fountain</h1>
          <p className={styles.logoSubtext}>Health Records Management</p>
        </div>

        <div className={styles.header}>
          <h2 className={styles.title}>Create Account</h2>
          <p className={styles.subtitle}>Get started with your health records</p>
        </div>

        {(error || errors.root) && (
          <div className={styles.errorMessage}>
            {error || errors.root?.message}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <Input
              label="First Name"
              type="text"
              {...register('firstName')}
              error={errors.firstName?.message}
              required
            />
            <Input
              label="Last Name"
              type="text"
              {...register('lastName')}
              error={errors.lastName?.message}
              required
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            required
          />

          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <div style={{ flex: 1 }}>
              <select
                {...register('role')}
                style={{
                  width: '100%',
                  height: 'var(--height-input)',
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--color-gray-300)',
                  borderRadius: 'var(--radius-small)',
                  fontSize: 'var(--font-size-body)',
                  fontFamily: 'var(--font-family)'
                }}
              >
                <option value="">Select Role</option>
                <option value="patient">Patient</option>
                <option value="provider">Healthcare Provider</option>
                <option value="caregiver">Caregiver</option>
              </select>
              {errors.role && (
                <div style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-caption)', marginTop: 'var(--spacing-xs)' }}>
                  {errors.role.message}
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <select
                {...register('userType')}
                style={{
                  width: '100%',
                  height: 'var(--height-input)',
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--color-gray-300)',
                  borderRadius: 'var(--radius-small)',
                  fontSize: 'var(--font-size-body)',
                  fontFamily: 'var(--font-family)'
                }}
              >
                <option value="">User Type</option>
                <option value="individual">Individual</option>
                <option value="family">Family</option>
                <option value="organization">Organization</option>
              </select>
              {errors.userType && (
                <div style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-caption)', marginTop: 'var(--spacing-xs)' }}>
                  {errors.userType.message}
                </div>
              )}
            </div>
          </div>

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

          <div className={styles.passwordToggle}>
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              required
            />
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
            </button>
          </div>

          <div className={styles.checkboxWrapper} style={{ marginTop: 'var(--spacing-md)' }}>
            <input
              type="checkbox"
              id="terms"
              className={styles.checkbox}
              {...register('terms')}
            />
            <label htmlFor="terms" className={styles.checkboxLabel}>
              I agree to the{' '}
              <Link to="/terms" className={styles.forgotLink}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className={styles.forgotLink}>
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.terms && (
            <div style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-caption)' }}>
              {errors.terms.message}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={isLoading}
            className={styles.submitButton}
          >
            Create Account
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
            Already have an account?
            <Link to="/login" className={styles.switchLink}>
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;