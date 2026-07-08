import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Lock, User, ShieldCheck, Zap, ArrowRight, Fingerprint, Users, Search, X, Building2, Phone, Mail, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [activeRoleTab, setActiveRoleTab] = useState<'student' | 'parent' | 'teacher' | 'school'>('student');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Parent state
  const [parentSubTab, setParentSubTab] = useState<'login' | 'register'>('login');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentClass, setParentClass] = useState('');
  const [parentStudent, setParentStudent] = useState('');
  const [parentSchoolName, setParentSchoolName] = useState('');
  const [parentRegUsername, setParentRegUsername] = useState('');
  const [parentRegPassword, setParentRegPassword] = useState('');
  
  const [aiVerifying, setAiVerifying] = useState(false);
  const [aiStep, setAiStep] = useState('');

  const { users, classes, students, login, addUser, updateStudent, updateClass, updateUser } = useAppContext();
  const navigate = useNavigate();

  // Reset inputs when switching tabs
  const handleTabChange = (tab: 'student' | 'parent' | 'teacher' | 'school') => {
    setActiveRoleTab(tab);
    setEmailOrUsername('');
    setPassword('');
    setError('');
  };

  // Student Login Handler
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedUsername = emailOrUsername.trim().toLowerCase();
    const foundUser = users.find(
      u => (u.username || '').toLowerCase() === normalizedUsername && u.role === 'student'
    );

    if (foundUser) {
      if (foundUser.password !== password) {
        setError('Mật khẩu không chính xác.');
        return;
      }
      login(foundUser);
      navigate('/');
    } else {
      setError('Tài khoản học sinh không tồn tại. Vui lòng liên hệ giáo viên chủ nhiệm.');
    }
  };

  // Teacher Login Handler (Credentials)
  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedId = emailOrUsername.trim().toLowerCase();
    const foundUser = users.find(
      u => ((u.email || '').toLowerCase() === normalizedId || (u.username || '').toLowerCase() === normalizedId) && u.role === 'teacher'
    );

    if (foundUser) {
      if (foundUser.password !== password) {
        setError('Mật khẩu không chính xác.');
        return;
      }
      login(foundUser);
      navigate('/');
    } else {
      setError('Tài khoản giáo viên không tồn tại.');
    }
  };

  // School Login Handler
  const handleSchoolLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedUsername = emailOrUsername.trim().toLowerCase();
    // Accept school role, default admin and technician in the school tab
    const foundUser = users.find(
      u => ((u.username || '').toLowerCase() === normalizedUsername || (u.email || '').toLowerCase() === normalizedUsername) && 
           (u.role === 'school' || u.role === 'admin' || u.role === 'technician')
    );

    if (foundUser) {
      if (foundUser.password !== password) {
        setError('Mật khẩu không chính xác.');
        return;
      }
      login(foundUser);
      navigate('/');
    } else {
      setError('Tài khoản Nhà trường hoặc Kỹ thuật viên không tồn tại.');
    }
  };

  // Parent Login Handler (Credentials)
  const handleParentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedUsername = emailOrUsername.trim().toLowerCase();
    const foundUser = users.find(
      u => (u.username || '').toLowerCase() === normalizedUsername && u.role === 'parent'
    );

    if (foundUser) {
      if (foundUser.password !== password) {
        setError('Mật khẩu không chính xác.');
        return;
      }
      login(foundUser);
      navigate('/');
    } else {
      setError('Tài khoản phụ huynh không tồn tại. Vui lòng kiểm tra lại hoặc Đăng ký.');
    }
  };

  // Parent Register (with AI Cross-checking)
  const handleParentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (
      !parentName.trim() ||
      !parentPhone.trim() ||
      !parentEmail.trim() ||
      !parentClass.trim() ||
      !parentStudent.trim() ||
      !parentSchoolName.trim() ||
      !parentRegUsername.trim() ||
      !parentRegPassword.trim()
    ) {
      setError('Vui lòng điền đầy đủ tất cả các trường thông tin.');
      return;
    }

    setAiVerifying(true);

    try {
      setAiStep('AI: Đang kết nối cổng dữ liệu thông minh...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setAiStep('AI: Đang định vị và xác thực cổng thông tin Trường học của con...');
      // 1. Find school account matching the school name entered
      const foundSchool = users.find(u => 
        u.role === 'school' && 
        (u.fullName || '').toLowerCase().replace(/\s+/g, '').includes(parentSchoolName.trim().toLowerCase().replace(/\s+/g, ''))
      );

      await new Promise(resolve => setTimeout(resolve, 700));

      if (!foundSchool) {
        throw new Error(`AI: Không tìm thấy Trường học nào mang tên "${parentSchoolName}". Vui lòng liên hệ kỹ thuật viên hoặc kiểm tra lại.`);
      }

      setAiStep(`AI: Tìm thấy trường ${foundSchool.fullName}. Đang rà soát Lớp học "${parentClass}"...`);
      // 2. Find class belonging to that school
      const foundClass = classes.find(c =>
        c.schoolId === foundSchool.id &&
        (c.name || '').toLowerCase().replace(/\s+/g, '').includes(parentClass.trim().toLowerCase().replace(/\s+/g, ''))
      );

      await new Promise(resolve => setTimeout(resolve, 800));

      if (!foundClass) {
        throw new Error(`AI: Không tìm thấy Lớp học "${parentClass}" tại trường ${foundSchool.fullName}.`);
      }

      setAiStep(`AI: Tìm thấy lớp ${foundClass.name}. Đang đối khớp hồ sơ học sinh "${parentStudent}"...`);
      
      // 3. Look up student in that class belonging to that school
      let foundStudent = students.find(
        s => s.schoolId === foundSchool.id &&
             s.classId === foundClass.id && 
             (s.fullName || '').toLowerCase().replace(/\s+/g, '').includes(parentStudent.trim().toLowerCase().replace(/\s+/g, ''))
      );

      if (!foundStudent && foundClass.students) {
        foundStudent = foundClass.students.find(
          s => (s.fullName || '').toLowerCase().replace(/\s+/g, '').includes(parentStudent.trim().toLowerCase().replace(/\s+/g, ''))
        );
      }

      await new Promise(resolve => setTimeout(resolve, 950));

      if (!foundStudent) {
        throw new Error(`AI: Không tìm thấy học sinh nào mang tên "${parentStudent}" thuộc lớp ${foundClass.name} tại trường ${foundSchool.fullName}.`);
      }

      setAiStep(`AI: Đã tìm thấy học sinh ${foundStudent.fullName}! Tiến hành ghép nối hồ sơ...`);

      // Update student profile with parent contact info
      const isGlobalStudent = students.some(s => s.id === foundStudent!.id);
      if (isGlobalStudent) {
        updateStudent(foundStudent.id, {
          parentName,
          parentEmail,
          parentPhone
        });
      } else {
        const updatedStudents = foundClass.students?.map(s => {
          if (s.id === foundStudent!.id) {
            return { ...s, parentName, parentEmail, parentPhone };
          }
          return s;
        });
        updateClass(foundClass.id, { students: updatedStudents });
      }

      setAiStep('AI: Tạo định danh tài khoản Phụ huynh liên kết trường...');

      // Save Parent User account
      const parentUserObj = {
        email: parentEmail,
        username: parentRegUsername,
        password: parentRegPassword,
        fullName: parentName,
        role: 'parent' as const,
        linkedStudentId: foundStudent.id,
        phone: parentPhone,
        schoolId: foundSchool.id
      };

      const newId = addUser(parentUserObj);
      const parentUser = { ...parentUserObj, id: newId };

      await new Promise(resolve => setTimeout(resolve, 600));
      setAiStep('AI: Ghép nối hoàn tất! Đang khởi tạo phiên đăng nhập...');
      await new Promise(resolve => setTimeout(resolve, 400));

      login(parentUser);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Xác thực AI thất bại. Vui lòng rà soát lại thông tin.');
    } finally {
      setAiVerifying(false);
      setAiStep('');
    }
  };

  // Google Login Handler for Teachers & Technicians
  const handleGoogleLogin = async () => {
    try {
      setError('');
      setIsLoading(true);
      const user = await signInWithGoogle();
      if (user && user.email) {
        let foundUser = users.find(u => u.email === user.email);

        if (!foundUser) {
          // Auto-role assignment based on technician whitelist
          const role = (user.email === 'workspacegamer1@gmail.com' || user.email === 'nqnghia2013@gmail.com') ? 'technician' : 'student';
          const newUser = {
            email: user.email,
            fullName: user.displayName || user.email.split('@')[0],
            role: role as any
          };
          const id = addUser(newUser);
          login({ ...newUser, id });
        } else {
          // If the logged-in email is in technician list, make sure they have the technician role
          if (user.email === 'workspacegamer1@gmail.com' || user.email === 'nqnghia2013@gmail.com') {
            if (foundUser.role !== 'technician') {
              updateUser(foundUser.id, { role: 'technician' });
              foundUser = { ...foundUser, role: 'technician' };
            }
          }
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

  return (
    <div className="min-h-screen bg-[#0E131F] flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-100">
      {/* Aesthetic Cyberpunk Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '3s' }}></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-full max-w-[520px] relative z-10"
      >
        <div className="bg-[#151D30]/90 border border-slate-700/50 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative">
          
          {/* Top Decorative bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500"></div>

          <div className="p-6 md:p-10">
            {/* Header & Logo */}
            <div className="flex flex-col items-center text-center mb-6 relative z-10">
              <img src="/logo.png" alt="Smart School Workspace" className="h-32 object-contain scale-[1.25] mb-2" />
              <h2 className="text-xl font-black font-display tracking-widest text-white mt-4 uppercase">
                HỆ THỐNG SMART SCHOOL QR
              </h2>
              <p className="text-slate-400 font-bold text-xs mt-1.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cổng xác thực danh tính phân quyền
              </p>
            </div>

            {/* Role Tabs Selector */}
            <div className="grid grid-cols-4 gap-1.5 bg-[#0B0F19] p-1.5 rounded-2xl border border-slate-800/80 mb-6">
              {[
                { id: 'student', label: 'Học sinh', icon: User },
                { id: 'parent', label: 'Phụ huynh', icon: Users },
                { id: 'teacher', label: 'Giáo viên', icon: Fingerprint },
                { id: 'school', label: 'Nhà trường', icon: Building2 },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all gap-1.5 ${
                    activeRoleTab === tab.id
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeRoleTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Error Message */}
            {error && !aiVerifying && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-2xl text-xs font-bold flex items-start gap-3"
              >
                <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{error}</p>
              </motion.div>
            )}

            {/* AI Verifying Modal Overlay */}
            {aiVerifying && (
              <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 text-center space-y-4">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
                <div className="text-sm font-black text-blue-300 tracking-wider animate-pulse flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>{aiStep}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
                </div>
              </div>
            )}

            {/* 1. STUDENT LOGIN FORM */}
            {activeRoleTab === 'student' && (
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Tên đăng nhập Học sinh</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={emailOrUsername}
                      onChange={e => setEmailOrUsername(e.target.value)}
                      className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-600 hover:bg-[#0D1424]"
                      placeholder="Nhập tài khoản (do GV cấp)..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Mật khẩu học sinh</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-600 hover:bg-[#0D1424]"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-4 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-4 uppercase tracking-widest text-xs"
                >
                  Đăng nhập học sinh
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-center text-[10px] font-bold text-slate-500 mt-4 leading-relaxed uppercase tracking-wider">
                  ⚠️ Tài khoản và mật khẩu của Học sinh do Giáo viên chủ nhiệm cấp.
                </p>
              </form>
            )}

            {/* 2. PARENT AUTHENTICATION */}
            {activeRoleTab === 'parent' && (
              <div className="space-y-4">
                {/* Sub Tab Switcher */}
                <div className="flex bg-[#0B0F19] p-1 rounded-xl border border-slate-850 w-full mb-2">
                  <button
                    onClick={() => { setParentSubTab('login'); setError(''); }}
                    className={`flex-1 text-center py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                      parentSubTab === 'login' ? 'bg-[#1C263F] text-blue-400' : 'text-slate-400'
                    }`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => { setParentSubTab('register'); setError(''); }}
                    className={`flex-1 text-center py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                      parentSubTab === 'register' ? 'bg-[#1C263F] text-blue-400' : 'text-slate-400'
                    }`}
                  >
                    Đăng ký tài khoản
                  </button>
                </div>

                {parentSubTab === 'login' ? (
                  <form onSubmit={handleParentLogin} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Tên đăng nhập Phụ huynh</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={emailOrUsername}
                          onChange={e => setEmailOrUsername(e.target.value)}
                          className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-600 hover:bg-[#0D1424]"
                          placeholder="Nhập tên tài khoản..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Mật khẩu phụ huynh</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-600 hover:bg-[#0D1424]"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full group relative overflow-hidden bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-4 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-4 uppercase tracking-widest text-xs"
                    >
                      Đăng nhập phụ huynh
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleParentRegister} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Tên Phụ huynh *</label>
                        <input
                          type="text"
                          required
                          value={parentName}
                          onChange={e => setParentName(e.target.value)}
                          className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all"
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Số điện thoại *</label>
                        <input
                          type="tel"
                          required
                          value={parentPhone}
                          onChange={e => setParentPhone(e.target.value)}
                          className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all"
                          placeholder="0987654321"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Email liên hệ *</label>
                      <input
                        type="email"
                        required
                        value={parentEmail}
                        onChange={e => setParentEmail(e.target.value)}
                        className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div className="p-3 bg-blue-500/5 rounded-2xl border border-blue-500/10 my-2">
                      <div className="flex items-center gap-2 mb-2 text-xs font-black text-blue-300">
                        <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" /> Tra cứu AI khớp nối Học sinh
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Tên lớp con (VD: 9A) *</label>
                          <input
                            type="text"
                            required
                            value={parentClass}
                            onChange={e => setParentClass(e.target.value)}
                            className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all"
                            placeholder="Vd: 9A"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Họ tên con *</label>
                          <input
                            type="text"
                            required
                            value={parentStudent}
                            onChange={e => setParentStudent(e.target.value)}
                            className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all"
                            placeholder="Nguyễn Văn A"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Trường của con *</label>
                          <input
                            type="text"
                            required
                            value={parentSchoolName}
                            onChange={e => setParentSchoolName(e.target.value)}
                            className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all"
                            placeholder="Vd: THCS Quảng Phú Cầu"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/50">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Tên đăng nhập mới *</label>
                        <input
                          type="text"
                          required
                          value={parentRegUsername}
                          onChange={e => setParentRegUsername(e.target.value)}
                          className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all"
                          placeholder="phuhuynh_a"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Mật khẩu mới *</label>
                        <input
                          type="password"
                          required
                          value={parentRegPassword}
                          onChange={e => setParentRegPassword(e.target.value)}
                          className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={aiVerifying}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black py-3.5 px-4 rounded-xl mt-3 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                      {aiVerifying ? 'AI Đang đối sánh...' : 'AI Xác nhận & Đăng ký'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* 3. TEACHER LOGIN FORM */}
            {activeRoleTab === 'teacher' && (
              <form onSubmit={handleTeacherLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Định danh Giáo viên (Email / Username)</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={emailOrUsername}
                      onChange={e => setEmailOrUsername(e.target.value)}
                      className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-600 hover:bg-[#0D1424]"
                      placeholder="maiphuong@school.edu.vn"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-600 hover:bg-[#0D1424]"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full group relative overflow-hidden bg-slate-850 hover:bg-slate-800 text-white font-black py-4 px-4 rounded-xl border border-slate-700/60 shadow-lg transition-all flex items-center justify-center gap-2 mt-2 uppercase tracking-widest text-xs"
                >
                  Xác thực giáo viên
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <span className="px-4 bg-[#151D30]">Hoặc đăng nhập bằng</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full relative overflow-hidden group bg-white hover:bg-slate-100 text-slate-800 font-black py-3.5 px-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-md"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                  <span className="text-xs uppercase tracking-wider">{isLoading ? 'Đang xác thực Google...' : 'Đăng nhập Google'}</span>
                </button>
              </form>
            )}

            {/* 4. SCHOOL LOGIN FORM */}
            {activeRoleTab === 'school' && (
              <form onSubmit={handleSchoolLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Tên đăng nhập Nhà trường / Kỹ thuật viên</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={emailOrUsername}
                      onChange={e => setEmailOrUsername(e.target.value)}
                      className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-600 hover:bg-[#0D1424]"
                      placeholder="Nhập tên đăng nhập..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-600 hover:bg-[#0D1424]"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full group relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-4 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-4 uppercase tracking-widest text-xs"
                >
                  Đăng nhập Nhà trường
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-2 mt-6">
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Thông tin cấp tài khoản
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Tài khoản Nhà trường do Kỹ thuật viên hệ thống cấp. Vui lòng liên hệ hỗ trợ cấp mới qua các kênh liên lạc sau:
                  </p>
                  <div className="text-[11px] font-bold space-y-1 text-slate-300">
                    <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-indigo-400" /> workspacegamer1@gmail.com</div>
                    <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-indigo-400" /> 0569825464</div>
                  </div>
                </div>
              </form>
            )}

          </div>

          {/* Footer Demo Shortcuts */}
          <div className="bg-[#0B0F19] border-t border-slate-800/80 p-5 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  handleTabChange('school');
                  setEmailOrUsername('admin');
                  setPassword('admin');
                }}
                className="bg-[#121A2C] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" /> Demo Admin School
              </button>

              <button
                type="button"
                onClick={() => {
                  handleTabChange('school');
                  setEmailOrUsername('kythuatvien@school.edu.vn');
                  setPassword('123456');
                }}
                className="bg-[#1C2012] border border-[#2D331D] hover:border-[#3E4728] text-slate-400 hover:text-white font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 shrink-0" /> Demo Technician
              </button>
            </div>
            
            <p className="text-center text-[9px] font-bold text-slate-600 mt-2 leading-relaxed uppercase tracking-wider">
              Hệ thống quản lý chuẩn học vụ số hoá<br/>
              Mã hoá định danh sinh trắc học & Bảo mật cấp độ cao
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
