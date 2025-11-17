import React, { useState } from 'react';
import { CloseIcon } from './Icons';

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (password: string) => void;
    error: string | null;
}

const PasswordModal = ({ isOpen, onClose, onSubmit, error }: PasswordModalProps) => {
    const [password, setPassword] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(password);
        // FIX: Clear password after every attempt to force re-entry.
        setPassword('');
    };

    const handleClose = () => {
        setPassword('');
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
            onClick={() => handleClose()}
        >
            <div
                className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm m-4 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Admin Access</h2>
                    <button onClick={() => handleClose()} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <CloseIcon className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <p className="text-gray-600 mb-4">Please enter the password to view the admin panel.</p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-shadow duration-300 ${error ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-gray-800'}`}
                        autoFocus
                        // FIX: Prevent browser from saving or auto-filling the password.
                        autoComplete="new-password"
                    />
                    {error && <p className="text-red-600 text-sm mt-2 animate-fade-in">{error}</p>}
                    <button
                        type="submit"
                        className="mt-6 w-full px-4 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-gray-800 transition-colors duration-300 disabled:opacity-50"
                        disabled={!password}
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasswordModal;