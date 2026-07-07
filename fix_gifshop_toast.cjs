const fs = require('fs');

let code = fs.readFileSync('src/components/GifShopModal.tsx', 'utf8');

if (!code.includes('showToast')) {
    code = code.replace(/const \{ currentUser, users, storeGifs, updateUser \} = useAppContext\(\);/, 'const { currentUser, users, storeGifs, updateUser, showToast } = useAppContext();');
}

code = code.replace(/setNewGifUrl\(reader\.result as string\);/g, `setNewGifUrl(reader.result as string);
                                 showToast('Tải tài liệu thành công', 'success');`);

fs.writeFileSync('src/components/GifShopModal.tsx', code);
