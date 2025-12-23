import React, { useState, useEffect } from 'react';
import { X, User, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { tasksAPI, organizationsAPI } from '../utils/api';

const TaskReassignmentModal = ({ isOpen, onClose, userId, userName, onReassign }) => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reassignMode, setReassignMode] = useState('all'); // 'all' or 'individual'
  const [assignToUserId, setAssignToUserId] = useState('');
  const [individualAssignments, setIndividualAssignments] = useState({});
  const [expandedTask, setExpandedTask] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchData();
    }
  }, [isOpen, userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch tasks assigned to the user
      const tasksResponse = await tasksAPI.getTasks({ assignedTo: userId });
      const userTasks = tasksResponse.data.tasks || [];
      setTasks(userTasks);
      
      // Initialize individual assignments with empty values
      const initialAssignments = {};
      userTasks.forEach(task => {
        initialAssignments[task._id] = '';
      });
      setIndividualAssignments(initialAssignments);
      
      // Fetch all users for reassignment
      const usersResponse = await organizationsAPI.getUsers();
      const allUsers = (usersResponse.data.users || []).filter(u => 
        u._id !== userId
      );
      setUsers(allUsers);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load tasks and users');
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async () => {
    try {
      setSubmitting(true);
      setError('');

      if (reassignMode === 'all') {
        if (!assignToUserId) {
          setError('Please select a user to assign all tasks to');
          return;
        }
        
        // Reassign all tasks to one user
        const promises = tasks.map(task => 
          tasksAPI.updateTask(task._id, { assignedTo: assignToUserId })
        );
        await Promise.all(promises);
      } else {
        // Individual reassignment
        const hasUnassigned = tasks.some(task => !individualAssignments[task._id]);
        if (hasUnassigned) {
          setError('Please assign all tasks to team members');
          return;
        }
        
        const promises = tasks.map(task => 
          tasksAPI.updateTask(task._id, { assignedTo: individualAssignments[task._id] })
        );
        await Promise.all(promises);
      }

      onReassign();
      onClose();
    } catch (err) {
      console.error('Error reassigning tasks:', err);
      setError('Failed to reassign tasks. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleIndividualAssignment = (taskId, userId) => {
    setIndividualAssignments(prev => ({
      ...prev,
      [taskId]: userId
    }));
  };

  const toggleTaskExpanded = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Reassign Tasks</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Before removing {userName}, please reassign their tasks
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-zinc-700"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent absolute top-0 left-0"></div>
              </div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-zinc-800/50 rounded-lg p-8 text-center border border-zinc-700/50">
              <AlertCircle className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
              <p className="text-zinc-300 font-medium mb-1">No Active Tasks</p>
              <p className="text-sm text-zinc-500">
                {userName} has no active tasks assigned. You can safely remove them.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Task Count */}
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-3 rounded-lg text-sm">
                <strong>{tasks.length}</strong> task{tasks.length !== 1 ? 's' : ''} need to be reassigned
              </div>

              {/* Reassignment Mode Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-zinc-300 mb-3">
                  Choose reassignment method
                </label>
                
                {/* Assign All to One Person */}
                <div
                  onClick={() => setReassignMode('all')}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    reassignMode === 'all'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={reassignMode === 'all'}
                      onChange={() => setReassignMode('all')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">Assign all tasks to one person</h3>
                      <p className="text-sm text-zinc-400">All {tasks.length} tasks will be assigned to a single team member</p>
                      
                      {reassignMode === 'all' && (
                        <div className="mt-3">
                          <select
                            value={assignToUserId}
                            onChange={(e) => setAssignToUserId(e.target.value)}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
                          >
                            <option value="">Select team member</option>
                            {users.map(user => (
                              <option key={user._id} value={user._id}>
                                {user.firstName} {user.lastName} ({user.role})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assign Individually */}
                <div
                  onClick={() => setReassignMode('individual')}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    reassignMode === 'individual'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={reassignMode === 'individual'}
                      onChange={() => setReassignMode('individual')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">Assign tasks individually</h3>
                      <p className="text-sm text-zinc-400">Choose different team members for each task</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Task Assignment */}
              {reassignMode === 'individual' && (
                <div className="space-y-2 mt-4">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Assign each task
                  </label>
                  {tasks.map(task => (
                    <div key={task._id} className="bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                      {/* Task Header */}
                      <div className="p-3">
                        <div className="flex items-start gap-3 mb-2">
                          <button
                            onClick={() => toggleTaskExpanded(task._id)}
                            className="p-1 hover:bg-zinc-700 rounded transition-colors mt-0.5"
                          >
                            {expandedTask === task._id ? (
                              <ChevronUp className="w-4 h-4 text-zinc-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-zinc-400" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{task.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                task.status === 'Completed' ? 'bg-green-500/10 text-green-400' :
                                task.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' :
                                task.status === 'Expired' ? 'bg-red-500/10 text-red-400' :
                                'bg-zinc-500/10 text-zinc-400'
                              }`}>
                                {task.status}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                task.priority === 'High' ? 'bg-red-500/10 text-red-400' :
                                task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-green-500/10 text-green-400'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedTask === task._id && task.description && (
                          <div className="ml-9 mb-2 text-sm text-zinc-400 bg-zinc-900/50 p-2 rounded">
                            {task.description}
                          </div>
                        )}

                        {/* Assignment Dropdown */}
                        <div className="ml-9">
                          <select
                            value={individualAssignments[task._id]}
                            onChange={(e) => handleIndividualAssignment(task._id, e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
                          >
                            <option value="">Select team member</option>
                            {users.map(user => (
                              <option key={user._id} value={user._id}>
                                {user.firstName} {user.lastName} ({user.role})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {tasks.length > 0 && !loading && (
          <div className="flex items-center justify-between gap-3 p-6 border-t border-zinc-800 bg-zinc-900/50 flex-shrink-0">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReassign}
              disabled={submitting}
              className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-900 border-t-white rounded-full animate-spin"></div>
                  <span>Reassigning...</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  <span>Reassign & Remove User</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* No Tasks Footer */}
        {tasks.length === 0 && !loading && (
          <div className="flex justify-end gap-3 p-6 border-t border-zinc-800 bg-zinc-900/50 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onReassign}
              className="btn-primary px-6 py-2"
            >
              Confirm Removal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskReassignmentModal;
