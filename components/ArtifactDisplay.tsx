
import React, { useState, useRef, useEffect } from 'react';
import { Artifact } from '../types';
import { generateArtifactAudioIntro } from '../services/geminiService';
import { decodeBase64ToBytes, createAudioBufferFromPCM } from '../utils/audioUtils';

interface ArtifactDisplayProps {
  artifact: Artifact;
  onAskQuestion?: (question: string) => void;
}

const ArtifactDisplay: React.FC<ArtifactDisplayProps> = ({ artifact, onAskQuestion }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isMountedRef = useRef(true);

  // Track component mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // Main effect: Cleanup old audio and Autoplay new audio when artifact changes
  useEffect(() => {
    stopAudio();
    
    // Trigger Autoplay
    startAudio(true);

    return () => stopAudio();
  }, [artifact]);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const startAudio = async (isAutoplay = false) => {
    if (isLoadingAudio) return;

    setIsLoadingAudio(true);
    try {
      // Initialize Audio Context
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      // Try to resume if suspended (autoplay policy)
      if (audioContextRef.current.state === 'suspended') {
        try {
          await audioContextRef.current.resume();
        } catch (e) {
          console.warn("Autoplay audio blocked by browser policy. User interaction required.");
          // If autoplay blocked, stop here. User can click button manually.
          if (isAutoplay) return;
        }
      }

      // Fetch audio from Gemini
      const base64Audio = await generateArtifactAudioIntro(artifact);
      
      if (!isMountedRef.current) return;

      if (!base64Audio) {
        throw new Error("Tidak ada data audio yang diterima");
      }

      // Decode PCM
      const audioBytes = decodeBase64ToBytes(base64Audio);
      const audioBuffer = createAudioBufferFromPCM(audioBytes, audioContextRef.current);

      if (!isMountedRef.current) return;

      // Play
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        if (isMountedRef.current) {
          setIsPlaying(false);
          audioSourceRef.current = null;
        }
      };

      source.start();
      audioSourceRef.current = source;
      setIsPlaying(true);

    } catch (error) {
      console.error("Gagal memutar panduan audio:", error);
      // Only show alert if user manually clicked. Silent fail for autoplay.
      if (!isAutoplay && isMountedRef.current) {
        alert("Tidak dapat memuat panduan audio saat ini.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingAudio(false);
      }
    }
  };

  const handleToggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio(false);
    }
  };

  const handleStoryMode = () => {
    if (onAskQuestion) {
      onAskQuestion(`Ceritakan kisah lengkap dan mendalam tentang sejarah "${artifact.title}" dengan gaya bercerita (storytelling) yang emosional dan hidup. Bawa saya kembali ke masa lalu dan gambarkan suasananya.`);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto p-4 md:p-8 scroll-smooth bg-gray-50/50">
      <div className="max-w-3xl mx-auto pb-24 md:pb-12">
        
        {/* Framed Image Container */}
        <div className="group relative mx-auto mb-6 md:mb-10 transition-transform duration-500 hover:scale-[1.01]">
          {/* Shadow behind the frame */}
          <div className="absolute -inset-4 bg-black/20 blur-xl rounded-[2rem] transform translate-y-4"></div>
          
          {/* The Physical Frame */}
          <div className="relative bg-white p-2.5 md:p-5 rounded shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200">
            {/* Inner Mat/Passe-partout Effect */}
            <div className="relative overflow-hidden bg-slate-100 shadow-inner">
              <img 
                src={artifact.imageUrl} 
                alt={artifact.title}
                className="w-full h-auto object-cover relative z-10"
              />
              
              {/* Glass Reflection / Glossy Overlay */}
              <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-white/30 opacity-60 mix-blend-overlay"></div>
              <div className="absolute -inset-full top-0 block z-20 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
            </div>
            
            {/* Frame Texture/Bevel */}
            <div className="absolute inset-0 border-[1px] border-white/50 rounded pointer-events-none"></div>
          </div>
        </div>
        
        <div className="space-y-5 md:space-y-6">
          
          {/* Header Section: Title & Metadata */}
          <div>
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-slate-900 leading-tight mb-2 drop-shadow-sm">
              {artifact.title}
            </h2>
            
            <div className="flex flex-wrap items-center gap-x-3 text-slate-600 text-sm md:text-lg">
              <span className="font-semibold">{artifact.artist}</span>
              <span className="text-slate-300">•</span>
              <span>{artifact.year}</span>
            </div>
          </div>

          {/* Action Bar: Period Badge & Buttons */}
          <div className="flex items-center justify-between border-t border-b border-gray-200/50 py-3">
             <div className="inline-block px-3 py-1 bg-white border border-slate-200 shadow-sm text-slate-700 text-xs font-semibold uppercase tracking-wider rounded-md">
               {artifact.period}
             </div>

             <div className="flex items-center gap-3">
                {/* Audio Guide Button */}
                <button
                  onClick={handleToggleAudio}
                  disabled={isLoadingAudio}
                  className={`
                    flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-md border border-white/20
                    ${isPlaying 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 ring-2 ring-red-200' 
                      : 'bg-slate-800 text-white hover:bg-slate-700 hover:shadow-lg'
                    }
                    ${isLoadingAudio ? 'opacity-70 cursor-wait' : ''}
                  `}
                  title={isPlaying ? "Hentikan Panduan Audio" : "Putar Panduan Audio Singkat"}
                >
                  {isLoadingAudio ? (
                    <svg className="animate-spin h-4 w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                      <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6 ml-0.5">
                      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                      <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                    </svg>
                  )}
                </button>

                {/* Story Mode Button */}
                {onAskQuestion && (
                   <button
                   onClick={handleStoryMode}
                   className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-md border border-white/20 bg-gradient-to-br from-indigo-600 to-violet-800 text-white hover:scale-110 hover:shadow-xl hover:ring-2 hover:ring-indigo-200"
                   title="Dengarkan Kisah (Story Mode)"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                     <path d="M11.25 4.533A9.707 9.707 0 006 3.75a9.753 9.753 0 00-3.255.555.75.75 0 00-.575.69v9.5c0 .39.342.732.75.675 1.095-.155 2.19-.245 3.32-.245 1.695 0 3.282.25 4.75.717V4.533zM12.75 4.533c1.468-.467 3.055-.717 4.75-.717 1.13 0 2.225.09 3.32.245.408.057.75-.285.75-.675v-9.5a.75.75 0 00-.575-.69A9.753 9.753 0 0018 3.75c-2.006 0-3.86.37-5.25.783v10.95c1.468-.467 3.055-.717 4.75-.717z" />
                   </svg>
                 </button>
                )}
             </div>
          </div>
          
          <div className="prose prose-slate prose-sm md:prose-base max-w-none text-slate-700 leading-relaxed">
            <p>{artifact.description}</p>
          </div>
        </div>

        {/* Mobile-Only Suggested Questions Recommendation */}
        {onAskQuestion && (
          <div className="lg:hidden mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
              </svg>
              Penasaran? Tanyakan Curio
            </h3>
            <div className="flex flex-col gap-2">
              {artifact.suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onAskQuestion(q)}
                  className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-700 text-sm font-medium hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all flex justify-between items-center group"
                >
                  <span>{q}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-300 group-hover:text-blue-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes shine {
          100% {
            left: 125%;
          }
        }
      `}</style>
    </div>
  );
};

export default ArtifactDisplay;
