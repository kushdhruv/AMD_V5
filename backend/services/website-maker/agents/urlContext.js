
/**
 * URL Context Fetcher: Extracts content from user-provided URLs
 * for use as context in website generation.
 */

/**
 * Fetch and parse content from URLs.
 * @param {string[]} urls - Array of URLs to fetch
 * @returns {string} Combined extracted text
 */
export async function fetchURLContext(urls) {
  if (!urls || urls.length === 0) return "";

  const results = [];

  for (const url of urls.slice(0, 3)) { // Max 3 URLs
    try {
      const text = await fetchSingleURL(url);
      if (text) {
        results.push(`--- Content from: ${url} ---\n${text.slice(0, 2000)}\n---`);
      }
    } catch (err) {
      console.warn(`Failed to fetch URL ${url}:`, err.message);
      results.push(`--- Failed to fetch: ${url} (${err.message}) ---`);
    }
  }

  return results.join("\n\n");
}

async function fetchSingleURL(url) {
  try {
    // Validate URL
    new URL(url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WebsiteBuilderBot/1.0)",
        Accept: "text/html,text/plain,application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    if (contentType.includes("application/json")) {
      // JSON response — stringify nicely
      try {
        const json = JSON.parse(text);
        return JSON.stringify(json, null, 2).slice(0, 3000);
      } catch {
        return text.slice(0, 3000);
      }
    }

    // HTML — strip tags and extract text
    return stripHTML(text).slice(0, 3000);
  } catch (err) {
    throw err;
  }
}

/**
 * Simple HTML tag stripper — extracts meaningful text content.
 */
function stripHTML(html) {
  return html
    // Remove script and style blocks
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    // Remove HTML tags
    .replace(/<[^>]+>/g, " ")
    // Decode common HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Clean up whitespace
    .replace(/\s+/g, " ")
    .trim();
}
