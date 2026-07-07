const fs = require('fs');
let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');

// Add state for bulk items
const stateToAdd = `  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadLink, setUploadLink] = useState('');`;

const replacementState = `  const [uploadTitle, setUploadTitle] = useState('');
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
    newItems[index][field] = value;
    setBulkDriveItems(newItems);
  };`;

code = code.replace(stateToAdd, replacementState);

// Replace UI
const oldDriveUI = `                  {uploadMethod === 'drive' ? (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Địa chỉ đường dẫn (URL / File ID)</label>
                      <input type="text" value={uploadLink || ''} onChange={e => setUploadLink(e.target.value)} placeholder="Dán link Google Docs, Sheets, Slides hoặc Form" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                      <p className="text-xs text-slate-400 mt-2">Hỗ trợ đầy đủ các dạng liên kết: document, spreadsheets, presentation, hoặc forms để nhúng trực tiếp vào lớp học.</p>
                    </div>
                  ) : (`;

const newDriveUI = `                  {uploadMethod === 'drive' ? (
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
                  ) : (`;

code = code.replace(oldDriveUI, newDriveUI);

// Replace singular Title UI 
const oldTitleUI = `                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề học liệu</label>
                     <input type="text" value={uploadTitle || ''} onChange={e => setUploadTitle(e.target.value)} placeholder="vd: Giáo án thực hành Lý thuyết L1" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                  </div>`;

const newTitleUI = `                  {uploadMethod === 'local' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề học liệu</label>
                      <input type="text" value={uploadTitle || ''} onChange={e => setUploadTitle(e.target.value)} placeholder="vd: Giáo án thực hành Lý thuyết L1" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                    </div>
                  )}`;

code = code.replace(oldTitleUI, newTitleUI);

// Update logic
const oldHandleUpload = `  const handleFormUpload = async () => {
    if (!currentUser) {
      showToast('Vui lòng đăng nhập để tải lên tài liệu!', 'error');
      return;
    }

    let fileUrl = uploadMethod === 'drive' ? uploadLink : '#';
    let fileSize = 'Vô định';
    let fileContent = '';
    
    if (uploadMethod === 'local' && fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0];
      fileUrl = URL.createObjectURL(file);
      fileSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      
      // Read file content for AI scanning (Skip large files or videos)
      if (!file.type.startsWith('video/') && file.size < 5 * 1024 * 1024) {
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
      }
    } else if (uploadMethod === 'drive') {
      fileSize = 'Đã liên kết Drive';
    }

    if (!uploadTitle.trim()) {
      alert("Vui lòng nhập tiêu đề tài liệu!");
      return;
    }

    // AI SCANNING PHASE
    setIsScanning(true);
    
    try {
      const response = await fetch('/api/scan-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle,
          subject: uploadSubject,
          type: uploadType,
          content: fileContent,
          link: uploadMethod === 'drive' ? uploadLink : null
        })
      });
      
      const scanResult = await response.json();
      const isBad = !scanResult.isSafe;

      setIsScanning(false);
      setIsUploadModalOpen(false);

      const id = Date.now().toString();

      if (isBad) {
        const newDoc: Document = {
          id,
          title: uploadTitle,
          subject: uploadSubject,
          type: uploadType,
          size: fileSize,
          uploadDate: new Date().toLocaleDateString('vi-VN'),
          downloads: 0,
          url: fileUrl,
          uploaderId: currentUser.id,
          uploaderName: currentUser.fullName,
          parentId: currentFolderId || null,
          status: 'pending'
        };

        await setDoc(doc(db, 'documents', id), JSON.parse(JSON.stringify(newDoc)));

        // Gửi cảnh báo hệ thống
        addNotification({
          title: '[AI] Hệ thống phát hiện tài liệu vi phạm',
          message: \`Hệ thống AI vừa quét và phát hiện học sinh \${currentUser.fullName} tải lên tài liệu có dấu hiệu vi phạm: "\${uploadTitle}". Lý do: \${scanResult.reason || 'Nội dung không phù hợp'}. Vui lòng kiểm duyệt và xóa ngay nếu cần.\`,
          type: 'warning',
        });

        addNotification({
          title: 'Tài liệu đang bị AI từ chối và chờ duyệt',
          message: \`Tài liệu "\${uploadTitle}" của bạn chứa nội dung có thể vi phạm tiêu chuẩn của trường. Báo cáo đã gửi cho Ban Giám Hiệu.\`,
          type: 'error',
          userId: currentUser.id
        });
        showToast('Tài liệu đã bị từ chối do vi phạm quy định', 'error');
      } else {
        const newDoc: Document = {
          id,
          title: uploadTitle,
          subject: uploadSubject,
          type: uploadType,
          size: fileSize,
          uploadDate: new Date().toLocaleDateString('vi-VN'),
          downloads: 0,
          url: fileUrl,
          uploaderId: currentUser.id,
          uploaderName: currentUser.fullName,
          parentId: currentFolderId || null,
          status: 'approved'
        };

        await setDoc(doc(db, 'documents', id), JSON.parse(JSON.stringify(newDoc)));
        showToast('Tải lên và duyệt thành công', 'success');
      }
      
      setUploadTitle('');
      setUploadLink('');
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error) {
      console.error("Scan error:", error);
      setIsScanning(false);
      showToast('Có lỗi xảy ra khi duyệt tài liệu', 'error');
    }
  };`;

const newHandleUpload = `  const handleFormUpload = async () => {
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
      
      if (!file.type.startsWith('video/') && file.size < 5 * 1024 * 1024) {
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
      }
      itemsToProcess.push({ title: uploadTitle.trim(), url: fileUrl, content: fileContent, size: fileSize });
    } else {
      // Bulk Google Drive Upload
      const validItems = bulkDriveItems.filter(item => item.title.trim() && item.link.trim());
      if (validItems.length === 0) {
        alert("Vui lòng nhập ít nhất một tài liệu (có cả tiêu đề và liên kết)!");
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
            message: \`Hệ thống AI vừa quét và phát hiện học sinh \${currentUser.fullName} tải lên tài liệu có dấu hiệu vi phạm: "\${item.title}". Lý do: \${result.reason || 'Nội dung không phù hợp'}. Vui lòng kiểm duyệt và xóa ngay nếu cần.\`,
            type: 'warning',
          });
          addNotification({
            title: 'Tài liệu đang bị AI từ chối và chờ duyệt',
            message: \`Tài liệu "\${item.title}" của bạn chứa nội dung có thể vi phạm tiêu chuẩn của trường. Báo cáo đã gửi cho Ban Giám Hiệu.\`,
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
        showToast('Tải lên và duyệt thành công', 'success');
      }
      
      setUploadTitle('');
      setUploadLink('');
      setBulkDriveItems([{ title: '', link: '' }]);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error) {
      console.error("Scan error:", error);
      setIsScanning(false);
      showToast('Có lỗi xảy ra khi duyệt tài liệu', 'error');
    }
  };`;

code = code.replace(oldHandleUpload, newHandleUpload);

fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
