import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Award, 
  CheckCircle2, 
  Bookmark, 
  GraduationCap, 
  Clock, 
  Hexagon, 
  Fingerprint, 
  Activity, 
  Zap, 
  Star, 
  Rocket, 
  Camera, 
  Sparkles, 
  Upload as UploadIcon,
  Cake,
  Edit2
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';

const DEFAULT_AVATARS = [
  { name: 'Phi hành gia xanh', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=astronaut-blue&colors[]=blue' },
  { name: 'Kỹ sư công nghệ', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=tech-wizard&colors[]=cyan' },
  { name: 'Cú tri thức', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=smart-owl' },
  { name: 'Chiến binh robot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=cyber-cadet&colors[]=green' },
  { name: 'Học sinh Felix', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
  { name: 'Nhà phát minh nhí', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=genius' },
  { name: 'Mèo công nghệ', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=cyber-cat&colors[]=purple' },
  { name: 'Sao học thuật', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=scholar-star&colors[]=amber' }
];

const BIRTH_YEARS = Array.from({ length: 16 }, (_, i) => (2005 + i).toString());

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students, classes, currentUser, users, updateUser, showToast } = useAppContext();
  
  // Interactive modal states
  const [showEditAvatarModal, setShowEditAvatarModal] = useState(false);
  const [showEditBirthYearModal, setShowEditBirthYearModal] = useState(false);
  const [tempAvatar, setTempAvatar] = useState('');
  const [tempBirthYear, setTempBirthYear] = useState('');
  
  // Onboarding local states
  const [onboardStep, setOnboardStep] = useState(1);
  const [onboardAvatar, setOnboardAvatar] = useState('');
  const [onboardBirthYear, setOnboardBirthYear] = useState('');

  let studentInfo = students.find(s => s.id === id);
  let classInfo = studentInfo ? classes.find(c => c.id === studentInfo?.classId) : null;
  
  if (!studentInfo && currentUser?.role === 'student' && !id) {
     for (const c of classes) {
       const found = c.students?.find(s => s.userId === currentUser.id);
       if (found) {
         studentInfo = found;
         classInfo = c;
         break;
       }
     }
     
     if (!studentInfo) {
       studentInfo = {
         id: currentUser.id,
         fullName: currentUser.fullName,
         dob: 'Chưa cập nhật',
         classId: '',
         achievements: [],
         trainingScore: 100,
         certificates: [],
         userId: currentUser.id
       };
     }
  }

  if (!studentInfo && currentUser?.role === 'parent' && !id) {
      const linkedStudentId = currentUser.linkedStudentId;
      if (linkedStudentId) {
          studentInfo = students.find(s => s.id === linkedStudentId);
          
          if (!studentInfo) {
              for (const c of classes) {
                const found = c.students?.find(s => s.id === linkedStudentId);
                if (found) {
                  studentInfo = found;
                  break;
                }
              }
          }
          
          if (studentInfo) {
              classInfo = classes.find(c => c.id === studentInfo?.classId);
          }
      }
  }

  if (!studentInfo && id) {
      for (const c of classes) {
        const found = c.students?.find(s => s.id === id);
        if (found) {
          studentInfo = found;
          classInfo = c;
          break;
        }
      }
  }

  // Find associated User account to grab interactive updates
  const associatedUser = users.find(u => 
    u.id === studentInfo?.userId || 
    (u.email && studentInfo?.userId && u.email === studentInfo.userId) ||
    u.id === studentInfo?.id ||
    (u.fullName === studentInfo?.fullName && u.role === 'student')
  );

  const displayAvatar = associatedUser?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentInfo?.fullName || 'Felix'}&backgroundColor=e2e8f0`;
  const displayBirthYear = associatedUser?.birthYear || studentInfo?.dob || 'Chưa cập nhật';
  const isOwnProfile = currentUser && associatedUser && currentUser.id === associatedUser.id;

  // Onboarding trigger: logged-in student lacks setup
  const needsOnboarding = currentUser?.role === 'student' && (!currentUser.avatarUrl || !currentUser.birthYear) && (!id || id === currentUser.id);

  if (!studentInfo) {
      return (
         <div className="flex flex-col items-center justify-center p-12 text-slate-500 min-h-[50vh] dark:text-slate-400">
            <UserIcon className="w-20 h-20 mb-4 text-slate-300 dark:text-slate-700 animate-pulse" />
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">Lỗi định vị danh tính</h2>
            <button onClick={() => navigate('/')} className="mt-4 text-white bg-indigo-600 px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:-translate-y-1">Chuyển hướng trang chủ</button>
         </div>
      );
  }

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'onboard' | 'edit') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        showToast('Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 1.5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'onboard') {
          setOnboardAvatar(base64);
        } else {
          setTempAvatar(base64);
        }
        showToast('Tải ảnh đại diện thành công!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = () => {
    if (!tempAvatar) return;
    if (associatedUser) {
      updateUser(associatedUser.id, { avatarUrl: tempAvatar });
      showToast('Cập nhật ảnh đại diện thành công!', 'success');
      setShowEditAvatarModal(false);
    }
  };

  const handleSaveBirthYear = () => {
    if (!tempBirthYear) return;
    if (associatedUser) {
      updateUser(associatedUser.id, { birthYear: tempBirthYear });
      showToast('Cập nhật năm sinh thành công!', 'success');
      setShowEditBirthYearModal(false);
    }
  };

  const handleCompleteOnboarding = () => {
    if (!onboardAvatar || !onboardBirthYear) {
      showToast('Vui lòng hoàn thành đầy đủ thông tin!', 'warning');
      return;
    }
    if (currentUser) {
      updateUser(currentUser.id, {
        avatarUrl: onboardAvatar,
        birthYear: onboardBirthYear
      });
      showToast('Thiết lập hồ sơ thành công! Chào mừng phi hành viên.', 'success');
    }
  };

  // ONBOARDING MODE
  if (needsOnboarding) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-white dark:bg-[#121620] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl p-6 sm:p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600"></div>

          <div className="text-center mb-8">
            <span className="px-3.5 py-1.5 bg-indigo-55 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest rounded-full">
              Kích hoạt Hồ sơ số
            </span>
            <h1 className="text-3xl font-display font-black text-slate-800 dark:text-white mt-3">Chào mừng Phi hành viên mới!</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Hãy thiết lập nhanh hai thông tin sau để bắt đầu cuộc hành trình.</p>
          </div>

          {/* Progress bar */}
          <div className="flex gap-2 mb-8 max-w-xs mx-auto">
            <div className={`h-1.5 flex-1 rounded-full transition-all ${onboardStep >= 1 ? 'bg-indigo-500' : 'bg-slate-250 dark:bg-white/10'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all ${onboardStep >= 2 ? 'bg-indigo-500' : 'bg-slate-255 dark:bg-white/10'}`} />
          </div>

          {onboardStep === 1 ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200 text-center">Bước 1: Chọn hoặc tải ảnh đại diện của bạn</h3>
              
              {/* Selected Avatar Preview */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-slate-100 dark:bg-[#1a1f2e] border-4 border-indigo-500/30 p-1 overflow-hidden flex items-center justify-center shadow-lg">
                    {onboardAvatar ? (
                      <img src={onboardAvatar} alt="Preview" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <UserIcon className="w-12 h-12 text-slate-400 dark:text-slate-500 animate-pulse" />
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 cursor-pointer shadow-md transition-all">
                    <Camera className="w-4 h-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCustomAvatarUpload(e, 'onboard')} />
                  </label>
                </div>
              </div>

              {/* Default Avatars Grid */}
              <div className="grid grid-cols-4 gap-3">
                {DEFAULT_AVATARS.map((av, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setOnboardAvatar(av.url)}
                    className={`aspect-square rounded-2xl p-1 bg-slate-50 dark:bg-white/5 border-2 transition-all flex items-center justify-center hover:scale-105 ${
                      onboardAvatar === av.url ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/50' : 'border-transparent'
                    }`}
                  >
                    <img src={av.url} alt={av.name} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-6">
                <button
                  disabled={!onboardAvatar}
                  onClick={() => setOnboardStep(2)}
                  className="px-6 py-2.5 bg-indigo-600 disabled:bg-slate-350 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
                >
                  Tiếp tục <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200 text-center">Bước 2: Chọn năm sinh của bạn</h3>

              <div className="grid grid-cols-4 gap-2.5 max-w-md mx-auto">
                {BIRTH_YEARS.map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setOnboardBirthYear(yr)}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                      onboardBirthYear === yr
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-md'
                        : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setOnboardStep(1)}
                  className="px-5 py-2.5 bg-slate-150 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-250 dark:hover:bg-white/20 transition-all"
                >
                  Quay lại
                </button>

                <button
                  disabled={!onboardBirthYear}
                  onClick={handleCompleteOnboarding}
                  className="px-6 py-2.5 bg-emerald-600 disabled:bg-slate-350 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  Hoàn tất thiết lập
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // STANDARD PROFILE RENDER
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 relative text-slate-900 dark:text-white">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-400/20 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[150px] pointer-events-none -z-10"></div>

      {/* Hero Profile HUD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop')] opacity-20 bg-cover bg-center mix-blend-screen"></div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900 to-transparent"></div>
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600"></div>

        <div className="relative z-10 px-6 pt-16 pb-12 sm:px-12 flex flex-col sm:flex-row items-center sm:items-end gap-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="relative shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-indigo-500 rounded-full blur-xl opacity-50 animate-pulse-slow"></div>
            
            {/* Avatar Container */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-slate-800 border-4 border-slate-900 p-1 relative z-10 overflow-hidden shadow-2xl flex items-center justify-center group">
              <img 
                src={displayAvatar} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover bg-slate-100"
              />
              {isOwnProfile && (
                <button 
                  onClick={() => { setTempAvatar(displayAvatar); setShowEditAvatarModal(true); }}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold rounded-full gap-1"
                >
                  <Camera className="w-4 h-4" /> Thay ảnh
                </button>
              )}
            </div>
            
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-7 h-7 rounded-full border-4 border-slate-900 z-20 animate-pulse"></div>
          </motion.div>
          
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                <Fingerprint className="w-3 h-3" /> Đã xác thực
              </span>
              <span className="px-3 py-1 bg-white/10 border border-white/20 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-full">
                ID: {studentInfo.id}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight drop-shadow-md mb-2">{studentInfo.fullName}</h1>
            <p className="text-slate-400 text-lg font-medium flex items-center justify-center sm:justify-start gap-2">
              <Hexagon className="w-5 h-5 text-indigo-400" /> Hồ sơ số / Phi hành viên Không gian {classInfo?.name || 'Vô định'}
            </p>
          </div>
        </div>

        {/* Floating Stats Bar */}
        <div className="relative z-20 bg-slate-800/80 backdrop-blur-xl border-t border-white/10 p-4 sm:p-6 flex flex-wrap justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-[140px] sm:min-w-[200px] bg-slate-900/50 rounded-2xl p-3 sm:p-4 border border-white/5">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Cấp độ Đào tạo</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-lg border border-cyan-500/30">
                12
              </div>
              <div>
                <p className="text-white font-bold text-sm">Học Sinh Xuất Sắc</p>
                <p className="text-xs text-cyan-400">Top 5% Trạm học</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-w-[140px] sm:min-w-[200px] bg-slate-900/50 rounded-2xl p-3 sm:p-4 border border-white/5">
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Điểm Rèn Luyện</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black border border-purple-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-white">Tổng cộng</span>
                  <span className="text-purple-400">{studentInfo.trainingScore || 100} XP</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" 
                    style={{ width: `${Math.min(100, studentInfo.trainingScore || 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-w-[140px] sm:min-w-[200px] bg-slate-900/50 rounded-2xl p-3 sm:p-4 border border-white/5">
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Năm sinh</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black border border-emerald-500/30">
                <Cake className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-white font-bold text-sm truncate">{displayBirthYear}</p>
                  {isOwnProfile && (
                    <button 
                      onClick={() => { setTempBirthYear(displayBirthYear); setShowEditBirthYearModal(true); }}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-emerald-400">Xác thực hệ thống</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col - General Class Stats */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] shadow-xl border border-white dark:border-white/5 p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            
            <h3 className="font-display font-black text-slate-800 dark:text-white text-2xl flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                <Activity className="w-6 h-6" />
              </div>
              Hệ Sinh Thống
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/30 rounded-full blur-2xl"></div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Hạnh kiểm</span>
                  <span className="text-2xl font-black text-white px-3.5 py-1 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-inner">
                    {(studentInfo.trainingScore || 100) >= 90 ? 'Tốt' : (studentInfo.trainingScore || 100) >= 70 ? 'Khá' : 'Trung bình'}
                  </span>
                </div>
                <p className="text-xs text-blue-300 font-medium">Băng thông chuẩn của trường học số</p>
                
                <div className="mt-4 mb-2 flex justify-between text-xs font-bold text-slate-400">
                  <span>Trình độ năng lượng</span>
                  <span>{studentInfo.trainingScore || 100}%</span>
                </div>
                <div className="w-full bg-slate-900/80 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]" 
                    style={{ width: `${Math.min(100, studentInfo.trainingScore || 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/10 shadow-sm flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 shadow-inner">
                    <Star className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-emerald-650 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">Xếp loại HL</p>
                  <p className="font-black text-xl text-emerald-700 dark:text-emerald-400">Ưu Tú</p>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-100/50 dark:border-amber-500/10 shadow-sm flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2 shadow-inner">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-amber-655 dark:text-amber-400 font-bold uppercase tracking-wider mb-1">Kỷ luật</p>
                  <p className="font-black text-xl text-amber-700 dark:text-amber-400">Chuẩn</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Col - Core Achievements & Certificates */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] shadow-xl border border-white dark:border-white/5 p-8 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-dashed border-slate-200 dark:border-white/5">
              <h3 className="font-display font-black text-slate-800 dark:text-white text-2xl flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
                  <Award className="w-6 h-6" />
                </div>
                Thành Tích Thực Tế
              </h3>
            </div>
            
            <div className="space-y-4">
              {studentInfo.achievements && studentInfo.achievements.length > 0 ? (
                studentInfo.achievements.map((ach: string, idx: number) => (
                  <div key={idx} className="group flex gap-6 p-4 rounded-3xl hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-all hover:shadow-lg">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                      <Award className="w-8 h-8 text-white drop-shadow-md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-black text-slate-850 dark:text-white group-hover:text-rose-600 transition-colors truncate">{ach}</h4>
                        <span className="text-[10px] items-center flex font-black tracking-widest text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-lg uppercase border border-rose-100 dark:border-rose-500/20">Cấp Trường</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Được ghi nhận trực tiếp trên hệ thống số.</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <Award className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700 animate-pulse" />
                  <p className="text-sm font-semibold">Chưa có thành tích nào được ghi nhận</p>
                  <p className="text-xs text-slate-500 mt-1">Tích cực hoạt động học tập và rèn luyện để nhận khen thưởng số.</p>
                </div>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-[2rem] p-8 border border-white dark:border-white/5 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors duration-700"></div>
              <h3 className="font-black text-indigo-900 dark:text-indigo-400 flex items-center gap-2 mb-4 relative z-10 text-xl">
                <Bookmark className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Ghi nhận nỗ lực
              </h3>
              <div className="space-y-4 relative z-10">
                <div className="flex items-start gap-3 bg-white/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-white dark:border-white/5 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight mb-1">Điểm chuyên cần và chuyên tâm rèn luyện tốt.</p>
                    <p className="text-[10px] font-black uppercase text-indigo-400 dark:text-indigo-300 tracking-wider">Hệ thống ghi nhận</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 border border-white/10 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/20 transition-all text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl group-hover:bg-cyan-500/30 transition-colors duration-700"></div>
              <h3 className="font-black text-white flex items-center gap-2 mb-4 relative z-10 text-xl">
                <Clock className="w-6 h-6 text-cyan-400" /> Tín Hiệu QR Tương tác
              </h3>
              <div className="relative z-10">
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">99%<span className="text-lg text-slate-400 font-bold ml-1">Đầy đủ</span></p>
                <p className="text-sm text-slate-400 font-medium mb-6">Tham gia lớp học và phòng bộ môn số thông qua quét mã QR an toàn.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ===== EDIT AVATAR MODAL ===== */}
      <AnimatePresence>
        {showEditAvatarModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#121620] rounded-[2rem] max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-white/5 relative"
            >
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4">Thay đổi ảnh đại diện</h3>
              
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-[#1a1f2e] border-2 border-indigo-500 p-0.5 overflow-hidden flex items-center justify-center shadow-lg">
                      <img src={tempAvatar} alt="Preview" className="w-full h-full rounded-full object-cover" />
                    </div>
                    <label className="absolute -bottom-1 -right-1 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 cursor-pointer shadow-md transition-all">
                      <UploadIcon className="w-4 h-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCustomAvatarUpload(e, 'edit')} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {DEFAULT_AVATARS.map((av, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setTempAvatar(av.url)}
                      className={`aspect-square rounded-2xl p-1 bg-slate-50 dark:bg-white/5 border-2 transition-all flex items-center justify-center hover:scale-105 ${
                        tempAvatar === av.url ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent'
                      }`}
                    >
                      <img src={av.url} alt={av.name} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    onClick={() => setShowEditAvatarModal(false)}
                    className="px-5 py-2 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-350 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-white/15 transition-all text-sm"
                  >
                    Hủy bỏ
                  </button>
                  
                  <button 
                    onClick={handleSaveAvatar}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== EDIT BIRTH YEAR MODAL ===== */}
      <AnimatePresence>
        {showEditBirthYearModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#121620] rounded-[2rem] max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-white/5 relative"
            >
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4">Thay đổi năm sinh</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-2.5">
                  {BIRTH_YEARS.map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setTempBirthYear(yr)}
                      className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                        tempBirthYear === yr
                          ? 'border-indigo-500 bg-indigo-600 text-white shadow-md'
                          : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    onClick={() => setShowEditBirthYearModal(false)}
                    className="px-5 py-2 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-350 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-white/15 transition-all text-sm"
                  >
                    Hủy bỏ
                  </button>
                  
                  <button 
                    onClick={handleSaveBirthYear}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
