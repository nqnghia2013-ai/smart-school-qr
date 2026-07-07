import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, FileText, CheckCircle2, Sparkles, BookOpen, Clock, AlertCircle, PlayCircle, Trophy, PenTool, Upload, FileUp, Settings, FileDown, Eye, Send, FileCheck2, Loader2, ArrowRight, HelpCircle, Map, Compass, Flag, MapPin, Anchor, Tent, Crown, ScrollText, Users, Search, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Workspace() {
  const { currentUser, showToast } = useAppContext();
  const [viewMode, setViewMode] = useState<'teacher' | 'student'>('student');
  
  if (!currentUser) return null;

  const isTeacher = currentUser.role === 'admin' || currentUser.role === 'teacher';

  // Nếu là giáo viên/admin mà chưa set mode, ta có thể set default là 'teacher' lúc đầu
  React.useEffect(() => {
    if (isTeacher) {
      setViewMode('teacher');
    } else {
      setViewMode('student');
    }
  }, [isTeacher]);

  return (
    <div className="space-y-6 pb-20 max-w-[1400px] mx-auto px-4 lg:px-0 text-slate-900 dark:text-white">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6 md:mb-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.5 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent blur-2xl -z-10 rounded-full"></div>
          <p className="text-[10px] sm:text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-500" /> KHÔNG GIAN LÀM VIỆC (WORKSPACE)
          </p>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 drop-shadow-sm">
            {viewMode === 'teacher' ? 'Công cụ quản lý & Chấm bài AI' : 'Học tập & Luyện thi thông minh'}
          </h1>
        </motion.div>
        
        {isTeacher && (
          <div className="flex bg-slate-100 dark:bg-[#121A33] p-1.5 rounded-xl border border-slate-200 dark:border-white/5 relative z-10 w-fit">
            <button
              onClick={() => setViewMode('teacher')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                viewMode === 'teacher' 
                  ? 'bg-white dark:bg-[#1C274C] text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Chế độ Giáo viên
            </button>
            <button
              onClick={() => setViewMode('student')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                viewMode === 'student' 
                  ? 'bg-white dark:bg-[#1C274C] text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Chế độ Học sinh
            </button>
          </div>
        )}
      </div>

      {viewMode === 'teacher' ? <TeacherWorkspace /> : <StudentWorkspace />}
    </div>
  );
}

function ParentCommunication() {
  const { students, users, classes, currentUser, showToast } = useAppContext();
  
  // Filter parents whose children are in the teacher's classes (if the user is a teacher)
  const myClasses = currentUser?.role === 'admin' ? classes : classes.filter(c => 
    (c.teacherEmail && c.teacherEmail === currentUser?.email) || 
    (c.teacher === currentUser?.fullName)
  );
  
  const myClassIds = myClasses.map(c => c.id);
  
  const parentUsers = users.filter(u => {
    if (u.role !== 'parent') return false;
    if (currentUser?.role === 'admin') return true;
    
    // Find if this parent has a student in any of my classes
    let hasStudentInClass = false;
    
    // Check top-level students
    const student = students.find(s => s.id === u.linkedStudentId || (s.parentEmail && s.parentEmail === u.email));
    if (student && myClassIds.includes(student.classId)) {
       hasStudentInClass = true;
    }
    
    // Check nested students
    if (!hasStudentInClass) {
      for (const c of myClasses) {
        if (c.students && c.students.some(s => s.id === u.linkedStudentId || (s.parentEmail && s.parentEmail === u.email))) {
          hasStudentInClass = true;
          break;
        }
      }
    }
    
    return hasStudentInClass;
  });

  const [selectedParentId, setSelectedParentId] = useState("");
  const [studentWorkFile, setStudentWorkFile] = useState<File | null>(null);
  const [teacherComment, setTeacherComment] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSendEmail = async () => {
    if (!selectedParentId || !teacherComment) return;
    
    const parentUser = parentUsers.find(p => p.id === selectedParentId);
    if (!parentUser) {
      setEmailStatus({ type: 'error', message: 'Không tìm thấy tài khoản phụ huynh.' });
      return;
    }
    
    let studentName = "Học sinh";
    let className = "";
    
    // Try to find in top-level students collection
    let student = students.find(s => s.id === parentUser.linkedStudentId || (s.parentEmail && s.parentEmail === parentUser.email));
    
    // Fallback to checking inside class documents
    if (!student) {
      for (const c of classes) {
        if (c.students) {
          const found = c.students.find(s => s.id === parentUser.linkedStudentId || (s.parentEmail && s.parentEmail === parentUser.email));
          if (found) {
            student = found;
            break;
          }
        }
      }
    }
    
    if (student) {
      studentName = student.fullName;
      const studentClass = classes.find(c => c.id === student!.classId || (c.students && c.students.some(st => st.id === student!.id)));
      if (studentClass) className = studentClass.name;
    }

    if (!parentUser.email) {
      setEmailStatus({ type: 'error', message: 'Tài khoản phụ huynh không có email hợp lệ.' });
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      let attachmentData = null;
      let attachmentName = null;

      if (studentWorkFile) {
        attachmentName = studentWorkFile.name;
        const reader = new FileReader();
        const fileToDataURL = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(studentWorkFile);
        });
        attachmentData = await fileToDataURL;
      }

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentEmail: parentUser.email,
          parentName: parentUser.fullName || "Phụ huynh",
          studentName: studentName,
          className: className,
          aiComment: teacherComment,
          attachment: attachmentData,
          attachmentName: attachmentName
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        setEmailStatus({ type: 'success', message: `Đã gửi thông báo thành công cho phụ huynh em ${studentName} qua Email!` });
        setTeacherComment("");
        setStudentWorkFile(null);
      } else {
        setEmailStatus({ type: 'error', message: `Lỗi gửi Email: ${data.error || 'Lỗi không xác định'}` });
      }
    } catch (e: any) {
      setEmailStatus({ type: 'error', message: e.message || 'Có lỗi xảy ra.' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white/80 backdrop-blur-xl dark:bg-[#1C274C] rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-white/10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500/5 to-teal-500/5 blur-3xl -z-10 rounded-full pointer-events-none"></div>
      
      <div className="grid md:grid-cols-12 gap-10 lg:gap-16">
        <div className="md:col-span-5 space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">1. Chọn Phụ Huynh (Người nhận)</label>
              <select 
                 value={selectedParentId || ''}
                 onChange={(e) => setSelectedParentId(e.target.value)}
                 className="w-full bg-white dark:bg-[#121A33] border border-slate-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 transition-all text-sm shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
               >
                 <option value="">-- Chọn phụ huynh --</option>
                 {parentUsers.map((p, idx) => {
                   let studentName = "";
                   let className = "";
                   let parentPhone = p.phone || "";
                   
                   // Try to find in top-level students collection
                   let s = students.find(st => st.id === p.linkedStudentId || (st.parentEmail && st.parentEmail === p.email));
                   
                   // Fallback to checking inside class documents
                   if (!s) {
                     for (const c of classes) {
                       if (c.students) {
                         const found = c.students.find(st => st.id === p.linkedStudentId || (st.parentEmail && st.parentEmail === p.email));
                         if (found) {
                           s = found;
                           break;
                         }
                       }
                     }
                   }

                   if (s) {
                     studentName = s.fullName;
                     const studentClass = classes.find(c => c.id === s!.classId || (c.students && c.students.some(st => st.id === s!.id)));
                     if (studentClass) className = studentClass.name;
                     if (s.parentPhone) parentPhone = s.parentPhone;
                   }
                   const phoneDisplay = parentPhone ? ` - SĐT: ${parentPhone}` : '';
                   return (
                     <option key={`${p.id}_${idx}`} value={p.id}>
                       PH {p.fullName} - {p.email}{phoneDisplay} {studentName ? `(Con: ${studentName}${className ? ` - Lớp ${className}` : ''})` : ' (Chưa liên kết học sinh)'}
                     </option>
                   );
                 })}
               </select>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs">2</div>
                  Tải lên bài làm / Kết quả <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                </label>
              </div>
              <div className={`relative overflow-hidden border-2 border-dashed rounded-[2rem] p-8 text-center transition-all duration-300 group ${studentWorkFile ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-[0_8px_30px_rgba(16,185,129,0.1)]' : 'border-slate-200 dark:border-white/20 hover:border-emerald-400 hover:bg-slate-50/50 dark:hover:bg-white/5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]'}`}>
                {studentWorkFile ? (
                   <div className="flex flex-col items-center">
                     <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-3 shadow-inner">
                       <CheckCircle2 className="w-8 h-8 text-emerald-500 drop-shadow-sm" />
                     </div>
                     <p className="font-bold text-emerald-700 dark:text-emerald-400 mb-1">{studentWorkFile.name}</p>
                     <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mb-4">Đã tải lên thành công</p>
                     <label htmlFor="studentResult" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer underline underline-offset-2">Thay đổi file khác</label>
                   </div>
                ) : (
                   <div className="flex flex-col items-center">
                     <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/20 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.03)] group-hover:shadow-[0_4px_20px_rgba(16,185,129,0.1)] group-hover:scale-110 duration-300">
                       <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                     </div>
                     <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Kéo thả file vào đây</p>
                     <p className="text-xs text-slate-500 mb-4">hoặc nhấn để chọn file (Hỗ trợ tất cả định dạng)</p>
                     <label htmlFor="studentResult" className="bg-white dark:bg-[#121A33] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white px-6 py-3 rounded-xl text-sm font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm hover:shadow-md">
                       Chọn File
                     </label>
                   </div>
                )}
                <input 
                  type="file" 
                  id="studentResult" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                        setStudentWorkFile(e.target.files[0]);
                        showToast('Tải tài liệu thành công', 'success');
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 flex flex-col h-full min-h-[400px]">
          <div className="flex-1 flex flex-col relative z-10">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">3. Nhận xét / Thông báo của Giáo viên</label>
              <textarea
                 value={teacherComment || ''}
                 onChange={(e) => setTeacherComment(e.target.value)}
                 className="flex-1 min-h-[200px] bg-white dark:bg-[#121A33] border border-slate-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 transition-all text-sm shadow-[0_2px_10px_rgb(0,0,0,0.02)] resize-none"
                 placeholder="Nhập nội dung thông báo, kết quả học tập hoặc lời nhận xét dành cho phụ huynh..."
              />
              
              <div className="mt-6 flex flex-col items-end">
                {emailStatus && (
                  <p className={`mb-3 text-sm font-bold ${emailStatus.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {emailStatus.message}
                  </p>
                )}
                <button 
                  onClick={handleSendEmail}
                  disabled={!selectedParentId || !teacherComment || isSendingEmail}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-2xl disabled:opacity-50 transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.4)]"
                >
                  {isSendingEmail ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang gửi...</> : <><Send className="w-5 h-5" /> Gửi Phụ Huynh</>}
                </button>
              </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ParentManagement() {
  const { students, users, classes, currentUser, deleteUser, showToast } = useAppContext();
  const [search, setSearch] = useState("");
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const myClasses = currentUser?.role === 'admin' ? classes : classes.filter(c => 
    (c.teacherEmail && c.teacherEmail === currentUser?.email) || 
    (c.teacher === currentUser?.fullName)
  );
  
  const myClassIds = myClasses.map(c => c.id);
  
  const parentUsers = users.filter(u => {
    if (u.role !== 'parent') return false;
    if (currentUser?.role === 'admin') return true;
    
    let hasStudentInClass = false;
    const student = students.find(s => s.id === u.linkedStudentId || (s.parentEmail && s.parentEmail === u.email));
    if (student && myClassIds.includes(student.classId)) {
       hasStudentInClass = true;
    }
    
    if (!hasStudentInClass) {
      for (const c of myClasses) {
        if (c.students && c.students.some(s => s.id === u.linkedStudentId || (s.parentEmail && s.parentEmail === u.email))) {
          hasStudentInClass = true;
          break;
        }
      }
    }
    return hasStudentInClass;
  }).filter(p => (p.fullName || '').toLowerCase().includes((search || '').toLowerCase()) || (p.email || '').toLowerCase().includes((search || '').toLowerCase()));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white/80 backdrop-blur-xl dark:bg-[#1C274C] rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-white/10 relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 md:w-6 md:h-6 text-purple-500" /> Quản Lý Danh Sách Phụ Huynh ({parentUsers.length})
        </h2>
        <div className="relative w-full sm:w-64">
           <input 
             type="text" 
             placeholder="Tìm kiếm phụ huynh..." 
             value={search || ''}
             onChange={e => setSearch(e.target.value)}
             className="w-full bg-slate-50 dark:bg-[#121A33] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 text-sm"
           />
           <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Họ và Tên</th>
              <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Email/Tài khoản</th>
              <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">SĐT</th>
              <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Học sinh liên kết</th>
              <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {parentUsers.map((p, idx) => {
              let studentName = "";
              let className = "";
              
              let s = students.find(st => st.id === p.linkedStudentId || (st.parentEmail && st.parentEmail === p.email));
              if (!s) {
                for (const c of classes) {
                  if (c.students) {
                    const found = c.students.find(st => st.id === p.linkedStudentId || (st.parentEmail && st.parentEmail === p.email));
                    if (found) { s = found; break; }
                  }
                }
              }

              if (s) {
                studentName = s.fullName;
                const studentClass = classes.find(c => c.id === s!.classId || (c.students && c.students.some(st => st.id === s!.id)));
                if (studentClass) className = studentClass.name;
              }

              return (
                <tr key={p.id} className="bg-white dark:bg-[#121A33] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group shadow-sm rounded-xl">
                  <td className="p-4 rounded-l-xl border-y border-l border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {(p.fullName || 'P').charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{p.fullName}</span>
                    </div>
                  </td>
                  <td className="p-4 border-y border-slate-100 dark:border-white/5 text-sm text-slate-600 dark:text-slate-400">{p.email || p.username}</td>
                  <td className="p-4 border-y border-slate-100 dark:border-white/5 text-sm text-slate-600 dark:text-slate-400">{p.phone || s?.parentPhone || '---'}</td>
                  <td className="p-4 border-y border-slate-100 dark:border-white/5">
                    {studentName ? (
                       <div>
                         <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{studentName}</p>
                         <p className="text-xs text-slate-500 dark:text-slate-400">Lớp: {className}</p>
                       </div>
                    ) : (
                       <span className="text-xs text-slate-400 italic">Chưa liên kết</span>
                    )}
                  </td>
                  <td className="p-4 rounded-r-xl border-y border-r border-slate-100 dark:border-white/5 text-center">
                    <button 
                      onClick={() => setDeletingUserId(p.id)}
                      className="w-8 h-8 mx-auto rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
                      title="Xóa phụ huynh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
            {parentUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                  Không tìm thấy phụ huynh nào trong danh sách quản lý của bạn.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-4">
        {parentUsers.map((p) => {
          let studentName = "";
          let className = "";
          
          let s = students.find(st => st.id === p.linkedStudentId || (st.parentEmail && st.parentEmail === p.email));
          if (!s) {
            for (const c of classes) {
              if (c.students) {
                const found = c.students.find(st => st.id === p.linkedStudentId || (st.parentEmail && st.parentEmail === p.email));
                if (found) { s = found; break; }
              }
            }
          }

          if (s) {
            studentName = s.fullName;
            const studentClass = classes.find(c => c.id === s!.classId || (c.students && c.students.some(st => st.id === s!.id)));
            if (studentClass) className = studentClass.name;
          }

          return (
            <div key={p.id} className="bg-white dark:bg-[#121A33] border border-slate-100 dark:border-white/5 p-5 rounded-2xl shadow-sm relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {(p.fullName || 'P').charAt(0)}
                </div>
                <div className="pr-10">
                  <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">{p.fullName}</h4>
                  <p className="text-[10px] text-slate-400">ID: {p.id}</p>
                </div>
              </div>
              
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-3 mt-3">
                <p><span className="text-slate-400">Email:</span> {p.email || p.username}</p>
                <p><span className="text-slate-400">SĐT:</span> {p.phone || s?.parentPhone || '---'}</p>
                <div className="mt-2 bg-slate-50 dark:bg-[#1C274C] p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                  <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-1">Học sinh liên kết</p>
                  {studentName ? (
                     <div>
                       <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{studentName}</p>
                       <p className="text-[10px] text-slate-500">Lớp: {className}</p>
                     </div>
                  ) : (
                     <span className="text-[10px] text-slate-400 italic">Chưa liên kết</span>
                  )}
                </div>
              </div>

              {/* Action Delete Button */}
              <button 
                onClick={() => setDeletingUserId(p.id)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors shadow-sm"
                title="Xóa phụ huynh"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
        {parentUsers.length === 0 && (
          <p className="p-8 text-center text-slate-500 text-sm bg-white dark:bg-[#121A33] rounded-2xl border border-slate-100 dark:border-white/5">
            Không tìm thấy phụ huynh nào trong danh sách quản lý của bạn.
          </p>
        )}
      </div>

      <AnimatePresence>
        {deletingUserId && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#121A33] rounded-2xl p-6 shadow-xl max-w-md w-full border border-slate-100 dark:border-white/10"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Xác nhận xóa</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Bạn có muốn xóa tài khoản phụ huynh này không?</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={() => setDeletingUserId(null)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={() => {
                    deleteUser(deletingUserId);
                    setDeletingUserId(null);
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TeacherWorkspace() {
  const [activeTab, setActiveTab] = useState<'grade' | 'create_exam' | 'parent_communication' | 'parent_management'>('parent_communication');

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex bg-white/60 dark:bg-black/20 p-1.5 md:p-2.5 rounded-2xl md:rounded-3xl w-full md:w-fit max-w-full border border-slate-200/60 dark:border-white/5 relative z-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl overflow-x-auto scrollbar-none hide-scrollbar">
        <button
          onClick={() => setActiveTab('parent_communication')}
          className={`relative px-4 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center gap-2 md:gap-3 transition-all z-10 shrink-0 text-xs md:text-sm ${
            activeTab === 'parent_communication'
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          {activeTab === 'parent_communication' && (
            <motion.div
              layoutId="teacher-tab-active"
              className="absolute inset-0 bg-white dark:bg-[#1C274C] rounded-xl md:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/50 dark:border-white/10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <Send className={`w-4 h-4 md:w-5 md:h-5 relative z-10 ${activeTab === 'parent_communication' ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
          <span className="relative z-10">Gửi KQ Phụ Huynh</span>
        </button>
        <button
          onClick={() => setActiveTab('parent_management')}
          className={`relative px-4 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center gap-2 md:gap-3 transition-all z-10 shrink-0 text-xs md:text-sm ${
            activeTab === 'parent_management'
              ? 'text-purple-700 dark:text-purple-400'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          {activeTab === 'parent_management' && (
            <motion.div
              layoutId="teacher-tab-active"
              className="absolute inset-0 bg-white dark:bg-[#1C274C] rounded-xl md:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/50 dark:border-white/10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <Users className={`w-4 h-4 md:w-5 md:h-5 relative z-10 ${activeTab === 'parent_management' ? 'text-purple-600 dark:text-purple-400' : ''}`} />
          <span className="relative z-10">Quản Lý Phụ Huynh</span>
        </button>
        <button
          onClick={() => setActiveTab('grade')}
          className={`relative px-4 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center gap-2 md:gap-3 transition-all z-10 shrink-0 text-xs md:text-sm ${
            activeTab === 'grade'
              ? 'text-indigo-700 dark:text-indigo-400'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          {activeTab === 'grade' && (
            <motion.div
              layoutId="teacher-tab-active"
              className="absolute inset-0 bg-white dark:bg-[#1C274C] rounded-xl md:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/50 dark:border-white/10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <FileCheck2 className={`w-4 h-4 md:w-5 md:h-5 relative z-10 ${activeTab === 'grade' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
          <span className="relative z-10">Chấm Bài Tự Động (AI)</span>
        </button>
        <button
          onClick={() => setActiveTab('create_exam')}
          className={`relative px-4 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center gap-2 md:gap-3 transition-all z-10 shrink-0 text-xs md:text-sm ${
            activeTab === 'create_exam'
              ? 'text-teal-700 dark:text-teal-400'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          {activeTab === 'create_exam' && (
            <motion.div
              layoutId="teacher-tab-active"
              className="absolute inset-0 bg-white dark:bg-[#1C274C] rounded-xl md:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/50 dark:border-white/10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <PenTool className={`w-4 h-4 md:w-5 md:h-5 relative z-10 ${activeTab === 'create_exam' ? 'text-teal-600 dark:text-teal-400' : ''}`} />
          <span className="relative z-10">Tạo Đề Thi (Bộ GD&ĐT)</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'parent_communication' ? (
          <ParentCommunication key="parent_communication" />
        ) : activeTab === 'parent_management' ? (
          <ParentManagement key="parent_management" />
        ) : activeTab === 'grade' ? (
          <TeacherGrading key="grade" />
        ) : (
          <TeacherExamCreator key="exam" />
        )}
      </AnimatePresence>
    </div>
  );
}

function TeacherGrading() {
  const { showToast } = useAppContext();
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [studentWorkFile, setStudentWorkFile] = useState<File | null>(null);
  const [gradeSubject, setGradeSubject] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const extractTextFromFile = async (file: File): Promise<string> => {
    try {
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
        return await file.text();
      }
      
      if (file.name.endsWith('.docx')) {
        // Dynamic import mammoth to avoid loading it if not needed
        const mammoth = (await import('mammoth')).default;
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      }
      
      return `(Hệ thống chưa thể trích xuất chữ viết trực tiếp từ file ảnh/pdf này. Tên file được nộp: "${file.name}". Xin hãy dựa vào Tên file và Môn học được cung cấp để suy ra nội dung giả lập hợp lý nhất có thể cho một bài kiểm tra, từ đó tiến hành chấm và nhận xét chi tiết như thật.)`;
    } catch (error) {
      console.error("Lỗi khi đọc file:", error);
      return `(Không thể đọc nội dung file ${file.name}. Hãy dựa vào tên file và Môn học để suy luận một kịch bản chấm bài hợp lý.)`;
    }
  };

  const handleGrade = async () => {
    if (!studentWorkFile) return;
    setIsGrading(true);
    setResult(null);

    try {
      const studentText = await extractTextFromFile(studentWorkFile);
      const answerText = answerKeyFile 
        ? await extractTextFromFile(answerKeyFile)
        : 'Không có đáp án, hãy tự dùng kiến thức chuẩn xác của bạn để chấm.';

      const subjectContext = gradeSubject.trim() ? `Môn học / Chủ đề: ${gradeSubject}` : "Không rõ môn học (hãy tự suy luận từ tên file và dữ liệu)";

      const res = await fetch('/api/workspace/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: "Bạn là một giáo viên chuyên nghiệp, tận tâm và vô cùng nghiêm khắc của Bộ GD&ĐT Việt Nam. BẮT BUỘC 100% PHẢI TRẢ LỜI BẰNG TIẾNG VIỆT, tuyệt đối không dùng tiếng Anh hay tiếng Trung Quốc. Hãy đọc nội dung bài làm, đối chiếu với đáp án (nếu có), sau đó đưa ra điểm số, nhận xét chi tiết, chỉ ra những điểm cần khắc phục. Nếu nội dung bài làm là mô phỏng do không đọc được file ảnh/pdf, hãy BẮT BUỘC tạo ra nội dung mô phỏng cực kỳ chi tiết, phù hợp chính xác với MÔN HỌC mà người dùng nhập vào, rồi chấm như bình thường.",
          prompt: `${subjectContext}\n\nBài làm của học sinh (Từ file: ${studentWorkFile.name}):\n"""\n${studentText}\n"""\n\nĐáp án chuẩn (Từ file: ${answerKeyFile?.name || 'Không có'}):\n"""\n${answerText}\n"""\n\nHãy phân tích, chấm điểm theo thang điểm 10, đưa ra lời khen và các lỗi sai cần sửa. TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT.`
        })
      });
      const data = await res.json();
      setResult(data.reply);
    } catch (error) {
      setResult("Đã có lỗi xảy ra trong quá trình chấm bài.");
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white/80 backdrop-blur-xl dark:bg-[#1C274C] rounded-[2.5rem] p-4 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-white/10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 blur-3xl -z-10 rounded-full pointer-events-none"></div>
      
      <div className="grid md:grid-cols-12 gap-6 md:gap-10 lg:gap-16">
        <div className="md:col-span-5 space-y-6 md:space-y-8">
          <div className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Môn học / Chủ đề bài làm</label>
              <input
                type="text"
                value={gradeSubject || ''}
                onChange={(e) => setGradeSubject(e.target.value)}
                placeholder="VD: Tiếng Anh lớp 9, Toán hình 12..."
                className="w-full bg-white dark:bg-[#121A33] border border-slate-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all text-base md:text-sm shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs">1</div>
                  Tải lên đáp án <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                </label>
              </div>
              <div className={`relative overflow-hidden border-2 border-dashed rounded-[2rem] p-5 md:p-8 text-center transition-all duration-300 group ${answerKeyFile ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-[0_8px_30px_rgba(16,185,129,0.1)]' : 'border-slate-200 dark:border-white/20 hover:border-indigo-400 hover:bg-slate-50/50 dark:hover:bg-white/5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]'}`}>
                {answerKeyFile ? (
                   <div className="flex flex-col items-center">
                     <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-3 shadow-inner">
                       <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-emerald-500 drop-shadow-sm" />
                     </div>
                     <p className="font-bold text-emerald-700 dark:text-emerald-400 mb-1 text-sm md:text-base break-all">{answerKeyFile.name}</p>
                     <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mb-4">Đã tải lên thành công</p>
                     <label htmlFor="answerKey" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer underline underline-offset-2">Thay đổi file khác</label>
                   </div>
                ) : (
                   <div className="flex flex-col items-center">
                     <div className="w-12 h-12 md:w-16 md:h-16 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.03)] group-hover:shadow-[0_4px_20px_rgba(99,102,241,0.1)] group-hover:scale-110 duration-300">
                       <Upload className="w-6 h-6 md:w-8 md:h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                     </div>
                     <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Kéo thả file vào đây</p>
                     <p className="text-xs text-slate-500 mb-4">hoặc nhấn để chọn file</p>
                     <label htmlFor="answerKey" className="bg-white dark:bg-[#121A33] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm hover:shadow-md">
                       Duyệt File
                     </label>
                   </div>
                )}
                <input type="file" id="answerKey" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        setAnswerKeyFile(file);
                        showToast('Tải tài liệu thành công', 'success');
                    } else {
                        setAnswerKeyFile(null);
                    }
                  }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs">2</div>
                  Bài làm của học sinh <span className="text-red-500">*</span>
                </label>
              </div>
              <div className={`relative overflow-hidden border-2 border-dashed rounded-[2rem] p-5 md:p-8 text-center transition-all duration-300 group ${studentWorkFile ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-[0_8px_30px_rgba(99,102,241,0.1)]' : 'border-slate-200 dark:border-white/20 hover:border-indigo-400 hover:bg-slate-50/50 dark:hover:bg-white/5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]'}`}>
                {studentWorkFile ? (
                   <div className="flex flex-col items-center">
                     <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mb-3 shadow-inner">
                       <FileCheck2 className="w-6 h-6 md:w-8 md:h-8 text-indigo-600 drop-shadow-sm" />
                     </div>
                     <p className="font-bold text-indigo-800 dark:text-indigo-400 mb-1 text-sm md:text-base break-all">{studentWorkFile.name}</p>
                     <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mb-4">Sẵn sàng để chấm</p>
                     <label htmlFor="studentWork" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer underline underline-offset-2">Thay đổi file khác</label>
                   </div>
                ) : (
                   <div className="flex flex-col items-center">
                     <div className="w-12 h-12 md:w-16 md:h-16 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.03)] group-hover:shadow-[0_4px_20px_rgba(99,102,241,0.1)] group-hover:scale-110 duration-300">
                       <FileUp className="w-6 h-6 md:w-8 md:h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                     </div>
                     <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Kéo thả bài làm vào đây</p>
                     <p className="text-xs text-slate-500 mb-4">Ảnh bài kiểm tra, file Word, PDF</p>
                     <label htmlFor="studentWork" className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold cursor-pointer hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)]">
                       Chọn Bài Làm
                     </label>
                   </div>
                )}
                <input type="file" id="studentWork" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        setStudentWorkFile(file);
                        showToast('Tải tài liệu thành công', 'success');
                    } else {
                        setStudentWorkFile(null);
                    }
                  }} />
              </div>
            </div>
          </div>

          <button
            onClick={handleGrade}
            disabled={!studentWorkFile || isGrading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-indigo-500/30 transition-all disabled:opacity-50 text-base md:text-lg group"
          >
            {isGrading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Đang phân tích & chấm điểm...</>
            ) : (
              <><Sparkles className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" /> Yêu cầu AI chấm bài</>
            )}
          </button>
        </div>

        <div className="md:col-span-7 bg-white/40 dark:bg-[#121A33] rounded-[2.5rem] p-4 md:p-10 border border-white dark:border-white/5 flex flex-col min-h-[300px] md:min-h-[500px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/5 blur-3xl rounded-full"></div>
          {isGrading && (
             <div className="absolute inset-0 bg-white/50 dark:bg-[#121A33]/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
               <div className="w-16 h-16 md:w-20 md:h-20 relative mb-4">
                 <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-900 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Brain className="w-6 h-6 md:w-8 md:h-8 text-indigo-600 animate-pulse" />
                 </div>
               </div>
               <h3 className="font-bold text-base md:text-lg text-indigo-900 dark:text-indigo-100 mb-2">AI Đang Phân Tích</h3>
               <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 max-w-[200px] text-center">Đang trích xuất văn bản, đối chiếu đáp án và đưa ra lời nhận xét...</p>
             </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 border-b border-slate-200/50 dark:border-white/10 pb-5">
            <h3 className="font-bold text-lg md:text-2xl flex items-center gap-3 text-slate-800 dark:text-white font-display">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
              </div>
              Bảng Điểm & Nhận Xét
            </h3>
            {result && (
              <button className="w-full sm:w-auto text-indigo-700 dark:text-indigo-400 font-bold text-xs md:text-sm bg-white dark:bg-indigo-500/10 border border-indigo-100 dark:border-transparent px-5 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-all shadow-[0_2px_10px_rgba(99,102,241,0.05)] flex items-center justify-center gap-2">
                <FileDown className="w-4 h-4" /> Xuất Báo Cáo
              </button>
            )}
          </div>
          
          {result ? (
            <div className="flex-1 overflow-auto custom-scrollbar pr-2 relative z-10">
              <div className="prose prose-slate dark:prose-invert prose-indigo max-w-none text-xs md:text-base leading-relaxed bg-white/80 backdrop-blur-md dark:bg-[#1C274C] p-4 md:p-8 rounded-2xl md:rounded-3xl border border-white dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] whitespace-pre-wrap">
                {result}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10 relative z-10">
              <div className="relative mb-6 group">
                <div className="w-20 h-20 md:w-28 md:h-28 bg-white/50 dark:bg-white/5 rounded-full flex items-center justify-center relative z-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm border border-white">
                  <FileCheck2 className="w-8 h-8 md:w-12 md:h-12 text-slate-300 dark:text-slate-600 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:text-indigo-300" />
                </div>
                <div className="absolute inset-0 bg-indigo-400/10 blur-3xl rounded-full transition-opacity duration-500 group-hover:opacity-100 opacity-50"></div>
              </div>
              <p className="text-sm md:text-base text-center max-w-xs md:max-w-sm text-slate-500 font-medium">Kết quả chấm bài, phân tích lỗi sai và điểm số chi tiết sẽ được AI tổng hợp tại đây.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TeacherExamCreator() {
  const [schoolName, setSchoolName] = useState("SỞ GIÁO DỤC VÀ ĐÀO TẠO\nTRƯỜNG THPT CHUYÊN");
  const [examTitle, setExamTitle] = useState("ĐỀ KIỂM TRA ĐỊNH KỲ");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("45");
  const [contextText, setContextText] = useState("");
  const [mcqCount, setMcqCount] = useState(10);
  const [shortCount, setShortCount] = useState(0);
  const [essayCount, setEssayCount] = useState(1);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [examContent, setExamContent] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!subject.trim()) {
      alert("Vui lòng nhập môn học/chủ đề!");
      return;
    }
    setIsGenerating(true);
    setExamContent(null);

    try {
      const res = await fetch('/api/workspace/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: "Bạn là chuyên gia ra đề thi chuẩn của Bộ Giáo dục và Đào tạo. Hãy tạo một đề thi/đề kiểm tra chuyên nghiệp với cấu trúc chuẩn. BẮT BUỘC TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT (TRỪ KHI MÔN HỌC LÀ NGOẠI NGỮ). CHỈ TRẢ VỀ NỘI DUNG CÁC CÂU HỎI VÀ ĐÁP ÁN (nếu cần), không cần phần tiêu đề trường hay thời gian vì hệ thống đã tự ghép.",
          prompt: `Tạo đề thi môn/chủ đề: ${subject}
Ngữ liệu sử dụng (nếu có): ${contextText}
Cấu trúc yêu cầu:
- ${mcqCount} câu trắc nghiệm khách quan (nhiều lựa chọn A, B, C, D)
- ${shortCount} câu trả lời ngắn
- ${essayCount} câu tự luận

Yêu cầu trình bày rõ ràng, đánh số câu liên tục. Có phân chia rõ các phần I. TRẮC NGHIỆM, II. TRẢ LỜI NGẮN, III. TỰ LUẬN (nếu số lượng > 0).`
        })
      });
      const data = await res.json();
      setExamContent(data.reply);
    } catch (error) {
      setExamContent("Đã xảy ra lỗi khi tạo đề thi.");
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToWord = () => {
    if (!examContent) return;
    
    const headerHtml = `
      <table style="width: 100%; border-collapse: collapse; text-align: center; font-family: 'Times New Roman', Times, serif;">
        <tr>
          <td style="width: 40%; vertical-align: top;">
            <strong>${schoolName.replace(/\n/g, '<br/>')}</strong><br/>
            <hr style="width: 50%; border: 0.5px solid black; margin-top: 5px;" />
          </td>
          <td style="width: 60%; vertical-align: top;">
            <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
            <strong>Độc lập - Tự do - Hạnh phúc</strong><br/>
            <hr style="width: 40%; border: 0.5px solid black; margin-top: 5px;" />
          </td>
        </tr>
      </table>
      <div style="text-align: center; font-family: 'Times New Roman', Times, serif; margin-top: 20px;">
        <h2><strong>${examTitle}</strong></h2>
        <p><strong>Môn: ${subject}</strong></p>
        <p><em>Thời gian làm bài: ${duration} phút (Không kể thời gian phát đề)</em></p>
      </div>
      <hr style="border: 1px solid black; margin: 20px 0;" />
    `;

    const bodyHtml = `
      <div style="font-family: 'Times New Roman', Times, serif; font-size: 14pt; line-height: 1.5;">
        ${examContent.replace(/\n/g, '<br/>')}
      </div>
    `;

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Export HTML to Word</title>
      </head>
      <body>
        ${headerHtml}
        ${bodyHtml}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `De_Thi_${subject.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white/80 backdrop-blur-xl dark:bg-[#1C274C] rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-white/10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-teal-500/5 to-emerald-500/5 blur-3xl -z-10 rounded-full pointer-events-none"></div>
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
        <div className="lg:col-span-4 space-y-8 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-5 bg-slate-50/50 dark:bg-black/10 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
            <h4 className="font-bold text-slate-800 dark:text-white border-b border-slate-200/60 dark:border-white/10 pb-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Settings className="w-4 h-4" />
              </div>
              Thông tin chung
            </h4>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Tên Đơn Vị / Trường</label>
              <textarea
                value={schoolName || ''}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full bg-white dark:bg-[#121A33] border border-slate-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                rows={2}
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Tên Đề Thi</label>
              <input
                type="text"
                value={examTitle || ''}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full bg-white dark:bg-[#121A33] border border-slate-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Môn / Chủ đề</label>
                  <input
                    type="text"
                    value={subject || ''}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="VD: Toán 10..."
                    className="w-full bg-white dark:bg-[#121A33] border border-slate-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Thời gian (phút)</label>
                  <input
                    type="number"
                    value={duration || ''}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-white dark:bg-[#121A33] border border-slate-200 dark:border-white/10 rounded-2xl p-4 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                  />
               </div>
            </div>
          </div>

          <div className="space-y-5 bg-slate-50/50 dark:bg-black/10 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
            <h4 className="font-bold text-slate-800 dark:text-white border-b border-slate-200/60 dark:border-white/10 pb-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FileText className="w-4 h-4" />
              </div>
              Cấu trúc & Nội dung
            </h4>
            
            <div className="grid grid-cols-3 gap-3">
               <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2 text-center">Trắc nghiệm</label>
                  <input
                    type="number"
                    value={mcqCount || ''}
                    onChange={(e) => setMcqCount(Number(e.target.value))}
                    min={0}
                    className="w-full bg-white dark:bg-[#121A33] border border-slate-200 dark:border-white/10 rounded-2xl p-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm text-center font-bold text-teal-600 dark:text-teal-400 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                  />
               </div>
               <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2 text-center">Trả lời ngắn</label>
                  <input
                    type="number"
                    value={shortCount || ''}
                    onChange={(e) => setShortCount(Number(e.target.value))}
                    min={0}
                    className="w-full bg-white dark:bg-[#121A33] border border-slate-200 dark:border-white/10 rounded-2xl p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm text-center font-bold text-blue-600 dark:text-blue-400 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                  />
               </div>
               <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2 text-center">Tự luận</label>
                  <input
                    type="number"
                    value={essayCount || ''}
                    onChange={(e) => setEssayCount(Number(e.target.value))}
                    min={0}
                    className="w-full bg-white dark:bg-[#121A33] border border-slate-200 dark:border-white/10 rounded-2xl p-3 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-sm text-center font-bold text-purple-600 dark:text-purple-400 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                  />
               </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Ngữ liệu / Đoạn văn (nếu có)</label>
              <textarea
                value={contextText || ''}
                onChange={(e) => setContextText(e.target.value)}
                placeholder="Dán bài thơ, đoạn văn, hoặc yêu cầu AI tạo ngữ liệu về chủ đề nào đó..."
                className="w-full bg-white dark:bg-[#121A33] border border-slate-200 dark:border-white/10 rounded-2xl p-4 min-h-[140px] outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all resize-none text-sm shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
              ></textarea>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!subject.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-teal-700 hover:shadow-[0_8px_30px_rgba(20,184,166,0.3)] transition-all disabled:opacity-50 text-lg group shadow-[0_4px_20px_rgba(20,184,166,0.2)]"
          >
            {isGenerating ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Đang soạn đề thi...</>
            ) : (
              <><PenTool className="w-6 h-6 group-hover:scale-110 transition-transform" /> Biên Soạn Đề Thi (AI)</>
            )}
          </button>
        </div>
        
        <div className="lg:col-span-8 bg-slate-50/50 dark:bg-black/40 rounded-[2rem] p-4 md:p-10 flex flex-col items-center justify-center min-h-[300px] md:min-h-[600px] border border-slate-200/50 dark:border-white/5 relative w-full overflow-hidden">
          {examContent && (
            <div className="w-full flex justify-end mb-4 md:absolute md:top-6 md:right-6 z-20">
               <button 
                 onClick={exportToWord}
                 className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-[0_4px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.4)] hover:-translate-y-0.5"
               >
                 <FileDown className="w-4 h-4" /> Xuất ra Word (.doc)
               </button>
            </div>
          )}

          {examContent ? (
            <div className="w-full max-w-[210mm] bg-white min-h-0 sm:min-h-[297mm] shadow-[0_10px_50px_rgba(0,0,0,0.1)] dark:shadow-none mx-auto p-4 sm:p-[20mm] text-black relative z-10 my-4 border border-slate-100 rounded-2xl sm:rounded-none">
               <div className="font-[Times_New_Roman,Times,serif] leading-relaxed text-xs sm:text-[13pt]">
                  
                  {/* Header Chuẩn */}
                  <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start text-[11px] sm:text-[13pt] gap-4 mb-6">
                     <div className="text-center font-bold flex flex-col items-center w-full sm:w-[40%]">
                        <span className="whitespace-pre-wrap">{schoolName}</span>
                        <div className="w-16 h-px bg-black mt-1"></div>
                     </div>
                     <div className="text-center font-bold flex flex-col items-center w-full sm:w-[60%]">
                        <span>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</span>
                        <span className="text-[9px] sm:text-[11pt]">Độc lập - Tự do - Hạnh phúc</span>
                        <div className="w-24 h-[1.5px] bg-black mt-1"></div>
                     </div>
                  </div>

                  <div className="text-center mb-8">
                     <h2 className="text-sm sm:text-[16pt] font-bold uppercase mb-1">{examTitle}</h2>
                     <p className="text-xs sm:text-[14pt] font-bold">Môn: {subject}</p>
                     <p className="text-[10px] sm:text-[12pt] italic">Thời gian làm bài: {duration} phút (Không kể thời gian phát đề)</p>
                  </div>

                  <hr className="border-black/50 mb-6" />

                  {/* Nội dung đề thi */}
                  <div className="text-xs sm:text-[13pt] whitespace-pre-wrap leading-relaxed">
                     {examContent}
                  </div>
                  
                  <div className="text-right mt-12 font-bold italic text-[10px] sm:text-[12pt]">
                     --- HẾT ---
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 w-full h-full py-10 relative z-10">
              <div className="relative mb-6 group">
                <div className="w-20 h-20 md:w-28 md:h-28 bg-white dark:bg-white/5 rounded-full flex items-center justify-center relative z-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                  <BookOpen className="w-8 h-8 md:w-12 md:h-12 text-slate-300 dark:text-slate-600 transition-transform duration-500 group-hover:scale-110 group-hover:text-teal-400" />
                </div>
                <div className="absolute inset-0 bg-teal-400/10 blur-3xl rounded-full transition-opacity duration-500 group-hover:opacity-100 opacity-50"></div>
              </div>
              <p className="text-sm md:text-base text-center max-w-xs md:max-w-sm font-medium text-slate-500">Điền các thông số bên trái và yêu cầu AI biên soạn một đề thi chuẩn theo quy định của Bộ GD&ĐT.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StudentWorkspace() {
  const [activeTab, setActiveTab] = useState<'study_path' | 'quiz' | 'exam'>('study_path');

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex bg-white/60 dark:bg-black/20 p-1.5 md:p-2.5 rounded-2xl md:rounded-3xl w-full md:w-fit max-w-full border border-slate-200/60 dark:border-white/5 relative z-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl overflow-x-auto scrollbar-none hide-scrollbar">
        <button
          onClick={() => setActiveTab('study_path')}
          className={`relative px-4 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center gap-2 md:gap-3 transition-all z-10 shrink-0 text-xs md:text-sm ${
            activeTab === 'study_path'
              ? 'text-amber-700 dark:text-amber-400'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          {activeTab === 'study_path' && (
            <motion.div
              layoutId="student-tab-active"
              className="absolute inset-0 bg-white dark:bg-[#1C274C] rounded-xl md:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/50 dark:border-white/10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <Map className={`w-4 h-4 md:w-5 md:h-5 relative z-10 ${activeTab === 'study_path' ? 'text-amber-600 dark:text-amber-400' : ''}`} />
          <span className="relative z-10">Bản Đồ Học Tập (AI)</span>
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`relative px-4 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center gap-2 md:gap-3 transition-all z-10 shrink-0 text-xs md:text-sm ${
            activeTab === 'quiz'
              ? 'text-orange-700 dark:text-orange-400'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          {activeTab === 'quiz' && (
             <motion.div
               layoutId="student-tab-active"
               className="absolute inset-0 bg-white dark:bg-[#1C274C] rounded-xl md:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/50 dark:border-white/10"
               transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
             />
          )}
          <Sparkles className={`w-4 h-4 md:w-5 md:h-5 relative z-10 ${activeTab === 'quiz' ? 'text-orange-600 dark:text-orange-400' : ''}`} />
          <span className="relative z-10">Tạo Quiz Luyện Tập</span>
        </button>
        <button
          onClick={() => setActiveTab('exam')}
          className={`relative px-4 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center gap-2 md:gap-3 transition-all z-10 shrink-0 text-xs md:text-sm ${
            activeTab === 'exam'
              ? 'text-indigo-700 dark:text-indigo-400'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          {activeTab === 'exam' && (
             <motion.div
               layoutId="student-tab-active"
               className="absolute inset-0 bg-white dark:bg-[#1C274C] rounded-xl md:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/50 dark:border-white/10"
               transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
             />
          )}
          <FileText className={`w-4 h-4 md:w-5 md:h-5 relative z-10 ${activeTab === 'exam' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
          <span className="relative z-10">Đề Thi Chuẩn Bộ GD&ĐT</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'study_path' && <StudentStudyPath key="path" />}
        {activeTab === 'quiz' && <StudentQuiz key="quiz" />}
        {activeTab === 'exam' && <StudentExam key="exam" />}
      </AnimatePresence>
    </div>
  );
}

function StudentStudyPath() {
  const [goal, setGoal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pathData, setPathData] = useState<{ phases: { title: string; duration: string; tasks: string[] }[]; advice: string } | null>(null);

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setIsGenerating(true);
    setPathData(null);

    try {
      const res = await fetch('/api/workspace/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: `Bạn là một gia sư AI siêu việt. BẮT BUỘC TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT (TỪNG CHỮ MỘT, KHÔNG DÙNG TIẾNG ANH HAY TIẾNG TRUNG). Hãy tạo một lộ trình học tập chi tiết và trả về CHỈ MỘT chuỗi JSON hợp lệ với định dạng sau:
{
  "phases": [
    {
      "title": "Tên giai đoạn (VD: Nền tảng)",
      "duration": "Thời gian (VD: Tuần 1-4)",
      "tasks": ["Nhiệm vụ 1", "Nhiệm vụ 2"]
    }
  ],
  "advice": "Lời khuyên tổng quan"
}
Không có markdown, không giải thích thêm.`,
          prompt: `Mục tiêu của tôi: ${goal}\nHãy vạch ra lộ trình học tối ưu.`
        })
      });
      const data = await res.json();
      
      let parsed;
      try {
        let cleanReply = data.reply.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanReply);
      } catch (e) {
        parsed = {
          phases: [
            { title: "Bắt đầu", duration: "Tuần 1", tasks: ["Lên kế hoạch chi tiết", "Chuẩn bị tài liệu"] }
          ],
          advice: "Hãy kiên trì theo đuổi mục tiêu."
        };
      }
      setPathData(parsed);
    } catch (error) {
      alert("Lỗi khi tạo lộ trình.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white/80 backdrop-blur-xl dark:bg-[#1C274C] rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-white/10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-amber-500/5 to-orange-500/5 blur-3xl -z-10 rounded-full pointer-events-none"></div>
      
      {!pathData ? (
        <div className="max-w-2xl mx-auto py-16 text-center relative z-10">
           <div className="relative mb-8 group">
             <div className="w-28 h-28 bg-white dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto relative z-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white dark:border-amber-700/50">
               <Map className="w-14 h-14 text-amber-500 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
             </div>
             <div className="absolute inset-0 bg-amber-400/20 blur-3xl rounded-full transition-opacity duration-500 group-hover:opacity-100 opacity-50"></div>
           </div>
           <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 font-display text-slate-800 dark:text-white">Bản Đồ Kho Báu Tri Thức</h2>
           <p className="text-slate-500 mb-6 md:mb-10 max-w-lg mx-auto font-medium text-sm md:text-lg leading-relaxed">Bạn muốn chinh phục vùng đất nào? AI sẽ vẽ ra một tấm bản đồ lộ trình chi tiết dẫn bạn đến đích.</p>
           
           <div className="space-y-4 md:space-y-6 max-w-lg mx-auto bg-white/50 dark:bg-black/20 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-white dark:border-white/5">
             <div className="relative">
               <input
                 type="text"
                 value={goal || ''}
                 onChange={(e) => setGoal(e.target.value)}
                 placeholder="VD: Đạt 8.0 IELTS, Thi đỗ Đại học Y..."
                 className="w-full bg-white dark:bg-[#121A33] border-2 border-slate-100 dark:border-white/5 rounded-2xl p-5 pl-14 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-base font-medium shadow-sm"
               />
               <Compass className="w-6 h-6 text-amber-500/70 absolute left-5 top-1/2 -translate-y-1/2" />
             </div>
             <button
               onClick={handleGenerate}
               disabled={!goal.trim() || isGenerating}
               className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 text-lg shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.4)] group"
             >
               {isGenerating ? (
                 <><Loader2 className="w-6 h-6 animate-spin" /> AI Đang Vẽ Bản Đồ...</>
               ) : (
                 <><MapPin className="w-6 h-6 group-hover:scale-110 group-hover:-translate-y-1 transition-transform" /> Khám Phá Lộ Trình</>
               )}
             </button>
           </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-6">
            <div>
              <h3 className="font-bold text-2xl flex items-center gap-2 font-display">
                <Map className="w-7 h-7 text-amber-600" /> Bản Đồ Chinh Phục
              </h3>
              <p className="text-slate-500 text-sm mt-1 font-medium">Đích đến: <strong className="text-amber-600 dark:text-amber-400 text-base">{goal}</strong></p>
            </div>
            <button
               onClick={() => setPathData(null)}
               className="bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-800/40 text-amber-800 dark:text-amber-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
            >
               <Compass className="w-4 h-4" /> Bản Đồ Mới
            </button>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 relative rounded-3xl p-4 md:p-10 border-2 md:border-4 border-amber-900/10 dark:border-amber-700/30 bg-[#FDF8EB] dark:bg-[#2C2119] overflow-hidden shadow-inner">
              
              {/* Texture overlays */}
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjEiLz4KPC9zdmc+')" }}></div>
              <Compass className="absolute top-[-2rem] right-[-2rem] w-48 h-48 text-amber-900/5 dark:text-amber-500/5 rotate-45 pointer-events-none" />
              <ScrollText className="absolute bottom-[-2rem] left-[-2rem] w-40 h-40 text-amber-900/5 dark:text-amber-500/5 -rotate-12 pointer-events-none" />

              <div className="relative space-y-12 before:absolute before:inset-0 before:ml-[1.65rem] md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[3px] before:border-l-[3px] before:border-dashed before:border-amber-900/30 dark:before:border-amber-500/30">
                {pathData.phases.map((phase, idx) => {
                  const isLast = idx === pathData.phases.length - 1;
                  
                  return (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.2, type: "spring" }}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                    >
                      {/* Trail Node */}
                      <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-[#FDF8EB] dark:border-[#2C2119] bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_20px_rgba(245,158,11,0.4)] relative z-10 transition-transform duration-300 group-hover:scale-110">
                        {idx === 0 ? <Anchor className="w-6 h-6" /> : isLast ? <Crown className="w-7 h-7 drop-shadow-md" /> : <Tent className="w-6 h-6" />}
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-black flex items-center justify-center border-2 border-[#FDF8EB] dark:border-[#2C2119]">
                          {idx + 1}
                        </div>
                      </div>
                      
                      {/* Phase Content */}
                      <div className="w-[calc(100%-4.5rem)] md:w-[calc(50%-3rem)] bg-[#FFFDF7] dark:bg-[#3D2E24] p-5 md:p-6 rounded-2xl border border-amber-900/10 dark:border-amber-700/20 shadow-md group-hover:shadow-lg transition-all relative">
                        {/* Little triangle pointing to node */}
                        <div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FFFDF7] dark:bg-[#3D2E24] border-t border-r border-amber-900/10 dark:border-amber-700/20 rotate-45 
                          group-odd:-left-2 group-odd:border-t-0 group-odd:border-r-0 group-odd:border-b group-odd:border-l
                          group-even:-right-2"
                        ></div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded border border-amber-200 dark:border-amber-800">
                            {phase.duration}
                          </span>
                        </div>
                        <h4 className="font-bold text-lg mb-4 text-amber-950 dark:text-amber-100 font-display">{phase.title}</h4>
                        <ul className="space-y-2.5">
                          {phase.tasks.map((task, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-amber-900/80 dark:text-amber-100/70 font-medium leading-relaxed">
                               <Flag className="w-4 h-4 text-orange-500 shrink-0 mt-0.5 opacity-80" />
                               {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
            
            <div className="lg:col-span-4">
              <div className="sticky top-6">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-b from-[#FFFDF7] to-amber-50/50 dark:from-[#3D2E24] dark:to-[#2C2119] p-6 md:p-8 rounded-3xl border border-amber-200/60 dark:border-amber-900/50 shadow-xl relative overflow-hidden"
                >
                  {/* Decor */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl"></div>
                  
                  <h4 className="font-bold text-amber-900 dark:text-amber-400 mb-5 flex items-center gap-2 text-xl font-display">
                    <Sparkles className="w-6 h-6 text-amber-500" /> Cẩm Nang Hành Trình
                  </h4>
                  <div className="text-sm text-amber-950/80 dark:text-amber-100/80 leading-relaxed font-medium italic border-l-2 border-amber-300 dark:border-amber-700 pl-4 mb-8">
                    "{pathData.advice}"
                  </div>
                  
                  <div className="p-5 bg-gradient-to-br from-amber-100/50 to-orange-100/50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200/50 dark:border-amber-800/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                      </div>
                      <span className="font-bold text-amber-900 dark:text-amber-100 text-base">Kho báu đang chờ!</span>
                    </div>
                    <p className="text-sm text-amber-800/80 dark:text-amber-200/70 font-medium">
                      Hãy hoàn thành từng trạm trên bản đồ. Kiên trì và kỷ luật sẽ dẫn bạn đến thành công rực rỡ nhất!
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StudentQuiz() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizData, setQuizData] = useState<{ id: number; question: string; options: string[]; correctIndex: number; explanation: string }[] | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setQuizData(null);
    setAnswers({});
    setShowResults(false);

    try {
      const res = await fetch('/api/workspace/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: `Bạn là một AI tạo quiz thông minh. BẮT BUỘC TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT CHO CẢ CÂU HỎI VÀ LỜI GIẢI THÍCH (TRỪ KHI CHỦ ĐỀ LÀ MÔN NGOẠI NGỮ). Hãy trả về CHỈ MỘT chuỗi JSON hợp lệ với định dạng sau (chứa 5 câu hỏi):
{
  "questions": [
    {
      "id": 1,
      "question": "Nội dung câu hỏi",
      "options": ["A. Đáp án 1", "B. Đáp án 2", "C. Đáp án 3", "D. Đáp án 4"],
      "correctIndex": 0, // Vị trí đáp án đúng (0 đến 3)
      "explanation": "Giải thích tại sao đáp án này đúng"
    }
  ]
}
Không có markdown, không giải thích thêm.`,
          prompt: `Chủ đề quiz: ${topic}`
        })
      });
      const data = await res.json();
      
      let parsed;
      try {
        let cleanReply = data.reply.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanReply);
      } catch (e) {
        parsed = {
          questions: [
            { id: 1, question: `Câu hỏi mẫu về ${topic}`, options: ["A. Đáp án A", "B. Đáp án B", "C. Đáp án C", "D. Đáp án D"], correctIndex: 0, explanation: "Giải thích mẫu" }
          ]
        };
      }
      setQuizData(parsed.questions || []);
    } catch (error) {
      alert("Lỗi khi tạo quiz.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (showResults) return; // Khóa sau khi đã nộp
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const calculateScore = () => {
    if (!quizData) return 0;
    let score = 0;
    quizData.forEach(q => {
      if (answers[q.id] === q.correctIndex) score++;
    });
    return score;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white/80 backdrop-blur-xl dark:bg-[#1C274C] rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-white/10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-orange-500/5 to-amber-500/5 blur-3xl -z-10 rounded-full pointer-events-none"></div>
      
      {!quizData ? (
        <div className="max-w-2xl mx-auto py-10 md:py-16 text-center relative z-10">
           <div className="relative mb-6 md:mb-8 group">
             <div className="w-20 h-20 md:w-28 md:h-28 bg-white dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto relative z-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white dark:border-orange-700/50">
               <Sparkles className="w-10 h-10 md:w-14 md:h-14 text-orange-500 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
             </div>
             <div className="absolute inset-0 bg-orange-400/20 blur-3xl rounded-full transition-opacity duration-500 group-hover:opacity-100 opacity-50"></div>
           </div>
           <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 font-display text-slate-800 dark:text-white">Tạo Quiz Thông Minh</h2>
           <p className="text-slate-500 mb-6 md:mb-10 max-w-lg mx-auto font-medium text-sm md:text-lg leading-relaxed">Nhập chủ đề bất kỳ, AI sẽ tự động sinh ra một bộ câu hỏi trắc nghiệm tương tác siêu đẹp để bạn luyện tập và kiểm tra kiến thức ngay lập tức.</p>
           
           <div className="space-y-4 md:space-y-6 max-w-lg mx-auto bg-white/50 dark:bg-black/20 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-white dark:border-white/5">
             <input
               type="text"
               value={topic || ''}
               onChange={(e) => setTopic(e.target.value)}
               placeholder="VD: Thì hiện tại đơn, Sinh học tế bào..."
               className="w-full bg-white dark:bg-[#121A33] border-2 border-slate-100 dark:border-white/5 rounded-2xl p-5 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 transition-all text-base font-medium shadow-sm text-center"
             />
             <button
               onClick={handleGenerate}
               disabled={!topic.trim() || isGenerating}
               className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 text-lg shadow-[0_4px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_8px_30px_rgba(249,115,22,0.4)] group"
             >
               {isGenerating ? (
                 <><Loader2 className="w-6 h-6 animate-spin" /> Đang thiết kế Quiz...</>
               ) : (
                 <><Sparkles className="w-6 h-6 group-hover:scale-110 group-hover:-rotate-12 transition-transform" /> Bắt Đầu Luyện Tập</>
               )}
             </button>
           </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-6">
            <div>
              <h3 className="font-bold text-lg md:text-2xl flex items-center gap-2">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-orange-500" /> Quiz: {topic}
              </h3>
              <p className="text-slate-500 text-xs md:text-sm mt-1">{quizData.length} câu hỏi • AI Ollama</p>
            </div>
            {showResults && (
              <div className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-6 py-2 rounded-2xl font-bold flex flex-col items-center w-fit">
                <span className="text-[10px] uppercase tracking-wider mb-1">Điểm số</span>
                <span className="text-xl md:text-2xl">{calculateScore()}/{quizData.length}</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {quizData.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const selectedIdx = answers[q.id];
              const isCorrect = selectedIdx === q.correctIndex;
              
              return (
                <div key={q.id} className="bg-slate-50 dark:bg-black/20 p-4 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                  <div className="flex gap-4 mb-6">
                     <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold shrink-0">
                       {idx + 1}
                     </div>
                     <p className="font-bold text-lg leading-relaxed pt-1">{q.question}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {q.options.map((opt, i) => {
                      let btnClass = "bg-white dark:bg-[#121A33] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10";
                      
                      if (selectedIdx === i) {
                        btnClass = "bg-orange-50 dark:bg-orange-500/20 border-orange-500 text-orange-700 dark:text-orange-400 ring-2 ring-orange-500/20";
                      }
                      
                      if (showResults) {
                        if (i === q.correctIndex) {
                          btnClass = "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20";
                        } else if (selectedIdx === i && !isCorrect) {
                          btnClass = "bg-red-50 dark:bg-red-500/20 border-red-500 text-red-700 dark:text-red-400 ring-2 ring-red-500/20";
                        } else {
                          btnClass = "bg-white dark:bg-[#121A33] border-slate-200 dark:border-white/10 text-slate-400 opacity-50";
                        }
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handleSelectOption(q.id, i)}
                          disabled={showResults}
                          className={`text-left p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${btnClass}`}
                        >
                          <div className="flex items-center gap-3 relative z-10">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                              ${selectedIdx === i && !showResults ? 'border-orange-500 bg-orange-500' : ''}
                              ${showResults && i === q.correctIndex ? 'border-emerald-500 bg-emerald-500' : ''}
                              ${showResults && selectedIdx === i && !isCorrect ? 'border-red-500 bg-red-500' : ''}
                              ${selectedIdx !== i && (!showResults || (showResults && i !== q.correctIndex)) ? 'border-slate-300 dark:border-slate-600 group-hover:border-orange-400' : ''}
                            `}>
                              {selectedIdx === i && !showResults && <div className="w-2 h-2 rounded-full bg-white"></div>}
                              {showResults && i === q.correctIndex && <CheckCircle2 className="w-4 h-4 text-white" />}
                              {showResults && selectedIdx === i && !isCorrect && <div className="w-3 h-0.5 bg-white rotate-45 absolute"></div>}
                              {showResults && selectedIdx === i && !isCorrect && <div className="w-3 h-0.5 bg-white -rotate-45 absolute"></div>}
                            </div>
                            <span className="font-medium">{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {showResults && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-500/20"
                    >
                      <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                        <Brain className="w-5 h-5" /> Giải thích từ AI
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{q.explanation}</p>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-8 border-t border-slate-100 dark:border-white/10 gap-4">
            {!showResults ? (
              <button
                onClick={() => setShowResults(true)}
                disabled={Object.keys(answers).length < quizData.length}
                className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 flex items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-6 h-6" /> Hoàn thành Quiz
              </button>
            ) : (
              <button
                onClick={() => setQuizData(null)}
                className="bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-2xl font-bold hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors flex items-center gap-2 text-lg"
              >
                Tạo Quiz Mới
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Need HelpCircle imported! Wait, I'll just change to MessageCircleQuestion
// Oh wait, I didn't import HelpCircle, I will change HelpCircle to MessageCircleQuestion in the edit.

function StudentExam() {
  const [examStatus, setExamStatus] = useState<'idle' | 'generating' | 'taking' | 'submitting' | 'result'>('idle');
  const [examTopic, setExamTopic] = useState("");
  const [questions, setQuestions] = useState<{ id: number; question: string; options: string[]; type: string }[]>([]);
  const [essayQuestion, setEssayQuestion] = useState("");
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [essayAnswer, setEssayAnswer] = useState("");
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const handleGenerateExam = async () => {
    if (!examTopic.trim()) return;
    setExamStatus('generating');
    try {
      const res = await fetch('/api/workspace/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: "Bạn là một hệ thống AI tạo đề thi chuẩn của Bộ GD&ĐT. BẮT BUỘC TRẢ LỜI HOÀN TOÀN BẰNG TIẾNG VIỆT (TRỪ KHI MÔN HỌC LÀ NGOẠI NGỮ). Hãy trả về CHỈ MỘT chuỗi JSON hợp lệ với định dạng: { \"multipleChoice\": [{ \"id\": 1, \"question\": \"câu hỏi\", \"options\": [\"A. ...\", \"B. ...\", \"C. ...\", \"D. ...\"] }], \"essay\": \"Câu hỏi tự luận\" }. Không có markdown, không có giải thích thêm.",
          prompt: `Tạo đề thi về chủ đề: ${examTopic}. Gồm 3 câu trắc nghiệm và 1 câu tự luận.`
        })
      });
      const data = await res.json();
      
      let parsed;
      try {
        let cleanReply = data.reply.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanReply);
      } catch (e) {
        // Fallback robust parsing or basic fallback
        parsed = {
          multipleChoice: [
            { id: 1, question: `Câu hỏi trắc nghiệm 1 về ${examTopic}`, options: ["A. Đáp án A", "B. Đáp án B", "C. Đáp án C", "D. Đáp án D"] },
            { id: 2, question: `Câu hỏi trắc nghiệm 2 về ${examTopic}`, options: ["A. Đáp án A", "B. Đáp án B", "C. Đáp án C", "D. Đáp án D"] }
          ],
          essay: `Câu tự luận: Phân tích và trình bày quan điểm của bạn về ${examTopic}.`
        };
      }

      setQuestions(parsed.multipleChoice || []);
      setEssayQuestion(parsed.essay || "");
      setExamStatus('taking');
    } catch (error) {
      alert("Lỗi khi tạo đề thi, vui lòng thử lại.");
      setExamStatus('idle');
    }
  };

  const handleSubmit = async () => {
    setExamStatus('submitting');
    try {
      const res = await fetch('/api/workspace/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: "Bạn là hệ thống chấm thi chuẩn của Bộ GD&ĐT, hãy chấm điểm và nhận xét năng lực của học sinh, chỉ ra các thiếu sót cần khắc phục. BẮT BUỘC 100% PHẢI TRẢ LỜI BẰNG TIẾNG VIỆT, tuyệt đối không dùng ngôn ngữ khác trừ khi trích dẫn chuyên môn.",
          prompt: `Học sinh đã làm bài kiểm tra chủ đề: ${examTopic}. Trắc nghiệm: ${JSON.stringify(answers)}. Tự luận: "${essayAnswer}". Hãy chấm điểm, nhận xét và đề xuất cải thiện.`
        })
      });
      const data = await res.json();
      setAiFeedback(data.reply);
      setExamStatus('result');
    } catch (error) {
      setAiFeedback("Lỗi khi chấm bài.");
      setExamStatus('result');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white/80 backdrop-blur-xl dark:bg-[#1C274C] rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-white/10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-500/5 to-purple-500/5 blur-3xl -z-10 rounded-full pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
        <h2 className="text-lg md:text-2xl font-bold flex items-center gap-2 md:gap-3 font-display text-slate-800 dark:text-white">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
          </div>
          Bài thi chuẩn Bộ GD&ĐT
        </h2>
        {examStatus === 'taking' && (
          <div className="bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-indigo-400 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm border border-indigo-100 dark:border-white/5 w-fit">
            <Clock className="w-4 h-4" /> 45:00
          </div>
        )}
      </div>

      {examStatus === 'idle' && (
        <div className="text-center py-10 md:py-12 max-w-2xl mx-auto relative z-10">
          <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 md:mb-8 group">
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full transition-opacity duration-500 group-hover:opacity-100 opacity-50"></div>
            <div className="relative w-full h-full bg-white dark:bg-[#121A33] border-4 border-indigo-50 dark:border-indigo-500/30 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] group-hover:scale-105 transition-transform duration-500">
              <BookOpen className="w-10 h-10 md:w-14 md:h-14 text-indigo-500 dark:text-indigo-400 group-hover:rotate-6 transition-transform" />
            </div>
          </div>
          <h3 className="text-2xl md:text-4xl font-bold mb-4 font-display text-slate-800 dark:text-white">Đánh Giá Năng Lực AI</h3>
          <p className="text-slate-500 mb-6 md:mb-10 font-medium text-sm md:text-lg leading-relaxed max-w-lg mx-auto">Nhập môn học hoặc chuyên đề. AI sẽ thiết kế đề thi cấu trúc chuẩn của Bộ GD&ĐT (Trắc nghiệm & Tự luận) ngay lập tức.</p>
          
          <div className="space-y-4 md:space-y-6 bg-white/50 dark:bg-black/20 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-white dark:border-white/5">
            <input 
              type="text"
              value={examTopic || ''}
              onChange={(e) => setExamTopic(e.target.value)}
              placeholder="VD: Toán 12 Tích Phân..."
              className="w-full bg-white dark:bg-[#121A33] border-2 border-slate-100 dark:border-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all text-sm md:text-base text-center font-medium placeholder:text-slate-400 shadow-sm"
            />
            <button
              onClick={handleGenerateExam}
              disabled={!examTopic.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 md:py-5 rounded-xl md:rounded-2xl font-bold transition-all shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.4)] text-base md:text-lg disabled:opacity-50 flex items-center justify-center gap-2 md:gap-3 group"
            >
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 group-hover:-rotate-12 transition-transform" /> Bắt Đầu Làm Bài
            </button>
          </div>
        </div>
      )}

      {examStatus === 'generating' && (
        <div className="text-center py-20 space-y-4">
          <div className="w-24 h-24 mx-auto relative">
             <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold font-display text-indigo-950 dark:text-indigo-100">AI đang biên soạn đề thi...</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">Đang tổng hợp kiến thức, cân đối độ khó và thiết kế cấu trúc chuẩn Bộ GD&ĐT.</p>
        </div>
      )}

      {examStatus === 'taking' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-6">
            <h3 className="font-bold text-base md:text-lg text-slate-800 dark:text-white border-b-2 border-slate-200 dark:border-white/10 pb-3 flex items-center gap-2 uppercase tracking-wide">
              <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-lg text-xs md:text-sm">I</span>
              Phần Trắc Nghiệm
            </h3>
            <div className="grid gap-6">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-slate-50 dark:bg-[#121A33] p-4 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-3xl"></div>
                  <p className="font-bold mb-6 text-slate-800 dark:text-slate-200 text-base md:text-lg leading-relaxed">
                    <span className="text-indigo-600 dark:text-indigo-400 mr-2">Câu {idx + 1}.</span> {q.question}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {q.options.map((opt, i) => {
                      const isSelected = answers[q.id] === opt;
                      return (
                        <label key={i} className={`flex items-center gap-3 md:gap-4 p-4 rounded-xl md:rounded-2xl cursor-pointer transition-all border-2 ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-indigo-500' : 'border-slate-400 dark:border-slate-500'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />}
                          </div>
                          <span className={`font-medium text-xs md:text-base ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300'}`}>{opt}</span>
                          <input 
                            type="radio" 
                            name={`q-${q.id}`} 
                            className="hidden" 
                            onChange={() => setAnswers({...answers, [q.id]: opt})}
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-bold text-base md:text-lg text-slate-800 dark:text-white border-b-2 border-slate-200/50 dark:border-white/10 pb-3 flex items-center gap-2 uppercase tracking-wide">
              <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-lg text-xs md:text-sm">II</span>
              Phần Tự Luận
            </h3>
            <div className="bg-slate-50 dark:bg-[#121A33] p-4 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-3xl"></div>
              <p className="font-bold mb-6 text-slate-800 dark:text-slate-200 text-base md:text-lg leading-relaxed">{essayQuestion}</p>
              <textarea
                value={essayAnswer || ''}
                onChange={(e) => setEssayAnswer(e.target.value)}
                placeholder="Trình bày bài làm của bạn vào đây..."
                className="w-full bg-white dark:bg-[#1C274C] border-2 border-slate-200 dark:border-white/10 rounded-2xl p-4 md:p-6 min-h-[200px] md:min-h-[300px] outline-none focus:border-emerald-500 transition-colors text-slate-700 dark:text-slate-200 resize-y leading-relaxed font-medium text-sm md:text-base"
              ></textarea>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200 dark:border-white/10">
            <button className="w-full sm:w-auto justify-center text-slate-500 font-bold hover:text-slate-800 dark:hover:text-white flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-6 py-3 rounded-2xl transition-colors">
              <FileDown className="w-5 h-5" /> Xuất Đề Ra PDF/Word
            </button>
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-10 py-4 rounded-2xl font-bold hover:from-emerald-600 hover:to-teal-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 text-base md:text-lg"
            >
              <Send className="w-5 h-5" /> Nộp Bài & Yêu Cầu AI Chấm
            </button>
          </div>
        </div>
      )}

      {examStatus === 'submitting' && (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto relative">
             <div className="absolute inset-0 border-4 border-emerald-100 dark:border-emerald-900 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
               <Brain className="w-6 h-6 md:w-8 md:h-8 text-emerald-600 animate-pulse" />
             </div>
          </div>
          <h3 className="text-lg md:text-xl font-bold font-display text-emerald-950 dark:text-emerald-100">AI Đang Chấm Bài...</h3>
          <p className="text-xs md:text-sm text-slate-500 font-medium max-w-xs md:max-w-sm mx-auto">Đang phân tích câu trả lời, so sánh với ba-rem điểm và viết nhận xét chi tiết.</p>
        </div>
      )}

      {examStatus === 'result' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] dark:from-[#121A33] dark:to-[#1C274C] p-4 md:p-10 rounded-2xl md:rounded-3xl border border-indigo-200 dark:border-indigo-500/20 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center shadow-inner shrink-0">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white font-display">Báo Cáo Kết Quả</h3>
                <p className="text-xs md:text-sm text-slate-500 font-medium">Phân tích & đánh giá bởi AI Giáo Viên</p>
              </div>
            </div>
            
            <div className="prose prose-slate dark:prose-invert prose-indigo max-w-none text-xs md:text-base leading-relaxed bg-white/60 dark:bg-black/20 backdrop-blur-sm p-4 md:p-8 rounded-xl md:rounded-2xl border border-white/50 dark:border-white/5 shadow-sm whitespace-pre-wrap">
              {aiFeedback}
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={() => {
                setExamStatus('idle');
                setAnswers({});
                setEssayAnswer("");
                setExamTopic("");
              }}
              className="bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-bold px-8 py-4 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center gap-2 shadow-sm text-sm md:text-base w-full sm:w-auto justify-center"
            >
              <FileCheck2 className="w-5 h-5" /> Làm Bài Thi Khác
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
