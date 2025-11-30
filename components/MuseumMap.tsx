
import React, { useMemo } from 'react';
import { Artifact } from '../types';

interface MuseumMapProps {
  artifacts: Artifact[];
  onSelectArtifact: (artifact: Artifact) => void;
}

const MuseumMap: React.FC<MuseumMapProps> = ({ artifacts, onSelectArtifact }) => {
  
  // Calculate the center point (centroid) of artifacts for each room to place the Room Label dynamically
  const roomLabels = useMemo(() => {
    const rooms: Record<string, { totalTop: number, totalLeft: number, count: number }> = {};
    
    artifacts.forEach(art => {
      const top = parseFloat(art.mapPosition.top);
      const left = parseFloat(art.mapPosition.left);
      
      if (!rooms[art.mapPosition.roomName]) {
        rooms[art.mapPosition.roomName] = { totalTop: 0, totalLeft: 0, count: 0 };
      }
      rooms[art.mapPosition.roomName].totalTop += top;
      rooms[art.mapPosition.roomName].totalLeft += left;
      rooms[art.mapPosition.roomName].count += 1;
    });

    return Object.keys(rooms).map(name => ({
      name,
      top: rooms[name].totalTop / rooms[name].count,
      left: rooms[name].totalLeft / rooms[name].count
    }));
  }, [artifacts]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-50">
      
      {/* --- Animated Background Effects --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-purple-100/20 to-emerald-100/40 bg-[length:400%_400%] animate-gradient-drift opacity-60"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1.5px,transparent_1.5px)] [background-size:40px_40px] animate-pulse-subtle opacity-20 mask-image-radial"></div>
      </div>

      {/* Map Title / Header inside the map view */}
      <div className="absolute top-6 lg:top-10 left-0 right-0 text-center z-20 pointer-events-none px-4">
        <h2 className="text-2xl lg:text-3xl font-serif font-bold text-slate-800 mb-2 drop-shadow-sm">Peta Museum Digital</h2>
        <p className="text-sm lg:text-base text-slate-600 font-medium bg-white/60 inline-block px-3 py-1 rounded-full backdrop-blur-sm border border-white/50 shadow-sm">
          Pilih karya seni untuk memulai tur
        </p>
      </div>

      <div className="w-full h-full overflow-auto relative z-10 flex p-4 lg:p-8 scroll-smooth">
        
        {/* The Floor Plan Container */}
        <div className="relative w-full min-w-[600px] max-w-5xl aspect-[16/9] bg-white rounded-[2.5rem] shadow-2xl border border-white/50 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] flex-shrink-0 m-auto scale-95 hover:scale-100 transition-transform duration-700 ease-out">
          
          {/* Room Dividers (Cross Shape) */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-300 border-r border-dashed border-slate-400 opacity-50" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-300 border-b border-dashed border-slate-400 opacity-50" />

          {/* Static Background Room Labels (Visual Guide) */}
          <div className="absolute inset-0 pointer-events-none select-none">
            {/* Top Left */}
            <div className="absolute top-6 left-6 text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">Galeri Renaisans</div>
            {/* Top Right */}
            <div className="absolute top-6 right-6 text-xs font-bold text-slate-300 uppercase tracking-[0.2em] text-right">Galeri Nasional</div>
            {/* Bottom Left */}
            <div className="absolute bottom-6 left-6 text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">Aula Impresionis</div>
            {/* Bottom Right */}
            <div className="absolute bottom-6 right-6 text-xs font-bold text-slate-300 uppercase tracking-[0.2em] text-right">History</div>
          </div>

          {/* Dynamic Centroid Room Labels (calculated from artifact positions) */}
          {roomLabels.map((room) => (
            <div 
              key={room.name}
              style={{ top: `${room.top}%`, left: `${room.left}%` }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"
            >
              <span className="text-slate-900/10 text-4xl lg:text-6xl font-serif font-black whitespace-nowrap uppercase tracking-widest blur-[1px]">
                {room.name.split(' ')[0]}
              </span>
            </div>
          ))}

          {/* Artifact Pins - Rendered dynamically from props */}
          {artifacts.map((artifact) => (
            <button
              key={artifact.id}
              onClick={() => onSelectArtifact(artifact)}
              style={{ top: artifact.mapPosition.top, left: artifact.mapPosition.left }}
              className="absolute group transform -translate-x-1/2 -translate-y-1/2 focus:outline-none transition-all duration-500 hover:z-20"
              aria-label={`Lihat ${artifact.title}`}
            >
              {/* The Image Pin */}
              <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl bg-white transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2">
                 <div className="absolute inset-0 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] group-hover:shadow-[0_20px_35px_-5px_rgba(0,0,0,0.4)] transition-shadow duration-300" />
                 <div className="absolute inset-0 rounded-2xl overflow-hidden ring-4 ring-white ring-opacity-80">
                   <img 
                     src={artifact.imageUrl} 
                     alt={artifact.title}
                     className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                   />
                   <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/10 opacity-100 pointer-events-none" />
                   <div className="absolute -inset-full top-0 block z-10 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
                 </div>
              </div>

              {/* Pulsing indicator */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-full flex justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping absolute" />
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full relative shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              </div>

              {/* Title Label */}
              <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-[0_8px_16px_rgba(0,0,0,0.1)] border border-white/50 whitespace-nowrap text-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transform md:translate-y-2 md:group-hover:translate-y-0 transition-all duration-300 z-10">
                <p className="text-xs font-bold text-slate-800">{artifact.title}</p>
                <p className="text-[10px] text-slate-500 truncate max-w-[120px] hidden md:block mt-0.5">{artifact.artist}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes shine {
          100% { left: 125%; }
        }
        .animate-shine { animation: shine 1s; }

        @keyframes gradient-drift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-drift { animation: gradient-drift 20s ease infinite; }

        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.02); }
        }
        .animate-pulse-subtle { animation: pulse-subtle 6s ease-in-out infinite; }

        .mask-image-radial {
          mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
          -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
        }
      `}</style>
    </div>
  );
};

export default MuseumMap;
