import React from 'react';
import { PlusIcon } from './Icons';

interface HistorySidebarProps {
  history: string[];
  onHistoryClick: (prompt: string) => void;
  onAdminAccessClick: () => void;
  onNewChat: () => void;
  isOwner: boolean;
}

const HistorySidebar = ({ history, onHistoryClick, onAdminAccessClick, onNewChat, isOwner }: HistorySidebarProps) => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-50 border-r border-gray-200 p-4 h-full">
      <div className="flex-grow flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold font-sans text-gray-900">History</h2>
          <button
            onClick={() => onNewChat()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
            title="Start a new chat"
          >
            <PlusIcon className="w-5 h-5" />
            New Chat
          </button>
        </div>
        <div className="overflow-y-auto flex-grow">
          {history.length === 0 ? (
            <p className="text-gray-500 text-sm">Your prompts will appear here.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => onHistoryClick(item)}
                    className="w-full text-left p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 truncate transform hover:translate-x-1"
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
            onClick={() => onAdminAccessClick()}
            className="w-full text-center py-2 px-4 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
          >
            Admin Panel
          </button>
        </div>
      )}
    </aside>
  );
};

export default HistorySidebar;