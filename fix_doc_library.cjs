const fs = require('fs');
let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');

// 1. Update Document type
code = code.replace(
  "type: 'pdf' | 'docx' | 'video';",
  "type: 'pdf' | 'docx' | 'video' | 'folder';\n  parentId?: string | null;"
);

// 2. Add states for folder
const stateInjection = `  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
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
      subject: 'Tất cả',
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
      const { setDoc, doc } = await import('firebase/firestore');
      await setDoc(doc(db, 'documents', id), newDoc);
      setNewFolderName('');
      setIsCreateFolderModalOpen(false);
      showToast('Tạo mục mới thành công', 'success');
    } catch (e) {
      console.error(e);
      showToast('Có lỗi xảy ra', 'error');
    }
  };
`;
code = code.replace(
  "const [docToDelete, setDocToDelete] = useState<Document | null>(null);",
  "const [docToDelete, setDocToDelete] = useState<Document | null>(null);\n" + stateInjection
);

// 3. Update getIcon
code = code.replace(
  "case 'video': return <Video className=\"w-8 h-8 text-purple-500\" />;",
  "case 'video': return <Video className=\"w-8 h-8 text-purple-500\" />;\n      case 'folder': return <Folder className=\"w-8 h-8 text-amber-500\" fill=\"currentColor\" />;"
);

// 4. Update visibleDocs
const visibleDocsOld = `  const visibleDocs = documents.filter(doc => {
    // Nếu tài liệu đang pending / rejected
    if (doc.status === 'pending' || doc.status === 'rejected') {
       if (isAdminOrTeacher) return true; // admin/teacher thấy để duyệt
       if (currentUser?.id === doc.uploaderId) return true; // người đăng thấy
       return false;
    }
    return true;
  });`;
const visibleDocsNew = `  const visibleDocs = documents.filter(doc => {
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
  });`;
code = code.replace(visibleDocsOld, visibleDocsNew);

// 5. Update UI for Upload Modal to include parentId
code = code.replace(
  "uploaderName: currentUser.fullName,",
  "uploaderName: currentUser.fullName,\n          parentId: currentFolderId || null,"
);
// replace again since there are two places (approved and pending)
code = code.replace(
  "uploaderName: currentUser.fullName,",
  "uploaderName: currentUser.fullName,\n          parentId: currentFolderId || null,"
);

fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
