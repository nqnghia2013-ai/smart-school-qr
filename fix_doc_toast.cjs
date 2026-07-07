const fs = require('fs');

let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');

// Ensure showToast is imported from useAppContext
if (!code.includes('showToast')) {
    code = code.replace(/const \{ currentUser, addNotification \} = useAppContext\(\);/, 'const { currentUser, addNotification, showToast } = useAppContext();');
}

// Replace alert with toast
code = code.replace(/alert\(`⚠️ Hệ thống AI Smart School Workspace System phát hiện tài liệu có rủi ro\. Lý do: \$\{scanResult\.reason \|\| 'Nội dung không phù hợp'\}\. Tài liệu đã bị xếp vào hàng đợi chờ Quản trị viên duyệt\.`\);/g, 'showToast("Tài liệu đang gặp vấn đề về nội dung phù hợp, hiện đang xử lý", "warning");');

code = code.replace(/alert\("✅ Tải lên thành công! AI đã duyệt an toàn\."\);/g, 'showToast("AI đã duyệt, đã tải tài liệu lên thành công", "success");');

fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
