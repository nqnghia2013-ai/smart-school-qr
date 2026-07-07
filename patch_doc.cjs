const fs = require('fs');
let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');

// 1. Update Document type
code = code.replace(
  "  subject: string;",
  "  subject: string;\n  classLevel?: string;"
);

// 2. Update SUBJECTS
code = code.replace(
  "const SUBJECTS = ['Tất cả', 'Toán học', 'Vật lý', 'Hóa học', 'Tiếng Anh', 'Lịch sử', 'Ngữ văn', 'Giáo dục công dân', 'Tiếng Trung', 'Tiếng Pháp', 'Tiếng Nga', 'Hoạt động trải nghiệm', 'Giáo dục địa phương', 'Âm nhạc', 'Mỹ thuật', 'Tin học', 'Công nghệ', 'Địa lý', 'Giáo dục thể chất'];",
  "const SUBJECTS = ['Tất cả', 'Toán học', 'Khoa học tự nhiên', 'Tiếng Anh', 'Lịch sử', 'Ngữ văn', 'Giáo dục công dân', 'Tiếng Trung', 'Tiếng Pháp', 'Tiếng Nga', 'Hoạt động trải nghiệm', 'Giáo dục địa phương', 'Âm nhạc', 'Mỹ thuật', 'Tin học', 'Công nghệ', 'Địa lý', 'Giáo dục thể chất'];\nconst CLASS_LEVELS = ['Tất cả', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'];"
);

// 3. Add state for class levels
code = code.replace(
  "  const [selectedSubject, setSelectedSubject] = useState('Tất cả');",
  "  const [selectedSubject, setSelectedSubject] = useState('Tất cả');\n  const [selectedClassLevel, setSelectedClassLevel] = useState('Tất cả');"
);

code = code.replace(
  "  const [uploadSubject, setUploadSubject] = useState(SUBJECTS[1]);",
  "  const [uploadSubject, setUploadSubject] = useState(SUBJECTS[1]);\n  const [uploadClassLevel, setUploadClassLevel] = useState(CLASS_LEVELS[1]);"
);

code = code.replace(
  "  const [newFolderSubject, setNewFolderSubject] = useState(SUBJECTS[1]);",
  "  const [newFolderSubject, setNewFolderSubject] = useState(SUBJECTS[1]);\n  const [newFolderClassLevel, setNewFolderClassLevel] = useState(CLASS_LEVELS[1]);"
);

// 4. Update filters
code = code.replace(
  "    const matchesType = selectedType === 'all' || doc.type === selectedType;\n    return matchesSearch && matchesSubject && matchesType;",
  "    const matchesType = selectedType === 'all' || doc.type === selectedType;\n    const matchesClass = selectedClassLevel === 'Tất cả' || doc.classLevel === selectedClassLevel || !doc.classLevel;\n    return matchesSearch && matchesSubject && matchesType && matchesClass;"
);

// 5. Update UI filter
code = code.replace(
  "            onChange={(e) => setSelectedSubject(e.target.value)}",
  "            onChange={(e) => setSelectedSubject(e.target.value)}"
);

const searchBarCode = `<div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Tìm kiếm tên tài liệu..."
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
          />
        </div>
        
        <div className="shrink-0">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full md:w-auto px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-slate-700 bg-white"
          >
            {SUBJECTS.map(subj => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>
        </div>`;

const searchBarNewCode = `<div className="flex-1 relative">
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
        </div>`;

code = code.replace(searchBarCode, searchBarNewCode);

// 6. Fix missing code inside upload API payload and DB setDoc
code = code.replace(
  "            title: item.title,\n            subject: uploadSubject,\n            type: uploadType,\n            content: item.content,",
  "            title: item.title,\n            subject: uploadSubject,\n            classLevel: uploadClassLevel,\n            type: uploadType,\n            content: item.content,"
);

code = code.replace(
  "          title: item.title,\n          subject: uploadSubject,\n          type: uploadType,\n          size: item.size,",
  "          title: item.title,\n          subject: uploadSubject,\n          classLevel: uploadClassLevel,\n          type: uploadType,\n          size: item.size,"
);

// Add classLevel to document UI
code = code.replace(
  `            <div className="mb-2">\n              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">{doc.subject}</span>\n            </div>`,
  `            <div className="mb-2 flex flex-wrap gap-2">\n              {doc.classLevel && doc.classLevel !== 'Tất cả' && <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600">{doc.classLevel}</span>}\n              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">{doc.subject}</span>\n            </div>`
);

// Fix Folder creation with classLevel
code = code.replace(
  "      subject: newFolderSubject,\n      type: 'folder',",
  "      subject: newFolderSubject,\n      classLevel: newFolderClassLevel,\n      type: 'folder',"
);

// Replace UI for folder creation subject
const createFolderCode = `<label className="block text-sm font-bold text-slate-700 mb-2">Môn học</label>
              <select
                value={newFolderSubject}
                onChange={(e) => setNewFolderSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              >
                {SUBJECTS.filter(s => s !== 'Tất cả').map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>`;

const createFolderNewCode = `<div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Lớp</label>
                <select
                  value={newFolderClassLevel}
                  onChange={(e) => setNewFolderClassLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                >
                  {CLASS_LEVELS.filter(c => c !== 'Tất cả').map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Môn học</label>
                <select
                  value={newFolderSubject}
                  onChange={(e) => setNewFolderSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                >
                  {SUBJECTS.filter(s => s !== 'Tất cả').map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>
            </div>`;

code = code.replace(createFolderCode, createFolderNewCode);


// Replace UI for document upload subject
const uploadSubjectCode = `<div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">Môn học</label>
              <select
                value={uploadSubject}
                onChange={(e) => setUploadSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              >
                {SUBJECTS.filter(s => s !== 'Tất cả').map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>`;

const uploadSubjectNewCode = `<div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Lớp</label>
                <select
                  value={uploadClassLevel}
                  onChange={(e) => setUploadClassLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                >
                  {CLASS_LEVELS.filter(c => c !== 'Tất cả').map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Môn học</label>
                <select
                  value={uploadSubject}
                  onChange={(e) => setUploadSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                >
                  {SUBJECTS.filter(s => s !== 'Tất cả').map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>
            </div>`;
            
code = code.replace(uploadSubjectCode, uploadSubjectNewCode);

fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
console.log("Patched doc library");
