import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isResending, setIsResending] = useState(false);
  
  // Get email from location state or use empty string
  const email = location.state?.email || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm();

  // Verify email mutation
  const verifyMutation = useMutation(async (data) => {
    const response = await api.post('/api/auth/verify-email', data);
    return response.data;
  }, {
    onSuccess: (data) => {
      toast.success('Email verified successfully!');
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || 'Verification failed';
      toast.error(message);
    }
  });

  // Resend verification mutation
  const resendMutation = useMutation(async (email) => {
    const response = await api.post('/api/auth/resend-verification', { email });
    return response.data;
  }, {
    onSuccess: () => {
      toast.success('Verification code sent successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || 'Failed to resend verification code';
      toast.error(message);
    }
  });

  const onSubmit = (data) => {
    // Include the email from location state
    const requestData = {
      ...data,
      email: email
    };
    verifyMutation.mutate(requestData);
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error('Email address is required');
      return;
    }

    setIsResending(true);
    resendMutation.mutate(email, {
      onSettled: () => {
        setIsResending(false);
      }
    });
  };

  const testConnection = async () => {
    try {
      const response = await api.get('/api/auth/test');
      toast.success('Connection test successful: ' + response.data.message);
    } catch (error) {
      toast.error('Connection test failed: ' + error.message);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setValue('verificationCode', value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-300 mb-6">
              We've sent a 6-digit verification code to
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-sm font-medium text-white">{email}</p>
            </div>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-300 mb-2">
                Verification Code
              </label>
              <input
                {...register('verificationCode', {
                  required: 'Verification code is required',
                  minLength: {
                    value: 6,
                    message: 'Code must be 6 digits'
                  },
                  maxLength: {
                    value: 6,
                    message: 'Code must be 6 digits'
                  },
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Code must contain only numbers'
                  }
                })}
                type="text"
                id="verificationCode"
                maxLength={6}
                onChange={handleCodeChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                placeholder="000000"
                autoComplete="off"
              />
              {errors.verificationCode && (
                <p className="mt-1 text-sm text-red-600">{errors.verificationCode.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={verifyMutation.isLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {verifyMutation.isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300 mb-3">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendCode}
              disabled={isResending || resendMutation.isLoading}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending || resendMutation.isLoading ? 'Sending...' : 'Resend Code'}
            </button>
          </div>

          {/* Test Connection Button */}
          <div className="mt-4 text-center">
            <button
              onClick={testConnection}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Test Connection
            </button>
          </div>

          {/* Back to Login */}
          <div className="mt-2 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-400 hover:text-gray-300 text-sm"
            >
              ← Back to Login
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Check your email
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Check your spam folder if you don't see the email</li>
                    <li>The code expires in 15 minutes</li>
                    <li>Contact support if you continue having issues</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
