import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import InviteModal from '../components/InviteModal';
import { organizationsAPI, invitationsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { UserPlus, Mail, Shield, Users, Crown, Trash2, Search } from 'lucide-react';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { user } = useAuth();
  const { socketService, onlineUsers, isConnected } = useSocket();

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const [usersResponse, invitationsResponse] = await Promise.all([
        organizationsAPI.getUsers(),
        invitationsAPI.getAll()
      ]);
      setUsers(usersResponse.data.users);
      setInvitations(invitationsResponse.data.invitations || []);
    } catch (err) {
      setError('Failed to fetch team data');
      console.error('Error fetching team data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSent = () => {
    fetchTeamData();
  };

  const handleDeleteUser = async (userId) => {
    const userToRemove = users.find(u => u._id === userId);
    const userName = userToRemove ? `${userToRemove.firstName} ${userToRemove.lastName}` : 'this user';

    if (window.confirm(`Are you sure you want to remove ${userName} from the organization? This action cannot be undone.`)) {
      try {
        setError(''); // Clear any previous errors
        setSuccessMessage(''); // Clear any previous success messages
        await organizationsAPI.removeUser(userId);
        fetchTeamData();
        // Show success message briefly
        setSuccessMessage(`${userName} has been successfully removed from the organization.`);
        setTimeout(() => setSuccessMessage(''), 5000); // Clear success message after 5 seconds
      } catch (err) {
        console.error('Remove user error:', err);
        setSuccessMessage(''); // Clear any success messages

        // Handle specific error messages from the backend
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.response?.status === 403) {
          setError('You do not have permission to remove this user.');
        } else if (err.response?.status === 400) {
          setError('Cannot remove this user. They may have active tasks assigned or be the last admin.');
        } else {
          setError('Failed to remove user. Please try again.');
        }
      }
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    if (window.confirm('Are you sure you want to cancel this invitation?')) {
      try {
        await invitationsAPI.cancel(invitationId);
        fetchTeamData();
      } catch (err) {
        setError('Failed to cancel invitation');
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Manager':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Member':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin':
        return <Crown className="w-4 h-4 text-red-400" />;
      case 'Manager':
        return <Shield className="w-4 h-4 text-amber-400" />;
      case 'Member':
        return <Users className="w-4 h-4 text-emerald-400" />;
      default:
        return <Users className="w-4 h-4 text-zinc-400" />;
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.some(onlineUser => onlineUser.userId === userId);
  };

  const getOnlineCount = () => {
    return users.filter(user => isUserOnline(user._id)).length;
  };

  // Filter users based on search query and role filter, and exclude inactive users
  const filteredUsers = users.filter(member => {
    const matchesSearch = searchQuery === '' || 
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === '' || member.role === roleFilter;
    const isActive = member.isActive !== false; // Only show active users
    return matchesSearch && matchesRole && isActive;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('');
  };

  if (loading) {
    return (
      <Layout showTopBar={false}>
        <div className="h-screen bg-black flex items-center justify-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-zinc-700"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent absolute top-0 left-0"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showTopBar={false}>
      <div className="h-screen bg-black flex flex-col overflow-hidden">
        {/* Compact Header */}
        <div className="flex-none px-6 py-4 border-b border-zinc-800/50">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Title */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white">Team Members</h1>
            </div>

            {/* Right: Search, Filters, and Invite */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className={`flex items-center transition-all duration-300 ease-in-out ${isSearchExpanded ? 'w-64 bg-zinc-900 border border-zinc-800' : 'w-10 bg-zinc-900 border border-zinc-800'} rounded-lg overflow-hidden`}>
                <button 
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className="p-2 text-zinc-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <Search className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  placeholder="Search members..."
                  className={`w-full bg-transparent border-none text-white placeholder-zinc-500 focus:ring-0 text-sm outline-none pr-2 ${isSearchExpanded ? 'opacity-100' : 'opacity-0 w-0 px-0'}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Role Filter */}
              <select
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-700 hover:border-zinc-700 transition-colors"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Member">Member</option>
              </select>

              {/* Clear Filters */}
              {(searchQuery || roleFilter) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}

              {/* Invite Button */}
              {(user?.role === 'Admin' || user?.role === 'Manager') && (
                <button
                  type="button"
                  onClick={() => setShowInviteModal(true)}
                  className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Invite</span>
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

          {/* Success Message */}
          {successMessage && (
            <div className="mt-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {successMessage}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex gap-6 px-6 py-6 overflow-x-auto">
            {/* Stats Column */}
            <div className="w-72 flex-shrink-0 flex flex-col gap-4">
              {/* Total Members */}
              <div className="bg-zinc-900/30 rounded-xl border border-zinc-800/50 p-4 hover:border-zinc-700/50 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-800 rounded-xl">
                    <Users className="w-5 h-5 text-zinc-300" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Members</p>
                    <p className="text-2xl font-bold text-white">{users.length}</p>
                  </div>
                </div>
              </div>

              {/* Admins */}
              <div className="bg-zinc-900/30 rounded-xl border border-zinc-800/50 p-4 hover:border-red-500/30 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/10 rounded-xl">
                    <Crown className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Admins</p>
                    <p className="text-2xl font-bold text-white">
                      {users.filter(u => u.role === 'Admin').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Managers */}
              <div className="bg-zinc-900/30 rounded-xl border border-zinc-800/50 p-4 hover:border-amber-500/30 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl">
                    <Shield className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Managers</p>
                    <p className="text-2xl font-bold text-white">
                      {users.filter(u => u.role === 'Manager').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Online Now */}
              <div className="bg-zinc-900/30 rounded-xl border border-zinc-800/50 p-4 hover:border-emerald-500/30 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl relative">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Online Now</p>
                    <p className="text-2xl font-bold text-white">{getOnlineCount()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members Grid */}
            <div className="flex-1 bg-zinc-900/30 rounded-xl border border-zinc-800/50 backdrop-blur-sm overflow-hidden flex flex-col">
              {/* Column Header */}
              <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-500" />
                  <h3 className="font-semibold text-zinc-300 text-sm uppercase tracking-wider">
                    Team Directory
                  </h3>
                  <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">
                    {filteredUsers.length}
                  </span>
                </div>
              </div>

              {/* Members List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {filteredUsers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-sm border-2 border-dashed border-zinc-800/50 rounded-lg m-2 min-h-[200px]">
                    <Users className="w-12 h-12 text-zinc-700 mb-3" />
                    <p className="text-zinc-400 font-medium">No team members found</p>
                    <p className="text-xs text-zinc-600 mt-1">Try adjusting your filters</p>
                    {(user?.role === 'Admin' || user?.role === 'Manager') && users.length === 0 && (
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-medium rounded-lg text-sm hover:bg-zinc-200 transition-all duration-200"
                      >
                        <UserPlus className="w-4 h-4" />
                        Invite First Member
                      </button>
                    )}
                  </div>
                ) : (
                  filteredUsers.map((member) => (
                    <div
                      key={member._id}
                      className="bg-zinc-800/50 rounded-xl p-4 hover:bg-zinc-800/80 transition-all duration-200 border border-zinc-700/30 hover:border-zinc-600/50"
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-xl bg-zinc-700 flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">
                              {member.firstName?.[0]}{member.lastName?.[0]}
                            </span>
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-800 ${
                            isUserOnline(member._id) ? 'bg-emerald-400' :
                            member.isActive ? 'bg-amber-400' : 'bg-zinc-500'
                          }`}></div>
                        </div>

                        {/* Member Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white text-base truncate">
                              {member.firstName} {member.lastName}
                            </h3>
                            {getRoleIcon(member.role)}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getRoleColor(member.role)}`}>
                              {member.role}
                            </span>
                          </div>
                          <p className="text-zinc-400 truncate text-sm">
                            {member.email}
                          </p>
                          {member.department && (
                            <p className="text-xs text-zinc-500 truncate mt-0.5">
                              {member.department}
                            </p>
                          )}
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          {/* Status */}
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            isUserOnline(member._id)
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : member.isActive
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              isUserOnline(member._id) ? 'bg-emerald-400' :
                              member.isActive ? 'bg-amber-400' : 'bg-zinc-500'
                            }`}></div>
                            {isUserOnline(member._id) ? 'Online' :
                             member.isActive ? 'Offline' : 'Inactive'}
                          </div>

                          {/* Delete Action */}
                          {(user?.role === 'Admin' || (user?.role === 'Manager' && member.role === 'Member')) && member._id !== user._id && (
                            <button
                              onClick={() => handleDeleteUser(member._id)}
                              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                              title={`Remove ${member.firstName} from organization`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInviteSent={handleInviteSent}
      />
    </Layout>
  );
};

export default Team;