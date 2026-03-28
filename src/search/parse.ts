import { generateJSON } from "../lib/vertexai.js";

export interface SearchResult {
  rank: number;
  title: string;
  url: string;
}

/**
 * Remove script/style tags and minimize HTML for token efficiency
 */
function cleanHtml(html: string): string {
  return (
    html
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Remove style tags
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      // Remove comments
      .replace(/<!--[\s\S]*?-->/g, "")
      // Remove SVG
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
      // Remove noscript
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "")
      // Collapse whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Extract search results section from full HTML
 */
function extractSearchSection(html: string): string {
  // Try to extract just the search results container
  const rsoMatch = html.match(/<div id="rso"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i);
  if (rsoMatch) {
    return rsoMatch[0];
  }

  const searchMatch = html.match(/<div id="search"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i);
  if (searchMatch) {
    return searchMatch[0];
  }

  // Fallback: return cleaned full HTML (may hit token limits)
  return html;
}

/**
 * Parse Google search results HTML using Gemini
 */
export async function parseSearchResults(
  html: string,
  limit: number = 10,
): Promise<SearchResult[]> {
  // Clean and extract relevant section
  const cleanedHtml = cleanHtml(html);
  const searchSection = extractSearchSection(cleanedHtml);

  const prompt = `You are a search result parser. Extract the top ${limit} organic search results from the following Google search results HTML.

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

HTML:
${searchSection}`;

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
