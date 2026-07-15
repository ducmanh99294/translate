// services/scraper/sites/siteA.scraper.js
const cheerio = require("cheerio");

// TODO: đổi lại đúng selector thật của site bạn chọn sau khi khảo sát DOM
const IMAGE_CONTAINER_SELECTOR = ".chapter-content";
const IMAGE_TAG_SELECTOR = "img";

async function scrapeChapterImages(sourceUrl) {
  const response = await fetch(sourceUrl, {
    headers: {
      // nhiều site chặn request không có User-Agent giống trình duyệt thật
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Không tải được trang nguồn: HTTP ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const images = [];
  $(IMAGE_CONTAINER_SELECTOR)
    .find(IMAGE_TAG_SELECTOR)
    .each((index, el) => {
      const src = $(el).attr("data-src") || $(el).attr("src");
      if (!src) return;

      images.push({
        order: index,
        originalUrl: src.startsWith("http") ? src : new URL(src, sourceUrl).href,
        height: 0, // có thể lấy sau bằng sharp khi tải ảnh, hoặc bỏ qua nếu không cần
        width: 0,
      });
    });

  if (images.length === 0) {
    throw new Error("Không tìm thấy ảnh nào — kiểm tra lại selector cho đúng site");
  }

  return images;
}

module.exports = { scrapeChapterImages };