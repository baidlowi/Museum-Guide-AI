
import React, { useState, useRef, useEffect } from 'react';
import { Artifact, ChatMessage } from '../types';
import { initializeChat, sendMessageStream, generateTextToSpeech, generateDynamicQuestions } from '../services/geminiService';
import { decodeBase64ToBytes, createAudioBufferFromPCM } from '../utils/audioUtils';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  artifact: Artifact;
  initialQuestion?: string | null;
  onQuestionConsumed?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ artifact, initialQuestion, onQuestionConsumed }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Suggested Questions State
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  // Audio state
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Initialize Chat Session when artifact changes
  useEffect(() => {
    initializeChat(artifact);
    
    // Set initial welcome message
    setMessages([
      {
        id: 'init-1',
        role: 'model',
        text: `Halo! Saya Curio, pemandu AI Anda. Saat ini kita sedang melihat **${artifact.title}**. Apa yang ingin Anda ketahui tentangnya?`
      }
    ]);
    // Reset suggestions to the default ones from artifact data
    setSuggestions(artifact.suggestedQuestions);
    initializedRef.current = true;
  }, [artifact]);

  // Handle incoming initial question from props (e.g. from ArtifactDisplay)
  useEffect(() => {
    if (initialQuestion && !isLoading) {
      handleSend(initialQuestion);
      if (onQuestionConsumed) {
        onQuestionConsumed();
      }
    }
  }, [initialQuestion]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => stopAudio();
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, suggestions]); // Also scroll when suggestions update

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Ignore
      }
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
    setPlayingMessageId(null);
  };

  const handlePlayAudio = async (msgId: string, text: string) => {
    // If clicking the currently playing message, stop it
    if (playingMessageId === msgId) {
      stopAudio();
      return;
    }

    // Stop any existing audio
    stopAudio();
    setLoadingAudioId(msgId);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const base64Audio = await generateTextToSpeech(text);
      if (!base64Audio) throw new Error("Gagal membuat audio");

      const audioBytes = decodeBase64ToBytes(base64Audio);
      const audioBuffer = createAudioBufferFromPCM(audioBytes, audioContextRef.current);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      source.onended = () => {
        setPlayingMessageId(null);
        audioSourceRef.current = null;
      };

      source.start();
      audioSourceRef.current = source;
      setPlayingMessageId(msgId);

    } catch (error) {
      console.error("Audio playback error:", error);
    } finally {
      setLoadingAudioId(null);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    // Stop audio if user sends a message
    stopAudio();

    const userMsgId = Date.now().toString();
    const modelMsgId = (Date.now() + 1).toString();

    // 1. Add User Message
    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', text: textToSend }
    ]);
    setInput('');
    setIsLoading(true);
    setSuggestions([]); // Clear suggestions while thinking

    try {
      // 2. Add Placeholder Model Message
      setMessages(prev => [
        ...prev,
        { id: modelMsgId, role: 'model', text: '', isStreaming: true }
      ]);

      // 3. Stream Response
      let fullText = '';
      const stream = sendMessageStream(textToSend);
      
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === modelMsgId 
              ? { ...msg, text: fullText } 
              : msg
          )
        );
      }

      // 4. Finalize
      setMessages(prev => 
        prev.map(msg => 
          msg.id === modelMsgId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

      // 5. Generate Dynamic Follow-up Questions
      setIsGeneratingSuggestions(true);
      const newSuggestions = await generateDynamicQuestions(artifact.title, fullText);
      if (newSuggestions && newSuggestions.length > 0) {
        setSuggestions(newSuggestions);
      } else {
        // Fallback to default if generation fails
        setSuggestions(artifact.suggestedQuestions.slice(0, 3));
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'model', text: "Saya mengalami kesulitan terhubung ke arsip museum saat ini. Silakan coba lagi." }
      ]);
      setSuggestions(artifact.suggestedQuestions);
    } finally {
      setIsLoading(false);
      setIsGeneratingSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3 items-end`}>
              
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mb-1 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'}`}>
                {msg.role === 'user' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                ) : (
                  // Museum Icon for AI
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                  </svg>
                )}
              </div>

              {/* Bubble and Actions */}
              <div className="flex flex-col gap-1 items-start">
                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-gray-100 text-slate-800 rounded-tl-none'
                }`}>
                  {msg.role === 'model' ? (
                    <ReactMarkdown 
                      components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                  {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-slate-400 animate-pulse"/>}
                </div>
                
                {/* Audio Button for Model Messages */}
                {msg.role === 'model' && !msg.isStreaming && msg.text && (
                  <button 
                    onClick={() => handlePlayAudio(msg.id, msg.text)}
                    disabled={loadingAudioId === msg.id}
                    className={`ml-1 p-1.5 rounded-full transition-colors flex items-center gap-1.5 text-xs font-medium ${
                      playingMessageId === msg.id 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-50 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                    }`}
                    title="Dengarkan penjelasan"
                  >
                     {loadingAudioId === msg.id ? (
                      <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : playingMessageId === msg.id ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                          <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                        </svg>
                        <span>Berhenti</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                           <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                        </svg>
                        <span>Dengar</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator for Chat */}
        {isLoading && (
          <div className="flex w-full justify-start animate-pulse">
            <p className="text-xs text-slate-400 ml-12">Curio sedang berpikir...</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions (Dynamic) */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100 transition-all duration-500">
        <div className="flex items-center justify-between mb-2">
           <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
             {isGeneratingSuggestions ? "Menyiapkan saran..." : "Coba tanyakan:"}
           </p>
           {isGeneratingSuggestions && (
             <div className="w-3 h-3 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
           )}
        </div>
        
        <div className="flex flex-wrap gap-2 min-h-[32px]">
          {suggestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading || isGeneratingSuggestions}
              className={`px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all text-left animate-fadeIn shadow-sm ${isLoading ? 'opacity-50' : 'opacity-100'}`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tanyakan tentang karya seni, seniman, atau sejarah..."
            className="w-full pl-4 pr-12 py-3.5 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-slate-700 placeholder-slate-400"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
               <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
