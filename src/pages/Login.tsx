import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Lock, User, ShieldCheck, Zap, ArrowRight, Fingerprint, Users, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  
  // Parent form state
  const [parentName, setParentName] = useState('');
  const [parentUsername, setParentUsername] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentTeacher, setParentTeacher] = useState('');
  const [parentClass, setParentClass] = useState('');
  const [parentStudent, setParentStudent] = useState('');
  
  const { users, classes, students, login, addUser, updateStudent, updateClass, updateUser } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Try to find the user
    // First by email (for teacher/admin), then by username (for student)
    const normalizedId = (emailOrUsername || '').trim().toLowerCase();
    
    let foundUser = users.find(u => (u.email || '').toLowerCase() === normalizedId) || 
                    users.find(u => (u.username || '').toLowerCase() === normalizedId);
                    
    if (foundUser) {
       // STRICT SECURITY ENFORCEMENT:
       // If the account has no password set (e.g., Google OAuth only account), they MUST use Google Login
       // The ONLY exception is the built-in demo admin account which uses password "admin"
       if (!foundUser.password) {
          if (foundUser.email === 'admin@school.edu.vn' && password === 'admin') {
             // Demo admin bypass
          } else {
             setError('Tài khoản này yêu cầu xác thực bằng Google hoặc chưa thiết lập mật khẩu.');
             return;
          }
       } else if (foundUser.password !== password) {
          setError('Tài khoản hoặc mật khẩu không chính xác.');
          return;
       }

       login(foundUser);
       navigate('/');
    } else {
       setError('Không tìm thấy tài khoản. Vui lòng liên hệ quản trị viên.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setIsLoading(true);
      const user = await signInWithGoogle();
      if (user && user.email) {
        let foundUser = users.find(u => u.email === user.email);
        
        if (!foundUser) {
          const role = (user.email === 'workspacegamer1@gmail.com' || user.email === 'nqnghia2013@gmail.com') ? 'admin' : 'student';
          const newUser = {
            email: user.email,
            fullName: user.displayName || user.email.split('@')[0],
            role: role as any
          };
          const id = addUser(newUser);
          login({ ...newUser, id });
        } else {
          login(foundUser);
        }
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleParentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Find class
    const foundClass = classes.find(c => 
       (c.name || '').toLowerCase().includes((parentClass || '').trim().toLowerCase()) && 
       (c.teacher || '').toLowerCase().includes((parentTeacher || '').trim().toLowerCase())
    );
    
    if (!foundClass) {
        setError('Không tìm thấy Lớp học và Giáo viên chủ nhiệm tương ứng. Vui lòng kiểm tra lại thông tin.');
        return;
    }
    
    // Find student in class (either in global students array or within class.students array)
    let foundStudent = students.find(s => 
       s.classId === foundClass.id && 
       (s.fullName || '').toLowerCase().includes((parentStudent || '').trim().toLowerCase())
    );
    
    if (!foundStudent && foundClass.students) {
       foundStudent = foundClass.students.find(s => 
          (s.fullName || '').toLowerCase().includes((parentStudent || '').trim().toLowerCase())
       );
    }
    
    if (!foundStudent) {
        setError('Không tìm thấy học sinh trong lớp này. Vui lòng kiểm tra lại tên của con.');
        return;
    }
    
    // Update student with parent info if missing
    const isGlobalStudent = students.some(s => s.id === foundStudent!.id);
    if (isGlobalStudent) {
        updateStudent(foundStudent!.id, {
            parentName,
            parentEmail,
            parentPhone
        });
    } else {
        const updatedStudents = foundClass.students?.map(s => {
            if (s.id === foundStudent!.id) {
                return {
                    ...s,
                    parentName,
                    parentEmail,
                    parentPhone
                };
            }
            return s;
        });
        updateClass(foundClass.id, { students: updatedStudents });
    }
    
    // Create or find parent user
    let foundParentUser = users.find(u => (u.email === parentEmail || u.username === parentUsername) && u.role === 'parent');
    
    if (!foundParentUser) {
        const newParentUser = {
            email: parentEmail,
            username: parentUsername,
            password: parentPassword,
            fullName: parentName,
            role: 'parent' as any,
            linkedStudentId: foundStudent.id,
            phone: parentPhone
        };
        const id = addUser(newParentUser);
        foundParentUser = { ...newParentUser, id };
    } else {
        // Update existing parent user's credentials just in case
        updateUser(foundParentUser.id, {
            username: parentUsername,
            password: parentPassword,
            fullName: parentName,
            linkedStudentId: foundStudent.id,
            phone: parentPhone
        });
        foundParentUser = {
            ...foundParentUser,
            username: parentUsername,
            password: parentPassword,
            fullName: parentName,
            linkedStudentId: foundStudent.id,
            phone: parentPhone
        };
    }
    
    login(foundParentUser);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[0%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="bg-white/90 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(37,99,235,0.15)] border border-white overflow-hidden relative">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="p-8 md:p-10">
            {/* Header / Logo */}
            <div className="flex flex-col items-center text-center mb-8 relative z-10">
              <img src="/logo.png" alt="Smart School Workspace" className="h-40 md:h-48 scale-[1.35] object-contain mb-2" />
              <p className="text-slate-500 font-medium text-sm mt-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Xác thực định danh hệ thống
              </p>
            </div>

            {error && !showParentModal && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-sm font-bold flex items-start gap-3"
              >
                <div className="p-1 bg-rose-100 rounded-lg shrink-0"><Lock className="w-4 h-4 text-rose-500" /></div>
                <p className="leading-snug">{error}</p>
              </motion.div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full relative overflow-hidden group bg-white border-2 border-slate-100 hover:border-blue-100 hover:bg-blue-50/50 text-slate-700 font-black py-4 px-4 rounded-xl transition-all mb-4 disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 relative z-10" alt="Google" />
              <span className="relative z-10">{isLoading ? 'Đang thiết lập kết nối...' : 'Tiếp tục với Google'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
            
            <button
              onClick={() => setShowParentModal(true)}
              className="w-full relative overflow-hidden group bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-bold py-3.5 px-4 rounded-xl transition-all mb-8 flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" /> Đăng nhập với tư cách Phụ Huynh
            </button>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs font-black uppercase tracking-widest text-slate-400">
                <span className="px-4 bg-white/0 backdrop-blur-sm">Hoặc Dùng Tài Khoản</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 relative z-10">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Định danh Entity</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={emailOrUsername || ''}
                    onChange={e => setEmailOrUsername(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-800 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 hover:bg-slate-100/50"
                    placeholder="Email hoặc User ID..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Mã khóa (Học sinh)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password || ''}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-800 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 hover:bg-slate-100/50"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full group relative overflow-hidden bg-slate-900 hover:bg-black text-white font-black py-4 px-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-slate-900/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span className="relative z-10 tracking-widest">BẮT ĐẦU PHIÊN CHUẨN</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

          </div>

          <div className="bg-slate-50 border-t border-slate-100 p-6">
             <button
                type="button"
                onClick={() => {
                   setEmailOrUsername('admin@school.edu.vn');
                   setPassword('admin');
                }}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
             >
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Chạy demo với quyền Root
             </button>
             
              <p className="text-center text-[10px] font-bold text-slate-400 mt-5 leading-relaxed uppercase tracking-wider">
                Hệ thống bảo mật mạng cục bộ<br/>
                Sử dụng Email đối với BGH và Giáo viên<br/>
                Sử dụng User ID đối với học sinh
              </p>
          </div>
        </div>
      </motion.div>
      
      {/* Parent Login Modal */}
      <AnimatePresence>
        {showParentModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
             <motion.div 
               initial={{ scale: 0.95, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.95, y: 20 }}
               className="bg-white rounded-3xl shadow-2xl max-w-md w-full my-8 overflow-hidden relative"
             >
                <button onClick={() => setShowParentModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors z-10">
                   <X className="w-5 h-5" />
                </button>
                
                <div className="bg-emerald-500 p-6 text-white text-center">
                   <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                     <Users className="w-8 h-8" />
                   </div>
                   <h2 className="text-2xl font-bold font-display">Cổng Phụ Huynh</h2>
                   <p className="text-emerald-100 mt-1 font-medium">Kết nối với tình hình học tập của con</p>
                </div>
                
                <div className="p-6">
                   {error && showParentModal && (
                      <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-xl text-sm font-medium">
                         {error}
                      </div>
                   )}
                   
                   <form onSubmit={handleParentLogin} className="space-y-4">
                      <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">Họ và tên phụ huynh *</label>
                         <input type="text" required value={parentName || ''} onChange={e => setParentName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" placeholder="Nguyễn Văn A" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Tên tài khoản *</label>
                            <input type="text" required value={parentUsername || ''} onChange={e => setParentUsername(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" placeholder="phuhuynh_an" />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Mật khẩu *</label>
                            <input type="password" required value={parentPassword || ''} onChange={e => setParentPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" placeholder="••••••••" />
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1">Email *</label>
                           <input type="email" required value={parentEmail || ''} onChange={e => setParentEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" placeholder="email@domain.com" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1">Số điện thoại *</label>
                           <input type="tel" required value={parentPhone || ''} onChange={e => setParentPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" placeholder="0987654321" />
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-slate-100 mt-4 mb-2">
                         <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Search className="w-4 h-4 text-emerald-500" /> Tra cứu thông tin học sinh</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1">Tên Lớp (VD: 10A1) *</label>
                           <input type="text" required value={parentClass || ''} onChange={e => setParentClass(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" placeholder="10A1" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1">Giáo viên CN *</label>
                           <input type="text" required value={parentTeacher || ''} onChange={e => setParentTeacher(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" placeholder="Tên giáo viên" />
                        </div>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">Họ tên của con (Học sinh) *</label>
                         <input type="text" required value={parentStudent || ''} onChange={e => setParentStudent(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" placeholder="Nguyễn Hoàng An" />
                      </div>
                      
                      <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl mt-4 transition-colors shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2">
                         Xác nhận & Đăng nhập
                      </button>
                   </form>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

