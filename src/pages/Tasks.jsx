import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  User,
  Grid3X3,
  List,
  BarChart3,
  LayoutGrid,
  Users
} from 'lucide-react';
import { tasksAPI, organizationsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import TaskCard from '../components/TaskCard';
import QuickTaskModal from '../components/QuickTaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import TaskEditModal from '../components/TaskEditModal';
import Layout from '../components/Layout';

const Tasks = () => {
  const { user } = useAuth();
  const { socketService, isConnected } = useSocket();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('status'); // 'status' or 'people'

  // Kanban State
  const [draggedTask, setDraggedTask] = useState(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const [showQuickTaskModal, setShowQuickTaskModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    assignedTo: '',
    category: '',
    sortBy: 'urgency',
    myTasks: false // New filter for tasks assigned to current user
  });
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [filters]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchInput]);



  // WebSocket real-time updates
  useEffect(() => {
    if (!socketService || !isConnected) return;

    const handleTaskCreated = (data) => {
      console.log('Real-time: Task created', data.task);
      setTasks(prev => [data.task, ...prev]);
    };

    const handleTaskUpdated = (data) => {
      console.log('Real-time: Task updated', data.task);
      setTasks(prev => prev.map(task =>
        task._id === data.task._id ? data.task : task
      ));
    };

    const handleTaskDeleted = (data) => {
      console.log('Real-time: Task deleted', data.taskId);
      setTasks(prev => prev.filter(task => task._id !== data.taskId));
    };

    // Register WebSocket event listeners
    socketService.on('task_created', handleTaskCreated);
    socketService.on('task_updated', handleTaskUpdated);
    socketService.on('task_deleted', handleTaskDeleted);

    // Cleanup function
    return () => {
      socketService.off('task_created', handleTaskCreated);
      socketService.off('task_updated', handleTaskUpdated);
      socketService.off('task_deleted', handleTaskDeleted);
    };
  }, [socketService, isConnected]);

  const fetchUsers = async () => {
    try {
      const response = await organizationsAPI.getUsers();
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};

      // Apply filters with correct parameter names
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.assignedTo) params.assignedTo = filters.assignedTo;
      if (filters.category) params.category = filters.category;
      if (filters.sortBy) params.sortBy = filters.sortBy;

      // Handle "My Tasks" filter for Admin/Manager
      if (filters.myTasks && (user?.role === 'Admin' || user?.role === 'Manager')) {
        params.assignedTo = user._id || user.id;
      }

      // Role-based filtering: Members only see their assigned tasks (handled by backend)
      // Admin/Manager see all tasks in their organization

      const response = await tasksAPI.getTasks(params);
      let fetchedTasks = response.data.tasks || [];

      setTasks(fetchedTasks);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };



  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({
      search: '',
      status: '',
      priority: '',
      assignedTo: '',
      category: '',
      sortBy: 'urgency',
      myTasks: false
    });
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      await tasksAPI.updateTask(taskId, updates);
      fetchTasks();
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.deleteTask(taskId);
        fetchTasks();
      } catch (err) {
        setError('Failed to delete task');
        console.error('Error deleting task:', err);
      }
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    if (!draggedTask) return;

    if (draggedTask.status === status) {
      setDraggedTask(null);
      return;
    }

    // Optimistic update
    const updatedTask = { ...draggedTask, status };
    setTasks(prev => prev.map(t => t._id === draggedTask._id ? updatedTask : t));
    
    try {
      await tasksAPI.updateTask(draggedTask._id, { status });
    } catch (err) {
      console.error('Failed to update task status:', err);
      setError('Failed to update task status');
      // Revert on error
      setTasks(prev => prev.map(t => t._id === draggedTask._id ? draggedTask : t));
    } finally {
      setDraggedTask(null);
    }
  };

  const handleDropOnPerson = async (e, userId) => {
    e.preventDefault();
    if (!draggedTask) return;

    const currentAssignedId = draggedTask.assignedTo?._id || draggedTask.assignedTo?.id;
    if (currentAssignedId === userId) {
      setDraggedTask(null);
      return;
    }

    // Optimistic update
    const assignedUser = users.find(u => u._id === userId);
    const updatedTask = { ...draggedTask, assignedTo: assignedUser };
    setTasks(prev => prev.map(t => t._id === draggedTask._id ? updatedTask : t));
    
    try {
      await tasksAPI.updateTask(draggedTask._id, { assignedTo: userId });
    } catch (err) {
      console.error('Failed to reassign task:', err);
      setError('Failed to reassign task');
      // Revert on error
      setTasks(prev => prev.map(t => t._id === draggedTask._id ? draggedTask : t));
    } finally {
      setDraggedTask(null);
    }
  };

  const handleTaskView = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleTaskEdit = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleTaskSave = async (taskId, updates) => {
    try {
      await tasksAPI.updateTask(taskId, updates);
      fetchTasks();
      setShowEditModal(false);
      setSelectedTask(null);
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showTopBar={false}>
      <div className="h-screen bg-black flex flex-col overflow-hidden">
        {/* Compact Header with Title, Search, Filters, and New Task */}
        <div className="flex-none px-6 py-4 border-b border-zinc-800/50">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Title */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white">Task Board</h1>
            </div>

            {/* Right: View Toggle, Search, Filters, and New Task */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* View Toggle */}
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('status')}
                  className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    viewMode === 'status'
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Group by Status"
                >
                  <LayoutGrid className="w-4 h-4" />
                  Status
                </button>
                <button
                  onClick={() => setViewMode('people')}
                  className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    viewMode === 'people'
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Group by People"
                >
                  <Users className="w-4 h-4" />
                  People
                </button>
              </div>

              
              <div className={`flex items-center transition-all duration-300 ease-in-out ${isSearchExpanded ? 'w-64 bg-zinc-900 border border-zinc-800' : 'w-10 bg-zinc-900 border border-zinc-800'} rounded-lg overflow-hidden`}>
                <button
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className="p-2 text-zinc-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <Search className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className={`w-full bg-transparent border-none text-white placeholder-zinc-500 focus:ring-0 text-sm outline-none pr-2 ${isSearchExpanded ? 'opacity-100' : 'opacity-0 w-0 px-0'}`}
                  value={searchInput}
                  onChange={handleSearchChange}
                />
              </div>

              {/* Priority Filter */}
              <select
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-700 hover:border-zinc-700 transition-colors"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {/* My Tasks Filter */}
              {(user?.role === 'Admin' || user?.role === 'Manager') && (
                <button
                  onClick={() => handleFilterChange('myTasks', !filters.myTasks)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    filters.myTasks
                      ? 'bg-white text-black border-white'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  My Tasks
                </button>
              )}

              {/* Clear Filters */}
              {(filters.search || filters.priority || filters.myTasks) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}

              {/* Create Task */}
              {(user?.role === 'Admin' || user?.role === 'Manager') && (
                <button
                  onClick={() => setShowQuickTaskModal(true)}
                  className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Task</span>
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3">
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Kanban Board - Full Height */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex gap-6 px-6 py-6 overflow-x-auto">
            {viewMode === 'status' ? (
              // Status View
              ['Todo', 'In Progress', 'Completed', 'Expired'].map((status) => {
                const statusTasks = tasks.filter(t => t.status === status);
                
                return (
                <div 
                  key={status} 
                  className="w-80 flex-shrink-0 flex flex-col bg-zinc-900/30 rounded-xl border border-zinc-800/50 backdrop-blur-sm h-full"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  {/* Column Header */}
                  <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md rounded-t-xl">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        status === 'Todo' ? 'bg-zinc-500' :
                        status === 'In Progress' ? 'bg-blue-500' :
                        status === 'Completed' ? 'bg-green-500' :
                        'bg-red-500'
                      }`} />
                      <h3 className="font-semibold text-zinc-300 text-sm uppercase tracking-wider">
                        {status}
                      </h3>
                      <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">
                        {statusTasks.length}
                      </span>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {statusTasks.map((task) => (
                      <div key={task._id} className="transform transition-transform duration-200 hover:-translate-y-1">
                        <TaskCard
                          task={task}
                          onUpdate={handleTaskUpdate}
                          onDelete={handleTaskDelete}
                          onView={handleTaskView}
                          onEdit={handleTaskEdit}
                          userRole={user?.role}
                          currentUser={user}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, task)}
                        />
                      </div>
                    ))}
                    {statusTasks.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-sm border-2 border-dashed border-zinc-800/50 rounded-lg m-2 min-h-[100px]">
                        <p>No tasks</p>
                        <p className="text-xs opacity-50">Drop here</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
            ) : (
              // People View
              users.map((member) => {
                const memberTasks = tasks.filter(t => 
                  t.assignedTo?._id === member._id || t.assignedTo?.id === member._id
                );
                
                return (
                  <div 
                    key={member._id} 
                    className="w-80 flex-shrink-0 flex flex-col bg-zinc-900/30 rounded-xl border border-zinc-800/50 backdrop-blur-sm h-full"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnPerson(e, member._id)}
                  >
                    {/* Column Header */}
                    <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md rounded-t-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-zinc-300 text-sm">
                            {member.firstName} {member.lastName}
                          </h3>
                          <p className="text-xs text-zinc-500">{member.role}</p>
                        </div>
                      </div>
                      <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">
                        {memberTasks.length}
                      </span>
                    </div>

                    {/* Tasks List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                      {memberTasks.map((task) => (
                        <div key={task._id} className="transform transition-transform duration-200 hover:-translate-y-1">
                          <TaskCard
                            task={task}
                            onUpdate={handleTaskUpdate}
                            onDelete={handleTaskDelete}
                            onView={handleTaskView}
                            onEdit={handleTaskEdit}
                            userRole={user?.role}
                            currentUser={user}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, task)}
                          />
                        </div>
                      ))}
                      {memberTasks.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-sm border-2 border-dashed border-zinc-800/50 rounded-lg m-2 min-h-[100px]">
                          <p>No tasks</p>
                          <p className="text-xs opacity-50">Drop here</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
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

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />

      {/* Task Edit Modal */}
      <TaskEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={handleTaskSave}
        userRole={user?.role}
      />
    </Layout>
  );
};

export default Tasks;
