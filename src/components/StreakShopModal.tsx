import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Snowflake, Sparkles, Coins, Gift, AlertCircle, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface StreakShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StreakShopModal({ isOpen, onClose }: StreakShopModalProps) {
  const { currentUser, updateUser, showToast } = useAppContext();
  const [loading, setLoading] = useState(false);

  if (!currentUser) return null;

  const currentCoins = currentUser.coins || 0;
  const currentFreezes = currentUser.streakFreezeCount || 0;
  const claimedFree = currentUser.claimedFreeFreeze || false;

  const handleClaimFree = async () => {
    if (claimedFree) return;
    setLoading(true);
    try {
      updateUser(currentUser.id, {
        streakFreezeCount: currentFreezes + 1,
        claimedFreeFreeze: true
      });
      showToast('Chúc mừng! Bạn đã nhận thành công 1 Đóng băng chuỗi miễn phí!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyFreeze = async () => {
    if (currentCoins < 20) {
      showToast('Bạn không đủ xu! Hãy tích cực học tập để kiếm thêm xu.', 'error');
      return;
    }
    setLoading(true);
    try {
      updateUser(currentUser.id, {
        coins: currentCoins - 20,
        streakFreezeCount: currentFreezes + 1
      });
      showToast('Mua Đóng băng chuỗi thành công! Đã trừ 20 xu.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-full max-w-md bg-gradient-to-b from-[#1C274C] to-[#0A0F24] rounded-[2.5rem] overflow-hidden border border-blue-500/20 text-white relative shadow-2xl shadow-blue-500/10"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-lg tracking-wide uppercase text-blue-200">Cửa hàng chuỗi</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 relative z-10 flex flex-col items-center">
              {/* Giant icon */}
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-400/20 relative shadow-inner">
                  <Snowflake className="w-12 h-12 text-blue-400" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-md">
                  <Coins className="w-3.5 h-3.5 fill-slate-950" />
                  {currentCoins} xu
                </div>
              </div>

              <h4 className="text-xl font-black mb-2 text-center text-blue-100">Đóng băng chuỗi</h4>
              <p className="text-xs text-slate-300 text-center max-w-sm mb-6 leading-relaxed">
                Đóng băng chuỗi ngày học của bạn khi bạn bận rộn không thể đăng nhập. Chuỗi học của bạn sẽ được bảo vệ nguyên vẹn vào ngày hôm đó!
              </p>

              {/* Stats Box */}
              <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/5 flex justify-around mb-6 text-center">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Đang sở hữu</p>
                  <p className="text-2xl font-black text-blue-400">{currentFreezes} ngày</p>
                </div>
                <div className="w-[1px] bg-white/10" />
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tình trạng</p>
                  <p className="text-sm font-black text-emerald-400 mt-1 flex items-center gap-1">
                    <Sparkles className="w-4 h-4" /> Đang bảo vệ
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="w-full space-y-4">
                {/* Free Claim */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-950 to-indigo-950 border border-blue-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-400/20">
                      <Gift className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-blue-200">Quà tặng Tân thủ</h5>
                      <p className="text-[11px] text-slate-400">Đóng băng chuỗi miễn phí (x1)</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClaimFree}
                    disabled={claimedFree || loading}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      claimedFree
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                        : 'bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white'
                    }`}
                  >
                    {claimedFree ? 'Đã nhận' : 'Nhận miễn phí'}
                  </button>
                </div>

                {/* Purchase Item */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-400/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-400/20">
                      <Snowflake className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-white">Mua Đóng băng chuỗi</h5>
                      <p className="text-[11px] text-slate-400">Giá: 20 xu / 1 ngày</p>
                    </div>
                  </div>
                  <button
                    onClick={handleBuyFreeze}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs active:scale-95 transition-all flex items-center gap-1 shadow-lg shadow-yellow-500/10"
                  >
                    <Coins className="w-3.5 h-3.5 fill-slate-950" /> 20 xu
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/5 border-t border-white/5 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <AlertCircle className="w-3.5 h-3.5" />
              Tối đa sở hữu không giới hạn đóng băng chuỗi!
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
