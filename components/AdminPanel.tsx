import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon, UserIcon, RefreshIcon } from './Icons';
import { Visitor } from '../types';
import { getAllVisitors } from '../services/firestoreService';


interface AdminPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const AdminPanel = ({ isOpen, onClose }: AdminPanelProps) => {
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchVisitors = useCallback(() => {
        setIsLoading(true);
        getAllVisitors()
            .then(data => {
                setVisitors(data);
            })
            .catch(error => {
                console.error("Failed to fetch visitor data for Admin Panel:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchVisitors();
        }
    }, [isOpen, fetchVisitors]);

    if (!isOpen) return null;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="ml-4 text-gray-600">Loading Visitor Data...</p>
                </div>
            );
        }

        return (
             <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-gray-700">Total Visitors</h3>
                    <div className="flex items-center gap-2 text-gray-800 font-bold text-xl mt-2">
                        <UserIcon className="w-6 h-6" />
                        <span>{visitors.length} Unique Visitors</span>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-gray-700 mb-2">Visitor Names</h3>
                    <div className="max-h-48 overflow-y-auto">
                        {visitors.length > 0 ? (
                            <ul className="space-y-2">
                                {visitors.map((visitor, index) => (
                                    <li key={index} className="p-2 bg-gray-100 rounded-md text-gray-700 truncate">
                                        {visitor.name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">No visitors yet.</p>
                        )}
                    </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-gray-700 mb-2">Visitor Searches</h3>
                        <div className="max-h-96 overflow-y-auto">
                        {visitors.length > 0 && visitors.some(v => v.searches.length > 0) ? (
                            <ul className="space-y-4">
                                {visitors.map((visitor) => (
                                    <li key={visitor.name}>
                                        <p className="font-semibold text-gray-800">{visitor.name}</p>
                                        {visitor.searches.length > 0 ? (
                                            <ul className="mt-1 space-y-1 pl-4 border-l-2 border-gray-200">
                                                {visitor.searches.map((search, sIndex) => (
                                                    <li key={sIndex} className="text-sm text-gray-600 truncate" title={search}>
                                                        - {search}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500 pl-4 italic">- No searches yet.</p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">No visitor activity to display.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => onClose()}
        >
            <div
                className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out"
                style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchVisitors()}
                            className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Refresh data"
                            disabled={isLoading}
                        >
                            <RefreshIcon className={`w-6 h-6 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => onClose()} className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200">
                            <CloseIcon className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6">
                    {renderContent()}
                </div>
                
                 <p className="p-6 mt-auto text-center text-xs text-gray-400 border-t border-gray-200 flex-shrink-0">Visitor data is stored in Firestore.</p>
            </div>
        </div>
    );
};

export default AdminPanel;