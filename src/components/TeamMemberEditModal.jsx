import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const TeamMemberEditModal = ({ isOpen, onClose, member, onUpdate }) => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'Member'
  });

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email || '',
        phoneNumber: member.phoneNumber || '',
        role: member.role || 'Member'
      });
    }
  }, [member]);

  const canEditRole = () => {
    if (!currentUser || !member) return false;
    
    // Member cannot edit roles
    if (currentUser.role === 'Member') return false;
    
    // Manager can edit Member roles only (not their own, not Admins)
    if (currentUser.role === 'Manager') {
      return member.role === 'Member' && member._id !== currentUser._id;
    }
    
    // Admin can edit anyone's role including their own
    return currentUser.role === 'Admin';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update user details
      await usersAPI.updateUserById(member._id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber
      });

      // Update role if it changed and user has permission
      if (canEditRole() && formData.role !== member.role) {
        await usersAPI.updateRole(member._id, formData.role);
      }

      toast.success('Team member updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update team member');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-black/70 backdrop-blur-sm" 
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-zinc-900 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-zinc-800">
          {/* Header */}
          <div className="bg-zinc-900 px-6 py-4 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Edit Team Member</h3>
                  <p className="text-sm text-zinc-400">{member.email}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-6 py-6">
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700 text-zinc-500 rounded-lg cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="+91 1234567890"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Role
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    disabled={!canEditRole()}
                    className={`w-full pl-10 pr-4 py-2.5 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500 transition-colors ${
                      canEditRole() ? 'bg-zinc-800' : 'bg-zinc-800/50 cursor-not-allowed'
                    }`}
                  >
                    <option value="Member">Member</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                {!canEditRole() && (
                  <p className="text-xs text-zinc-500 mt-1">
                    {currentUser?.role === 'Member' 
                      ? 'You do not have permission to change roles'
                      : currentUser?.role === 'Manager' && member.role !== 'Member'
                      ? 'Managers can only edit Member roles'
                      : 'You cannot change your own role'
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberEditModal;
