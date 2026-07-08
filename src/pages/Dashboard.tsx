import React, { useState, useEffect } from 'react';
import { 
  Users, Map, ArrowRight, Building2, QrCode, ShieldAlert, FileText, UserSquare2, 
  BookOpen, Flame, PlayCircle, Crown, MessagesSquare, Sun, Cloud, Sparkles, 
  Bird, Plane, Car, Moon, Star, Calendar, Store, Snowflake, ShoppingBag,
  Terminal, Server, Activity, ShieldCheck, Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import GifShopModal from '../components/GifShopModal';
import StreakShopModal from '../components/StreakShopModal';
import StreakCalendarModal from '../components/StreakCalendarModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const { rooms, students, classes, users, currentUser, updateUser, addNotification } = useAppContext();
  const [isGifShopOpen, setIsGifShopOpen] = useState(false);
  const [examDateStr, setExamDateStr] = useState(currentUser?.examDate || '');
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);
  const [showStreakCalendar, setShowStreakCalendar] = useState(false);
  const [showStreakShop, setShowStreakShop] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'parent') {
      navigate('/ho-so-hoc-sinh');
    }
  }, [currentUser, navigate]);

  if (currentUser?.role === 'technician') {
    const schoolAccounts = users.filter(u => u.role === 'school');
    const teacherCount = users.filter(u => u.role === 'teacher').length;
    const parentCount = users.filter(u => u.role === 'parent').length;

    return (
      <div className="space-y-8 pb-20 relative max-w-[1400px] mx-auto text-slate-100 min-h-screen">
        {/* Futuristic Background Grids */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '3s' }}></div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-400/20">
              <Server className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Hệ thống trung tâm quản trị</p>
              <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight mt-1 flex items-center gap-3">
                KỸ THUẬT VIÊN <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">SYSTEM CONSOLE</span>
              </h1>
              <p className="text-slate-400 text-sm font-medium mt-1">
                Giám sát thiết bị kết nối, mạng lưới học vụ đa trường học và quản lý tài nguyên
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/quan-ly-truong-hoc')}
            className="relative z-10 shrink-0 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/20 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" /> Đi tới Quản lý trường học
          </button>
        </motion.div>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { label: 'Hệ thống Trường', count: schoolAccounts.length, icon: Building2, color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' },
            { label: 'Lớp học số hóa', count: classes.length, icon: Database, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
            { label: 'Tài khoản Giáo viên', count: teacherCount, icon: Users, color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5' },
            { label: 'Học sinh đăng ký', count: students.length, icon: UserSquare2, color: 'text-purple-400 border-purple-500/20 bg-purple-500/5' },
            { label: 'Tài khoản Phụ huynh', count: parentCount, icon: ShieldCheck, color: 'text-pink-400 border-pink-500/20 bg-pink-500/5' }
          ].map((stat, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={stat.label}
              className={`border p-6 rounded-3xl flex items-center justify-between shadow-lg ${stat.color}`}
            >
              <div>
                <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-black font-display text-white mt-2">{stat.count}</h3>
              </div>
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shrink-0">
                <stat.icon className="w-5 h-5" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Panel Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Cyberpunk Activity Logs Console (Left Side) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-950 border border-slate-800/80 rounded-[2rem] p-6 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 relative z-10">
                <h2 className="text-lg font-display font-black flex items-center gap-2.5">
                  <Terminal className="w-5 h-5 text-emerald-400" /> SYSTEM ACTIVITY CONSOLE
                </h2>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">LIVE DATA</span>
                </div>
              </div>

              {/* simulated logs */}
              <div className="font-mono text-xs text-slate-400 space-y-3.5 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/60 max-h-[350px] overflow-y-auto shadow-inner leading-relaxed">
                <div><span className="text-emerald-500">[INFO]</span> Initializing Smart School QR Core system...</div>
                <div><span className="text-emerald-500">[OK]</span> Connection established with Google Firestore database.</div>
                <div><span className="text-cyan-500">[SYNC]</span> Synced {schoolAccounts.length} school domains and {classes.length} digital classrooms.</div>
                <div><span className="text-emerald-500">[INFO]</span> AI verification agent online - checking cross-match parameters.</div>
                <div><span className="text-purple-500">[SECURITY]</span> Multitenancy domain constraints: isolates active on {schoolAccounts.length} tenants.</div>
                <div><span className="text-yellow-500">[NOTICE]</span> System execution logs are verified clean. Server port 3000 running.</div>
                <div className="text-slate-505 border-t border-slate-800/50 pt-2 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CPU utilization: 12% | Network latency: 45ms</span>
                </div>
              </div>

              {/* Action grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => navigate('/quan-ly-truong-hoc')}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl text-left transition-all"
                >
                  <p className="text-xs font-black uppercase text-emerald-400 tracking-wide mb-1">Cấu hình Đơn vị</p>
                  <p className="text-xs text-slate-400 font-medium">Tạo thêm tài khoản và quản trị mạng lưới trường học địa phương.</p>
                </button>
                <button
                  onClick={() => navigate('/thu-vien')}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl text-left transition-all"
                >
                  <p className="text-xs font-black uppercase text-indigo-400 tracking-wide mb-1">Thư viện chung</p>
                  <p className="text-xs text-slate-400 font-medium">Truy cập trực tiếp để duyệt các tài liệu của tất cả các trường.</p>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Quick Info & Network status (Right Side) */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-950 border border-slate-800/80 rounded-[2rem] p-6 space-y-6 shadow-2xl"
            >
              <h2 className="text-lg font-display font-black border-b border-slate-800/80 pb-4 flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-indigo-400" /> MẠNG LƯỚI TRƯỜNG ĐĂNG KÝ
              </h2>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {schoolAccounts.map(school => {
                  const scTeachers = users.filter(u => u.role === 'teacher' && u.schoolId === school.id).length;
                  const scStudents = students.filter(s => s.schoolId === school.id).length;
                  const scParents = users.filter(u => u.role === 'parent' && u.schoolId === school.id).length;

                  return (
                    <div
                      key={school.id}
                      onClick={() => navigate('/quan-ly-truong-hoc')}
                      className="bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-850/80 p-4 rounded-2xl cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-black text-sm text-white group-hover:text-emerald-400 transition-colors">{school.fullName}</span>
                        <span className="px-2 py-0.5 bg-slate-850 text-slate-400 text-[9px] font-black rounded-full border border-slate-800">{school.region || 'Unknown'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-800/30">
                        <div>
                          <p className="text-slate-500 font-medium">GV</p>
                          <p className="text-indigo-400 font-black text-xs">{scTeachers}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">HS</p>
                          <p className="text-emerald-400 font-black text-xs">{scStudents}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">PH</p>
                          <p className="text-purple-400 font-black text-xs">{scParents}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {schoolAccounts.length === 0 && (
                  <p className="text-center py-8 text-slate-500 text-sm font-semibold">Chưa có tài khoản trường học nào.</p>
                )}
              </div>
            </motion.div>
          </div>

        </div>

      </div>
    );
  }



  useEffect(() => {
    if (!currentUser?.examDate) {
      setTimeLeft(null);
      return;
    }
    
    const interval = setInterval(() => {
      const examTime = new Date(currentUser.examDate!).getTime();
      const now = new Date().getTime();
      const distance = examTime - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft(null);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentUser?.examDate]);

  const handleSaveExamDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (currentUser) {
      updateUser(currentUser.id, { examDate: val });
    }
  };

  const QUICK_ACCESS = [
    { label: 'Quét QR', desc: 'Truy cập phòng/tài liệu', icon: QrCode, path: '#scan', color: 'text-blue-400', bg: 'bg-gradient-to-br from-[#1C274C] to-blue-950', glow: 'shadow-[0_10px_30px_rgba(30,58,138,0.3)] hover:shadow-[0_20px_40px_rgba(59,130,246,0.5)] hover:border-blue-400' },
    { label: 'Lớp học số', desc: 'Tham gia học tập', icon: PlayCircle, path: '/lop-hoc-so', color: 'text-indigo-400', bg: 'bg-gradient-to-br from-[#1C274C] to-indigo-950', glow: 'shadow-[0_10px_30px_rgba(49,46,129,0.3)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.5)] hover:border-indigo-400' },
    { label: 'Hồ sơ', desc: 'Xem thành tích', icon: Crown, path: '/ho-so-hoc-sinh', color: 'text-amber-400', bg: 'bg-gradient-to-br from-[#1C274C] to-amber-950', glow: 'shadow-[0_10px_30px_rgba(120,53,15,0.3)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.5)] hover:border-amber-400' },
    { label: 'Cộng đồng', desc: 'Trao đổi & Giao lưu', icon: MessagesSquare, path: '/ket-noi', color: 'text-emerald-400', bg: 'bg-gradient-to-br from-[#1C274C] to-emerald-950', glow: 'shadow-[0_10px_30px_rgba(6,78,59,0.3)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.5)] hover:border-emerald-400' },
  ];

  const isVideoUrl = (url: string) => url.match(/\.(mp4|webm|ogg|m4v|m3u8)/i) || url.includes('.mp4?') || url.includes('video');
  const hasVideoGif = currentUser?.currentGif && isVideoUrl(currentUser.currentGif);

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto text-slate-900 dark:text-white">
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring", bounce: 0.5 }}
        className="mb-10 relative"
      >
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent blur-2xl -z-10 rounded-full"></div>
        <p className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
           <Sparkles className="w-4 h-4 text-blue-500" /> TỔNG QUAN · TIẾN ĐỘ HỌC TẬP
        </p>
        <h1 className="text-3xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 drop-shadow-sm leading-tight">
           Chào <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#FFD15B] dark:to-orange-400 drop-shadow-md">{currentUser?.name || 'bạn'}</span>,
           <br className="md:hidden" /> hôm nay học tập nhé! <span className="inline-block animate-bounce ml-2 text-2xl md:text-3xl">🚀</span>
        </h1>
      </motion.div>

      {/* Top Section: Banner + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 xl:col-span-8 h-[240px] md:h-[280px] bg-[#1C274C] rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden shadow-[0_10px_30px_rgba(28,39,76,0.3)] border border-white/5 hover:shadow-[0_20px_50px_rgba(99,102,241,0.4)] hover:-translate-y-2 hover:border-indigo-400 transition-all duration-500 cursor-pointer group"
        >
          {currentUser?.currentGif && !hasVideoGif && (
            <div 
              className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-700"
              style={{
                backgroundImage: `url(${currentUser.currentGif})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(1.05) contrast(1.02)',
                imageRendering: 'high-quality',
              }}
            />
          )}
          {hasVideoGif && (
            <video 
              src={currentUser.currentGif} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              style={{ filter: 'brightness(1.05) contrast(1.02)' }}
            />
          )}
          {/* Overlay if there's a gif to make text readable */}
          {currentUser?.currentGif && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none transition-all duration-500"></div>}

          {/* Shooting Stars Background (only if no gif) */}
          {!currentUser?.currentGif && (
            <div className="absolute inset-0 pointer-events-none opacity-50">
              <Star className="absolute top-10 left-[20%] w-3 h-3 text-white fill-white animate-pulse" />
              <Star className="absolute top-20 left-[40%] w-2 h-2 text-white fill-white opacity-50" />
              <Star className="absolute top-1/2 left-[70%] w-4 h-4 text-white fill-white animate-pulse" />
              <Star className="absolute bottom-10 left-[10%] w-2 h-2 text-white fill-white opacity-60" />
              
              {/* Simple shooting star line */}
              <motion.div 
                 animate={{ x: [0, 200], y: [0, 200], opacity: [0, 1, 0] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 className="absolute top-[10%] left-[50%] w-16 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent transform -rotate-45"
              ></motion.div>
              <motion.div 
                 animate={{ x: [0, 300], y: [0, 300], opacity: [0, 1, 0] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1.5 }}
                 className="absolute top-[30%] left-[20%] w-24 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent transform -rotate-45"
              ></motion.div>
            </div>
          )}

          {!currentUser?.currentGif && (
            <div className="absolute right-0 top-0 w-32 h-32 md:w-48 md:h-48 bg-white/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-2xl group-hover:bg-white/30 transition-colors duration-500"></div>
          )}
          
          {!currentUser?.currentGif && (
            <div className="absolute right-8 top-8 opacity-80 hidden sm:block group-hover:scale-105 transition-transform duration-700">
              <Moon className="w-24 h-24 text-white fill-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              <div className="absolute top-4 right-6 w-3 h-3 bg-[#1C274C] rounded-full"></div>
              <div className="absolute top-8 right-10 w-2 h-2 bg-[#1C274C] rounded-full"></div>
              <div className="absolute top-14 right-4 w-4 h-4 bg-[#1C274C] rounded-full"></div>
            </div>
          )}

          <div className="relative z-10 h-full flex flex-col justify-center max-w-md">
            <div className="flex items-center gap-4 mb-3">
              <p className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2 drop-shadow-md">
                 <Sparkles className="w-3.5 h-3.5 text-[#FFD15B]" /> MANIFEST TƯƠNG LAI
              </p>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsGifShopOpen(true); }}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-colors border border-white/20 backdrop-blur-sm"
              >
                <Store className="w-3 h-3 text-[#FFD15B]" />
                Shop Cửa Sổ
              </button>
            </div>
            
            <div className="flex items-end gap-3 mb-4">
              <h2 className="text-5xl md:text-6xl font-display font-black leading-none tracking-tight text-white drop-shadow-md">
                9.0
              </h2>
              <button className="bg-[#FFD15B] text-[#121411] hover:bg-[#EAB308] px-4 py-1.5 rounded-full text-xs font-bold transition-colors mb-1 shadow-[0_0_15px_rgba(255,209,91,0.4)] hover:shadow-[0_0_25px_rgba(255,209,91,0.6)]">
                Chọn mục tiêu <span className="ml-1">v</span>
              </button>
            </div>
            <p className="text-slate-200 text-sm font-medium leading-relaxed drop-shadow-md">
              Đặt mục tiêu điểm số và để hệ thống<br/>đồng hành cùng bạn mỗi ngày 🪴
            </p>
          </div>
        </motion.div>
        
        {/* Right Stats Column */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 h-auto lg:h-[240px] md:h-[280px]">
           {/* Streak Banner */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.1 }}
             className="bg-[#1C274C] rounded-[2rem] p-6 text-white shadow-[0_10px_30px_rgba(28,39,76,0.3)] border border-white/5 relative overflow-hidden flex-1 flex flex-col justify-center hover:shadow-[0_20px_40px_rgba(255,209,91,0.3)] hover:-translate-y-2 hover:border-[#FFD15B] transition-all duration-500 cursor-pointer group"
           >
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3 blur-xl group-hover:bg-white/10 transition-colors duration-500"></div>
              
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <Star className="absolute top-8 right-10 w-2 h-2 text-white fill-white animate-pulse" />
                <div className="absolute top-1/2 right-[20%] w-12 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent transform -rotate-45"></div>
              </div>

              <div className="flex items-center justify-between mb-2 relative z-10">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">CHUỖI NGÀY HỌC</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowStreakCalendar(true); }}
                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-all font-extrabold flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full border border-white/10"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Xem toàn bộ
                  </button>
               </div>
               
               <div className="flex items-center justify-between relative z-10 mb-6 mt-1">
                  <div className="flex items-end gap-2 group-hover:scale-105 transition-transform duration-500 origin-left">
                     <Flame className="w-8 h-8 text-[#FFD15B] fill-[#FFD15B] mb-1 drop-shadow-[0_0_10px_rgba(255,209,91,0.5)]" />
                     <span className="text-5xl font-black font-display leading-none text-white">{currentUser?.streakCount || 0}</span>
                     <span className="text-sm font-medium text-slate-400 mb-1">ngày liên tiếp</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowStreakShop(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 hover:bg-blue-500/35 transition-all text-xs font-bold text-blue-300 shadow-lg shadow-blue-500/10 active:scale-95 shrink-0"
                  >
                    <Snowflake className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span>{currentUser?.streakFreezeCount || 0} Đóng băng</span>
                  </button>
               </div>

               {/* Day bubbles */}
               <div className="flex justify-between relative z-10">
                  {(() => {
                     const today = new Date();
                     const days = [];
                     const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                     const history = currentUser?.visitedDates || [];
                     const frozenHistory = currentUser?.frozenDates || [];
                     
                     for (let i = 6; i >= 0; i--) {
                       const d = new Date(today);
                       d.setDate(d.getDate() - i);
                       const dateStr = d.toLocaleDateString('en-CA');
                       const isActive = history.includes(dateStr);
                       const isFrozen = frozenHistory.includes(dateStr);
                       days.push({
                         id: i,
                         name: dayNames[d.getDay()],
                         isActive,
                         isFrozen,
                         isToday: i === 0
                       });
                     }
                     
                     return days.map((day, idx) => (
                       <div key={idx} className="flex flex-col items-center gap-2">
                          <div className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 group-hover:-translate-y-1 ${day.isFrozen ? 'bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-blue-400/40' : (day.isActive ? (day.isToday ? 'bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-orange-500/20') : 'bg-[#121A33]')}`}>
                             {day.isFrozen ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 * idx }}
                                >
                                  <Snowflake className="w-4 h-4 text-blue-400" />
                                </motion.div>
                             ) : day.isActive ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 * idx }}
                                >
                                  <Flame className={`w-4 h-4 ${day.isToday ? 'text-red-500 fill-red-500' : 'text-orange-500 fill-orange-500'}`} />
                                </motion.div>
                             ) : (
                                day.isToday ? <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></div> : ''
                             )}
                             {day.isActive && day.isToday && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                             )}
                          </div>
                          <span className={`text-[10px] font-bold ${day.isToday ? 'text-white' : 'text-slate-400'}`}>{day.name}</span>
                       </div>
                     ));
                  })()}
               </div>
           </motion.div>
        </div>
      </div>

      {/* Grid 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lời dạy của Bác */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] dark:from-[#1E293B] dark:to-[#0F172A] rounded-[2rem] p-6 md:p-8 relative overflow-hidden border border-white/5 shadow-[0_10px_30px_rgba(15,23,42,0.3)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.3)] hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-500 group text-white flex flex-col sm:flex-row items-center gap-6 md:gap-8"
        >
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <Star className="absolute top-4 left-10 w-2 h-2 text-white fill-white animate-pulse" />
            <div className="absolute top-[30%] left-[60%] w-16 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent transform -rotate-45"></div>
          </div>
          
          {/* Ảnh Bác Hồ */}
          <div className="w-32 h-44 md:w-36 md:h-48 xl:w-40 xl:h-52 shrink-0 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl relative group-hover:border-indigo-400/50 transition-colors duration-500 bg-slate-900/60">
            <img 
              src="/ho-chi-minh.png" 
              alt="Chủ tịch Hồ Chí Minh" 
              className="w-full h-full object-cover object-top scale-102 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
          </div>

          {/* Lời dạy */}
          <div className="flex-1 flex flex-col justify-center text-center sm:text-left relative z-10">
            <p className="text-base md:text-lg xl:text-xl font-display font-medium text-slate-100 italic leading-relaxed mb-4 tracking-wide relative">
              <span className="text-3xl md:text-4xl text-indigo-400 font-serif absolute -top-3.5 -left-4 opacity-40">“</span>
              Ý thức làm chủ không chỉ không phải chỉ tỏ rõ ở tinh thần hăng hái lao động, mà còn phải tỏ rõ ở tinh thần say mê học tập để không ngừng nâng cao năng lực làm chủ của mình.
              <span className="text-3xl md:text-4xl text-indigo-400 font-serif absolute -bottom-6 opacity-40">”</span>
            </p>
            <p className="text-sm font-black text-[#FFD15B] tracking-widest uppercase mt-2">
              — Chủ tịch Hồ Chí Minh —
            </p>
          </div>
        </motion.div>

        {/* Đếm ngược kỳ thi */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[#1C274C] rounded-[2rem] p-6 md:p-8 relative overflow-hidden border border-white/5 flex flex-col shadow-[0_10px_30px_rgba(28,39,76,0.3)] hover:shadow-[0_20px_40px_rgba(255,209,91,0.3)] hover:-translate-y-2 hover:border-[#FFD15B] transition-all duration-500 cursor-pointer group text-white"
        >
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <Star className="absolute top-12 right-[30%] w-3 h-3 text-white fill-white animate-pulse" />
            <div className="absolute top-[60%] right-[10%] w-20 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent transform -rotate-45"></div>
          </div>
          <div className="flex justify-between items-start mb-6 relative z-10">
             <div>
               <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-[#FFD15B]" /> ĐẾM NGƯỢC KỲ THI
               </h3>
               {!currentUser?.examDate && <h2 className="text-2xl font-bold text-slate-400 group-hover:text-white transition-colors duration-500">Chưa đặt ngày thi</h2>}
             </div>
             <input 
               type="date"
               value={currentUser?.examDate || ''}
               onChange={handleSaveExamDate}
               className="bg-amber-100/10 text-[#FFD15B] hover:bg-[#FFD15B] hover:text-[#121411] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors duration-300 border border-[#FFD15B]/30 hover:border-[#FFD15B] shadow-[0_0_15px_rgba(255,209,91,0.2)] outline-none cursor-pointer"
             />
          </div>
          <div className="mt-auto relative z-10 flex flex-col justify-center flex-1 min-h-[220px] w-full">
            {!currentUser?.examDate ? (
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors duration-500">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                   <Map className="w-5 h-5 text-[#FFD15B]" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">Chọn ngày thi ở trên để xem lộ trình đếm ngược chi tiết từng ngày.</p>
              </div>
            ) : !timeLeft ? (
              <div className="flex flex-col items-center justify-center animate-in zoom-in duration-500 w-full h-full p-2">
                <img src="/cat-good-luck.png" alt="Good Luck Cat" className="w-full max-w-[220px] h-[160px] object-contain mb-2 drop-shadow-[0_0_15px_rgba(255,209,91,0.5)] hover:scale-105 transition-transform duration-300" />
                <p className="text-[#FFD15B] text-center text-base md:text-lg font-black uppercase tracking-widest drop-shadow-md leading-tight">
                  Kỳ thi đã đến!<br />Chúc bạn thi tốt!
                </p>
              </div>
            ) : (
              <div className="flex justify-center items-center gap-3 md:gap-6 bg-white/5 py-4 rounded-2xl border border-white/10">
                <div className="flex flex-col items-center min-w-[50px]">
                  <span className="text-3xl md:text-4xl font-display font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{timeLeft.days}</span>
                  <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Ngày</span>
                </div>
                <span className="text-xl text-[#FFD15B] font-black pb-4">:</span>
                <div className="flex flex-col items-center min-w-[50px]">
                  <span className="text-3xl md:text-4xl font-display font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{timeLeft.hours.toString().padStart(2, '0')}</span>
                  <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Giờ</span>
                </div>
                <span className="text-xl text-[#FFD15B] font-black pb-4">:</span>
                <div className="flex flex-col items-center min-w-[50px]">
                  <span className="text-3xl md:text-4xl font-display font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                  <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Phút</span>
                </div>
                <span className="text-xl text-[#FFD15B] font-black pb-4">:</span>
                <div className="flex flex-col items-center min-w-[50px]">
                  <span className="text-3xl md:text-4xl font-display font-black text-[#FFD15B] drop-shadow-[0_0_15px_rgba(255,209,91,0.5)]">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                  <span className="text-[10px] md:text-xs text-[#FFD15B] font-bold uppercase tracking-wider mt-1">Giây</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Truy cập nhanh (Quick Access) */}
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5, delay: 0.4 }}
         className="pt-4"
      >
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> TRUY CẬP NHANH
           </h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
           {QUICK_ACCESS.map((btn, idx) => (
              <motion.button 
                key={idx}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (btn.path === '#scan') {
                    const scanBtn = document.querySelector('button[title="Scan QR"], button:has(.lucide-qr-code)') as HTMLButtonElement;
                    if(scanBtn) scanBtn.click();
                  } else {
                    navigate(btn.path);
                  }
                }}
                className={`rounded-[2rem] p-5 border border-white/5 transition-all duration-500 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 group ${btn.bg} ${btn.glow} relative overflow-hidden`}
              >
                 <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-[#121A33] ${btn.color} group-hover:scale-110 transition-transform duration-500 shadow-inner border border-white/5 group-hover:border-white/20 relative z-10`}>
                    <btn.icon className="w-6 h-6 drop-shadow-[0_0_8px_currentColor]" />
                 </div>
                 <div className="flex flex-col justify-center h-full relative z-10">
                    <h4 className="font-bold text-white text-sm mb-1 group-hover:text-[#FFD15B] transition-colors">{btn.label}</h4>
                    <p className="text-[11px] text-slate-400 leading-tight hidden sm:block">{btn.desc}</p>
                 </div>
                 <div className="hidden sm:flex mt-auto h-full items-center ml-auto relative z-10">
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#FFD15B] transition-colors group-hover:translate-x-1 duration-300" />
                 </div>
              </motion.button>
           ))}
        </div>
      </motion.div>

      {/* Danh sách phòng học/Lộ trình ngang */}
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5, delay: 0.5 }}
         className="pt-4"
      >
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Building2 className="w-4 h-4 text-slate-400" /> PHÒNG BỘ MÔN
            </h3>
            <div className="flex gap-2">
               <button className="px-4 py-1.5 rounded-full bg-blue-600 dark:bg-[#FFD15B] text-white dark:text-[#121411] text-xs font-bold shadow-sm hover:scale-105 transition-transform">Tất cả</button>
               <button className="px-4 py-1.5 rounded-full bg-white dark:bg-[#1C274C] text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/10 hidden sm:block border border-slate-200 dark:border-white/5 transition-colors">Khoa học</button>
            </div>
         </div>
         
         <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4 md:gap-6 snap-x hide-scrollbar">
            {rooms.map((room, idx) => (
               <motion.div 
                 key={room.id} 
                 whileHover={{ y: -5 }}
                 onClick={() => navigate(`/phong-bo-mon/${room.id}`)} 
                 className="min-w-[280px] sm:min-w-[320px] bg-[#1C274C] rounded-[2rem] p-5 border border-white/5 shadow-lg shadow-indigo-900/10 hover:shadow-[0_15px_40px_rgba(59,130,246,0.3)] hover:border-indigo-400 transition-all duration-500 cursor-pointer snap-start flex flex-col group relative overflow-hidden text-white"
               >
                  <div className="absolute inset-0 pointer-events-none opacity-20">
                     <Star className="absolute top-4 right-10 w-2 h-2 text-white fill-white group-hover:animate-ping" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="flex gap-4 items-start mb-4 relative z-10">
                     <div className="w-12 h-12 bg-[#121A33] text-indigo-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:text-[#FFD15B] transition-colors border border-white/5 shadow-inner group-hover:shadow-[0_0_15px_rgba(255,209,91,0.2)]">
                        <Building2 className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="font-bold text-white text-base leading-tight mb-1 group-hover:text-[#FFD15B] transition-colors line-clamp-2">{room.name}</h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                           <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                           {room.documents?.length || 0} tài liệu
                        </p>
                     </div>
                  </div>
                  
                  <div className="mt-auto relative z-10">
                     <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
                        <span>Tiến độ</span>
                        <span className="text-[#FFD15B]">2/5</span>
                     </div>
                     <div className="w-full bg-[#121A33] rounded-full h-2 overflow-hidden border border-white/5 shadow-inner">
                        <motion.div 
                           initial={{ width: 0 }}
                           whileInView={{ width: '40%' }}
                           transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                           className="bg-[#FFD15B] h-full rounded-full relative overflow-hidden"
                        >
                           <motion.div 
                              animate={{ x: ["-100%", "200%"] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
                           ></motion.div>
                        </motion.div>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
      </motion.div>

      <GifShopModal isOpen={isGifShopOpen} onClose={() => setIsGifShopOpen(false)} />
      <StreakShopModal isOpen={showStreakShop} onClose={() => setShowStreakShop(false)} />
      <StreakCalendarModal isOpen={showStreakCalendar} onClose={() => setShowStreakCalendar(false)} />
    </div>
  );
}


