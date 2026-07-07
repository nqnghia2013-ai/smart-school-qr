import React from 'react';
import { BookMarked, SettingsIcon, AlertCircle } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-10 text-center">
        <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
          <BookMarked className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-display font-black text-slate-900 mb-4">Điều Khoản Dịch Vụ</h1>
        <p className="text-slate-500">Các quy định sử dụng hệ thống Smart School Workspace System.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm space-y-8">
        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-800">
            <AlertCircle className="w-5 h-5 text-indigo-500" />
            1. Chấp nhận các Điều khoản
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Bằng việc đăng nhập và truy cập vào hệ thống Smart School Workspace System, người dùng mặc định đồng ý tuân thủ toàn bộ các điều khoản được nêu dưới đây. Nếu không đồng ý, xin vui lòng không tiếp tục sử dụng dịch vụ.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-800">
            <SettingsIcon className="w-5 h-5 text-indigo-500" />
            2. Trách nhiệm của Người dùng
          </h2>
          <ul className="list-decimal pl-5 space-y-3 text-slate-600 leading-relaxed">
            <li><strong>Bảo mật tài khoản:</strong> Bạn hoàn toàn chịu trách nhiệm bảo mật cho tên đăng nhập và mật khẩu của mình. Bất kỳ thao tác nào xuất phát từ tài khoản của bạn sẽ được mặc định là của chính bạn.</li>
            <li><strong>Sử dụng hợp pháp:</strong> Không dùng hệ thống vào các việc phát tán thông tin độc hại, không đúng sự thật, phá hoại hệ thống an ninh mạng của trường học.</li>
            <li><strong>Cung cấp số liệu nhận diện:</strong> Vui lòng không sử dụng hình ảnh của người khác làm công cụ qua mặt Face ID. Hành động vi phạm sẽ bị cảnh cáo về mặt kỷ luật của trường.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-800">
            <SettingsIcon className="w-5 h-5 text-indigo-500" />
            3. Quyền của Quản trị viên
          </h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            Quản trị viên hệ thống có quyền:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>Khóa, xóa hoặc tạm ngừng tài khoản nếu phát hiện người dùng vi phạm quy định.</li>
            <li>Điều chỉnh luồng thông tin, bảo dưỡng định kỳ hệ thống.</li>
            <li>Kiểm duyệt và xóa bỏ các tài liệu mượn phòng, lớp không hợp lệ.</li>
          </ul>
        </section>

        <div className="mt-8 pt-8 border-t border-slate-100 text-sm text-slate-500 italic">
          Bản cập nhật gần nhất: Tháng 6 năm 2026.
        </div>
      </div>
    </div>
  );
}
