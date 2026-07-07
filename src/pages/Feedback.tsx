import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquarePlus, Lightbulb, Clock, CheckCircle2, ChevronRight, ThumbsUp, Send } from 'lucide-react';
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
      case 'completed': return <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Đã hoàn thành</span>;
      case 'in-progress': return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200"><Clock className="w-3.5 h-3.5" /> Đang phát triển</span>;
      default: return <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200"><Lightbulb className="w-3.5 h-3.5" /> Đang xem xét</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <MessageSquarePlus className="w-8 h-8 text-indigo-600" /> Góp ý & Cải thiện
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Cùng nhau xây dựng hệ thống Smart School Workspace System ngày càng hoàn thiện hơn</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="relative z-10 flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          <Lightbulb className="w-5 h-5" /> Gửi ý tưởng mới
        </button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100 shadow-inner mb-6">
              <h2 className="text-lg font-bold text-indigo-900 mb-4">Mô tả ý tưởng của bạn</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    value={newTitle || ''}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Tiêu đề gợi ý (Vd: Thêm chức năng nhắc lịch học)"
                    className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <textarea 
                    value={newDesc || ''}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Mô tả chi tiết ý tưởng của bạn. Tính năng này sẽ mang lại lợi ích gì?"
                    className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all min-h-[120px] resize-y"
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-indigo-600 hover:bg-indigo-100 transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors"
                  >
                    <Send className="w-4 h-4" /> Gửi gợi ý
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.sort((a, b) => b.votes - a.votes).map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              {getStatusBadge(item.status)}
              <button 
                onClick={() => handleVote(item.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg font-bold transition-colors group/btn border border-slate-200"
              >
                <ThumbsUp className="w-4 h-4 group-hover/btn:-rotate-12 transition-transform" /> {item.votes}
              </button>
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{item.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">{item.description}</p>
            
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="truncate max-w-[150px]">{item.author}</span>
              <span>{item.date}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
