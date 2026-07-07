import OpenAI from "openai";

export default async function handler(req: any, res: any) {
  // Chỉ cho phép phương thức POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;
    
    const apiKey = process.env.QWEN_API_KEY;
    const baseURL = process.env.QWEN_API_BASE_URL;
    
    if (!apiKey) {
      return res.status(500).json({ error: "QWEN_API_KEY is missing from environment variables." });
    }

    // Khởi tạo OpenAI client trỏ đến provider Qwen
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL || "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });

    const systemPrompt: { role: "system"; content: string } = {
      role: "system",
      content: `Bạn là trợ lý ảo AI của nền tảng giáo dục "Smart School QR" (Nền tảng trường học thông minh tích hợp QR Code).
      Nhiệm vụ của bạn là hỗ trợ học sinh, giáo viên, và cán bộ quản lý sử dụng các tính năng của trang web, cũng như trả lời các câu hỏi về thông tin trường học, học tập.
      Trang web bao gồm các chức năng chính:
      - Dashboard (bảng điều khiển tổng quan)
      - Phòng Bộ Môn (hiển thị danh sách, thông tin các phòng bộ môn)
      - Lớp Học Số (các lớp học ảo, tài liệu giảng dạy, mã QR)
      - Hồ Sơ Học Sinh (theo dõi thông tin cá nhân, điểm, thẻ QR học sinh)
      - Thư viện tài liệu (tài liệu ôn tập, bài giảng)
      - Kết nối & Giao lưu (không gian nhắn tin, kết bạn)
      - Hỏi đáp ẩn danh (trò chuyện giải đáp thắc mắc không lộ danh tính)
      - Giáo Viên (danh sách và thông tin hồ sơ giáo viên)
      - Quản lý Trường (dành cho Ban giám hiệu)
      - Bản Đồ (Bản đồ số định vị trường học)
      - Nhật Ký (Nhật ký công việc/học tập)
      - Góp ý, Câu hỏi thường gặp, Chính sách bảo mật.
      
      Nếu người dùng hỏi về tính năng hoặc cách sử dụng, hãy hướng dẫn họ một cách ngắn gọn, rõ ràng theo đúng những tính năng trên. Không được bịa ra các tính năng không có. Bạn có thể sử dụng định dạng danh sách để trình bày các bước rõ ràng.`
    };

    const completion = await openai.chat.completions.create({
      model: process.env.QWEN_MODEL_NAME || "qwen2.5-72b-instruct",
      messages: [systemPrompt, ...messages],
    });

    res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch response from AI" });
  }
}
