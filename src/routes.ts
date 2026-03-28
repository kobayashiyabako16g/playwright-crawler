import { createPlaywrightRouter } from "crawlee";

export const router = createPlaywrightRouter();

interface SearchResult {
  rank: number;
  title: string;
  url: string;
}

router.addDefaultHandler(async ({ page, log, pushData }) => {
  log.info("Google検索結果を取得中...");

  // ページ読み込みを待機
  await page.waitForLoadState("networkidle");

  // デバッグ: 現在のURLとタイトルを表示
  log.info(`ページタイトル: ${await page.title()}`);
  log.info(`URL: ${page.url()}`);

  // デバッグ用: スクリーンショットとHTMLを保存
  await page.screenshot({ path: "storage/debug.png", fullPage: true });
  const html = await page.content();
  const fs = await import("fs");
  fs.writeFileSync("storage/debug.html", html);
  log.info("デバッグ用ファイルを storage/debug.png, storage/debug.html に保存しました");

  // Cookie同意画面が表示された場合の処理
  try {
    const consentButton = page.locator(
      'button:has-text("すべて同意"), button:has-text("同意する"), button:has-text("Accept all")',
    );
    if (await consentButton.isVisible({ timeout: 3000 })) {
      log.info("Cookie同意ボタンをクリック");
      await consentButton.click();
      await page.waitForTimeout(1000);
    }
  } catch {
    // 同意画面がない場合は無視
  }

  // 検索結果を取得（複数のセレクタパターンを試す）
  let results: SearchResult[] = [];

  // パターン1: 一般的な検索結果 (div with data-sokoban-container or data-hveid)
  results = await page.$$eval(
    'div[data-hveid] a[href^="http"]:has(h3), #rso a[href^="http"]:has(h3), .g a[href^="http"]:has(h3)',
    (elements, limit) => {
      const items: SearchResult[] = [];
      const seenUrls = new Set<string>();

      for (const linkEl of elements) {
        if (items.length >= limit) break;

        const url = linkEl.getAttribute("href");
        const titleEl = linkEl.querySelector("h3");

        if (url && titleEl && !seenUrls.has(url)) {
          const title = titleEl.textContent;
          if (url.startsWith("http") && title && !url.includes("google.com")) {
            seenUrls.add(url);

            items.push({
              rank: items.length + 1,
              title: title.trim(),
              url: url,
            });
          }
        }
      }

      return items;
    },
    10,
  );

  log.info(`${results.length}件の検索結果を取得しました`);

  for (const result of results) {
    log.info(`#${result.rank}: ${result.title}`);
    log.info(`  URL: ${result.url}`);
    await pushData(result);
  }
});
