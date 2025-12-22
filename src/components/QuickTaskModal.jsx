import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, User, Flag, Zap, Tag } from 'lucide-react';
import { tasksAPI, organizationsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const QuickTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'Medium',
    category: 'Other'
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
      console.log('Fetching users...');
      const response = await organizationsAPI.getUsers();
      console.log('Users response:', response.data);
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load team members');
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
      onTaskCreated();
      onClose();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
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
      priority: 'Medium',
      category: 'Other'
    });
    setError('');
  };

  const handleQuickAssign = (userId) => {
    setFormData(prev => ({ ...prev, assignedTo: userId }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-white" />
            <h2 className="text-xl font-semibold text-white">Quick Task</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              What needs to be done? *
            </label>
            <input
              type="text"
              name="title"
              required
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
              placeholder="Enter task title..."
              value={formData.title}
              onChange={handleChange}
              autoFocus
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:border-zinc-600 transition-colors resize-none"
              placeholder="Enter task description..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Quick Assign Buttons */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Assign to *
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleQuickAssign(user.id || user._id)}
                className={`p-3 rounded-lg border transition-all text-sm ${
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
                className="p-3 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 transition-all text-sm"
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
                value={formData.dueDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <Flag className="inline h-4 w-4 mr-1" />
                Priority
              </label>
              <select
                name="priority"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              <Tag className="inline h-4 w-4 mr-1" />
              Category
            </label>
            <select
              name="category"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Bug">Bug</option>
              <option value="Feature">Feature</option>
              <option value="Improvement">Improvement</option>
              <option value="Documentation">Documentation</option>
              <option value="Testing">Testing</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-900 border-t-white rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
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
