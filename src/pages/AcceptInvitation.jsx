import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Mail, AlertTriangle } from 'lucide-react';
import { invitationsAPI, authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AcceptInvitation = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    try {
      setLoading(true);
      const response = await invitationsAPI.getInvitation(token);
      setInvitation(response.data.invitation);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Accept the invitation
      const response = await invitationsAPI.acceptInvitation(token, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password
      });

      // Log the user in automatically
      const loginResponse = await authAPI.login({
        email: invitation.email,
        password: formData.password
      });

      login(loginResponse.data.user, loginResponse.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-zinc-900 border border-red-900/50 rounded-2xl flex items-center justify-center shadow-xl">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-red-500">
              Invalid Invitation
            </h2>
            <p className="mt-2 text-zinc-400">
              {error}
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="btn-primary px-6 py-2 text-sm font-medium"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-xl">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">
            Join {invitation?.organization?.name}
          </h2>
          <p className="mt-2 text-zinc-400">
            You've been invited as a <span className="font-medium text-white">{invitation?.role}</span>
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Email: {invitation?.email}
          </p>
        </div>

        <div className="card-dark rounded-2xl p-8 shadow-dark-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-danger-500/10 border border-danger-500/20 text-danger-400 px-4 py-3 rounded-lg backdrop-blur-sm">
                {error}
              </div>
            )}

            {invitation?.message && (
              <div className="bg-primary-500/10 border border-primary-500/20 text-primary-300 px-4 py-3 rounded-lg backdrop-blur-sm">
                <p className="text-sm font-medium">Personal Message:</p>
                <p className="text-sm mt-1">{invitation.message}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-dark-200 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="input-dark w-full px-4 py-3"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-dark-200 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="input-dark w-full px-4 py-3"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-200 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-dark w-full px-4 py-3"
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-200 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="input-dark w-full px-4 py-3"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Joining organization...
                </div>
              ) : (
                `Join ${invitation?.organization?.name}`
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-dark-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;
