
import React from 'react';
import { MenuIcon, BrandIcon, SidebarIcon, MicrophoneIcon, BookOpenIcon, GearIcon } from './Icons';

interface HeaderProps {
    onMenuClick: () => void;
    onToggleHistory: () => void;
    onOpenLive: () => void;
    onOpenMemory: () => void;
    onOpenPreferences: () => void;
}

const Header = ({ onMenuClick, onToggleHistory, onOpenLive, onOpenMemory, onOpenPreferences }: HeaderProps) => {
    return (
        <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/80 backdrop-blur-md z-10 shadow-sm">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onMenuClick()}
                    className="p-2 rounded-full hover:bg-gray-200 md:hidden transition-transform duration-200 transform hover:scale-110 active:scale-95"
                    aria-label="Open menu"
                >
                    <MenuIcon className="w-6 h-6 text-gray-700" />
                </button>
                <button
                    onClick={() => onToggleHistory()}
                    className="p-2 rounded-full hover:bg-gray-200 hidden md:block transition-transform duration-200 transform hover:scale-110 active:scale-95"
                    aria-label="Toggle history sidebar"
                >
                    <SidebarIcon className="w-6 h-6 text-gray-700" />
                </button>
                <div className="flex items-center gap-3">
                    <BrandIcon className="w-8 h-8" />
                    <h1 className="text-xl font-sans font-bold text-gray-900">AROKAH.Ai</h1>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onOpenLive} className="p-2 rounded-full hover:bg-gray-200 transition-transform duration-200 transform hover:scale-110 active:scale-95" title="Live Conversation">
                    <MicrophoneIcon className="w-6 h-6 text-gray-700" />
                </button>
                <button onClick={onOpenMemory} className="p-2 rounded-full hover:bg-gray-200 transition-transform duration-200 transform hover:scale-110 active:scale-95" title="Saved Memories">
                    <BookOpenIcon className="w-6 h-6 text-gray-700" />
                </button>
                <button onClick={onOpenPreferences} className="p-2 rounded-full hover:bg-gray-200 transition-transform duration-200 transform hover:scale-110 active:scale-95" title="Personalize">
                    <GearIcon className="w-6 h-6 text-gray-700" />
                </button>
            </div>
        </header>
    );
};

export default Header;
