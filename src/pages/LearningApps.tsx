import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Plus, Trash2, Globe, ExternalLink, Image as ImageIcon, X, Upload } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { LearningApp } from '../types';

export default function LearningApps() {
  const { learningApps, addLearningApp, deleteLearningApp, currentUser, showToast } = useAppContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newApp, setNewApp] = useState({ name: '', url: '', logo: '' });
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'technician';

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (newApp.name && newApp.url && newApp.logo) {
      // Basic URL validation
      let url = newApp.url;
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      
      addLearningApp({ ...newApp, url });
      setNewApp({ name: '', url: '', logo: '' });
      setIsAddModalOpen(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) { // 500KB limit
        alert('Vui lòng chọn ảnh có kích thước nhỏ hơn 500KB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewApp({ ...newApp, logo: reader.result as string });
        showToast('Tải tài liệu thành công', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 dark:bg-white p-6 rounded-2xl shadow-lg border border-slate-800 dark:border-slate-100 transition-colors duration-300">
        <div>
          <h1 className="text-2xl font-bold text-white dark:text-slate-900 transition-colors duration-300">App Học Tập</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 transition-colors duration-300">Khám phá các ứng dụng và trang web hỗ trợ học tập</p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-slate-900 text-white dark:text-white rounded-xl hover:bg-blue-500 dark:hover:bg-slate-800 shadow-md transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            <span className="font-semibold text-sm">Thêm App/Web</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {learningApps.map((app) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-slate-900 dark:bg-white p-5 rounded-2xl shadow-lg border border-slate-800 dark:border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-3"
          >
            {isAdmin && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm('Bạn có chắc chắn muốn xóa app này?')) {
                    deleteLearningApp(app.id);
                  }
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500/20 dark:bg-red-100 text-red-400 dark:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <a href={app.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 w-full h-full">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 dark:bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 border border-slate-700 dark:border-slate-200 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                {app.logo ? (
                  <img src={app.logo} alt={app.name} className="w-full h-full object-cover" />
                ) : (
                  <Globe className="w-8 h-8 text-slate-400 dark:text-slate-300" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white dark:text-slate-800 line-clamp-2 transition-colors duration-300">{app.name}</h3>
                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-blue-400 dark:text-blue-600 font-medium group-hover:text-blue-300 dark:group-hover:text-blue-700 transition-colors">
                  <span>Truy cập</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </a>
          </motion.div>
        ))}

        {learningApps.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900 dark:bg-white rounded-2xl border border-slate-800 dark:border-slate-100 transition-colors duration-300 shadow-lg">
            <Globe className="w-12 h-12 text-slate-600 dark:text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 dark:text-slate-500 font-medium">Chưa có ứng dụng học tập nào.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#161917] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Thêm App / Website Mới</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddApp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tên ứng dụng / web
                  </label>
                  <input
                    type="text"
                    required
                    value={newApp.name || ''}
                    onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#FFD15B] text-slate-800 dark:text-white"
                    placeholder="VD: Duolingo, VioEdu..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Đường link (URL)
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={newApp.url || ''}
                      onChange={(e) => setNewApp({ ...newApp, url: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#FFD15B] text-slate-800 dark:text-white"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Logo / Icon (Link hoặc Tải lên)
                  </label>
                  
                  <div className="flex gap-2 mb-2">
                    <div className="relative flex-1">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={newApp.logo || ''}
                        onChange={(e) => setNewApp({ ...newApp, logo: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#FFD15B] text-slate-800 dark:text-white"
                        placeholder="Nhập link ảnh logo..."
                      />
                    </div>
                  </div>
                  
                  <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                     <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                     />
                     <div className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Upload className="w-6 h-6 mb-1" />
                        <span className="text-sm font-medium">Hoặc tải lên từ thiết bị</span>
                        <span className="text-xs opacity-75">(Kích thước tối đa 500KB)</span>
                     </div>
                  </div>

                  {newApp.logo && (
                    <div className="mt-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 flex justify-center">
                      <img src={newApp.logo} alt="Preview" className="w-16 h-16 object-cover rounded-xl" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 dark:bg-[#FFD15B] text-white dark:text-[#121411] rounded-xl hover:bg-blue-700 dark:hover:bg-[#EAB308] transition-colors font-semibold"
                  >
                    Thêm App
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
