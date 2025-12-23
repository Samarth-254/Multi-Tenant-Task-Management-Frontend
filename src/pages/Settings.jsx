import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  User,
  Mail,
  Bell,
  Clock,
  Calendar,
  Save,
  Lock,
  Settings as SettingsIcon,
  CheckCircle,
  Info
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../utils/api';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: ''
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Email notification settings
  const [emailPreferences, setEmailPreferences] = useState({
    enabled: true,
    dailyDigest: {
      enabled: false,
      time: '09:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    taskReminders: {
      enabled: true,
      frequency: 'daily'
    },
    upcomingTasks: {
      enabled: true,
      daysAhead: 3
    }
  });

  // Fetch fresh user data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setFetchingData(true);
      const response = await usersAPI.getProfile();
      const userData = response.data.user;
      
      setProfileData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        department: userData.department || ''
      });

      if (userData.emailNotifications) {
        setEmailPreferences({
          enabled: userData.emailNotifications.enabled ?? true,
          dailyDigest: {
            enabled: userData.emailNotifications.dailyDigest?.enabled ?? false,
            time: userData.emailNotifications.dailyDigest?.time || '09:00',
            timezone: userData.emailNotifications.dailyDigest?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          taskReminders: {
            enabled: userData.emailNotifications.taskReminders?.enabled ?? true,
            frequency: userData.emailNotifications.taskReminders?.frequency || 'daily'
          },
          upcomingTasks: {
            enabled: userData.emailNotifications.upcomingTasks?.enabled ?? true,
            daysAhead: userData.emailNotifications.upcomingTasks?.daysAhead ?? 3
          }
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user settings');
    } finally {
      setFetchingData(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await usersAPI.updateProfile(profileData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await usersAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPreferencesUpdate = async () => {
    setLoading(true);

    try {
      await usersAPI.updateEmailPreferences(emailPreferences);
      toast.success('Email preferences updated successfully!');
      // Refresh user data to get the updated preferences
      await fetchUserProfile();
    } catch (error) {
      console.error('Email preferences update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update email preferences');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Email Notifications', icon: Bell }
  ];

  return (
    <Layout showTopBar={false}>
      <div className="min-h-screen bg-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <SettingsIcon className="w-8 h-8 text-white mr-3" />
              <h1 className="text-3xl font-bold text-white">Settings</h1>
            </div>
            <p className="text-zinc-400">Manage your account preferences and settings</p>
          </div>

          {/* Loading State */}
          {fetchingData ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                <p className="text-zinc-400">Loading settings...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex space-x-1 mb-8 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-white text-black font-medium'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
                  <p className="text-zinc-400 text-sm mb-6">Update your personal information</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      disabled
                      className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700 text-zinc-500 rounded-lg cursor-not-allowed"
                      value={profileData.email}
                    />
                    <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
                      placeholder="+1 (555) 000-0000"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
                      placeholder="Engineering"
                      value={profileData.department}
                      onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                      <div className="flex items-start">
                        <Info className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-zinc-300 font-medium mb-1">Role Information</p>
                          <p className="text-sm text-zinc-400">
                            Current Role: <span className="text-white font-medium">{user?.role}</span>
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            Contact an administrator to change your role
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Change Password</h2>
                  <p className="text-zinc-400 text-sm mb-6">Update your password to keep your account secure</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      New Password *
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
                      placeholder="Enter new password (min. 6 characters)"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-400 font-medium mb-1">Password Requirements</p>
                        <ul className="text-xs text-amber-400/80 space-y-1 list-disc list-inside">
                          <li>Minimum 6 characters</li>
                          <li>Use a unique password you haven't used before</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{loading ? 'Changing...' : 'Change Password'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Email Notifications</h2>
                  <p className="text-zinc-400 text-sm mb-6">Configure how and when you receive email notifications about your tasks</p>
                </div>

                {/* Master Toggle */}
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start">
                      <Mail className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Enable Email Notifications</p>
                        <p className="text-sm text-zinc-400 mt-1">Receive task updates and reminders via email</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={emailPreferences.enabled}
                        onChange={(e) => setEmailPreferences({ ...emailPreferences, enabled: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>

                {emailPreferences.enabled && (
                  <>
                    {/* Daily Digest */}
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-start">
                          <Calendar className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                          <div>
                            <p className="text-white font-medium">Daily Digest</p>
                            <p className="text-sm text-zinc-400 mt-1">Receive a daily summary of your tasks and upcoming deadlines</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={emailPreferences.dailyDigest.enabled}
                            onChange={(e) => setEmailPreferences({
                              ...emailPreferences,
                              dailyDigest: { ...emailPreferences.dailyDigest, enabled: e.target.checked }
                            })}
                          />
                          <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>

                      {emailPreferences.dailyDigest.enabled && (
                        <div className="ml-8 space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                              <Clock className="w-4 h-4 inline mr-1" />
                              Delivery Time
                            </label>
                            <input
                              type="time"
                              className="px-4 py-2 bg-zinc-700 border border-zinc-600 text-white rounded-lg focus:outline-none focus:border-zinc-500"
                              value={emailPreferences.dailyDigest.time}
                              onChange={(e) => setEmailPreferences({
                                ...emailPreferences,
                                dailyDigest: { ...emailPreferences.dailyDigest, time: e.target.value }
                              })}
                            />
                            <p className="text-xs text-zinc-500 mt-1">
                              Timezone: {emailPreferences.dailyDigest.timezone}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Task Reminders */}
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-start">
                          <Bell className="w-5 h-5 text-amber-400 mr-3 mt-0.5" />
                          <div>
                            <p className="text-white font-medium">Task Assignment Notifications</p>
                            <p className="text-sm text-zinc-400 mt-1">Get notified when tasks are assigned to you</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={emailPreferences.taskReminders.enabled}
                            onChange={(e) => setEmailPreferences({
                              ...emailPreferences,
                              taskReminders: { ...emailPreferences.taskReminders, enabled: e.target.checked }
                            })}
                          />
                          <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>

                      {emailPreferences.taskReminders.enabled && (
                        <div className="ml-8">
                          <label className="block text-sm font-medium text-zinc-400 mb-2">
                            Notification Frequency
                          </label>
                          <select
                            className="px-4 py-2 bg-zinc-700 border border-zinc-600 text-white rounded-lg focus:outline-none focus:border-zinc-500"
                            value={emailPreferences.taskReminders.frequency}
                            onChange={(e) => setEmailPreferences({
                              ...emailPreferences,
                              taskReminders: { ...emailPreferences.taskReminders, frequency: e.target.value }
                            })}
                          >
                            <option value="immediate">Immediate</option>
                            <option value="daily">Daily Summary</option>
                            <option value="weekly">Weekly Summary</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Upcoming Tasks */}
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-purple-400 mr-3 mt-0.5" />
                          <div>
                            <p className="text-white font-medium">Upcoming Task Reminders</p>
                            <p className="text-sm text-zinc-400 mt-1">Get notified about tasks approaching their due date</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={emailPreferences.upcomingTasks.enabled}
                            onChange={(e) => setEmailPreferences({
                              ...emailPreferences,
                              upcomingTasks: { ...emailPreferences.upcomingTasks, enabled: e.target.checked }
                            })}
                          />
                          <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                      </div>

                      {emailPreferences.upcomingTasks.enabled && (
                        <div className="ml-8">
                          <label className="block text-sm font-medium text-zinc-400 mb-2">
                            Days Before Due Date
                          </label>
                          <select
                            className="px-4 py-2 bg-zinc-700 border border-zinc-600 text-white rounded-lg focus:outline-none focus:border-zinc-500"
                            value={emailPreferences.upcomingTasks.daysAhead}
                            onChange={(e) => setEmailPreferences({
                              ...emailPreferences,
                              upcomingTasks: { ...emailPreferences.upcomingTasks, daysAhead: parseInt(e.target.value) }
                            })}
                          >
                            <option value="1">1 day before</option>
                            <option value="2">2 days before</option>
                            <option value="3">3 days before</option>
                            <option value="5">5 days before</option>
                            <option value="7">7 days before</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="flex justify-end pt-4 border-t border-zinc-800">
                  <button
                    onClick={handleEmailPreferencesUpdate}
                    disabled={loading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
