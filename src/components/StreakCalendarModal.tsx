import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Snowflake, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface StreakCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StreakCalendarModal({ isOpen, onClose }: StreakCalendarModalProps) {
  const { currentUser } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!currentUser) return null;

  const history = currentUser.visitedDates || [];
  const frozen = currentUser.frozenDates || [];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get total days in month
  const totalDays = new Date(year, month + 1, 0).getDate();
  // Get start day of month (0 = Sunday, 1 = Monday, etc.)
  // Adjust so Monday is 0 and Sunday is 6
  const getStartDay = () => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const startDayOffset = getStartDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const renderDays = () => {
    const daysCells = [];
    const todayStr = new Date().toLocaleDateString('en-CA');
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // Fill offset cells
    for (let i = 0; i < startDayOffset; i++) {
      daysCells.push(<div key={`offset-${i}`} className="h-12 w-full" />);
    }

    // Fill month days
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      // Parse ISO string safely for matching
      const targetDate = new Date(year, month, dayNum);
      const dateStr = targetDate.toLocaleDateString('en-CA'); // YYYY-MM-DD
      
      const isVisited = history.includes(dateStr);
      const isFrozen = frozen.includes(dateStr);
      const isToday = dateStr === todayStr;

      daysCells.push(
        <div 
          key={`day-${dayNum}`}
          className="h-12 w-full flex flex-col items-center justify-center relative select-none"
        >
          <div 
            className={`w-9 h-9 rounded-full flex items-center justify-center relative transition-all duration-300 ${
              isFrozen 
                ? 'bg-blue-500/20 border border-blue-400/40 text-blue-300' 
                : isVisited 
                  ? 'bg-orange-500/20 border border-orange-400/30 text-orange-400' 
                  : isToday
                    ? 'border-2 border-dashed border-slate-500 text-white'
                    : 'bg-white/5 text-slate-400'
            }`}
          >
            {isFrozen ? (
              <Snowflake className="w-5 h-5 text-blue-400 animate-pulse" />
            ) : isVisited ? (
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            ) : (
              <span className="text-xs font-bold">{dayNum}</span>
            )}

            {/* Pulsing indicator for today */}
            {isToday && (
              <span className="absolute bottom-0 right-0 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
            )}
          </div>
        </div>
      );
    }

    return daysCells;
  };

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-full max-w-md bg-gradient-to-b from-[#1C274C] to-[#0A0F24] rounded-[2.5rem] overflow-hidden border border-blue-500/20 text-white relative shadow-2xl"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-lg tracking-wide uppercase text-blue-200">Nhật ký chuỗi học</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Calendar Controller */}
            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-extrabold text-md tracking-wider text-blue-100 uppercase">
                  {monthNames[month]} - {year}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((dayName, index) => (
                  <span 
                    key={index}
                    className={`text-[11px] font-black tracking-widest ${index === 6 ? 'text-rose-400' : 'text-slate-400'}`}
                  >
                    {dayName}
                  </span>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {renderDays()}
              </div>

              {/* Legends */}
              <div className="mt-8 pt-4 border-t border-white/5 flex justify-around text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-orange-500/20 border border-orange-400/30 flex items-center justify-center">
                    <Flame className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />
                  </div>
                  <span>Đã học</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center">
                    <Snowflake className="w-2.5 h-2.5 text-blue-400" />
                  </div>
                  <span>Đóng băng</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-[8px] font-black text-slate-500 border border-white/5">
                    •
                  </div>
                  <span>Bỏ lỡ</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
