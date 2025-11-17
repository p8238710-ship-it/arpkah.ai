import React, { useState, useEffect } from 'react';
import { CloseIcon, PlusIcon } from './Icons';
// FIX: Import the shared `Preferences` type.
import { Preferences } from '../types';

// FIX: Removed local `Preferences` interface to use the shared one from `types.ts`.

interface PreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (preferences: Preferences) => void;
    currentPreferences: Preferences;
}

const PreferencesModal = ({ isOpen, onClose, onSave, currentPreferences }: PreferencesModalProps) => {
    const [interests, setInterests] = useState<string[]>([]);
    const [textModel, setTextModel] = useState('gemini-2.5-pro');
    const [imageModel, setImageModel] = useState('gemini-2.5-flash-image');
    const [newInterest, setNewInterest] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setInterests(currentPreferences.interests || []);
            setTextModel(currentPreferences.textModel || 'gemini-2.5-pro');
            setImageModel(currentPreferences.imageModel || 'gemini-2.5-flash-image');
        }
    }, [isOpen, currentPreferences]);

    if (!isOpen) return null;

    const handleAddInterest = (e: React.FormEvent) => {
        e.preventDefault();
        if (newInterest.trim() && !interests.includes(newInterest.trim())) {
            setInterests([...interests, newInterest.trim()]);
            setNewInterest('');
        }
    };

    const handleRemoveInterest = (interestToRemove: string) => {
        setInterests(interests.filter(interest => interest !== interestToRemove));
    };

    const handleSave = async () => {
        setIsSaving(true);
        await onSave({ interests, textModel, imageModel });
        setIsSaving(false);
    };
    
    const handleClose = () => {
        setNewInterest('');
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg m-4 animate-fade-in-up flex flex-col"
                style={{ maxHeight: '90vh' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">Personalize AROKAH.ai</h2>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <CloseIcon className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto space-y-8">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Interests</h3>
                        <p className="text-gray-600 mb-4">
                            Help AROKAH.ai understand you better. This allows it to tailor responses, examples, and suggestions to what you care about most.
                        </p>

                        <form onSubmit={handleAddInterest} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newInterest}
                                onChange={(e) => setNewInterest(e.target.value)}
                                placeholder="e.g., Quantum Physics..."
                                className="flex-grow px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50"
                                disabled={!newInterest.trim()}
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </form>

                        {interests.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {interests.map(interest => (
                                    <div key={interest} className="flex items-center gap-2 bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full animate-fade-in">
                                        <span>{interest}</span>
                                        <button onClick={() => handleRemoveInterest(interest)} className="text-indigo-500 hover:text-indigo-800">
                                            <CloseIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Model Configuration</h3>
                        <p className="text-gray-600 mb-4">
                            Choose the underlying AI models for different tasks. Advanced models may provide higher quality responses but could be slower.
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Text Model</label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button onClick={() => setTextModel('gemini-2.5-flash')} className={`flex-1 text-left p-3 border rounded-lg ${textModel === 'gemini-2.5-flash' ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                                        <span className="font-semibold text-gray-800">AROKAH.Ai Standard</span>
                                        <p className="text-xs text-gray-500">Optimized for speed. Great for most everyday conversations and creative tasks.</p>
                                    </button>
                                    <button onClick={() => setTextModel('gemini-2.5-pro')} className={`flex-1 text-left p-3 border rounded-lg ${textModel === 'gemini-2.5-pro' ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                                        <span className="font-semibold text-gray-800">AROKAH.Ai Pro</span>
                                        <p className="text-xs text-gray-500">Highest accuracy and reasoning. Best for complex problems, analysis, and when correctness is critical.</p>
                                    </button>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image Generation Model</label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button onClick={() => setImageModel('gemini-2.5-flash-image')} className={`flex-1 text-left p-3 border rounded-lg ${imageModel === 'gemini-2.5-flash-image' ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                                        <span className="font-semibold text-gray-800">AROKAH.Ai Image</span>
                                        <p className="text-xs text-gray-500">Fast generation with high quality.</p>
                                    </button>
                                    <button onClick={() => setImageModel('imagen-4.0-generate-001')} className={`flex-1 text-left p-3 border rounded-lg ${imageModel === 'imagen-4.0-generate-001' ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                                        <span className="font-semibold text-gray-800">AROKAH.Ai HD Image</span>
                                        <p className="text-xs text-gray-500">State-of-the-art, photorealistic images.</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreferencesModal;