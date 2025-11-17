
import React, { useEffect, useRef } from 'react';
import { CloseIcon, MicrophoneIcon, StopIcon, UserIcon, BotIcon } from './Icons';
import { LiveTranscription } from '../types';

type LiveStatus = 'idle' | 'connecting' | 'live' | 'error';

interface LiveConversationProps {
    isOpen: boolean;
    onClose: () => void;
    status: LiveStatus;
    error: string | null;
    onStart: () => void;
    onStop: () => void;
    transcriptions: LiveTranscription[];
    currentInput: string;
    currentOutput: string;
}

const StatusIndicator = ({ status }: { status: LiveStatus }) => {
    const statusMap = {
        idle: { color: 'bg-gray-400', text: 'Idle' },
        connecting: { color: 'bg-yellow-500', text: 'Connecting...' },
        live: { color: 'bg-green-500', text: 'Live' },
        error: { color: 'bg-red-500', text: 'Error' },
    };
    const { color, text } = statusMap[status];

    return (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color} ${status === 'live' || status === 'connecting' ? 'animate-pulse' : ''}`}></div>
            <span className="text-sm font-semibold text-gray-700">{text}</span>
        </div>
    );
};

const LiveConversation = ({ isOpen, onClose, status, error, onStart, onStop, transcriptions, currentInput, currentOutput }: LiveConversationProps) => {
    const transcriptionEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        transcriptionEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcriptions, currentInput, currentOutput]);
    
    if (!isOpen) return null;

    const renderTranscription = (item: LiveTranscription, index: number) => {
        const isUser = item.sender === 'user';
        return (
            <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${isUser ? 'bg-gray-100' : 'bg-indigo-50'}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-gray-300' : 'bg-gray-900'}`}>
                    {isUser ? <UserIcon className="w-5 h-5 text-gray-700" /> : <BotIcon className="w-5 h-5 text-white" />}
                </div>
                <p className="text-gray-800 pt-1 whitespace-pre-wrap">{item.text}</p>
            </div>
        );
    };

    return (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl m-4 animate-fade-in-up flex flex-col"
                style={{ height: '80vh', maxHeight: '700px' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <MicrophoneIcon className="w-6 h-6 text-gray-800" />
                        <h2 className="text-xl font-bold text-gray-800">Live Conversation</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <CloseIcon className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto space-y-4">
                    {transcriptions.map(renderTranscription)}
                    {currentInput && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-100/50 opacity-75">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-300">
                                <UserIcon className="w-5 h-5 text-gray-700" />
                            </div>
                            <p className="text-gray-600 italic pt-1 whitespace-pre-wrap">{currentInput}...</p>
                        </div>
                    )}
                    {currentOutput && (
                         <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50/50 opacity-75">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-900">
                                <BotIcon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-gray-600 italic pt-1 whitespace-pre-wrap">{currentOutput}...</p>
                        </div>
                    )}
                    <div ref={transcriptionEndRef} />
                </div>
                
                <div className="flex items-center justify-between p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50 rounded-b-2xl">
                    <StatusIndicator status={status} />
                    {error && <p className="text-red-600 text-sm font-medium animate-fade-in">{error}</p>}
                    {status === 'live' || status === 'connecting' ? (
                        <button
                            onClick={onStop}
                            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center gap-2 transition-all transform hover:scale-105"
                        >
                            <StopIcon className="w-5 h-5" />
                            Stop Session
                        </button>
                    ) : (
                        <button
                            onClick={onStart}
                            className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-all transform hover:scale-105"
                        >
                            <MicrophoneIcon className="w-5 h-5" />
                            Start Speaking
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveConversation;