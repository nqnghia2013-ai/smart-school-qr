const fs = require('fs');
let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');

const oldInfo = `<div className="flex items-center justify-between text-sm text-slate-500 mb-4 font-medium">
              <span>{doc.size}</span>
              <span>{doc.downloads} lượt tải</span>
            </div>`;

const newInfo = `<div className="flex items-center justify-between text-sm text-slate-500 mb-4 font-medium">
              {doc.type === 'folder' ? (
                <span>Thư mục</span>
              ) : (
                <>
                  <span>{doc.size}</span>
                  <span>{doc.downloads} lượt tải</span>
                </>
              )}
            </div>`;

code = code.replace(oldInfo, newInfo);
fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
