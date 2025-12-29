import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  Circle,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Play,
  Flag,
  Clock
} from 'lucide-react';

const TaskCard = ({ task, onUpdate, onDelete, onView, onEdit, userRole, currentUser, draggable, onDragStart }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const menuRef = useRef(null);
  const statusMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target)) {
        setShowStatusMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-900/40';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/50';
      case 'Low': return 'text-green-400 bg-green-900/40';
      default: return 'text-zinc-400 bg-zinc-800/50';
    }
  };

  const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0 && task.status !== 'Completed';

  const handleStatusChange = (newStatus) => {
    onUpdate(task._id, { status: newStatus });
    setShowMenu(false);
    setShowStatusMenu(false);
  };

  // Role-based permissions
  const isAdmin = userRole === 'Admin';
  const isManager = userRole === 'Manager';
  const isMember = userRole === 'Member';
  const currentUserId = currentUser?._id || currentUser?.id;
  const isAssignedUser = task.assignedTo?._id === currentUserId;

  const canUpdateStatus = (isAdmin || isManager) || (isMember && isAssignedUser);
  const canManageTask = isAdmin || isManager;

  // Get full name
  const getUserName = () => {
    const firstName = task.assignedTo?.firstName || '';
    const lastName = task.assignedTo?.lastName || '';
    return `${firstName} ${lastName}`.trim();
  };

  return (
    <div 
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={() => onView(task)}
      className={`relative bg-zinc-900/90 backdrop-blur-sm rounded-xl p-3 md:p-4 hover:bg-zinc-900 transition-all duration-200 cursor-pointer group ${isOverdue ? 'border border-red-900/50' : ''}`}
    >
      {/* Overdue Badge (if present) */}
      {isOverdue && (
        <div className="flex justify-start mb-1.5 md:mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[10px] md:text-xs font-semibold bg-red-900/60 text-red-300 border border-red-800/50">
            <AlertTriangle className="w-2.5 h-2.5 md:w-3 md:h-3" />
            OVERDUE
          </span>
        </div>
      )}

      {/* Title and Priority in same row */}
      <div className="flex items-start justify-between gap-2 md:gap-3 mb-2 md:mb-2.5">
        <h3 className="text-white font-semibold text-sm md:text-base leading-tight group-hover:text-zinc-50 transition-colors flex-1 line-clamp-2">
          {task.title}
        </h3>
        <span className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[10px] md:text-xs font-semibold flex-shrink-0 ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-zinc-400 text-[10px] md:text-xs leading-relaxed mb-3 md:mb-4 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 md:gap-3 pt-1.5 md:pt-2">
        {/* User Name - No Avatar */}
        <span className="text-zinc-300 text-[10px] md:text-xs font-medium truncate">
          {getUserName()}
        </span>

        {/* Due Date */}
        <div className="flex items-center gap-1 text-zinc-400 flex-shrink-0">
          <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
          <span className="text-[10px] md:text-xs font-medium">
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
