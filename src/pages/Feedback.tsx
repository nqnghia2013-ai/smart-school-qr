import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquarePlus, Lightbulb, Clock, CheckCircle2, ThumbsUp, Send, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

type Suggestion = {
  id: string;
  title: string;
  description: string;
  author: string;
  date: string;
  status: 'pending' | 'in-progress' | 'completed';
  votes: number;
};

const INITIAL_SUGGESTIONS: Suggestion[] = [
  {
    id: '1',
    title: 'Tích hợp AI chấm điểm trắc nghiệm',
    description: 'Sử dụng AI để tự động chấm điểm các bài thi trắc nghiệm bằng hình ảnh tải lên từ điện thoại.',
    author: 'Cô Lan (Toán)',
    date: '16/06/2026',
    status: 'in-progress',
    votes: 24
  },
  {
    id: '2',
    title: 'Thêm minigame vào Lớp học số',
    description: 'Cần có góc giải trí nhỏ (như đố vui Kahoot) ngay trong không gian phòng học số để tăng tương tác.',
    author: 'Trần Bình (9A1)',
    date: '15/06/2026',
    status: 'pending',
    votes: 18
  },
  {
    id: '3',
    title: 'Tối ưu trải nghiệm di động',
    description: 'Bản đồ trường học hiện tại hơi khó thao tác zoom trên màn hình điện thoại nhỏ.',
    author: 'Nguyễn Quý Nghĩa',
    date: '10/06/2026',
    status: 'completed',
    votes: 35
  },
  {
    id: '4',
    title: 'Thông báo tự động qua Zalo cho Phụ huynh',
    description: 'Hệ thống tự động gửi tin nhắn báo điểm, điểm danh và thông báo của trường qua Zalo OA để phụ huynh nắm bắt tức thì.',
    author: 'Cô Hoa (Ban phụ huynh)',
    date: '17/06/2026',
    status: 'pending',
    votes: 42
  },
  {
    id: '5',
    title: 'Tích hợp TKB với Google Calendar',
    description: 'Cho phép học sinh và giáo viên đồng bộ Thời khóa biểu trực tiếp vào Google Calendar để nhận thông báo nhắc lịch học.',
    author: 'Thầy Hưng (Tin học)',
    date: '18/06/2026',
    status: 'in-progress',
    votes: 29
  },
  {
    id: '6',
    title: 'Hệ thống nhận diện khuôn mặt (Face ID) để điểm danh',
    description: 'Sử dụng Camera AI ở cổng trường để tự động điểm danh học sinh khi bước vào trường, giảm tải việc điểm danh thủ công trên lớp.',
    author: 'Ban Giám Hiệu',
    date: '12/06/2026',
    status: 'pending',
    votes: 56
  },
  {
    id: '7',
    title: 'Kênh hỏi đáp (Q&A) ẩn danh',
    description: 'Tạo một box hỏi đáp cho phép học sinh đặt câu hỏi ẩn danh cho giáo viên bộ môn, giúp các bạn nhút nhát dễ dàng hỏi bài hơn.',
    author: 'Lê Vy (8A3)',
    date: '14/06/2026',
    status: 'completed',
    votes: 31
  },
  {
    id: '8',
    title: 'Thư viện tài liệu chia sẻ chung',
    description: 'Xây dựng kho tài liệu PDF, DOCX, Video bài giảng để học sinh tự do tải về và ôn tập tại nhà.',
    author: 'Khối chuyên môn',
    date: '09/06/2026',
    status: 'in-progress',
    votes: 48
  },
  {
    id: '9',
    title: 'Chatbot AI giải đáp nội quy và hướng dẫn',
    description: 'Trợ lý ảo túc trực 24/7 trên web để giải đáp thắc mắc về nội quy trường học, lịch thi, và hướng dẫn sử dụng hệ thống.',
    author: 'Quản trị viên',
    date: '16/06/2026',
    status: 'pending',
    votes: 15
  }
];

