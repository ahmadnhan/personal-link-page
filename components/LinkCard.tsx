import React from 'react';

interface LinkCardProps {
  icon: React.ReactNode;
  title: string;
  href: string;
}

const LinkCard: React.FC<LinkCardProps> = ({ icon, title, href }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold py-4 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800"
    >
      <div className="flex items-center justify-center gap-3">
        <div className="group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <span>{title}</span>
      </div>
    </a>
  );
};

export default LinkCard;