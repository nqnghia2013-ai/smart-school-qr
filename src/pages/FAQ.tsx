import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Làm thế nào để đăng nhập hệ thống?",
      answer: "Ban giám hiệu và giáo viên sử dụng Email. Học sinh có thể đăng nhập bằng Tên đăng nhập (User ID) và Mật khẩu được cấp. Ngoài ra, bạn có thể sử dụng tính năng 'Tiếp tục với Google' nếu email của bạn đã được đăng ký trong hệ thống."
    },
    {
      question: "Tôi quên mật khẩu thì phải làm sao?",
      answer: "Vui lòng liên hệ Giáo viên chủ nhiệm hoặc Quản trị viên (Admin) của trường để được hỗ trợ cấp lại mật khẩu mới đối với tài khoản học sinh. Đối với tài khoản Google, hãy sử dụng tính năng khôi phục mật khẩu của Google."
    },
    {
      question: "Làm sao để đăng ký khuôn mặt điểm danh?",
      answer: "Khi truy cập vào Lớp học số lần đầu tiên, hệ thống sẽ yêu cầu bạn cấp quyền truy cập Camera và thực hiện quá trình quét khuôn mặt (Face ID). Dữ liệu này sẽ được lưu trữ cục bộ/an toàn để phục vụ điểm danh."
    },
    {
      question: "Dữ liệu sinh trắc học của tôi có được bảo mật không?",
      answer: "Có. Tất cả dữ liệu sinh trắc học (véc-tơ khuôn mặt) chỉ được lưu trữ dưới dạng mã số hóa (descriptor) trên hệ thống. Chúng tôi không lưu trực tiếp hình ảnh gốc của học sinh, đảm bảo an toàn và quyền riêng tư theo tiêu chuẩn quốc tế."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="text-center mb-10">
        <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-display font-black text-slate-900 mb-4">Câu Hỏi Thường Gặp</h1>
        <p className="text-slate-500">Giải đáp nhanh các thắc mắc phổ biến về hệ thống Smart School Workspace System.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left px-6 py-4 flex items-center justify-between focus:outline-none"
            >
              <span className="font-bold text-slate-800">{faq.question}</span>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-4 text-slate-600 leading-relaxed overflow-hidden"
                >
                  <div className="pt-2 border-t border-slate-100">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
