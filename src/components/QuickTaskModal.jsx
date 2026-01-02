import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { X, Plus, Calendar, User, Flag, Zap } from 'lucide-react';
import { tasksAPI, organizationsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import RichTextEditor from './RichTextEditor';

const QuickTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'Medium'
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      // Set default due date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        dueDate: tomorrow.toISOString().split('T')[0]
      }));
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const response = await organizationsAPI.getUsers();
      // Filter to only show active users
      const activeUsers = response.data.users || [];
      setUsers(activeUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      const errorMsg = 'Failed to load team members';
      setError(errorMsg);
      toast.error(errorMsg);
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
    setLoading(true);
    setError('');

    try {
      await tasksAPI.createTask(formData);
      toast.success('Task created successfully!');
      onTaskCreated();
      onClose();
      resetForm();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create task';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      dueDate: '',
      priority: 'Medium'
    });
    setError('');
  };

  const handleQuickAssign = (userId) => {
    setFormData(prev => ({ ...prev, assignedTo: userId }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl max-h-[85vh] sm:max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800 bg-zinc-900 z-10 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <h2 className="text-lg sm:text-xl font-semibold text-white">Quick Task</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm">
              {error}
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-1.5 sm:mb-2">
              What needs to be done? *
            </label>
            <input
              type="text"
              name="title"
              required
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:border-zinc-600 transition-colors text-sm"
              placeholder="Enter task title..."
              value={formData.title}
              onChange={handleChange}
              autoFocus
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-1.5 sm:mb-2">
              Description
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Enter task description with formatting..."
            />
          </div>

          {/* Quick Assign Buttons */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-1.5 sm:mb-2">
              <User className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              Assign to *
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2 sm:mb-3">
              <button
                type="button"
                onClick={() => handleQuickAssign(user.id || user._id)}
                className={`p-2.5 sm:p-3 rounded-lg border transition-all text-xs sm:text-sm ${
                  formData.assignedTo === (user.id || user._id)
                    ? 'border-zinc-500 bg-zinc-800 text-white'
                    : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                Assign to me
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, assignedTo: '' }))}
                className="p-2.5 sm:p-3 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 transition-all text-xs sm:text-sm"
              >
                Choose person
              </button>
            </div>

            {/* User Dropdown */}
            {formData.assignedTo !== (user.id || user._id) && (
              <select
                name="assignedTo"
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
                value={formData.assignedTo}
                onChange={handleChange}
              >
                <option value="">Select team member</option>
                {users.length > 0 ? (
                  users.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.firstName} {u.lastName} ({u.role})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading team members...</option>
                )}
              </select>
            )}
          </div>

          {/* Due Date & Priority Row */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-1.5 sm:mb-2">
                <Calendar className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                value={formData.dueDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-1.5 sm:mb-2">
                <Flag className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                Priority
              </label>
              <select
                name="priority"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          </div>

          {/* Action Buttons - Sticky at bottom with extra padding for mobile nav */}
          <div className="flex justify-end space-x-2 sm:space-x-3 p-4 pb-20 sm:p-6 sm:pb-6 pt-3 sm:pt-4 border-t border-zinc-800 bg-zinc-900 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2.5 sm:py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-4 sm:px-6 py-2.5 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 sm:space-x-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-zinc-900 border-t-white rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Create Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickTaskModal;
