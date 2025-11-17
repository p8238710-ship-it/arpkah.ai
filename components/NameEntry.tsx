import React, { useState } from 'react';
// FIX: Removed unused GlobeIcon import.
import { BrandIcon } from './Icons';

interface NameEntryProps {
  onNameSubmit: (name: string) => void;
}

const NameEntry = ({ onNameSubmit }: NameEntryProps) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSubmit(name.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="text-center animate-fade-in-down">
        <div className="flex justify-center mb-4">
            <BrandIcon className="w-20 h-20 sm:w-24 sm:h-24 animate-subtle-float" />
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-sans font-bold text-gray-900 tracking-wide">
            AROKAH.Ai
        </h1>
        <p className="mt-4 text-gray-500 text-lg">Your Personal AI Companion</p>
        <p className="mt-2 text-gray-700 font-semibold text-lg uppercase tracking-widest">INDIA'S FIRST SMARTEST AND LOGICALLY THINKING AI</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-12 w-full max-w-sm animate-fade-in-up"
        style={{ animationDelay: '200ms' }}
      >
        <div className="flex flex-col gap-4 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <label htmlFor="name-input" className="text-center text-gray-600 font-medium">
            Please enter your name to begin
          </label>
          <input
            id="name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 transition-shadow duration-300"
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-gray-800 transition-all duration-300 transform hover:scale-105 active:scale-100 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!name.trim()}
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default NameEntry;
