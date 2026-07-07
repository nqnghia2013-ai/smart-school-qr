import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  Book, 
  FileText, 
  MonitorPlay, 
  ArrowLeft, 
  Download, 
  MousePointer2, 
  Orbit, 
  Lightbulb, 
  Hexagon, 
  Sparkles, 
  X, 
  Plus, 
  Search, 
  Chrome, 
  FolderOpen, 
  Loader2, 
  ExternalLink,
  PlusCircle,
  FileSpreadsheet,
  Presentation,
  ClipboardList,
  Link,
  Eye,
  Trash2,
  Coins,
  Folder,
  PlayCircle,
  Play,
  Pause,
  Maximize,
  Youtube
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithGoogle, getAccessToken } from '../lib/firebase';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
}

const CustomVideoPlayer = ({ url, onEnded }: { url: string, onEnded: () => void }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const maxWatchedTime = React.useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  const togglePlay = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          setIsPlaying(true);
          await videoRef.current.play();
        } catch (err) {
          console.error("Error playing video:", err);
          setIsPlaying(false);
        }
      }
    }
  };

  const toggleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.parentElement?.requestFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      if (current > maxWatchedTime.current) {
        // Prevent seeking forward by more than 2 seconds (e.g. via keyboard or bypassing UI)
        if (current - maxWatchedTime.current > 2) {
          videoRef.current.currentTime = maxWatchedTime.current;
        } else {
          maxWatchedTime.current = current;
        }
      }
      
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  return (
    <div 
      className="relative group w-full h-full bg-black rounded-3xl overflow-hidden flex flex-col justify-center items-center shadow-2xl"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={togglePlay}
    >
      {isBuffering && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-black/40 backdrop-blur-sm">
           <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
           <p className="text-sm font-medium animate-pulse tracking-wide">Đang tải luồng video...</p>
        </div>
      )}

      <video
        ref={videoRef}
        src={url}
        className="max-h-full w-full object-contain cursor-pointer transition-transform duration-500"
        onTimeUpdate={handleTimeUpdate}
        onCanPlay={() => setIsBuffering(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onEnded={() => {
          setIsPlaying(false);
          onEnded();
        }}
        playsInline
        controls={false}
      />
      
      {/* Central Play/Pause overlay */}
      <AnimatePresence>
        {!isPlaying && !isBuffering && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.3)] border border-white/30">
              <Play className="w-10 h-10 text-white ml-2 drop-shadow-md" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Controls Bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300 z-30 ${isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="w-full h-1.5 bg-white/30 rounded-full mb-4 overflow-hidden relative cursor-pointer group/progress"
          onClick={(e) => {
            if (videoRef.current) {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              const targetTime = pos * videoRef.current.duration;
              
              if (targetTime <= maxWatchedTime.current) {
                videoRef.current.currentTime = targetTime;
              } else {
                videoRef.current.currentTime = maxWatchedTime.current;
              }
            }
          }}
        >
          <div 
            className="h-full bg-indigo-500 transition-all duration-100 relative shadow-[0_0_10px_rgba(99,102,241,0.8)]" 
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full scale-0 group-hover/progress:scale-100 transition-transform"></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button onClick={togglePlay} className="text-white hover:text-indigo-400 transition-colors p-2 hover:bg-white/10 rounded-full">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-xs font-mono">
              {videoRef.current ? formatTime(videoRef.current.currentTime) : '00:00'} / {videoRef.current && videoRef.current.duration ? formatTime(videoRef.current.duration) : '00:00'}
            </span>
            <button onClick={toggleFullscreen} className="text-white hover:text-indigo-400 transition-colors p-2 hover:bg-white/10 rounded-full ml-2">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for formatting video time
const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds)) return '00:00';
  const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rooms, updateRoom, currentUser, updateUser, showToast } = useAppContext();
  
  const room = rooms.find(r => r.id === id);

  // Filter selections (Viewing)
  const [selectedGrade, setSelectedGrade] = useState<'all' | '6' | '7' | '8' | '9'>('all');
  const [selectedSemester, setSelectedSemester] = useState<'all' | '1' | '2'>('all');

  // States for Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{ 
    title: string; 
    type: string; 
    url: string;
    grade?: '6' | '7' | '8' | '9' | 'all'; 
    semester?: '1' | '2' | 'all';
    fileName?: string;
    fileSize?: string;
    fileData?: string; 
  } | null>(null);
  const [claimCountdown, setClaimCountdown] = useState(0);

  useEffect(() => {
    if (showViewerModal && selectedContent && currentUser) {
      if (!currentUser.viewedContents?.includes(selectedContent.url)) {
         const isDriveVideo = selectedContent.type === 'video' && !!getGoogleFileId(selectedContent.url).id && !selectedContent.fileData;
         const isYouTube = !!getYouTubeId(selectedContent.url);
         if (selectedContent.type === 'video' && !isDriveVideo && !isYouTube) {
            setClaimCountdown(-1); // Special state: waiting for video to finish
         } else {
            setClaimCountdown(15);
         }
      } else {
         setClaimCountdown(0);
      }
    }
  }, [showViewerModal, selectedContent, currentUser]);

  useEffect(() => {
    if (claimCountdown > 0) {
      const timer = setTimeout(() => setClaimCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [claimCountdown]);

  // States for Add Asset Form
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'doc' | 'video' | 'interactive' | 'link'>('doc');
  const [newUrl, setNewUrl] = useState('');
  const [newGrade, setNewGrade] = useState<'6' | '7' | '8' | '9' | 'all'>('all');
  const [newSemester, setNewSemester] = useState<'1' | '2' | 'all'>('all');
  
  // File Upload State
  const [addMethod, setAddMethod] = useState<'link' | 'google' | 'upload'>('link');
  const [localFileName, setLocalFileName] = useState('');
  const [localFileSize, setLocalFileSize] = useState('');
  const [localFileData, setLocalFileData] = useState('');

  // Delete Confirmation State
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  // States for Google Integration inside Add Modal
  const [isConnectedGoogle, setIsConnectedGoogle] = useState(!!getAccessToken());
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [searchDriveQuery, setSearchDriveQuery] = useState('');
  const [errorDocs, setErrorDocs] = useState('');

  useEffect(() => {
    // Check connection status periodically or on mount
    setIsConnectedGoogle(!!getAccessToken());
  }, [showAddModal]);

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 min-h-[50vh]">
        <Book className="w-20 h-20 mb-4 text-slate-300 animate-pulse" />
        <h2 className="text-2xl font-bold text-slate-700">Không tìm thấy tổ hợp không gian</h2>
        <button onClick={() => navigate('/phong-bo-mon')} className="mt-6 px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-lg">Quay lại trung tâm</button>
      </div>
    );
  }

  // Extract ID from Google Doc or Drive links
  const getGoogleFileId = (urlStr: string): { id: string | null; type: 'document' | 'spreadsheets' | 'presentation' | 'forms' | 'file' } => {
    if (!urlStr) return { id: null, type: 'file' };

    // Google Docs URL format
    const docRegex = /\/document\/d\/([a-zA-Z0-9-_]+)/;
    const docMatch = urlStr.match(docRegex);
    if (docMatch) return { id: docMatch[1], type: 'document' };

    // Google Sheets URL format
    const sheetRegex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const sheetMatch = urlStr.match(sheetRegex);
    if (sheetMatch) return { id: sheetMatch[1], type: 'spreadsheets' };

    // Google Slides URL format
    const slidesRegex = /\/presentation\/d\/([a-zA-Z0-9-_]+)/;
    const slidesMatch = urlStr.match(slidesRegex);
    if (slidesMatch) return { id: slidesMatch[1], type: 'presentation' };

    // Google Forms URL format
    const formRegex = /\/forms\/d\/([a-zA-Z0-9-_/]+)/;
    const formMatch = urlStr.match(formRegex);
    if (formMatch) return { id: formMatch[1], type: 'forms' };

    // Google Directory File URL format
    const fileRegex = /\/file\/d\/([a-zA-Z0-9-_]+)/;
    const fileMatch = urlStr.match(fileRegex);
    if (fileMatch) return { id: fileMatch[1], type: 'file' };

    // Raw ID fallback
    if (urlStr.length > 25 && !urlStr.includes('/') && !urlStr.includes('.')) {
      return { id: urlStr, type: 'file' };
    }

    return { id: null, type: 'file' };
  };

  const handleConnectGoogle = async () => {
    setErrorDocs('');
    try {
      await signInWithGoogle();
      setIsConnectedGoogle(true);
      fetchDriveDocs();
    } catch (err: any) {
      console.error(err);
      setErrorDocs('Kết nối tài khoản Google thất bại. Vui lòng thử lại.');
    }
  };

  const fetchDriveDocs = async () => {
    setIsLoadingDocs(true);
    setErrorDocs('');
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error('Vui lòng kết nối tài khoản Google trước.');
      }
      
      const query = encodeURIComponent("trashed = false");
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime)&pageSize=100`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Token của bạn đã hết hạn, vui lòng nhấn kết nối lại.');
      }

      const data = await response.json();
      setDriveFiles(data.files || []);
    } catch (err: any) {
      console.error(err);
      setErrorDocs(err.message || 'Lỗi tải xuống danh mục Google Drive.');
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleSelectDriveFile = (file: GoogleDriveFile) => {
    setNewTitle(file.name);
    setAddMethod('link');
    // Create viewable URL representation
    let url = '';
    let newContentType: 'doc' | 'video' | 'interactive' | 'link' = 'doc';

    if (file.mimeType.includes('video')) {
      url = `https://drive.google.com/file/d/${file.id}/preview`;
      newContentType = 'video';
    } else if (file.mimeType.includes('form')) {
      url = `https://docs.google.com/forms/d/${file.id}/viewform`;
      newContentType = 'interactive';
    } else if (file.mimeType.includes('folder')) {
      url = `https://drive.google.com/drive/folders/${file.id}`;
      newContentType = 'link';
    } else if (file.mimeType.includes('spreadsheet')) {
      url = `https://docs.google.com/spreadsheets/d/${file.id}/edit`;
    } else if (file.mimeType.includes('presentation')) {
      url = `https://docs.google.com/presentation/d/${file.id}/edit`;
    } else if (file.mimeType.includes('document')) {
      url = `https://docs.google.com/document/d/${file.id}/edit`;
    } else {
      url = `https://drive.google.com/file/d/${file.id}/preview`;
    }

    setNewUrl(url);
    setNewType(newContentType);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024 * 1024) {
      alert('Tệp quá lớn. Vui lòng chọn tệp dưới 20GB.');
      return;
    }

    setLocalFileName(file.name);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    setLocalFileSize(`${sizeMB} MB`);
    
    // Auto-fill title if empty
    if (!newTitle.trim()) {
      const dotIdx = file.name.lastIndexOf('.');
      setNewTitle(dotIdx !== -1 ? file.name.substring(0, dotIdx) : file.name);
    }
    
    // Determine type
    const isVideo = file.type.startsWith('video/');
    if (isVideo) {
       setNewType('video');
    } else {
       setNewType('doc');
    }

    // Firestore has a 1MB limit. Base64 adds ~33% overhead.
    // If file is > 700KB or is a video, use Blob URL to prevent crashing.
    // Note: Blob URLs only work locally for the current session.
    if (isVideo || file.size > 700 * 1024) {
      setLocalFileData(URL.createObjectURL(file));
      if (isVideo) {
         // Show a small warning about video storage
         console.warn("Video files are large and will be stored as temporary local blob URLs to prevent database crashes.");
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setLocalFileData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let pathUrl = newUrl.trim();
    if (addMethod === 'upload') {
      if (!localFileData) {
        alert('Vui lòng chọn tệp để tải lên!');
        return;
      }
      pathUrl = '#'; // Locally held file indicator
    } else {
      if (!pathUrl) {
         alert('Vui lòng nhập đường dẫn học liệu!');
         return;
      }
    }

    if (!newTitle.trim()) return;

    const newContentItem: any = {
      title: newTitle.trim(),
      type: newType, // Use the correct type whether it is upload or link
      url: pathUrl,
      grade: newGrade,
      semester: newSemester,
    };

    if (addMethod === 'upload') {
      newContentItem.fileName = localFileName;
      newContentItem.fileSize = localFileSize;
      newContentItem.fileData = localFileData;
    }

    const updatedContents = [...(room.contents || []), newContentItem];
    updateRoom(room.id, { contents: updatedContents });

    // Reset Form
    setNewTitle('');
    setNewType('doc');
    setNewUrl('');
    setNewGrade('all');
    setNewSemester('all');
    setLocalFileName('');
    setLocalFileSize('');
    setLocalFileData('');
    setShowAddModal(false);
  };

  const handleDeleteContent = (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering open modal helper
    setDeleteConfirmIndex(indexToDelete);
  };

  const confirmDeleteContent = () => {
    if (deleteConfirmIndex === null) return;
    const filteredContents = (room.contents || []).filter((_, idx) => idx !== deleteConfirmIndex);
    updateRoom(room.id, { contents: filteredContents });
    setDeleteConfirmIndex(null);
  };

  const handleOpenContent = (content: { 
    title: string; 
    type: string; 
    url: string;
    grade?: '6' | '7' | '8' | '9' | 'all'; 
    semester?: '1' | '2' | 'all';
    fileName?: string;
    fileSize?: string;
    fileData?: string;
  }) => {
    setSelectedContent(content);
    setShowViewerModal(true);
  };

  const getYouTubeId = (urlStr: string): string | null => {
    if (!urlStr) return null;
    const match = urlStr.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const gradientClasses = room.color?.replace('bg-', 'from-').replace('text-', 'to-') || 'from-indigo-400 to-blue-500';

  // Compute viewing configuration inside Viewer Code Block
  let embedUrl = '';
  let googleFileMeta = { isGoogleDoc: false, id: '', type: 'file' as 'document' | 'file' | 'spreadsheets' | 'presentation' | 'forms' };
  let isYouTube = false;
  
  if (selectedContent) {
    const ytId = getYouTubeId(selectedContent.url);
    if (ytId) {
       isYouTube = true;
       embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1`;
    } else {
      const fileIdMeta = getGoogleFileId(selectedContent.url);
      if (fileIdMeta.id) {
        googleFileMeta = { isGoogleDoc: true, id: fileIdMeta.id, type: fileIdMeta.type };
        if (fileIdMeta.type === 'forms') {
          // If the ID already starts with e/, it's a published Google Form
          embedUrl = `https://docs.google.com/forms/d/${fileIdMeta.id}/viewform?embedded=true`;
        } else if (fileIdMeta.type === 'file') {
          embedUrl = `https://drive.google.com/file/d/${fileIdMeta.id}/preview`;
        } else {
          embedUrl = `https://docs.google.com/${fileIdMeta.type}/d/${fileIdMeta.id}/preview`;
        }
      } else {
        embedUrl = selectedContent.url;
      }
    }
  }

  const filteredDriveFiles = driveFiles.filter(f => 
    (f.name || '').toLowerCase().includes((searchDriveQuery || '').toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 relative text-left">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <motion.button 
        whileHover={{ x: -5 }}
        onClick={() => navigate('/phong-bo-mon')}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors z-20 relative"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách module
      </motion.button>

      {/* Header Banner Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10"
      >
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000&auto=format&fit=crop" alt="bg" className="w-full h-full object-cover opacity-30 mix-blend-screen" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 opacity-50 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 px-8 py-12 md:px-12 md:py-16 flex flex-col md:flex-row md:items-end gap-8">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ delay: 0.1, type: "spring" }}
             className={`w-32 h-32 rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl border-2 border-white/20 bg-gradient-to-br ${gradientClasses}`}
           >
              <Lightbulb className="w-16 h-16 text-white drop-shadow-md" />
           </motion.div>
           
           <div className="flex-1">
             <div className="flex items-center gap-3 mb-3">
               <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                 <Orbit className="w-3.5 h-3.5" /> Module Chuyên Môn
               </span>
               <span className="px-4 py-1.5 bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest rounded-full">
                 Google Docs Synced
               </span>
             </div>
             <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight drop-shadow-lg mb-3">{room.name}</h1>
             <p className="text-slate-300 text-lg font-medium max-w-3xl leading-relaxed">{room.description}</p>
           </div>
        </div>
      </motion.div>

      {/* Materials List Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] shadow-xl border border-white p-8 md:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 pb-6 border-b-2 border-dashed border-slate-200 gap-6 relative z-10">
          <div>
            <h2 className="text-2xl font-display font-black text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                 <Hexagon className="w-6 h-6" />
              </div>
              Học liệu & Tài liệu Tích hợp
            </h2>
            <p className="text-slate-500 mt-1.5 font-medium">Click chọn để xem chi tiết hoặc tương tác tài liệu trực quan.</p>
          </div>
          {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="group relative overflow-hidden text-sm font-black text-white bg-slate-900 px-6 py-4 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Sparkles className="w-4 h-4 relative z-10 text-cyan-400 group-hover:animate-pulse" />
              <span className="relative z-10">Nạp học liệu Google Docs</span>
            </button>
          )}
        </div>

        {/* FILTERS SECTION FOR GRADES AND SEMESTERS */}
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-4 md:p-6 mb-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 relative z-10">
          {/* Grade filter */}
          <div className="space-y-2 flex-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block px-1">Chương trình khối lớp</span>
            <div className="flex flex-wrap gap-2.5">
              {[
                { id: 'all', label: 'Tất cả các lớp' },
                { id: '6', label: 'Lớp 6' },
                { id: '7', label: 'Lớp 7' },
                { id: '8', label: 'Lớp 8' },
                { id: '9', label: 'Lớp 9' }
              ].map(grade => (
                <button
                  key={grade.id}
                  onClick={() => setSelectedGrade(grade.id as any)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    selectedGrade === grade.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {grade.label}
                </button>
              ))}
            </div>
          </div>

          {/* Semester filter */}
          <div className="space-y-2 shrink-0">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block px-1">Phân chia học kỳ</span>
            <div className="flex gap-2.5">
              {[
                { id: 'all', label: 'Cả năm / Tất cả' },
                { id: '1', label: 'Học kỳ 1' },
                { id: '2', label: 'Học kỳ 2' }
              ].map(sem => (
                <button
                  key={sem.id}
                  onClick={() => setSelectedSemester(sem.id as any)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    selectedSemester === sem.id
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {sem.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {(() => {
          const displayContents = (room.contents || []).filter(content => {
            if (selectedGrade !== 'all') {
              const itemGrade = content.grade || 'all';
              if (itemGrade !== 'all' && itemGrade !== selectedGrade) return false;
            }
            if (selectedSemester !== 'all') {
              const itemSemester = content.semester || 'all';
              if (itemSemester !== 'all' && itemSemester !== selectedSemester) return false;
            }
            return true;
          });

          if (displayContents.length === 0) {
            return (
              <div className="text-center py-20 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-3xl relative z-10 space-y-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                   <FileText className="w-8 h-8 text-slate-300" />
                </div>
                <div>
                  <p className="text-slate-700 font-bold text-lg">Không tìm thấy tài liệu phù hợp</p>
                  <p className="text-slate-400 text-xs mt-1.5 font-semibold">
                    Không có tài liệu nào thuộc {selectedGrade === 'all' ? 'tất cả khối khoa học' : `Lớp ${selectedGrade}`}{' '}
                    {selectedSemester !== 'all' ? ` - Học kỳ ${selectedSemester}` : ''}.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <button 
                    onClick={() => {
                      setSelectedGrade('all');
                      setSelectedSemester('all');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors shadow-none bg-transparent border-0 cursor-pointer"
                  >
                    Xem tất cả tài liệu ban đầu
                  </button>
                  {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                    <span className="text-slate-300">|</span>
                  )}
                  {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors shadow-none bg-transparent border-0 cursor-pointer"
                    >
                      Nạp học liệu cho mục này +
                    </button>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {displayContents.map((content, idx) => {
                const originalIndex = room.contents.findIndex(c => c.title === content.title && c.url === content.url);
                const isGoogleDoc = !!getGoogleFileId(content.url).id;
                const isLocalFile = !!content.fileData;

                return (
                  <motion.div 
                    whileHover={{ y: -5 }}
                    key={idx} 
                    onClick={() => handleOpenContent(content)}
                    className="bg-white border text-left border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                          {content.type === 'video' ? (
                            <MonitorPlay className="w-7 h-7" />
                          ) : content.type === 'interactive' ? (
                            <MousePointer2 className="w-7 h-7" />
                          ) : isGoogleDoc ? (() => {
                            const fileMeta = getGoogleFileId(content.url);
                            if (fileMeta.type === 'spreadsheets') {
                              return <FileSpreadsheet className="w-7 h-7 text-emerald-500 group-hover:text-white transition-colors" />;
                            } else if (fileMeta.type === 'presentation') {
                              return <Presentation className="w-7 h-7 text-amber-500 group-hover:text-white transition-colors" />;
                            } else if (fileMeta.type === 'forms') {
                              return <ClipboardList className="w-7 h-7 text-purple-500 group-hover:text-white transition-colors" />;
                            } else {
                              return <FileText className="w-7 h-7 text-indigo-500 group-hover:text-white transition-colors" />;
                            }
                          })() : (
                            <FileText className="w-7 h-7" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors shrink-0">
                             <Eye className="w-4.5 h-4.5 text-slate-400 group-hover:text-indigo-600" />
                          </div>
                          {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                            <button
                              onClick={(e) => handleDeleteContent(originalIndex !== -1 ? originalIndex : idx, e)}
                              className="w-9 h-9 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors border-0 cursor-pointer"
                              title="Xóa tệp học liệu"
                            >
                               <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <h3 className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors leading-tight mb-3">{content.title}</h3>
                      
                      {isLocalFile && (
                        <div className="mt-3 bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100/40 flex items-center justify-between text-xs font-bold">
                          <div className="overflow-hidden mr-2">
                            <p className="text-slate-700 truncate text-[11px] font-sans font-medium">{content.fileName}</p>
                            <p className="text-[10px] text-slate-400 font-sans font-medium">{content.fileSize || 'N/A'}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (content.fileData) {
                                const link = document.createElement('a');
                                link.href = content.fileData;
                                link.download = content.fileName || 'tai-lieu-bai-hoc';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1 shrink-0 shadow-sm transition-colors cursor-pointer border-0"
                          >
                            <Download className="w-3 h-3" /> Tải về
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-50">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                        {content.type}
                      </span>
                      {content.grade && content.grade !== 'all' && (
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-3 py-1 rounded-full">
                          Lớp {content.grade}
                        </span>
                      )}
                      {content.semester && content.semester !== 'all' && (
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100/50 px-3 py-1 rounded-full">
                          Kỳ {content.semester}
                        </span>
                      )}
                      {getYouTubeId(content.url) && (
                        <span className="text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 border text-red-600 bg-red-50 border-red-200">
                          <Youtube className="w-2.5 h-2.5" /> YouTube
                        </span>
                      )}
                      {isGoogleDoc && (() => {
                        const fileMeta = getGoogleFileId(content.url);
                        let docLabel = 'G-Drive';
                        let docClass = 'text-slate-600 bg-slate-50 border-slate-200/60';
                        if (fileMeta.type === 'spreadsheets') {
                          docLabel = 'G-Sheet';
                          docClass = 'text-emerald-700 bg-emerald-50 border-emerald-100/60';
                        } else if (fileMeta.type === 'presentation') {
                          docLabel = 'G-Slide';
                          docClass = 'text-amber-700 bg-amber-50 border-amber-100/60';
                        } else if (fileMeta.type === 'forms') {
                          docLabel = 'G-Form';
                          docClass = 'text-purple-700 bg-purple-50 border-purple-100/60';
                        } else if (fileMeta.type === 'document') {
                          docLabel = 'G-Doc';
                          docClass = 'text-blue-700 bg-blue-50 border-blue-100/60';
                        }
                        return (
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 border ${docClass}`}>
                            <Chrome className="w-2.5 h-2.5" /> {docLabel}
                          </span>
                        );
                      })()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          );
        })()}
      </motion.div>

      {/* MODAL: ADD LEARNING MATERIAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 border-b border-rose-100/10 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-xl">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-display font-black text-xl text-slate-800">Liên Kết Học Liệu Giáo Án Số</h3>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form controls */}
                <form onSubmit={handleAddSubmit} className="space-y-4 lg:col-span-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Phương thức nạp</label>
                    <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                      <button
                        type="button"
                        onClick={() => setAddMethod('link')}
                        className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer border-0 ${
                          addMethod === 'link'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 bg-transparent'
                        }`}
                      >
                        Nhập Link / Google Drive
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddMethod('upload')}
                        className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer border-0 ${
                          addMethod === 'upload'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 bg-transparent'
                        }`}
                      >
                        Tải tệp Máy tính lên
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề học liệu</label>
                    <input 
                      type="text" 
                      required
                      value={newTitle || ''}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="vd: Giáo án thực hành Lý thuyết L1"
                      className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 placeholder-slate-400 font-medium focus:ring-0 outline-none text-sm"
                    />
                  </div>

                  {addMethod === 'link' ? (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Thể loại học liệu</label>
                        <select 
                          value={newType || ''}
                          onChange={(e) => setNewType(e.target.value as any)}
                          className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 font-medium outline-none text-sm"
                        >
                          <option value="doc">Google Workspace (Docs, Sheets, Slides, Forms, PDF)</option>
                          <option value="video">Bài giảng Video</option>
                          <option value="interactive">Học liệu tương tác 3D / Mô phỏng</option>
                          <option value="link">Vật tư / Liên kết web</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Địa chỉ đường dẫn (URL / File ID)</label>
                        <input 
                          type="text" 
                          required={addMethod === 'link'}
                          value={newUrl || ''}
                          onChange={(e) => setNewUrl(e.target.value)}
                          placeholder="Dán link Google Docs, Sheets, Slides hoặc Forms tại đây"
                          className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 placeholder-slate-400 font-medium focus:ring-0 outline-none text-sm"
                        />
                        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                          Hỗ trợ đầy đủ các dạng liên kết: <code>document</code>, <code>spreadsheets</code>, <code>presentation</code>, hoặc <code>forms</code> để nhúng trực tiếp vào lớp học.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Chọn tệp từ máy tính</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50 relative hover:bg-slate-100/50 transition-all">
                        <input 
                          type="file" 
                          onChange={handleFileChange}
                          id="local-file-upload"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*,video/*"
                        />
                        <div className="space-y-2 pointer-events-none">
                          <Download className="w-8 h-8 text-slate-400 mx-auto animate-pulse" />
                          <div className="text-xs font-bold text-slate-600">
                            {localFileName ? (
                              <span className="text-indigo-600">{localFileName} ({localFileSize})</span>
                            ) : (
                              'Kéo thả học liệu hoặc click để tải lên'
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">PDF, Word, Excel, PowerPoint, Video, Ảnh (Tối đa 20GB)</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Metadatas (Grade & Semester assignment) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Phân bổ Khối Lớp</label>
                      <select 
                        value={newGrade || ''}
                        onChange={(e) => setNewGrade(e.target.value as any)}
                        className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 font-medium outline-none text-xs"
                      >
                        <option value="all">Tất cả các lớp</option>
                        <option value="6">Lớp 6</option>
                        <option value="7">Lớp 7</option>
                        <option value="8">Lớp 8</option>
                        <option value="9">Lớp 9</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Phân bổ Học Kỳ</label>
                      <select 
                        value={newSemester || ''}
                        onChange={(e) => setNewSemester(e.target.value as any)}
                        className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 font-medium outline-none text-xs"
                      >
                        <option value="all">Tất cả học kỳ</option>
                        <option value="1">Học kỳ 1</option>
                        <option value="2">Học kỳ 2</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-xl transition-all text-sm block shadow-lg mt-6 border-0 cursor-pointer"
                  >
                     Tạo giáo án và nạp dữ liệu
                  </button>
                </form>

                {/* Google Workspace Integration Side panel */}
                <div className="lg:col-span-7 bg-slate-50 rounded-3xl border border-slate-100 p-6 flex flex-col h-full min-h-[400px]">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                    <div className="flex items-center gap-2">
                      <Chrome className="w-5 h-5 text-indigo-600" />
                      <span className="font-bold text-slate-800 text-sm">Trợ lý Google Workspace Drive</span>
                    </div>
                    {isConnectedGoogle && (
                      <button 
                        type="button"
                        onClick={fetchDriveDocs}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                      >
                        <Loader2 className={`w-3 h-3 ${isLoadingDocs ? 'animate-spin' : ''}`} /> Tải lại tệp
                      </button>
                    )}
                  </div>

                  {!isConnectedGoogle ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <FolderOpen className="w-12 h-12 text-slate-300" />
                      <div>
                        <h4 className="font-bold text-slate-700 text-sm">Chưa liên kết Google Drive</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">Kết nối với tài khoản Google để chọn và hiển thị các tệp tài liệu Google Docs, Slides, Sheets của bạn dễ dàng.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleConnectGoogle}
                        className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-black py-2.5 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Chrome className="w-4 h-4 text-blue-500" /> Liên kết Google Drive
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col flex-1">
                      {/* Search & Meta */}
                      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 mb-4">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Tìm kiếm tài liệu Drive của bạn..."
                          value={searchDriveQuery || ''}
                          onChange={(e) => setSearchDriveQuery(e.target.value)}
                          className="w-full bg-transparent focus:ring-0 outline-none border-none text-xs font-semibold"
                        />
                      </div>

                      {/* File list container */}
                      <div className="flex-1 overflow-y-auto space-y-2 max-h-[250px] pr-2">
                        {isLoadingDocs ? (
                          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
                            <p>Đang tìm kiếm tài liệu từ Google Drive...</p>
                          </div>
                        ) : errorDocs ? (
                          <div className="text-center py-10 text-xs text-rose-500 font-sans">
                            {errorDocs}
                            <button 
                              type="button" 
                              onClick={handleConnectGoogle} 
                              className="block mx-auto mt-2 text-indigo-600 hover:underline font-bold"
                            >
                              Nhấp để Kết nối lại
                            </button>
                          </div>
                        ) : filteredDriveFiles.length === 0 ? (
                          <div className="text-center py-12 text-xs text-slate-400 font-semibold">
                            Không tìm thấy tài liệu phù hợp nào.
                          </div>
                        ) : (
                          filteredDriveFiles.map((file) => {
                            let icon = <FileText className="w-4 h-4 text-indigo-500" />;
                            if (file.mimeType.includes('spreadsheet')) icon = <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
                            else if (file.mimeType.includes('presentation')) icon = <Presentation className="w-4 h-4 text-amber-500" />;
                            else if (file.mimeType.includes('form')) icon = <ClipboardList className="w-4 h-4 text-purple-500" />;
                            else if (file.mimeType.includes('video')) icon = <PlayCircle className="w-4 h-4 text-rose-500" />;
                            else if (file.mimeType.includes('folder')) icon = <Folder className="w-4 h-4 text-blue-500" />;

                            return (
                              <button
                                key={file.id}
                                type="button"
                                onClick={() => handleSelectDriveFile(file)}
                                className="w-full text-left bg-white hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-100 rounded-xl p-3 flex items-center justify-between transition-all group"
                              >
                                <div className="flex items-center gap-3 overflow-hidden mr-2">
                                  <div className="p-1.5 bg-slate-50 group-hover:bg-indigo-100 rounded-lg transition-colors shrink-0">
                                    {icon}
                                  </div>
                                  <div className="overflow-hidden">
                                    <p className="font-bold text-slate-700 text-xs truncate leading-tight group-hover:text-indigo-600">{file.name}</p>
                                    <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">{file.mimeType.split('.').pop()}</p>
                                  </div>
                                </div>
                                <PlusCircle className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                              </button>
                            );
                          })
                        )}
                      </div>
                      <div className="mt-auto pt-3 border-t border-slate-100 text-[10px] text-slate-400 italic font-medium">
                        * Kho học liệu hỗ trợ: Tất cả tệp tin từ Google Drive (Docs, Sheets, Slides, Video, PDF, ...)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: INTEGRATED EMBED VIEWER FOR GOOGLE DOCS / DRIVE */}
      <AnimatePresence>
        {showViewerModal && selectedContent && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 lg:p-8">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-6xl h-full max-h-[90vh] shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
            >
              <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-3 overflow-hidden mr-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                    {selectedContent.fileData ? (
                      <FileText className="w-5 h-5 text-indigo-600" />
                    ) : (() => {
                      const fileMeta = getGoogleFileId(selectedContent.url);
                      if (fileMeta.type === 'spreadsheets') return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
                      if (fileMeta.type === 'presentation') return <Presentation className="w-5 h-5 text-amber-600" />;
                      if (fileMeta.type === 'forms') return <ClipboardList className="w-5 h-5 text-purple-600" />;
                      return <FileText className="w-5 h-5 text-indigo-600" />;
                    })()}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-display font-black text-slate-800 text-base md:text-lg truncate">{selectedContent.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                      {selectedContent.fileData ? 'Học liệu tải lên trực tiếp' : 'Đồng bộ từ Google Workspace'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button 
                    onClick={() => {
                      if (currentUser && !currentUser.viewedContents?.includes(selectedContent.url) && claimCountdown === 0) {
                        const newCoins = (currentUser.coins || 0) + 10;
                        const newViewed = [...(currentUser.viewedContents || []), selectedContent.url];
                        updateUser(currentUser.id, { coins: newCoins, viewedContents: newViewed });
                        alert('Chúc mừng! Bạn nhận được 10 xu.');
                      }
                      setShowViewerModal(false);
                      setSelectedContent(null);
                    }}
                    className={`px-4 py-2 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all border-0 cursor-pointer ${
                      currentUser?.viewedContents?.includes(selectedContent.url) 
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-[#121A33] dark:text-slate-400'
                      : claimCountdown !== 0
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-white/5 dark:text-slate-400'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                    }`}
                  >
                    {currentUser?.viewedContents?.includes(selectedContent.url) ? (
                       <>Đóng</>
                    ) : claimCountdown === -1 ? (
                       <>Đóng (Xem hết video để nhận xu)</>
                    ) : claimCountdown > 0 ? (
                       <>Đóng (Nhận xu sau {claimCountdown}s)</>
                    ) : (
                       <><Coins className="w-4 h-4 text-amber-500" /> Nhận Xu & Đóng</>
                    )}
                  </button>

                  {selectedContent.fileData ? (
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedContent.fileData || '';
                        link.download = selectedContent.fileName || 'tai-lieu-bai-hoc';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all border-0 cursor-pointer"
                    >
                      Tải về máy <Download className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <a 
                      href={selectedContent.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      Open Original <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button 
                    onClick={() => {
                      setShowViewerModal(false);
                      setSelectedContent(null);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border-0 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Viewer body */}
              <div className="flex-1 bg-slate-100 p-4 md:p-6 flex flex-col justify-center relative overflow-y-auto">
                {isYouTube ? (
                  <iframe 
                    src={embedUrl} 
                    title={selectedContent.title}
                    className="w-full h-full rounded-2xl bg-black shadow-inner border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : selectedContent.type === 'video' && !googleFileMeta.id ? (
                  <CustomVideoPlayer 
                    url={selectedContent.fileData || selectedContent.url}
                    onEnded={() => setClaimCountdown(0)}
                  />
                ) : selectedContent.fileData ? (
                  <div className="bg-white rounded-3xl p-8 max-w-2xl mx-auto text-center border border-slate-200 max-h-min space-y-6 shadow-xl leading-relaxed">
                    {selectedContent.fileData.startsWith('data:image/') ? (
                      <div className="overflow-hidden rounded-2xl max-h-[320px] border border-slate-100 flex items-center justify-center p-2 bg-slate-50">
                        <img 
                          src={selectedContent.fileData} 
                          alt={selectedContent.title} 
                          className="max-h-[300px] object-contain shadow-md rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                        <FileText className="w-10 h-10 text-indigo-500" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xl font-black text-slate-800">{selectedContent.title}</h4>
                      <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                        Tệp bài học này đã được lưu trữ an toàn trong kho dữ liệu số phòng bộ môn. Bạn có thể dễ dàng tải xuống học liệu này về thiết bị cá nhân.
                      </p>
                      <div className="mt-4 bg-slate-50 rounded-2xl p-4 border border-slate-100 max-w-sm mx-auto flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>Tên tệp:</span>
                        <span className="text-slate-900 truncate max-w-[200px]">{selectedContent.fileName || 'tai-lieu.pdf'}</span>
                      </div>
                      <div className="mt-2 bg-slate-50 rounded-2xl p-4 border border-slate-100 max-w-sm mx-auto flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>Kích thước:</span>
                        <span className="text-slate-900">{selectedContent.fileSize || 'N/A'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedContent.fileData || '';
                        link.download = selectedContent.fileName || 'tai-lieu-bai-hoc';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 shadow-lg shadow-indigo-600/20 transition-all text-sm border-0 cursor-pointer"
                    >
                      Tải Tài Liệu Bài Học <Download className="w-4 h-4" />
                    </button>
                  </div>
                ) : googleFileMeta.isGoogleDoc ? (
                  <iframe 
                    src={embedUrl} 
                    title={selectedContent.title}
                    className="w-full h-full rounded-2xl bg-white shadow-inner border border-slate-200"
                    allowFullScreen
                    onError={() => console.error("Could not load Google Doc Embed")}
                  />
                ) : (
                  <div className="bg-white rounded-3xl p-8 max-w-lg mx-auto text-center border border-slate-200 max-h-min space-y-6">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                      <Link className="w-10 h-10 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-800">Cổng truy cập tài nguyên bên ngoài</h4>
                      <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
                        Tài liệu này được lưu trữ tại liên kết ngoài trường học. Vui lòng sử dụng liên kết dưới đây để truy cập an toàn.
                      </p>
                    </div>
                    <a 
                      href={selectedContent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 shadow-lg shadow-indigo-600/20 transition-all text-sm"
                    >
                      Mở liên kết gốc <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CUSTOM DELETE CONFIRMATION */}
      <AnimatePresence>
        {deleteConfirmIndex !== null && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 p-6 md:p-8 space-y-6 text-center leading-relaxed"
            >
              <div className="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Trash2 className="w-8 h-8 animate-bounce" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-display font-black text-xl text-slate-800">Xác nhận xóa tài liệu?</h3>
                <p className="text-slate-500 text-sm">
                  Bạn có chắc chắn muốn xóa học liệu này không? <br/>
                  Hành động này sẽ loại bỏ học liệu khỏi phòng học bộ môn.
                </p>
              </div>

              {/* Explicit buttons matching user phrase: "ấn vào nút xóa hiện lên có muốn xóa hay không, nếu có ấn xóa, nếu không ấn hủy" */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmIndex(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors border-0 cursor-pointer"
                >
                  Không, ấn hủy
                </button>
                <button
                  onClick={confirmDeleteContent}
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/15 transition-all border-0 cursor-pointer"
                >
                  Có, ấn xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
