


import React, { useState, useEffect, useCallback, useRef } from 'react';
// FIX: Import the new `Preferences` type for use in component props and handlers.
import { Message, Visitor, LiveTranscription, Preferences } from './types';
import { generateText, generateImage, generateTextWithSearch, generateTextWithImage } from './services/geminiService';
import { getOrCreateVisitor, addSearchToVisitor, updateVisitorPreferences, addMemoryToVisitor, removeMemoryFromVisitor } from './services/firestoreService';
import { generateSpeech } from './services/ttsService';
import { AudioPlayer } from './utils/AudioPlayer';
import { LiveService } from './services/liveService';
import NameEntry from './components/NameEntry';
import HistorySidebar from './components/HistorySidebar';
import ChatInterface from './components/ChatInterface';
import Footer from './components/Footer';
import Header from './components/Header';
import WelcomeSplash from './components/WelcomeSplash';
import AdminPanel from './components/AdminPanel';
import PasswordModal from './components/PasswordModal';
import MobileSidebar from './components/MobileSidebar';
import PreferencesModal from './components/PreferencesModal';
import MemoryModal from './components/MemoryModal';
import LiveConversation from './components/LiveConversation';
import { LiveServerMessage } from '@google/genai';

type Mode = 'chat' | 'web' | 'image';
interface SendPromptOptions {
    image?: { data: string; mimeType: string; } | null;
}
type LiveStatus = 'idle' | 'connecting' | 'live' | 'error';

