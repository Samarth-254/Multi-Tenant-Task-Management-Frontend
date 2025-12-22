import React from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Flag,
  Tag,
  MessageSquare,
  Timer,
  Target,
  Users,
  CheckCircle,
  Circle,
  Play,
  AlertTriangle
} from 'lucide-react';

const TaskDetailModal = ({ isOpen, onClose, task }) => {
  if (!isOpen || !task) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-900/40';
      case 'Medium': return 'text-yellow-500 bg-yellow-900/50';
      case 'Low': return 'text-green-400 bg-green-900/40';
      default: return 'text-zinc-400 bg-zinc-800/50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-400 bg-green-900/40';
      case 'In Progress': return 'text-blue-400 bg-blue-900/40';
      case 'Expired': return 'text-red-400 bg-red-900/40';
      default: return 'text-zinc-400 bg-zinc-800/50';
    }
  };

  const getCategoryColor = () => {
    return 'text-purple-400 bg-purple-900/40';
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed' && task.status !== 'Expired';
  const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-800/50">
          <h2 className="text-lg font-semibold text-zinc-400">Task Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400 hover:text-white" />
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="flex">
          {/* Left Column - Main Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Title */}
            <h1 className="text-3xl font-bold text-white leading-tight">
              {task.title}
            </h1>

            {/* Badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              
              <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              
              {task.category && (
                <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${getCategoryColor()}`}>
                  {task.category}
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-3">Description</h3>
              <p className="text-zinc-300 leading-relaxed text-base">
                {task.description}
              </p>
            </div>
          </div>

          {/* Right Column - Sidebar with thin border separator */}
          <div className="w-80 border-l border-zinc-800 p-6 space-y-6">
            {/* Assigned To */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-400 mb-3">Assigned To</h4>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                  {task.assignedTo?.profilePicture ? (
                    <img 
                      src={task.assignedTo.profilePicture} 
                      alt={`${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {task.assignedTo?.firstName?.[0]}{task.assignedTo?.lastName?.[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    {task.assignedTo?.firstName} {task.assignedTo?.lastName}
                  </p>
                </div>
              </div>
            </div>

            {/* Reporter */}
            {task.createdBy && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-400 mb-3">Reporter</h4>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                    {task.createdBy?.profilePicture ? (
                      <img 
                        src={task.createdBy.profilePicture} 
                        alt={`${task.createdBy.firstName} ${task.createdBy.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-600 to-zinc-700 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {task.createdBy?.firstName?.[0]}{task.createdBy?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {task.createdBy?.firstName} {task.createdBy?.lastName}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Due Date */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-400 mb-3">Due Date</h4>
              <div className="flex items-center gap-2 text-zinc-300">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium">
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              {isOverdue && (
                <div className="mt-2 text-red-400 text-sm font-medium">
                  Overdue by {Math.abs(daysUntilDue)} days
                </div>
              )}
            </div>

            {/* Watchers */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-400 mb-3">Watchers</h4>
              <div className="flex items-center gap-2 text-zinc-300">
                <Users className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium">
                  {task.watchers?.length || 2} people
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
