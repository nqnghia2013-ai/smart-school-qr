const fs = require('fs');
let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');

code = code.replace(
  `  const handleUpdateBulkItem = (index: number, field: 'title' | 'link', value: string) => {
    const newItems = [...bulkDriveItems];
    newItems[index][field] = value;
    setBulkDriveItems(newItems);
  };`,
  `  const handleUpdateBulkItem = (index: number, field: 'title' | 'link', value: string) => {
    const newItems = [...bulkDriveItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setBulkDriveItems(newItems);
  };`
);

code = code.replace(
  `      if (validItems.length === 0) {
        alert("Vui lòng nhập ít nhất một tài liệu (có cả tiêu đề và liên kết)!");
        return;
      }`,
  `      if (validItems.length === 0) {
        alert("Có lỗi: Bạn phải nhập ĐẦY ĐỦ cả Tiêu đề VÀ Liên kết cho ít nhất một tài liệu! Nếu chỉ nhập tiêu đề mà quên liên kết (hoặc ngược lại), hệ thống sẽ không chấp nhận.");
        return;
      }`
);

fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
