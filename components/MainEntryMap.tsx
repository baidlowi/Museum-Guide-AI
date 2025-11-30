
import React from 'react';
import { Artifact } from '../types';

interface MainEntryMapProps {
  onSelectRoom: (roomName: string) => void;
  artifacts?: Artifact[];
}

const MainEntryMap: React.FC<MainEntryMapProps> = ({ onSelectRoom, artifacts = [] }) => {
  
  const getCount = (roomName: string) => {
    // Basic fuzzy match for room names or exact match
    return artifacts.filter(a => 
      a.mapPosition.roomName.toLowerCase().includes(roomName.toLowerCase()) || 
      (roomName === 'History' && (a.mapPosition.roomName === 'History' || a.mapPosition.roomName === 'Lorong Sejarah'))
    ).length;
  };

  // Define coordinates for the tour path (Percentages relative to container)
  // 1. Nasional (Top Left) -> 2. Renaisans (Center) -> 3. Terbatas (Bottom Right) -> 
  // 4. Sejarah (Bottom Left) -> 5. Renaisans (Center) -> 6. Impresionis (Top Right)
  const points = [
    { id: 1, x: '15%', y: '25%', label: 'Mulai: Nasional' },     // Galeri Nasional
    { id: 2, x: '50%', y: '55%', label: 'Renaisans' },           // Galeri Renaisans
    { id: 3, x: '85%', y: '80%', label: 'Koleksi Terbatas' },    // Koleksi Terbatas
    { id: 4, x: '15%', y: '80%', label: 'Lorong Sejarah' },      // Lorong Sejarah
    { id: 5, x: '45%', y: '60%', label: 'Transit' },             // Galeri Renaisans (Slight offset to show return path)
    { id: 6, x: '75%', y: '25%', label: 'Selesai: Impresionis' } // Aula Impresionis
  ];

  return (
    <div className="w-full h-full bg-[#F2F2F0] flex items-center justify-center overflow-auto lg:overflow-hidden relative font-sans selection:bg-blue-100">
      
      {/* --- Museum Theme Background Layer --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[#F4F4F5]"></div>
        <svg className="absolute inset-0 w-full h-full opacity-[0.4] mix-blend-soft-light saturate-0">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
        <div className="absolute inset-0 opacity-[0.15]" 
             style={{ 
               backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', 
               backgroundSize: '24px 24px' 
             }}>
        </div>
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-sky-100 rounded-full blur-[120px] mix-blend-multiply opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-amber-50 rounded-full blur-[100px] mix-blend-multiply opacity-80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(120,113,108,0.05)_100%)]"></div>
      </div>
      
      {/* Kiosk Container */}
      <div className="w-full max-w-7xl h-auto min-h-full lg:h-full lg:max-h-[90vh] flex flex-col p-4 md:p-8 relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-6 md:mb-8 px-2 flex-shrink-0">
          <div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-800 tracking-tight drop-shadow-sm">Peta Museum</h1>
            <p className="text-slate-500 text-sm md:text-base font-medium mt-1 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Lobi Utama • Jalur Tur Rekomendasi
            </p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Waktu Operasional</p>
            <p className="text-slate-700 font-semibold font-serif">09:00 - 17:00</p>
          </div>
        </div>

        {/* The Map Grid Container */}
        <div className="relative flex-1 min-h-0">
          
          {/* --- SVG Navigation Line & Pins (Desktop Only) --- */}
          <div className="absolute inset-0 z-30 pointer-events-none hidden lg:block">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
               <defs>
                 <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                   <polygon points="0 0, 10 3.5, 0 7" fill="#0ea5e9" />
                 </marker>
               </defs>
               
               {/* The Path: Nasional -> Renaisans -> Terbatas -> Sejarah -> Renaisans -> Impresionis */}
               <path 
                  d="M 15% 25% 
                     Q 30% 25%, 50% 55%
                     T 85% 80%
                     L 15% 80%
                     Q 30% 70%, 45% 60%
                     Q 60% 50%, 75% 25%"
                  fill="none" 
                  stroke="#0ea5e9" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="8 8"
                  className="opacity-60 drop-shadow-md animate-dash"
                  markerEnd="url(#arrowhead)"
               />
            </svg>

            {/* Pin Points */}
            {points.map((p, i) => (
              <div 
                key={p.id}
                style={{ top: p.y, left: p.x }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-default"
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white transition-transform hover:scale-125
                  ${i === 0 ? 'bg-emerald-500 text-white animate-bounce' : 
                    i === points.length - 1 ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}
                `}>
                  {p.id}
                </div>
                {/* Tooltip Label */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded mt-1 whitespace-nowrap">
                  {p.label}
                </div>
              </div>
            ))}
          </div>

          {/* The Grid */}
          <div className="w-full h-full grid grid-cols-2 md:grid-cols-4 grid-rows-[auto_auto_auto] md:grid-rows-2 gap-3 md:gap-6 pb-20 md:pb-0">
            
            {/* 1. Galeri Nasional (Start) */}
            <button 
              onClick={() => onSelectRoom('Galeri Nasional')}
              className="col-span-1 md:col-span-1 md:row-span-1 order-1 md:order-1 bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden text-left p-4 md:p-8 border border-white/60 h-40 md:h-auto ring-1 ring-slate-900/5"
            >
              <div className="absolute top-3 md:top-6 left-4 md:left-6">
                <span className="px-2 py-0.5 rounded border border-slate-200 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50">Mulai</span>
              </div>
              <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 z-10">
                <h3 className="text-lg md:text-2xl font-serif font-bold text-slate-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors">Galeri<br/>Nasional</h3>
                <p className="text-xs text-slate-400 font-medium">{getCount('Galeri Nasional')} Karya</p>
              </div>
            </button>

            {/* 6. Aula Impresionis (End) */}
            <button 
              onClick={() => onSelectRoom('Aula Impresionis')}
              className="col-span-1 md:col-span-3 md:row-span-1 order-2 md:order-2 bg-[#AECDCF]/90 backdrop-blur-sm rounded-2xl md:rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden text-left p-4 md:p-8 h-40 md:h-auto border border-white/20"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-multiply"></div>
              <div className="absolute top-3 md:top-6 right-4 md:right-6">
                <span className="px-2 py-0.5 rounded border border-slate-900/10 text-[9px] md:text-[10px] font-bold text-slate-700 uppercase tracking-widest bg-white/30 backdrop-blur-md">Sayap Timur</span>
              </div>
              <div className="flex flex-col justify-end h-full relative z-10">
                <h3 className="text-xl md:text-5xl font-serif font-bold text-slate-800/90 leading-none mb-1 md:mb-2">
                  Aula<br className="md:hidden"/> Impresionis
                </h3>
                <div className="flex justify-between items-end">
                  <p className="hidden md:block text-slate-700 font-medium opacity-80">Van Gogh, Monet, dan Cahaya.</p>
                  <span className="text-xs md:text-sm font-semibold text-slate-600 bg-white/20 px-2 py-1 rounded backdrop-blur-sm">{getCount('Aula Impresionis')} Karya</span>
                </div>
              </div>
            </button>

            {/* 2 & 5. GALERI RENAISANS (Center Hub) */}
            <button 
              onClick={() => onSelectRoom('Galeri Renaisans')}
              className="col-span-2 md:col-span-2 md:row-span-1 order-3 md:order-4 bg-[#CFDAC2]/90 backdrop-blur-sm rounded-2xl md:rounded-[2rem] shadow-md hover:shadow-[0_20px_50px_rgba(207,218,194,0.6)] transition-all duration-300 hover:scale-[1.01] group relative overflow-hidden flex flex-col justify-center items-center text-center p-6 border border-white/20 h-48 md:h-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#526343]/10 to-transparent opacity-60"></div>
              <div className="relative z-10">
                <span className="inline-block mb-2 md:mb-3 px-3 py-1 bg-[#526343] text-white text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-lg">
                  Pameran Utama
                </span>
                <h3 className="text-3xl md:text-5xl font-serif font-black text-[#2c3624] mb-1 md:mb-2 leading-none drop-shadow-sm">
                  GALERI<br/>RENAISANS
                </h3>
                <span className="text-xs font-bold text-[#2c3624]/70 bg-[#2c3624]/5 px-2 py-0.5 rounded-full">{getCount('Galeri Renaisans')} Karya</span>
              </div>
            </button>

            {/* 3. Koleksi Terbatas */}
            <button 
              onClick={() => onSelectRoom('History')}
              className="col-span-1 md:col-span-1 md:row-span-1 order-4 md:order-5 bg-[#DBC688]/90 backdrop-blur-sm rounded-2xl md:rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden text-left p-4 md:p-8 h-40 md:h-auto border border-white/20"
            >
               <div className="absolute top-3 md:top-6 right-4 md:right-6">
                 <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white animate-ping absolute inline-flex opacity-75"></span>
                 <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white relative inline-flex shadow-sm"></span>
              </div>
               <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 z-10">
                  <h3 className="text-lg md:text-2xl font-serif font-bold text-white leading-tight drop-shadow-md">Koleksi<br/>Terbatas</h3>
                  <p className="text-xs text-white/90 font-medium mt-1">{getCount('History')} Karya</p>
               </div>
            </button>

            {/* 4. Lorong Sejarah */}
            <button 
              onClick={() => onSelectRoom('History')}
              className="col-span-1 md:col-span-1 md:row-span-1 order-5 md:order-3 bg-[#F5F2E0]/90 backdrop-blur-sm rounded-2xl md:rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden text-left p-4 md:p-8 h-40 md:h-auto border border-slate-200/50"
            >
              <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 z-10">
                <h3 className="text-lg md:text-2xl font-serif font-bold text-slate-800/90 leading-tight">Lorong<br/>Sejarah</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Arsip Museum</p>
              </div>
            </button>

          </div>
        </div>
      </div>
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
        .animate-dash {
          animation: dash 5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default MainEntryMap;
