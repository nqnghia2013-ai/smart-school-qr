const fs = require('fs');
const code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');
const lines = code.split('\n');

const startIdx = lines.findIndex(l => l.includes('const handleFormUpload = async () => {'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.startsWith('  };'));

if (startIdx === -1 || endIdx === -1) {
  console.log("Could not find bounds", startIdx, endIdx);
  process.exit(1);
}

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
  };`;

lines.splice(startIdx, endIdx - startIdx + 1, newHandleUpload);
fs.writeFileSync('src/pages/DocumentLibrary.tsx', lines.join('\n'));
console.log("Success");
