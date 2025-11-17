import React from 'react';
import { CloseIcon, PlusIcon } from './Icons';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: string[];
  onHistoryClick: (prompt: string) => void;
  onAdminAccessClick: () => void;
  onNewChat: () => void;
  isOwner: boolean;
}

const MobileSidebar = ({ isOpen, onClose, history, onHistoryClick, onAdminAccessClick, onNewChat, isOwner }: MobileSidebarProps) => {
  if (!isOpen) return null;

  const handleNewChatClick = () => {
    onNewChat();
    onClose();
  };

  const handleAdminClick = () => {
    onAdminAccessClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-30 md:hidden" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => onClose()} aria-hidden="true"></div>

      {/* Sidebar */}
      <div className="relative z-40 flex">
        <div className="flex flex-col w-64 max-w-[80%] bg-white h-screen p-4 overflow-y-auto animate-slide-in-left">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-sans text-gray-900">Menu</h2>
            <button onClick={() => onClose()} className="p-2 -mr-2 rounded-full hover:bg-gray-200" aria-label="Close menu">
              <CloseIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          <button
            onClick={() => handleNewChatClick()}
            className="w-full flex items-center gap-3 text-left p-3 mb-4 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 transition-colors duration-200 font-semibold"
          >
            <PlusIcon className="w-5 h-5" />
            New Chat
          </button>

          <div className="flex-grow flex flex-col min-h-0 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">History</h3>
            <div className="overflow-y-auto flex-grow">
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm">Your prompts will appear here.</p>
              ) : (
                <ul className="space-y-2">
                  {history.map((item, index) => (
                    <li key={index}>
                      <button
                        onClick={() => {
                          onHistoryClick(item);
                          onClose(); // Close sidebar on click
                        }}
                        className="w-full text-left p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 truncate"
                        title={item}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {isOwner && (
            <div className="flex-shrink-0 pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={() => handleAdminClick()}
                className="w-full text-center py-2 px-4 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
              >
                Admin Panel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;