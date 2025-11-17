
import React, { useState, useEffect } from 'react';
import { ArrowUpIcon } from './Icons';

const Footer = () => {
  const [isCreditsOpen, setIsCreditsOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCreditsOpen(false);
    }, 60000); // 1 minute in milliseconds

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(timer);
  }, []); // The empty dependency array ensures this effect runs only once on mount

  return (
    <footer className="relative bg-slate-50 border-t border-slate-200">
      <button
        onClick={() => setIsCreditsOpen(prev => !prev)}
        className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 z-10 transform hover:scale-110 active:scale-100"
        aria-label={isCreditsOpen ? 'Hide credits' : 'Show credits'}
        aria-expanded={isCreditsOpen}
      >
        <ArrowUpIcon
          className={`w-5 h-5 text-slate-600 transition-transform duration-300 ease-in-out ${
            isCreditsOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden text-center ${
          isCreditsOpen ? 'max-h-40 py-3' : 'max-h-0'
        }`}
      >
        <div className="text-sm font-medium text-gray-600">
          <p>Created by Prajwal Kumbar</p>
          <div className="flex items-center justify-center gap-4">
              <p>A Prajwal Kumbar Productions</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;