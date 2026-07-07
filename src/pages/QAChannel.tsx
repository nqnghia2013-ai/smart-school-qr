import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircleQuestion, 
  Send, 
  Ghost, 
  ShieldCheck,
  CheckCircle2,
  Clock,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function QAChannel() {
  const { qas, addQA, answerQA, addNotification, currentUser } = useAppContext();
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Toán học');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const isTeacher = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    addQA({
      question: newQuestion,
      subject: selectedSubject,
      teacher: 'Đang xếp giáo viên',
    });

    setNewQuestion('');
  };

  const handleReply = (id: string) => {
    if (!replyText.trim()) return;
    
    answerQA(id, replyText, currentUser?.fullName || 'Giáo viên');
    addNotification({
      title: 'Có phản hồi mới từ giáo viên',
      message: `Giáo viên đã trả lời một câu hỏi thắc mắc. Nhấn để xem ngay.`,
      type: 'success'
    });
    
    setReplyText('');
    setReplyingTo(null);
  };

  const handleLike = (id: string) => {
    // Can leave mostly inactive or extend AppContext with like method. Simplistic approach for UI:
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-gradient-to-br from-indigo-800 to-purple-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-indigo-100 text-sm font-bold mb-4 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4" /> Chế độ Ẩn Danh an toàn
          </div>
          <h1 className="text-3xl font-black mb-3 flex items-center gap-3">
            <MessageCircleQuestion className="w-8 h-8 text-indigo-300" />
            Kênh Hỏi Đáp (Q&A) Ẩn Danh
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed max-w-2xl">
            Tự do đặt câu hỏi, thắc mắc bài giảng với giáo viên bộ môn mà không lo ngại hay e dè. Danh tính của bạn được giữ kín hoàn toàn.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-md border border-indigo-100 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            Đóng góp câu hỏi của bạn
          </h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <select 
            value={selectedSubject || 'Toán học'}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 min-w-[200px]"
          >
            <option>Toán học</option>
            <option>Ngữ văn</option>
            <option>Tiếng Anh</option>
            <option>Vật lý</option>
            <option>Hóa học</option>
            <option>Sinh học</option>
          </select>
          <div className="relative flex-1">
            <textarea 
              value={newQuestion || ''}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Nhập câu hỏi bạn đang băn khoăn... (Vd: Em chưa hiểu bài 3 trang 15)"
              className="w-full px-4 py-3 min-h-[100px] resize-y rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none"
              required
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit"
            disabled={!newQuestion.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition-all"
          >
            <Send className="w-5 h-5" /> Gửi câu hỏi ẩn danh
          </button>
        </div>
      </form>

      <div className="space-y-6">
        <h2 className="font-black text-xl text-slate-800 border-b border-slate-200 pb-2">
          CÂU HỎI GẦN ĐÂY
        </h2>
        
        {qas.length === 0 && (
          <div className="py-12 text-center text-slate-500 font-medium bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
            Chưa có câu hỏi nào. Bạn hãy tự tin là người đặt câu hỏi đầu tiên nhé!
          </div>
        )}
        {qas.map((qa, index) => (
          <motion.div 
            key={qa.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-2xl border p-6 flex flex-col gap-4 ${qa.status === 'answered' ? 'bg-white border-indigo-100 shadow-sm' : 'bg-slate-50 border-slate-200'}`}
          >
            <div className="flex justify-between items-start mb-2 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                  <Ghost className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-slate-700 text-sm">Học sinh ẩn danh</div>
                  <div className="flex text-xs font-semibold text-slate-400 gap-2 items-center">
                    <span className="bg-slate-200 px-2.5 py-0.5 rounded-sm">{qa.subject}</span>
                    <span>• {qa.date}</span>
                  </div>
                </div>
              </div>
              
              {qa.status === 'answered' ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold whitespace-nowrap">
                  <CheckCircle2 className="w-4 h-4" /> Đã trả lời
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold whitespace-nowrap">
                  <Clock className="w-4 h-4" /> Đang đợi
                </span>
              )}
            </div>

            <p className="text-slate-800 font-medium text-lg leading-relaxed">{qa.question}</p>
            
            {qa.answer ? (
              <div className="mt-2 bg-indigo-50 border border-indigo-100 p-5 rounded-2xl relative">
                <div className="absolute -top-3 left-6 w-6 h-6 bg-indigo-50 border-t border-l border-indigo-100 rotate-45"></div>
                <div className="relative z-10">
                  <div className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs">GV</div>
                    Giáo viên: {qa.teacher} trả lời
                  </div>
                  <p className="text-indigo-800 leading-relaxed font-medium">
                    {qa.answer}
                  </p>
                </div>
              </div>
            ) : isTeacher ? (
              <div className="mt-4 pt-4 border-t border-slate-100">
                {replyingTo === qa.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={replyText || ''}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Nhập nội dung phản hồi cho học sinh..."
                      className="w-full p-4 rounded-xl border border-indigo-200 outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
                    />
                    <div className="flex justify-end gap-2">
                       <button onClick={() => setReplyingTo(null)} className="px-4 py-2 text-slate-500 font-bold text-sm">Hủy</button>
                       <button onClick={() => handleReply(qa.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-md">Gửi câu trả lời</button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setReplyingTo(qa.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" /> Bạn là Giáo viên? Trả lời ngay
                  </button>
                )}
              </div>
            ) : null}

            <div className="flex items-center gap-4 mt-2">
              <button 
                onClick={() => handleLike(qa.id)}
                className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <ThumbsUp className="w-4 h-4" /> {qa.likes}
              </button>
            </div>

          </motion.div>
        ))}
      </div>
    </div>
  );
}
