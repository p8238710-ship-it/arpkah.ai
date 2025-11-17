import React, { useState } from 'react';
import { CloseIcon, TrashIcon } from './Icons';

interface MemoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    memories: string[];
    onRemoveMemory: (memory: string) => Promise<void>;
}

const MemoryModal = ({ isOpen, onClose, memories, onRemoveMemory }: MemoryModalProps) => {
    const [isRemoving, setIsRemoving] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleRemoveClick = async (memory: string) => {
        setIsRemoving(memory);
        try {
            await onRemoveMemory(memory);
        } catch (error) {
            console.error("Failed to remove memory from modal:", error);
            // Optionally show an error to the user
        } finally {
            setIsRemoving(null);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl m-4 animate-fade-in-up flex flex-col"
                style={{ maxHeight: '80vh' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">Saved Memories</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <CloseIcon className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto">
                    <p className="text-gray-600 mb-6">
                        This is a list of facts and information you've asked AROKAH.ai to remember. It will use this knowledge to provide more personalized and relevant responses in your future conversations.
                    </p>

                    {memories.length > 0 ? (
                        <ul className="space-y-3">
                            {memories.map((memory, index) => (
                                <li key={index} className="flex items-start justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                    <p className="text-gray-700 flex-grow">{memory}</p>
                                    <button
                                        onClick={() => handleRemoveClick(memory)}
                                        disabled={isRemoving === memory}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
                                        title="Remove this memory"
                                    >
                                        {isRemoving === memory ? (
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <TrashIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 px-4 border-2 border-dashed border-gray-200 rounded-lg">
                            <p className="text-gray-500 font-medium">No memories saved yet.</p>
                            <p className="text-gray-400 text-sm mt-1">Click the bookmark icon on any of AROKAH.ai's responses to save it here.</p>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-end p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-gray-800 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemoryModal;
