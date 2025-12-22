import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Target,
  Zap,
  Users,
  ArrowRight,
  Activity,
  Timer,
  Star,
  Briefcase,
  ChevronRight,
  Bell
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../utils/api';
import { useSocket } from '../context/SocketContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    overdueTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTasks({
        limit: 5,
        sortBy: 'createdAt',
        analytics: true
      });

      const tasks = response.data.tasks || [];
      setRecentTasks(tasks);

      // Calculate stats
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'Completed').length;
      const active = tasks.filter(t => t.status === 'In Progress').length;
      const overdue = tasks.filter(t =>
        t.status === 'Expired' ||
        (new Date(t.dueDate) < new Date() && t.status !== 'Completed')
      ).length;

      setStats({
        totalTasks: total,
        completedTasks: completed,
        activeTasks: active,
        overdueTasks: overdue
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-500/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'Low': return 'text-green-400 bg-green-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-400 bg-green-500/10';
      case 'In Progress': return 'text-blue-400 bg-blue-500/10';
      case 'Expired': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <Layout showNotification={true}>
      <div className="min-h-screen bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {getGreeting()}, {user?.firstName}! 👋
                </h1>
                <p className="text-dark-400 text-lg">
                  Here's what's happening with your tasks today
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-dark-800 px-4 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-dark-300">{onlineUsers.length} online</span>
                </div>
                <div className="text-sm text-dark-400">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Tasks */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm font-medium mb-1">Total Tasks</p>
                  <p className="text-3xl font-bold text-white">{loading ? '...' : stats.totalTasks}</p>
                  <p className="text-zinc-500 text-xs mt-1">All time</p>
                </div>
                <div className="p-3 bg-zinc-800 rounded-xl">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Active Tasks */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm font-medium mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-white">{loading ? '...' : stats.activeTasks}</p>
                  <p className="text-zinc-500 text-xs mt-1">Active now</p>
                </div>
                <div className="p-3 bg-zinc-800 rounded-xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Completed Tasks */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm font-medium mb-1">Completed</p>
                  <p className="text-3xl font-bold text-white">{loading ? '...' : stats.completedTasks}</p>
                  <p className="text-zinc-500 text-xs mt-1">This month</p>
                </div>
                <div className="p-3 bg-zinc-800 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Overdue Tasks */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm font-medium mb-1">Overdue</p>
                  <p className="text-3xl font-bold text-white">{loading ? '...' : stats.overdueTasks}</p>
                  <p className="text-zinc-500 text-xs mt-1">Need attention</p>
                </div>
                <div className="p-3 bg-zinc-800 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Tasks */}
            <div className="lg:col-span-2">
              <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Recent Tasks</h2>
                  <Link
                    to="/tasks"
                    className="flex items-center text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                  >
                    View all <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-dark-700 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : recentTasks.length > 0 ? (
                  <div className="space-y-3">
                    {recentTasks.map((task) => (
                      <div key={task._id} className="bg-dark-700/50 border border-dark-600 rounded-lg p-4 hover:border-dark-500 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-white font-medium mb-1">{task.title}</h3>
                            <div className="flex items-center space-x-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                              <span className="text-dark-400 flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-dark-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-dark-500 mx-auto mb-3" />
                    <p className="text-dark-400">No tasks yet. Create your first task!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & Info */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link
                    to="/tasks?action=create"
                    className="flex items-center justify-between p-3 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-zinc-700 rounded-lg mr-3">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white font-medium">Create Task</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/team"
                    className="flex items-center justify-between p-3 bg-dark-700/50 border border-dark-600 rounded-lg hover:bg-dark-700 transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                        <Users className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-white font-medium">Team</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-dark-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {/* <Link
                    to="/notifications"
                    className="flex items-center justify-between p-3 bg-dark-700/50 border border-dark-600 rounded-lg hover:bg-dark-700 transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-500/20 rounded-lg mr-3">
                        <Bell className="w-4 h-4 text-yellow-400" />
                      </div>
                      <span className="text-white font-medium">Notifications</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-dark-400 group-hover:translate-x-1 transition-transform" />
                  </Link> */}
                </div>
              </div>

              {/* User Info */}
              <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Your Profile</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-zinc-700 rounded-xl flex items-center justify-center mr-3">
                      <span className="text-lg font-bold text-white">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-dark-400 text-sm">{user?.email}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-dark-600">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-dark-400 text-sm">Role</span>
                      <span className="text-white font-medium">{user?.role}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-dark-400 text-sm">Organization</span>
                      <span className="text-white font-medium">{user?.organization?.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
