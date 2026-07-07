const fs = require('fs');
let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');

const oldActions = `<div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
              <button 
                onClick={() => doc.type === 'folder' ? setCurrentFolderId(doc.id) : setViewingDoc(doc)} 
                disabled={doc.status === 'pending'}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-50 disabled:opacity-50 disabled:hover:bg-slate-50 text-slate-700 hover:text-indigo-600 font-bold py-2.5 rounded-xl transition-colors"
                title={doc.status === 'pending' ? 'Tài liệu đang chờ duyệt' : 'Xem tài liệu'}
              >
                <Eye className="w-4 h-4" /> Xem
              </button>
              <a 
                href={doc.status === 'pending' ? '#' : doc.url} 
                download={doc.status !== 'pending'} 
                className={\`flex-1 flex items-center justify-center gap-2 font-bold py-2.5 rounded-xl shadow-md transition-all \${doc.status === 'pending' ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5'}\`}
                onClick={e => doc.status === 'pending' && e.preventDefault()}
              >
                <Download className="w-4 h-4" /> Tải về
              </a>
            </div>`;

const newActions = `<div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
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
                    className={\`flex-1 flex items-center justify-center gap-2 font-bold py-2.5 rounded-xl shadow-md transition-all \${doc.status === 'pending' ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5'}\`}
                    onClick={e => doc.status === 'pending' && e.preventDefault()}
                  >
                    <Download className="w-4 h-4" /> Tải về
                  </a>
                </>
              )}
            </div>`;

code = code.replace(oldActions, newActions);
fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
