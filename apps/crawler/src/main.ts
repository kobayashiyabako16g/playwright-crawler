// For more information, see https://crawlee.dev/
import { PlaywrightCrawler, Dataset } from "crawlee";

import { router } from "./routes.js";

// User-Agentリスト（ランダム選択）
const userAgentStrings = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.2227.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.3497.92 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
];
const randomUserAgent = userAgentStrings[Math.floor(Math.random() * userAgentStrings.length)];

// 検索キーワードを設定
const keyword = "Playwright クローラー";
const encodedKeyword = encodeURIComponent(keyword);
const startUrls = [`https://www.google.com/search?q=${encodedKeyword}&hl=ja&num=10`];

console.log(`User-Agent: ${randomUserAgent}`);

const crawler = new PlaywrightCrawler({
  requestHandler: router,
  maxRequestsPerCrawl: 1,
  maxRequestRetries: 1,
  headless: true,

  // ブラウザ設定
  launchContext: {
    launchOptions: {
      channel: "chrome", // 実際のChromeを使用
    },
    userAgent: randomUserAgent,
  },

  browserPoolOptions: {
    useFingerprints: true,
    fingerprintOptions: {
      fingerprintGeneratorOptions: {
        browsers: ["chrome"],
        devices: ["desktop"],
        operatingSystems: ["macos"],
      },
    },
  },

  // リクエスト前にヘッダーを設定
  preNavigationHooks: [
    async ({ page }) => {
      // 追加のヘッダーを設定
      await page.setExtraHTTPHeaders({
        referer: "https://www.google.com/",
        "accept-language": "ja,en;q=0.9",
        "accept-encoding": "gzip, deflate, br",
      });

      await page.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", {
          get: () => undefined,
        });
      });
    },
  ],
});

console.log(`検索キーワード: "${keyword}"`);
await crawler.run(startUrls);

// 全データを1つのJSONファイルにエクスポート
await Dataset.exportToJSON("results");
console.log("完了！結果は storage/key_value_stores/default/results.json に保存されています");
