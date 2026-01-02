import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Plus,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Target,
  Users,
  ArrowRight,
  Activity,
  Briefcase,
  ChevronRight,
  Bell,
  TrendingDown,
  Award,
  Flame,
  Settings
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, organizationsAPI } from '../utils/api';
import { useSocket } from '../context/SocketContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    todoTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    avgCompletionTime: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [allOrgTasks, setAllOrgTasks] = useState([]); // For top performers calculation
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    weeklyProgress: [],
    tasksByPriority: [],
    tasksByStatus: [],
    productivityTrend: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch tasks - All users see only their own tasks for stats
      const queryParams = { limit: 1000, assignedTo: user._id };
      const tasksResponse = await tasksAPI.getTasks(queryParams);
      const tasks = tasksResponse.data.tasks || [];
      setAllTasks(tasks);
      setRecentTasks(tasks.slice(0, 5));

      // Fetch ALL organization tasks for top performers (visible to everyone)
      const allTasksResponse = await tasksAPI.getTasks({ limit: 1000, forStats: true });
      const orgTasks = allTasksResponse.data.tasks || [];
      setAllOrgTasks(orgTasks);

      // Fetch team members
      try {
        const teamResponse = await organizationsAPI.getUsers();
        setTeamMembers(teamResponse.data.users || []);
      } catch (err) {
        console.error('Error fetching team:', err);
      }

      // Calculate comprehensive stats
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'Completed').length;
      const active = tasks.filter(t => t.status === 'In Progress').length;
      const todo = tasks.filter(t => t.status === 'Todo').length;
      const overdue = tasks.filter(t =>
        t.status === 'Expired' ||
        (new Date(t.dueDate) < new Date() && t.status !== 'Completed')
      ).length;
      
      const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
      
      // Calculate average completion time
      const completedTasksWithTime = tasks.filter(t => 
        t.status === 'Completed' && t.createdAt && t.updatedAt
      );
      const avgTime = completedTasksWithTime.length > 0
        ? completedTasksWithTime.reduce((acc, t) => {
            const diff = new Date(t.updatedAt) - new Date(t.createdAt);
            return acc + diff;
          }, 0) / completedTasksWithTime.length / (1000 * 60 * 60 * 24)
        : 0;

      setStats({
        totalTasks: total,
        completedTasks: completed,
        activeTasks: active,
        todoTasks: todo,
        overdueTasks: overdue,
        completionRate: parseFloat(completionRate),
        avgCompletionTime: avgTime.toFixed(1)
      });

      // Generate chart data
      generateChartData(tasks);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (tasks) => {
    // Weekly Progress (last 7 days)
    const weekDays = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    const weeklyProgress = weekDays.map(day => {
      const dayStr = format(day, 'MMM dd');
      const completedOnDay = tasks.filter(t => 
        t.status === 'Completed' && 
        t.updatedAt &&
        format(new Date(t.updatedAt), 'MMM dd') === dayStr
      ).length;
      const createdOnDay = tasks.filter(t => 
        format(new Date(t.createdAt), 'MMM dd') === dayStr
      ).length;
      
      return {
        date: dayStr,
        completed: completedOnDay,
        created: createdOnDay
      };
    });

    // Tasks by Priority
    const tasksByPriority = [
      { name: 'High', value: tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length, color: '#ef4444' },
      { name: 'Medium', value: tasks.filter(t => t.priority === 'Medium' && t.status !== 'Completed').length, color: '#f59e0b' },
      { name: 'Low', value: tasks.filter(t => t.priority === 'Low' && t.status !== 'Completed').length, color: '#10b981' }
    ];

    // Tasks by Status
    const tasksByStatus = [
      { name: 'Todo', value: tasks.filter(t => t.status === 'Todo').length, color: '#6b7280' },
      { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: '#3b82f6' },
      { name: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, color: '#10b981' },
      { name: 'Expired', value: tasks.filter(t => t.status === 'Expired').length, color: '#ef4444' }
    ];

    // Productivity Trend (task completion rate over time)
    const last14Days = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date()
    });

    const productivityTrend = last14Days.map(day => {
      const dayStr = format(day, 'MM/dd');
      const completedByDay = tasks.filter(t => 
        t.status === 'Completed' && 
        t.updatedAt &&
        new Date(t.updatedAt) <= day
      ).length;
      const totalByDay = tasks.filter(t => 
        new Date(t.createdAt) <= day
      ).length;
      
      return {
        date: dayStr,
        rate: totalByDay > 0 ? parseFloat(((completedByDay / totalByDay) * 100).toFixed(0)) : 0
      };
    });

    setChartData({
      weeklyProgress,
      tasksByPriority,
      tasksByStatus,
      productivityTrend
    });
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-xl">
          <p className="text-zinc-300 text-sm font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get top performers - visible to all users
  const topPerformers = teamMembers
    .map(member => {
      const memberTasks = allOrgTasks.filter(t => 
        (t.assignedTo?._id === member._id || t.assignedTo?.id === member._id) &&
        t.status === 'Completed'
      );
      return {
        ...member,
        completedTasks: memberTasks.length
      };
    })
    .sort((a, b) => b.completedTasks - a.completedTasks)
    .slice(0, 5);

  return (
    <Layout showNotification={true} onlineCount={onlineUsers.length}>
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header Section */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl sm:text-3xl font-bold text-white">
                {getGreeting()}, {user?.firstName}! 👋
              </h1>
              <p className="text-zinc-400 text-xs sm:text-base">
                Here's your productivity overview
              </p>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            {/* Total Tasks */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 sm:p-6 hover:border-zinc-700 transition-all duration-300">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg">
                  <Briefcase className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <span className="text-[10px] sm:text-xs text-zinc-500 font-medium">ALL TIME</span>
              </div>
              <div>
                <p className="text-xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1">
                  {loading ? '...' : stats.totalTasks}
                </p>
                <p className="text-zinc-400 text-xs sm:text-sm">Total Tasks</p>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 sm:p-6 hover:border-zinc-700 transition-all duration-300">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-green-500/10 rounded-lg">
                  <Award className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" />
                </div>
                <span className="text-[10px] sm:text-xs text-zinc-500 font-medium">SUCCESS</span>
              </div>
              <div>
                <p className="text-xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1">
                  {loading ? '...' : `${stats.completionRate}%`}
                </p>
                <p className="text-zinc-400 text-xs sm:text-sm">Completion Rate</p>
              </div>
            </div>

            {/* Active Tasks */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 sm:p-6 hover:border-zinc-700 transition-all duration-300">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-amber-500/10 rounded-lg">
                  <Flame className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400" />
                </div>
                <span className="text-[10px] sm:text-xs text-zinc-500 font-medium">ACTIVE</span>
              </div>
              <div>
                <p className="text-xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1">
                  {loading ? '...' : stats.activeTasks}
                </p>
                <p className="text-zinc-400 text-xs sm:text-sm">Active Tasks</p>
              </div>
            </div>

            {/* Avg Completion Time */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 sm:p-6 hover:border-zinc-700 transition-all duration-300">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-purple-500/10 rounded-lg">
                  <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400" />
                </div>
                <span className="text-[10px] sm:text-xs text-zinc-500 font-medium">AVG</span>
              </div>
              <div>
                <p className="text-xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1">
                  {loading ? '...' : `${stats.avgCompletionTime}d`}
                </p>
                <p className="text-zinc-400 text-xs sm:text-sm">Avg. Completion</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Weekly Progress Chart */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-white">Weekly Activity</h3>
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData.weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '10px' }} />
                  <YAxis stroke="#71717a" style={{ fontSize: '10px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px', color: '#a1a1aa' }} />
                  <Bar dataKey="created" fill="#3b82f6" name="Created" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Productivity Trend */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-white">Productivity Trend</h3>
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData.productivityTrend}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '10px' }} />
                  <YAxis stroke="#71717a" style={{ fontSize: '10px' }} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorRate)"
                    name="Completion Rate"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Tasks by Priority */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">Active by Priority</h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={chartData.tasksByPriority}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.tasksByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                {chartData.tasksByPriority.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      <span className="text-zinc-400">{item.name}</span>
                    </div>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks by Status */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={chartData.tasksByStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={(entry) => entry.value > 0 ? entry.value : ''}
                  >
                    {chartData.tasksByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                {chartData.tasksByStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      <span className="text-zinc-400">{item.name}</span>
                    </div>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-white">Top Performers</h3>
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" />
              </div>
              <div className="space-y-3 sm:space-y-4">
                {loading ? (
                  <div className="text-center py-6 sm:py-8 text-zinc-500 text-sm">Loading...</div>
                ) : topPerformers.length > 0 ? (
                  topPerformers.map((member, index) => (
                    <div key={member._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-white text-xs sm:text-sm font-medium">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-zinc-500 text-[10px] sm:text-xs">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <span className="text-green-400 font-bold text-sm sm:text-base">{member.completedTasks}</span>
                        {index === 0 && <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8 text-zinc-500 text-sm">No data yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Recent Tasks */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Recent Tasks</h2>
                <Link
                  to="/tasks"
                  className="flex items-center text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium transition-colors"
                >
                  View all <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3 sm:space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-14 sm:h-16 bg-zinc-800 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : recentTasks.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {recentTasks.map((task) => (
                    <div key={task._id} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 sm:p-4 hover:border-zinc-600 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium text-sm sm:text-base mb-1.5 sm:mb-2 truncate">{task.title}</h3>
                          <div className="flex items-center flex-wrap gap-2 sm:space-x-3 text-xs sm:text-sm">
                            <span className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                            {task.dueDate && (
                              <span className="text-zinc-400 flex items-center text-[10px] sm:text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-500" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-400">No tasks yet. Create your first task!</p>
                  <Link
                    to="/tasks"
                    className="inline-flex items-center mt-3 sm:mt-4 px-3 sm:px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions & Info */}
            <div className="space-y-4 sm:space-y-6">
              {/* Quick Actions */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Quick Actions</h2>
                <div className="space-y-2 sm:space-y-3">
                  <Link
                    to="/tasks?action=create"
                    className="flex items-center justify-between p-2.5 sm:p-3 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="p-1.5 sm:p-2 bg-zinc-700 rounded-lg mr-2 sm:mr-3">
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <span className="text-white font-medium text-sm">New Task</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/team"
                    className="flex items-center justify-between p-2.5 sm:p-3 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg mr-2 sm:mr-3">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                      </div>
                      <span className="text-white font-medium text-sm">Team</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/settings"
                    className="flex items-center justify-between p-2.5 sm:p-3 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg mr-2 sm:mr-3">
                        <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                      </div>
                      <span className="text-white font-medium text-sm">Settings</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Your Profile</h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center">
                    {user?.profilePicture ? (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden mr-2.5 sm:mr-3">
                        <img src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-700 rounded-xl flex items-center justify-center mr-2.5 sm:mr-3">
                        <span className="text-base sm:text-lg font-bold text-white">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium text-sm sm:text-base truncate">{user?.firstName} {user?.lastName}</p>
                      <p className="text-zinc-400 text-xs sm:text-sm truncate">{user?.email}</p>
                    </div>
                  </div>

                  <div className="pt-3 sm:pt-4 border-t border-zinc-800">
                    <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                      <span className="text-zinc-400 text-xs sm:text-sm">Role</span>
                      <span className="text-white font-medium text-xs sm:text-sm">{user?.role}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs sm:text-sm">Status</span>
                      <span className="inline-flex items-center text-green-400 text-xs sm:text-sm">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mr-1.5 sm:mr-2"></div>
                        Active
                      </span>
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
