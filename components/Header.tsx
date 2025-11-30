import React from 'react';

interface HeaderProps {
  onBack?: () => void;
  title?: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ onBack, title, subtitle }) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 shadow-sm z-30 relative flex-shrink-0">
      <div className="flex items-center gap-3 w-full">
        
        {onBack ? (
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center transition-colors group"
            title="Kembali"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
        ) : (
          <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white shadow-lg shadow-slate-800/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
          </div>
        )}
        
        <div className="overflow-hidden">
          <h1 className="text-xl font-bold text-slate-900 leading-tight truncate">{title || 'Panduan AI Museum'}</h1>
          <p className="text-xs text-slate-500 font-medium truncate">
            {subtitle || (onBack ? 'Sedang Melihat Pameran' : 'Peta Lantai Utama')}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;