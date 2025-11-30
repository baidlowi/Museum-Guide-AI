
import React from 'react';
import { Artifact } from '../types';

interface RoomGalleryProps {
  roomName: string;
  artifacts: Artifact[];
  onSelectArtifact: (artifact: Artifact) => void;
  onBack: () => void;
}

const RoomGallery: React.FC<RoomGalleryProps> = ({ roomName, artifacts, onSelectArtifact, onBack }) => {
  // Loose filter for room artifacts
  const roomArtifacts = artifacts.filter(art => 
    art.mapPosition.roomName.toLowerCase().includes(roomName.toLowerCase()) || 
    (roomName === 'Galeri Renaisans' && art.mapPosition.roomName === 'Galeri Renaisans')
  );

  return (
    <div className="w-full h-full bg-stone-50 flex flex-col animate-fadeIn relative">
      
      {/* Navigation Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="hidden sm:inline">Peta Utama</span>
          </button>
          
          <div className="h-6 w-px bg-slate-300 mx-1 hidden sm:block"></div>
          
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Zona Saat Ini</span>
            <span className="text-sm font-bold text-slate-800">{roomName}</span>
          </div>
        </div>

        <div className="text-right hidden sm:block">
           <span className="text-xs text-slate-500">{roomArtifacts.length} Karya Seni</span>
        </div>
      </div>

      {/* Hero Section for Room */}
      <div className="px-6 py-10 md:px-12 md:py-16 bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-serif font-black text-slate-900 mb-4 tracking-tight">{roomName}</h2>
          <p className="text-slate-500 max-w-2xl text-lg md:text-xl font-light leading-relaxed">
            Selamat datang di koleksi terkurasi kami. Setiap karya di ruangan ini dipilih untuk menceritakan kisah unik dari masanya.
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-stone-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
          
          {roomArtifacts.length > 0 ? (
            roomArtifacts.map((artifact, index) => (
              <button
                key={artifact.id}
                onClick={() => onSelectArtifact(artifact)}
                className="group flex flex-col text-left bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 overflow-hidden ring-1 ring-slate-900/5"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-[4/5] overflow-hidden relative bg-stone-200">
                  <img 
                    src={artifact.imageUrl} 
                    alt={artifact.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 saturate-[0.95] group-hover:saturate-100"
                    loading="lazy"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-slate-900 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                </div>
                
                <div className="p-5 border-t border-slate-50">
                  <h3 className="font-serif font-bold text-lg text-slate-900 mb-1 group-hover:text-blue-700 transition-colors line-clamp-2 leading-tight">
                    {artifact.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mb-2">{artifact.artist}</p>
                  
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-600 rounded font-semibold uppercase tracking-wider">
                       {artifact.year}
                     </span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
              <p className="text-lg font-medium">Belum ada koleksi di ruangan ini.</p>
              <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">Kembali ke Peta</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RoomGallery;
