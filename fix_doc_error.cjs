const fs = require('fs');
let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');

code = code.replace(/alert\("Đã xảy ra lỗi khi AI quét tài liệu\. Không thể tải lên lúc này\."\);/g, "showToast('Đã xảy ra lỗi khi AI quét tài liệu. Không thể tải lên lúc này.', 'error');");
code = code.replace(/alert\("Vui lòng đăng nhập để tải lên tài liệu!"\);/g, "showToast('Vui lòng đăng nhập để tải lên tài liệu!', 'error');");

fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
