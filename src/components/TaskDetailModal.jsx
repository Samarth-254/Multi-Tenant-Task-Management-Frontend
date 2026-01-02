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
  AlertTriangle,
  Edit,
  Trash2
} from 'lucide-react';


const TaskDetailModal = ({ isOpen, onClose, task, onEdit, onDelete }) => {
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


  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed' && task.status !== 'Expired';
  const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));


  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-2.5 sm:p-6 sm:pb-4 border-b border-zinc-800/50 bg-zinc-900 z-10 flex-shrink-0">
          <h2 className="text-sm sm:text-lg font-semibold text-zinc-400">Task Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400 hover:text-white" />
          </button>
        </div>


        {/* Two Column Layout - Stack on mobile */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-y-auto">
          {/* Left Column - Main Content */}
          <div className="sm:flex-1 p-2.5 sm:p-6 space-y-2 sm:space-y-5">
            {/* Title with Edit and Delete buttons */}
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-lg sm:text-3xl font-bold text-white leading-tight flex-1">
                {task.title}
              </h1>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {onEdit && (
                  <button
                    onClick={() => {
                      onClose();
                      onEdit(task);
                    }}
                    className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-blue-400"
                    title="Edit task"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(task._id);
                      onClose();
                    }}
                    className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-red-400"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>


            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              
              <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>


            {/* Description */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-400 mb-1 sm:mb-3">Description</h3>
              <div 
                className="text-zinc-300 leading-relaxed text-sm sm:text-base prose prose-invert max-w-none max-h-24 sm:max-h-48 overflow-y-auto pr-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>p]:mb-0 [&>ol]:mb-0 [&>ul]:mb-0 [&>li]:mb-0"
                dangerouslySetInnerHTML={{ __html: task.description }}
              />
            </div>
          </div>


          {/* Right Column - Sidebar with thin border separator */}
          <div className="w-full sm:w-80 border-t sm:border-t-0 sm:border-l border-zinc-800 p-3 pb-8 sm:p-6 space-y-3 sm:space-y-4 bg-zinc-900/50 flex-shrink-0">
            {/* Row 1: Assigned To & Reporter */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Assigned To */}
              <div>
                <h4 className="text-[11px] sm:text-xs font-semibold text-zinc-400 mb-1.5 sm:mb-2">Assigned To</h4>
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0">
                    {task.assignedTo?.profilePicture ? (
                      <img 
                        src={task.assignedTo.profilePicture} 
                        alt={`${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-[10px] sm:text-xs font-bold text-white">
                          {task.assignedTo?.firstName?.[0]}{task.assignedTo?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-white font-medium text-xs sm:text-sm leading-tight">
                    {task.assignedTo?.firstName} {task.assignedTo?.lastName}
                  </p>
                </div>
              </div>


              {/* Reporter */}
              {task.createdBy && (
                <div className="text-right">
                  <h4 className="text-[11px] sm:text-xs font-semibold text-zinc-400 mb-1.5 sm:mb-2">Reporter</h4>
                  <div className="flex items-center gap-1.5 justify-end">
                    <p className="text-white font-medium text-xs sm:text-sm leading-tight order-1">
                      {task.createdBy?.firstName} {task.createdBy?.lastName}
                    </p>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0 order-2">
                      {task.createdBy?.profilePicture ? (
                        <img 
                          src={task.createdBy.profilePicture} 
                          alt={`${task.createdBy.firstName} ${task.createdBy.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-600 to-zinc-700 flex items-center justify-center">
                          <span className="text-[10px] sm:text-xs font-bold text-white">
                            {task.createdBy?.firstName?.[0]}{task.createdBy?.lastName?.[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>


            {/* Row 2: Due Date & Assigned Date */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Due Date */}
              <div>
                <h4 className="text-[11px] sm:text-xs font-semibold text-zinc-400 mb-1.5 sm:mb-2">Due Date</h4>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 flex-shrink-0" />
                  <span className="text-[11px] sm:text-sm font-medium leading-tight">
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {isOverdue && (
                  <div className="mt-1 sm:mt-2 text-red-400 text-[11px] sm:text-sm font-medium">
                    Overdue by {Math.abs(daysUntilDue)} days
                  </div>
                )}
              </div>


              {/* Assigned Date */}
              <div className="text-right">
                <h4 className="text-[11px] sm:text-xs font-semibold text-zinc-400 mb-1.5 sm:mb-2">Assigned Date</h4>
                <div className="flex items-center gap-1.5 text-zinc-300 justify-end">
                  <span className="text-[11px] sm:text-sm font-medium leading-tight order-1">
                    {new Date(task.createdAt || task.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 flex-shrink-0 order-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default TaskDetailModal;
