const fs = require('fs');
let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');

const stateDef = `  const [newFolderName, setNewFolderName] = useState('');`;
const newStateDef = `  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderSubject, setNewFolderSubject] = useState(SUBJECTS[1]);`;
code = code.replace(stateDef, newStateDef);

const handleCreate = `    const newDoc: Document = {
      id,
      title: newFolderName,
      subject: 'Tất cả',`;
const newHandleCreate = `    const newDoc: Document = {
      id,
      title: newFolderName,
      subject: newFolderSubject,`;
code = code.replace(handleCreate, newHandleCreate);

const resetState = `      setNewFolderName('');
      setIsCreateFolderModalOpen(false);`;
const newResetState = `      setNewFolderName('');
      setNewFolderSubject(SUBJECTS[1]);
      setIsCreateFolderModalOpen(false);`;
code = code.replace(resetState, newResetState);

const uiCode = `              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tên mục / Thư mục</label>
                <input 
                  type="text" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nhập tên thư mục..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                />
              </div>`;

const newUiCode = `              <div>
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
              </div>`;
code = code.replace(uiCode, newUiCode);

fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
