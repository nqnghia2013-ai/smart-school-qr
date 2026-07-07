const fs = require('fs');
let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');

// Ensure Folder is imported from lucide-react
if (!code.includes('Folder,')) {
  code = code.replace("import { FolderOpen", "import { Folder, FolderPlus, FolderOpen");
  code = code.replace("import { FileText, FileBox, Video, Upload, Download, X, Search, CheckCircle2, AlertTriangle, PlayCircle } from 'lucide-react';", "import { FileText, FileBox, Video, Upload, Download, X, Search, CheckCircle2, AlertTriangle, PlayCircle, Folder, FolderPlus, ChevronLeft } from 'lucide-react';");
}

// Add the back button and create folder button to the header area
const searchBarArea = `<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">`;
const newSearchBarArea = `<div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
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

      ` + searchBarArea;
code = code.replace(searchBarArea, newSearchBarArea);

// Handle clicking on a folder
const cardClickMatch = `onClick={() => setViewingDoc(doc)}`;
const newCardClickMatch = `onClick={() => doc.type === 'folder' ? setCurrentFolderId(doc.id) : setViewingDoc(doc)}`;
code = code.replace(cardClickMatch, newCardClickMatch);

// Ensure db import for create folder if it's missing (it should be there since onSnapshot works, but let's check if we used setDoc)
// The modal for creating a folder:
const uploadModal = `{isUploadModalOpen && (`;
const createFolderModal = `{isCreateFolderModalOpen && (
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
      ` + uploadModal;
code = code.replace(uploadModal, createFolderModal);

// Modify document card to hide size/downloads for folders if we want, or just let them display
// We'll replace the action buttons for folder so they don't show "Xem chi tiết" if it's a folder, maybe just "Mở thư mục"
const cardActions = `<div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">`;
const newCardActions = `<div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                {doc.type === 'folder' ? (
                  <span className="text-amber-600 font-bold text-sm">Mở mục</span>
                ) : (
                  <>
                    <span className="text-indigo-600 font-bold text-sm group-hover:underline">Xem chi tiết</span>
                  </>
                )}
`;
// Wait, doing string replace on large blocks is brittle.
// I will just let it be for now.

fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
