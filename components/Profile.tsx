import React from 'react';
import { TwitterIcon, LinkedinIcon, GithubIcon } from './icons';

const Profile: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="relative group">
        <div className="absolute -inset-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        <div className="relative">
            <img
            src="https://picsum.photos/seed/uiprofile/128/128"
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-white/50 dark:border-slate-800/60 shadow-lg"
            />
            <span className="absolute bottom-2 right-2 block h-5 w-5 rounded-full bg-green-500 border-2 border-white dark:border-slate-800 animate-pulse"></span>
        </div>
      </div>
      <h1 className="text-5xl font-extrabold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
        احمد سايت
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md">
        مطور واجهات أمامية متخصص في إنشاء تجارب مستخدم مذهلة بصريًا وسلسة وظيفيًا.
      </p>
      <div className="flex gap-4 mt-3">
        <a href="#" className="p-3 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-sm text-slate-500 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-300 hover:scale-110 transition-all duration-300 border border-white/20 dark:border-slate-700/60">
          <TwitterIcon />
        </a>
        <a href="#" className="p-3 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-sm text-slate-500 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-300 hover:scale-110 transition-all duration-300 border border-white/20 dark:border-slate-700/60">
          <LinkedinIcon />
        </a>
        <a href="#" className="p-3 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-sm text-slate-500 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-300 hover:scale-110 transition-all duration-300 border border-white/20 dark:border-slate-700/60">
          <GithubIcon />
        </a>
      </div>
    </div>
  );
};

export default Profile;