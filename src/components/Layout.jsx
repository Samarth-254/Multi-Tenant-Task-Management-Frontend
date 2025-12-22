import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import ConnectionStatus from './ConnectionStatus';
import WebSocketDebug from './WebSocketDebug';
import {
  Home,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Layout = ({ children, showNotification = false, showTopBar = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Tasks', href: '/tasks', icon: ClipboardList },
    { name: 'Team', href: '/team', icon: Users },
  ];

  if (user?.role === 'Admin') {
    navigation.push({ name: 'Settings', href: '/settings', icon: Settings });
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="h-screen flex overflow-hidden bg-dark-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full glass-effect">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 text-white hover:bg-white/10 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  TaskFlow
                </h1>
              </div>
            </div>
            <nav className="px-3 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-gradient-to-r from-primary-600/20 to-accent-600/20 text-primary-300 border-r-2 border-primary-500'
                        : 'text-dark-300 hover:bg-dark-700/50 hover:text-dark-100'
                    } group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-400' : 'text-dark-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-dark-800/50 backdrop-blur-xl border-r border-dark-700/50">
            <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">T</span>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                    TaskFlow
                  </h1>
                </div>
              </div>
              <nav className="flex-1 px-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive
                          ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-white border border-primary-500/30 shadow-lg'
                          : 'text-dark-300 hover:bg-dark-700/50 hover:text-white border border-transparent'
                      } group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-400' : 'text-dark-400 group-hover:text-dark-200'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 border-t border-dark-700/50 p-4">
              <div className="bg-dark-700/30 rounded-xl p-3 border border-dark-600/50">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-primary-400 font-medium">{user?.role}</p>
                    <p className="text-xs text-dark-400 truncate">{user?.organization?.name}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex-shrink-0 p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 border border-transparent hover:border-red-500/20"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden bg-dark-900">
        {/* Top header - conditionally rendered */}
        {showTopBar && (
          <div className="bg-dark-900 border-b border-dark-700/50 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  className="md:hidden -ml-0.5 -mt-0.5 h-10 w-10 inline-flex items-center justify-center rounded-xl text-dark-400 hover:text-white hover:bg-dark-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all duration-200"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                {showNotification && <NotificationDropdown />}

                {/* User menu for mobile */}
                <div className="md:hidden flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 border border-transparent hover:border-red-500/20"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-dark-900">
          {children}
        </main>
      </div>

      {/* Connection Status Indicator */}
      <ConnectionStatus />

      {/* WebSocket Debug Panel (Development) */}
      {/* {import.meta.env.DEV && <WebSocketDebug />} */}
    </div>
  );
};

export default Layout;
