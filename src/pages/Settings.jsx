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
import AvatarSelector from '../components/AvatarSelector';

const Settings = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    profilePicture: ''
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
      timezone: 'Asia/Kolkata' // IST timezone
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

  // Sync profileData with user context when user changes
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        profilePicture: user.profilePicture || ''
      }));
    }
  }, [user]);

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
        profilePicture: userData.profilePicture || ''
      });

      if (userData.emailNotifications) {
        setEmailPreferences({
          enabled: userData.emailNotifications.enabled ?? true,
          dailyDigest: {
            enabled: userData.emailNotifications.dailyDigest?.enabled ?? false,
            time: userData.emailNotifications.dailyDigest?.time || '09:00',
            timezone: 'Asia/Kolkata' // Always use IST
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
      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber,
        profilePicture: profileData.profilePicture
      };
      const response = await usersAPI.updateProfile(updateData);
      
      // Update user in context
      updateUser(response.data.user);
      
      // Force refresh from server
      await refreshUser();
      
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
        <div className="flex flex-col md:flex-row">
          {/* Mobile Tab Selector */}
          <div className="md:hidden border-b border-zinc-800 p-4">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="profile">Profile details</option>
              <option value="password">Password</option>
              <option value="notifications">Email Notifications</option>
            </select>
          </div>

          {/* Desktop Left Sidebar Navigation */}
          <div className="hidden md:block md:w-64 border-r border-zinc-800 min-h-screen p-6">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'profile'
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5" />
                  <span>Profile details</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'password'
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5" />
                  <span>Password</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5" />
                  <span>Email Notifications</span>
                </div>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-4 md:p-8">
            {fetchingData ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                <p className="text-zinc-400">Loading settings...</p>
              </div>
            ) : (
              <div className="max-w-4xl">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-8">
                {/* Profile Photo Section */}
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Profile Photo</h2>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-8">
                    <AvatarSelector
                      currentAvatar={profileData.profilePicture}
                      onSelect={(avatarUrl) => setProfileData({ ...profileData, profilePicture: avatarUrl })}
                    />
                  </div>
                </div>

                {/* Personal Details Section */}
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Personal details</h2>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-8 space-y-6">
                    {/* Row 1: Name and Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                          value={`${profileData.firstName} ${profileData.lastName}`}
                          onChange={(e) => {
                            const names = e.target.value.split(' ');
                            setProfileData({ 
                              ...profileData, 
                              firstName: names[0] || '',
                              lastName: names.slice(1).join(' ') || ''
                            });
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">
                          Email ID
                        </label>
                        <input
                          type="email"
                          disabled
                          className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 text-zinc-400 rounded-lg cursor-not-allowed"
                          value={profileData.email}
                        />
                      </div>
                    </div>

                    {/* Row 2: Mobile Number and Role */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">
                          Mobile Number
                        </label>
                        <div className="flex gap-2">
                          <div className="w-20 px-3 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg flex items-center justify-center">
                            +91
                          </div>
                          <input
                            type="tel"
                            className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="98765 43210"
                            maxLength="10"
                            pattern="[0-9]{10}"
                            value={profileData.phoneNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              setProfileData({ ...profileData, phoneNumber: value });
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">
                          Role
                        </label>
                        <div className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center">
                          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded text-sm font-medium border border-blue-500/20">
                            {user?.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 bg-white hover:bg-gray-100 disabled:bg-gray-300 text-black rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-4">Change Password</h2>
                  <p className="text-zinc-400 text-sm mb-4 md:mb-6">Update your password to keep your account secure</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-8 space-y-4">
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
                    className="btn-primary flex items-center justify-center space-x-2 w-full md:w-auto"
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
                              Timezone: IST (Indian Standard Time)
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
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
