import * as cheerio from "cheerio";
import TurndownService from "turndown";

/**
 * Convert HTML to Markdown for efficient token usage
 */
export function htmlToMarkdown(html: string): string {
  const $ = cheerio.load(html);

  // Remove unnecessary elements
  $("script, style, noscript, iframe, svg, nav, footer, header, [hidden]").remove();

  // Remove elements with display:none
  $("*").each((_, el) => {
    const element = $(el);
    if (element.css("display") === "none") {
      element.remove();
    }
  });

  const cleanHtml = $.html();

  // Convert to Markdown
  const turndownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
  });

  // Remove images
  turndownService.addRule("remove-images", {
    filter: "img",
    replacement: () => "",
  });

  // Keep links with their URLs
  turndownService.addRule("keep-links", {
    filter: "a",
    replacement: (content, node) => {
      const href = (node as HTMLAnchorElement).getAttribute("href");
      if (href && href.startsWith("http")) {
        return `[${content}](${href})`;
      }
      return content;
    },
  });

  return turndownService.turndown(cleanHtml);
}
