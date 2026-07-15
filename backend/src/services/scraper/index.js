// services/scraper/index.js
const siteA = require("./sites/siteA.scraper");

const scrapers = { siteA };

async function scrapeChapterImages(sourceUrl) {
  // Mở rộng thêm điều kiện khi có site thứ 2, thứ 3...
  if (sourceUrl.includes("site-a-domain.com")) {
    return scrapers.siteA.scrapeChapterImages(sourceUrl);
  }
  throw new Error(`Không có scraper hỗ trợ cho nguồn: ${sourceUrl}`);
}

module.exports = { scrapeChapterImages };