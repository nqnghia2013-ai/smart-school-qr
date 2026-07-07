import React, { useRef, useState } from 'react';
import { Users, User, Calendar, Trophy, Image as ImageIcon, BookOpen, FileText, ArrowLeft, Upload, Save, X, Plus, Trash2, Rocket, Stars, Crown, Compass, Award, Shield, Heart, Cpu, Sparkles, TrendingUp, Camera, CheckCircle, Zap, Search, Flame, ChevronRight, FileSpreadsheet, Presentation, ClipboardList, Bot, BrainCircuit, Video, Link as LinkIcon, Copy, Gamepad2, Download , Lock } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { getAccessToken, db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import QuizBuilder from '../components/QuizBuilder';
import QuizPlayer from '../components/QuizPlayer';

export default function DigitalClass() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { classes, currentUser, updateClass, updateUser, users, students, showToast, addUser } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any[]>([]);

  // Active UI sub-view (none, learning, honors, moments, conquests)
  const [activeSection, setActiveSection] = useState<'learning' | 'honors' | 'moments' | 'conquests' | 'ai_assistant' | 'minigames' | null>(null);

  // --- 1. GÓC HỌC TẬP (LEARNING CORNER) ---
  const [materials, setMaterials] = useState<any[]>([]);

  const [searchMaterial, setSearchMaterial] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('Tất cả');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('Tất cả');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState('Tất cả');

  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [addMaterialOpen, setAddMaterialOpen] = useState(false);
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialSubject, setNewMaterialSubject] = useState('Toán học');
  const [newMaterialType, setNewMaterialType] = useState<'doc' | 'video' | 'interactive' | 'link' | 'sheet' | 'slide' | 'form'>('doc');
  const [newMaterialGrade, setNewMaterialGrade] = useState('Lớp 9');
  const [newMaterialSemester, setNewMaterialSemester] = useState('Học kỳ 1');
  const [newMaterialUrl, setNewMaterialUrl] = useState('');
  const [newMaterialMethod, setNewMaterialMethod] = useState<'link' | 'upload'>('link');
  const [localFileName, setLocalFileName] = useState('');
  const [localFileSize, setLocalFileSize] = useState('');
  const [localFileData, setLocalFileData] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleMaterialFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalFileName(file.name);
    
    const sizeInMB = file.size / (1024 * 1024);
    const sizeStr = sizeInMB < 0.1 ? `${Math.round(file.size / 1024)} KB` : `${sizeInMB.toFixed(1)} MB`;
    setLocalFileSize(sizeStr);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      setLocalFileData(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialTitle.trim()) return;

    const newMat: any = {
      id: `mat_${Date.now()}`,
      title: newMaterialTitle,
      subject: newMaterialSubject,
      type: newMaterialMethod === 'upload' ? 'doc' : newMaterialType,
      url: newMaterialMethod === 'upload' ? (localFileData || '#') : newMaterialUrl,
      addedBy: currentUser?.fullName || 'Giáo viên bộ môn',
      date: new Date().toLocaleDateString('vi-VN'),
      grade: newMaterialGrade,
      semester: newMaterialSemester,
    };

    if (newMaterialMethod === 'upload') {
      newMat.fileName = localFileName;
      newMat.fileSize = localFileSize;
      newMat.fileData = localFileData;
    }

    setMaterials(prev => [newMat, ...prev]);
    setNewMaterialTitle('');
    setNewMaterialUrl('');
    setLocalFileName('');
    setLocalFileSize('');
    setLocalFileData('');
    setNewMaterialGrade('Lớp 9');
    setNewMaterialSemester('Học kỳ 1');
    setAddMaterialOpen(false);
  };

  const handleDeleteMaterial = (matId: string) => {
    setMaterials(prev => prev.filter(m => m.id !== matId));
    if (selectedMaterial?.id === matId) {
      setSelectedMaterial(null);
    }
    setDeleteConfirmId(null);
  };

  // --- 2. BẢNG VÀNG DANH DỰ (HONORS) ---
  const [awardOpen, setAwardOpen] = useState(false);
  const [awardStudentId, setAwardStudentId] = useState('');
  const [awardEmblem, setAwardEmblem] = useState('Ngôi sao học tập ⭐️');
  const [awardDesc, setAwardDesc] = useState('');
  const [awardBonusScore, setAwardBonusScore] = useState(10);

  const classData = classes.find(c => c.id === id);

  const handleAwardStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardStudentId || !classData) return;

    const targetStudent = classData.students?.find(hs => hs.id === awardStudentId);
    if (!targetStudent) return;

    const updatedAchievements = [...(targetStudent.achievements || [])];
    const awardString = `${awardEmblem} - ${awardDesc || 'Cố gắng vượt bậc trong học kỳ'}`;
    updatedAchievements.push(awardString);

    const updatedStudents = classData.students?.map(hs => 
      hs.id === awardStudentId 
        ? { 
            ...hs, 
            achievements: updatedAchievements, 
            trainingScore: Math.min(100, (hs.trainingScore || 100) + Number(awardBonusScore)) 
          } 
        : hs
    ) || [];

    updateClass(classData.id, { students: updatedStudents });
    
    setAwardStudentId('');
    setAwardDesc('');
    setAwardOpen(false);
    alert(`Đã trao vinh dự cho học sinh ${targetStudent.fullName} thành công!`);
  };

  // --- 3. KHOẢNH KHẮC LỚP HỌC (MOMENTS) ---
  const [moments, setMoments] = useState<any[]>([]);

  const [addMomentOpen, setAddMomentOpen] = useState(false);
  const [newMomentTitle, setNewMomentTitle] = useState('');
  const [newMomentImage, setNewMomentImg] = useState('');
  const [newMomentDate, setNewMomentDate] = useState(new Date().toLocaleDateString('vi-VN'));
  const [viewImage, setViewImage] = useState<{url: string, title: string} | null>(null);

  const handleMomentImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check max file size (60MB)
    const MAX_SIZE = 60 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert('Kích thước ảnh vượt quá 60MB!');
      return;
    }

    try {
      const compressedDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1024;
            const MAX_HEIGHT = 1024;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round(height * MAX_WIDTH / width);
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round(width * MAX_HEIGHT / height);
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              // Compress to JPEG with 0.6 quality to save space
              resolve(canvas.toDataURL('image/jpeg', 0.6));
            } else {
              resolve(event.target?.result as string);
            }
          };
          img.onerror = reject;
        };
        reader.onerror = reject;
      });
      setNewMomentImg(compressedDataUrl);
    } catch (err) {
      console.error("Error compressing image:", err);
      alert('Có lỗi xảy ra khi xử lý ảnh.');
    }
  };

  const handleAddMoment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMomentTitle.trim() || !newMomentImage) return;

    const newMom = {
      id: `mom_${Date.now()}`,
      title: newMomentTitle,
      imageUrl: newMomentImage,
      date: newMomentDate || new Date().toLocaleDateString('vi-VN'),
      uploader: currentUser?.fullName || 'Giáo viên chủ nhiệm'
    };

    setMoments(prev => [newMom, ...prev]);
    setNewMomentTitle('');
    setNewMomentImg('');
    setAddMomentOpen(false);
  };

  // --- 4. CHINH PHỤC THỬ THÁCH (QUESTS) ---
  const [quests, setQuests] = useState<any[]>([]);
  const [addQuestOpen, setAddQuestOpen] = useState(false);
  const [activeQuizQuest, setActiveQuizQuest] = useState<any>(null);
  const [activeStatsQuest, setActiveStatsQuest] = useState<any>(null);

  const handleQuizFinish = (questId: string, correct: number, incorrect: number, timeTaken: number) => {
    if (!currentUser || !classData) return;
    
    const studentIdOfUser = classData.students?.find(s => s.userId === currentUser.id)?.id || classData.students?.[0]?.id;
    if (!studentIdOfUser) return;
    
    // Find the quest and calculate if it was completed
    const questIdx = quests.findIndex(q => q.id === questId);
    if (questIdx === -1) return;
    
    const quest = quests[questIdx];
    
    const result = {
      studentId: studentIdOfUser,
      studentName: currentUser.fullName,
      timeTaken,
      correctCount: correct,
      incorrectCount: incorrect,
      date: new Date().toISOString()
    };
    
    const updatedQuests = [...quests];
    const newQuest = { ...quest };
    if (!newQuest.results) newQuest.results = [];
    
    // Check if student already did it
    const existingIdx = newQuest.results.findIndex((r: any) => r.studentId === studentIdOfUser);
    if (existingIdx !== -1) {
      newQuest.results[existingIdx] = result;
    } else {
      newQuest.results.push(result);
    }
    
    if (!newQuest.completedBy) newQuest.completedBy = [];
    if (!newQuest.completedBy.includes(studentIdOfUser)) {
      newQuest.completedBy.push(studentIdOfUser);
      
      // Award points (coins) for completion
      const userDoc = users.find(u => u.id === currentUser.id);
      if (userDoc) {
        updateUser(currentUser.id, { coins: (userDoc.coins || 0) + 10 });
      }
    }
    
    updatedQuests[questIdx] = newQuest;
    setQuests(updatedQuests);
    setActiveQuizQuest(null);
  };

  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestDesc, setNewQuestDesc] = useState('');
  const [newQuestSubject, setNewQuestSubject] = useState('Toán học');
  const [newQuestDueDate, setNewQuestDueDate] = useState('');
  const [newQuestPoints, setNewQuestPoints] = useState(10);
  const [newQuestType, setNewQuestType] = useState<'link' | 'quiz'>('link');
  const [newQuestUrl, setNewQuestUrl] = useState('');
  const [newQuestTimeLimit, setNewQuestTimeLimit] = useState(15);
  const [newQuestQuestions, setNewQuestQuestions] = useState<any[]>([]);

  const handleAddQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestTitle.trim()) return;

    const newQ: any = {
      id: `q_${Date.now()}`,
      title: newQuestTitle,
      description: newQuestDesc,
      subject: newQuestSubject,
      dueDate: newQuestDueDate || new Date().toLocaleDateString('vi-VN'),
      points: Number(newQuestPoints) || 10,
      type: newQuestType,
      results: [],
      completedBy: []
    };

    if (newQuestType === 'link') {
      newQ.url = newQuestUrl;
    } else if (newQuestType === 'quiz') {
      newQ.timeLimit = Number(newQuestTimeLimit) || 15;
      newQ.quizData = newQuestQuestions;
    }

    setQuests(prev => [newQ, ...prev]);
    setNewQuestTitle('');
    setNewQuestDesc('');
    setNewQuestDueDate('');
    setNewQuestUrl('');
    setNewQuestQuestions([]);
    setAddQuestOpen(false);
  };

  const handleToggleQuestComplete = (questId: string) => {
    if (!classData) return;
    const studentIdOfUser = classData.students?.find(s => s.userId === currentUser?.id)?.id || classData.students?.[0]?.id;

    if (!studentIdOfUser) {
      alert("Bạn cần thuộc về danh sách học sinh của chi đội lớp học này để thực hiện nhiệm vụ chinh phục.");
      return;
    }

    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        const isCompleted = q.completedBy.includes(studentIdOfUser);
        let updatedCompletedBy = [...q.completedBy];
        
        if (isCompleted) {
          updatedCompletedBy = updatedCompletedBy.filter(uId => uId !== studentIdOfUser);
          
          const updatedStudents = classData.students?.map(hs => 
            hs.id === studentIdOfUser 
              ? { ...hs, trainingScore: Math.max(0, (hs.trainingScore || 100) - q.points) } 
              : hs
          ) || [];
          updateClass(classData.id, { students: updatedStudents });
        } else {
          updatedCompletedBy.push(studentIdOfUser);
          
          const updatedStudents = classData.students?.map(hs => 
            hs.id === studentIdOfUser 
              ? { ...hs, trainingScore: Math.min(100, (hs.trainingScore || 100) + q.points) } 
              : hs
          ) || [];
          updateClass(classData.id, { students: updatedStudents });
        }
        
        return { ...q, completedBy: updatedCompletedBy };
      }
      return q;
    }));
  };

  const isWritingRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dbDataString, setDbDataString] = useState('');

  // Sync state data from Firestore
  React.useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'classExtras', id), snap => {
      if (isWritingRef.current) return;
      if (snap.exists()) {
        const d = snap.data();
        const fetchedMaterials = d.materials || [];
        const fetchedMoments = d.moments || [];
        const fetchedQuests = d.quests || [];
        
        setMaterials(fetchedMaterials);
        setMoments(fetchedMoments);
        setQuests(fetchedQuests);
        setDbDataString(JSON.stringify({ materials: fetchedMaterials, moments: fetchedMoments, quests: fetchedQuests }));
      }
      setIsLoaded(true);
    });
    return unsub;
  }, [id]);

  // Sync state data to Firestore
  React.useEffect(() => {
    if (isLoaded && id) {
      const currentDataString = JSON.stringify({ materials, moments, quests });
      if (currentDataString !== dbDataString) {
        isWritingRef.current = true;
        setDoc(doc(db, 'classExtras', id), JSON.parse(currentDataString), { merge: true })
          .finally(() => { 
            setDbDataString(currentDataString);
            setTimeout(() => { isWritingRef.current = false; }, 500);
          });
      }
    }
  }, [materials, moments, quests, isLoaded, id, dbDataString]);

  if (!classData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Users className="w-20 h-20 mb-4 text-slate-300 animate-bounce" />
        <h2 className="text-2xl font-bold text-slate-700">Trạm không gian báo lỗi</h2>
        <p>Lớp học không tồn tại hoặc đã được di chuyển</p>
        <button onClick={() => navigate('/lop-hoc-so')} className="mt-6 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-lg">Quay lại danh sách</button>
      </div>
    );
  }

  // Define schedule fallback if empty
  const schedule = (classData.schedule && classData.schedule.length > 0) ? classData.schedule : [
    { day: 'Thứ 2', morning: ['Chào cờ', 'Toán', 'Văn'], afternoon: ['Sinh học'] },
    { day: 'Thứ 3', morning: ['Tiếng Anh', 'Lịch sử', 'Địa lý'], afternoon: ['Thể dục'] },
    { day: 'Thứ 4', morning: ['Toán', 'Hóa học', 'Mỹ thuật'], afternoon: ['Văn'] },
    { day: 'Thứ 5', morning: ['Vật lý', 'Toán', 'Tiếng Anh'], afternoon: ['Công nghệ'] },
    { day: 'Thứ 6', morning: ['Văn', 'Văn', 'GDCD'], afternoon: ['Sinh hoạt'] },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true }); showToast('Tải tài liệu thành công', 'success');
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        const rawData = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
        
        let nameIdx = 1; 
        let dobIdx = 2;  
        let dataStartIndex = 1;
        
        for (let i = 0; i < Math.min(10, rawData.length); i++) {
          const row = rawData[i];
          if (!row) continue;
          
          const rowStr = JSON.stringify(row).toLowerCase();
          if (rowStr.includes('họ') || rowStr.includes('tên') || rowStr.includes('name')) {
            dataStartIndex = i + 1;
            for (let j = 0; j < row.length; j++) {
              const cellStr = String(row[j] || '').toLowerCase();
              if (cellStr.includes('tên') || cellStr.includes('name')) nameIdx = j;
              if (cellStr.includes('ngày') || cellStr.includes('sinh') || cellStr.includes('dob')) dobIdx = j;
            }
            break;
          }
        }

        const newStudents: any[] = [];
        let index = 0;
        
        for (let i = dataStartIndex; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || row.length === 0) continue;
          
          let fullName = row[nameIdx];
          let dobVal = row[dobIdx];
          
          if (!fullName || typeof fullName !== 'string' || fullName.trim().length <= 1) {
            const possibleName = row.find(val => typeof val === 'string' && val.trim().length > 3 && !val.match(/^\d/));
            if (possibleName) {
              fullName = possibleName;
            } else {
              continue; 
            }
          }
          
          let dob = '01/01/2010';
          if (dobVal instanceof Date) {
            dob = dobVal.toLocaleDateString('vi-VN');
          } else if (dobVal) {
            dob = String(dobVal);
          }

          fullName = String(fullName).trim();
          
          const safeName = fullName.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(' ').pop()?.toLowerCase();
          const username = `${classData.name.toLowerCase()}_${safeName || 'hs'}${Date.now().toString().slice(-4)}${index}`;
          const password = Math.random().toString(36).slice(-6); 
          
          const userId = addUser({
            fullName,
            role: 'student',
            username,
            password,
            assignedClassId: classData.id
          });

          newStudents.push({
            id: `hs_${Date.now()}_${index}`,
            fullName,
            dob,
            classId: classData.id,
            achievements: [],
            trainingScore: 100,
            certificates: [],
            userId
          });
          
          index++;
        }

        if (newStudents.length === 0) {
          alert('Không tìm thấy dữ liệu học sinh hợp lệ.');
          return;
        }

        const currentStudents = classData.students || [];
        const updatedStudents = [...currentStudents, ...newStudents];
        
        updateClass(classData.id, { 
          students: updatedStudents,
          studentsCount: updatedStudents.length 
        });

        alert(`Đã tải lên và cấp tài khoản cho ${newStudents.length} học sinh thành công!`);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra khi đọc file Excel.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const isTeacherOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  const [isCreatingMeet, setIsCreatingMeet] = useState(false);
  const [meetLink, setMeetLink] = useState('');

  const handleCreateMeet = async () => {
    try {
      setIsCreatingMeet(true);
      const token = getAccessToken();
      if (!token) {
        alert("Vui lòng đăng nhập bằng Google để sử dụng tính năng tạo Google Meet.");
        return;
      }
      
      const response = await fetch('https://meet.googleapis.com/v2/spaces', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            accessType: 'OPEN',
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Lỗi khi tạo Google Meet');
      }
      
      const data = await response.json();
      setMeetLink(data.meetingUri);
      
      // Save it to class schedule or announcements so students can join.
      const newAnnouncement = {
        id: `ann_${Date.now()}`,
        title: 'Phòng học trực tuyến Google Meet đã mở',
        content: `Link tham gia: ${data.meetingUri}`,
        date: new Date().toLocaleDateString('vi-VN'),
        teacher: currentUser?.fullName || '',
        link: data.meetingUri
      };
      
      const updatedAnnouncements = [newAnnouncement, ...(classData.announcements || [])];
      updateClass(classData.id, { announcements: updatedAnnouncements });
      
    } catch (err) {
      console.error(err);
      alert('Không thể tạo phòng Google Meet. Vui lòng kiểm tra lại quyền truy cập.');
    } finally {
      setIsCreatingMeet(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 relative">
      
      {/* Back button */}
      <motion.button 
        whileHover={{ x: -5 }}
        onClick={() => navigate('/lop-hoc-so')}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors z-20 relative"
      >
        <ArrowLeft className="w-4 h-4" /> Bảng điều khiển trung tâm
      </motion.button>

      {/* Hero Banner */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/10 shadow-2xl mt-4">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2000&auto=format&fit=crop" alt="bg" className="w-full h-full object-cover opacity-40 mix-blend-screen" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/30 rounded-full blur-[120px] pointer-events-none"></div>
        </div>

        <div className="relative z-10 px-8 py-12 md:px-12 md:py-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="p-2 bg-indigo-500/30 backdrop-blur-md rounded-xl border border-indigo-400/50 animate-pulse-slow">
                <Compass className="w-6 h-6 text-indigo-300" />
              </div>
              <span className="text-indigo-300 font-bold tracking-widest uppercase text-sm">Không Gian Lớp Học</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-display font-black text-white tracking-tight mb-4 drop-shadow-lg"
            >
              {classData.name}
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 text-slate-200 font-medium"
            >
              <div className="flex flex-col bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                <span className="text-xs uppercase tracking-wider text-indigo-200">Sĩ Số</span>
                <span className="text-xl font-bold flex items-center gap-2"><Users className="w-4 h-4"/> {classData.studentsCount}</span>
              </div>
              <div className="flex flex-col bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                <span className="text-xs uppercase tracking-wider text-amber-200">Giáo Viên Chủ Nhiệm</span>
                <span className="text-xl font-bold flex items-center gap-2"><Crown className="w-4 h-4 text-amber-400"/> {classData.teacher}</span>
              </div>
            </motion.div>
          </div>
          
          {isTeacherOrAdmin && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
               <input
                  type="file"
                  accept=".xlsx, .xls, .doc, .docx"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
               />
               <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative overflow-hidden flex items-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-black shadow-lg hover:shadow-emerald-500/50 transition-all hover:-translate-y-1"
                  title="Tải lên danh sách học sinh từ file Excel"
               >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <Upload className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Tải lên danh sách Excel</span>
               </button>
               <button 
                  onClick={handleCreateMeet}
                  disabled={isCreatingMeet}
                  className="group relative overflow-hidden flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black shadow-lg hover:shadow-indigo-500/50 transition-all hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
               >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <Video className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">{isCreatingMeet ? 'Đang kích hoạt...' : 'Mở Google Meet'}</span>
               </button>
               {meetLink && (
                  <a 
                    href={meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-4 bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 rounded-2xl text-sm font-bold shadow-inner hover:bg-indigo-500/30 transition-colors"
                  >
                     <LinkIcon className="w-5 h-5" /> Tham gia
                  </a>
               )}
            </motion.div>
          )}
        </div>
        
        <Stars className="absolute top-10 right-20 w-8 h-8 text-yellow-300 animate-float opacity-70" />
      </div>

      <div className="space-y-8 mt-8">
        
        {classData.announcements && classData.announcements.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-lg border border-white/20 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
             <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner text-white">
                   <Video className="w-6 h-6 animate-pulse" />
                </div>
                <div className="text-white">
                   <h3 className="font-black text-lg drop-shadow-md tracking-tight">{classData.announcements[0].title}</h3>
                   <p className="text-sm text-indigo-100 font-medium">Bởi: {classData.announcements[0].teacher} • {classData.announcements[0].date}</p>
                </div>
             </div>
             
             {classData.announcements[0].link && (
                <a 
                  href={classData.announcements[0].link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="relative z-10 group flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold transition-all shadow-md hover:shadow-xl hover:-translate-y-1"
                >
                   Tham gia phòng <LinkIcon className="w-4 h-4 group-hover:-rotate-12 transition-transform"/>
                </a>
             )}
          </div>
        )}

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSection('learning')}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-[2px] shadow-lg cursor-pointer transition-all duration-300 hover:shadow-indigo-500/20"
          >
            <div className="bg-slate-900 dark:bg-white rounded-[22px] p-6 h-full overflow-hidden relative group transition-colors duration-500">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 dark:bg-blue-100 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 text-center flex flex-col items-center">
                <div className="p-4 bg-blue-500/20 dark:bg-blue-50 text-blue-400 dark:text-blue-600 rounded-2xl mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 shadow-inner">
                  <BookOpen className="w-8 h-8 font-black" />
                </div>
                <h3 className="font-black text-xl text-white dark:text-slate-800 mb-2 transition-colors duration-500">Góc Học Tập</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 transition-colors duration-500">Tài liệu, đề cương, bài giảng của các môn học.</p>
                <span className="mt-4 text-xs font-bold text-indigo-400 dark:text-indigo-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">Khám phá ngay <ChevronRight className="w-3.5 h-3.5"/></span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSection('honors')}
            className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-[2px] shadow-lg cursor-pointer transition-all duration-300 hover:shadow-amber-500/20"
          >
            <div className="bg-slate-900 dark:bg-white rounded-[22px] p-6 h-full overflow-hidden relative group transition-colors duration-500">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/20 dark:bg-amber-100 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 text-center flex flex-col items-center">
                <div className="p-4 bg-amber-500/20 dark:bg-amber-50 text-amber-400 dark:text-amber-600 rounded-2xl mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-500 shadow-inner">
                  <Trophy className="w-8 h-8 font-black" />
                </div>
                <h3 className="font-black text-xl text-white dark:text-slate-800 mb-2 transition-colors duration-500">Bảng Vàng</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 transition-colors duration-500">Vinh danh học sinh giỏi, phong trào thi đua.</p>
                <span className="mt-4 text-xs font-bold text-amber-400 dark:text-amber-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">Vinh danh lớp <ChevronRight className="w-3.5 h-3.5"/></span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSection('moments')}
            className="bg-gradient-to-br from-pink-400 to-rose-500 rounded-3xl p-[2px] shadow-lg cursor-pointer transition-all duration-300 hover:shadow-rose-500/20"
          >
            <div className="bg-slate-900 dark:bg-white rounded-[22px] p-6 h-full overflow-hidden relative group transition-colors duration-500">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/20 dark:bg-rose-100 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 text-center flex flex-col items-center">
                <div className="p-4 bg-rose-500/20 dark:bg-rose-50 text-rose-400 dark:text-rose-600 rounded-2xl mb-4 group-hover:bg-rose-500 group-hover:text-white transition-colors duration-500 shadow-inner">
                  <ImageIcon className="w-8 h-8 font-black" />
                </div>
                <h3 className="font-black text-xl text-white dark:text-slate-800 mb-2 transition-colors duration-500">Khoảnh Khắc</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 transition-colors duration-500">Lưu giữ hình ảnh sinh hoạt của tập thể.</p>
                <span className="mt-4 text-xs font-bold text-rose-400 dark:text-rose-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">Xem ảnh tập thể <ChevronRight className="w-3.5 h-3.5"/></span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -6, scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSection('conquests')}
            className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl p-[2px] shadow-lg cursor-pointer transition-all duration-300 hover:shadow-cyan-500/20"
          >
            <div className="bg-slate-900 dark:bg-white rounded-[22px] p-6 h-full overflow-hidden relative group transition-colors duration-500">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/20 dark:bg-cyan-100 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 text-center flex flex-col items-center">
                <div className="p-4 bg-cyan-500/20 dark:bg-cyan-50 text-cyan-400 dark:text-cyan-600 rounded-2xl mb-4 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-500 shadow-inner">
                  <Rocket className="w-8 h-8 font-black" />
                </div>
                <h3 className="font-black text-xl text-white dark:text-slate-800 mb-2 transition-colors duration-500">Chinh Phục</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 transition-colors duration-500">Kế hoạch các bài kiểm tra sắp tới trong tuần.</p>
                <span className="mt-4 text-xs font-bold text-cyan-400 dark:text-cyan-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">Trung tâm nhiệm vụ <ChevronRight className="w-3.5 h-3.5"/></span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Schedule */}
        <div className="bg-slate-900 dark:bg-white rounded-3xl shadow-xl border border-slate-800 dark:border-slate-100 overflow-hidden mt-8 relative transition-colors duration-500">
          <div className="px-8 py-5 border-b border-slate-800 dark:border-slate-100 flex items-center justify-between bg-slate-800/50 dark:bg-slate-50/50 transition-colors duration-500">
              <div className="flex items-center gap-3 font-display font-black text-white dark:text-slate-800 text-lg transition-colors duration-500">
                <Calendar className="w-6 h-6 text-indigo-400 dark:text-indigo-500" />
                Lịch Trình Không Gian Tuần Này
              </div>
              {isTeacherOrAdmin && !isEditingSchedule && (
                <button 
                  onClick={() => {
                    setEditingSchedule([...schedule.map(d => ({ ...d, morning: [...d.morning], afternoon: [...d.afternoon] }))]);
                    setIsEditingSchedule(true);
                  }}
                  className="px-4 py-2 text-sm font-bold bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  Điều chỉnh lịch trình
                </button>
              )}
              {isTeacherOrAdmin && isEditingSchedule && (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsEditingSchedule(false)}
                    className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      updateClass(classData.id, { schedule: editingSchedule });
                      setIsEditingSchedule(false);
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg transition-all"
                  >
                    <Save className="w-4 h-4" /> Xác nhận lưu
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-8 overflow-x-auto bg-slate-800/30 dark:bg-slate-50/30 relative transition-colors duration-500">
              <div className="flex gap-4 min-w-[800px]">
                {(isEditingSchedule ? editingSchedule : schedule).map((day, idx) => (
                  <div key={idx} className="flex-1 bg-slate-900 dark:bg-white rounded-2xl p-4 border border-slate-700/60 dark:border-slate-200/60 shadow-sm flex flex-col relative overflow-hidden group transition-colors duration-500">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <h4 className="text-center font-black text-white dark:text-slate-800 mb-4 text-base tracking-wide bg-slate-800 dark:bg-slate-50 py-2 rounded-xl border border-slate-700 dark:border-slate-100 transition-colors duration-500">{day.day}</h4>
                    
                    <div className="mb-4 flex-1 flex flex-col">
                       <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-400"></div> Ca Sáng</span>
                       <div className="space-y-2 flex-1 relative z-10">
                       {day.morning?.map((sub: string, i: number) => (
                         <div key={`m-${i}`} className="flex gap-1 group/item relative">
                           {isEditingSchedule ? (
                             <>
                               <input 
                                 type="text" 
                                 value={sub || ""} 
                                 onChange={(e) => {
                                   const newS = [...editingSchedule];
                                   newS[idx].morning[i] = e.target.value;
                                   setEditingSchedule(newS);
                                 }}
                                 className="flex-1 w-full min-w-0 bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 text-center text-sm font-bold text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                               />
                               <button 
                                 onClick={() => {
                                   const newS = [...editingSchedule];
                                   newS[idx].morning.splice(i, 1);
                                   setEditingSchedule(newS);
                                 }}
                                 className="text-rose-400 hover:text-white p-2 shrink-0 bg-white hover:bg-rose-500 border border-slate-200 rounded-xl transition-colors"
                                 title="Xóa tiết học"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </>
                           ) : (
                             <div className="bg-gradient-to-br from-indigo-50 to-blue-50 w-full border border-indigo-100/50 rounded-xl p-3 text-center text-sm font-bold text-indigo-900 shadow-sm transition-transform hover:-translate-y-0.5">
                               {sub || '-'}
                             </div>
                           )}
                         </div>
                       ))}
                       {isEditingSchedule && (
                         <button 
                           onClick={() => {
                             const newS = [...editingSchedule];
                             newS[idx].morning.push('');
                             setEditingSchedule(newS);
                           }}
                           className="w-full flex items-center justify-center gap-2 mt-3 text-sm font-bold py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors border-2 border-dashed border-slate-300"
                         >
                           <Plus className="w-4 h-4" /> Thêm tiết
                         </button>
                       )}
                     </div>
                  </div>

                  <div className="pt-4 border-t-2 border-dashed border-slate-100 flex-1 flex flex-col relative z-10">
                     <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 block flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Ca Chiều</span>
                     <div className="space-y-2 flex-1">
                       {day.afternoon?.map((sub: string, i: number) => (
                         <div key={`a-${i}`} className="flex gap-1 group/item relative">
                           {isEditingSchedule ? (
                             <>
                               <input 
                                 type="text" 
                                 value={sub || ""} 
                                 onChange={(e) => {
                                   const newS = [...editingSchedule];
                                   newS[idx].afternoon[i] = e.target.value;
                                   setEditingSchedule(newS);
                                 }}
                                 className="flex-1 w-full min-w-0 bg-amber-50 border-2 border-amber-200 rounded-xl p-2.5 text-center text-sm font-bold text-amber-900 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all"
                               />
                               <button 
                                 onClick={() => {
                                   const newS = [...editingSchedule];
                                   newS[idx].afternoon.splice(i, 1);
                                   setEditingSchedule(newS);
                                 }}
                                 className="text-rose-400 hover:text-white p-2 shrink-0 bg-white hover:bg-rose-500 border border-amber-200 rounded-xl transition-colors"
                                 title="Xóa tiết học"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </>
                           ) : (
                             <div className="bg-gradient-to-br from-amber-50 to-orange-50 w-full border border-amber-100/50 rounded-xl p-3 text-center text-sm font-bold text-amber-900 shadow-sm transition-transform hover:-translate-y-0.5">
                               {sub || '-'}
                             </div>
                           )}
                         </div>
                       ))}
                       {isEditingSchedule && (
                         <button 
                           onClick={() => {
                             const newS = [...editingSchedule];
                             newS[idx].afternoon.push('');
                             setEditingSchedule(newS);
                           }}
                           className="w-full flex items-center justify-center gap-2 mt-3 text-sm font-bold py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl transition-colors border-2 border-dashed border-amber-200"
                         >
                           <Plus className="w-4 h-4" /> Thêm tiết
                         </button>
                       )}
                     </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>

      {/* Student List Section */}
      <div className="bg-slate-900 dark:bg-white rounded-3xl shadow-xl border border-slate-800 dark:border-slate-100 overflow-hidden mt-8 relative z-10 transition-colors duration-500">
        <div className="px-8 py-5 border-b border-slate-800 dark:border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-50 dark:to-white transition-colors duration-500">
          <div className="flex items-center gap-3 font-display font-black text-white dark:text-slate-800 text-xl transition-colors duration-500">
            <Users className="w-6 h-6 text-emerald-400 dark:text-emerald-500" />
            Hồ Sơ Phi Hành Đoàn ({classData.students?.length || 0})
          </div>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-slate-400 dark:text-slate-400 text-xs font-black uppercase tracking-widest px-4 transition-colors duration-500">
                <th className="p-4 text-center w-16">ID</th>
                <th className="p-4">Họ và tên học sinh</th>
                <th className="p-4">Ngày sinh</th>
                {isTeacherOrAdmin && (
                  <>
                    <th className="p-4">Tài khoản</th>
                    <th className="p-4">Khóa mật khẩu</th>
                  </>
                )}
                <th className="p-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {(!classData.students || classData.students.length === 0) ? (
                <tr>
                  <td colSpan={isTeacherOrAdmin ? 6 : 4} className="p-12 text-center">
                    <div className="flex flex-col items-center text-slate-400">
                       <Users className="w-12 h-12 mb-3 opacity-20" />
                       <p className="font-medium text-lg">Khoang tập thể đang trống.</p>
                       <p className="text-sm">Hãy thêm sinh viên để bắt đầu hành trình số.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                classData.students.map((hs: any, idx: number) => {
                  const globalStudent = students.find(s => s.id === hs.id) || hs;
                  const userAccount = users.find(u => u.id === globalStudent.userId) || {};
                  const parentUser = users.find(u => u.role === 'parent' && u.linkedStudentId === globalStudent.id);
                  return (
                    <tr key={`${hs.id}_${idx}`} className="group bg-slate-800 dark:bg-slate-50 hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors duration-500 rounded-2xl">
                      <td className="p-4 text-slate-400 dark:text-slate-400 text-sm font-bold text-center rounded-l-2xl">{(idx + 1).toString().padStart(2, '0')}</td>
                      <td className="p-4 font-black text-white dark:text-slate-800 text-base group-hover:text-indigo-400 dark:group-hover:text-indigo-600 transition-colors duration-500">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-indigo-500/20 dark:bg-indigo-100 text-indigo-400 dark:text-indigo-600 flex items-center justify-center font-bold text-xs transition-colors duration-500">{(globalStudent.fullName || 'H').charAt(0)}</div>
                           <div>
                             <div>{globalStudent.fullName}</div>
                             {parentUser && (
                               <div className="text-xs text-emerald-400 dark:text-emerald-600 font-medium mt-0.5 flex items-center gap-1 transition-colors duration-500">
                                 <User className="w-3 h-3" /> PH: {parentUser.fullName}
                               </div>
                             )}
                           </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 dark:text-slate-500 font-medium text-sm transition-colors duration-500">{globalStudent.dob}</td>
                      {isTeacherOrAdmin && (
                        <>
                          <td className="p-4">
                            <span className="px-3 py-1.5 bg-slate-700 dark:bg-white border border-slate-600 dark:border-slate-200 rounded-lg text-slate-300 dark:text-slate-600 font-mono text-xs font-bold shadow-sm transition-colors duration-500">{userAccount.username || '-'}</span>
                          </td>
                          <td className="p-4">
                            <span className="px-3 py-1.5 bg-slate-700 dark:bg-white border border-slate-600 dark:border-slate-200 rounded-lg text-slate-300 dark:text-slate-600 font-mono text-xs font-bold shadow-sm transition-colors duration-500">{userAccount.password || '-'}</span>
                          </td>
                        </>
                      )}
                      <td className="p-4 text-center rounded-r-2xl">
                        <button 
                          onClick={() => navigate(`/ho-so-hoc-sinh/${globalStudent.id}`)}
                          className="px-5 py-2.5 bg-white/50 border-2 border-indigo-100 text-indigo-600 text-sm font-black rounded-xl hover:bg-indigo-600 hover:text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
                        >
                          Mở hồ sơ
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
     </div>

      {/* --- POP-UP MODAL OVERLAYS FOR THE 4 MAJOR CLASSROOM SECTIONS --- */}
      <AnimatePresence>
        {activeSection && classData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setActiveSection(null);
                setSelectedMaterial(null);
              }
            }}
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-slate-50 rounded-[2.5rem] w-full max-w-6xl h-[88vh] overflow-hidden flex flex-col shadow-2xl border border-white/20 relative"
            >
              
              {/* ========================================================
                  1. GÓC HỌC TẬP (LEARNING CORNER) INTERFACE
                  ======================================================== */}
              {activeSection === 'learning' && (
                <div className="flex-1 flex flex-col overflow-hidden h-full">
                  {/* Modal Header */}
                  <div className="bg-white px-8 py-5 border-b border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="font-display font-black text-slate-800 text-xl flex items-center gap-2">
                          Góc Học Tập Không Gian
                          <span className="text-[10px] bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-black uppercase">CHUYÊN CHẤT LƯỢNG</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">Kho tàng học liệu số, đề cương ôn thi học kỳ và giáo án tham khảo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isTeacherOrAdmin && (
                        <button
                          onClick={() => setAddMaterialOpen(true)}
                          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm px-5 py-2.5 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all"
                        >
                          <Plus className="w-4 h-4" /> Đăng học liệu mới
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setActiveSection(null);
                          setSelectedMaterial(null);
                        }}
                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Body layout */}
                  <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar filters */}
                    <div className="w-60 bg-white border-r border-slate-100 p-5 space-y-1 overflow-y-auto shrink-0 hidden md:block">
                      <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-3">MÔN HỌC CHUYÊN ĐỀ</span>
                      {['Tất cả', 'Toán học', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học', 'Khoa học tự nhiên', 'Lịch sử & Địa lý', 'Tin học'].map((sub) => {
                        const isActive = selectedSubjectFilter === sub;
                        const matCount = materials.filter(m => sub === 'Tất cả' || m.subject === sub).length;
                        return (
                          <button
                            key={sub}
                            onClick={() => {
                              setSelectedSubjectFilter(sub);
                              setSelectedMaterial(null);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-between ${
                              isActive 
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm border-l-4 border-indigo-600' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                          >
                            <span>{sub}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${isActive ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-50 text-slate-400'}`}>
                              {matCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Main Section */}
                    {selectedMaterial ? (
                      /* Resource integrated viewer */
                      <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
                        <div className="bg-slate-850 px-6 py-4 border-b border-slate-800 flex items-center justify-between text-white">
                          <div className="overflow-hidden mr-4">
                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">{selectedMaterial.subject}</span>
                            <h3 className="font-bold text-sm truncate text-white">{selectedMaterial.title}</h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setSelectedMaterial(null)}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-lg transition-all"
                            >
                              Thoát Trình Xem
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 p-6 flex justify-center items-center relative">
                          {selectedMaterial.fileData ? (
                            selectedMaterial.fileData.startsWith('data:image/') ? (
                              <div className="overflow-auto max-w-full max-h-full rounded-2xl bg-white p-3 border border-slate-700 shadow-xl">
                                <img src={selectedMaterial.fileData} alt={selectedMaterial.title} className="max-h-[60vh] object-contain" referrerPolicy="no-referrer" />
                              </div>
                            ) : (
                              <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 shadow-2xl space-y-6">
                                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl w-max mx-auto shadow-inner">
                                  <FileText className="w-12 h-12" />
                                </div>
                                <div>
                                  <h4 className="font-black text-slate-800 text-lg">{selectedMaterial.fileName || selectedMaterial.title}</h4>
                                  <p className="text-xs text-slate-400 mt-2">Dung lượng tệp: {selectedMaterial.fileSize || 'Không xác định'} • Khóa học lớp 9A</p>
                                </div>
                                <a
                                  href={selectedMaterial.fileData}
                                  download={selectedMaterial.fileName || 'hoc-lieu-9a'}
                                  className="inline-flex items-center justify-center gap-2 w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-indigo-500/20"
                                >
                                  <Save className="w-4 h-4" /> Tải học liệu xuống thiết bị
                                </a>
                              </div>
                            )
                          ) : (
                            <iframe
                              src={selectedMaterial.url}
                              className="w-full h-full rounded-2xl border border-slate-800 bg-white"
                              allow="autoplay"
                              title={selectedMaterial.title}
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Search and materials lists grid with Multi-grade and Semester divisions */
                      <div className="flex-1 p-6 overflow-y-auto space-y-6 relative">
                        
                        {/* Search and Advanced Filters */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                          {/* Search box */}
                          <div className="relative w-full">
                            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Tìm kiếm tài liệu học tập, slide, đề ôn..."
                              value={searchMaterial || ''}
                              onChange={(e) => setSearchMaterial(e.target.value)}
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium"
                            />
                          </div>

                          {/* Multi-grade and Semester Toggle filters */}
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                            {/* Grades Filter */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1">Phân hệ lớp:</span>
                              {['Tất cả', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'].map((gr) => {
                                const isSel = selectedGradeFilter === gr;
                                return (
                                  <button
                                    key={gr}
                                    onClick={() => setSelectedGradeFilter(gr)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                      isSel 
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10' 
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                    }`}
                                  >
                                    {gr}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Semester Filter */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1">Học kỳ:</span>
                              {['Tất cả', 'Học kỳ 1', 'Học kỳ 2'].map((sem) => {
                                const isSel = selectedSemesterFilter === sem;
                                return (
                                  <button
                                    key={sem}
                                    onClick={() => setSelectedSemesterFilter(sem)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                      isSel 
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10' 
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                    }`}
                                  >
                                    {sem}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Materials Grid */}
                        {(() => {
                          const list = materials.filter(m => {
                            const subMatch = selectedSubjectFilter === 'Tất cả' || m.subject === selectedSubjectFilter;
                            const gradeMatch = selectedGradeFilter === 'Tất cả' || m.grade === selectedGradeFilter;
                            const semesterMatch = selectedSemesterFilter === 'Tất cả' || m.semester === selectedSemesterFilter;
                            const title = m.title || '';
                            const search = searchMaterial || '';
                            const textMatch = title.toLowerCase().includes(search.toLowerCase());
                            return subMatch && gradeMatch && semesterMatch && textMatch;
                          });

                          if (list.length === 0) {
                            return (
                              <div className="py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center p-8">
                                <BookOpen className="w-16 h-16 text-slate-200 mb-4" />
                                <p className="font-black text-slate-700 text-lg">Chưa tìm thấy học liệu phù hợp</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm">Hãy thử điều chỉnh lại khối lớp, môn học hoặc bộ lọc tìm kiếm nhé!</p>
                              </div>
                            );
                          }

                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                              {list.map((m) => {
                                let iconColor = 'bg-blue-50 text-blue-600';
                                let matIcon = <FileText className="w-6 h-6" />;
                                if (m.type === 'video') {
                                  iconColor = 'bg-rose-50 text-rose-600';
                                  matIcon = <Camera className="w-6 h-6" />;
                                } else if (m.type === 'interactive') {
                                  iconColor = 'bg-teal-50 text-teal-600';
                                  matIcon = <Cpu className="w-6 h-6" />;
                                } else if (m.type === 'sheet' || m.url?.includes('spreadsheets')) {
                                  iconColor = 'bg-emerald-50 text-emerald-600';
                                  matIcon = <FileSpreadsheet className="w-6 h-6" />;
                                } else if (m.type === 'slide' || m.url?.includes('presentation')) {
                                  iconColor = 'bg-amber-50 text-amber-600';
                                  matIcon = <Presentation className="w-6 h-6" />;
                                } else if (m.type === 'form' || m.url?.includes('forms')) {
                                  iconColor = 'bg-purple-50 text-purple-600';
                                  matIcon = <ClipboardList className="w-6 h-6" />;
                                }

                                return (
                                  <motion.div
                                    key={m.id}
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-indigo-200 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between group relative overflow-hidden"
                                  >
                                    <div className="relative z-10">
                                      <div className="flex items-center justify-between mb-4">
                                        <div className="flex flex-wrap gap-1.5 items-center">
                                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg">
                                            {m.subject}
                                          </span>
                                          {m.grade && (
                                            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[9px] font-black rounded-md">
                                              {m.grade}
                                            </span>
                                          )}
                                          {m.semester && (
                                            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded-md">
                                              {m.semester}
                                            </span>
                                          )}
                                        </div>
                                        <div className={`p-2 rounded-xl shrink-0 shadow-sm transition-colors group-hover:bg-indigo-600 group-hover:text-white ${iconColor}`}>
                                          {m.fileData ? <Upload className="w-5 h-5" /> : matIcon}
                                        </div>
                                      </div>
                                      <h3 className="font-black text-slate-800 text-sm leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
                                        {m.title}
                                      </h3>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] relative z-10">
                                      <div className="text-slate-400">
                                        Đăng bởi: <span className="font-bold text-slate-650">{m.addedBy}</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        {/* Deletion button explicitly asked by the user */}
                                        {isTeacherOrAdmin && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setDeleteConfirmId(m.id);
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Xóa học liệu"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        )}
                                        <button
                                          onClick={() => setSelectedMaterial(m)}
                                          className="font-black text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 hover:translate-x-1 duration-205"
                                        >
                                          Học Ngay →
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          );
                        })()}

                        {/* Beautiful custom absolute confirm dialog for deletion */}
                        <AnimatePresence>
                          {deleteConfirmId && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            >
                              <motion.div
                                initial={{ scale: 0.95, y: 15 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.95, y: 15 }}
                                className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4"
                              >
                                <div className="p-3.5 bg-red-50 text-red-600 rounded-2xl w-max mx-auto border border-red-100">
                                  <Trash2 className="w-8 h-8 animate-pulse" />
                                </div>
                                <div>
                                  <h3 className="font-display font-black text-slate-800 text-base">Xác nhận xóa tài liệu?</h3>
                                  <p className="text-xs text-slate-450 mt-1 leading-relaxed font-semibold">
                                    Ấn vào nút xóa hiện lên có muốn xóa hay không. Đồng ý xóa tệp học tập này khỏi không gian học hành của mọi lớp?
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="py-2.5 bg-slate-100 hover:bg-slate-250 text-slate-650 font-black text-xs rounded-xl transition-all"
                                  >
                                    Hủy bỏ
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMaterial(deleteConfirmId)}
                                    className="py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md shadow-red-500/15 transition-all"
                                  >
                                    Xác nhận Xóa
                                  </button>
                                </div>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              )}


              {/* ========================================================
                  2. BẢNG VÀNG DANH DỰ (HONORS BOARD) INTERFACE
                  ======================================================== */}
              {activeSection === 'honors' && (
                <div className="flex-1 flex flex-col overflow-hidden h-full bg-[#faf6ef]">
                  {/* Modal Header */}
                  <div className="bg-[#f0e6d2] px-8 py-5 border-b border-[#ebdcb9] flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl border border-amber-200">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="font-display font-black text-amber-900 text-xl flex items-center gap-2">
                          Bảng Vàng Danh Dự
                          <span className="text-[10px] bg-amber-600 text-white px-2.5 py-0.5 rounded-full font-black uppercase">CHI ĐỘI TINH ANH</span>
                        </h2>
                        <p className="text-xs text-amber-700/80 mt-0.5">Tôn vinh những cá nhân xuất sắc có thành tích vượt bậc trong học tập và rèn luyện</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isTeacherOrAdmin && (
                        <button
                          onClick={() => setAwardOpen(true)}
                          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-sm px-5 py-2.5 rounded-xl border border-amber-700 shadow-md transition-all"
                        >
                          <Award className="w-4 h-4" /> Khen tặng danh dự
                        </button>
                      )}
                      <button
                        onClick={() => setActiveSection(null)}
                        className="p-3 bg-[#e4d6bc] hover:bg-[#d8c7a6] text-amber-900 rounded-xl transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Body container with rich golden theme */}
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 relative">
                    
                    {/* Glowing golden podium display */}
                    {(() => {
                      const sorted = [...(classData?.students || [])]
                        .sort((a, b) => (b.trainingScore || 0) - (a.trainingScore || 0));

                      const top1 = sorted[0];
                      const top2 = sorted[1];
                      const top3 = sorted[2];

                      return (
                        <div className="flex flex-col items-center">
                          <h3 className="font-display font-black text-amber-900 text-base mb-6 tracking-wider uppercase text-center flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500 animate-spin-slow" /> Tam Đại Anh Tài Chi Đội <Sparkles className="w-5 h-5 text-amber-500 animate-spin-slow" />
                          </h3>

                          <div className="flex justify-center items-end gap-3 md:gap-8 w-full max-w-2xl px-4 min-h-[220px]">
                            {/* Top 2 Podium */}
                            {top2 && (
                              <div className="flex-1 flex flex-col items-center">
                                <div className="text-center mb-3">
                                  <div className="relative">
                                    <div className="w-14 h-14 rounded-full bg-slate-200 text-slate-800 font-extrabold flex items-center justify-center border-4 border-slate-300 text-sm shadow-md mx-auto">
                                      {(top2.fullName || 'U').charAt(0)}
                                    </div>
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-400 text-white font-black text-[10px] px-2 py-0.5 rounded-full border border-slate-200">HẠNG 2</span>
                                  </div>
                                  <p className="font-black text-slate-700 text-xs md:text-sm mt-2.5 truncate max-w-[120px]">{top2.fullName}</p>
                                  <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{top2.trainingScore || 100} ĐIỂM</span>
                                </div>
                                <div className="bg-gradient-to-t from-slate-300 via-slate-200 to-slate-100 flex items-center justify-center font-black text-slate-550 text-2xl w-full h-24 rounded-t-2xl shadow-md border-t border-slate-300">
                                  2
                                </div>
                              </div>
                            )}

                            {/* Top 1 Podium */}
                            {top1 && (
                              <div className="flex-1 flex flex-col items-center -translate-y-2">
                                <div className="text-center mb-3 relative">
                                  <Crown className="w-8 h-8 text-amber-550 absolute -top-8 left-1/2 -translate-x-1/2 drop-shadow animate-bounce" />
                                  <div className="relative">
                                    <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-900 font-extrabold flex items-center justify-center border-4 border-amber-450 text-lg shadow-lg mx-auto">
                                      {(top1.fullName || 'U').charAt(0)}
                                    </div>
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-black text-[10px] px-3 py-0.5 rounded-full border border-amber-300 animate-pulse">TRẠNG NGUYÊN</span>
                                  </div>
                                  <p className="font-extrabold text-amber-900 text-sm md:text-base mt-2.5 truncate max-w-[140px] drop-shadow-sm">{top1.fullName}</p>
                                  <span className="text-[10px] font-black text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full">{top1.trainingScore || 100} ĐIỂM HOẠT ĐỘNG</span>
                                </div>
                                <div className="bg-gradient-to-t from-amber-400 via-[#ebd185] to-[#fcecb0] flex items-center justify-center font-black text-amber-900 text-4xl w-full h-36 rounded-t-2xl shadow-lg border-t-2 border-amber-300 relative">
                                  <div className="absolute inset-0 bg-white/15 animate-pulse rounded-t-2xl"></div>
                                  1
                                </div>
                              </div>
                            )}

                            {/* Top 3 Podium */}
                            {top3 && (
                              <div className="flex-1 flex flex-col items-center">
                                <div className="text-center mb-3">
                                  <div className="relative">
                                    <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-850 font-extrabold flex items-center justify-center border-4 border-[#cd8355] text-sm shadow-md mx-auto">
                                      {(top3.fullName || 'U').charAt(0)}
                                    </div>
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#cd8355] text-white font-black text-[10px] px-2 py-0.5 rounded-full">HẠNG 3</span>
                                  </div>
                                  <p className="font-black text-amber-850 text-xs md:text-sm mt-2.5 truncate max-w-[120px]">{top3.fullName}</p>
                                  <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{top3.trainingScore || 100} ĐIỂM</span>
                                </div>
                                <div className="bg-gradient-to-t from-[#cd8355] via-[#df9b72] to-[#f4b691] flex items-center justify-center font-black text-[#5c3016] text-2xl w-full h-20 rounded-t-2xl shadow-md border-t border-[#cd8355]">
                                  3
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Complete scoreboard table of achievements */}
                    <div className="bg-white rounded-3xl border border-amber-200/60 shadow-md p-6">
                      <h4 className="font-display font-black text-amber-900 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Award className="w-4 h-4" /> Bản Ghi Danh Hiệu & Điểm Tích Lũy Phong Trào
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[#f3ebde] text-slate-400 text-[10px] font-black uppercase tracking-widest">
                              <th className="py-3 px-4 w-12 text-center">BẢNG</th>
                              <th className="py-3 px-4">TÊN HỌC SINH</th>
                              <th className="py-3 px-4">HẠNG ĐIỂM</th>
                              <th className="py-3 px-4">DANH HIỆU ĐƯỢC TRAO TẶNG</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...(classData?.students || [])]
                              .sort((a,b) => (b.trainingScore || 0) - (a.trainingScore || 0))
                              .map((hs, hidx) => {
                                let starColor = "text-slate-300";
                                if (hidx === 0) starColor = "text-amber-500 font-extrabold";
                                else if (hidx === 1) starColor = "text-slate-500 font-bold";
                                else if (hidx === 2) starColor = "text-orange-700 font-bold";

                                return (
                                  <tr key={`${hs.id}_${hidx}`} className="border-b border-[#fcfaf5] hover:bg-slate-50/50">
                                    <td className={`py-4 px-4 text-center font-display ${starColor}`}>
                                      {hidx + 1}
                                    </td>
                                    <td className="py-4 px-4 font-black text-slate-800 text-sm">
                                      {hs.fullName}
                                    </td>
                                    <td className="py-4 px-4 font-mono font-bold text-xs text-amber-700">
                                      {hs.trainingScore || 100} điểm
                                    </td>
                                    <td className="py-4 px-4">
                                      {(!hs.achievements || hs.achievements.length === 0) ? (
                                        <span className="text-slate-400 text-xs italic">Cố gắng hoạt động đóng góp để nhận tích điểm</span>
                                      ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                          {hs.achievements.map((item: string, aidx: number) => (
                                            <span 
                                              key={aidx} 
                                              className="px-2.5 py-1 bg-amber-50 border border-amber-200/50 text-[#8c5a2c] text-[10px] font-extrabold rounded-lg flex items-center gap-1 shadow-sm"
                                            >
                                              {item}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* ========================================================
                  3. KHOẢNH KHẮC CHI ĐỘI (MOMENTS SCRAPBOOK) INTERFACE
                  ======================================================== */}
              {activeSection === 'moments' && (
                <div className="flex-1 flex flex-col overflow-hidden h-full">
                  {/* Modal Header */}
                  <div className="bg-white px-8 py-5 border-b border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="font-display font-black text-slate-800 text-xl flex items-center gap-2">
                          Khoảnh Khắc Vàng {classData?.name}
                          <span className="text-[10px] bg-pink-100 text-pink-800 px-2.5 py-0.5 rounded-full font-black uppercase">NHẬT KÝ LỚP</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">Những thước hình mộc mạc và kỷ niệm hoạt động ngoại khóa đáng nhớ của lớp chúng mình</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setAddMomentOpen(true)}
                        className="flex items-center gap-2 bg-pink-600 hover:bg-pink-750 text-white font-black text-sm px-5 py-2.5 rounded-xl shadow-lg hover:shadow-pink-500/20 transition-all"
                      >
                        <Upload className="w-4 h-4" /> Đăng ảnh kỷ niệm mới
                      </button>
                      <button
                        onClick={() => setActiveSection(null)}
                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Pinterest Masonry inspired container */}
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50 relative">
                    {moments.length === 0 ? (
                      <div className="py-24 text-center max-w-sm mx-auto flex flex-col items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-slate-300 mb-4" />
                        <h4 className="font-black text-slate-700">Khung truyền cảm hứng đang trống</h4>
                        <p className="text-xs text-slate-400 mt-1">Hãy đăng bức ảnh hoạt động nhóm đầu tiên để lưu giữ nhật ký {classData?.name} nhé!</p>
                      </div>
                    ) : (
                      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                        {moments.map((mom) => (
                          <motion.div
                            key={mom.id}
                            whileHover={{ y: -4 }}
                            className="break-inside-avoid bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 relative group flex flex-col"
                          >
                            <div 
                              className="overflow-hidden relative cursor-pointer"
                              onClick={() => setViewImage({ url: mom.imageUrl, title: mom.title })}
                            >
                              <img 
                                src={mom.imageUrl} 
                                alt={mom.title} 
                                className="w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <span className="text-[10px] font-bold text-white bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg">Ngày lưu giữ: {mom.date}</span>
                              </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <h4 className="font-black text-slate-800 text-sm leading-relaxed mb-3">{mom.title}</h4>
                              <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                                <span>Bởi {mom.uploader}</span>
                                <span className="text-slate-300 font-mono">{mom.date}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}


              {/* ========================================================
                  4. CHINH PHỤC THỬ THÁCH (CONQUEST QUESTS) INTERFACE
                  ======================================================== */}
              {activeSection === 'conquests' && (
                <div className="flex-1 flex flex-col overflow-hidden h-full">
                  {/* Modal Header */}
                  <div className="bg-slate-900 text-white px-8 py-5 border-b border-slate-800 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
                        <Rocket className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h2 className="font-display font-black text-white text-xl flex items-center gap-2">
                          Chinh Phục Thử Thách
                          <span className="text-[10px] bg-cyan-500 text-black px-2.5 py-0.5 rounded-full font-black uppercase tracking-wide">TRUNG TÂM NHIỆM VỤ</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">Bứt phá giới hạn và hoàn thành bài thi rèn luyện thiết lập bởi chi đội</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isTeacherOrAdmin && (
                        <button
                          onClick={() => setAddQuestOpen(true)}
                          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-905 font-black text-sm px-5 py-2.5 rounded-xl border border-cyan-400 hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md shadow-cyan-500/10"
                        >
                          <Plus className="w-4 h-4" /> Giao nhiệm vụ tuần này
                        </button>
                      )}
                      <button
                        onClick={() => setActiveSection(null)}
                        className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all border border-slate-700"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Gamer-style dark interface for quest center */}
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950 space-y-6 relative text-white">
                    
                    {/* Progression Dashboard strip */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                        <div className="p-3.5 bg-yellow-400/10 text-yellow-500 rounded-xl border border-yellow-400/20 shrink-0">
                          <Flame className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block font-medium uppercase tracking-widest">Nhiệm Vụ Tuần Này</span>
                          <span className="text-2xl font-black text-white mt-1 block">{quests.length} Nhiệm vụ</span>
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                        <div className="p-3.5 bg-cyan-400/10 text-cyan-400 rounded-xl border border-cyan-400/20 shrink-0">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block font-medium uppercase tracking-widest">Hạng Thành Viên 9A</span>
                          <span className="text-2xl font-black text-cyan-400 mt-1 block">Chiến Minh Số</span>
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                        <div className="p-3.5 bg-emerald-400/10 text-emerald-400 rounded-xl border border-emerald-400/20 shrink-0">
                          <Zap className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block font-medium uppercase tracking-widest">Độ Chăm Chỉ Tập Thể</span>
                          <span className="text-2xl font-black text-emerald-400 mt-1 block">Rất tích cực (93%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Quest listings */}
                    <div className="space-y-4">
                      <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-cyan-400" /> Bản đồ Chinh phục Thử thách
                      </h3>
                      {quests.length === 0 ? (
                        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center">
                          <Rocket className="w-16 h-16 text-slate-600 mb-4" />
                          <p className="font-extrabold text-slate-350">Không gian yên bình</p>
                          <p className="text-xs text-slate-500 mt-1 font-medium">Lớp hiện tại chưa thiết lập thử thách rèn luyện tuần này!</p>
                        </div>
                      ) : (
                        quests.map((q) => {
                          // Find out if current user or demo student (first student) has completed this quest
                          const studentIdOfUser = classData.students?.find(s => s.userId === currentUser?.id)?.id || classData.students?.[0]?.id;
                          const isCompleted = studentIdOfUser ? q.completedBy?.includes(studentIdOfUser) : false;

                          return (
                            <div 
                              key={q.id}
                              className={`bg-slate-900 border rounded-2xl p-6 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                                isCompleted ? 'border-emerald-500/50 shadow-md shadow-emerald-500/1' : 'border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="space-y-2 max-w-3xl">
                                <div className="flex items-center gap-3">
                                  <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-black rounded-md uppercase border border-slate-750">
                                    {q.subject}
                                  </span>
                                  <span className="text-xs font-bold text-slate-400">Ứng hạn chót: {q.dueDate}</span>
                                </div>
                                <h4 className={`text-base font-black ${isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                                  {q.title}
                                </h4>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                  {q.description}
                                </p>
                              </div>

                              <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                                <div className="text-right">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Phần thưởng</span>
                                  <span className="text-sm font-black text-cyan-400 flex items-center gap-1 mt-0.5 justify-end">
                                    +{q.type === 'quiz' ? 10 : (q.points || 10)} {q.type === 'quiz' ? 'Xu' : 'Điểm rèn luyện'}
                                  </span>
                                </div>

                                <button
                                  onClick={() => {
                                    if (isTeacherOrAdmin) {
                                      setActiveStatsQuest(q);
                                      return;
                                    }
                                    if (isCompleted) {
                                      // Do nothing or view results
                                      return;
                                    }
                                    if (q.type === 'quiz') {
                                      setActiveQuizQuest(q);
                                    } else {
                                      if (q.url) window.open(q.url, '_blank');
                                      handleToggleQuestComplete(q.id);
                                    }
                                  }}
                                  className={`px-5 py-2.5 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 ${
                                    isTeacherOrAdmin
                                      ? 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                                      : isCompleted 
                                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white' 
                                      : 'bg-cyan-500 text-slate-905 hover:bg-cyan-400 hover:shadow-cyan-500/20 hover:-translate-y-0.5'
                                  }`}
                                >
                                  {isTeacherOrAdmin ? (
                                    <>
                                      <TrendingUp className="w-4 h-4" /> Xem số liệu
                                    </>
                                  ) : isCompleted ? (
                                    <>
                                      {q.type === 'quiz' ? <><Lock className="w-4 h-4" /> Đã khóa</> : <><CheckCircle className="w-4 h-4" /> Đã hoàn thành</>}
                                    </>
                                  ) : (
                                    <>
                                      <Rocket className="w-4 h-4" /> {q.type === 'quiz' ? 'Bắt đầu Quiz' : 'Chinh phục nhiệm vụ'}
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  5. TRỢ LÝ AI (AI ASSISTANT) INTERFACE
                  ======================================================== */}
              {activeSection === 'ai_assistant' && (
                <div className="flex-1 flex flex-col overflow-hidden h-full">
                  <div className="bg-purple-900 px-8 py-6 border-b border-purple-800 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3 text-white">
                      <div className="p-3 bg-purple-500/20 text-purple-300 rounded-2xl border border-purple-500/30">
                        <Bot className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="font-display font-black text-white text-xl flex items-center gap-2">
                          Trung Tâm Trợ Lý AI
                          <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2.5 py-0.5 rounded-full font-black uppercase border border-purple-500/20">CÔNG CỤ NGOÀI</span>
                        </h2>
                        <p className="text-xs text-purple-200/70 mt-0.5">Truy cập nhanh các Trí tuệ Nhân tạo để học tập và nghiên cứu</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveSection(null)}
                        className="p-2.5 bg-purple-800 text-purple-200 hover:bg-purple-700 hover:text-white rounded-xl transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 relative">
                    <div className="max-w-4xl mx-auto space-y-6">
                      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-6 items-center">
                         <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center shrink-0 border-4 border-purple-100">
                           <Sparkles className="w-10 h-10 text-purple-600" />
                         </div>
                         <div>
                           <h3 className="text-xl font-black text-slate-800 mb-2">Lời Khuyên Sử Dụng Nền Tảng AI Đám Mây</h3>
                           <p className="text-sm text-slate-500 leading-relaxed font-medium">Việc kết nối qua đường dẫn ngoài giúp trường học tránh được các chi phí cước phí API tốn kém, cũng như đảm bảo luôn nhận được trí thông minh AI mới nhất mà không gặp phải tải trọng lớn trên hệ thống. Học sinh và giáo viên hãy bấm vào để sử dụng và tìm kiếm bằng ChatGPT, Gemini, Copilot hoặc giải đề nhé.</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ChatGPT */}
                        <div className="bg-white border text-center border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1.5 duration-300">
                          <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center border-2 border-emerald-100 mx-auto mb-6">
                            <svg className="w-10 h-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                          </div>
                          <h4 className="font-black text-slate-800 text-xl flex items-center justify-center gap-2 mb-2">
                             ChatGPT
                             <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">OpenAI</span>
                          </h4>
                          <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed h-[60px]">Mô hình ngôn ngữ phổ biến nhất hỗ trợ giải bài tập, dịch thuật và phân tích văn bản xuất sắc.</p>
                          <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-600 text-white font-black text-sm rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/30">
                            Truy Cập ChatGPT <ChevronRight className="w-4 h-4" />
                          </a>
                        </div>
                        
                        {/* Gemini */}
                        <div className="bg-white border text-center border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1.5 duration-300">
                          <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center border-2 border-blue-100 mx-auto mb-6">
                            <Sparkles className="w-10 h-10 text-blue-600" />
                          </div>
                          <h4 className="font-black text-slate-800 text-xl flex items-center justify-center gap-2 mb-2">
                             Gemini
                             <span className="bg-blue-100 text-blue-800 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">Google</span>
                          </h4>
                          <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed h-[60px]">Trợ lý AI siêu việt từ Google, tìm kiếm thông tin theo thời gian thực và tích hợp Google Workspace.</p>
                          <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
                            Truy Cập Gemini <ChevronRight className="w-4 h-4" />
                          </a>
                        </div>

                        {/* Claude */}
                        <div className="bg-white border text-center border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1.5 duration-300">
                          <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center border-2 border-amber-100 mx-auto mb-6">
                            <BrainCircuit className="w-10 h-10 text-amber-600" />
                          </div>
                          <h4 className="font-black text-slate-800 text-xl flex items-center justify-center gap-2 mb-2">
                             Claude 3
                             <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">Anthropic</span>
                          </h4>
                          <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed h-[60px]">Chuyên gia trong việc hiểu ngữ cảnh dài, phân tích tài liệu PDF phức tạp với độ chính xác cao.</p>
                          <a href="https://claude.ai/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-4 bg-amber-600 text-white font-black text-sm rounded-2xl hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/30">
                            Truy Cập Claude <ChevronRight className="w-4 h-4" />
                          </a>
                        </div>

                        {/* Copilot */}
                        <div className="bg-white border text-center border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1.5 duration-300">
                          <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center border-2 border-indigo-100 mx-auto mb-6">
                            <Zap className="w-10 h-10 text-indigo-600" />
                          </div>
                          <h4 className="font-black text-slate-800 text-xl flex items-center justify-center gap-2 mb-2">
                             Copilot
                             <span className="bg-indigo-100 text-indigo-800 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">Microsoft</span>
                          </h4>
                          <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed h-[60px]">Tạo hình ảnh minh họa bài giảng miễn phí bằng Dall-E 3, hỗ trợ trích dẫn nguồn rành mạch.</p>
                          <a href="https://copilot.microsoft.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 text-white font-black text-sm rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30">
                            Truy Cập Copilot <ChevronRight className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  6. GÓC GIẢI TRÍ / MINIGAMES
                  ======================================================== */}
              {activeSection === 'minigames' && (
                <div className="flex-1 flex flex-col overflow-hidden h-full">
                  <div className="bg-teal-700 px-8 py-6 border-b border-teal-600 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3 text-white">
                      <div className="p-3 bg-teal-500/20 text-teal-100 rounded-2xl border border-teal-500/30">
                        <Gamepad2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="font-display font-black text-white text-xl flex items-center gap-2">
                          Góc Giải Trí Tập Thể
                        </h2>
                        <p className="text-xs text-teal-100/70 mt-0.5">Tham gia các trò chơi đố vui tương tác trực tiếp</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveSection(null)}
                        className="p-2.5 bg-teal-800 text-teal-100 hover:bg-teal-600 hover:text-white rounded-xl transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 relative">
                    <div className="max-w-4xl mx-auto space-y-6">
                      
                      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="w-32 h-32 bg-white/20 rounded-[2rem] flex items-center justify-center shrink-0 backdrop-blur-md shadow-inner border border-white/30 rotate-3">
                           <Gamepad2 className="w-16 h-16 text-white" />
                        </div>
                        <div className="relative z-10 flex-1 text-center md:text-left">
                          <h3 className="text-3xl font-black mb-3">Kahoot! Lớp Học</h3>
                          <p className="text-indigo-100 text-lg mb-6 leading-relaxed">
                            Tham gia bài ôn tập thú vị với Kahoot. Nhập mã PIN do giáo viên cung cấp trên lớp để bắt đầu tranh tài.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3">
                             <input type="text" placeholder="Nhập Game PIN..." className="px-6 py-4 rounded-2xl text-slate-800 font-black text-lg outline-none focus:ring-4 focus:ring-white/30 text-center sm:text-left shadow-inner flex-1 max-w-[200px] uppercase" />
                             <button className="px-8 py-4 bg-white text-indigo-600 font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 hover:bg-slate-50">
                               VÀO GAME
                             </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 group hover:border-teal-300 transition-colors cursor-pointer hover:shadow-lg hover:-translate-y-1 duration-300">
                            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                               <BrainCircuit className="w-8 h-8 font-black" />
                            </div>
                            <h4 className="font-black text-lg text-slate-800 mb-2">Đố vui trí tuệ</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">Bộ câu hỏi trắc nghiệm IQ, EQ và kiến thức xã hội để thư giãn.</p>
                         </div>
                         <a href="https://wheelofnames.com/vi/" target="_blank" rel="noopener noreferrer" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 group hover:border-teal-300 transition-colors cursor-pointer hover:shadow-lg hover:-translate-y-1 duration-300 block">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                               <Award className="w-8 h-8 font-black" />
                            </div>
                            <h4 className="font-black text-lg text-slate-800 mb-2">Vòng quay may mắn</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">Giáo viên gọi tên hoặc tặng điểm cộng ngẫu nhiên trong phần hoạt động sinh hoạt lớp.</p>
                         </a>
                      </div>

                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ADD NEW STUDY RESOURCE MODAL (SUB-MODAL) --- */}
      <AnimatePresence>
        {addMaterialOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-55 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-display font-black text-slate-800 text-base">Thêm Học Liệu Mới Lớp 9A</h3>
                <button
                  onClick={() => setAddMaterialOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleAddMaterial} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Tên tài liệu / bài nghiên cứu</label>
                  <input
                    type="text"
                    required
                    value={newMaterialTitle || ''}
                    onChange={(e) => setNewMaterialTitle(e.target.value)}
                    placeholder="Ví dụ: Đề thi Khảo cổ Đại Số 9 mẫu thử..."
                    className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Môn học</label>
                    <select
                      value={newMaterialSubject}
                      onChange={(e) => setNewMaterialSubject(e.target.value)}
                      className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none text-sm font-medium"
                    >
                      {['Toán học', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học', 'Khoa học tự nhiên', 'Lịch sử & Địa lý', 'Tin học'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Loại tệp học liệu</label>
                    <select
                      value={newMaterialType}
                      disabled={newMaterialMethod === 'upload'}
                      onChange={(e) => setNewMaterialType(e.target.value as any)}
                      className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none text-sm font-medium"
                    >
                      <option value="doc">Google Doc / PDF</option>
                      <option value="video">Bài giảng Video</option>
                      <option value="interactive">Học liệu tương tác / Mô phỏng</option>
                      <option value="sheet">Google Sheets 📊</option>
                      <option value="slide">Google Slides 🎬</option>
                      <option value="form">Google Forms 📋</option>
                      <option value="link">Trang web liên kết</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Phân hệ lớp</label>
                    <select
                      value={newMaterialGrade}
                      onChange={(e) => setNewMaterialGrade(e.target.value)}
                      className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none text-sm font-medium"
                    >
                      <option value="Lớp 6">Lớp 6</option>
                      <option value="Lớp 7">Lớp 7</option>
                      <option value="Lớp 8">Lớp 8</option>
                      <option value="Lớp 9">Lớp 9</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Phân bổ học kỳ</label>
                    <select
                      value={newMaterialSemester}
                      onChange={(e) => setNewMaterialSemester(e.target.value)}
                      className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none text-sm font-medium"
                    >
                      <option value="Học kỳ 1">Học kỳ 1</option>
                      <option value="Học kỳ 2">Học kỳ 2</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Phương thức đăng học liệu</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setNewMaterialMethod('link')}
                      className={`py-2 text-xs font-black rounded-lg transition-all ${newMaterialMethod === 'link' ? 'bg-white text-indigo-650 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Dán dường liên kết
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMaterialMethod('upload')}
                      className={`py-2 text-xs font-black rounded-lg transition-all ${newMaterialMethod === 'upload' ? 'bg-white text-indigo-650 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Tải tệp từ thiết bị
                    </button>
                  </div>
                </div>

                {newMaterialMethod === 'link' ? (
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Địa chỉ học liệu (URL)</label>
                    <input
                      type="url"
                      required
                      value={newMaterialUrl || ''}
                      onChange={(e) => setNewMaterialUrl(e.target.value)}
                      placeholder="https://docs.google.com/document/d/.../preview"
                      className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none text-sm font-medium"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50 relative">
                    <input
                      type="file"
                      id="mat_upload_file"
                      required={newMaterialMethod === 'upload'}
                      onChange={handleMaterialFileChange}
                      accept="image/*, .pdf, .doc, .docx"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                    {localFileName ? (
                      <div>
                        <p className="font-extrabold text-sm text-slate-850 truncate">{localFileName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{localFileSize}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-black text-xs text-slate-650">Bấm click hoặc kéo thả tệp</p>
                        <p className="text-[10px] text-slate-400 mt-1">Ảnh (JPG, PNG), tài liệu PDF, DOCX tối đa 5MB</p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl transition-all shadow-md shadow-indigo-600/10 mt-2"
                >
                  Xác nhận tải tệp lên lớp học
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- REWARD AWARD HONORARY BANNER SUB-MODAL --- */}
      <AnimatePresence>
        {awardOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#352a16]/40 backdrop-blur-sm z-55 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-amber-100 flex flex-col"
            >
              <div className="px-6 py-4 bg-[#fbf8f0] border-b border-amber-100 flex items-center justify-between">
                <h3 className="font-display font-black text-amber-950 text-base flex items-center gap-1">
                  <Award className="w-5 h-5 text-amber-650" /> Khen Tặng Tấm Gương Ưu Tú
                </h3>
                <button
                  onClick={() => setAwardOpen(false)}
                  className="p-1.5 hover:bg-amber-100 rounded-lg text-amber-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleAwardStudent} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-black text-[#5c3e1e] uppercase tracking-wider mb-1.5">Chọn Học Sinh Tuyên Dương</label>
                  <select
                    required
                    value={awardStudentId || ''}
                    onChange={(e) => setAwardStudentId(e.target.value)}
                    className="w-full border border-slate-200 focus:border-amber-550 rounded-xl p-3 outline-none text-sm font-medium"
                  >
                    <option value="">-- Danh sách chi đội 9A --</option>
                    {classData.students?.map(hs => (
                      <option key={hs.id} value={hs.id}>{hs.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#5c3e1e] uppercase tracking-wider mb-1.5">Chọn Huy Hiệu Danh Dự</label>
                  <select
                    value={awardEmblem}
                    onChange={(e) => setAwardEmblem(e.target.value)}
                    className="w-full border border-slate-200 focus:border-amber-550 rounded-xl p-3 outline-none text-sm font-medium"
                  >
                    <option value="Ngôi sao học tập ⭐️">Ngôi sao học tập ⭐️</option>
                    <option value="Hiệp sĩ nề nếp 🛡️">Hiệp sĩ nề nếp 🛡️</option>
                    <option value="Kỷ lục gia số 🧠">Kỷ lục gia số 🧠</option>
                    <option value="Sao rèn luyện thể chất 🏃‍♂️">Sao rèn luyện thể chất 🏃‍♂️</option>
                    <option value="Trái tim nhân ái ❤️">Trái tim nhân ái ❤️</option>
                    <option value="Búp măng tài năng 🎨">Búp măng tài năng 🎨</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#5c3e1e] uppercase tracking-wider mb-1.5">Mô tả Thành tích Tuyên dương</label>
                  <textarea
                    required
                    value={awardDesc || ''}
                    onChange={(e) => setAwardDesc(e.target.value)}
                    placeholder="Ví dụ: Đạt giải Nhất cuộc thi Sáng kiến Xanh trường, hăng hái đóng bồi dưỡng bạn..."
                    className="w-full border border-slate-200 focus:border-amber-550 rounded-xl p-3 outline-none text-sm font-medium h-24 resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#5c3e1e] uppercase tracking-wider mb-1.5">Cộng Điểm Rèn Luyện Thưởng</label>
                  <select
                    value={awardBonusScore || ''}
                    onChange={(e) => setAwardBonusScore(Number(e.target.value))}
                    className="w-full border border-slate-200 focus:border-amber-550 rounded-xl p-3 outline-none text-sm font-medium"
                  >
                    <option value="5">+5 Điểm hoạt động</option>
                    <option value="10">+10 Điểm hoạt động</option>
                    <option value="15">+15 Điểm hoạt động</option>
                    <option value="20">+20 Điểm hoạt động</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-sm rounded-xl border border-amber-700 shadow-md shadow-amber-650/10 mt-2"
                >
                  Xác nhận trao bằng khen Bảng vàng
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- VIEW IMAGE MODAL --- */}
      <AnimatePresence>
        {viewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[90] flex items-center justify-center p-4 md:p-8"
            onClick={() => setViewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent max-w-5xl w-full flex flex-col items-center relative"
            >
              <div className="flex w-full justify-between items-center mb-4 text-white">
                <h3 className="font-bold text-lg drop-shadow-md">{viewImage.title}</h3>
                <div className="flex items-center gap-3">
                  <a 
                    href={viewImage.url} 
                    download={viewImage.title}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center backdrop-blur-sm"
                    title="Tải xuống"
                  >
                    <Download className="w-5 h-5 text-white" />
                  </a>
                  <button 
                    onClick={() => setViewImage(null)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center backdrop-blur-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <img src={viewImage.url} alt={viewImage.title} className="max-h-[80vh] w-auto rounded-xl shadow-2xl object-contain" referrerPolicy="no-referrer" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ADD NEW HIGHLIGHT MOMENT SUB-MODAL --- */}
      <AnimatePresence>
        {addMomentOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-55 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-display font-black text-slate-800 text-base">Thêm Khoảnh Khắc Kỷ Niệm Mới</h3>
                <button
                  onClick={() => setAddMomentOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleAddMoment} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Tên sự kiện / Hoạt động lớp</label>
                  <input
                    type="text"
                    required
                    value={newMomentTitle || ''}
                    onChange={(e) => setNewMomentTitle(e.target.value)}
                    placeholder="Ví dụ: Lễ hội bánh chưng lớp 9A..."
                    className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Ngày diễn ra hoạt động</label>
                  <input
                    type="text"
                    required
                    value={newMomentDate || ''}
                    onChange={(e) => setNewMomentDate(e.target.value)}
                    placeholder="Ví dụ: 25/04/2026..."
                    className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 font-medium mb-1.5">Tải ảnh lên hoặc kéo thả hình ảnh hoạt động</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50 relative">
                    <input
                      type="file"
                      required
                      accept="image/*"
                      onChange={handleMomentImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Camera className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                    {newMomentImage ? (
                      <div className="mt-2 text-center">
                        <p className="text-xs font-bold text-emerald-600 mb-2 truncate">Đã tải hình ảnh chi đội lên thành công!</p>
                        <div className="w-16 h-16 rounded-xl mx-auto overflow-hidden border border-slate-200 shadow-inner">
                          <img src={newMomentImage} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-black text-xs text-slate-650">Kéo và thả tệp ảnh chụp lớp</p>
                        <p className="text-[10px] text-slate-450 mt-1">Hỗ trợ các định dạng PNG, JPG dưới 60MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-black text-sm rounded-xl transition-all shadow-md shadow-pink-600/10 mt-2"
                >
                  Xác nhận đưa lên Nhật Ký Lớp Học
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ACTIVE QUIZ QUEST PLAYER --- */}
      {activeQuizQuest && activeQuizQuest.quizData && (
        <QuizPlayer
          questTitle={activeQuizQuest.title}
          questions={activeQuizQuest.quizData}
          timeLimit={activeQuizQuest.timeLimit || 15}
          onFinish={(correct, incorrect, timeTaken) => handleQuizFinish(activeQuizQuest.id, correct, incorrect, timeTaken)}
          onCancel={() => setActiveQuizQuest(null)}
        />
      )}

      {/* --- TEACHER STATS MODAL --- */}
      <AnimatePresence>
        {activeStatsQuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-55 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-display font-black text-slate-800 text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" /> Số liệu thống kê: {activeStatsQuest.title}
                </h3>
                <button
                  onClick={() => setActiveStatsQuest(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                {!activeStatsQuest.results || activeStatsQuest.results.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-slate-500 font-medium">Chưa có học sinh nào hoàn thành thử thách này.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-indigo-50 p-4 rounded-2xl">
                        <p className="text-xs font-bold text-indigo-500 mb-1">Số lượt làm</p>
                        <p className="text-2xl font-black text-indigo-700">{activeStatsQuest.results.length}</p>
                      </div>
                      {activeStatsQuest.type === 'quiz' && (
                        <>
                          <div className="bg-emerald-50 p-4 rounded-2xl">
                            <p className="text-xs font-bold text-emerald-500 mb-1">TB Câu đúng</p>
                            <p className="text-2xl font-black text-emerald-700">
                              {(activeStatsQuest.results.reduce((a: number, c: any) => a + c.correctCount, 0) / activeStatsQuest.results.length).toFixed(1)}
                            </p>
                          </div>
                          <div className="bg-rose-50 p-4 rounded-2xl">
                            <p className="text-xs font-bold text-rose-500 mb-1">TB Câu sai</p>
                            <p className="text-2xl font-black text-rose-700">
                              {(activeStatsQuest.results.reduce((a: number, c: any) => a + c.incorrectCount, 0) / activeStatsQuest.results.length).toFixed(1)}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                            <th className="p-3 font-bold">Học sinh</th>
                            <th className="p-3 font-bold">Thời gian nộp</th>
                            {activeStatsQuest.type === 'quiz' && (
                              <>
                                <th className="p-3 font-bold text-center">Đúng</th>
                                <th className="p-3 font-bold text-center">Sai</th>
                                <th className="p-3 font-bold text-right">Tốc độ</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeStatsQuest.results.map((r: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 font-bold text-sm text-slate-700">{r.studentName}</td>
                              <td className="p-3 text-xs text-slate-500">{new Date(r.date).toLocaleString('vi-VN')}</td>
                              {activeStatsQuest.type === 'quiz' && (
                                <>
                                  <td className="p-3 text-sm font-bold text-emerald-600 text-center">{r.correctCount}</td>
                                  <td className="p-3 text-sm font-bold text-rose-600 text-center">{r.incorrectCount}</td>
                                  <td className="p-3 text-sm font-bold text-slate-700 text-right">{r.timeTaken}s</td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ASSIGN NEW CHINH PHỤC QUEST SUB-MODAL --- */}
      <AnimatePresence>
        {addQuestOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-55 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`bg-white rounded-3xl w-full ${newQuestType === 'quiz' ? 'max-w-4xl max-h-[90vh]' : 'max-w-md'} overflow-hidden shadow-2xl border border-slate-100 flex flex-col`}
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="font-display font-black text-slate-800 text-base">Giao thử thách chinh phục</h3>
                <button
                  onClick={() => setAddQuestOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleAddQuest} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button type="button" onClick={() => setNewQuestType('link')} className={`py-2 rounded-xl font-bold border-2 transition-all ${newQuestType === 'link' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}>Liên kết (Form/Web)</button>
                    <button type="button" onClick={() => setNewQuestType('quiz')} className={`py-2 rounded-xl font-bold border-2 transition-all ${newQuestType === 'quiz' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}>Tạo Quiz trực tiếp</button>
                  </div>

                  <div className={newQuestType === 'quiz' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Tên Thử Thách rèn luyện</label>
                        <input
                          type="text"
                          required
                          value={newQuestTitle || ''}
                          onChange={(e) => setNewQuestTitle(e.target.value)}
                          placeholder="Ví dụ: Thi trắc nghiệm chương 4 hình học..."
                          className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Mô tả và Hướng dẫn thực hiện</label>
                        <textarea
                          required
                          value={newQuestDesc || ''}
                          onChange={(e) => setNewQuestDesc(e.target.value)}
                          placeholder="Mô tả cụ thể cách tính điểm và tài nguyên hỗ trợ hoàn thành bài..."
                          className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none text-sm font-medium h-24 resize-none leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Môn học</label>
                          <select
                            value={newQuestSubject}
                            onChange={(e) => setNewQuestSubject(e.target.value)}
                            className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none text-sm font-medium"
                          >
                            {['Toán học', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học', 'Khoa học tự nhiên', 'Lịch sử & Địa lý', 'Tin học'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Hạn chót</label>
                          <input
                            type="text"
                            required
                            value={newQuestDueDate}
                            onChange={(e) => setNewQuestDueDate(e.target.value)}
                            placeholder="Ví dụ: 12/06/2026..."
                            className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none text-sm font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Điểm rèn luyện thưởng</label>
                          <select
                            value={newQuestPoints || ''}
                            onChange={(e) => setNewQuestPoints(Number(e.target.value))}
                            className="w-full border border-slate-350 focus:border-indigo-500 rounded-xl p-3 outline-none text-sm font-medium"
                          >
                            <option value="5">+5 Điểm</option>
                            <option value="10">+10 Điểm</option>
                            <option value="15">+15 Điểm</option>
                            <option value="20">+20 Điểm</option>
                          </select>
                        </div>
                        {newQuestType === 'quiz' && (
                          <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Thời gian làm (phút)</label>
                            <input
                              type="number"
                              min="1"
                              required
                              value={newQuestTimeLimit || ''}
                              onChange={(e) => setNewQuestTimeLimit(Number(e.target.value))}
                              className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none text-sm font-medium"
                            />
                          </div>
                        )}
                      </div>
                      
                      {newQuestType === 'link' && (
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Đường dẫn liên kết (Google Form, ...)</label>
                          <input
                            type="url"
                            required
                            value={newQuestUrl || ''}
                            onChange={(e) => setNewQuestUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none text-sm font-medium"
                          />
                        </div>
                      )}
                    </div>
                    
                    {newQuestType === 'quiz' && (
                      <div className="md:h-[60vh] overflow-y-auto md:pr-2 md:border-l md:border-slate-100 md:pl-6">
                        <QuizBuilder 
                          initialQuestions={newQuestQuestions}
                          onSave={setNewQuestQuestions}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 shrink-0 bg-slate-50">
                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl transition-all shadow-md shadow-indigo-600/10"
                  >
                    Xác nhận giao nhiệm vụ Chinh phục
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
