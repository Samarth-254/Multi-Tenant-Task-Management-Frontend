import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  BarChart3,
  Grid3X3,
  List,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { tasksAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import QuickTaskModal from '../components/QuickTaskModal';
import Layout from '../components/Layout';

const TasksNew = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showQuickTaskModal, setShowQuickTaskModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
    assignedTo: '',
    sortBy: 'urgency',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchTasks();
  }, [filters, pagination.page]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        analytics: showAnalytics && user?.role !== 'Member' ? 'true' : 'false',
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await tasksAPI.getTasks(params);
      setTasks(response.data.tasks);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      }));

      if (response.data.analytics) {
        setAnalytics(response.data.analytics);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      await tasksAPI.updateTask(taskId, updates);
      fetchTasks(); // Refresh tasks
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.deleteTask(taskId);
        fetchTasks(); // Refresh tasks
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const handleTaskView = (task) => {
    // TODO: Open task detail modal
    console.log('View task:', task);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      category: '',
      assignedTo: '',
      sortBy: 'urgency',
      sortOrder: 'desc'
    });
  };

  if (loading && tasks.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-zinc-800 border-t-white rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Advanced Task Management
              </h1>
              <p className="mt-2 text-dark-400">
                Comprehensive task tracking with automated expiry and notifications
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              {/* View Toggle */}
              <div className="flex bg-dark-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-500 text-white'
                      : 'text-dark-400 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary-500 text-white'
                      : 'text-dark-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>



              {/* Create Task */}
              {(user?.role === 'Admin' || user?.role === 'Manager') && (
                <button
                  onClick={() => setShowQuickTaskModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Task</span>
                </button>
              )}
            </div>
          </div>



          {/* Filters */}
          <div className="card-dark rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tasks, descriptions, tags..."
                  className="input-dark pl-10 w-full"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <select
                className="input-dark"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Expired">Expired</option>
              </select>

              {/* Priority Filter */}
              <select
                className="input-dark"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {/* Sort By */}
              <select
                className="input-dark"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="urgency">Urgency</option>
                <option value="dueDate">Due Date</option>
                <option value="createdAt">Created Date</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-danger-500/10 border border-danger-500/20 text-danger-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Tasks Display */}
          {tasks.length > 0 ? (
            <div className={`mb-8 ${
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }`}>
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onUpdate={handleTaskUpdate}
                  onDelete={handleTaskDelete}
                  onView={handleTaskView}
                  userRole={user?.role}
                  currentUser={user}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-dark-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-dark-300 mb-2">
                No tasks found
              </h3>
              <p className="text-dark-500">
                {Object.values(filters).some(f => f)
                  ? 'Try adjusting your filters to see more tasks.'
                  : 'Create your first task to get started.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Task Modal */}
      <QuickTaskModal
        isOpen={showQuickTaskModal}
        onClose={() => setShowQuickTaskModal(false)}
        onTaskCreated={() => {
          fetchTasks();
        }}
      />
    </Layout>
  );
};

export default TasksNew;
