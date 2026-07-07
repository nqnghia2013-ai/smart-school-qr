const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

// We need to replace the OpenAI usage with @google/genai

serverCode = serverCode.replace(
  'import OpenAI from "openai";',
  'import OpenAI from "openai";\nimport { GoogleGenAI } from "@google/genai";'
);

// Fix /api/chat
serverCode = serverCode.replace(
  /app\.post\("\/api\/chat", async \(req, res\) => {[\s\S]*?res\.status\(500\)\.json\({ error: error\.message \|\| "Failed to fetch response from AI" }\);\s*}\s*}\);/,
  `app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing from environment variables." });
      }

      const ai = new GoogleGenAI({ apiKey: apiKey });
      const systemPrompt = "Bạn là trợ lý ảo AI của nền tảng giáo dục \\"Smart School Workspace System\\" (Nền tảng trường học thông minh tích hợp QR Code).\\nNhiệm vụ của bạn là hỗ trợ học sinh, giáo viên, và cán bộ quản lý sử dụng các tính năng của trang web, cũng như trả lời các câu hỏi về thông tin trường học, học tập.\\nTrang web bao gồm các chức năng chính:\\n- Dashboard (bảng điều khiển tổng quan)\\n- Phòng Bộ Môn (hiển thị danh sách, thông tin các phòng bộ môn)\\n- Lớp Học Số (các lớp học ảo, tài liệu giảng dạy, mã QR)\\n- Hồ Sơ Học Sinh (theo dõi thông tin cá nhân, điểm, thẻ QR học sinh)\\n- Thư viện tài liệu (tài liệu ôn tập, bài giảng)\\n- Kết nối & Giao lưu (không gian nhắn tin, kết bạn)\\n- Hỏi đáp ẩn danh (trò chuyện giải đáp thắc mắc không lộ danh tính)\\n- Giáo Viên (danh sách và thông tin hồ sơ giáo viên)\\n- Quản lý Trường (dành cho Ban giám hiệu)\\n- Bản Đồ (Bản đồ số định vị trường học)\\n- Nhật Ký (Nhật ký công việc/học tập)\\n- Góp ý, Câu hỏi thường gặp, Chính sách bảo mật.\\n\\nNếu người dùng hỏi về tính năng hoặc cách sử dụng, hãy hướng dẫn họ một cách ngắn gọn, rõ ràng theo đúng những tính năng trên. Không được bịa ra các tính năng không có. Bạn có thể sử dụng định dạng danh sách để trình bày các bước rõ ràng.";
      
      const formattedMessages = messages.map((m) => {
        return m.role === 'user' ? m.content : m.content;
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedMessages.join("\\n\\n"),
        config: { systemInstruction: systemPrompt },
      });

      res.json({ reply: response.text });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch response from AI" });
    }
  });`
);

// Fix /api/workspace/ai
serverCode = serverCode.replace(
  /app\.post\("\/api\/workspace\/ai", async \(req, res\) => {[\s\S]*?res\.json\({ reply: "Đã xảy ra lỗi khi gọi AI: " \+ error\.message }\);\s*}\s*}\);/,
  `app.post("/api/workspace/ai", async (req, res) => {
    try {
      const { prompt, systemPrompt } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({ reply: "Xin lỗi, hiện tại không thể kết nối tới AI (Thiếu GEMINI_API_KEY). Nhưng đây là phản hồi mẫu: \\n\\n" + prompt });
      }

      const ai = new GoogleGenAI({ apiKey: apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { systemInstruction: systemPrompt || undefined },
      });

      res.json({ reply: response.text });
    } catch (error) {
      console.error("Workspace AI API Error:", error);
      res.json({ reply: "Đã xảy ra lỗi khi gọi AI: " + error.message });
    }
  });`
);

fs.writeFileSync('server.ts', serverCode);
