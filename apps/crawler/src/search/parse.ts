import * as cheerio from "cheerio";
import { generateJSON } from "../lib/vertexai.js";
import { htmlToMarkdown } from "../utils/html.js";

export interface SearchResult {
  rank: number;
  title: string;
  url: string;
}

/**
 * Extract search results section from HTML
 */
function extractSearchSection(html: string): string {
  const $ = cheerio.load(html);

  // Try to get just the search results container
  const rso = $("#rso").html();
  if (rso) return rso;

  const search = $("#search").html();
  if (search) return search;

  // Fallback to body
  return $("body").html() || html;
}

/**
 * Parse Google search results HTML using Gemini
 */
export async function parseSearchResults(
  html: string,
  limit: number = 10,
): Promise<SearchResult[]> {
  // Extract search section and convert to Markdown
  const searchSection = extractSearchSection(html);
  const markdown = htmlToMarkdown(searchSection);

  const prompt = `You are a search result parser. Extract the top ${limit} organic search results from the following Google search results content.

For each result, extract:
- rank: The position (1-based)
- title: The page title
- url: The full URL (starting with http)

Rules:
- Exclude ads (sponsored results)
- Exclude Google's own pages (google.com URLs)
- Exclude "People also ask" sections
- Exclude related searches
- Only include actual organic search results

Return a JSON array of objects with fields: rank, title, url

Content:
${markdown}`;

  try {
    const results = await generateJSON<SearchResult[]>(prompt);

    // Validate and clean results
    return results
      .filter((r) => r.url && r.url.startsWith("http") && !r.url.includes("google.com") && r.title)
      .slice(0, limit)
      .map((r, index) => ({
        rank: index + 1,
        title: r.title.trim(),
        url: r.url.trim(),
      }));
  } catch (error) {
    console.error("Failed to parse search results with Gemini:", error);
    throw error;
  }
}
