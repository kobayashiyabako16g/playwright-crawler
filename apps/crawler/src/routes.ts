import { createPlaywrightRouter } from "crawlee";
import { parseSearchResults } from "./search/parse.js";

export const router = createPlaywrightRouter();

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

  // Geminiを使って検索結果をパース
  log.info("Geminiで検索結果をパース中...");
  const results = await parseSearchResults(html, 10);

  log.info(`${results.length}件の検索結果を取得しました`);

  for (const result of results) {
    log.info(`#${result.rank}: ${result.title}`);
    log.info(`  URL: ${result.url}`);
    await pushData(result);
  }
});
