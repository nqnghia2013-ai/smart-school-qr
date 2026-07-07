const fs = require('fs');
let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');

code = code.replace(
  "import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';",
  "import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';"
);

code = code.replace(
  "  Music,\n  Presentation\n} from 'lucide-react';",
  "  Music,\n  Presentation,\n  CheckCircle\n} from 'lucide-react';"
);

const approveFunc = `
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

  const isAdminOrTeacher = currentUser?.role === 'admin' || currentUser?.role === 'teacher';`;

code = code.replace(
  "  const isAdminOrTeacher = currentUser?.role === 'admin' || currentUser?.role === 'teacher';",
  approveFunc
);

const oldButtons = `            {(isAdminOrTeacher || currentUser?.id === doc.uploaderId) && (
               <button 
                  onClick={(e) => { e.stopPropagation(); setDocToDelete(doc); }}
                  className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Xóa tài liệu"
               >
                  <Trash2 className="w-4 h-4" />
               </button>
            )}`;

const newButtons = `            {(isAdminOrTeacher || currentUser?.id === doc.uploaderId) && (
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
            )}`;

code = code.replace(oldButtons, newButtons);

fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
console.log("Patched!");
