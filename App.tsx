import React, { useState } from 'react';
import { AppMode } from './types';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ImageGenView from './components/ImageGenView';
import VideoGenView from './components/VideoGenView';
import WebSearchView from './components/WebSearchView';
import LiveView from './components/LiveView';
import { BotIcon } from './components/icons';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.Chat);

  const renderContent = () => {
    switch (mode) {
      case AppMode.Chat:
        return <ChatView />;
      case AppMode.ImageGen:
        return <ImageGenView />;
      case AppMode.VideoGen:
        return <VideoGenView />;
      case AppMode.WebSearch:
        return <WebSearchView />;
      case AppMode.Live:
        return <LiveView />;
      default:
        return <ChatView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      <Sidebar currentMode={mode} setMode={setMode} />
      <main className="flex-1 flex flex-col h-screen">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <BotIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">Own chatbot</h1>
            </div>
            <div className="px-3 py-1 text-sm font-medium text-indigo-300 bg-indigo-900/50 rounded-full">{mode}</div>
        </header>
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;