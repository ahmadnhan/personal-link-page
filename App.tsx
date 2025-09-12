import React, { useState, useEffect } from 'react';
import Profile from './components/Profile';
import LinkCard from './components/LinkCard';
import FileDropzone from './components/FileDropzone';
import ThemeToggle from './components/ThemeToggle';
import { GlobeIcon, MobileIcon } from './components/icons';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        return true;
      }
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-slate-800 dark:text-slate-200 transition-colors duration-300">
       <div className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-indigo-900 dark:via-slate-900 dark:to-violet-900 animate-aurora"/>
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="fixed top-6 right-6 z-50">
          <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </div>
        <main className="w-full max-w-2xl bg-black/5 dark:bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-white/20 animate-fade-in-up">
            <div className="flex flex-col items-center gap-10">
                <Profile />
    
                <div className="w-full max-w-md flex flex-col sm:flex-row gap-6">
                    <LinkCard 
                    icon={<GlobeIcon />}
                    title="موقعي الإلكتروني"
                    href="https://ahmadnhan.github.io/mysite/"
                    />
                    <LinkCard 
                    icon={<MobileIcon />}
                    title="تطبيقي الخاص"
                    href="https://www.mediafire.com/file/fekgcz3s4tl8326/app3719549-ghn059.apk/file"
                    />
                </div>
    
                <div className="w-full max-w-md">
                     <FileDropzone />
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;