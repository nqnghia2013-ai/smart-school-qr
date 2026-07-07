const fs = require('fs');
let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');

// 1. Add icons to imports
code = code.replace(
  '  Loader2,\n  Plus\n} from \'lucide-react\';',
  '  Loader2,\n  Plus,\n  Music,\n  Presentation\n} from \'lucide-react\';'
);

// 2. Add types to Document type
code = code.replace(
  "  type: 'pdf' | 'docx' | 'video' | 'folder';",
  "  type: 'pdf' | 'docx' | 'video' | 'folder' | 'audio' | 'ppt';"
);

// 3. Update selectedType state
code = code.replace(
  "const [selectedType, setSelectedType] = useState<'all' | 'pdf' | 'docx' | 'video'>('all');",
  "const [selectedType, setSelectedType] = useState<'all' | 'pdf' | 'docx' | 'video' | 'audio' | 'ppt'>('all');"
);

// 4. Update getIcon
code = code.replace(
  "      case 'video': return <Video className=\"w-8 h-8 text-purple-500\" />;",
  "      case 'video': return <Video className=\"w-8 h-8 text-purple-500\" />;\n      case 'audio': return <Music className=\"w-8 h-8 text-teal-500\" />;\n      case 'ppt': return <Presentation className=\"w-8 h-8 text-orange-500\" />;"
);

// 5. Update filter buttons
const filterButtons = `<button 
          onClick={() => setSelectedType('video')}
          className={\`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors \${selectedType === 'video' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-100'}\`}
        >
          <Video className="w-4 h-4" /> Video
        </button>`;
const newFilterButtons = filterButtons + `\n        <button 
          onClick={() => setSelectedType('audio')}
          className={\`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors \${selectedType === 'audio' ? 'bg-teal-100 text-teal-700' : 'text-slate-500 hover:bg-slate-100'}\`}
        >
          <Music className="w-4 h-4" /> Âm thanh
        </button>
        <button 
          onClick={() => setSelectedType('ppt')}
          className={\`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors \${selectedType === 'ppt' ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:bg-slate-100'}\`}
        >
          <Presentation className="w-4 h-4" /> Bài giảng
        </button>`;
code = code.replace(filterButtons, newFilterButtons);

// 6. Update options in upload form
const uploadOptions = `<option value="video">Video (.mp4, .avi)</option>`;
const newUploadOptions = uploadOptions + `\n                        <option value="audio">Âm thanh (.mp3, .wav)</option>\n                        <option value="ppt">PowerPoint (.ppt, .pptx)</option>`;
code = code.replace(uploadOptions, newUploadOptions);

// 7. Update handleUpload file detection
const typeDetection = `if (file.type.startsWith('video/')) {
        fileContent = "(File video, AI chỉ duyệt dựa trên tiêu đề)";
      }`;

// Wait, the logic for local upload content scanning is different:
const contentLogic = `      if (!file.type.startsWith('video/') && file.size < 5 * 1024 * 1024) {
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
        fileContent = "(File video, AI chỉ duyệt dựa trên tiêu đề)";
      }`;

const newContentLogic = `      const isMedia = file.type.startsWith('video/') || file.type.startsWith('audio/');
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
      }`;
code = code.replace(contentLogic, newContentLogic);


// 8. Update onChange type detection
const onChangeType = `                          if (file.type.startsWith('video/')) {
                            setUploadType('video');
                          } else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
                            setUploadType('docx');
                          } else {
                            setUploadType('pdf');
                          }`;
const newOnChangeType = `                          if (file.type.startsWith('video/')) {
                            setUploadType('video');
                          } else if (file.type.startsWith('audio/')) {
                            setUploadType('audio');
                          } else if (file.type.includes('presentation') || file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
                            setUploadType('ppt');
                          } else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
                            setUploadType('docx');
                          } else {
                            setUploadType('pdf');
                          }`;
code = code.replace(onChangeType, newOnChangeType);

// 9. Update accept attribute
code = code.replace(
  'accept=".pdf,.doc,.docx,video/*"',
  'accept=".pdf,.doc,.docx,.ppt,.pptx,video/*,audio/*"'
);

fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
console.log("Done");
