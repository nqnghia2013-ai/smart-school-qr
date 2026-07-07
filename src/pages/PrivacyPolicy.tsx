import React from 'react';
import { ShieldAlert, ShieldCheck, Lock, EyeOff } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-10 text-center">
        <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-display font-black text-slate-900 mb-4">Chính Sách Bảo Mật</h1>
        <p className="text-slate-500">Bảo vệ quyền riêng tư và dữ liệu của bạn là ưu tiên hàng đầu của chúng tôi.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm space-y-8">
        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            1. Thu thập thông tin
          </h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            Chúng tôi thu thập các thông tin cơ bản sau để đảm bảo hệ thống vận hành trơn tru:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>Thông tin tài khoản:</strong> Bao gồm Tên đăng nhập, Email (nếu đăng nhập qua Google), và Mật khẩu (đã được mã hóa).</li>
            <li><strong>Dữ liệu sinh trắc học:</strong> Descriptor khuôn mặt được tạo bởi công cụ Face API để tiến hành điểm danh tự động. Chúng tôi KHÔNG lưu trữ hình ảnh gốc của học sinh.</li>
            <li><strong>Dữ liệu hoạt động:</strong> Lịch sử đăng nhập, lịch sử mượn phòng, tham gia các lớp học số.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-800">
            <Lock className="w-5 h-5 text-blue-500" />
            2. Sử dụng thông tin
          </h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            Hệ thống Smart School Workspace System sử dụng thông tin của bạn vào các mục đích:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>Xác thực và phân quyền truy cập hệ thống (Admin, BGH, Giáo viên, Học sinh).</li>
            <li>Quản lý tự động các thủ tục đăng ký, mượn trả phòng bộ môn.</li>
            <li>Thống kê điểm danh qua nhận diện khuôn mặt một cách minh bạch, an toàn.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-800">
            <EyeOff className="w-5 h-5 text-rose-500" />
            3. Chia sẻ dữ liệu
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Chúng tôi cam kết <strong>không mua bán, trao đổi hoặc cho thuê</strong> thông tin cá nhân của người dùng cho bên thứ ba. Dữ liệu chỉ được tiếp cận bởi Quản trị viên (Admin) và Ban Giám Hiệu nhà trường. Chúng tôi chịu trách nhiệm pháp lý cao nhất về các vấn đề lộ lọt quyền riêng tư của thiết bị.
          </p>
        </section>

        <div className="mt-8 pt-8 border-t border-slate-100 text-sm text-slate-500 italic">
          Bản cập nhật gần nhất: Tháng 6 năm 2026. Chúng tôi có thể thay đổi và cập nhật chính sách này bất cứ lúc nào để phù hợp với quy định mới.
        </div>
      </div>
    </div>
  );
}
