import React, { useState, useEffect, useRef } from 'react';
import Spinner from './Spinner';
import { generateImage } from '../services/geminiService';
import { ImageIcon, MicIcon } from './icons';

// Augment the global Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ImageGenView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [style, setStyle] = useState('none');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const generatedImageUrl = await generateImage(prompt, aspectRatio, negativePrompt, style);
      setImageUrl(generatedImageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error('Image generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 flex flex-col items-center h-full bg-gray-800 text-gray-100">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Image Generation</h2>
            <p className="text-gray-400 mt-2">Create stunning visuals from your imagination.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-900 p-6 rounded-lg shadow-xl">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
              Prompt
            </label>
            <div className="relative">
              <textarea
                id="prompt"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A photo of a raccoon astronaut riding a rocket through a galaxy."
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

          <div>
            <label htmlFor="style" className="block text-sm font-medium text-gray-300 mb-2">
              Style
            </label>
            <select
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              disabled={isLoading}
            >
              <option value="none">None</option>
              <option value="photorealistic">Photorealistic</option>
              <option value="cartoon">Cartoon</option>
              <option value="watercolor">Watercolor</option>
              <option value="anime">Anime</option>
              <option value="cyberpunk">Cyberpunk</option>
              <option value="fantasy">Fantasy</option>
            </select>
          </div>

          <div>
            <label htmlFor="negative-prompt" className="block text-sm font-medium text-gray-300 mb-2">
              Negative Prompt (what to avoid)
            </label>
            <textarea
              id="negative-prompt"
              rows={2}
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="e.g., blurry, text, watermark, extra limbs"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-300 mb-2">
              Aspect Ratio
            </label>
            <select
              id="aspectRatio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              disabled={isLoading}
            >
              <option value="1:1">Square (1:1)</option>
              <option value="16:9">Landscape (16:9)</option>
              <option value="9:16">Portrait (9:16)</option>
              <option value="4:3">Standard (4:3)</option>
              <option value="3:4">Tall (3:4)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <><Spinner /> Generating...</> : 'Generate Image'}
          </button>
        </form>

        {error && (
            <div className="mt-6 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">
                <p><strong>Error:</strong> {error}</p>
            </div>
        )}

        <div className="mt-8 w-full flex justify-center">
            {isLoading ? (
                <div className="w-full aspect-square max-w-lg bg-gray-700 rounded-lg flex flex-col items-center justify-center animate-pulse">
                    <ImageIcon className="w-16 h-16 text-gray-500" />
                    <p className="mt-4 text-gray-400">Brewing up your image...</p>
                </div>
            ) : imageUrl ? (
                 <img src={imageUrl} alt="Generated" className="max-w-lg w-full rounded-lg shadow-2xl" />
            ) : (
                <div className="w-full aspect-square max-w-lg bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-500" />
                    <p className="mt-4 text-gray-400">Your generated image will appear here.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenView;