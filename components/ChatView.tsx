
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import ChatMessage from './ChatMessage';
import Spinner from './Spinner';
import { generateText, generateTextWithImage } from '../services/geminiService';
import { PaperclipIcon, SendIcon } from './icons';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleSpeech = (message: ChatMessageType) => {
    if (!('speechSynthesis' in window)) {
      alert("Sorry, your browser doesn't support text-to-speech.");
      return;
    }

    if (speakingMessageId === message.id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
    setSpeakingMessageId(message.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !image) return;

    // Stop any speaking messages before sending a new one
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
    }

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      image: image ?? undefined,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let modelResponseText: string;
      if (imageFile && image) {
        const base64Image = image.split(',')[1];
        modelResponseText = await generateTextWithImage(input, imageFile.type, base64Image);
      } else {
        modelResponseText = await generateText(input);
      }
      
      const modelMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: modelResponseText,
      };
      setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
      setImage(null);
      setImageFile(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
            <ChatMessage 
                key={msg.id} 
                message={msg} 
                onToggleSpeech={handleToggleSpeech}
                isSpeaking={speakingMessageId === msg.id}
            />
        ))}
         {isLoading && (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          )}
      </div>
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <form onSubmit={handleSubmit} className="relative">
          {image && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-700 rounded-lg">
              <img src={image} alt="preview" className="h-20 w-20 object-cover rounded" />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImageFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs"
              >
                &times;
              </button>
            </div>
          )}
          <div className="flex items-center bg-gray-700 rounded-lg p-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-white"
            >
              <PaperclipIcon className="w-6 h-6" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message or upload an image..."
              className="flex-1 bg-transparent focus:outline-none px-4 text-white"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !image)}
              className="p-2 rounded-full bg-indigo-600 text-white disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
            >
              {isLoading ? <Spinner /> : <SendIcon className="w-6 h-6" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
