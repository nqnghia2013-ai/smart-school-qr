import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Trash2, Download, Building2, Users, ShieldAlert, Search, Database, Hexagon, Fingerprint, Lock, ShieldCheck, Terminal, Radar, X, User } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';

export default function Admin() {
  const { currentUser, rooms, addRoom, deleteRoom, classes, addClass, deleteClass, updateClass, users, updateUserRole, deleteUser, addUser } = useAppContext();
  const [newRoom, setNewRoom] = useState({ name: '', description: '', iconName: 'Book', color: 'bg-blue-50 text-blue-600' });
  const [newClass, setNewClass] = useState({ name: '', teacher: '', studentsCount: 0, password: '', requireFaceId: false });
  const [activeTab, setActiveTab] = useState<'rooms' | 'classes' | 'roles' | 'teachers'>('rooms');
  const [searchQuery, setSearchQuery] = useState('');

  // Teacher Creation States
  const [showAddTeacherForm, setShowAddTeacherForm] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherUsername, setNewTeacherUsername] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');

  // 1. Guard check for admin or school role
  if (currentUser?.role !== 'admin' && currentUser?.role !== 'school') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
         <ShieldAlert className="w-20 h-20 text-rose-500 mb-6" />
         <h1 className="text-3xl font-display font-black text-slate-800 mb-2">Truy Cập Bị Từ Chối</h1>
         <p className="text-slate-500">Bạn không có quyền truy cập vào phân hệ quản trị này.</p>
      </div>
    );
  }

  const schoolId = currentUser?.schoolId || '';

  // 2. Filter classes by schoolId if school account
  const filteredClasses = currentUser?.role === 'school'
    ? classes.filter(c => c.schoolId === schoolId)
    : classes;

  // 3. Filter users by schoolId if school account
  const filteredUsers = users.filter(u => {
    if (currentUser?.role !== 'school') return true;
    if (u.id === currentUser.id) return true;
    if (u.schoolId === schoolId) return true;
    
    // Fallback check if student is assigned to class belonging to this school
    if (u.role === 'student' && u.assignedClassId) {
      return filteredClasses.some(c => c.id === u.assignedClassId);
    }
    return false;
  });

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    addRoom({ ...newRoom, contents: [] });
    setNewRoom({ name: '', description: '', iconName: 'Book', color: 'bg-blue-50 text-blue-600' });
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find matching teacher account to get their email
    const matchingTeacher = users.find(u => 
      u.role === 'teacher' && 
      ((u.fullName || '').toLowerCase().replace(/\s+/g, '') === newClass.teacher.trim().toLowerCase().replace(/\s+/g, '') ||
       (u.username || '').toLowerCase().replace(/\s+/g, '') === newClass.teacher.trim().toLowerCase().replace(/\s+/g, ''))
    );

    addClass({ 
      ...newClass, 
      teacherEmail: matchingTeacher?.email || '',
      schedule: [], 
      announcements: [],
      schoolId: currentUser?.role === 'school' ? schoolId : 'school_default'
    });
    setNewClass({ name: '', teacher: '', studentsCount: 0, password: '', requireFaceId: false });
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !newTeacherUsername.trim() || !newTeacherPassword.trim()) {
      alert('Vui lòng nhập đầy đủ họ tên, tên đăng nhập và mật khẩu.');
      return;
    }

    const usernameNorm = newTeacherUsername.trim().toLowerCase();
    const duplicate = users.some(u => (u.username || '').toLowerCase() === usernameNorm);
    if (duplicate) {
      alert('Tên đăng nhập này đã tồn tại trong hệ thống.');
      return;
    }

    addUser({
      fullName: newTeacherName.trim(),
      username: usernameNorm,
      password: newTeacherPassword.trim(),
      email: newTeacherEmail.trim(),
      role: 'teacher',
      schoolId: currentUser?.role === 'school' ? schoolId : 'school_default'
    });

    alert('Khởi tạo tài khoản Giáo viên thành công!');
    setNewTeacherName('');
    setNewTeacherUsername('');
    setNewTeacherPassword('');
    setNewTeacherEmail('');
    setShowAddTeacherForm(false);
  };

  const downloadQR = (id: string, name: string) => {
    const canvas = document.getElementById(`qr-${id}`) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_${name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="space-y-8 pb-20 relative">
      <div className="absolute top-0 right-20 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-950 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-emerald-500/20 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="flex items-center gap-5 relative z-10">
           <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] border-2 border-emerald-400/20 relative group">
             <Radar className="w-8 h-8 relative z-10" />
           </div>
           <div>
             <h1 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight flex items-center gap-3">
               COMMAND <span className="text-emerald-400">CENTER</span>
               <span className="px-3 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs uppercase tracking-widest rounded-full animate-pulse flex items-center gap-1 hidden sm:flex"><ShieldAlert className="w-3 h-3" /> SECURITY L2</span>
             </h1>
             <p className="text-slate-400 text-sm md:text-base font-medium mt-1 flex items-center gap-2">
               <Terminal className="w-4 h-4 text-cyan-400" />
               Quản lý {currentUser?.role === 'school' ? `trường: ${currentUser.fullName}` : 'hệ thống mẫu'} / Giao thức kết nối phân quyền
             </p>
           </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 relative z-10 bg-white/60 p-2 rounded-2xl border border-white backdrop-blur-md w-fit shadow-lg">
        {/* Only global admin manages subject rooms */}
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'rooms' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 shadow-md shadow-emerald-500/10' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 border border-transparent'}`}
          >
            <Building2 className="w-4 h-4" /> Quản Trị Module
          </button>
        )}
        <button
           onClick={() => setActiveTab('classes')}
          className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'classes' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 shadow-md shadow-emerald-500/10' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 border border-transparent'}`}
        >
          <Users className={`w-4 h-4 ${activeTab === 'classes' ? 'text-emerald-500' : ''}`} /> Nút Không Gian Lớp
        </button>
        <button
           onClick={() => setActiveTab('roles')}
          className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'roles' ? 'bg-slate-900 border border-slate-700 text-cyan-400 shadow-xl shadow-slate-900/40' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 border border-transparent'}`}
        >
          <ShieldAlert className={`w-4 h-4 ${activeTab === 'roles' ? 'text-cyan-400' : ''}`} /> Giấy Phép Bảo Mật
        </button>
        <button
           onClick={() => setActiveTab('teachers')}
          className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'teachers' ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 shadow-md shadow-indigo-500/10' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 border border-transparent'}`}
        >
          <Fingerprint className={`w-4 h-4 ${activeTab === 'teachers' ? 'text-indigo-500' : ''}`} /> Bảo Mật GVCN
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/60 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-xl border border-white"
          >
            {activeTab === 'rooms' ? (
              <>
                <h2 className="text-xl font-display font-black text-slate-800 mb-6 flex items-center gap-3">
                   <div className="p-2 bg-emerald-500/10 rounded-xl"><Plus className="w-5 h-5 text-emerald-600" /></div>
                   Khởi tạo Module
                </h2>
                <form onSubmit={handleAddRoom} className="space-y-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Đinh danh Module</label>
                    <input
                      type="text"
                      required
                      value={newRoom.name || ''}
                      onChange={e => setNewRoom(r => ({ ...r, name: e.target.value }))}
                      className="w-full bg-white/80 border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-800 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
                      placeholder="Vd: TH Hóa Học Cấp 3"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Chi tiết hệ thống</label>
                    <textarea
                      required
                      rows={3}
                      value={newRoom.description || ''}
                      onChange={e => setNewRoom(r => ({ ...r, description: e.target.value }))}
                      className="w-full bg-white/80 border-2 border-slate-100 rounded-xl p-3 text-sm font-medium text-slate-800 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all resize-none placeholder:text-slate-400"
                      placeholder="Mô tả hạ tầng..."
                    />
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-4 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs hover:-translate-y-1 mt-6">
                    Build Module
                  </button>
                </form>
              </>
            ) : activeTab === 'classes' ? (
              <>
                <h2 className="text-xl font-display font-black text-slate-800 mb-6 flex items-center gap-3">
                   <div className="p-2 bg-emerald-500/10 rounded-xl"><Plus className="w-5 h-5 text-emerald-600" /></div>
                   Khởi tạo Nút Không Gian
                </h2>
                <form onSubmit={handleAddClass} className="space-y-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Mã định danh Lớp</label>
                    <input
                      type="text"
                      required
                      value={newClass.name || ''}
                      onChange={e => setNewClass(c => ({ ...c, name: e.target.value }))}
                      className="w-full bg-white/80 border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-800 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
                      placeholder="Vd: 7A2_Alpha"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Sĩ quan Chỉ huy (GVCN)</label>
                    <input
                      type="text"
                      required
                      value={newClass.teacher || ''}
                      onChange={e => setNewClass(c => ({ ...c, teacher: e.target.value }))}
                      className="w-full bg-white/80 border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-800 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
                      placeholder="Tên quản trị viên..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Dung lượng Tối đa</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newClass.studentsCount || ''}
                      onChange={e => setNewClass(c => ({ ...c, studentsCount: parseInt(e.target.value) || 0 }))}
                       className="w-full bg-white/80 border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-800 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
                      placeholder="Vd: 35"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Mã khóa Không Gian</label>
                    <input
                      type="password"
                      value={newClass.password || ''}
                      onChange={e => setNewClass(c => ({ ...c, password: e.target.value }))}
                      className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-sm font-bold text-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-600"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex items-center gap-3 bg-emerald-50 p-3 flex border border-emerald-100 rounded-xl">
                    <input
                      type="checkbox"
                      id="requireFaceId"
                      checked={newClass.requireFaceId || false}
                      onChange={e => setNewClass(c => ({ ...c, requireFaceId: e.target.checked }))}
                      className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="requireFaceId" className="text-sm font-bold text-emerald-900 cursor-pointer select-none">Bắt buộc Xác Thực Sinh Trắc Học</label>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 hover:bg-black text-emerald-400 font-black py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs hover:-translate-y-1 mt-6">
                     Khởi động Nút Mạng
                  </button>
                </form>
              </>
            ) : activeTab === 'roles' ? (
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 text-center">
                   <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                   <h3 className="font-bold text-slate-800 mb-2">Chế Độ Quản Trị Đặc Quyền</h3>
                   <p className="text-sm text-slate-600">Thay đổi vai trò trực tiếp trên danh sách tài khoản, hoặc khởi tạo thêm tài khoản giáo viên mới.</p>
                </div>
            ) : (
                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-center">
                   <Fingerprint className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                   <h3 className="font-bold text-slate-800 mb-2">Trung Tâm Sinh Trắc Học</h3>
                   <p className="text-sm text-slate-600">Quản lý và thiết lập lại dữ liệu khuôn mặt của giáo viên chủ nhiệm.</p>
                </div>
            )}
          </motion.div>
        </div>

        <div className="lg:col-span-8">
          {activeTab === 'roles' ? (
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden relative"
            >
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]"></div>

               <div className="p-8 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 bg-slate-900/50">
                 <h2 className="text-2xl font-display font-black text-white flex items-center gap-3">
                   <Fingerprint className="w-6 h-6 text-emerald-400" /> Bản Ghi Tài Khoản ({filteredUsers.length})
                 </h2>
                 <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                   <button
                     onClick={() => setShowAddTeacherForm(true)}
                     className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-1.5"
                   >
                     + Thêm Giáo viên
                   </button>
                   <div className="relative w-full sm:w-60">
                     <input 
                       type="text" 
                       placeholder="Quét mã danh tính..." 
                       value={searchQuery}
                       onChange={e => setSearchQuery(e.target.value)}
                       className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-emerald-500/30 rounded-xl text-sm font-bold text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-emerald-900/50"
                     />
                     <Search className="w-5 h-5 text-emerald-500 absolute left-4 top-1/2 -translate-y-1/2" />
                   </div>
                 </div>
               </div>
               
              <div className="overflow-x-auto relative z-10 p-2 sm:p-4">
                <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                  <thead>
                    <tr>
                      <th className="p-3 font-black text-slate-500 uppercase tracking-widest text-xs">Entity</th>
                      <th className="p-3 font-black text-slate-500 uppercase tracking-widest text-xs w-56">Cấp Quyền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredUsers
                        .filter(u => {
                          const query = searchQuery || '';
                          const name = u.fullName || '';
                          const email = u.email || '';
                          const uname = u.username || '';
                          return name.toLowerCase().includes(query.toLowerCase()) || 
                                 email.toLowerCase().includes(query.toLowerCase()) || 
                                 uname.toLowerCase().includes(query.toLowerCase());
                        })
                        .map((u, index) => (
                        <motion.tr 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          key={`${u.id}_${index}`} 
                          className="bg-slate-800/40 hover:bg-slate-800 transition-colors group"
                        >
                          <td className="p-4 rounded-l-2xl border-y border-l border-white/5 group-hover:border-white/10 transition-colors">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-300 font-bold uppercase overflow-hidden shrink-0">
                                  {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" /> : (u.fullName || 'U').charAt(0)}
                                </div>
                                <div>
                                  <p className="font-black text-white text-base">{u.fullName}</p>
                                  <p className="text-slate-400 text-xs mt-0.5">{u.email || u.username}</p>
                                </div>
                             </div>
                          </td>
                          <td className="p-4 rounded-r-2xl border-y border-r border-white/5 group-hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <select 
                                  value={u.role || 'student'}
                                  onChange={(e) => updateUserRole(u.id, e.target.value)}
                                  className={`w-full appearance-none border-2 rounded-xl px-4 py-2.5 font-bold text-xs uppercase tracking-wider outline-none transition-all cursor-pointer ${
                                    u.role === 'admin' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 focus:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                                    u.role === 'school' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 focus:border-indigo-500' :
                                    u.role === 'teacher' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 focus:border-cyan-500' :
                                    u.role === 'technician' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 focus:border-amber-500' :
                                    u.role === 'parent' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 focus:border-purple-500' :
                                    'bg-slate-700/50 border-slate-600 text-slate-300 focus:border-slate-500'
                                  }`}
                                >
                                  <option value="admin" className="bg-slate-900 text-emerald-400">ROOT_ADMIN [L2]</option>
                                  <option value="school" className="bg-slate-900 text-indigo-400">SCHOOL_ADMIN</option>
                                  <option value="student" className="bg-slate-900 text-slate-300">USER_STUDENT</option>
                                  <option value="technician" className="bg-slate-900 text-amber-400">MAINTAINER (Kỹ thuật)</option>
                                  <option value="teacher" className="bg-slate-900 text-cyan-400">COMMANDER (Giáo viên)</option>
                                  <option value="parent" className="bg-slate-900 text-purple-400">PARENT (Phụ huynh)</option>
                                </select>
                                <Lock className={`w-3.5 h-3.5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                                   u.role === 'admin' ? 'text-emerald-400/50' :
                                   u.role === 'school' ? 'text-indigo-400/50' :
                                   u.role === 'teacher' ? 'text-cyan-400/50' :
                                   u.role === 'technician' ? 'text-amber-400/50' :
                                   u.role === 'parent' ? 'text-purple-400/50' :
                                   'text-slate-500'
                                }`}/>
                              </div>
                              {u.id !== currentUser?.id && (
                                <button 
                                  onClick={() => { if(window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) deleteUser(u.id); }}
                                  className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors border border-red-500/20 shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}</AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : activeTab === 'teachers' ? (
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white/60 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-xl border border-white"
             >
               <h2 className="text-xl font-display font-black text-slate-800 mb-6 flex items-center gap-3">
                 <div className="p-2 bg-indigo-100 rounded-xl"><Fingerprint className="w-5 h-5 text-indigo-600" /></div>
                 Lưu Trữ Không Gian Hình Ảnh GVCN
               </h2>

               <div className="space-y-4">
                 <AnimatePresence>
                   {filteredClasses.map((cls, idx) => (
                     <motion.div 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: idx * 0.05 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         key={cls.id} 
                         className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-5 relative group hover:shadow-lg transition-all"
                      >
                       <div className="flex-1 w-full sm:w-auto">
                          <div className="flex items-center gap-3 mb-1">
                             <h3 className="font-black text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">{cls.name}</h3>
                             <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded">SYS: {cls.id.slice(-4)}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm font-medium mt-2">
                             <span className="bg-cyan-50 text-cyan-600 px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold">
                                Sĩ Quan Chủ Nhiệm: {cls.teacher}
                             </span>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-4 shrink-0">
                         {cls.teacherFaceImage ? (
                           <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 font-bold text-sm">
                             <div className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden shrink-0">
                               <img src={cls.teacherFaceImage} alt={cls.teacher} className="w-full h-full object-cover" />
                             </div>
                             ĐÃ KHÓA SINH TRẮC L1
                             <button
                               onClick={() => updateClass(cls.id, { teacherFaceImage: null as any, faceIdData: [] })}
                               className="ml-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg p-1.5 shadow-md shadow-rose-500/20 transition-all font-bold text-xs uppercase"
                               aria-label="Xóa hồ sơ khuôn mặt"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                         ) : (
                           <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-3 rounded-xl border border-amber-100 font-bold text-sm">
                             <ShieldAlert className="w-5 h-5 text-amber-500" />
                             VÔ HIỆU / TRỐNG BẢN GHI
                           </div>
                         )}
                       </div>
                     </motion.div>
                   ))}
                 </AnimatePresence>
                 {filteredClasses.length === 0 && (
                   <div className="text-center py-12 text-slate-500 font-bold border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">Không có dữ liệu lớp học</div>
                 )}
               </div>
             </motion.div>
          ) : (
             <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/60 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-xl border border-white"
             >
               <h2 className="text-xl font-display font-black text-slate-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-xl"><Hexagon className="w-5 h-5 text-slate-600" /></div>
                  Archive {activeTab === 'rooms' ? 'Module Giảng Dạy' : 'Nút Lớp Học'} ({activeTab === 'rooms' ? rooms.length : filteredClasses.length})
               </h2>
               
               {(activeTab === 'rooms' && rooms.length === 0) || (activeTab === 'classes' && filteredClasses.length === 0) ? (
                 <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                    <Hexagon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">Chưa có dữ liệu hệ thống.</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                   <AnimatePresence>
                   {(activeTab === 'rooms' ? rooms : filteredClasses).map((item, idx) => {
                     const qrUrl = activeTab === 'rooms' ? `https://smartschool.app/room/${item.id}` : `https://smartschool.app/class/${item.id}`;
                     
                     return (
                       <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={item.id} 
                          className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-5 relative group hover:shadow-lg transition-all"
                       >
                         <div className="flex-1 w-full sm:w-auto">
                            <div className="flex items-center gap-3 mb-1">
                               <h3 className="font-black text-lg text-slate-800 group-hover:text-emerald-600 transition-colors">{item.name}</h3>
                               <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded">SYS: {item.id.slice(-4)}</span>
                            </div>
                           {activeTab === 'rooms' ? (
                             <p className="text-sm font-medium text-slate-500 line-clamp-2">{(item as any).description}</p>
                           ) : (
                             <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
                                <span className="bg-cyan-50 text-cyan-600 px-2.5 py-1 rounded-lg">GVCN: {(item as any).teacher}</span>
                                <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg">Sĩ số: {(item as any).studentsCount}</span>
                                {(item as any).requireFaceId && <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-lg flex items-center gap-1"><Fingerprint className="w-3 h-3"/> Xác Thực L2</span>}
                             </div>
                           )}
                         </div>
                         <div className="flex flex-col items-center shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                           <div className="p-2 bg-slate-50 border-2 border-slate-200 rounded-[1.2rem] relative group border-dashed hover:border-indigo-400 transition-colors">
                              <QRCodeCanvas id={`qr-${item.id}`} value={qrUrl} size={80} className="rounded-lg mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity" />
                              
                              <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[1.1rem]">
                                 <button 
                                   onClick={() => downloadQR(item.id, item.name)}
                                   className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:bg-emerald-600 hover:scale-110 transition-all"
                                   title="Trích Xuất Mã QR"
                                 >
                                   <Download className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                         </div>
                         <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0 shrink-0">
                           <button
                             onClick={() => activeTab === 'rooms' ? deleteRoom(item.id) : deleteClass(item.id)}
                             className="flex-1 sm:flex-none p-3 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-100 rounded-xl transition-colors flex items-center justify-center w-12 h-12"
                             title="Xóa Bản Ghi"
                           >
                             <Trash2 className="w-5 h-5" />
                           </button>
                         </div>
                       </motion.div>
                     );
                   })}
                   </AnimatePresence>
                 </div>
               )}
             </motion.div>
          )}
        </div>
      </div>

      {/* CREATE TEACHER ACCOUNT MODAL FORM */}
      <AnimatePresence>
        {showAddTeacherForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative text-white"
            >
              <button
                onClick={() => setShowAddTeacherForm(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="bg-indigo-600 p-6 text-center">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold font-display">Tạo tài khoản Giáo viên</h3>
                <p className="text-indigo-200 text-xs mt-1">
                  Cấp thông tin xác thực cho giáo viên của trường
                </p>
              </div>

              <form onSubmit={handleCreateTeacher} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Họ và tên giáo viên *</label>
                  <input
                    type="text"
                    required
                    value={newTeacherName}
                    onChange={e => setNewTeacherName(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm font-bold text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="Vd: Cô Nguyễn Thị Hương"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Địa chỉ Email (Nếu có)</label>
                  <input
                    type="email"
                    value={newTeacherEmail}
                    onChange={e => setNewTeacherEmail(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm font-bold text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="example@school.edu.vn"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/50">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Tên đăng nhập *</label>
                    <input
                      type="text"
                      required
                      value={newTeacherUsername}
                      onChange={e => setNewTeacherUsername(e.target.value)}
                      className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm font-bold text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                      placeholder="thanh_gv"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Mật khẩu khởi tạo *</label>
                    <input
                      type="password"
                      required
                      value={newTeacherPassword}
                      onChange={e => setNewTeacherPassword(e.target.value)}
                      className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm font-bold text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-black py-3.5 px-4 rounded-xl mt-4 transition-colors shadow-lg shadow-indigo-500/20 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> Khởi tạo Giáo viên
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
