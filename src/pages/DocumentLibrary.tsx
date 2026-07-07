import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Folder, FolderPlus, FileText, 
  Video, 
  Search, 
  Download, 
  FolderOpen, 
  FileBox,
  Eye,
  Upload,
  X,
  Trash2,
  ShieldAlert,
  Bot,
  AlertTriangle,
  Loader2,
  Plus,
  Music,
  Presentation,
  CheckCircle
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';

type Document = {
  id: string;
  title: string;
  subject: string;
  classLevel?: string;
  type: 'pdf' | 'docx' | 'video' | 'folder' | 'audio' | 'ppt';
  parentId?: string | null;
  size: string;
  uploadDate: string;
  downloads: number;
  url: string;
  uploaderId?: string;
  uploaderName?: string;
  status?: 'approved' | 'pending' | 'rejected';
};

const MOCK_DOCS: Document[] = [];

const SUBJECTS = ['Tất cả', 'Toán học', 'Khoa học tự nhiên', 'Tiếng Anh', 'Lịch sử', 'Ngữ văn', 'Giáo dục công dân', 'Tiếng Trung', 'Tiếng Pháp', 'Tiếng Nga', 'Hoạt động trải nghiệm', 'Giáo dục địa phương', 'Âm nhạc', 'Mỹ thuật', 'Tin học', 'Công nghệ', 'Địa lý', 'Giáo dục thể chất'];
const CLASS_LEVELS = ['Tất cả', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'];

export default function DocumentLibrary() {
  const { currentUser, addNotification, showToast } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Tất cả');
  const [selectedClassLevel, setSelectedClassLevel] = useState('Tất cả');
  const [selectedType, setSelectedType] = useState<'all' | 'pdf' | 'docx' | 'video' | 'audio' | 'ppt'>('all');
  const [documents, setDocuments] = useState<Document[]>([]);

  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, 'documents'), snapshot => {
      setDocuments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Document)));
    });
    return unsub;
  }, []);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'drive' | 'local'>('drive');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState(SUBJECTS[1]);
  const [uploadClassLevel, setUploadClassLevel] = useState(CLASS_LEVELS[1]);
  const [uploadType, setUploadType] = useState<Document['type']>('pdf');
  const [uploadLink, setUploadLink] = useState('');
  const [bulkDriveItems, setBulkDriveItems] = useState([{ title: '', link: '' }]);
  
  const handleAddBulkItem = () => {
    setBulkDriveItems([...bulkDriveItems, { title: '', link: '' }]);
  };
  
  const handleRemoveBulkItem = (index: number) => {
    setBulkDriveItems(bulkDriveItems.filter((_, i) => i !== index));
  };
  
  const handleUpdateBulkItem = (index: number, field: 'title' | 'link', value: string) => {
    const newItems = [...bulkDriveItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setBulkDriveItems(newItems);
  };

  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderSubject, setNewFolderSubject] = useState(SUBJECTS[1]);
  const [newFolderClassLevel, setNewFolderClassLevel] = useState(CLASS_LEVELS[1]);
  
  const currentFolder = documents.find(d => d.id === currentFolderId);
  const handleBackFolder = () => {
    setCurrentFolderId(currentFolder?.parentId || null);
  };
  
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const id = Date.now().toString();
    const newDoc: Document = {
      id,
      title: newFolderName,
      subject: newFolderSubject,
      classLevel: newFolderClassLevel,
      type: 'folder',
      size: '',
      uploadDate: new Date().toLocaleDateString('vi-VN'),
      downloads: 0,
      url: '',
      uploaderId: currentUser?.id,
      uploaderName: currentUser?.fullName,
      status: 'approved',
      parentId: currentFolderId
    };
    try {
      // Assuming setDoc and doc are imported
      await setDoc(doc(db, 'documents', id), newDoc);
      setNewFolderName('');
      setNewFolderSubject(SUBJECTS[1]);
      setIsCreateFolderModalOpen(false);
      showToast('Tạo mục mới thành công', 'success');
    } catch (e) {
      console.error(e);
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const [isScanning, setIsScanning] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getGoogleFileId = (urlStr: string): { id: string | null; type: 'document' | 'spreadsheets' | 'presentation' | 'forms' | 'file' } => {
    if (!urlStr) return { id: null, type: 'file' };

    const docRegex = /\/document\/d\/([a-zA-Z0-9-_]+)/;
    const docMatch = urlStr.match(docRegex);
    if (docMatch) return { id: docMatch[1], type: 'document' };

    const sheetRegex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const sheetMatch = urlStr.match(sheetRegex);
    if (sheetMatch) return { id: sheetMatch[1], type: 'spreadsheets' };

    const slidesRegex = /\/presentation\/d\/([a-zA-Z0-9-_]+)/;
    const slidesMatch = urlStr.match(slidesRegex);
    if (slidesMatch) return { id: slidesMatch[1], type: 'presentation' };

    const formRegex = /\/forms\/d\/([a-zA-Z0-9-_/]+)/;
    const formMatch = urlStr.match(formRegex);
    if (formMatch) return { id: formMatch[1], type: 'forms' };

    const fileRegex = /\/file\/d\/([a-zA-Z0-9-_]+)/;
    const fileMatch = urlStr.match(fileRegex);
    if (fileMatch) return { id: fileMatch[1], type: 'file' };

    return { id: null, type: 'file' };
  };

  const getEmbedUrl = (doc: Document) => {
    if (!doc.url) return '';
    const fileIdMeta = getGoogleFileId(doc.url);
    if (fileIdMeta.id) {
      if (fileIdMeta.type === 'forms') {
        return `https://docs.google.com/forms/d/${fileIdMeta.id}/viewform?embedded=true`;
      } else if (fileIdMeta.type === 'file') {
        return `https://drive.google.com/file/d/${fileIdMeta.id}/preview`;
      } else {
        return `https://docs.google.com/${fileIdMeta.type}/d/${fileIdMeta.id}/preview`;
      }
    }
    return doc.url;
  };

  const confirmDelete = () => {
    if (!docToDelete) return;
    
    // Nếu là admin xóa tài liệu của người khác
    if (docToDelete.uploaderId !== currentUser?.id && docToDelete.uploaderId) {
       addNotification({
         title: 'Tài liệu của bạn đã bị Quản trị viên xóa',
         message: `Quản trị viên đã xóa tài liệu "${docToDelete.title}" của bạn khỏi Thư viện chung.`,
         type: 'error',
         userId: docToDelete.uploaderId
       });
    }

    deleteDoc(doc(db, 'documents', docToDelete.id)).catch(console.error);
    setDocToDelete(null);
  };

  const handleFormUpload = async () => {
    if (!currentUser) {
      showToast('Vui lòng đăng nhập để tải lên tài liệu!', 'error');
      return;
    }

    let itemsToProcess: { title: string, url: string, content: string, size: string }[] = [];

    if (uploadMethod === 'local') {
      if (!uploadTitle.trim()) {
        alert("Vui lòng nhập tiêu đề tài liệu!");
        return;
      }
      if (!fileInputRef.current?.files?.[0]) {
        alert("Vui lòng chọn một tệp để tải lên!");
        return;
      }
      const file = fileInputRef.current.files[0];
      const fileUrl = URL.createObjectURL(file);
      const fileSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      let fileContent = '';
      
      const isMedia = file.type.startsWith('video/') || file.type.startsWith('audio/');
      if (!isMedia && file.size < 5 * 1024 * 1024) {
        const reader = new FileReader();
        const readPromise = new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string || "");
          reader.onerror = () => resolve("");
          reader.readAsDataURL(file);
        });
        fileContent = await readPromise;
      } else if (file.size >= 5 * 1024 * 1024) {
        fileContent = "(Tài liệu quá lớn, AI chỉ duyệt dựa trên tiêu đề)";
      } else {
        fileContent = "(File đa phương tiện, AI chỉ duyệt dựa trên tiêu đề)";
      }
      itemsToProcess.push({ title: uploadTitle.trim(), url: fileUrl, content: fileContent, size: fileSize });
    } else {
      // Bulk Google Drive Upload
      const validItems = bulkDriveItems.filter(item => item.title.trim() && item.link.trim());
      if (validItems.length === 0) {
        alert("Có lỗi: Bạn phải nhập ĐẦY ĐỦ cả Tiêu đề VÀ Liên kết cho ít nhất một tài liệu! Nếu chỉ nhập tiêu đề mà quên liên kết (hoặc ngược lại), hệ thống sẽ không chấp nhận.");
        return;
      }
      for (const item of validItems) {
        itemsToProcess.push({
          title: item.title.trim(),
          url: item.link.trim(),
          content: '',
          size: 'Đã liên kết Drive'
        });
      }
    }

    // AI SCANNING PHASE
    setIsScanning(true);
    
    try {
      let anyBad = false;
      const timestamp = Date.now();
      
      const scanPromises = itemsToProcess.map(item => 
        fetch('/api/scan-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: item.title,
            subject: uploadSubject,
            classLevel: uploadClassLevel,
            type: uploadType,
            content: item.content,
            link: uploadMethod === 'drive' ? item.url : null
          })
        }).then(res => res.json()).then(result => ({ item, result }))
      );

      const scanResults = await Promise.all(scanPromises);

      for (let i = 0; i < scanResults.length; i++) {
        const { item, result } = scanResults[i];
        const isBad = !result.isSafe;
        const id = (timestamp + i).toString();

        const newDoc: Document = {
          id,
          title: item.title,
          subject: uploadSubject,
          classLevel: uploadClassLevel,
          type: uploadType,
          size: item.size,
          uploadDate: new Date().toLocaleDateString('vi-VN'),
          downloads: 0,
          url: item.url,
          uploaderId: currentUser.id,
          uploaderName: currentUser.fullName,
          parentId: currentFolderId || null,
          status: isBad ? 'pending' : 'approved'
        };

        await setDoc(doc(db, 'documents', id), JSON.parse(JSON.stringify(newDoc)));

        if (isBad) {
          anyBad = true;
          addNotification({
            title: '[AI] Hệ thống phát hiện tài liệu vi phạm',
            message: `Hệ thống AI vừa quét và phát hiện học sinh ${currentUser.fullName} tải lên tài liệu có dấu hiệu vi phạm: "${item.title}". Lý do: ${result.reason || 'Nội dung không phù hợp'}. Vui lòng kiểm duyệt và xóa ngay nếu cần.`,
            type: 'warning',
          });
          addNotification({
            title: 'Tài liệu đang bị AI từ chối và chờ duyệt',
            message: `Tài liệu "${item.title}" của bạn chứa nội dung có thể vi phạm tiêu chuẩn của trường. Báo cáo đã gửi cho Ban Giám Hiệu.`,
            type: 'error',
            userId: currentUser.id
          });
        }
      }

      setIsScanning(false);
      setIsUploadModalOpen(false);

      if (anyBad) {
        showToast('Một số tài liệu đã bị từ chối do vi phạm quy định', 'error');
      } else {
        showToast('AI đã duyệt, đã tải tài liệu lên thành công', 'success');
      }
      
      setUploadTitle('');
      setUploadLink('');
      setBulkDriveItems([{ title: '', link: '' }]);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error) {
      console.error("Lỗi khi gọi AI quét tài liệu:", error);
      setIsScanning(false);
      showToast('Đã xảy ra lỗi khi AI quét tài liệu. Không thể tải lên lúc này.', 'error');
    }
  };


  const handleApproveDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'documents', id), {
        status: 'approved'
      });
      showToast('Đã duyệt tài liệu thành công!', 'success');
    } catch (error) {
      console.error('Lỗi khi duyệt tài liệu:', error);
      showToast('Lỗi khi duyệt tài liệu', 'error');
    }
  };

  const isAdminOrTeacher = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  const visibleDocs = documents.filter(doc => {
    // Filter by folder first
    const docParentId = doc.parentId || null;
    if (docParentId !== currentFolderId) return false;

    // Nếu tài liệu đang pending / rejected
    if (doc.status === 'pending' || doc.status === 'rejected') {
       if (isAdminOrTeacher) return true; // admin/teacher thấy để duyệt
       if (currentUser?.id === doc.uploaderId) return true; // người đăng thấy
       return false;
    }
    return true;
  });

  const filteredDocs = visibleDocs.filter(doc => {
    const title = doc.title || '';
    const search = searchTerm || '';
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === 'Tất cả' || doc.subject === selectedSubject;
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesClass = selectedClassLevel === 'Tất cả' || doc.classLevel === selectedClassLevel || !doc.classLevel;
    return matchesSearch && matchesSubject && matchesType && matchesClass;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-8 h-8 text-rose-500" />;
      case 'docx': return <FileBox className="w-8 h-8 text-blue-500" />;
      case 'video': return <Video className="w-8 h-8 text-purple-500" />;
      case 'audio': return <Music className="w-8 h-8 text-teal-500" />;
      case 'ppt': return <Presentation className="w-8 h-8 text-orange-500" />;
      case 'folder': return <Folder className="w-8 h-8 text-amber-500" fill="currentColor" />;
      default: return <FileText className="w-8 h-8 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <FolderOpen className="w-8 h-8" />
              Thư viện Tài liệu chung
            </h1>
            <p className="text-blue-100 max-w-2xl text-lg">
              Khám phá, tải về và tiện lợi ôn tập với hàng ngàn bài giảng, đề thi và tài liệu được chia sẻ từ các giáo viên trong trường.
            </p>
          </div>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all shrink-0"
          >
            <Upload className="w-5 h-5" />
            Tải lên tài liệu
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          {currentFolderId && (
            <button onClick={handleBackFolder} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-semibold text-sm">
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </button>
          )}
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {currentFolderId ? (
              <>
                <Folder className="w-5 h-5 text-amber-500" fill="currentColor" />
                {currentFolder?.title}
              </>
            ) : 'Thư mục gốc'}
          </h2>
        </div>
        <button 
          onClick={() => setIsCreateFolderModalOpen(true)}
          className="flex items-center gap-2 bg-amber-100 text-amber-700 hover:bg-amber-200 px-4 py-2 rounded-xl font-bold text-sm transition-colors"
        >
          <FolderPlus className="w-4 h-4" /> Tạo mục mới
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Tìm kiếm tên tài liệu..."
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
          />
        </div>
        
        <div className="shrink-0 flex gap-2">
          <select
            value={selectedClassLevel}
            onChange={(e) => setSelectedClassLevel(e.target.value)}
            className="w-full md:w-auto px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-slate-700 bg-white"
          >
            {CLASS_LEVELS.map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full md:w-auto px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-slate-700 bg-white"
          >
            {SUBJECTS.map(subj => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => setSelectedType('all')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${selectedType === 'all' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          Tất cả định dạng
        </button>
        <button 
          onClick={() => setSelectedType('pdf')}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${selectedType === 'pdf' ? 'bg-rose-100 text-rose-700' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <FileText className="w-4 h-4" /> PDF
        </button>
        <button 
          onClick={() => setSelectedType('docx')}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${selectedType === 'docx' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <FileBox className="w-4 h-4" /> Word
        </button>
        <button 
          onClick={() => setSelectedType('video')}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${selectedType === 'video' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <Video className="w-4 h-4" /> Video bài giảng
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDocs.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white p-5 rounded-2xl shadow-sm border ${doc.status === 'pending' ? 'border-rose-300 bg-rose-50/30' : 'border-slate-100'} hover:shadow-lg hover:border-indigo-300 transition-all group flex flex-col h-full relative overflow-hidden`}
          >
            {(isAdminOrTeacher || currentUser?.id === doc.uploaderId) && (
               <div className="absolute top-4 right-4 flex flex-col md:flex-row items-center gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                 {isAdminOrTeacher && (doc.status === 'pending' || doc.status === 'rejected') && (
                   <button 
                      onClick={(e) => handleApproveDocument(doc.id, e)}
                      className="p-2 bg-white hover:bg-emerald-50 text-emerald-500 hover:text-emerald-600 rounded-full shadow-sm border border-emerald-100 transition-colors"
                      title="Duyệt tài liệu này"
                   >
                      <CheckCircle className="w-4 h-4" />
                   </button>
                 )}
                 <button 
                    onClick={(e) => { e.stopPropagation(); setDocToDelete(doc); }}
                    className="p-2 bg-white hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded-full shadow-sm border border-rose-100 transition-colors"
                    title="Xóa tài liệu"
                 >
                    <Trash2 className="w-4 h-4" />
                 </button>
               </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                {getIcon(doc.type)}
              </div>
              {doc.status === 'pending' && (
                <div className="flex items-center gap-1 bg-rose-100 text-rose-700 text-xs font-bold px-2 py-1 rounded-lg">
                  <ShieldAlert className="w-3 h-3" /> Chờ duyệt
                </div>
              )}
            </div>
            
            <div className="mb-2 flex flex-wrap gap-2">
              {doc.classLevel && doc.classLevel !== 'Tất cả' && <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600">{doc.classLevel}</span>}
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">{doc.subject}</span>
            </div>
            
            <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 flex-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
              {doc.title}
            </h3>
            
            {doc.uploaderName && (
              <p className="text-sm text-slate-500 mb-4 font-medium flex items-center gap-1">
                 Đăng bởi: <span className="text-slate-700">{doc.uploaderName}</span>
              </p>
            )}
            
            <div className="flex items-center justify-between text-sm text-slate-500 mb-4 font-medium">
              {doc.type === 'folder' ? (
                <span>Thư mục</span>
              ) : (
                <>
                  <span>{doc.size}</span>
                  <span>{doc.downloads} lượt tải</span>
                </>
              )}
            </div>
            
            <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
              {doc.type === 'folder' ? (
                <button 
                  onClick={() => setCurrentFolderId(doc.id)} 
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold py-2.5 rounded-xl transition-colors"
                >
                  <FolderOpen className="w-4 h-4" /> Mở thư mục
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setViewingDoc(doc)} 
                    disabled={doc.status === 'pending'}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-50 disabled:opacity-50 disabled:hover:bg-slate-50 text-slate-700 hover:text-indigo-600 font-bold py-2.5 rounded-xl transition-colors"
                    title={doc.status === 'pending' ? 'Tài liệu đang chờ duyệt' : 'Xem tài liệu'}
                  >
                    <Eye className="w-4 h-4" /> Xem
                  </button>
                  <a 
                    href={doc.status === 'pending' ? '#' : doc.url} 
                    download={doc.status !== 'pending'} 
                    className={`flex-1 flex items-center justify-center gap-2 font-bold py-2.5 rounded-xl shadow-md transition-all ${doc.status === 'pending' ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5'}`}
                    onClick={e => doc.status === 'pending' && e.preventDefault()}
                  >
                    <Download className="w-4 h-4" /> Tải về
                  </a>
                </>
              )}
            </div>
          </motion.div>
        ))}
        {filteredDocs.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 font-medium">
             Chưa có tài liệu nào. Hãy là người đầu tiên đóng góp tài liệu nhé!
          </div>
        )}
      </div>

      {isCreateFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setIsCreateFolderModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <FolderPlus className="w-6 h-6 text-amber-500" /> Tạo mục mới
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tên mục / Thư mục</label>
                <input 
                  type="text" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nhập tên thư mục..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Môn học</label>
                <select
                  value={newFolderSubject}
                  onChange={(e) => setNewFolderSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 bg-white"
                >
                  {SUBJECTS.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={handleCreateFolder}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/30"
              >
                Tạo mới
              </button>
            </div>
          </div>
        </div>
      )}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a1 1 0 0 1-.675.675L3 12l5.813 1.912a1 1 0 0 1 .675.675L12 21l1.912-5.813a1 1 0 0 1 .675-.675L20.4 12l-5.813-1.912a1 1 0 0 1-.675-.675L12 3ZM19 4l-1 3-3 1 3 1 1 3 1-3 3-1-3-1-1-3Z"/></svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800">Liên Kết Học Liệu Giáo Án Số</h2>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Left Column - Form */}
              <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto border-r border-slate-100">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-500 mb-2 uppercase">PHƯƠNG THỨC NẠP</label>
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                      <button 
                        className={`flex-1 py-2 font-bold text-sm rounded-lg transition-colors ${uploadMethod === 'drive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setUploadMethod('drive')}
                      >
                        Nhập Link / Google Drive
                      </button>
                      <button 
                        className={`flex-1 py-2 font-bold text-sm rounded-lg transition-colors ${uploadMethod === 'local' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setUploadMethod('local')}
                      >
                        Tải tệp Máy tính lên
                      </button>
                    </div>
                  </div>

                  {uploadMethod === 'local' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề học liệu</label>
                      <input type="text" value={uploadTitle || ''} onChange={e => setUploadTitle(e.target.value)} placeholder="vd: Giáo án thực hành Lý thuyết L1" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                    </div>
                  )}

                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Môn học</label>
                     <select value={uploadSubject || SUBJECTS[1]} onChange={e => setUploadSubject(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white">
                        {SUBJECTS.filter(s => s !== 'Tất cả').map(subj => (
                           <option key={subj} value={subj}>{subj}</option>
                        ))}
                     </select>
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Định dạng tài liệu</label>
                     <select value={uploadType || 'pdf'} onChange={e => setUploadType(e.target.value as any)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white">
                        <option value="pdf">PDF (.pdf)</option>
                        <option value="docx">Word (.doc, .docx)</option>
                        <option value="video">Video (.mp4, .avi)</option>
                        <option value="audio">Âm thanh (.mp3, .wav)</option>
                        <option value="ppt">PowerPoint (.ppt, .pptx)</option>
                     </select>
                  </div>

                  {uploadMethod === 'drive' ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-bold text-slate-700">Danh sách tài liệu Google Drive</label>
                        <button onClick={handleAddBulkItem} className="text-indigo-600 hover:text-indigo-700 text-xs font-bold px-3 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1 transition-colors">
                          <Plus className="w-3 h-3" /> Thêm tệp
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">Hỗ trợ đầy đủ các dạng liên kết: document, spreadsheets, presentation, hoặc forms. AI sẽ quét toàn bộ danh sách cùng lúc.</p>
                      
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {bulkDriveItems.map((item, index) => (
                          <div key={index} className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 relative group">
                            <div className="flex-1 space-y-2">
                              <input type="text" value={item.title} onChange={e => handleUpdateBulkItem(index, 'title', e.target.value)} placeholder="Tiêu đề tài liệu..." className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-indigo-500" />
                              <input type="text" value={item.link} onChange={e => handleUpdateBulkItem(index, 'link', e.target.value)} placeholder="Dán link Google Drive..." className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-indigo-500" />
                            </div>
                            {bulkDriveItems.length > 1 && (
                              <button onClick={() => handleRemoveBulkItem(index)} className="absolute -right-2 -top-2 bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Tệp tài liệu cần tải lên</label>
                      <input type="file" ref={fileInputRef} onChange={e => {
                        const file = e.target.files?.[0];
                        if(file) {
                          setUploadTitle(file.name);
                          if (file.type.startsWith('video/')) {
                            setUploadType('video');
                          } else if (file.type.startsWith('audio/')) {
                            setUploadType('audio');
                          } else if (file.type.includes('presentation') || file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
                            setUploadType('ppt');
                          } else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
                            setUploadType('docx');
                          } else {
                            setUploadType('pdf');
                          }
                        }
                      }} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white" accept=".pdf,.doc,.docx,.ppt,.pptx,video/*,audio/*" />
                    </div>
                  )}

                  <button 
                     onClick={handleFormUpload} 
                     disabled={isScanning}
                     className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors mt-4 flex items-center justify-center gap-2"
                  >
                     {isScanning ? (
                        <>
                           <Loader2 className="w-5 h-5 animate-spin" />
                           AI Đang quét tài liệu...
                        </>
                     ) : (
                        "Tạo giáo án và nạp dữ liệu"
                     )}
                  </button>
                </div>
              </div>

              {/* Right Column - Drive Connection */}
              <div className="w-full md:w-1/2 bg-slate-50 p-6 md:p-8 flex flex-col items-center justify-center border-l-0 md:border-l border-slate-100 hidden md:flex relative">
                 {isScanning && (
                    <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                       <Bot className="w-16 h-16 text-indigo-600 animate-bounce mb-4" />
                       <h3 className="font-bold text-indigo-900 text-lg">Hệ thống AI Đang Quét</h3>
                       <p className="text-sm text-slate-600 mt-2 text-center px-6">Phân tích nội dung, đối chiếu tiêu chuẩn bạo lực, vi phạm, và độc hại...</p>
                    </div>
                 )}
                 <div className="w-full max-w-sm flex flex-col items-center text-center">
                    <div className="flex items-center gap-2 mb-12 self-start">
                       <svg className="w-6 h-6 text-blue-600" viewBox="0 0 87.3 122.88"><path d="M57.92,106.31H40.61c-8.81,0-16.14-5.26-19.46-12.75L2.83,52.28c-3.13-7-.52-16.19,6.59-19.16 l15.74-6.6l17.48,46.52c1,2.69,3.74,4.52,6.72,4.52h37.94V106.31z M49.37,77.56c2.98,0,5.71-1.83,6.72-4.52L73.57,26.5 l15.74,6.6c7.1,2.98,9.72,12.16,6.59,19.16L77.57,93.56c-3.32,7.49-10.65,12.75-19.46,12.75H49.37z M73.57,26.5c-3.32-7.49-10.65-12.75-19.46-12.75H13.74C4.94,13.75-0.1,23.3,3.22,30.79l15.74-6.6c1.01-2.69,3.74-4.52,6.72-4.52h37.94 L73.57,26.5z" fill="currentColor"/></svg> 
                       <span className="font-bold text-slate-800">Trợ lý Google Workspace Drive</span>
                    </div>

                    <div className="w-24 h-24 mb-6 text-slate-300">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Chưa liên kết Google Drive</h3>
                    <p className="text-slate-500 mb-8 max-w-[280px]">Kết nối với tài khoản Google để chọn và hiển thị các tệp tài liệu Google Docs, Slides, Sheets của bạn dễ dàng.</p>
                    
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-full text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                       <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" fill="#4285F4"/></svg>
                       Liên kết Google Drive
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingDoc && (
        <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-6xl h-[90vh] bg-slate-50 flex flex-col rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  {getIcon(viewingDoc.type)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 leading-tight">{viewingDoc.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">{viewingDoc.subject} • {viewingDoc.size} • Tải lên: {viewingDoc.uploadDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a 
                  href={viewingDoc.url} 
                  download 
                  className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-bold text-sm transition-colors"
                >
                  <Download className="w-4 h-4" /> Tải về máy
                </a>
                <button 
                  onClick={() => setViewingDoc(null)} 
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 overflow-hidden relative p-4 md:p-8">
              {viewingDoc.type === 'video' || viewingDoc.type === 'audio' ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-2xl overflow-hidden shadow-inner border border-slate-800 p-8">
                  {(() => {
                    if (viewingDoc.type === 'audio') {
                      const driveFileMeta = getGoogleFileId(viewingDoc.url || '');
                      if (driveFileMeta.id && driveFileMeta.type === 'file') {
                        return (
                          <iframe 
                            src={`https://drive.google.com/file/d/${driveFileMeta.id}/preview`}
                            title={viewingDoc.title}
                            className="w-full h-64 border-0 rounded-xl"
                            allowFullScreen
                          />
                        );
                      }
                      return (
                        <div className="bg-slate-800 p-12 rounded-3xl flex flex-col items-center gap-8 w-full max-w-md shadow-2xl border border-slate-700">
                          <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center">
                             <Music className="w-12 h-12 text-indigo-400 animate-pulse" />
                          </div>
                          <div className="text-center w-full">
                            <h3 className="text-white font-bold text-xl mb-2 truncate max-w-full px-4">{viewingDoc.title}</h3>
                            <p className="text-slate-400 text-sm mb-6">Trình phát âm thanh</p>
                            <audio 
                              src={viewingDoc.url}
                              controls 
                              className="w-full"
                            />
                          </div>
                        </div>
                      );
                    }
                    const ytMatch = viewingDoc.url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                    const ytId = ytMatch ? ytMatch[1] : null;
                    const driveFileMeta = getGoogleFileId(viewingDoc.url || '');
                    if (ytId) {
                      return (
                        <iframe 
                          src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} 
                          title={viewingDoc.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      );
                    }
                    if (driveFileMeta.id && driveFileMeta.type === 'file') {
                      return (
                        <iframe 
                          src={`https://drive.google.com/file/d/${driveFileMeta.id}/preview`}
                          title={viewingDoc.title}
                          className="w-full h-full border-0"
                          allowFullScreen
                        />
                      );
                    }
                    return (
                      <video 
                        src={viewingDoc.url}
                        controls 
                        className="max-w-full max-h-full"
                        width="100%"
                        height="100%"
                      />
                    );
                  })()}
                </div>
              ) : getEmbedUrl(viewingDoc) ? (
                <iframe 
                  src={getEmbedUrl(viewingDoc)} 
                  title={viewingDoc.title}
                  className="w-full h-full rounded-2xl bg-white shadow-inner border border-slate-200"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                    <FileText className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">Đang tải bản xem trước...</h3>
                  <p className="text-slate-500 max-w-md text-center mb-6">Trình duyệt không hỗ trợ xem trực tiếp hoặc cần thời gian để tải. Vui lòng tải về để xem chi tiết.</p>
                  <a href={viewingDoc.url} download className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl group flex items-center gap-2">
                    <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> Tải Xuống Ngay
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
         {docToDelete && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
               >
                  <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>
                  <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6">
                     <AlertTriangle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3">Xóa tài liệu này?</h3>
                  <p className="text-slate-600 mb-2">Bạn có chắc chắn muốn xóa tài liệu <span className="font-bold text-slate-800">"{docToDelete.title}"</span>?</p>
                  <p className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-6 w-full">Thao tác này là vĩnh viễn và không thể khôi phục lại.</p>
                  
                  <div className="flex gap-3 w-full">
                     <button 
                        onClick={() => setDocToDelete(null)}
                        className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                     >
                        Hủy bỏ
                     </button>
                     <button 
                        onClick={confirmDelete}
                        className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-rose-500/30"
                     >
                        Đồng ý xóa
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
}
