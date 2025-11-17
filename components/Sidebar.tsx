
import React from 'react';
import { AppMode } from '../types';
import { ChatIcon, ImageIcon, VideoIcon, WebIcon, MicIcon } from './icons';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode }) => {
  const navItems = [
    { mode: AppMode.Chat, Icon: ChatIcon },
    { mode: AppMode.ImageGen, Icon: ImageIcon },
    { mode: AppMode.VideoGen, Icon: VideoIcon },
    { mode: AppMode.WebSearch, Icon: WebIcon },
    { mode: AppMode.Live, Icon: MicIcon },
  ];

  return (
    <aside className="w-16 md:w-20 lg:w-64 bg-gray-900 border-r border-gray-700 flex flex-col items-center lg:items-start p-2 lg:p-4 transition-all duration-300">
      <div className="w-full flex flex-col space-y-2">
        {navItems.map(({ mode, Icon }) => (
          <button
            key={mode}
            onClick={() => setMode(mode)}
            className={`flex items-center space-x-3 p-3 rounded-lg w-full transition-colors duration-200 ${
              currentMode === mode ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Icon className="w-6 h-6 flex-shrink-0" />
            <span className="hidden lg:inline font-medium">{mode}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
