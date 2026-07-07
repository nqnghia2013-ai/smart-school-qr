import OpenAI from "openai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { title, subject, type } = req.body;
    
    const apiKey = process.env.QWEN_API_KEY;
    const baseURL = process.env.QWEN_API_BASE_URL;
    
    if (!apiKey) {
      // Fallback: If no API key, assume it's safe to not block users, but log a warning
      return res.status(200).json({ isSafe: true, reason: "No AI key provided, bypass scan." });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL || "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });

    const systemPrompt: { role: "system", content: string } = {
      role: "system",
      content: `Bạn là hệ thống kiểm duyệt nội dung tự động AI của trường học.
      Dựa vào thông tin tài liệu giáo dục (Tiêu đề, Môn học, Loại tài liệu), hãy xác định xem tài liệu đó có an toàn, phù hợp với môi trường học đường không.
      Những tài liệu chứa từ ngữ phản cảm, 18+, đồi trụy, bạo lực, gian lận (hack, cheat), chống phá, độc hại sẽ bị coi là KHÔNG AN TOÀN.
      Trả về kết quả dưới dạng JSON có cấu trúc:
      {
        "isSafe": true/false,
        "reason": "Lý do ngắn gọn vì sao an toàn hoặc không an toàn"
      }
      Chỉ trả về chuỗi JSON hợp lệ, không có markdown hoặc text xung quanh.`
    };

    const completion = await openai.chat.completions.create({
      model: process.env.QWEN_MODEL_NAME || "qwen2.5-72b-instruct",
      messages: [
        systemPrompt,
        { role: "user" as const, content: `Tiêu đề: "${title}"\nMôn học: ${subject}\nLoại file: ${type}` }
      ] as any[],
      response_format: { type: "json_object" }
    });

    const reply = completion.choices[0].message.content;
    let result = { isSafe: true, reason: "An toàn" };
    
    if (reply) {
      try {
        result = JSON.parse(reply);
      } catch (e) {
        console.error("Failed to parse JSON from AI", reply);
      }
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Scan API error:", error);
    // On error, default to safe so we don't break the app, or we can choose to reject. We'll default to safe to avoid blocking uploads on API errors.
    res.status(200).json({ isSafe: true, error: error.message || "Failed to scan AI" });
  }
}
