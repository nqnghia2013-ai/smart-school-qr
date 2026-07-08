import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Building2, Plus, Trash2, ShieldAlert, MapPin, Database, Users, GraduationCap, Key, Info, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SchoolManagement() {
  const { currentUser, users, classes, students, addUser, deleteUser, updateUser, showToast } = useAppContext();
  
  // Form states
  const [schoolName, setSchoolName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  // 1. Guard for Technician only
  if (currentUser?.role !== 'technician') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShieldAlert className="w-20 h-20 text-rose-500 mb-6" />
        <h1 className="text-3xl font-display font-black text-slate-800 dark:text-white mb-2">Truy Cập Bị Từ Chối</h1>
        <p className="text-slate-500 dark:text-slate-400">Bạn không có quyền truy cập vào phân hệ quản lý hệ thống của Kỹ thuật viên.</p>
      </div>
    );
  }

  // List of registered schools
  const schoolAccounts = users.filter(u => u.role === 'school');

  // Handle adding new school account
  const handleAddSchool = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolName.trim() || !username.trim() || !password.trim()) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc.', 'error');
      return;
    }

    const normalizedUsername = username.trim().toLowerCase();

    // Check duplicate username
    const duplicate = users.some(u => (u.username || '').toLowerCase() === normalizedUsername || (u.email || '').toLowerCase() === normalizedUsername);
    if (duplicate) {
      showToast('Tên đăng nhập đã được sử dụng bởi một tài khoản khác trong hệ thống.', 'error');
      return;
    }

    if (!region.trim()) {
      showToast('Vui lòng nhập khu vực cụ thể.', 'error');
      return;
    }

    const schoolUserObj = {
      username: normalizedUsername,
      password: password.trim(),
      fullName: schoolName.trim(),
      region: region.trim(),
      role: 'school' as const
    };

    // 1. Create school user
    const generatedId = addUser(schoolUserObj);
    
    // 2. Set self-referential schoolId on the school account
    updateUser(generatedId, { schoolId: generatedId });

    showToast(`Khởi tạo tài khoản trường học "${schoolName}" thành công!`, 'success');
    
    // Reset form
    setSchoolName('');
    setUsername('');
    setPassword('');
    setRegion('');
  };

  return (
    <div className="space-y-8 pb-20 relative text-slate-800 dark:text-white">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Page Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] border border-indigo-400/20">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight flex items-center gap-3">
              QUẢN LÝ <span className="text-indigo-400">TRƯỜNG HỌC</span>
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest rounded-full">LEVEL 3</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              Phân hệ thiết lập mạng lưới tài khoản & cấu trúc đơn vị học đường địa phương
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {[
          { label: 'Số lượng Trường', count: schoolAccounts.length, icon: Building2, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Số lớp học', count: classes.length, icon: Database, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Giáo viên toàn hệ thống', count: users.filter(u => u.role === 'teacher').length, icon: Users, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
          { label: 'Học sinh đăng ký', count: students.length, icon: GraduationCap, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white/60 dark:bg-[#12161F]/60 backdrop-blur-md p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-black font-display text-slate-900 dark:text-white mt-1">{stat.count}</h3>
            </div>
            <div className={`p-4 rounded-2xl ${stat.color} border flex items-center justify-center shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Form Create School (Left Side) */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-[#131612] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl space-y-6"
          >
            <h2 className="text-xl font-display font-black flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600"><Plus className="w-5 h-5" /></div>
              Khởi tạo Tài khoản Trường
            </h2>

            <form onSubmit={handleAddSchool} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Tên trường học *</label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Vd: Trường THCS Quảng Phú Cầu"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Khu vực (Tỉnh / Thành phố) *</label>
                <input
                  type="text"
                  required
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Vd: TP. Hà Nội, Tỉnh Phú Thọ..."
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/5 my-2"></div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Tên đăng nhập cấp mới *</label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 pl-10 text-sm font-bold focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="Vd: thcs_quangphucau"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Mật khẩu khởi tạo *</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 pl-10 text-sm font-bold focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-4 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs hover:-translate-y-0.5 mt-6"
              >
                Cấp tài khoản Trường
              </button>
            </form>
          </motion.div>
        </div>

        {/* List Schools (Right Side) */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-[#131612] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl space-y-6"
          >
            <h2 className="text-xl font-display font-black flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600"><Building2 className="w-5 h-5" /></div>
              Hạ tầng các Trường đang kết nối ({schoolAccounts.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase tracking-wider text-xs">
                    <th className="pb-2">Trường học</th>
                    <th className="pb-2">Khu vực</th>
                    <th className="pb-2 text-right">Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {schoolAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-8 text-slate-500 font-medium">
                          Chưa có tài khoản trường học nào được tạo.
                        </td>
                      </tr>
                    ) : (
                      schoolAccounts.map((school, index) => (
                        <React.Fragment key={school.id}>
                          <motion.tr
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-slate-50 dark:bg-white/5 hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors cursor-pointer animate-fade-in"
                            onClick={() => setSelectedSchoolId(selectedSchoolId === school.id ? null : school.id)}
                          >
                            <td className="p-4 rounded-l-2xl border-y border-l border-slate-200/50 dark:border-white/5">
                              <div>
                                <p className="font-black text-slate-900 dark:text-white text-base">{school.fullName}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 flex items-center gap-1.5 font-bold">
                                  <Key className="w-3 h-3 text-indigo-500" /> Account: {school.username}
                                </p>
                              </div>
                            </td>
                            <td className="p-4 border-y border-slate-200/50 dark:border-white/5">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">
                                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                {school.region?.split(',')[0] || 'Chưa định cấu hình'}
                              </span>
                            </td>
                            <td className="p-4 rounded-r-2xl border-y border-r border-slate-200/50 dark:border-white/5 text-right" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản trường "${school.fullName}"? Toàn bộ phiên làm việc của trường sẽ bị hủy.`)) {
                                    deleteUser(school.id);
                                    showToast('Đã xóa tài khoản trường học.', 'success');
                                  }
                                }}
                                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors border border-red-500/10"
                                title="Xóa trường"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </td>
                          </motion.tr>
                          {selectedSchoolId === school.id && (
                            <motion.tr
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-transparent"
                            >
                              <td colSpan={3} className="p-2 pt-0">
                                <div className="bg-slate-100/50 dark:bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 grid grid-cols-3 gap-4 text-center shadow-inner mt-1">
                                  <div className="bg-white/80 dark:bg-[#151D30]/60 p-3.5 rounded-xl border border-slate-200/40 dark:border-white/5 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Giáo viên</p>
                                    <p className="text-xl md:text-2xl font-black text-indigo-500 mt-1">
                                      {users.filter(u => u.role === 'teacher' && u.schoolId === school.id).length}
                                    </p>
                                  </div>
                                  <div className="bg-white/80 dark:bg-[#151D30]/60 p-3.5 rounded-xl border border-slate-200/40 dark:border-white/5 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Học sinh</p>
                                    <p className="text-xl md:text-2xl font-black text-emerald-500 mt-1">
                                      {students.filter(s => s.schoolId === school.id).length}
                                    </p>
                                  </div>
                                  <div className="bg-white/80 dark:bg-[#151D30]/60 p-3.5 rounded-xl border border-slate-200/40 dark:border-white/5 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phụ huynh</p>
                                    <p className="text-xl md:text-2xl font-black text-purple-500 mt-1">
                                      {users.filter(u => u.role === 'parent' && u.schoolId === school.id).length}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Information Tip Banner */}
      <div className="bg-[#121722] border border-slate-800 p-5 rounded-3xl relative z-10 flex gap-4 text-xs font-bold leading-relaxed text-slate-400">
        <Info className="w-6 h-6 text-indigo-400 shrink-0" />
        <div>
          <span className="text-white block font-black uppercase mb-1 tracking-widest text-[10px]">Cơ chế quản lý cấu trúc:</span>
          Nhà trường sau khi nhận tài khoản sẽ quản lý độc lập các dữ liệu giáo viên chủ nhiệm, học sinh và hệ thống lớp học của chính mình. Kỹ thuật viên giữ vai trò cao nhất phục vụ cài đặt kết nối và điều phối cơ sở dữ liệu chung của toàn mạng lưới học vụ.
        </div>
      </div>
    </div>
  );
}
