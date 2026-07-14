// services/translation/claudeClient.js
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function translateImageSegment(imageBase64, glossary) {
  const glossaryText = glossary
    .map(g => `${g.term} → ${g.translation}`)
    .join("\n");

  const systemPrompt = `Bạn là công cụ dịch truyện tranh. Nhiệm vụ:
1. Đọc TẤT CẢ chữ trong ảnh (lời thoại, chú thích, SFX).
2. Dịch sang tiếng Việt, giữ văn phong tự nhiên, đúng ngữ cảnh truyện tranh.
3. Với mỗi đoạn chữ, trả về tọa độ khung chứa nó (bounding box) theo tỉ lệ % so với kích thước ảnh (0-1), không phải pixel.
4. Áp dụng đúng các thuật ngữ/tên riêng sau nếu xuất hiện:
${glossaryText || "(chưa có glossary)"}
5. Phát hiện thêm tên riêng/địa danh MỚI chưa có trong danh sách trên.

CHỈ trả về JSON theo đúng schema sau, không thêm text nào khác:
{
  "textBlocks": [
    { "originalText": "...", "translatedText": "...", "bbox": {"x":0.1,"y":0.05,"width":0.2,"height":0.08}, "type": "dialogue|sfx|caption" }
  ],
  "detectedEntities": [
    { "term": "...", "translation": "...", "type": "character|place|term" }
  ]
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/png", data: imageBase64 }
          },
          { type: "text", text: "Đọc và dịch toàn bộ chữ trong ảnh này." }
        ]
      }
    ]
  });

  const text = response.content.find(c => c.type === "text")?.text || "{}";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

export { translateImageSegment };