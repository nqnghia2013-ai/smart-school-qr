const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

if (!code.includes('show-toast')) {
    code = code.replace(/const seenNotifsRef = useRef<Set<string>>\(new Set\(\)\);/g, `const seenNotifsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleShowToast = (e: any) => {
      const { message, type } = e.detail;
      const newToast = {
        id: Date.now().toString() + Math.random().toString(),
        title: type === 'success' ? 'Thành công' : type === 'error' ? 'Lỗi' : type === 'warning' ? 'Cảnh báo' : 'Thông báo',
        message,
        type,
        date: new Date().toISOString()
      };
      setActiveToasts(prev => [...prev, newToast as any]);
      setTimeout(() => {
        setActiveToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 3000);
    };
    window.addEventListener('show-toast', handleShowToast);
    return () => window.removeEventListener('show-toast', handleShowToast);
  }, []);`);

    fs.writeFileSync('src/components/Layout.tsx', code);
}
