import React, { useState, useEffect, useRef } from 'react';
import Spinner from './Spinner';
import { generateVideo } from '../services/geminiService';
import ApiKeySelector from './ApiKeySelector';
import { VideoIcon, MicIcon } from './icons';

// Augment the global Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const loadingMessages = [
    "Warming up the digital director's chair...",
    "Assembling pixels into motion...",
    "Teaching virtual actors their lines...",
    "Rendering the first few frames...",
    "This is taking a moment, great art needs patience!",
    "Polishing the final cut...",
    "Almost there, the premiere is about to begin!"
];

const VideoGenView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any | null>(null);
  const isSpeechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSpeechSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };
    
    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.abort();
    };
  }, [isSpeechSupported]);

  const handleToggleRecording = () => {
    if (!recognitionRef.current) return;
    
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const keySelected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(keySelected);
      }
    };
    checkKey();
  }, []);
  
  useEffect(() => {
    // FIX: Changed NodeJS.Timeout to number for browser compatibility.
    let interval: number;
    if (isLoading) {
      interval = window.setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleKeySelected = () => {
    setHasApiKey(true);
  };
  
  const handleResetKey = () => {
      setHasApiKey(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    setLoadingMessage(loadingMessages[0]);

    try {
      const generatedVideoUrl = await generateVideo(prompt);
      setVideoUrl(generatedVideoUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error('Video generation failed:', err);

      let userFriendlyError = 'An unexpected error occurred during video generation. Please check the console for details and try again.';
      const lowerCaseError = errorMessage.toLowerCase();

      if (lowerCaseError.includes("requested entity was not found") || lowerCaseError.includes("api_key_invalid")) {
          userFriendlyError = "API Key not found or invalid. Please select your key again.";
          handleResetKey();
      } else if (lowerCaseError.includes("quota")) {
          userFriendlyError = "You have exceeded your request quota. Please check your project's billing status or try again later.";
      } else if (lowerCaseError.includes("billing")) {
          userFriendlyError = "Video generation failed. Please ensure billing is enabled for your Google Cloud project.";
      } else if (lowerCaseError.includes("safety") || lowerCaseError.includes("policy")) {
          userFriendlyError = "Your prompt may violate the safety policy. Please adjust your prompt and try again.";
      } else if (lowerCaseError.includes("no download link")) {
          userFriendlyError = "The video was generated, but we couldn't retrieve it. Please try again.";
      } else if (lowerCaseError.includes("failed to download")) {
          userFriendlyError = "The video was generated, but a network error occurred while downloading it. Please check your connection and try again.";
      }
      
      setError(userFriendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasApiKey) {
    return <ApiKeySelector onKeySelected={handleKeySelected} />;
  }

  return (
    <div className="p-4 md:p-8 flex flex-col items-center h-full bg-gray-800 text-gray-100">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Video Generation</h2>
            <p className="text-gray-400 mt-2">Bring your stories to life with AI-powered video.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-900 p-6 rounded-lg shadow-xl">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
              Video Prompt
            </label>
            <div className="relative">
              <textarea
                id="prompt"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A cinematic shot of a lone astronaut discovering a glowing alien flower on Mars."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 pr-12 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                disabled={isLoading}
              />
               {isSpeechSupported && (
                <button
                  type="button"
                  onClick={handleToggleRecording}
                  disabled={isLoading}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors duration-200
                      ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-600 hover:bg-gray-500 text-gray-300'}
                      disabled:bg-gray-800 disabled:cursor-not-allowed`}
                  aria-label={isRecording ? 'Stop recording' : 'Start recording prompt'}
                >
                  <MicIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <><Spinner /> Generating Video...</> : 'Generate Video'}
          </button>
        </form>

        {error && (
            <div className="mt-6 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">
                <p><strong>Error:</strong> {error}</p>
            </div>
        )}

        <div className="mt-8 w-full flex justify-center">
            {isLoading ? (
                <div className="w-full aspect-video max-w-2xl bg-gray-700 rounded-lg flex flex-col items-center justify-center animate-pulse">
                    <VideoIcon className="w-16 h-16 text-gray-500" />
                    <p className="mt-4 text-gray-400 text-center px-4">{loadingMessage}</p>
                </div>
            ) : videoUrl ? (
                 <video src={videoUrl} controls autoPlay loop className="max-w-2xl w-full rounded-lg shadow-2xl" />
            ) : (
                <div className="w-full aspect-video max-w-2xl bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center">
                    <VideoIcon className="w-16 h-16 text-gray-500" />
                    <p className="mt-4 text-gray-400">Your generated video will appear here.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenView;