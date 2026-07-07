const fs = require('fs');
let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');

code = code.replace("import { \n  FileText,", "import { \n  ChevronLeft, Folder, FolderPlus, FileText,");

fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
