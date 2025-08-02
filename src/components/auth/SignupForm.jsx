import React, { useState } from 'react';
import { useAuth } from '../../hooks/useApi';
import { validateEmail, validatePassword, validatePhone } from '../../utils/helpers';
import { VALIDATION_RULES, UserRoles, UserTypes } from '../../constants';

const SignupForm = ({ onSuccess, onSwitchToLogin }) => {
  const { signUp, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRoles.PATIENT,
    type: UserTypes.INDIVIDUAL,
    // Optional profile fields
    sex: '',
    age: '',
    phone: '',
    address: '',
    medical_history: {}
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form

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

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = VALIDATION_RULES.EMAIL.REQUIRED;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = VALIDATION_RULES.EMAIL.INVALID;
    }

    if (!formData.password) {
      newErrors.password = VALIDATION_RULES.PASSWORD.REQUIRED;
    } else if (formData.password.length < 8) {
      newErrors.password = VALIDATION_RULES.PASSWORD.MIN_LENGTH;
    } else if (!validatePassword(formData.password)) {
      newErrors.password = VALIDATION_RULES.PASSWORD.COMPLEXITY;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }

    if (!formData.type) {
      newErrors.type = 'Please select account type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = VALIDATION_RULES.PHONE.INVALID;
    }

    if (formData.age && (isNaN(formData.age) || formData.age < 0 || formData.age > 150)) {
      newErrors.age = 'Please enter a valid age';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    try {
      // Prepare data according to API schema
      const signupData = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        type: formData.type,
        ...(formData.sex && { sex: formData.sex }),
        ...(formData.age && { age: parseInt(formData.age) }),
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.address && { address: formData.address }),
        profile_json: {
          preferences: {},
          settings: {}
        },
        medical_history: formData.medical_history
      };

      await signUp(signupData);
      onSuccess?.();
    } catch (error) {
      setErrors({
        submit: error.message || 'Sign up failed. Please try again.'
      });
    }
  };

  const renderStep1 = () => (
    <>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
          Create Account
        </h2>
        <p className="text-neutral-600" style={{fontFamily: 'var(--font-body)'}}>
          Join Fountain to manage your health records
        </p>
      </div>

      <div className="space-y-6">
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
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2" style={{fontFamily: 'var(--font-body)'}}>
            Email Address *
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
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`input-primary pr-12 ${errors.password ? 'border-error-300 focus:ring-error-500' : ''}`}
              placeholder="Create a strong password"
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
          <p className="mt-1 text-xs text-gray-600 font-medium" style={{fontFamily: 'var(--font-body)'}}>
            Must contain at least 8 characters with uppercase, lowercase, and numbers
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-800 mb-2" style={{fontFamily: 'var(--font-body)'}}>
            Confirm Password *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`input-primary pr-12 ${errors.confirmPassword ? 'border-error-300 focus:ring-error-500' : ''}`}
              placeholder="Confirm your password"
              disabled={loading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              {showConfirmPassword ? (
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
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error-600">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="role" className="block text-sm font-bold text-gray-800 mb-2" style={{fontFamily: 'var(--font-body)'}}>
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`input-primary ${errors.role ? 'border-error-300 focus:ring-error-500' : ''}`}
              disabled={loading}
            >
              <option value={UserRoles.PATIENT}>Patient</option>
              <option value={UserRoles.PROVIDER}>Healthcare Provider</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-error-600">{errors.role}</p>
            )}
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-bold text-gray-800 mb-2" style={{fontFamily: 'var(--font-body)'}}>
              Account Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`input-primary ${errors.type ? 'border-error-300 focus:ring-error-500' : ''}`}
              disabled={loading}
            >
              <option value={UserTypes.INDIVIDUAL}>Individual</option>
              <option value={UserTypes.ORGANIZATION}>Organization</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-error-600">{errors.type}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextStep}
          className="btn-primary w-full"
          disabled={loading}
        >
          Continue
        </button>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-black mb-2 tracking-tight" style={{fontFamily: 'var(--font-display)'}}>
          Complete Your Profile
        </h2>
        <p className="text-gray-700 font-medium" style={{fontFamily: 'var(--font-body)'}}>
          Help us personalize your experience (optional)
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sex" className="block text-sm font-bold text-gray-800 mb-2" style={{fontFamily: 'var(--font-body)'}}>
              Sex
            </label>
            <select
              id="sex"
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="input-primary"
              disabled={loading}
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-bold text-gray-800 mb-2" style={{fontFamily: 'var(--font-body)'}}>
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className={`input-primary ${errors.age ? 'border-error-300 focus:ring-error-500' : ''}`}
              placeholder="Enter your age"
              min="0"
              max="150"
              disabled={loading}
            />
            {errors.age && (
              <p className="mt-1 text-sm text-error-600">{errors.age}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-bold text-gray-800 mb-2" style={{fontFamily: 'var(--font-body)'}}>
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`input-primary ${errors.phone ? 'border-error-300 focus:ring-error-500' : ''}`}
            placeholder="Enter your phone number"
            disabled={loading}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-error-600">{errors.phone}</p>
          )}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-bold text-gray-800 mb-2" style={{fontFamily: 'var(--font-body)'}}>
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="input-primary"
            placeholder="Enter your address"
            disabled={loading}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handlePrevStep}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Back
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 relative"
          >
            {loading ? (
              <>
                <div className="loading-spinner absolute left-4"></div>
                <span className="ml-6">Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 1 ? 'bg-black text-white shadow-lg' : 'bg-gray-200 text-gray-500'
          }`} style={{fontFamily: 'var(--font-body)'}}>
            1
          </div>
          <div className={`w-16 h-1 mx-2 rounded-full ${
            step >= 2 ? 'bg-black shadow-sm' : 'bg-gray-200'
          }`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 2 ? 'bg-black text-white shadow-lg' : 'bg-gray-200 text-gray-500'
          }`} style={{fontFamily: 'var(--font-body)'}}>
            2
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600 font-medium" style={{fontFamily: 'var(--font-body)'}}>
          <span>Account Info</span>
          <span>Profile Details</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 ? renderStep1() : renderStep2()}
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-700 font-medium" style={{fontFamily: 'var(--font-body)'}}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-black hover:text-gray-700 font-bold transition-all duration-200 hover:scale-105" style={{fontFamily: 'var(--font-body)'}}
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;