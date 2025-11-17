
import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { BotIcon, UserIcon, WebIcon, SpeakerIcon, StopIcon } from './icons';

interface ChatMessageProps {
  message: ChatMessageType;
  onToggleSpeech?: (message: ChatMessageType) => void;
  isSpeaking?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onToggleSpeech, isSpeaking }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex items-start space-x-4 p-4 ${isModel ? 'bg-gray-800/50' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-indigo-500' : 'bg-gray-600'}`}>
        {isModel ? <BotIcon className="w-5 h-5 text-white" /> : <UserIcon className="w-5 h-5 text-white" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
            <p className="font-semibold text-white capitalize">{message.role}</p>
            {isModel && onToggleSpeech && (
                <button
                    onClick={() => onToggleSpeech(message)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    aria-label={isSpeaking ? 'Stop speech' : 'Read message aloud'}
                >
                    {isSpeaking ? <StopIcon className="w-5 h-5" /> : <SpeakerIcon className="w-5 h-5" />}
                </button>
            )}
        </div>

        <div className="prose prose-invert max-w-none text-gray-300">
            {message.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            {message.image && (
                <div className="mt-2">
                    <img src={message.image} alt="User upload" className="max-w-xs rounded-lg border border-gray-600" />
                </div>
            )}
            {message.groundingChunks && message.groundingChunks.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center">
                        <WebIcon className="w-4 h-4 mr-2" />
                        Sources
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {message.groundingChunks.map((chunk, index) => (
                            chunk.web && (
                                <a
                                    key={index}
                                    href={chunk.web.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs bg-gray-700 text-indigo-300 hover:bg-gray-600 hover:text-indigo-200 px-2 py-1 rounded-md transition-colors duration-200 truncate"
                                    title={chunk.web.title}
                                >
                                    {chunk.web.title || new URL(chunk.web.uri).hostname}
                                </a>
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
