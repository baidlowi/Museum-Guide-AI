
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ArtifactDisplay from './components/ArtifactDisplay';
import ChatInterface from './components/ChatInterface';
import MainEntryMap from './components/MainEntryMap';
import RoomGallery from './components/RoomGallery';
import { fetchMuseumData } from './services/dataService';
import { Artifact, ViewMode } from './types';

type MobileTab = 'info' | 'chat';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('entry');
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [currentArtifact, setCurrentArtifact] = useState<Artifact | null>(null);
  const [currentRoomName, setCurrentRoomName] = useState<string | null>(null);
  
  const [mobileTab, setMobileTab] = useState<MobileTab>('info');
  const [isLoading, setIsLoading] = useState(true);
  
  // State to pass a question from Info tab to Chat tab
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  // Load Data from DataService (BigQuery/Fallback)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchMuseumData();
        setArtifacts(data);
      } catch (err) {
        console.error("Critical error loading museum data", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSelectRoom = (roomName: string) => {
    setCurrentRoomName(roomName);
    setViewMode('room');
  };

  const handleSelectArtifact = (artifact: Artifact) => {
    setCurrentArtifact(artifact);
    setViewMode('artifact');
    setMobileTab('info'); 
    setPendingQuestion(null); // Clear any old pending questions
  };

  const handleBack = () => {
    // 1. From Artifact -> Room
    if (viewMode === 'artifact') {
      // If on mobile and in chat tab, back button goes to info tab first
      if (mobileTab === 'chat' && window.matchMedia('(max-width: 1024px)').matches) {
        setMobileTab('info');
        return;
      }
      setViewMode('room');
      return;
    }
    
    // 2. From Room -> Entry Map
    if (viewMode === 'room') {
      setViewMode('entry');
      setCurrentRoomName(null);
      return;
    }
  };

  const handleMobileAskQuestion = (question: string) => {
    setPendingQuestion(question);
    setMobileTab('chat');
  };

  const handleQuestionConsumed = () => {
    setPendingQuestion(null);
  };

  const getSubtitle = () => {
    if (viewMode === 'entry') return 'Direktori Utama';
    if (viewMode === 'room') return currentRoomName || 'Galeri';
    if (window.matchMedia('(max-width: 1024px)').matches && mobileTab === 'chat') {
      return 'Chat AI dengan Curio';
    }
    return currentArtifact?.title;
  };

  if (isLoading) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-stone-50 flex-col gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-stone-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-stone-500 font-serif font-medium animate-pulse tracking-wide">Memuat Koleksi Museum...</p>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-stone-100 overflow-hidden">
      {/* Only show the top header if NOT in the Entry Map (since Entry Map has its own internal header) */}
      {viewMode !== 'entry' && (
        <Header 
          onBack={handleBack} 
          subtitle={getSubtitle()}
        />
      )}
      
      <main className="flex-1 overflow-hidden relative w-full flex flex-col">
        
        {viewMode === 'entry' && (
          <div className="w-full h-full animate-fadeIn">
            <MainEntryMap onSelectRoom={handleSelectRoom} artifacts={artifacts} />
          </div>
        )}

        {viewMode === 'room' && currentRoomName && (
          <div className="w-full h-full animate-slideUp">
            <RoomGallery 
              roomName={currentRoomName}
              artifacts={artifacts}
              onSelectArtifact={handleSelectArtifact}
              onBack={handleBack}
            />
          </div>
        )}

        {viewMode === 'artifact' && (
          <div className="flex flex-col lg:flex-row w-full h-full animate-slideUp">
            
            {/* Mobile Tab Navigation */}
            <div className="lg:hidden flex border-b border-gray-200 bg-white flex-none z-20 shadow-sm">
              <button
                onClick={() => setMobileTab('info')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
                  mobileTab === 'info' 
                    ? 'text-blue-600 bg-blue-50/50' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Informasi Karya
                {mobileTab === 'info' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setMobileTab('chat')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
                  mobileTab === 'chat' 
                    ? 'text-blue-600 bg-blue-50/50' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Tanya Curio (AI)
                {mobileTab === 'chat' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </button>
            </div>

            {/* Left Panel: Artifact Display */}
            <section className={`
              ${mobileTab === 'info' ? 'flex' : 'hidden'} 
              lg:flex flex-1 min-h-0 lg:h-full lg:w-1/2 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50
            `}>
              {currentArtifact && (
                <ArtifactDisplay 
                  artifact={currentArtifact} 
                  onAskQuestion={handleMobileAskQuestion} 
                />
              )}
            </section>
            
            {/* Right Panel: Chat Interface */}
            <section className={`
              ${mobileTab === 'chat' ? 'flex' : 'hidden'}
              lg:flex flex-1 min-h-0 lg:h-full lg:w-1/2 z-10 shadow-2xl lg:shadow-none bg-white
            `}>
              {currentArtifact && (
                <ChatInterface 
                  artifact={currentArtifact} 
                  initialQuestion={pendingQuestion}
                  onQuestionConsumed={handleQuestionConsumed}
                />
              )}
            </section>
          </div>
        )}

      </main>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
