import React, { useRef, useState } from 'react';
import { Download, FileText, FileDown } from 'lucide-react';

export default function WorkLog() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [docNumber, setDocNumber] = useState('24-1/KH-THCS');
  const [docDate, setDocDate] = useState('19 tháng 06 năm 2026');
  const [recipients, setRecipients] = useState('- Ban Giám hiệu (để b/c);\n- Giáo viên phụ trách (để t/h);\n- Lưu: VT, Nhóm NC.');
  const [archiveLogNum, setArchiveLogNum] = useState('06/2026');
  const [archiveLogPage, setArchiveLogPage] = useState('149');
  const [archiveHour, setArchiveHour] = useState('09');
  const [archiveMinute, setArchiveMinute] = useState('25');
  const [archiveSecond, setArchiveSecond] = useState('55');
  const [archiveDay, setArchiveDay] = useState('25');
  const [archiveMonth, setArchiveMonth] = useState('06');
  const [archiveYear, setArchiveYear] = useState('2026');

  const exportPDF = () => {
    if (!contentRef.current) return;
    setIsExporting(true);
    
    // Sử dụng window.print() để xuất PDF (Save as PDF) với chất lượng Vector, text bôi đen được
    const printWindow = window.open('', '', 'width=800,height=800');
    if (!printWindow) {
      alert("Vui lòng cho phép hiện cửa sổ Pop-up để tiến hành tính năng in / xuất PDF.");
      setIsExporting(false);
      return;
    }

    const htmlContent = contentRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nhat_Ky_Lam_Viec_Smart_School</title>
          <style>
            @page { margin: 20mm; }
            body { 
              font-family: 'Times New Roman', Times, serif; 
              padding: 0; 
              color: black; 
              background: white; 
            }
            p {
              margin-top: 0.5rem;
              margin-bottom: 0.5rem;
              line-height: 1.5;
            }
            .text-center { text-align: center; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-start { align-items: flex-start; }
            .mb-12 { margin-bottom: 3rem; }
            .mb-8 { margin-bottom: 2rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-20 { margin-bottom: 5rem; }
            .mt-6 { margin-top: 1.5rem; page-break-after: avoid; }
            .mt-16 { margin-top: 4rem; page-break-inside: avoid; }
            .mt-8 { margin-top: 2rem; }
            .pt-8 { padding-top: 2rem; }
            .pt-4 { padding-top: 1rem; }
            .pb-1 { padding-bottom: 0.25rem; }
            .pl-8 { padding-left: 2rem; }
            .w-1\\/2 { width: 50%; }
            .inline-block { display: inline-block; }
            .border-b { border-bottom: 1px solid black; }
            .border-t { border-top: 1px dashed black; }
            .font-bold { font-weight: bold; }
            .italic { font-style: italic; }
            .uppercase { text-transform: uppercase; }
            .text-lg { font-size: 1.125rem; }
            .text-xl { font-size: 1.25rem; }
            .text-2xl { font-size: 1.5rem; }
            .text-sm { font-size: 0.875rem; }
            .text-base { font-size: 1rem; }
            .text-justify { text-align: justify; }
            .leading-relaxed { line-height: 1.625; }
            .list-disc { list-style-type: disc; margin-top: 0.5rem; margin-bottom: 1.5rem; }
            li { margin-bottom: 0.5rem; line-height: 1.5; text-align: justify; }
            .space-y-4 > * + * { margin-top: 1rem; }
            .editable-field {
              border: none !important;
              background: transparent !important;
              outline: none !important;
            }
          </style>
        </head>
        <body>
          <div style="max-width: 800px; margin: 0 auto;">
            ${htmlContent}
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setIsExporting(false);
  };

  const exportWord = () => {
    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Nhat_Ky_Lam_Viec_Smart_School</title>
        <style>
          body { font-family: "Times New Roman", Times, serif; font-size: 14pt; line-height: 1.5; color: black; }
          .text-center { text-align: center; }
          .text-justify { text-align: justify; }
          .bold { font-weight: bold; }
          .italic { font-style: italic; }
          .underline { text-decoration: underline; }
          .uppercase { text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; border: none; }
          td { vertical-align: top; border: none; padding: 0; }
          p { margin-top: 6pt; margin-bottom: 6pt; text-align: justify; line-height: 1.5; }
          ul { margin-top: 6pt; margin-bottom: 12pt; text-align: justify; }
          li { margin-bottom: 6pt; text-align: justify; line-height: 1.5; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td style="width: 40%; text-align: center;">
              <div class="uppercase" style="font-size: 12pt;">UBND XÃ ỨNG THIÊN</div>
              <div class="bold uppercase underline" style="font-size: 12pt; margin-bottom: 5pt;">TRƯỜNG THCS QUẢNG PHÚ CẦU</div>
              <div class="italic" style="font-size: 12pt; margin-top: 5pt;">Số: ${docNumber}</div>
            </td>
            <td style="width: 60%; text-align: center;">
              <div class="bold uppercase" style="font-size: 12pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div class="bold underline" style="font-size: 12pt; margin-bottom: 5pt;">Độc lập - Tự do - Hạnh phúc</div>
              <div class="italic" style="font-size: 12pt; margin-top: 5pt;">Ứng Thiên, ngày ${docDate}</div>
            </td>
          </tr>
        </table>

        <br/>

        <div class="text-center">
          <div class="bold uppercase" style="font-size: 14pt; margin-bottom: 6pt;">NHẬT KÝ LÀM VIỆC VÀ NGHIÊN CỨU DỰ ÁN</div>
          <div class="italic bold" style="font-size: 14pt; margin-bottom: 18pt;">Dự án: Hệ thống trường học thông minh - Smart School Workspace System</div>
        </div>

        <div className="text-justify">
          <p>Kính gửi: Ban Giám hiệu Nhà trường cùng các thầy cô giáo phụ trách chuyên môn.</p>
          <p>Tôi tên là <strong>Nguyễn Quý Nghĩa</strong>, học sinh lớp 7A2, trường THCS Quảng Phú Cầu, đồng thời là Trưởng nhóm nghiên cứu và phát triển giải pháp công nghệ số học đường.</p>
          <p>Nhằm mục đích cập nhật tiến độ liên tục và bám sát rủi ro của hệ thống, tôi xin gửi bản Nhật ký làm việc chi tiết của dự án <strong>Smart School Workspace System</strong>. Tính từ thời điểm bắt đầu triển khai chuyên sâu vào lúc <strong>21 giờ 36 phút ngày 31 tháng 05 năm 2026</strong> cho đến thời điểm chốt dữ liệu báo cáo vào lúc <strong>09 giờ 28 phút ngày 25 tháng 06 năm 2026</strong>, dự án đã được phát triển liên tục trong <strong>hơn 25 ngày</strong>. Dưới đây là những ghi chép thẳng thắn về các kết quả đạt được, cũng như những lỗi hiện hữu trong buổi sáng ngày hôm nay (từ chiều qua đến nay):</p>
        </div>

        <div class="bold uppercase" style="font-size: 14pt; margin-top: 18pt; margin-bottom: 6pt;">I. NHỮNG TÍNH NĂNG ĐÃ THÊM & CẢI THIỆN (Cập nhật chiều nay)</div>
        <ul>
          <li><strong>1. Đổi tên hệ thống:</strong> Đã cập nhật và đồng bộ tên gọi mới "Smart School Workspace System" trên toàn bộ các file, cấu hình, và giao diện, thay thế cho tên gọi cũ "Smart School QR" theo đúng định hướng không gian làm việc số toàn diện.</li>
          <li><strong>2. Tái cấu trúc giao diện Dashboard (Trang chủ):</strong> 
            <ul>
              <li>Chuyển đổi toàn bộ phong cách thiết kế sang giao diện sáng (Light Theme) hiện đại, lấy cảm hứng từ các nền tảng giáo dục lớn.</li>
              <li>Tạo Banner chào mừng (Hero Header) nổi bật, kết hợp các thẻ thống kê (Stats Cards) bo góc tròn (rounded-3xl) với hiệu ứng bóng đổ mềm mại (soft shadow).</li>
              <li>Thiết kế lại danh sách "Truy cập nhanh" (Quick Access) và "Phòng học bộ môn" sang dạng danh sách cuộn ngang (horizontal scroll) thay vì dạng lưới truyền thống, giúp tiết kiệm không gian màn hình.</li>
            </ul>
          </li>
          <li><strong>3. Nâng cấp thanh điều hướng (Sidebar):</strong> Chuyển từ giao diện tối (Dark mode) sang màu trắng tinh khôi, font chữ rõ nét. Các mục đang chọn (Active) được hiển thị màu xanh Indigo nổi bật cùng hiệu ứng hover mượt mà.</li>
          <li><strong>4. Tối ưu UX/UI với CSS tùy chỉnh:</strong> Viết thêm các class tiện ích như <code>.hide-scrollbar</code> vào file global css để ẩn các thanh cuộn thô kệch trên cả desktop và mobile, mang lại trải nghiệm vuốt trơn tru không tì vết.</li>
        </ul>

        <div class="bold uppercase" style="font-size: 14pt; margin-top: 18pt; margin-bottom: 6pt;">II. CÁC LỖI/VẤN ĐỀ ĐÃ XỬ LÝ TRONG HÔM NAY</div>
        <ul>
          <li><strong>1. Xử lý lỗi hiển thị văn bản (Text Truncation):</strong> Khắc phục tình trạng "bị che chữ", chữ bị cắt lẹm ở các thẻ hiển thị nội dung trên Dashboard và Sidebar. Đã cấu hình lại thuộc tính <code>line-clamp</code> và <code>min-w</code> để đảm bảo text luôn hiển thị đầy đủ và đẹp mắt nhất trên mọi kích thước màn hình.</li>
          <li><strong>2. Khắc phục lỗi tương thích UI/UX:</strong> Đảm bảo hệ thống tích hợp mượt mà các thư viện UI hiện đại (Framer Motion, Lucide Icons) và Tailwind CSS mà không gặp xung đột, giải quyết được sự lo lắng về việc không tải được thư viện giao diện đẹp.</li>
        </ul>

        <div class="bold uppercase" style="font-size: 14pt; margin-top: 18pt; margin-bottom: 6pt;">III. NHỮNG THỨ CHƯA THÊM / CẦN CẢI THIỆN (TO-DO LIST)</div>
        <p>Dù hôm nay ứng dụng đã trơn tru hơn rất nhiều và khoác lên mình giao diện mới tuyệt đẹp, nhưng vẫn còn những phần chưa được hoàn thiện, cần lên kế hoạch cho các bản cập nhật tới:</p>
        <ul>
          <li><strong>1. Mở rộng UI Light Theme:</strong> Cần tiếp tục đồng bộ hóa giao diện sáng, bo góc mượt mà này cho TẤT CẢ các trang còn lại của hệ thống (ví dụ: Trang bài tập, trang quản lý chi tiết) để đạt chuẩn mực 100%.</li>
          <li><strong>2. Tối ưu Responsive:</strong> Kiểm tra lại hiển thị trên một số dòng thiết bị di động màn hình gập hoặc tỷ lệ màn hình dị biệt.</li>
        </ul>

        <br/><br/>

        <table>
          <tr>
            <td style="width: 50%;">
              <div class="bold italic" style="font-size: 12pt; margin-bottom: 6pt;">Nơi nhận:</div>
              ${recipients.split('\n').map(r => `<div style="font-size: 12pt; line-height: 1.5;">${r}</div>`).join('')}
            </td>
            <td style="width: 50%; text-align: center;">
              <div class="bold" style="font-size: 14pt; margin-bottom: 4pt;">NGƯỜI LẬP NHẬT KÝ</div>
              <div class="italic" style="font-size: 12pt; margin-bottom: 70pt;">(Ký, ghi rõ họ tên)</div>
              <div class="bold" style="font-size: 14pt;">Nguyễn Quý Nghĩa</div>
            </td>
          </tr>
        </table>

        <br/><br/>
        <div style="border-top: 1px dashed black; padding-top: 10pt; font-size: 12pt; font-style: italic;">
          <p style="margin: 0; padding: 0;">Lưu vào sổ: Số: ${archiveLogNum}. Trang số: ${archiveLogPage}.</p>
          <p style="margin: 0; padding: 0;">Nộp lưu chiểu vào hồi: ${archiveHour} giờ ${archiveMinute} phút ${archiveSecond} giây, ngày ${archiveDay} tháng ${archiveMonth} năm ${archiveYear}.</p>
        </div>
      </body>
      </html>
    `;

    // Ensure MS Word recognizes the file encoding
    const blob = new Blob(['\ufeff', wordHtml], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = url;
    fileDownload.download = 'Nhat_Ky_Lam_Viec_Smart_School.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Nhật ký làm việc</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Báo cáo tiến độ và nghiệm thu hạng mục công việc</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportWord}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" /> Xuất Word
          </button>
          <button 
            onClick={exportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition-colors disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" /> {isExporting ? 'Đang xuất...' : 'Xuất PDF'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
        
        {/* Printable Content Container */}
        <div 
          ref={contentRef} 
          className="p-8 sm:p-12 md:p-16 text-slate-800"
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div className="text-center">
              <div className="font-bold text-lg mb-1 uppercase">UBND XÃ ỨNG THIÊN</div>
              <div className="font-bold text-lg border-b border-black pb-1 inline-block uppercase">TRƯỜNG THCS QUẢNG PHÚ CẦU</div>
              <div className="mt-2 text-sm italic">
                Số: <span contentEditable suppressContentEditableWarning onBlur={(e) => setDocNumber(e.currentTarget.textContent || '')} className="editable-field border-b border-dashed border-slate-300 hover:bg-yellow-50 focus:bg-yellow-50 outline-none cursor-text px-1 inline-block min-w-[50px]">{docNumber}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg mb-1 uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div className="font-bold text-lg border-b border-black pb-1 inline-block">Độc lập - Tự do - Hạnh phúc</div>
              <div className="mt-2 text-sm italic">
                Ứng Thiên, ngày <span contentEditable suppressContentEditableWarning onBlur={(e) => setDocDate(e.currentTarget.textContent || '')} className="editable-field border-b border-dashed border-slate-300 hover:bg-yellow-50 focus:bg-yellow-50 outline-none cursor-text px-1 inline-block min-w-[100px]">{docDate}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold uppercase mb-2">NHẬT KÝ LÀM VIỆC VÀ NGHIÊN CỨU DỰ ÁN</h2>
            <div className="text-xl font-bold italic">Dự án: Hệ thống trường học thông minh - Smart School Workspace System</div>
          </div>

          {/* Body */}
          <div className="space-y-4 text-justify text-base leading-relaxed">
            <p><strong>Kính gửi:</strong> Ban Giám hiệu Nhà trường cùng các thầy cô giáo phụ trách chuyên môn.</p>
            
            <p>Tôi tên là <strong>Nguyễn Quý Nghĩa</strong>, học sinh lớp 7A2, trường THCS Quảng Phú Cầu, đồng thời là Trưởng nhóm nghiên cứu và phát triển giải pháp công nghệ số học đường.</p>

            <p>Nhằm mục đích cập nhật tiến độ liên tục và bám sát rủi ro của hệ thống, tôi xin gửi bản Nhật ký làm việc chi tiết của dự án <strong>Smart School Workspace System</strong>. Tính từ thời điểm bắt đầu triển khai chuyên sâu vào lúc <strong>21 giờ 36 phút ngày 31 tháng 05 năm 2026</strong> cho đến thời điểm chốt dữ liệu báo cáo vào lúc <strong>09 giờ 28 phút ngày 25 tháng 06 năm 2026</strong>, dự án đã được phát triển liên tục trong <strong>hơn 25 ngày</strong>. Dưới đây là những ghi chép thẳng thắn về các kết quả đạt được, cũng như những lỗi hiện hữu trong buổi sáng ngày hôm nay:</p>

            <h3 className="font-bold text-lg mt-6 mb-3 uppercase">I. NHỮNG TÍNH NĂNG ĐÃ THÊM & CẢI THIỆN (Cập nhật chiều nay)</h3>
            <ul className="list-disc pl-8 space-y-2">
              <li><strong>1. Đổi tên hệ thống & Tái cấu trúc thanh điều hướng:</strong> 
                <ul className="list-disc pl-8 mt-2 space-y-1">
                  <li>Loại bỏ menu "Bản đồ" ra khỏi hệ thống, thay vào đó là tính năng "Lớp học" mới ở thanh Sidebar để tập trung vào số hóa quản lý lớp học.</li>
                  <li>Xoá bỏ trang SchoolMap cũ.</li>
                </ul>
              </li>
              <li><strong>2. Bổ sung hệ thống tiền tệ ảo (Xu/Coins) và Cửa hàng ảnh động (Gif Shop):</strong>
                <ul className="list-disc pl-8 mt-2 space-y-1">
                  <li>Phát triển mô hình dữ liệu tích hợp <code className="bg-slate-100 px-1 rounded">coins</code>, <code className="bg-slate-100 px-1 rounded">ownedGifs</code> và <code className="bg-slate-100 px-1 rounded">currentGif</code> vào User schema.</li>
                  <li>Tạo Cửa hàng ảnh nền động (GifShopModal) với các tab Cửa hàng và Kho của tôi. Mọi người có thể ấn vào và thay theo sở thích của mình hoặc bỏ tiền xu ra để mua.</li>
                  <li>Tích hợp hiển thị ảnh nền động làm background cho phần tổng quan (hero section) trên trang Dashboard, tự động làm tối phần chữ (backdrop) để đảm bảo độ tương phản nếu có ảnh.</li>
                  <li>Bổ sung nút truy cập "Shop Cửa Sổ" ngay trên màn hình Dashboard tổng quan.</li>
                  <li>Hiển thị số dư Xu hiện tại trên Header của hệ thống giúp học sinh và giáo viên theo dõi dễ dàng.</li>
                  <li>Quản trị viên có thêm quyền lực quản lý (tải ảnh gif hoặc ảnh tĩnh lên từ thiết bị hoặc URL, tạo mới sản phẩm với mức giá xu tự định đoạt).</li>
                </ul>
              </li>
              <li><strong>3. Hệ thống phần thưởng Xu:</strong>
                <ul className="list-disc pl-8 mt-2 space-y-1">
                  <li>Tích hợp cơ chế tặng 10 Xu mỗi khi học sinh/giáo viên xem xong tài liệu hoặc video bài giảng.</li>
                  <li>Thêm nút "Nhận Xu & Đóng" cực kỳ trực quan khi mở xem nội dung trong phòng học. Nút này tăng trực tiếp xu vào cơ sở dữ liệu.</li>
                </ul>
              </li>
            </ul>

            <h3 className="font-bold text-lg mt-6 mb-3 uppercase">II. CÁC LỖI/VẤN ĐỀ ĐÃ XỬ LÝ TRONG HÔM NAY</h3>
            <ul className="list-disc pl-8 space-y-2">
              <li><strong>1. Lỗi quá tải Firestore (Tài liệu vượt quá 1MB):</strong> 
                <ul className="list-disc pl-8 mt-2 space-y-1">
                  <li><strong>Nguyên nhân:</strong> Khi quản trị viên tải ảnh lên (Ảnh tĩnh/GIF) bằng file local, hệ thống chuyển đổi ảnh sang định dạng Base64 và lưu trực tiếp vào database. Một số file lớn đã gây ra lỗi hệ thống: <code className="bg-red-50 text-red-600 px-1 rounded block mt-1">error 0: Document cannot be written because its size (1,298,823 bytes) exceeds the maximum allowed size of 1,048,576 bytes.</code> (Kích thước tài liệu quá lớn).</li>
                  <li><strong>Cách xử lý:</strong> Đã cấu hình và viết lại logic chặn ngay từ ngoài Frontend. Khi quản trị viên tải tệp lên từ thiết bị, hệ thống tự động kiểm tra kích thước file, chỉ cho phép dung lượng dưới 700KB (để bù hao hụt dung lượng khi convert Base64) để đảm bảo không vi phạm giới hạn 1MB của Firestore.</li>
                </ul>
              </li>
              <li><strong>2. Lỗi Render Tool (Tool Call Error) & Cú pháp UI:</strong> Khắc phục thành công các sự cố về thiếu cú pháp hoặc mismatch trong quá trình thay đổi component Layout, không đồng bộ được Navbar giữa bản Desktop và Mobile. Đã đồng bộ thành công biến hiển thị trạng thái số Dư Xu trên thanh điều hướng.</li>
            </ul>

            <h3 className="font-bold text-lg mt-6 mb-3 uppercase">III. NHỮNG THỨ CHƯA THÊM / CẦN CẢI THIỆN (TO-DO LIST)</h3>
            <p>Dù dự án đã có thêm tính năng Gamification (Xu & Cửa hàng) tăng động lực cho học sinh rất mạnh, nhưng vẫn cần cải thiện:</p>
            <ul className="list-disc pl-8 space-y-2">
              <li><strong>1. Trò chơi (Games & Quiz):</strong> Cần hiện thực hóa các game Mini và làm dạng bài thi Quiz để học sinh có thể kiếm xu nhiều hơn (thay vì chỉ xem video và tài liệu như hiện tại).</li>
              <li><strong>2. Tối ưu ảnh Base64:</strong> Firebase Firestore không thực sự phù hợp để lưu ảnh định dạng Base64 với dung lượng lớn. Trong tương lai, cần tích hợp Firebase Storage để lưu file và chỉ lưu URL vào Firestore, từ đó hoàn toàn bỏ đi giới hạn 700KB.</li>
            </ul>
          </div>

          {/* Footer Signatures */}
          <div className="flex justify-between items-start mt-16 pt-8">
            <div className="w-1/2">
              <div className="font-bold mb-2 italic text-sm">Nơi nhận:</div>
              <div 
                contentEditable 
                suppressContentEditableWarning 
                onBlur={(e) => setRecipients(e.currentTarget.innerText || '')} 
                className="editable-field text-sm outline-none border border-dashed border-transparent hover:border-slate-300 hover:bg-yellow-50 focus:bg-yellow-50 focus:border-blue-400 p-1 min-h-[60px] whitespace-pre-wrap leading-relaxed inline-block"
              >
                {recipients}
              </div>
            </div>
            <div className="w-1/2 flex flex-col items-center text-center">
              <div className="font-bold text-lg">NGƯỜI LẬP NHẬT KÝ</div>
              <div className="italic text-sm mb-20">(Ký, ghi rõ họ tên)</div>
              <div className="font-bold text-lg">Nguyễn Quý Nghĩa</div>
            </div>
          </div>

          {/* Bottom Metatata */}
          <div className="mt-8 pt-4 border-t border-dashed border-slate-400 text-sm italic">
            <p className="mb-1 leading-relaxed">
              Lưu vào sổ: Số: <span contentEditable suppressContentEditableWarning onBlur={(e) => setArchiveLogNum(e.currentTarget.textContent || '')} className="editable-field border-b border-dashed border-slate-300 hover:bg-yellow-50 focus:bg-yellow-50 outline-none cursor-text px-1 inline-block min-w-[30px]">{archiveLogNum}</span>. 
              Trang số: <span contentEditable suppressContentEditableWarning onBlur={(e) => setArchiveLogPage(e.currentTarget.textContent || '')} className="editable-field border-b border-dashed border-slate-300 hover:bg-yellow-50 focus:bg-yellow-50 outline-none cursor-text px-1 inline-block min-w-[30px]">{archiveLogPage}</span>.
            </p>
             <p className="mb-0 leading-relaxed max-w-full">
              Nộp lưu chiểu vào hồi: <span contentEditable suppressContentEditableWarning onBlur={(e) => setArchiveHour(e.currentTarget.textContent || '')} className="editable-field border-b border-dashed border-slate-300 hover:bg-yellow-50 focus:bg-yellow-50 outline-none cursor-text px-1 inline-block min-w-[20px]">{archiveHour}</span> giờ <span contentEditable suppressContentEditableWarning onBlur={(e) => setArchiveMinute(e.currentTarget.textContent || '')} className="editable-field border-b border-dashed border-slate-300 hover:bg-yellow-50 focus:bg-yellow-50 outline-none cursor-text px-1 inline-block min-w-[20px]">{archiveMinute}</span> phút <span contentEditable suppressContentEditableWarning onBlur={(e) => setArchiveSecond(e.currentTarget.textContent || '')} className="editable-field border-b border-dashed border-slate-300 hover:bg-yellow-50 focus:bg-yellow-50 outline-none cursor-text px-1 inline-block min-w-[20px]">{archiveSecond}</span> giây, 
              ngày <span contentEditable suppressContentEditableWarning onBlur={(e) => setArchiveDay(e.currentTarget.textContent || '')} className="editable-field border-b border-dashed border-slate-300 hover:bg-yellow-50 focus:bg-yellow-50 outline-none cursor-text px-1 inline-block min-w-[20px]">{archiveDay}</span> tháng <span contentEditable suppressContentEditableWarning onBlur={(e) => setArchiveMonth(e.currentTarget.textContent || '')} className="editable-field border-b border-dashed border-slate-300 hover:bg-yellow-50 focus:bg-yellow-50 outline-none cursor-text px-1 inline-block min-w-[20px]">{archiveMonth}</span> năm <span contentEditable suppressContentEditableWarning onBlur={(e) => setArchiveYear(e.currentTarget.textContent || '')} className="editable-field border-b border-dashed border-slate-300 hover:bg-yellow-50 focus:bg-yellow-50 outline-none cursor-text px-1 inline-block min-w-[30px]">{archiveYear}</span>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
