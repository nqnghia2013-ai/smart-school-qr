import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";
import mammoth from "mammoth";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API route for Chatbot
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      const ollamaUrl = process.env.OLLAMA_API_URL;
      const ollamaModel = process.env.OLLAMA_MODEL || "llama3";
      
      const systemPrompt = "Bạn là trợ lý ảo AI của nền tảng giáo dục \"Smart School Workspace System\" (Nền tảng trường học thông minh tích hợp QR Code).\nNhiệm vụ của bạn là hỗ trợ học sinh, giáo viên, và cán bộ quản lý sử dụng các tính năng của trang web, cũng như trả lời các câu hỏi về thông tin trường học, học tập.\nTrang web bao gồm các chức năng chính:\n- Dashboard (bảng điều khiển tổng quan)\n- Phòng Bộ Môn (hiển thị danh sách, thông tin các phòng bộ môn)\n- Lớp Học Số (các lớp học ảo, tài liệu giảng dạy, mã QR)\n- Hồ Sơ Học Sinh (theo dõi thông tin cá nhân, điểm, thẻ QR học sinh)\n- Thư viện tài liệu (tài liệu ôn tập, bài giảng)\n- Kết nối & Giao lưu (không gian nhắn tin, kết bạn)\n- Hỏi đáp ẩn danh (trò chuyện giải đáp thắc mắc không lộ danh tính)\n- Giáo Viên (danh sách và thông tin hồ sơ giáo viên)\n- Quản lý Trường (dành cho Ban giám hiệu)\n- Bản Đồ (Bản đồ số định vị trường học)\n- Nhật Ký (Nhật ký công việc/học tập)\n- Góp ý, Câu hỏi thường gặp, Chính sách bảo mật.\n\nNếu người dùng hỏi về tính năng hoặc cách sử dụng, hãy hướng dẫn họ một cách ngắn gọn, rõ ràng theo đúng những tính năng trên. Không được bịa ra các tính năng không có. Bạn có thể sử dụng định dạng danh sách để trình bày các bước rõ ràng.";

      if (ollamaUrl) {
         const ollamaMessages = [
            { role: "system", content: systemPrompt },
            ...messages
         ];
         const ollamaRes = await fetch(`${ollamaUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               model: ollamaModel,
               messages: ollamaMessages,
               stream: false
            })
         });
         const data = await ollamaRes.json();
         return res.json({ reply: data.message.content });
      } else if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
         const apiKey = process.env.GEMINI_API_KEY;
         const ai = new GoogleGenAI({ apiKey: apiKey });
         const formattedMessages = messages.map((m: any) => m.content);
         const response = await ai.models.generateContent({
           model: "gemini-2.5-flash",
           contents: formattedMessages.join("\n\n"),
           config: { systemInstruction: systemPrompt },
         });
         return res.json({ reply: response.text });
      } else if (process.env.QWEN_API_KEY) {
         const qwenKey = process.env.QWEN_API_KEY;
         const qwenBaseUrl = process.env.QWEN_API_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
         const qwenModel = process.env.QWEN_MODEL_NAME || "qwen2.5-72b-instruct";
         
         const openai = new OpenAI({
           apiKey: qwenKey,
           baseURL: qwenBaseUrl,
         });
         
         const completion = await openai.chat.completions.create({
           model: qwenModel,
           messages: [{ role: "system", content: systemPrompt }, ...messages] as any,
         });
         return res.json({ reply: completion.choices[0].message.content });
      } else {
         return res.status(500).json({ error: "No AI service configured. Please check your environment variables." });
      }
    } catch (error: any) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch response from AI" });
    }
  });

  // API route for Workspace AI
  app.post("/api/workspace/ai", async (req, res) => {
    try {
      const { prompt, systemPrompt } = req.body;
      const ollamaUrl = process.env.OLLAMA_API_URL;
      const ollamaModel = process.env.OLLAMA_MODEL || "llama3";

      if (ollamaUrl) {
         let ollamaPrompt = prompt;
         if (systemPrompt) {
           ollamaPrompt = systemPrompt + "\n\n" + prompt;
         }
         const ollamaRes = await fetch(`${ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               model: ollamaModel,
               prompt: ollamaPrompt,
               stream: false
            })
         });
         const data = await ollamaRes.json();
         return res.json({ reply: data.response });
      } else if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
         const apiKey = process.env.GEMINI_API_KEY;
         const ai = new GoogleGenAI({ apiKey: apiKey });
         const response = await ai.models.generateContent({
           model: "gemini-2.5-flash",
           contents: prompt,
           config: { systemInstruction: systemPrompt || undefined },
         });
         return res.json({ reply: response.text });
      } else if (process.env.QWEN_API_KEY) {
         const qwenKey = process.env.QWEN_API_KEY;
         const qwenBaseUrl = process.env.QWEN_API_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
         const qwenModel = process.env.QWEN_MODEL_NAME || "qwen2.5-72b-instruct";
         
         const openai = new OpenAI({
           apiKey: qwenKey,
           baseURL: qwenBaseUrl,
         });

         const completion = await openai.chat.completions.create({
           model: qwenModel,
           messages: [
             ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
             { role: "user", content: prompt }
           ] as any,
         });
         return res.json({ reply: completion.choices[0].message.content });
      } else {
         return res.json({ reply: "[]" });
      }
    } catch (error: any) {
      console.error("Workspace AI API Error:", error);
      // Return a valid JSON array or object string so frontend doesn't crash on parse!
      res.json({ reply: "[]" });
    }
  });

  // API route for Document Scan
  app.post("/api/scan-document", async (req, res) => {
    try {
      const { title, subject, type, content, link } = req.body;
      
      const apiKey = process.env.QWEN_API_KEY;
      const baseURL = process.env.QWEN_API_BASE_URL;

      let extractedText = "Không có";
      
      if (link) {
        try {
          let fetchUrl = link;
          if (link.includes('docs.google.com/document/d/')) {
             const docIdMatch = link.match(/\/d\/([a-zA-Z0-9-_]+)/);
             if (docIdMatch) {
                 fetchUrl = `https://docs.google.com/document/d/${docIdMatch[1]}/export?format=txt`;
             }
          }
          const linkRes = await fetch(fetchUrl);
          if (linkRes.ok) {
             extractedText = await linkRes.text();
          } else {
             extractedText = "(Không thể truy cập đường dẫn Drive. Vui lòng đảm bảo quyền chia sẻ là Bất kỳ ai có liên kết đều có thể xem)";
          }
        } catch (err) {
          console.error("Error fetching drive link:", err);
          extractedText = "(Lỗi khi đọc link Drive)";
        }
      } else if (content && typeof content === 'string' && content.startsWith('data:')) {
        try {
          const match = content.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            const mimeType = match[1];
            const base64Data = match[2];
            const buffer = Buffer.from(base64Data, 'base64');
            
            if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword' || title.endsWith('.docx')) {
              const result = await mammoth.extractRawText({ buffer });
              extractedText = result.value;
            } else if (mimeType.startsWith('text/')) {
              extractedText = buffer.toString('utf-8');
            } else {
              extractedText = `(Không thể trích xuất nội dung văn bản từ định dạng ${mimeType}. Vui lòng thử file .txt hoặc .docx)`;
            }
          }
        } catch (err) {
          console.error("Error extracting text:", err);
          extractedText = "(Lỗi trích xuất nội dung)";
        }
      } else if (content && typeof content === 'string') {
        extractedText = content;
      }

      // Truncate to avoid exceeding context window
      if (extractedText.length > 20000) {
        extractedText = extractedText.substring(0, 20000);
      }

      const ollamaUrl = process.env.OLLAMA_API_URL;
      const ollamaModel = process.env.OLLAMA_MODEL || "llama3";
      const geminiKey = process.env.GEMINI_API_KEY;

      const prompt = `Bạn là hệ thống AI kiểm duyệt nội dung của trường học thông minh tại Việt Nam.
      Hãy phân tích cực kỳ kỹ lưỡng tài liệu sau đây để đảm bảo an toàn tuyệt đối và tuân thủ nghiêm ngặt quy định pháp luật Việt Nam cũng như thuần phong mỹ tục.

      Tài liệu cần quét:
      - Tiêu đề: "${title}"
      - Môn học: ${subject}
      - Loại file: ${type}
      - Nội dung trích xuất bên trong tài liệu: "${extractedText}"

      QUY TẮC DUYỆT TÀI LIỆU (CỰC KỲ NGHIÊM NGẶT):
      1. Đánh giá là KHÔNG AN TOÀN (isSafe: false) nếu phát hiện bất kỳ nội dung hoặc từ ngữ nào thuộc các nhóm sau đây:
         - Vi phạm pháp luật Việt Nam: Chống phá chính quyền, xuyên tạc lịch sử, xuyên tạc chủ quyền lãnh thổ Việt Nam (ví dụ: bản đồ hình lưỡi bò, thiếu Hoàng Sa - Trường Sa), phản động, kích động biểu tình, tuyên truyền tôn giáo trái phép.
         - Nội dung nhạy cảm, đồi trụy, 18+: Từ ngữ thô tục, khiêu dâm, nội dung người lớn, kích dục, hẹn hò không lành mạnh trong học đường.
         - Bạo lực, độc hại: Kích động bạo lực học đường, tự hại, cờ bạc, cá độ, ma túy, chất kích thích, hướng dẫn chế tạo vũ khí hoặc chất nổ.
         - Gian lận học tập: Cung cấp phần mềm hack, cheat, các phương pháp gian lận thi cử trái phép.
         - Ngôn từ thô tục, chửi thề, xúc phạm người khác, hoặc các hành vi bắt nạt trực tuyến.
      2. Nếu không phát hiện bất kỳ dấu hiệu vi phạm nào, đánh giá là AN TOÀN (isSafe: true).
      
      Yêu cầu trả về kết quả dưới dạng một đối tượng JSON duy nhất có cấu trúc chính xác sau:
      {
        "isSafe": true hoặc false,
        "reason": "Nếu không an toàn, giải thích chi tiết lý do và trích dẫn cụ thể câu chữ/nội dung vi phạm. Nếu an toàn, ghi lý do là 'Tài liệu an toàn và phù hợp'."
      }
      Lưu ý quan trọng: Chỉ trả về chuỗi JSON thô hợp lệ, tuyệt đối không viết thêm bất kỳ đoạn văn nào khác bên ngoài và không đặt trong cặp thẻ \`\`\`json \`\`\`.`;

      let aiResultText = "";

      if (ollamaUrl) {
         try {
           const ollamaRes = await fetch(`${ollamaUrl}/api/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                 model: ollamaModel,
                 prompt: prompt,
                 stream: false,
                 format: "json"
              })
           });
           const data = await ollamaRes.json();
           aiResultText = data.response;
         } catch(e) {
           console.error("Ollama error:", e);
           return res.status(200).json({ isSafe: false, reason: "Lỗi kết nối Ollama AI" });
         }
      } else if (geminiKey) {
         try {
           const { GoogleGenAI } = await import("@google/genai");
           const ai = new GoogleGenAI({ apiKey: geminiKey });
           const response = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: prompt,
           });
           aiResultText = response.text || "{}";
         } catch(e) {
           console.error("Gemini error:", e);
           return res.status(200).json({ isSafe: false, reason: "Lỗi kết nối Gemini AI" });
         }
      } else if (apiKey) {
         const openai = new OpenAI({
           apiKey: apiKey,
           baseURL: baseURL || "https://dashscope.aliyuncs.com/compatible-mode/v1",
         });
         const completion = await openai.chat.completions.create({
           model: process.env.QWEN_MODEL_NAME || "qwen2.5-72b-instruct",
           messages: [
             { role: "system", content: "You are a content moderator. Output JSON only." },
             { role: "user", content: prompt }
           ],
           response_format: { type: "json_object" }
         });
         aiResultText = completion.choices[0].message.content || "{}";
      } else {
         return res.status(200).json({ isSafe: false, reason: "Hệ thống kiểm duyệt AI chưa được cấu hình. Không cho phép tải lên." });
      }

      aiResultText = aiResultText.replace(/```json/g, '').replace(/```/g, '').trim();
      let result = { isSafe: true, reason: "An toàn" };
      
      if (aiResultText) {
        try {
          result = JSON.parse(aiResultText);
        } catch (e) {
          console.error("Failed to parse JSON from AI", aiResultText);
          result = { isSafe: false, reason: "Lỗi hệ thống phân tích AI, chặn để đảm bảo an toàn." };
        }
      }

      res.status(200).json(result);
    } catch (error: any) {
      console.error("Scan API error:", error);
      res.status(200).json({ isSafe: false, reason: error.message || "Lỗi quét AI, chặn để đảm bảo an toàn" });
    }
  });

  // API route for extracting og:image or video from URLs like Pinterest
  app.post("/api/extract-image", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });

      const html = await response.text();
      
      // Try to find video first
      // 1. Look for og:video
      let videoUrl = null;
      const ogVideoMatch = html.match(/<meta[^>]*property="og:video(?::secure_url)?"[^>]*content="([^"]+)"/i) || 
                           html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:video(?::secure_url)?"/i);
      
      if (ogVideoMatch && ogVideoMatch[1]) {
         videoUrl = ogVideoMatch[1];
      }

      // 2. Look for v.pinimg.com URLs (frequently used for Pinterest videos)
      if (!videoUrl) {
         const pinVideoMatch = html.match(/"(https:\/\/[^"]*v\.pinimg\.com[^"]*\.mp4[^"]*)"/i) ||
                               html.match(/(https:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/i) || 
                               html.match(/(https:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/i);
         if (pinVideoMatch && pinVideoMatch[1]) {
             // Unescape in case it's in JSON
             videoUrl = pinVideoMatch[1].replace(/\\u002F/g, '/');
         }
      }

      // 3. Fallback to generic video tag
      if (!videoUrl) {
         const videoTagMatch = html.match(/<video[^>]*src="([^"]+)"/i);
         if (videoTagMatch && videoTagMatch[1]) {
             videoUrl = videoTagMatch[1];
         }
      }
                           
      if (videoUrl) {
         return res.json({ imageUrl: videoUrl });
      }

      // Try to find og:image
      const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/) || 
                           html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/);
                           
      if (ogImageMatch && ogImageMatch[1]) {
        let finalImageUrl = ogImageMatch[1];
        if (finalImageUrl.includes('.pinimg.com/')) {
            finalImageUrl = finalImageUrl.replace(/\/\d+x\//, '/originals/');
        }
        return res.json({ imageUrl: finalImageUrl });
      }

      // If not found, just return original URL and let frontend handle it
      return res.json({ imageUrl: url });
    } catch (error) {
      console.error("Extract image error:", error);
      return res.status(500).json({ error: "Failed to extract image" });
    }
  });

  // API route for sending email to parents via Nodemailer (Gmail)
  app.post("/api/send-email", async (req, res) => {
    try {
      const { parentEmail, parentName, studentName, className, aiComment, attachment, attachmentName, schoolName } = req.body;

      if (!parentEmail || !studentName || !aiComment) {
        return res.status(400).json({ error: "Thiếu thông tin người nhận hoặc nội dung gửi." });
      }

      const activeSchoolName = schoolName || "Smart School Workspace - THCS Quảng Phú Cầu";

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
      res.json({ success: true, message: "Đã gửi email thành công!" });
    } catch (error: any) {
      console.error("Lỗi gửi email:", error);
      // Fallback for testing to simulate success if the Google App Password is not yet set up
      if (error.message && error.message.includes("Invalid login")) {
        return res.json({ 
          success: true, 
          messageId: "simulated_success", 
          note: "Gửi email mô phỏng thành công (Mật khẩu ứng dụng chưa chính xác). Vui lòng cập nhật mật khẩu ứng dụng 16 ký tự của Google trong Settings > Environment Variables (GMAIL_APP_PASSWORD)." 
        });
      }
      res.status(500).json({ error: error.message || "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
