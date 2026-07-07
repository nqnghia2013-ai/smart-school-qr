import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpenText, 
  QrCode, 
  Users, 
  ShieldCheck, 
  Map, 
  CalendarDays,
  ChevronRight,
  MonitorPlay,
  Fingerprint
} from 'lucide-react';

export default function Guide() {
  const sections = [
    {
      id: "tong-quan",
      title: "1. Tổng quan hệ thống",
      icon: <MonitorPlay className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <p className="text-slate-600 leading-relaxed">
            Hệ thống <strong>Smart School Workspace System</strong> là một nền tảng quản lý trường học toàn diện, được thiết kế để tối ưu hóa việc quản lý phòng học, học sinh, giáo viên và bảo mật hệ thống thông qua mã QR và công nghệ sinh trắc học.
          </p>
          <ul className="list-disc pl-5 text-slate-600 space-y-1">
            <li>Nhanh chóng truy cập thông tin qua mã QR.</li>
            <li>Theo dõi và số hóa quy trình mượn trả phòng.</li>
            <li>Bảo mật cao với sinh trắc học và hệ thống định danh.</li>
          </ul>
        </div>
      )
    },
    {
      id: "quet-qr",
      title: "2. Quét mã QR",
      icon: <QrCode className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <p className="text-slate-600 leading-relaxed">
            Sử dụng tính năng <strong>Quét QR</strong> ở góc trên bên phải màn hình để truy cập nhanh vào các phòng bộ môn hoặc lớp học số.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase">Cách thực hiện:</h4>
            <ol className="list-decimal pl-5 text-slate-600 space-y-2 text-sm">
              <li>Nhấn vào nút <strong className="text-blue-600">Quét QR</strong> trên thanh điều hướng.</li>
              <li>Đưa camera điện thoại về phía mã QR hoặc chọn chức năng <strong>Tải ảnh có chứa mã QR</strong>.</li>
              <li>Hệ thống sẽ tự động điều hướng bạn đến trang thông tin tương ứng.</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: "lop-hoc-so",
      title: "3. Lớp học số & Điểm danh khuôn mặt",
      icon: <Users className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <p className="text-slate-600 leading-relaxed">
            Phân hệ <strong>Lớp học số</strong> cho phép giáo viên quản lý danh sách học sinh và điểm danh thông qua công nghệ nhận diện khuôn mặt (Face ID).
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Đăng ký khuôn mặt:</strong> Học sinh cần đăng ký dữ liệu khuôn mặt lần đầu tiên khi vào hệ thống lớp học.</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Xác thực giáo viên:</strong> Lớp học yêu cầu sự xác thực của Giáo viên chủ nhiệm bằng khuôn mặt để kích hoạt các cài đặt đặc biệt.</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "bao-mat",
      title: "4. Phân quyền và Bảo mật",
      icon: <ShieldCheck className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <p className="text-slate-600 leading-relaxed">
            Hệ thống áp dụng cơ chế bảo mật nhiều lớp:
          </p>
          <ul className="list-disc pl-5 text-slate-600 space-y-2 text-sm">
            <li><strong>Mức học sinh:</strong> Yêu cầu User ID và Mật khẩu (đối với đăng nhập hệ thống nội bộ).</li>
            <li><strong>Mức giáo viên:</strong> Sử dụng Email có thể liên kết qua Google. Mượn phòng và xét duyệt thông tin cơ bản.</li>
            <li><strong>Mức quản trị (Admin):</strong> Toàn quyền thay đổi, tạo phòng, lên danh sách, phân quyền và dọn dẹp dữ liệu sinh trắc học của Giáo viên.</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black text-slate-900 mb-2 flex items-center gap-3">
          <BookOpenText className="w-8 h-8 text-blue-600" />
          Hướng Dẫn Sử Dụng
        </h1>
        <p className="text-slate-500">Tài liệu tham khảo và giải đáp quy trình sử dụng các tính năng của Smart School Workspace System.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Mục lục - Navigation */}
        <div className="md:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Mục lục</h3>
            <nav className="space-y-1">
              {sections.map(section => (
                <a 
                  key={section.id} 
                  href={`#${section.id}`}
                  className="block px-3 py-2 text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Nội dung */}
        <div className="md:col-span-3 space-y-8">
          {sections.map((section, idx) => (
            <motion.div 
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              id={section.id}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden scroll-mt-24"
            >
              <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold font-display text-slate-800">{section.title}</h2>
              </div>
              <div className="p-6 md:p-8">
                {section.content}
              </div>
            </motion.div>
          ))}

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white text-center shadow-lg shadow-blue-500/20">
            <h3 className="text-xl font-bold font-display mb-2">Cần hỗ trợ thêm?</h3>
            <p className="text-blue-100 text-sm mb-6 max-w-md mx-auto">
              Nếu bạn gặp khó khăn trong quá trình sử dụng hệ thống, vui lòng liên hệ với ban quản trị hoặc bộ phận kỹ thuật để được hỗ trợ nhanh nhất.
            </p>
            <a href="https://zalo.me/0364975058" target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:scale-105 transition-all">
              Liên hệ kỹ thuật trực tuyến
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
