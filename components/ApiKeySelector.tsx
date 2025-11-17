
import React from 'react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // Assume success and update the parent component's state
      onKeySelected();
    } else {
        alert("API Key selection utility is not available.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-800">
      <div className="bg-gray-900 p-8 rounded-lg shadow-2xl max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">API Key Required</h2>
        <p className="text-gray-400 mb-6">
          To use the video generation feature, you need to select an API key from your Google AI Studio project. This is a one-time setup for this session.
        </p>
        <button
          onClick={handleSelectKey}
          className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-500 transition-colors"
        >
          Select Your API Key
        </button>
        <p className="text-xs text-gray-500 mt-4">
          By continuing, you acknowledge that charges may apply. For more information, please review the 
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline ml-1"
          >
            billing documentation
          </a>.
        </p>
      </div>
    </div>
  );
};

export default ApiKeySelector;

// Augment the Window interface
declare global {
  // FIX: Define AIStudio as a global interface to resolve declaration conflicts
  // and provide a consistent type for the aistudio object.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