const App = () => {
    const [userName, setUserName] = useState<string | null>(null);
    const [visitor, setVisitor] = useState<Visitor | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isHistorySidebarVisible, setIsHistorySidebarVisible] = useState(true);

    // Feature States
    const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
    const [isMemoryOpen, setIsMemoryOpen] = useState(false);
    const [isLiveOpen, setIsLiveOpen] = useState(false);
    const [ttsMessageId, setTtsMessageId] = useState<string | null>(null);
    const [isTtsPlaying, setIsTtsPlaying] = useState(false);
    const [liveStatus, setLiveStatus] = useState<LiveStatus>('idle');
    const [liveError, setLiveError] = useState<string | null>(null);
    const [liveTranscriptions, setLiveTranscriptions] = useState<LiveTranscription[]>([]);
    const [currentInputTranscription, setCurrentInputTranscription] = useState('');
    const [currentOutputTranscription, setCurrentOutputTranscription] = useState('');

    const audioPlayerRef = useRef(new AudioPlayer());
    const liveServiceRef = useRef(new LiveService());
    
    const isOwner = userName?.trim().toLowerCase() === 'aikillerarokah';
    
    const handleNameSubmit = (name: string) => {
        setIsTransitioning(true);
        setUserName(name);
        setMessages([]);

        getOrCreateVisitor(name)
            .then(setVisitor)
            .catch(error => {
                console.error("Failed to connect to the database to save visitor data.", error);
                setVisitor({ name, searches: [], preferences: { interests: [], textModel: 'gemini-2.5-flash', imageModel: 'gemini-2.5-flash-image' }});
            });
    
        setTimeout(() => {
            setIsTransitioning(false);
        }, 3000);
    };
    
    const handleNewChat = useCallback(() => {
        if (window.confirm("Are you sure you want to start a new chat? This will clear your current conversation.")) {
            setMessages([]);
        }
    }, []);

    const handleSendPrompt = useCallback(async (prompt: string, mode: Mode, options?: SendPromptOptions) => {
        const userMessage: Message = {
            id: crypto.randomUUID(),
            sender: 'user',
            type: 'text',
            content: prompt,
            imageUrl: options?.image ? `data:${options.image.mimeType};base64,${options.image.data}` : undefined,
        };

        const conversationHistory = messages.slice(-20); 
        
        setMessages(prev => [...prev, userMessage]);
        if (prompt && !history.includes(prompt)) {
             setHistory(prev => [prompt, ...prev].slice(0, 30));
        }

        if (visitor?.id && prompt) {
            setVisitor(v => v ? ({...v, searches: [...v.searches, prompt]}) : null);
            addSearchToVisitor(visitor.id, prompt).catch(error => {
                console.error("Background Firestore update failed:", error);
            });
        }

        setIsLoading(true);

        const textModel = visitor?.preferences?.textModel || 'gemini-2.5-flash';
        const imageModel = visitor?.preferences?.imageModel || 'gemini-2.5-flash-image';

        const isImageGenerationRequest = mode === 'image' || (mode === 'chat' && /^(generate|create|draw|make|show me|imagine)\b/i.test(prompt.trim()) && !options?.image);
        
        if (isImageGenerationRequest) {
            if (userName) {
                const today = new Date().toISOString().split('T')[0];
                const key = 'arokah_image_counts';
                let counts: { [key: string]: { count: number; date: string } } = {};
                try {
                    const storedCountsStr = localStorage.getItem(key);
                    if (storedCountsStr) counts = JSON.parse(storedCountsStr);
                } catch (e) { console.error("Failed to parse image counts", e); }
                const userData = counts[userName] || { count: 0, date: today };
                if (userData.date !== today) {
                    userData.count = 0;
                    userData.date = today;
                }
                if (userData.count >= 5 && imageModel === 'gemini-2.5-flash-image') {
                    const errorMessage: Message = { id: crypto.randomUUID(), sender: 'ai', type: 'error', content: 'You have reached your daily limit of 5 standard image generations. Try AROKAH.Ai HD Image or try again tomorrow.'};
                    setMessages(prev => [...prev, errorMessage]);
                    setIsLoading(false);
                    return;
                }
            }
        }
        
        let aiMessage: Message | null = null;
        try {
            if (options?.image) {
                const { content, suggestions } = await generateTextWithImage(prompt, conversationHistory, options.image, userName!, visitor?.searches ?? [], visitor?.preferences, visitor?.memories, textModel);
                aiMessage = { id: crypto.randomUUID(), sender: 'ai', type: 'text', content, suggestions };
            } else {
                switch (mode) {
                    case 'web':
                        const { content, sources, suggestions } = await generateTextWithSearch(prompt, conversationHistory, userName!, visitor?.searches ?? [], visitor?.preferences, visitor?.memories, textModel);
                        aiMessage = { id: crypto.randomUUID(), sender: 'ai', type: 'text', content, sources, suggestions };
                        break;
                    case 'chat':
                    default:
                        if (isImageGenerationRequest) {
                            const imgContent = await generateImage(prompt, imageModel);
                            aiMessage = { id: crypto.randomUUID(), sender: 'ai', type: 'image', content: imgContent };
                            if (userName && imageModel === 'gemini-2.5-flash-image') {
                                const today = new Date().toISOString().split('T')[0];
                                const key = 'arokah_image_counts';
                                let counts: { [key: string]: { count: number; date: string } } = {};
                                try {
                                    const storedCountsStr = localStorage.getItem(key);
                                    if (storedCountsStr) counts = JSON.parse(storedCountsStr);
                                } catch (e) { console.error("Failed to parse image counts", e); }
                                const userData = counts[userName] || { count: 0, date: today };
                                if (userData.date !== today) counts[userName] = { count: 1, date: today };
                                else counts[userName] = { ...userData, count: userData.count + 1 };
                                try {
                                    localStorage.setItem(key, JSON.stringify(counts));
                                } catch (e) { console.error("Failed to save image counts", e); }
                            }
                        } else {
                            const { content, suggestions } = await generateText(prompt, conversationHistory, userName!, visitor?.searches ?? [], visitor?.preferences, visitor?.memories, textModel);
                            aiMessage = { id: crypto.randomUUID(), sender: 'ai', type: 'text', content, suggestions };
                        }
                        break;
                }
            }
            if (aiMessage) {
                if (!aiMessage.content?.trim()) {
                    aiMessage = { id: crypto.randomUUID(), sender: 'ai', type: 'error', content: 'AROKAH.ai returned an empty response. This might be due to a content filter or a temporary issue. Please try rephrasing your prompt.' };
                }
                setMessages(prev => [...prev, aiMessage!]);
            }
        } catch (error) {
            const errorMessage: Message = { id: crypto.randomUUID(), sender: 'ai', type: 'error', content: error instanceof Error ? error.message : 'An unknown error occurred.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [messages, history, visitor, userName]);
    
    const handleHistoryClick = useCallback((prompt: string) => {
        handleSendPrompt(prompt, 'chat');
    }, [handleSendPrompt]);

    const handleAdminAccessRequest = useCallback(() => {
        setPasswordError(null);
        setIsPasswordModalOpen(true);
    }, []);

    const handlePasswordSubmit = useCallback((password: string) => {
        if (password === "facemesh2007") {
            setIsPasswordModalOpen(false);
            setIsAdminPanelOpen(true);
            setPasswordError(null);
        } else {
            setPasswordError("Incorrect password. Please try again.");
        }
    }, []);

    const toggleHistorySidebar = () => setIsHistorySidebarVisible(prev => !prev);

    // Feature Handlers
    // FIX: Type the `prefs` parameter with the imported `Preferences` type.
    const handleSavePreferences = async (prefs: Preferences) => {
        if (!visitor || !visitor.id) return;
        try {
            await updateVisitorPreferences(visitor.id, prefs);
            setVisitor(v => v ? { ...v, preferences: prefs } : null);
            setIsPreferencesOpen(false);
        } catch (error) {
            console.error("Failed to save preferences:", error);
            // Optionally, show an error message to the user
        }
    };

    const handleAddMemory = async (memory: string) => {
        if (!visitor || !visitor.id) return;
        setVisitor(v => v ? { ...v, memories: [...(v.memories || []), memory] } : null);
        await addMemoryToVisitor(visitor.id, memory);
    };

    const handleRemoveMemory = async (memory: string) => {
        if (!visitor || !visitor.id) return;
        setVisitor(v => v ? { ...v, memories: v.memories?.filter(m => m !== memory) } : null);
        await removeMemoryFromVisitor(visitor.id, memory);
    };
    
    const handleToggleTTS = useCallback(async (messageId: string, text: string) => {
        if (isTtsPlaying && ttsMessageId === messageId) {
            audioPlayerRef.current.stop();
            setIsTtsPlaying(false);
            setTtsMessageId(null);
        } else {
            setIsTtsPlaying(true);
            setTtsMessageId(messageId);
            try {
                const audio = await generateSpeech(text);
                await audioPlayerRef.current.play(audio, () => {
                    setIsTtsPlaying(false);
                    setTtsMessageId(null);
                });
            } catch (error) {
                console.error("TTS failed:", error);
                setIsTtsPlaying(false);
                setTtsMessageId(null);
            }
        }
    }, [isTtsPlaying, ttsMessageId]);

    const handleStartLive = useCallback(() => {
        if (!visitor) return;
        setLiveStatus('connecting');
        setLiveError(null);
        liveServiceRef.current.startSession(
            visitor.name,
            visitor.searches,
            visitor.preferences,
            visitor.memories,
            (message: LiveServerMessage) => {
                if (liveStatus !== 'live') setLiveStatus('live');
                if (message.serverContent?.outputTranscription) {
                    setCurrentOutputTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
                }
                if (message.serverContent?.inputTranscription) {
                    setCurrentInputTranscription(prev => prev + message.serverContent!.inputTranscription!.text);
                }
                if (message.serverContent?.turnComplete) {
                    setLiveTranscriptions(prev => [
                        ...prev,
                        { sender: 'user', text: currentInputTranscription },
                        { sender: 'ai', text: currentOutputTranscription }
                    ]);
                    setCurrentInputTranscription('');
                    setCurrentOutputTranscription('');
                }
            },
            (error: Error) => {
                setLiveStatus('error');
                setLiveError(error.message);
            }
        );
    }, [visitor, liveStatus, currentInputTranscription, currentOutputTranscription]);

    const handleStopLive = useCallback(() => {
        liveServiceRef.current.closeSession();
        setLiveStatus('idle');
    }, []);
    
    const handleCloseLive = useCallback(() => {
        handleStopLive();
        setIsLiveOpen(false);
    }, [handleStopLive]);

    if (!userName) return <NameEntry onNameSubmit={handleNameSubmit} />;
    if (isTransitioning) return <WelcomeSplash />;

    return (
        <div className="flex h-screen w-full bg-slate-100">
            {isHistorySidebarVisible && (
                <HistorySidebar 
                    history={history} 
                    onHistoryClick={handleHistoryClick} 
                    onAdminAccessClick={handleAdminAccessRequest}
                    onNewChat={handleNewChat}
                    isOwner={isOwner}
                />
            )}
             <MobileSidebar
                isOpen={isMobileSidebarOpen}
                onClose={() => setIsMobileSidebarOpen(false)}
                history={history}
                onHistoryClick={handleHistoryClick}
                onAdminAccessClick={handleAdminAccessRequest}
                onNewChat={handleNewChat}
                isOwner={isOwner}
            />
            <div className="flex-1 grid grid-rows-[auto_1fr_auto] transition-all duration-300 ease-in-out">
                <Header 
                    onMenuClick={() => setIsMobileSidebarOpen(true)} 
                    onToggleHistory={toggleHistorySidebar}
                    onOpenLive={() => setIsLiveOpen(true)}
                    onOpenMemory={() => setIsMemoryOpen(true)}
                    onOpenPreferences={() => setIsPreferencesOpen(true)}
                />
                <main className="overflow-hidden relative">
                    <ChatInterface
                        messages={messages}
                        isLoading={isLoading}
                        onSendPrompt={handleSendPrompt}
                        userName={userName}
                        onToggleTTS={handleToggleTTS}
                        onSaveMemory={handleAddMemory}
                        isTtsPlaying={isTtsPlaying}
                        ttsMessageId={ttsMessageId}
                    />
                </main>
                <Footer />
            </div>
            <AdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} />
            <PasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => { setIsPasswordModalOpen(false); setPasswordError(null); }}
                onSubmit={handlePasswordSubmit}
                error={passwordError}
            />
            <PreferencesModal
                isOpen={isPreferencesOpen}
                onClose={() => setIsPreferencesOpen(false)}
                onSave={handleSavePreferences}
                currentPreferences={visitor?.preferences || { interests: [], textModel: 'gemini-2.5-flash', imageModel: 'gemini-2.5-flash-image' }}
            />
            <MemoryModal
                isOpen={isMemoryOpen}
                onClose={() => setIsMemoryOpen(false)}
                memories={visitor?.memories || []}
                onRemoveMemory={handleRemoveMemory}
            />
            <LiveConversation
                isOpen={isLiveOpen}
                onClose={handleCloseLive}
                status={liveStatus}
                error={liveError}
                onStart={handleStartLive}
                onStop={handleStopLive}
                transcriptions={liveTranscriptions}
                currentInput={currentInputTranscription}
                currentOutput={currentOutputTranscription}
            />
        </div>
    );
};

export default App;