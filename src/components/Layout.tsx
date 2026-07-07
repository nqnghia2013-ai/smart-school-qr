import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { playNotificationSound, playAlarmSound } from '../utils/audio';
import { 
  Building2, 
  Map, 
  Users, 
  BookOpen, 
  UserSquare2, 
  LayoutDashboard, 
  QrCode,
  Bell,
  Search,
  Menu,
  X,
  Settings,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Library,
  MessageCircleQuestion,
  GraduationCap,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  MessagesSquare,
  Moon,
  Sun,
  Coins,
  Brain,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { useAppContext } from '../context/AppContext';
import { AppNotification } from '../types';
import Chatbot from './Chatbot';

import { useTheme } from '../context/ThemeContext';

interface NavItem {
  path: string;
  label: string;
  icon: any;
  adminOnly?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Học tập & Tiện ích",
    items: [
      { path: '/', label: 'Tổng quan', icon: LayoutDashboard },
      { path: '/workspace', label: 'Không gian làm việc', icon: Brain },
      { path: '/phong-bo-mon', label: 'Phòng học bộ môn', icon: Building2 },
      { path: '/lop-hoc-so', label: 'Lớp học số', icon: Users },
      { path: '/ho-so-hoc-sinh', label: 'Hồ sơ học sinh', icon: UserSquare2 },
      { path: '/thu-vien', label: 'Thư viện tài liệu', icon: Library },
      { path: '/app-hoc-tap', label: 'App học tập', icon: Globe },
      { path: '/ket-noi', label: 'Kết nối & Giao lưu', icon: MessagesSquare },
      { path: '/hoi-dap', label: 'Hỏi đáp ẩn danh', icon: MessageCircleQuestion },
    ]
  },
  {
    title: "Quản lý hệ thống",
    items: [
      { path: '/quan-ly', label: 'Quản trị hệ thống', icon: Settings, adminOnly: true },
    ]
  },
  {
    title: "Hỗ trợ",
    items: [
      { path: '/huong-dan', label: 'Hướng dẫn sử dụng', icon: BookOpenText },
      { path: '/nhat-ky', label: 'Nhật ký dự án', icon: BookOpenText },
      { path: '/gop-y', label: 'Góp ý hệ thống', icon: MessageSquarePlus },
    ]
  }
];

