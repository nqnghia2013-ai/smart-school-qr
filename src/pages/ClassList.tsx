import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Users, Lock, ScanFace, X, Plus, Sparkles, Orbit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DigitalClass } from '../types';
import FaceScanner from '../components/FaceScanner';

export default function ClassList() {
  const { classes, currentUser, addClass } = useAppContext();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<DigitalClass | null>(null);
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [authError, setAuthError] = useState('');
  const [verifyingFaceId, setVerifyingFaceId] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newClass, setNewClass] = useState({ name: '', teacher: '', studentsCount: 0, password: '', requireFaceId: true, faceIdData: [] as number[], teacherFaceImage: undefined as string | undefined });
  const [registeringFace, setRegisteringFace] = useState(false);
  const [faceRegistered, setFaceRegistered] = useState(false);

  const startFaceRegistration = () => setRegisteringFace(true);

  const handleRegisterFaceComplete = (success: boolean, descriptorData?: number[], imageUrl?: string) => {
    setRegisteringFace(false);
    if (success && descriptorData) {
      setFaceRegistered(true);
      setNewClass(c => ({ ...c, faceIdData: descriptorData, teacherFaceImage: imageUrl }));
    }
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceRegistered) {
      alert("Vui lòng thiết lập Face ID trước khi tạo lớp!");
      return;
    }
    addClass({ ...newClass, schedule: [], announcements: [], students: [] });
    setNewClass({ name: '', teacher: '', studentsCount: 0, password: '', requireFaceId: true, faceIdData: [], teacherFaceImage: undefined });
    setFaceRegistered(false);
    setShowCreateModal(false);
  };

  const handleClassClick = (c: DigitalClass) => {
    if (currentUser?.role === 'teacher') {
      if (c.password || c.requireFaceId) {
        setSelectedClass(c);
        return;
      }
    }
    navigate(`/lop-hoc-so/${c.id}`);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClass?.password === passwordAttempt) {
      navigate(`/lop-hoc-so/${selectedClass.id}`);
      setSelectedClass(null);
      setPasswordAttempt('');
      setAuthError('');
    } else {
      setAuthError('Mật khẩu không chính xác.');
    }
  };

  const startFaceVerification = () => {
    setVerifyingFaceId(true);
    setAuthError('');
  };

  const handleVerifyFaceComplete = (success: boolean) => {
    setVerifyingFaceId(false);
    
    if (!success) {
      setAuthError('Khuôn mặt không khớp. Vui lòng thử lại hoặc dùng mật khẩu.');
      return;
    }
    
    navigate(`/lop-hoc-so/${selectedClass?.id}`);
    setSelectedClass(null);
  };

  const gradients = [
    'from-indigo-500 to-purple-500',
    'from-emerald-400 to-cyan-500',
    'from-rose-400 to-orange-500',
    'from-blue-500 to-indigo-600',
    'from-fuchsia-500 to-pink-500',
    'from-amber-400 to-orange-500'
  ];

  return (
    <div className="space-y-8 pb-12 relative">
      
      {/* Background Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-3xl p-8 rounded-3xl border border-white/50 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Orbit className="w-8 h-8 text-indigo-500 animate-spin-slow" />
            <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tight">Lớp Học Số</h1>
          </div>
          <p className="text-slate-600 text-base font-medium">Trung tâm điều hành và quản lý không gian lớp học số hóa.</p>
        </div>
        {(currentUser?.role === 'teacher' || currentUser?.role === 'admin') && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] flex items-center justify-center gap-3 text-sm"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <Plus className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Tạo không gian lớp học</span>
            <Sparkles className="w-4 h-4 absolute top-2 right-2 text-white/50 animate-pulse" />
          </motion.button>
        )}
      </div>

      {classes.length === 0 ? (
        <div className="relative z-10 bg-white/50 backdrop-blur-md rounded-3xl p-12 border border-blue-100 text-center text-slate-500 shadow-inner">
          <Users className="w-16 h-16 mx-auto text-blue-200 mb-4 animate-bounce-slow" />
          <p className="text-lg font-medium">Chưa có lớp học nào. Vui lòng thêm lớp mới.</p>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {classes.map((c, idx) => {
              const bgGradient = gradients[idx % gradients.length];
              return (
                <motion.div 
                  key={c.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05, type: "spring", bounce: 0.5 }}
                  onClick={() => handleClassClick(c)}
                  className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-[260px] flex flex-col"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-90`}></div>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500"></div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full blur-xl -translate-x-1/2 translate-y-1/2"></div>
                  
                  <div className="relative z-10 p-6 flex flex-col h-full text-white">
                    <div className="flex items-start justify-between mb-auto">
                      <div className="p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl shadow-inner border border-white/30">
                        <Users className="w-7 h-7 drop-shadow-md" />
                      </div>
                      {(c.password || c.requireFaceId) && currentUser?.role === 'teacher' ? (
                        <div className="text-white/90 px-3 py-1.5 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 flex items-center gap-1.5 shadow-inner">
                          <Lock className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Bảo mật</span>
                        </div>
                      ) : (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-black bg-white text-slate-900 px-4 py-2 rounded-xl shadow-xl">
                          Vào lớp →
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="font-black font-display text-4xl mb-2 drop-shadow-md tracking-tight">{c.name}</h3>
                      <div className="space-y-1 mt-3 bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                        <p className="text-sm text-white/90 flex justify-between"><span className="font-semibold opacity-80">Giáo viên:</span> <span>{c.teacher}</span></p>
                        <p className="text-sm text-white/90 flex justify-between"><span className="font-semibold opacity-80">Học sinh:</span> <span>{c.studentsCount}</span></p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Verification Auth Modal */}
      <AnimatePresence>
        {selectedClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col relative z-10 border border-white/40"
            >
              <button
                onClick={() => {
                  setSelectedClass(null);
                  setPasswordAttempt('');
                  setAuthError('');
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 bg-slate-100/50 hover:bg-rose-50 p-2 rounded-full transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-8 pb-8 flex flex-col items-center bg-gradient-to-b from-indigo-50 to-white relative">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl text-indigo-600 mb-6 border border-indigo-100">
                  {selectedClass.requireFaceId ? <ScanFace className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
                </div>
                <h2 className="text-2xl font-display font-black text-slate-900 text-center">Xác Thực Sinh Trắc</h2>
                <p className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full mt-3">Lớp {selectedClass.name}</p>
              </div>

              <div className="p-8 pt-0 space-y-6">
                {authError && (
                  <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="bg-rose-50 text-rose-600 p-4 rounded-2xl border border-rose-100 text-sm font-bold text-center shadow-inner">
                    {authError}
                  </motion.div>
                )}

                {selectedClass.requireFaceId && (
                  <div className="flex flex-col items-center">
                    {verifyingFaceId ? (
                      <FaceScanner 
                        isScanning={verifyingFaceId} 
                        onScanComplete={handleVerifyFaceComplete} 
                        mode="verify"
                        targetDescriptor={selectedClass?.faceIdData}
                      />
                    ) : (
                       <button 
                         onClick={startFaceVerification}
                         className="w-full relative overflow-hidden flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-slate-900 hover:bg-black text-white transition-all shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:-translate-y-1"
                       >
                         <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                         <ScanFace className="w-8 h-8 text-cyan-400 animate-pulse" />
                         <span className="font-extrabold text-lg">Quét Face ID</span>
                       </button>
                    )}
                  </div>
                )}

                {selectedClass.requireFaceId && selectedClass.password && (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-slate-200"></div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 rounded-lg">Hoặc</span>
                    <div className="flex-1 h-px bg-slate-200"></div>
                  </div>
                )}

                {selectedClass.password && (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <input
                        type="password"
                        placeholder="Nhập khóa bí mật..."
                        value={passwordAttempt}
                        onChange={e => setPasswordAttempt(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 outline-none text-center tracking-[0.2em] font-mono text-xl shadow-inner transition-all"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={verifyingFaceId}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      Mở khóa
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-lg"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative z-10"
            >
              <div className="p-8 pb-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Plus className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-slate-800">Cấu hình Lớp Mới</h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-full transition-colors shadow-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateClass} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tên Lớp Hoạt Động</label>
                    <input
                      type="text"
                      required
                      value={newClass.name}
                      onChange={e => setNewClass(c => ({ ...c, name: e.target.value }))}
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl p-3.5 text-base outline-none transition-all"
                      placeholder="Vd: 9A1 - Chuyên Toán"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Giáo Viên Quản Trị</label>
                    <input
                      type="text"
                      required
                      value={newClass.teacher}
                      onChange={e => setNewClass(c => ({ ...c, teacher: e.target.value }))}
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl p-3.5 text-base outline-none transition-all"
                      placeholder="Họ Tên Giáo Viên"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Mã Bảo Mật (PIN)</label>
                    <input
                      type="password"
                      value={newClass.password}
                      onChange={e => setNewClass(c => ({ ...c, password: e.target.value }))}
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl p-3.5 text-base outline-none tracking-widest font-mono transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl space-y-4 text-white relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-indigo-500/30 rounded-xl border border-indigo-400/30">
                       <ScanFace className="w-6 h-6 text-cyan-300" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Xác Thực Sinh Trắc Học</h4>
                      <p className="text-xs text-indigo-200 mt-1">Bắt buộc thiết lập nhận diện khuôn mặt quyền Admin.</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    {faceRegistered ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-400/10 p-4 rounded-xl border border-emerald-400/20">
                        <ScanFace className="w-6 h-6" />
                        <span className="text-base font-bold">Base ID Map Đã Lưu</span>
                      </div>
                    ) : registeringFace ? (
                      <div className="py-2 bg-white/5 rounded-xl border border-white/10 p-2">
                        <FaceScanner 
                          isScanning={registeringFace} 
                          onScanComplete={handleRegisterFaceComplete} 
                          mode="register"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={startFaceRegistration}
                        className="w-full group relative overflow-hidden py-4 rounded-xl bg-white text-slate-900 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] shadow-lg mt-2"
                      >
                        <div className="flex items-center justify-center gap-3 relative z-10">
                          <ScanFace className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                          <span className="text-base font-black">Quét Face ID Mới</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-8 py-4 text-slate-600 font-bold hover:bg-slate-100 rounded-2xl transition-colors"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl hover:shadow-indigo-500/30 transition-all hover:-translate-y-1"
                  >
                    Kích Hoạt Lớp
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
