import React from 'react';
import { MoonIcon, SunIcon } from './icons';

interface ThemeToggleProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, toggleTheme }) => {
  return (
    <button
  type="button"
      onClick={toggleTheme}
      className="p-3 rounded-full bg-white/40 dark:bg-slate-900/60 backdrop-blur-lg text-slate-600 dark:text-slate-300 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500 border border-white/20 dark:border-slate-700/60"
      aria-label="Toggle theme"
  aria-pressed={isDarkMode}
    >
      {isDarkMode ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};

export default ThemeToggle;