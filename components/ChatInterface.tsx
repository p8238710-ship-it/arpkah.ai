

import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { BotIcon, UserIcon, SendIcon, CameraIcon, LightbulbIcon, BookIcon, InfoIcon, BrandIcon, SearchIcon, ArrowUpIcon, PaperclipIcon, CloseIcon, DownloadIcon, SpeakerIcon, BookmarkIcon } from './Icons';

type Mode = 'chat' | 'web' | 'image';

// A simple markdown renderer component
const MarkdownRenderer = ({ content }: { content: string }) => {
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const parts = content.split(codeBlockRegex);

    const renderInlines = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/~~(.*?)~~/g, '<del>$1</del>')
            .replace(/`([^`]+)`/g, '<code class="bg-gray-200 text-gray-800 rounded px-1 py-0.5 font-mono text-sm">$1</code>');
    };

    const renderTable = (block: string) => {
        const rows = block.trim().split('\n');
        const headerRow = rows[0];
        const bodyRows = rows.slice(2);

        const headers = headerRow.split('|').map(h => h.trim()).filter(Boolean);
        const body = bodyRows.map(row => row.split('|').map(c => c.trim()).filter(Boolean));

        return (
            <div className="overflow-x-auto my-2">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {headers.map((header, i) => (
                                <th key={i} scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" dangerouslySetInnerHTML={{ __html: renderInlines(header) }} />
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {body.map((row, i) => (
                            <tr key={i}>
                                {row.map((cell, j) => (
                                    <td key={j} className="px-4 py-2 whitespace-normal text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: renderInlines(cell) }} />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="prose prose-slate max-w-none text-gray-800">
            {parts.map((part, index) => {
                if (index % 2 === 1) {
                    return <pre key={index} className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm my-2 whitespace-pre-wrap">{part.trim()}</pre>;
                }

                return part.trim().split(/(\r\n\r\n|\n\n)/).map((block, blockIndex) => {
                    const trimmedBlock = block.trim();
                    if (!trimmedBlock) return null;

                    if (trimmedBlock.includes('|') && trimmedBlock.includes('---')) {
                        return <React.Fragment key={blockIndex}>{renderTable(trimmedBlock)}</React.Fragment>;
                    }
                    if (trimmedBlock.startsWith('### ')) return <h3 key={blockIndex} className="text-lg font-semibold" dangerouslySetInnerHTML={{ __html: renderInlines(trimmedBlock.substring(4)) }} />;
                    if (trimmedBlock.startsWith('## ')) return <h2 key={blockIndex} className="text-xl font-semibold" dangerouslySetInnerHTML={{ __html: renderInlines(trimmedBlock.substring(3)) }} />;
                    if (trimmedBlock.startsWith('# ')) return <h1 key={blockIndex} className="text-2xl font-semibold" dangerouslySetInnerHTML={{ __html: renderInlines(trimmedBlock.substring(2)) }} />;

                    if (trimmedBlock.startsWith('* ') || trimmedBlock.startsWith('- ')) {
                        const items = trimmedBlock.split('\n').map(item => item.replace(/^(\*|-)\s/, ''));
                        return (
                            <ul key={blockIndex} className="list-disc pl-5 space-y-1">
                                {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: renderInlines(item) }} />)}
                            </ul>
                        );
                    }
                    
                    if (/^\d+\.\s/.test(trimmedBlock)) {
                        const items = trimmedBlock.split('\n').map(item => item.replace(/^\d+\.\s/, ''));
                        return (
                            <ol key={blockIndex} className="list-decimal pl-5 space-y-1">
                                {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: renderInlines(item) }} />)}
                            </ol>
                        );
                    }

                    return <p key={blockIndex} className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderInlines(trimmedBlock) }} />;
                }).filter(Boolean);
            })}
        </div>
    );
};

const SuggestedQuestions = ({ questions, onQuestionClick }: { questions: string[]; onQuestionClick: (question: string) => void; }) => {
    if (!questions || questions.length === 0) return null;
    return (
        <div className="mt-3 flex flex-wrap items-start gap-2">
            {questions.map((q, i) => (
                <button
                    key={i}
                    onClick={() => onQuestionClick(q)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-200 transition-all duration-200 hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-slate-400 animate-fade-in-up"
                    style={{ animationDelay: `${i * 100}ms` }}
                >
                    {q}
                </button>
            ))}
        </div>
    );
};

interface MessageBubbleProps {
  message: Message;
  onSuggestionClick: (prompt: string) => void;
  onToggleTTS: (messageId: string, text: string) => void;
  onSaveMemory: (text: string) => void;
  isTtsPlaying: boolean;
  ttsMessageId: string | null;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSuggestionClick, onToggleTTS, onSaveMemory, isTtsPlaying, ttsMessageId }) => {
  const [isImageLoaded, setIsImageLoaded] = React.useState(false);
  const isAi = message.sender === 'ai';
  const isError = message.type === 'error';
  const isPlaying = isTtsPlaying && ttsMessageId === message.id;

  const handleDownloadImage = () => {
    if (message.type !== 'image') return;
    const link = document.createElement('a');
    link.href = message.content;
    const mimeType = message.content.split(';')[0].split(':')[1] || 'image/png';
    const extension = mimeType.split('/')[1] || 'png';
    link.download = `arokah-ai-image-${message.id}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`flex items-start gap-3 my-4 animate-fade-in-up ${isAi ? '' : 'flex-row-reverse'}`}>
      <div className="relative flex-shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAi ? 'bg-gray-900' : 'bg-gray-300'}`}>
            {isAi ? <BotIcon className="w-6 h-6 text-white" /> : <UserIcon className="w-6 h-6 text-gray-700" />}
        </div>
      </div>
      <div className={`rounded-2xl max-w-[85%] sm:max-w-md md:max-w-lg lg:max-w-2xl ${isAi ? 'bg-white border border-gray-200 shadow-sm sparkle-effect' : 'bg-gray-900 text-white shadow-sm'} ${isError ? 'bg-red-100 border border-red-300' : ''}`}>
        <div className="p-4">
            {message.imageUrl && <img src={message.imageUrl} alt="User upload" className="rounded-md max-w-sm mb-2" />}
            
            {message.type === 'image' && (
                <div className="max-w-sm">
                    {!isImageLoaded && (
                        <div className="w-full aspect-square rounded-lg shimmer-placeholder"></div>
                    )}
                    <img 
                        src={message.content} 
                        alt="Generated" 
                        className={`rounded-md w-full h-auto ${isImageLoaded ? 'block' : 'hidden'}`}
                        onLoad={() => setIsImageLoaded(true)}
                    />
                </div>
            )}

            {message.type === 'error' && <p className="text-red-800 whitespace-pre-wrap">{message.content}</p>}
            {message.type === 'text' && (isAi ? <MarkdownRenderer content={message.content} /> : <p className="whitespace-pre-wrap">{message.content}</p>)}
        </div>
         
        {isAi && !isError && (message.type === 'text' || message.type === 'image') && message.content && (
          <div className="p-2 border-t border-gray-200 flex items-center justify-end gap-1">
            {message.type === 'text' && (
              <button
                onClick={() => onToggleTTS(message.id, message.content)}
                className={`p-1.5 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${isPlaying ? 'bg-indigo-100 text-indigo-600' : ''}`}
                title={isPlaying ? 'Stop audio' : 'Read aloud'}
              >
                <SpeakerIcon className="w-5 h-5" />
              </button>
            )}
            {message.type === 'text' && (
                 <button
                    onClick={() => onSaveMemory(message.content)}
                    className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    title="Remember this"
                 >
                    <BookmarkIcon className="w-5 h-5" />
                </button>
            )}
            {message.type === 'image' && (
                <button
                onClick={handleDownloadImage}
                className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                title="Download image"
                >
                <DownloadIcon className="w-5 h-5" />
                </button>
            )}
          </div>
        )}
        {message.sources && message.sources.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Sources:</h4>
            <ul className="space-y-1">
              {message.sources.map((source, index) => (
                <li key={index} className="truncate">
                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    {index + 1}. {source.title || source.uri}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {isAi && message.suggestions && message.suggestions.length > 0 && (
            <div className="p-4 border-t border-gray-200">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Let's explore further:</h4>
                <SuggestedQuestions questions={message.suggestions} onQuestionClick={onSuggestionClick} />
            </div>
        )}
      </div>
    </div>
  );
};

const LoadingBubble = () => {
    const messages = [
        "Processing with maximum speed...",
        "Verifying for 100% accuracy...",
        "Composing a swift response...",
        "Analyzing with precision...",
        "Just a moment, ensuring accuracy...",
    ];
    const [currentMessage, setCurrentMessage] = useState(messages[0]);

    useEffect(() => {
        // Start with a random message for variety
        setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);

        const interval = setInterval(() => {
            setCurrentMessage(prevMessage => {
                const currentIndex = messages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % messages.length;
                return messages[nextIndex];
            });
        }, 2500); // Change message every 2.5 seconds

        return () => clearInterval(interval);
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <div className="flex items-start gap-3 my-4 animate-fade-in-up">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-900">
                <BotIcon className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-gray-200 flex items-center space-x-3 shadow-sm">
                <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both]" style={{ animationDelay: '0.16s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both]" style={{ animationDelay: '0.32s' }}></div>
                </div>
                <p className="text-sm text-gray-600 font-medium">{currentMessage}</p>
            </div>
        </div>
    );
};

const SuggestedPrompts = ({ onPromptClick }: { onPromptClick: (prompt: string) => void }) => {
    const prompts = [
        { 
            title: "Create an image", 
            prompt: "create image of car flying with high speed", 
            icon: <CameraIcon className="w-6 h-6 text-gray-500" /> 
        },
        { 
            title: "Explain a concept", 
            prompt: "Explain quantum computing in simple terms", 
            icon: <LightbulbIcon className="w-6 h-6 text-gray-500" /> 
        },
        { 
            title: "Write a story", 
            prompt: "Write a short story about a friendly robot", 
            icon: <BookIcon className="w-6 h-6 text-gray-500" /> 
        },
        { 
            title: "Ask about the AI", 
            prompt: "tell me about AROKAH.Ai in 100 words", 
            icon: <InfoIcon className="w-6 h-6 text-gray-500" /> 
        },
    ];

  return (
      <div className="flex flex-col items-center text-center pt-8">
        <div className="mb-8 animate-fade-in-down">
            <div className="flex justify-center mb-4">
                 <BrandIcon className="w-16 h-16" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-sans font-bold text-gray-900">AROKAH.Ai</h1>
            <h2 className="text-xl text-gray-500 mt-2">How can I help you today?</h2>
        </div>

        <div className="w-full max-w-3xl mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <p className="text-sm text-gray-500 mb-2">Start a chat in:</p>
            <button
                onClick={() => onPromptClick("ನಮಸ್ಕಾರ! ನೀವು ಹೇಗಿದ್ದೀರಾ?")}
                className="px-4 py-2 bg-white rounded-lg text-lg font-semibold text-gray-800 hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:shadow-md hover:border-gray-300 transform hover:-translate-y-0.5"
                style={{ fontFamily: "'Noto Sans Kannada', sans-serif" }}
            >
                ಕನ್ನಡ
            </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {prompts.map((p) => (
            <button
                key={p.prompt}
                onClick={() => onPromptClick(p.prompt)}
                className="flex items-center gap-4 p-4 bg-white rounded-lg text-left text-gray-700 hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:shadow-xl hover:border-gray-300 transform hover:-translate-y-1"
            >
                <div className="flex-shrink-0 p-2 bg-gray-100 rounded-full">{p.icon}</div>
                <div className="overflow-hidden">
                    <h3 className="font-semibold text-gray-800">{p.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{p.prompt}</p>
                </div>
            </button>
        ))}
        </div>
    </div>
  );
};

const ModeSelector = ({ selectedMode, onSelectMode }: { selectedMode: Mode, onSelectMode: (mode: Mode) => void }) => {
    const modes = [
        { id: 'chat', icon: <BotIcon className="w-5 h-5" />, label: 'Chat' },
        { id: 'web', icon: <SearchIcon className="w-5 h-5" />, label: 'Web' },
        { id: 'image', icon: <CameraIcon className="w-5 h-5" />, label: 'Image' },
    ] as const;

    return (
        <div className="flex justify-center items-center gap-2 mb-4 px-4">
            <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-gray-200 shadow-sm flex items-center gap-1">
            {modes.map(mode => (
                <button
                    key={mode.id}
                    onClick={() => onSelectMode(mode.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-100 ${
                        selectedMode === mode.id 
                            ? 'bg-gray-900 text-white shadow-lg' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                    aria-pressed={selectedMode === mode.id}
                >
                    {mode.icon}
                    <span className="hidden sm:inline">{mode.label}</span>
                </button>
            ))}
            </div>
        </div>
    );
};

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendPrompt: (prompt: string, mode: Mode, options?: { image?: { data: string; mimeType: string } | null }) => void;
  userName: string | null;
  onToggleTTS: (messageId: string, text: string) => void;
  onSaveMemory: (text: string) => void;
  isTtsPlaying: boolean;
  ttsMessageId: string | null;
}

const ChatInterface = (props: ChatInterfaceProps) => {
  const { messages, isLoading, onSendPrompt, userName, onToggleTTS, onSaveMemory, isTtsPlaying, ttsMessageId } = props;
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<Mode>('chat');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{data: string, mimeType: string} | null>(null);
  const [modeNotification, setModeNotification] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notificationTimerRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading, mode]);

  useEffect(() => {
    return () => {
        if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 160);
      textareaRef.current.style.height = `${newHeight}px`;
      textareaRef.current.style.overflowY = textareaRef.current.scrollHeight > 160 ? 'auto' : 'hidden';
    }
  }, [prompt]);

  const handleModeChange = (newMode: Mode) => {
    if (newMode === mode) return;
    setMode(newMode);
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    let notificationText = '';
    switch(newMode) {
        case 'web': notificationText = 'Web Search Mode Activated'; break;
        case 'image': notificationText = 'Image Generation Mode Activated'; break;
        case 'chat': notificationText = 'Chat Mode Activated'; break;
    }
    setModeNotification(notificationText);
    notificationTimerRef.current = window.setTimeout(() => setModeNotification(null), 2500);
  };

  const removeImage = () => {
      setImagePreview(null);
      setImageData(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
  }

  const submitPrompt = () => {
    if ((prompt.trim() || imageData) && !isLoading) {
      onSendPrompt(prompt.trim(), mode, { image: imageData });
      setPrompt('');
      removeImage();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPrompt();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitPrompt();
    }
  };
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
              const base64Url = loadEvent.target?.result as string;
              setImagePreview(base64Url);
              const [header, data] = base64Url.split(',');
              const mimeType = header.match(/:(.*?);/)?.[1];
              if (data && mimeType) setImageData({ data, mimeType });
          };
          reader.readAsDataURL(file);
      }
  };

  const getPlaceholderText = () => {
    if(imageData) return 'Describe the image or ask a question...';
    switch(mode) {
        case 'web': return 'Search the web...';
        case 'image': return 'Describe the image you want to create...';
        case 'chat':
        default: return `Hi ${userName}, ask AROKAH.Ai anything...`;
    }
  };

  const renderContent = () => {
    if (messages.length === 0 && !isLoading) {
        return <SuggestedPrompts onPromptClick={(p) => {
            const newMode: Mode = p.startsWith('create image') ? 'image' : 'chat';
            handleModeChange(newMode);
            onSendPrompt(p, newMode);
        }} />;
    }
    return (
        <>
            {messages.map((msg) => (
                <MessageBubble 
                    key={msg.id} 
                    message={msg} 
                    onSuggestionClick={(suggestion) => onSendPrompt(suggestion, mode)}
                    onToggleTTS={onToggleTTS}
                    onSaveMemory={onSaveMemory}
                    isTtsPlaying={isTtsPlaying}
                    ttsMessageId={ttsMessageId}
                />
            ))}
            {isLoading && <LoadingBubble />}
        </>
    );
  };

  const renderInputArea = () => {
    return (
        <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              {imagePreview && (
                  <div className="absolute bottom-full left-0 mb-2 p-1 bg-white border border-gray-300 rounded-lg shadow-sm">
                      <div className="relative w-20 h-20">
                          <img src={imagePreview} alt="upload preview" className="w-full h-full object-cover rounded-md" />
                          <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 p-1 bg-gray-800 text-white rounded-full hover:bg-red-600 transition-colors" aria-label="Remove image">
                              <CloseIcon className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 text-gray-600 hover:text-gray-900 transition-colors" aria-label="Attach image">
                  <PaperclipIcon className="w-5 h-5" />
              </button>
              <textarea ref={textareaRef} rows={1} value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={handleKeyDown} placeholder={getPlaceholderText()} className="w-full pl-14 pr-28 py-3 bg-white border border-gray-300 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:shadow-md shadow-sm transition-shadow duration-300 resize-none" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                  <button type="submit" disabled={isLoading || (!prompt.trim() && !imageData)} className="p-2.5 bg-gray-900 rounded-full text-white hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 active:scale-100" aria-label="Send message">
                    <SendIcon className="w-5 h-5" />
                  </button>
              </div>
            </form>
        </div>
    );
  };


  return (
    <div className="flex-1 flex flex-col bg-slate-100 h-full">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-4">
        {renderContent()}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-200 bg-slate-50/80 backdrop-blur-md">
        <div className="relative">
            {modeNotification && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-max mb-3 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold shadow-lg animate-fade-in-up z-10">
                    {modeNotification}
                </div>
            )}
            <ModeSelector selectedMode={mode} onSelectMode={handleModeChange} />
        </div>
        {renderInputArea()}
      </div>
    </div>
  );
};

export default ChatInterface;
