import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Store, Image as ImageIcon, Upload, Check, Coins, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface GifShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GifShopModal({ isOpen, onClose }: GifShopModalProps) {
  const { currentUser, updateUser, storeGifs, addStoreGif, deleteStoreGif, showToast } = useAppContext();
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');
  const [newGifUrl, setNewGifUrl] = useState('');
  const [newGifName, setNewGifName] = useState('');
  const [newGifPrice, setNewGifPrice] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const myCoins = currentUser?.coins || 0;
  const myGifs = currentUser?.ownedGifs || [];

  if (!isOpen) return null;

  const handleBuy = (gifId: string, price: number) => {
    if (myCoins >= price) {
      updateUser(currentUser!.id, {
        coins: myCoins - price,
        ownedGifs: [...myGifs, gifId]
      });
      alert('Mua thành công!');
    } else {
      alert('Bạn không đủ xu để mua hình này!');
    }
  };

  const handleApply = (gifUrl: string) => {
    if (currentUser?.currentGif === gifUrl) {
      updateUser(currentUser!.id, { currentGif: '' }); // Unapply
    } else {
      updateUser(currentUser!.id, { currentGif: gifUrl });
    }
  };

  const handleAddGif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGifUrl || !newGifName) return;
    
    setIsAdding(true);
    let finalUrl = newGifUrl;
    
    // Auto-extract image if it's a Pinterest link
    if (newGifUrl.includes('pinterest.com/pin/') || newGifUrl.includes('pin.it/')) {
      try {
        const response = await fetch('/api/extract-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: newGifUrl })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.imageUrl) {
            finalUrl = data.imageUrl;
          }
        }
      } catch (error) {
        console.error("Failed to extract Pinterest image", error);
      }
    }

    await addStoreGif({
      url: finalUrl,
      name: newGifName,
      price: newGifPrice
    });
    setNewGifUrl('');
    setNewGifName('');
    setNewGifPrice(0);
    setIsAdding(false);
  };

  const isVideoUrl = (url: string) => url.match(/\.(mp4|webm|ogg|m4v|m3u8)/i) || url.includes('.mp4?') || url.includes('video');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-[#1C274C] w-full max-w-4xl rounded-[2rem] shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-purple-50 dark:bg-[#121A33] text-purple-600 dark:text-[#FFD15B] rounded-2xl flex items-center justify-center shadow-inner">
                 <Store className="w-6 h-6" />
               </div>
               <div>
                  <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">Cửa hàng Hình Nền</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Trang trí khu vực học tập của bạn</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 dark:bg-[#121A33] px-4 py-2 rounded-xl flex items-center gap-2 shadow-inner border border-amber-200 dark:border-white/5">
                <Coins className="w-5 h-5 text-amber-500 dark:text-[#FFD15B]" />
                <span className="font-black text-amber-600 dark:text-[#FFD15B] font-display text-lg leading-none">{myCoins}</span>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#121A33]/50">
            
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('shop')}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${activeTab === 'shop' ? 'bg-purple-600 dark:bg-[#FFD15B] text-white dark:text-[#121411]' : 'bg-white dark:bg-[#1C274C] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                Cửa hàng
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${activeTab === 'inventory' ? 'bg-purple-600 dark:bg-[#FFD15B] text-white dark:text-[#121411]' : 'bg-white dark:bg-[#1C274C] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                Kho của tôi
              </button>
            </div>

            {isAdmin && activeTab === 'shop' && (
              <form onSubmit={handleAddGif} className="mb-8 bg-white dark:bg-[#1C274C] p-5 rounded-2xl border border-blue-100 dark:border-white/5 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-500" /> [Admin] Thêm hình nền / GIF mới
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                   <div className="md:col-span-2">
                     <label className="block text-xs font-bold text-slate-500 mb-1">URL ảnh hoặc Link Pinterest</label>
                     <div className="flex gap-2">
                       <input type="text" value={newGifUrl} onChange={e => setNewGifUrl(e.target.value)} required placeholder="https://pinterest.com/pin/..." className="w-full bg-slate-50 dark:bg-[#121A33] border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-sm dark:text-white" />
                       <label className="h-[38px] px-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center cursor-pointer transition-colors whitespace-nowrap shrink-0 text-sm font-bold border border-slate-200 dark:border-white/5">
                         <Upload className="w-4 h-4 mr-1" />
                         Tệp
                         <input 
                           type="file" 
                           accept="image/*"
                           className="hidden" 
                           onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                               // Check file size (limit to ~700KB to stay under Firestore 1MB document limit after base64 encoding)
                               if (file.size > 700 * 1024) {
                                 alert('Kích thước tệp quá lớn. Vui lòng chọn ảnh/GIF dưới 700KB hoặc sử dụng URL trực tiếp.');
                                 return;
                               }
                               const reader = new FileReader();
                               reader.onloadend = () => {
                                 setNewGifUrl(reader.result as string);
                                 showToast('Tải tài liệu thành công', 'success');
                                 if (!newGifName) setNewGifName(file.name.split('.')[0]);
                               };
                               reader.readAsDataURL(file);
                             }
                           }} 
                         />
                       </label>
                     </div>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1">Tên hình</label>
                     <input type="text" value={newGifName} onChange={e => setNewGifName(e.target.value)} required placeholder="Vũ trụ" className="w-full bg-slate-50 dark:bg-[#121A33] border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-sm dark:text-white" />
                   </div>
                   <div className="flex gap-2">
                     <div className="flex-1">
                       <label className="block text-xs font-bold text-slate-500 mb-1">Giá (Xu)</label>
                       <input type="number" value={newGifPrice} onChange={e => setNewGifPrice(Number(e.target.value))} min="0" required className="w-full bg-slate-50 dark:bg-[#121A33] border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-sm dark:text-white" />
                     </div>
                     <button type="submit" disabled={isAdding} className="h-[38px] w-[38px] bg-blue-600 dark:bg-[#FFD15B] text-white dark:text-[#121411] rounded-xl flex items-center justify-center hover:bg-blue-700 dark:hover:bg-[#EAB308] transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                       {isAdding ? <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" /> : <Check className="w-5 h-5" />}
                     </button>
                   </div>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {activeTab === 'shop' && storeGifs.filter(g => !myGifs.includes(g.id)).map(gif => (
                <div key={gif.id} className="bg-white dark:bg-[#1C274C] rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-white/5 group relative hover:shadow-xl transition-all hover:-translate-y-1">
                   <div className="h-40 w-full bg-slate-100 dark:bg-[#121A33] relative overflow-hidden">
                     {isVideoUrl(gif.url) ? (
                       <video src={gif.url} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" style={{ filter: 'brightness(1.05) contrast(1.02)' }} />
                     ) : (
                       <img src={gif.url} alt={gif.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" style={{ filter: 'brightness(1.05) contrast(1.02)', imageRendering: 'high-quality' }} />
                     )}
                   </div>
                   <div className="p-4 flex items-center justify-between">
                     <h4 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1 flex-1">{gif.name}</h4>
                     <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-amber-500 dark:text-[#FFD15B] flex items-center gap-1"><Coins className="w-3.5 h-3.5"/> {gif.price}</span>
                        <button onClick={() => handleBuy(gif.id, gif.price)} className="bg-slate-100 hover:bg-purple-100 text-purple-700 dark:bg-[#121A33] dark:hover:bg-[#FFD15B]/20 dark:text-[#FFD15B] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Mua</button>
                        {isAdmin && (
                          <button onClick={() => deleteStoreGif(gif.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 dark:bg-white/5"><Trash2 className="w-4 h-4"/></button>
                        )}
                     </div>
                   </div>
                </div>
              ))}

              {activeTab === 'inventory' && storeGifs.filter(g => myGifs.includes(g.id)).map(gif => {
                const isApplied = currentUser?.currentGif === gif.url;
                return (
                  <div key={gif.id} className={`bg-white dark:bg-[#1C274C] rounded-2xl overflow-hidden shadow-sm border transition-all ${isApplied ? 'border-purple-500 dark:border-[#FFD15B] shadow-purple-500/20 dark:shadow-[#FFD15B]/20 ring-2 ring-purple-500/20 dark:ring-[#FFD15B]/20' : 'border-slate-200 dark:border-white/5'}`}>
                     <div className="h-40 w-full bg-slate-100 dark:bg-[#121A33] relative overflow-hidden">
                       {isVideoUrl(gif.url) ? (
                         <video src={gif.url} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" style={{ filter: 'brightness(1.05) contrast(1.02)' }} />
                       ) : (
                         <img src={gif.url} alt={gif.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" style={{ filter: 'brightness(1.05) contrast(1.02)', imageRendering: 'high-quality' }} />
                       )}
                       {isApplied && (
                         <div className="absolute top-2 right-2 bg-purple-600 dark:bg-[#FFD15B] text-white dark:text-[#121411] px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">Đang Dùng</div>
                       )}
                     </div>
                     <div className="p-4 flex items-center justify-between">
                       <h4 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">{gif.name}</h4>
                       <button onClick={() => handleApply(gif.url)} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${isApplied ? 'bg-slate-100 text-slate-600 dark:bg-[#121A33] dark:text-slate-400' : 'bg-purple-600 hover:bg-purple-700 text-white dark:bg-[#FFD15B] dark:hover:bg-[#EAB308] dark:text-[#121411]'}`}>
                         {isApplied ? 'Gỡ' : 'Dùng'}
                       </button>
                     </div>
                  </div>
                );
              })}

              {(activeTab === 'shop' && storeGifs.filter(g => !myGifs.includes(g.id)).length === 0) && (
                <div className="col-span-full py-12 text-center text-slate-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Không có hình nền nào trong cửa hàng lúc này.</p>
                </div>
              )}

              {(activeTab === 'inventory' && myGifs.length === 0) && (
                <div className="col-span-full py-12 text-center text-slate-400">
                  <Store className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Bạn chưa sở hữu hình nền nào. Hãy vào cửa hàng để mua nhé!</p>
                </div>
              )}
            </div>
            
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
