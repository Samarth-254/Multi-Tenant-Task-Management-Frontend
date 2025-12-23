import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { X, Mail, UserPlus, Copy, Check } from 'lucide-react';
import { invitationsAPI } from '../utils/api';

const InviteModal = ({ isOpen, onClose, onInviteSent }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'Member',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await invitationsAPI.send(formData);
      const successMsg = 'Invitation sent successfully!';
      setSuccess(successMsg);
      toast.success(successMsg);
      setInviteLink(`${window.location.origin}/invite/${response.data.invitation.token}`);
      onInviteSent();

      // Reset form after 2 seconds
      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send invitation';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Invite link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      role: 'Member',
      message: ''
    });
    setError('');
    setSuccess('');
    setInviteLink('');
    setCopied(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-dark rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-dark-100">Invite Team Member</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-dark-400 hover:text-dark-100 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-danger-500/10 border border-danger-500/20 text-danger-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-success-500/10 border border-success-500/20 text-success-400 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              className="input-dark w-full px-4 py-3"
              placeholder="colleague@company.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Role *
            </label>
            <select
              name="role"
              required
              className="input-dark w-full px-4 py-3"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="Member">Member</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
            <p className="text-xs text-dark-400 mt-1">
              {formData.role === 'Admin' && 'Full access to organization and user management'}
              {formData.role === 'Manager' && 'Can manage tasks and assign them to members'}
              {formData.role === 'Member' && 'Can view and update assigned tasks'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              name="message"
              rows={3}
              className="input-dark w-full px-4 py-3 resize-none"
              placeholder="Add a personal message to the invitation..."
              value={formData.message}
              onChange={handleChange}
              maxLength={500}
            />
            <p className="text-xs text-dark-400 mt-1">
              {formData.message.length}/500 characters
            </p>
          </div>

          {inviteLink && (
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Invitation Link
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  className="input-dark flex-1 px-4 py-3 text-sm"
                  value={inviteLink}
                />
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="btn-secondary p-3"
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-dark-400 mt-1">
                Share this link directly or send via email
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-dark-700">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary px-6 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Sending...
                </div>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteModal;