export function Layout() {
  const { isDark, theme, setTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);
  const navigate = useNavigate();
  const { recordRoomVisit, currentUser, logout, notifications, markNotificationAsRead, clearAllNotifications, students, classes, staffs, showToast } = useAppContext();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const seenNotifsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleShowToast = (e: any) => {
      const { message, type } = e.detail;
      const newToast = {
        id: Date.now().toString() + Math.random().toString(),
        title: type === 'success' ? 'Thành công' : type === 'error' ? 'Lỗi' : type === 'warning' ? 'Cảnh báo' : 'Thông báo',
        message,
        type,
        date: new Date().toISOString()
      };
      setActiveToasts(prev => [...prev, newToast as any]);
      setTimeout(() => {
        setActiveToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 3000);
    };
    window.addEventListener('show-toast', handleShowToast);
    return () => window.removeEventListener('show-toast', handleShowToast);
  }, []);

  useEffect(() => {
    notifications.forEach(notif => {
      if (!seenNotifsRef.current.has(notif.id)) {
        seenNotifsRef.current.add(notif.id);
        
        // Skip playing sounds if it's an old notification that just loaded
        const isRecent = new Date().getTime() - new Date(notif.date).getTime() < 10000;
        
        if (isRecent) {
           // Decide if we should play sound for the current user
           let isMine = false;
           if (currentUser?.role === 'admin' && notif.type === 'warning' && notif.title.includes('vi phạm')) {
              playAlarmSound();
              isMine = true;
           } else if (notif.userId === currentUser?.id || (!notif.userId && currentUser?.role === 'student' && notif.type !== 'warning')) {
              if (notif.type === 'error' || notif.type === 'info') {
                 playNotificationSound();
              }
              isMine = true;
           }
           
           if (isMine) {
              setActiveToasts(prev => [...prev, notif]);
              setTimeout(() => {
                 setActiveToasts(prev => prev.filter(t => t.id !== notif.id));
              }, 3000);
           }
        }
      }
    });
  }, [notifications, currentUser]);

  const scannerRef = React.useRef<Html5QrcodeScanner | null>(null);

  const closeScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear().catch(console.error);
      } catch (e) {
        console.error(e);
      }
      scannerRef.current = null;
    }
    setIsScanModalOpen(false);
  };

  const handleScanSuccess = (decodedText: string) => {
    closeScanner();
    recordRoomVisit();
    
    let redirectPath = decodedText;
    
    // Smart guessing for manual inputs
    if (!redirectPath.includes('/')) {
      const lower = (redirectPath || '').toLowerCase();
      if(['bio', 'sinh', 'sinh hoc'].includes(lower)) redirectPath = '/room/bio';
      else if(['chem', 'hoa', 'hoa hoc'].includes(lower)) redirectPath = '/room/chem';
      else if(['phys', 'ly', 'vat ly'].includes(lower)) redirectPath = '/room/phys';
      else if(['it', 'tin', 'tin hoc'].includes(lower)) redirectPath = '/room/it';
      else if(['tech', 'cong nghe'].includes(lower)) redirectPath = '/room/tech';
      else if(['9a1', '8a2', '7a3', 'he-sinh-thai'].includes(lower)) redirectPath = '/class/hso1';
    }
    
    // Simulating routing based on QR content
    if (redirectPath.includes('/room/')) {
      const roomId = redirectPath.split('/room/')[1];
      navigate(`/phong-bo-mon/${roomId}`);
    } else if (redirectPath.includes('/class/')) {
      const classId = redirectPath.split('/class/')[1];
      navigate(`/lop-hoc-so/${classId}`);
    } else {
      alert(`Đã nhập hoặc quét: ${redirectPath}`);
    }
  };

  const handleManualScan = () => {
    if (!manualCode.trim()) return;
    handleScanSuccess(manualCode);
    setManualCode("");
  };

  useEffect(() => {
    if (isScanModalOpen) {
      // Delay initialization slightly to ensure the DOM has painted the #reader div
      // because React's state update and conditional rendering might not have resolved yet.
      const timer = setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          "reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
            supportedScanTypes: [0] // Only camera, we handle file separately
          },
          /* verbose= */ false
        );
        scannerRef.current = scanner;

        scanner.render((decodedText) => {
          handleScanSuccess(decodedText);
        }, (error) => {
          // Handle scan errors silently
        });
      }, 100);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          try {
            scannerRef.current.clear().catch(console.error);
          } catch (e) {}
          scannerRef.current = null;
        }
      };
    }
  }, [isScanModalOpen, navigate, recordRoomVisit]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode("hidden-reader-id");
      const decodedText = await html5QrCode.scanFileV2(file);
      showToast('Tải tài liệu thành công', 'success');
      handleScanSuccess(decodedText.decodedText);
    } catch (err) {
      alert("Không tìm thấy mã QR hợp lệ trong ảnh!");
    }
  };

  if (!currentUser) return null;

  const filteredNavGroups = NAV_GROUPS.map(group => {
    return {
      ...group,
      items: group.items.filter(item => {
        if (item.adminOnly && currentUser.role !== 'admin') {
          return false;
        }
        if (currentUser.role === 'parent') {
          const allowedForParent = ['/ho-so-hoc-sinh', '/thu-vien', '/huong-dan', '/gop-y', '/nhat-ky', '/hoi-dap'];
          if (!allowedForParent.includes(item.path)) {
            return false;
          }
        }
        return true;
      })
    };
  }).filter(group => group.items.length > 0);

  const myNotifications = notifications.filter(notif => {
    return notif.userId === currentUser.id || 
           (currentUser.role === 'admin' && notif.type === 'warning' && notif.title.includes('vi phạm')) ||
           (!notif.userId); // Show general notifications to all users, specific ones to owners
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  return (
    <MotionConfig transition={isMobile ? { duration: 0 } : undefined}>
      <div className="flex h-screen bg-slate-50 dark:bg-[#191C1A] text-slate-800 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 z-[60] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:relative inset-y-0 left-0 bg-white dark:bg-[#131612] border-r border-slate-200 dark:border-white/5 flex flex-col z-[70] transform transition-all duration-300 ease-in-out w-64 ${
          isSidebarCollapsed ? 'lg:w-[88px]' : 'lg:w-64'
        } ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Desktop Collapse Toggle */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          className="hidden lg:flex absolute -right-3 top-8 bg-white dark:bg-[#20251E] border border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:shadow-md rounded-full p-1 z-[80] shadow-sm transition-all"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={`flex items-center relative z-10 px-6 py-3 ${isSidebarCollapsed ? 'lg:justify-center lg:px-0' : 'justify-between'}`}>
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Smart School Workspace" 
              className={`transition-all duration-300 object-contain scale-[1.35] origin-left ${isSidebarCollapsed ? 'h-14 w-14 ml-2' : 'h-24 w-auto -ml-2 mt-2'}`} 
            />
          </div>
          <button className={`lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white shrink-0 ml-2 ${isSidebarCollapsed ? 'hidden' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className={`flex-1 space-y-4 mt-2 overflow-y-auto overflow-x-hidden relative z-10 ${isSidebarCollapsed ? 'lg:px-3 px-4' : 'px-4'}`}>
          {filteredNavGroups.map((group, index) => (
            <div key={index} className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-3 pb-1 text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">
                  {group.title}
                </div>
              )}
              {isSidebarCollapsed && (
                <div className="flex justify-center pb-2 pt-2">
                   <div className="w-6 h-[1px] bg-slate-200 dark:bg-white/10"></div>
                </div>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-2xl font-medium transition-all duration-300 relative group overflow-hidden ${
                      isSidebarCollapsed ? 'lg:justify-center' : 'space-x-3'
                    } ${
                      isActive
                        ? 'text-[#121411] bg-[#FFD15B] font-bold shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                    }`
                  }
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <div className={`relative z-10 rounded-lg transition-all duration-500 group-hover:scale-125 group-hover:-rotate-6 group-active:scale-95 shrink-0 ${isActive ? 'text-indigo-600 dark:text-[#121411] scale-110' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white'}`} style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                        <item.icon className="w-5 h-5 transition-transform duration-500 group-hover:drop-shadow-lg" strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span className={`relative z-10 whitespace-nowrap transition-opacity duration-200 ${isSidebarCollapsed ? 'lg:hidden lg:opacity-0 lg:w-0' : 'opacity-100'}`}>
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        
        <div className={`mt-auto p-6 hidden lg:block relative z-10 group border-t border-slate-100 dark:border-white/5 ${isSidebarCollapsed ? 'lg:px-3 lg:pb-6' : ''}`}>
          <div className={`relative bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 overflow-hidden ${isSidebarCollapsed ? 'p-3 flex justify-center' : 'p-4'}`}>
            
            {isSidebarCollapsed ? (
              <div className="relative group-hover:animate-pulse" title="Hệ thống Đang hoạt động">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)] mx-auto"></div>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2 break-keep whitespace-nowrap">Trạng thái hệ thống</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Đang hoạt động</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-[#161917]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center w-64 lg:w-96 relative group z-50">
              <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-2 shrink-0 absolute ml-3" />
              <input
                type="text"
                placeholder="Tìm kiếm phi hành đoàn, hồ sơ..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#FFD15B] focus:border-transparent block w-full pl-10 p-2.5 transition-shadow"
              />
              <AnimatePresence>
                {isSearchFocused && globalSearch.length > 0 && (
                   <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 10 }}
                     className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1C274C] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto"
                   >
                     {(() => {
                       const lowerQ = globalSearch.toLowerCase();
                       
                       const searchResults = [];
                       const seenIds = new Set();
                       
                       const addResult = (id: string, name: string, sub: string, link: string) => {
                         if (seenIds.has(id)) return;
                         seenIds.add(id);
                         if (name.toLowerCase().includes(lowerQ) || sub.toLowerCase().includes(lowerQ)) {
                           searchResults.push({ id, name, sub, link });
                         }
                       };
                       
                       students.forEach(s => addResult(s.id, s.fullName, 'Học sinh', `/ho-so-hoc-sinh/${s.id}`));
                       classes.forEach(c => {
                         addResult(c.id, c.name, 'Lớp học số', `/lop-hoc-so/${c.id}`);
                         c.students?.forEach((s: any) => addResult(s.id, s.fullName, `Học sinh lớp ${c.name}`, `/ho-so-hoc-sinh/${s.id}`));
                       });
                       
                       if (searchResults.length === 0) {
                         return <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Không tìm thấy kết quả.</div>;
                       }
                       
                       return searchResults.slice(0, 8).map(res => (
                         <div 
                           key={res.id} 
                           onClick={() => navigate(res.link)}
                           className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer border-b border-slate-100 dark:border-white/5 last:border-0"
                         >
                           <p className="text-sm font-bold text-slate-800 dark:text-white">{res.name}</p>
                           <p className="text-xs text-slate-500 dark:text-slate-400">{res.sub}</p>
                         </div>
                       ));
                     })()}
                   </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white/5 hover:bg-slate-800 dark:hover:bg-white/10 text-[#FFD15B] border border-[#FFD15B]/20 rounded-xl text-sm font-bold transition-colors"
            >
              <Coins className="w-4 h-4 text-[#FFD15B]" />
              <span className="text-[#FFD15B]">{currentUser?.coins || 0}</span>
            </button>
            
            <button 
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="hidden sm:flex p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button 
              onClick={() => setIsScanModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FFD15B] hover:bg-[#EAB308] text-[#121411] rounded-xl text-sm font-bold shadow-sm transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Quét QR</span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)} 
                className={`relative p-2 rounded-full transition-colors ${isNotificationOpen ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
              </button>

              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-[#1C274C] rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/10 overflow-hidden z-50 origin-top-right"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-[#121A33]">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 dark:text-white">Thông báo</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs font-bold text-blue-600 dark:text-indigo-400 bg-blue-100 dark:bg-indigo-900/50 px-2 py-1 rounded-full">
                            {unreadCount} mới
                          </span>
                        )}
                      </div>
                      {myNotifications.length > 0 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); clearAllNotifications(); }}
                          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          Xóa tất cả
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {myNotifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                          <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                          Chưa có thông báo nào
                        </div>
                      ) : (
                        myNotifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => !notif.isRead && markNotificationAsRead(notif.id)}
                            className={`p-4 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors ${!notif.isRead ? 'bg-blue-50/30 dark:bg-indigo-900/20' : ''}`}
                          >
                            <div className="flex gap-3">
                              <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${!notif.isRead ? 'bg-blue-500 dark:bg-indigo-500' : 'bg-transparent'}`}></div>
                              <div>
                                <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-slate-800 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-400'}`}>{notif.title}</h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(notif.date).toLocaleString('vi-VN')}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-2 cursor-pointer p-1 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-indigo-900 flex items-center justify-center text-blue-600 dark:text-indigo-300 font-bold overflow-hidden shrink-0 font-display">
                 {currentUser?.avatarUrl ? (
                   <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   currentUser?.fullName?.charAt(0) || 'U'
                 )}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-slate-700 dark:text-slate-200">{currentUser.fullName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">{currentUser.role}</p>
              </div>
            </div>
            <button onClick={() => logout()} title="Đăng xuất" className="ml-2 p-2 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto flex flex-col bg-transparent pb-24 lg:pb-0">
          <div className={`flex-1 ${location.pathname === '/ket-noi' ? 'p-0 md:p-4 lg:p-8' : 'p-4 lg:p-8'}`}>
            {isMobile ? (
              <Outlet />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            )}
          </div>

          <footer className="mt-8 bg-white dark:bg-[#161917] border-t border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 px-6 lg:px-12 py-10 hidden md:block">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-10">
              {/* Column 1 */}
              <div className="lg:col-span-4 space-y-4 pr-4">
                <div className="mb-4">
                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white leading-tight tracking-tight uppercase">
                    SMART SCHOOL<br/>WORKSPACE
                  </h3>
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-xs tracking-wider uppercase mt-1.5 block">
                    Nền tảng chuyển đổi số
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm">
                  Hệ sinh thái chuyển đổi số giáo dục thông minh. "Quét một mã QR – Kết nối toàn bộ môi trường học tập".
                </p>
                <div className="flex space-x-5 pt-2">
                  <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Facebook className="w-5 h-5" /></a>
                  <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors"><Twitter className="w-5 h-5" /></a>
                  <a href="#" className="text-slate-400 hover:text-pink-600 transition-colors"><Instagram className="w-5 h-5" /></a>
                  <a href="#" className="text-slate-400 hover:text-red-600 transition-colors"><Youtube className="w-5 h-5" /></a>
                </div>
              </div>

              {/* Column 2 */}
              <div className="lg:col-span-3">
                <h4 className="font-bold text-slate-900 dark:text-white mb-5 font-display text-base">Hệ Sinh Thái</h4>
                <ul className="space-y-3.5 text-sm font-medium">
                  <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Phòng Bộ Môn Số</a></li>
                  <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Lớp Học Thông Minh</a></li>
                  <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Bản Đồ Trường Học</a></li>
                  <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Học Liệu Điện Tử</a></li>
                </ul>
              </div>

              {/* Column 3 */}
              <div className="lg:col-span-2">
                <h4 className="font-bold text-slate-900 mb-5 font-display text-base">Hỗ Trợ</h4>
                <ul className="space-y-3.5 text-sm font-medium">
                  <li><NavLink to="/huong-dan" className="text-slate-500 hover:text-blue-600 transition-colors">Hướng dẫn sử dụng</NavLink></li>
                  <li><NavLink to="/cau-hoi-thuong-gap" className="text-slate-500 hover:text-blue-600 transition-colors">Câu hỏi thường gặp</NavLink></li>
                  <li><NavLink to="/chinh-sach-bao-mat" className="text-slate-500 hover:text-blue-600 transition-colors">Chính sách bảo mật</NavLink></li>
                  <li><NavLink to="/dieu-khoan-dich-vu" className="text-slate-500 hover:text-blue-600 transition-colors">Điều khoản dịch vụ</NavLink></li>
                </ul>
              </div>

              {/* Column 4 */}
              <div className="lg:col-span-3">
                <h4 className="font-bold text-slate-900 mb-5 font-display text-base">Liên Hệ</h4>
                <ul className="space-y-4 text-sm font-medium">
                  <li className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-emerald-500 shrink-0" strokeWidth={1.5} />
                    <span className="text-slate-500">THCS Quảng Phú Cầu, Quảng Nguyên, Ứng Thiên, TP. Hà Nội</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-emerald-500 shrink-0" strokeWidth={1.5} />
                    <span className="text-slate-500">0569825464</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-emerald-500 shrink-0" strokeWidth={1.5} />
                    <span className="text-slate-500">workspacegamer1@gmail.com</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 flex flex-col md:flex-row items-end md:items-center justify-between gap-6 md:gap-4 text-sm text-slate-500 font-medium">
              <div className="flex flex-col items-start gap-4 w-full md:w-auto">
                <img src="/tem-bao-hanh.png" alt="Tem bảo hành Haneul Tech" className="h-16 md:h-20 object-contain drop-shadow-lg" />
                <p>© 2026 Smart School Workspace System. Giải pháp tham dự Samsung Solve For Tomorrow.</p>
              </div>
              <p className="w-full md:w-auto text-left md:text-right">Phát triển bằng <span className="text-red-500 mx-1">❤️</span> tại Việt Nam</p>
            </div>
          </footer>
        </div>

                {/* Mobile Floating Glassmorphic Nav Dock */}
        <div className="lg:hidden fixed bottom-6 left-4 right-4 h-16 rounded-2xl bg-white/80 dark:bg-[#131612]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 flex items-center justify-around px-2 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] pb-safe">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 text-[10px] transition-all ${
                isActive ? 'text-indigo-600 dark:text-[#FFD15B] font-bold scale-105' : 'text-slate-400 dark:text-slate-500'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Tổng quan</span>
          </NavLink>
          <NavLink
            to="/workspace"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 text-[10px] transition-all ${
                isActive ? 'text-indigo-600 dark:text-[#FFD15B] font-bold scale-105' : 'text-slate-400 dark:text-slate-500'
              }`
            }
          >
            <Brain className="w-5 h-5 mb-0.5" />
            <span>Workspace</span>
          </NavLink>

          {/* Raised Central QR Button */}
          <div className="relative -top-5 flex flex-col items-center justify-center shrink-0 w-16 h-16 z-50">
            <button
              onClick={() => setIsScanModalOpen(true)}
              className="w-14 h-14 bg-gradient-to-br from-[#FFD15B] to-amber-500 hover:from-amber-400 hover:to-amber-600 text-slate-900 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/35 border-4 border-slate-50 dark:border-[#191C1A] transition-all duration-300 transform active:scale-95"
              title="Quét QR nhanh"
            >
              <QrCode className="w-6 h-6 animate-pulse" />
            </button>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold mt-1 uppercase tracking-wider">Quét QR</span>
          </div>

          <NavLink
            to="/phong-bo-mon"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 text-[10px] transition-all ${
                isActive ? 'text-indigo-600 dark:text-[#FFD15B] font-bold scale-105' : 'text-slate-400 dark:text-slate-500'
              }`
            }
          >
            <Building2 className="w-5 h-5 mb-0.5" />
            <span>Bộ môn</span>
          </NavLink>
          <NavLink
            to="/lop-hoc-so"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 text-[10px] transition-all ${
                isActive ? 'text-indigo-600 dark:text-[#FFD15B] font-bold scale-105' : 'text-slate-400 dark:text-slate-500'
              }`
            }
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span>Lớp học</span>
          </NavLink>        </div>
      </main>

      {/* Mock Scan QR Modal */}
      <AnimatePresence>
        {isScanModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm"
              onClick={() => closeScanner()}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-[#1C274C] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-[#FFD15B]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFD15B]/20 shadow-inner">
                  <QrCode className="w-8 h-8 text-amber-600 dark:text-[#FFD15B]" />
                </div>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-2">Quét Mã QR</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                  Đưa camera của bạn lại gần mã QR của phòng học hoặc tài liệu để truy cập nhanh.
                </p>
                
                <div id="reader" className="mb-6 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5" style={{ width: '100%', minHeight: '300px' }}>
                  {/* html5-qrcode will render here */}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="bg-slate-50 dark:bg-[#121A33] p-4 border border-slate-200 dark:border-white/5 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 text-left">Không có camera? Nhập mã thủ công:</p>
                    <div className="flex gap-2">
                       <input
                          type="text"
                          value={manualCode}
                          onChange={(e) => setManualCode(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
                          placeholder="Nhập mã (VD: BIO, 9A1...)"
                          className="flex-1 w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-[#FFD15B] outline-none rounded-lg px-3 py-2 text-sm font-medium"
                       />
                       <button
                          onClick={handleManualScan}
                          className="bg-[#FFD15B] px-4 rounded-lg text-[#121411] font-bold text-sm shadow-sm hover:bg-[#EAB308] transition"
                       >
                         Tới
                       </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-3">
                    <label className="flex-1 px-4 py-2 bg-amber-50 dark:bg-white/5 hover:bg-amber-100 dark:hover:bg-white/10 text-amber-700 dark:text-white font-bold rounded-xl transition-colors cursor-pointer block border border-amber-200 dark:border-white/10 shadow-sm relative text-sm">
                      Tải ảnh QR lên
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileUpload} 
                      />
                    </label>
                    <button 
                      onClick={() => closeScanner()}
                      className="flex-1 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors text-sm"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
                {/* Hidden container for manual file scan fallback */}
                <div id="hidden-reader-id" style={{ display: 'none' }}></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Chatbot />
      
      {/* Toaster */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {activeToasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 50 }}
              className={`p-4 rounded-xl shadow-xl shadow-slate-200/50 border flex items-center gap-3 bg-white pointer-events-auto break-words min-w-[300px] max-w-sm ${
                toast.type === 'error' ? 'border-red-200' : 
                toast.type === 'warning' ? 'border-amber-200' : 
                toast.type === 'success' ? 'border-emerald-200' : 'border-blue-200'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                toast.type === 'error' ? 'bg-red-500' : 
                toast.type === 'warning' ? 'bg-amber-500' : 
                toast.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
              }`}></div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{toast.title}</h4>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-3">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
    </MotionConfig>
  );
}
