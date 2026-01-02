import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { X, Calendar, User, Flag, Clock, Save } from 'lucide-react';
import { organizationsAPI } from '../utils/api';
import RichTextEditor from './RichTextEditor';

const TaskEditModal = ({ isOpen, onClose, task, onSave, userRole }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    dueDate: '',
    estimatedHours: '',
    actualHours: '',
    assignedTo: '',
    tags: []
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'Todo',
        priority: task.priority || 'Medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        estimatedHours: task.estimatedHours || '',
        actualHours: task.actualHours || '',
        assignedTo: task.assignedTo?._id || '',
        tags: task.tags || []
      });
      fetchUsers();
    }
  }, [isOpen, task]);

  const fetchUsers = async () => {
    try {
      const response = await organizationsAPI.getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updateData = { ...formData };
      
      // Convert empty strings to undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '') {
          updateData[key] = undefined;
        }
      });

      // Convert numeric fields
      if (updateData.estimatedHours) {
        updateData.estimatedHours = parseFloat(updateData.estimatedHours);
      }
      if (updateData.actualHours) {
        updateData.actualHours = parseFloat(updateData.actualHours);
      }

      await onSave(task._id, updateData);
      toast.success('Task updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  // Role-based field restrictions
  const isAdmin = userRole === 'Admin';
  const isManager = userRole === 'Manager';
  const isMember = userRole === 'Member';
  const canEditAllFields = isAdmin || isManager;
  const canOnlyEditStatus = isMember;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              disabled={canOnlyEditStatus}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Description
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Enter task description with formatting..."
              readOnly={canOnlyEditStatus}
            />
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <Flag className="w-4 h-4 inline mr-1" />
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
                required
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                {canEditAllFields && <option value="Expired">Expired</option>}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <Flag className="w-4 h-4 inline mr-1" />
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                disabled={canOnlyEditStatus}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Assigned User */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Assigned To
            </label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleInputChange}
              disabled={canOnlyEditStatus}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
            >
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.role})
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              disabled={canOnlyEditStatus}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          {/* Time Tracking Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Estimated Hours */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Estimated Hours
              </label>
              <input
                type="number"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleInputChange}
                disabled={canOnlyEditStatus}
                min="0"
                step="0.5"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>

            {/* Actual Hours */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Actual Hours
              </label>
              <input
                type="number"
                name="actualHours"
                value={formData.actualHours}
                onChange={handleInputChange}
                min="0"
                step="0.5"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
          </div>

          {/* Tags */}
          {canEditAllFields && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type a tag and press Enter"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
                />
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-800 text-zinc-300 text-sm rounded-full border border-zinc-700"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Role-based Info */}
          {canOnlyEditStatus && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-yellow-400 text-sm">
                <strong>Note:</strong> As a Member, you can only update the status and actual hours of your assigned tasks.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskEditModal;
