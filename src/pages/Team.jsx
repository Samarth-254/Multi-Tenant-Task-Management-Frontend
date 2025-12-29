import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import InviteModal from '../components/InviteModal';
import TaskReassignmentModal from '../components/TaskReassignmentModal';
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
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
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
    toast.success('Invitation sent successfully!');
  };

  const handleDeleteUser = async (userId) => {
    const userToRemove = users.find(u => u._id === userId);
    const userName = userToRemove ? `${userToRemove.firstName} ${userToRemove.lastName}` : 'this user';

    // Open reassignment modal
    setUserToDelete({ id: userId, name: userName });
    setShowReassignModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setError('');
      setSuccessMessage('');
      await organizationsAPI.removeUser(userToDelete.id);
      fetchTeamData();
      const successMsg = `${userToDelete.name} has been successfully removed from the organization.`;
      setSuccessMessage(successMsg);
      toast.success(successMsg);
      setTimeout(() => setSuccessMessage(''), 5000);
      setShowReassignModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Remove user error:', err);
      setSuccessMessage('');

      let errorMsg = 'Failed to remove user. Please try again.';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.status === 403) {
        errorMsg = 'You do not have permission to remove this user.';
      } else if (err.response?.status === 400) {
        errorMsg = 'Cannot remove this user. They may be the last admin.';
      }
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    if (window.confirm('Are you sure you want to cancel this invitation?')) {
      try {
        await invitationsAPI.cancel(invitationId);
        toast.success('Invitation cancelled successfully!');
        fetchTeamData();
      } catch (err) {
        const errorMsg = 'Failed to cancel invitation';
        setError(errorMsg);
        toast.error(errorMsg);
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

  // Filter users based on search query and role filter
  const filteredUsers = users.filter(member => {
    const matchesSearch = searchQuery === '' || 
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === '' || member.role === roleFilter;
    return matchesSearch && matchesRole;
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
        {/* Mobile Header */}
        <div className="md:hidden flex-none px-3 py-3 border-b border-zinc-800/50">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-white">Team</h1>
            {(user?.role === 'Admin' || user?.role === 'Manager') && (
              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite</span>
              </button>
            )}
          </div>
          
          {/* Mobile Controls */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {/* Search */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex-shrink-0 w-40">
              <div className="p-2 text-zinc-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-transparent border-none text-white placeholder-zinc-500 focus:ring-0 text-xs outline-none pr-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <select
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none flex-shrink-0"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Member">Member</option>
            </select>

            {/* Clear */}
            {(searchQuery || roleFilter) && (
              <button
                onClick={clearFilters}
                className="px-2 py-1.5 text-xs text-zinc-500 hover:text-white transition-colors flex-shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block flex-none px-6 py-4 border-b border-zinc-800/50">
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
          <div className="h-full flex flex-col md:flex-row gap-4 md:gap-6 px-3 md:px-6 py-4 md:py-6 overflow-y-auto md:overflow-x-auto">
            {/* Stats Row (Mobile) / Column (Desktop) */}
            <div className="flex md:flex-col gap-3 md:gap-4 md:w-72 flex-shrink-0 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
              {/* Total Members */}
              <div className="bg-zinc-900/30 rounded-xl border border-zinc-800/50 p-3 md:p-4 hover:border-zinc-700/50 transition-all duration-300 min-w-[130px] md:min-w-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-2 md:p-2.5 bg-zinc-800 rounded-xl">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-zinc-300" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs font-medium text-zinc-500 uppercase tracking-wider">Members</p>
                    <p className="text-xl md:text-2xl font-bold text-white">{users.length}</p>
                  </div>
                </div>
              </div>

              {/* Admins */}
              <div className="bg-zinc-900/30 rounded-xl border border-zinc-800/50 p-3 md:p-4 hover:border-red-500/30 transition-all duration-300 min-w-[130px] md:min-w-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-2 md:p-2.5 bg-red-500/10 rounded-xl">
                    <Crown className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs font-medium text-zinc-500 uppercase tracking-wider">Admins</p>
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {users.filter(u => u.role === 'Admin').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Managers */}
              <div className="bg-zinc-900/30 rounded-xl border border-zinc-800/50 p-3 md:p-4 hover:border-amber-500/30 transition-all duration-300 min-w-[130px] md:min-w-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-2 md:p-2.5 bg-amber-500/10 rounded-xl">
                    <Shield className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs font-medium text-zinc-500 uppercase tracking-wider">Managers</p>
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {users.filter(u => u.role === 'Manager').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Online Now */}
              <div className="bg-zinc-900/30 rounded-xl border border-zinc-800/50 p-3 md:p-4 hover:border-emerald-500/30 transition-all duration-300 min-w-[130px] md:min-w-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-2 md:p-2.5 bg-emerald-500/10 rounded-xl relative">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs font-medium text-zinc-500 uppercase tracking-wider">Online</p>
                    <p className="text-xl md:text-2xl font-bold text-white">{getOnlineCount()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members Grid */}
            <div className="flex-1 bg-zinc-900/30 rounded-xl border border-zinc-800/50 backdrop-blur-sm overflow-hidden flex flex-col min-h-[300px]">
              {/* Column Header */}
              <div className="p-3 md:p-4 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-500" />
                  <h3 className="font-semibold text-zinc-300 text-xs md:text-sm uppercase tracking-wider">
                    Team Directory
                  </h3>
                  <span className="bg-zinc-800 text-zinc-400 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full">
                    {filteredUsers.length}
                  </span>
                </div>
              </div>

              {/* Members List */}
              <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 md:space-y-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {filteredUsers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-sm border-2 border-dashed border-zinc-800/50 rounded-lg m-2 min-h-[150px] md:min-h-[200px]">
                    <Users className="w-10 h-10 md:w-12 md:h-12 text-zinc-700 mb-2 md:mb-3" />
                    <p className="text-zinc-400 font-medium text-sm">No team members found</p>
                    <p className="text-[10px] md:text-xs text-zinc-600 mt-1">Try adjusting your filters</p>
                    {(user?.role === 'Admin' || user?.role === 'Manager') && users.length === 0 && (
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="mt-3 md:mt-4 inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white text-black font-medium rounded-lg text-xs md:text-sm hover:bg-zinc-200 transition-all duration-200"
                      >
                        <UserPlus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Invite First Member
                      </button>
                    )}
                  </div>
                ) : (
                  filteredUsers.map((member) => (
                    <div
                      key={member._id}
                      className="bg-zinc-800/50 rounded-xl p-3 md:p-4 hover:bg-zinc-800/80 transition-all duration-200 border border-zinc-700/30 hover:border-zinc-600/50"
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-zinc-700 flex items-center justify-center">
                            <span className="text-xs md:text-sm font-semibold text-white">
                              {member.firstName?.[0]}{member.lastName?.[0]}
                            </span>
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-zinc-800 ${
                            isUserOnline(member._id) ? 'bg-emerald-400' :
                            member.isActive ? 'bg-amber-400' : 'bg-zinc-500'
                          }`}></div>
                        </div>

                        {/* Member Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                            <h3 className="font-semibold text-white text-sm md:text-base truncate">
                              {member.firstName} {member.lastName}
                            </h3>
                            <span className="hidden sm:inline-flex">{getRoleIcon(member.role)}</span>
                            <span className={`inline-flex items-center px-1.5 md:px-2 py-0.5 rounded text-[10px] md:text-xs font-medium border ${getRoleColor(member.role)}`}>
                              {member.role}
                            </span>
                          </div>
                          <p className="text-zinc-400 truncate text-xs md:text-sm">
                            {member.email}
                          </p>
                          {member.department && (
                            <p className="text-[10px] md:text-xs text-zinc-500 truncate mt-0.5">
                              {member.department}
                            </p>
                          )}
                        </div>

                        {/* Status & Actions */}
                        <div className="hidden sm:flex items-center gap-3 md:gap-4 flex-shrink-0">
                          {/* Status */}
                          <div className={`inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg text-[10px] md:text-xs font-medium ${
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

      <TaskReassignmentModal
        isOpen={showReassignModal}
        onClose={() => {
          setShowReassignModal(false);
          setUserToDelete(null);
        }}
        userId={userToDelete?.id}
        userName={userToDelete?.name}
        onReassign={handleConfirmDelete}
      />
    </Layout>
  );
};

export default Team;