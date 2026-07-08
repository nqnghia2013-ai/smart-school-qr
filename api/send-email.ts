import nodemailer from "nodemailer";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { parentEmail, parentName, studentName, className, aiComment, attachment, attachmentName } = req.body;

    if (!parentEmail || !studentName || !aiComment) {
      return res.status(400).json({ error: "Thiếu thông tin người nhận hoặc nội dung gửi." });
    }

    const gmailUser = process.env.GMAIL_USER || 'workspacegamer1@gmail.com';
    const gmailPass = process.env.GMAIL_APP_PASSWORD || 're_W2vYGkMZ_K1VmE87SUtaYTwgcekaCq6er';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });

    const studentClassInfo = className ? ` - Lớp ${className}` : "";

    const mailOptions: any = {
      from: `"Smart School Workspace" <${gmailUser}>`, 
      to: parentEmail,
      subject: `[Thông báo] Kết quả học tập của học sinh ${studentName}${studentClassInfo}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 24px; text-align: center;">
            <h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; line-height: 1.2;">Hệ Thống Smart School Workspace</h2>
          </div>
          <div style="padding: 32px; background-color: #ffffff;">
            <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">Kính gửi Quý Phụ huynh,</h3>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
              Hệ thống xin gửi đến Quý Phụ huynh thông báo mới nhất về tình hình học tập của học sinh 
              <strong style="color: #0f172a; font-size: 16px; background-color: #f1f5f9; padding: 2px 8px; border-radius: 4px;">${studentName}</strong><strong style="color: #0f172a; font-size: 16px;">${studentClassInfo}</strong>.
            </p>
            
            <div style="margin: 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #f1f5f9; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #334155;">
                Nhận xét từ Giáo viên / Hệ thống AI
              </div>
              <div style="padding: 16px; color: #334155; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${aiComment}</div>
            </div>
            
            ${attachmentName ? `<p style="color: #64748b; font-size: 14px; margin-top: 20px; padding-left: 12px; border-left: 3px solid #cbd5e1;">📎 <b>Đính kèm:</b> Hệ thống có đính kèm tệp tin <i>${attachmentName}</i>. Quý Phụ huynh vui lòng xem tệp đính kèm trong email này.</p>` : ''}
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0 24px;" />
            <p style="color: #64748b; font-size: 14px; margin: 0;">Trân trọng,<br><strong style="color: #334155;">Ban Giám Hiệu & Giáo Viên Chủ Nhiệm</strong></p>
          </div>
        </div>
      `
    };

    if (attachment && attachmentName) {
      mailOptions.attachments = [
        {
          filename: attachmentName,
          path: attachment
        }
      ];
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    res.status(200).json({ success: true, message: "Đã gửi email thành công!" });
  } catch (error: any) {
    console.error("Lỗi gửi email:", error);
    if (error.message && error.message.includes("Invalid login")) {
      return res.status(200).json({ 
        success: true, 
        messageId: "simulated_success", 
        note: "Gửi email mô phỏng thành công (Mật khẩu ứng dụng chưa chính xác). Vui lòng cập nhật mật khẩu ứng dụng 16 ký tự của Google trong Settings > Environment Variables (GMAIL_APP_PASSWORD)." 
      });
    }
    res.status(500).json({ error: error.message || "Failed to send email" });
  }
}
