import React, { useState } from 'react';
import { Search, MonitorPlay, FileText, Book, Sparkles, Stars, Aperture } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function SubjectRooms() {
  const [search, setSearch] = useState('');
  const { rooms } = useAppContext();
  const navigate = useNavigate();

  const filteredRooms = rooms.filter(r => (r.name || '').toLowerCase().includes((search || '').toLowerCase()));

  // Decorative Unsplash background patterns based on index
  const getPattern = (idx: number) => {
    const images = [
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=500&auto=format&fit=crop', // tech/abstract
      'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=500&auto=format&fit=crop', // science/blue
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=500&auto=format&fit=crop', // books
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=500&auto=format&fit=crop'  // chemistry
    ];
    return images[idx % images.length];
  };

  return (
    <div className="space-y-8 relative pb-10">
      
      {/* Hero Header */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/10 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop" alt="bg" className="w-full h-full object-cover opacity-30 mix-blend-screen" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[120px] pointer-events-none"></div>
        </div>

        <div className="relative z-10 px-8 py-14 md:px-12 md:py-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 animate-pulse-slow">
                <Aperture className="w-6 h-6 text-cyan-300" />
              </div>
              <span className="text-cyan-300 font-bold tracking-widest uppercase text-sm">Hệ sinh thái số</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-display font-black text-white tracking-tight mb-4 drop-shadow-lg"
            >
              Phòng Học <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">Bộ Môn</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-300 text-lg max-w-xl leading-relaxed"
            >
              Cổng không gian tri thức trực quan. Khám phá các bài giảng, mô phỏng 3D và tài liệu tương tác.
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative w-full md:w-80"
          >
            <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"></div>
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex items-center shadow-2xl">
              <Search className="w-5 h-5 text-cyan-200 ml-3" />
              <input 
                type="text"
                placeholder="Tìm phòng học..."
                value={search || ''}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none text-white placeholder-cyan-100/50 w-full focus:ring-0 px-3 py-2"
              />
            </div>
          </motion.div>
        </div>
        
        {/* Floating elements */}
        <Stars className="absolute top-10 right-20 w-8 h-8 text-yellow-300 animate-float opacity-70" />
        <Sparkles className="absolute bottom-10 left-1/3 w-6 h-6 text-cyan-300 animate-float-delayed opacity-70" />
      </div>

      {rooms.length === 0 ? (
        <div className="bg-white/50 dark:bg-[#1C274C]/50 backdrop-blur-sm rounded-3xl p-12 border border-blue-100 dark:border-white/5 text-center text-slate-500 shadow-inner">
          <Aperture className="w-16 h-16 mx-auto text-blue-200 dark:text-[#FFD15B]/50 mb-4 animate-spin-slow" />
          <p className="text-lg font-medium dark:text-slate-400">Chưa có không gian nào được thiết lập.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence>
            {filteredRooms.map((room, idx) => (
              <motion.div 
                key={room.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05, type: "spring", bounce: 0.4 }}
                onClick={() => navigate(`/phong-bo-mon/${room.id}`)}
                className="group relative bg-white dark:bg-[#1C274C] rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border border-slate-100/50 dark:border-white/5 hover:-translate-y-2 flex flex-col h-[320px]"
              >
                {/* Visual Header Image */}
                <div className="h-32 w-full relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-slate-900">
                    <img 
                      src={getPattern(idx)} 
                      alt="Room Theme"
                      className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-700"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                  
                  {/* Floating Icon */}
                  <div className="absolute -bottom-6 left-6 p-4 bg-white dark:bg-[#121A33] rounded-2xl shadow-xl z-20 group-hover:-translate-y-2 transition-transform duration-500">
                     <Book className={`w-8 h-8 ${idx % 2 === 0 ? 'text-blue-600 dark:text-indigo-400' : 'text-purple-600 dark:text-purple-400'}`} />
                  </div>
                  
                  {/* Go Button */}
                  <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    Vào không gian
                  </div>
                </div>

                <div className="p-6 pt-10 flex-grow flex flex-col relative z-10 bg-white dark:bg-[#1C274C]">
                  <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-500 dark:group-hover:from-[#FFD15B] dark:group-hover:to-[#EAB308] transition-all">{room.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed flex-grow">{room.description}</p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-indigo-900/50 text-blue-700 dark:text-indigo-300 px-2.5 py-1.5 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-indigo-900/80 transition-colors">
                      <FileText className="w-4 h-4" /> {(room.contents || []).length} Tài liệu
                    </span>
                    <span className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2.5 py-1.5 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/80 transition-colors">
                      <MonitorPlay className="w-4 h-4" /> {(room.contents || []).filter(c => c.type==='video').length} Video
                    </span>
                  </div>
                </div>

                {/* Decorative glow on hover */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 pointer-events-none border-2 border-transparent group-hover:border-blue-400 group-hover:shadow-[inset_0_0_20px_rgba(96,165,250,0.2)] transition-all duration-500 z-30"></div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
