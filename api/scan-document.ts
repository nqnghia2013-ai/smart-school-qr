import OpenAI from "openai";
import mammoth from "mammoth";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { title, subject, type, content, link } = req.body;
    
    const apiKey = process.env.QWEN_API_KEY;
    const baseURL = process.env.QWEN_API_BASE_URL;
    
    if (!apiKey) {
      return res.status(200).json({ isSafe: true, reason: "No AI key provided, bypass scan." });
    }

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

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL || "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });

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

    const completion = await openai.chat.completions.create({
      model: process.env.QWEN_MODEL_NAME || "qwen2.5-72b-instruct",
      messages: [
        { role: "system", content: "You are a content moderator. Output JSON only." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    let reply = completion.choices[0].message.content || "{}";
    reply = reply.replace(/```json/g, '').replace(/```/g, '').trim();
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
    res.status(200).json({ isSafe: true, error: error.message || "Failed to scan AI" });
  }
}
