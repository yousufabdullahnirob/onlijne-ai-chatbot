
import React, { useState, useRef, useEffect } from 'react';
import { connectToLive, LiveSession } from '../services/geminiService';
import { MicIcon } from './icons';

const LiveView: React.FC = () => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userTranscription, setUserTranscription] = useState('');
    const [modelTranscription, setModelTranscription] = useState('');
    const [history, setHistory] = useState<{ user: string; model: string }[]>([]);

    const sessionRef = useRef<LiveSession | null>(null);
    
    const handleStart = async () => {
        setIsConnecting(true);
        setError(null);
        setHistory([]);
        setUserTranscription('');
        setModelTranscription('');

        try {
            const session = await connectToLive({
                onUserInput: (text) => setUserTranscription(prev => prev + text),
                onModelInput: (text) => setModelTranscription(prev => prev + text),
                onTurnComplete: (user, model) => {
                    setHistory(prev => [...prev, { user, model }]);
                    setUserTranscription('');
                    setModelTranscription('');
                },
                onClose: () => {
                    setIsActive(false);
                    setIsConnecting(false);
                    sessionRef.current = null;
                },
                onError: (err) => {
                    setError(`An error occurred: ${err.message}`);
                    setIsActive(false);
                    setIsConnecting(false);
                    sessionRef.current = null;
                }
            });
            sessionRef.current = session;
            setIsActive(true);
        } catch (err) {
            setError(err instanceof Error ? `Failed to start session: ${err.message}` : 'An unknown error occurred.');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleStop = () => {
        sessionRef.current?.close();
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            sessionRef.current?.close();
        };
    }, []);

    const buttonState = isConnecting ? 'Connecting...' : isActive ? 'Stop Conversation' : 'Start Conversation';

    return (
        <div className="flex flex-col h-full bg-gray-800 p-4 md:p-8">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white">Live Conversation</h2>
                <p className="text-gray-400 mt-2">Speak directly with Gemini in real-time.</p>
            </div>

            <div className="flex-1 bg-gray-900 rounded-lg p-4 overflow-y-auto space-y-4">
                {history.map((turn, index) => (
                    <div key={index} className="space-y-2">
                        <p><strong className="text-indigo-400">You:</strong> {turn.user}</p>
                        <p><strong className="text-teal-400">Gemini:</strong> {turn.model}</p>
                    </div>
                ))}
                {isActive && (
                    <div className="space-y-2">
                        {userTranscription && <p><strong className="text-indigo-400">You:</strong> {userTranscription}</p>}
                        {modelTranscription && <p><strong className="text-teal-400">Gemini:</strong> {modelTranscription}</p>}
                    </div>
                )}
            </div>

            <div className="mt-6 flex flex-col items-center">
                 <button
                    onClick={isActive ? handleStop : handleStart}
                    disabled={isConnecting}
                    className={`flex items-center justify-center gap-3 w-full max-w-xs px-6 py-4 text-lg font-semibold text-white rounded-full transition-all duration-300 shadow-lg
                        ${isConnecting ? 'bg-yellow-600 cursor-not-allowed' : ''}
                        ${isActive ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}
                    `}
                >
                    <MicIcon className="w-6 h-6" />
                    {buttonState}
                </button>
                {error && <p className="text-red-400 mt-4">{error}</p>}
                {!isActive && !isConnecting && (
                    <p className="text-gray-500 mt-4 text-sm">Click "Start Conversation" and grant microphone access to begin.</p>
                )}
            </div>
        </div>
    );
};

export default LiveView;