export default function Feedback() {
  const { currentUser } = useAppContext();
  const [suggestions, setSuggestions] = useState<Suggestion[]>(INITIAL_SUGGESTIONS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleVote = (id: string) => {
    setSuggestions(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, votes: s.votes + 1 };
      }
      return s;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newSuggestion: Suggestion = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDesc,
      author: currentUser?.fullName || 'Người dùng ẩn danh',
      date: new Date().toLocaleDateString('vi-VN'),
      status: 'pending',
      votes: 1
    };

    setSuggestions([newSuggestion, ...suggestions]);
    setNewTitle('');
    setNewDesc('');
    setIsFormOpen(false);
  };

  const getStatusBadge = (status: Suggestion['status']) => {
    switch (status) {
      case 'completed': 
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã hoàn thành
          </span>
        );
      case 'in-progress': 
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold border border-indigo-500/20">
            <Clock className="w-3.5 h-3.5 animate-spin-slow" /> Đang phát triển
          </span>
        );
      default: 
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold border border-amber-500/20">
            <Lightbulb className="w-3.5 h-3.5" /> Đang xem xét
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Header card using custom glass-card styles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#131612] p-6 rounded-2xl border border-slate-200/50 dark:border-white/5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-[#FFD15B]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 space-y-1">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5 font-display">
            <MessageSquarePlus className="w-7 h-7 text-indigo-500 dark:text-[#FFD15B]" /> Góp ý & Cải thiện
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-xs md:text-sm leading-relaxed">
            Cùng nhau xây dựng hệ thống Smart School Workspace System ngày càng hoàn thiện hơn
          </p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="relative z-10 flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-[#FFD15B] dark:hover:bg-[#EAB308] text-white dark:text-slate-950 font-bold rounded-xl shadow-md transition-all active:scale-95 duration-200 shrink-0 text-sm"
        >
          <Lightbulb className="w-4 h-4" /> Gửi ý tưởng mới
        </button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200/50 dark:border-white/5 mb-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-800 dark:text-white font-display">Mô tả ý tưởng của bạn</h2>
                <button 
                  onClick={() => setIsFormOpen(false)} 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    value={newTitle || ''}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Tiêu đề gợi ý (Vd: Thêm chức năng nhắc lịch học)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-[#FFD15B] focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-[#FFD15B]/20 outline-none transition-all text-sm font-medium"
                    required
                  />
                </div>
                <div>
                  <textarea 
                    value={newDesc || ''}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Mô tả chi tiết ý tưởng của bạn. Tính năng này sẽ mang lại lợi ích gì?"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-[#FFD15B] focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-[#FFD15B]/20 outline-none transition-all min-h-[120px] resize-y text-sm font-medium"
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-[#FFD15B] hover:bg-[#EAB308] shadow-md transition-colors text-sm"
                  >
                    <Send className="w-3.5 h-3.5" /> Gửi gợi ý
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of suggestion cards using glass-card utilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.sort((a, b) => b.votes - a.votes).map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25 }}
            className="bg-white dark:bg-[#131612] rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-white/5 hover:border-indigo-500/30 dark:hover:border-[#FFD15B]/30 hover:shadow-md transition-all duration-300 group flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              {getStatusBadge(item.status)}
              <button 
                onClick={() => handleVote(item.id)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-indigo-500/10 dark:bg-white/5 dark:hover:bg-[#FFD15B]/10 text-slate-500 hover:text-indigo-600 dark:hover:text-[#FFD15B] rounded-lg font-bold transition-all border border-slate-200 dark:border-white/5 text-xs active:scale-90"
              >
                <ThumbsUp className="w-3.5 h-3.5" /> {item.votes}
              </button>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base mb-2 leading-tight group-hover:text-indigo-500 dark:group-hover:text-[#FFD15B] transition-colors font-display">
              {item.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed mb-6 flex-1 font-medium">
              {item.description}
            </p>
            
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500">
              <span className="truncate max-w-[150px]">{item.author}</span>
              <span>{item.date}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
