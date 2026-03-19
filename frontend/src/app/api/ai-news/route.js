import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ═══════════════════════════════════════════════
// /api/ai-news  —  Live AI news from RSS feeds
// Groq rewrites headlines for non-tech users
// Cache: 12 hours in-memory
// ═══════════════════════════════════════════════

const GROQ_KEY = process.env.GROQ_API_KEY;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

let cache = { data: null, ts: 0 };

// ── RSS sources (free, no API key) ──
const RSS_FEEDS = [
  {
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    source: "TechCrunch",
  },
  {
    url: "https://news.google.com/rss/search?q=generative+AI+tools&hl=en-US&gl=US&ceid=US:en",
    source: "Google News",
  },
  {
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    source: "The Verge",
  },
];

// Category detection from title/description
const CATEGORY_MAP = [
  { keywords: ["video", "sora", "kling", "runway", "luma", "animate"], category: "Video Generation", icon: "Video", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { keywords: ["image", "dall-e", "midjourney", "stable diffusion", "flux", "poster", "art", "photo"], category: "Image Generation", icon: "Image", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  { keywords: ["chatgpt", "gemini", "claude", "chatbot", "assistant", "llm", "gpt", "language model", "openai"], category: "Chatbots & Assistants", icon: "Bot", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { keywords: ["music", "voice", "audio", "speech", "suno", "elevenlabs", "sound"], category: "Voice & Music", icon: "Mic", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  { keywords: ["website", "web", "builder", "code", "coding", "github", "copilot", "cursor", "developer", "programming"], category: "Coding with AI", icon: "Zap", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  { keywords: ["chip", "hardware", "phone", "device", "apple", "google", "samsung", "nvidia", "gpu"], category: "AI Hardware", icon: "Cpu", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  { keywords: ["education", "learn", "student", "tutor", "school", "university"], category: "Education", icon: "Sparkles", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
];

// ── Fallback images per category (curated Unsplash) ──
const CATEGORY_IMAGES = {
  "Video Generation": [
    "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=800&q=80",
  ],
  "Image Generation": [
    "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1561998338-13ad7883b20f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
  ],
  "Chatbots & Assistants": [
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1531746790095-e0905944b8fd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1676299081847-824916de030a?auto=format&fit=crop&w=800&q=80",
  ],
  "Voice & Music": [
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
  ],
  "Coding with AI": [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  ],
  "AI Hardware": [
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1555617981-dac3880eac6e?auto=format&fit=crop&w=800&q=80",
  ],
  "Education": [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c476?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80",
  ],
  "AI News": [
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
  ],
};

function getFallbackImage(category, index) {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES["AI News"];
  return images[index % images.length];
}

function detectCategory(title, desc) {
  const text = `${title} ${desc}`.toLowerCase();
  for (const entry of CATEGORY_MAP) {
    if (entry.keywords.some(k => text.includes(k))) return entry;
  }
  return { category: "AI News", icon: "Sparkles", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" };
}

// ── Minimal XML → articles parser (no npm package needed) ──
function parseRSS(xml, source) {
  const items = [];
  // Match <item> or <entry> blocks
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>|<entry[\s>]([\s\S]*?)<\/entry>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1] || match[2];

    const getTag = (tag) => {
      const r = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
      const m = block.match(r);
      return m ? (m[1] || m[2] || "").trim() : "";
    };

    const title = getTag("title").replace(/<[^>]+>/g, "").trim();
    const description = getTag("description").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
    const link = getTag("link") || "";
    const pubDate = getTag("pubDate") || getTag("published") || getTag("updated") || "";

    // Try to extract image from content or media
    let thumbnail = "";
    const imgMatch = block.match(/<media:content[^>]+url="([^"]+)"/i)
      || block.match(/<enclosure[^>]+url="([^"]+)"/i)
      || block.match(/<img[^>]+src="([^"]+)"/i)
      || block.match(/<media:thumbnail[^>]+url="([^"]+)"/i);
    if (imgMatch) thumbnail = imgMatch[1];

    if (title && title.length > 10) {
      items.push({ title, description: description.slice(0, 300), link, pubDate, thumbnail, source });
    }
  }

  return items.slice(0, 8); // max 8 per feed
}

// ── Groq: rewrite for non-tech users ──
async function enrichWithGroq(articles) {
  if (!GROQ_KEY || articles.length === 0) return articles;

  const articleList = articles
    .slice(0, 12)
    .map((a, i) => `${i + 1}. TITLE: ${a.title}\n   DESC: ${(a.description || a.summary || "No description").slice(0, 150)}`)
    .join("\n");

  const prompt = `You are helping non-technical users understand AI news. For each article below, write:
1. A clear, simple summary (2-3 sentences, no jargon)
2. A "Why It Matters" line explaining why a normal person should care

Articles:
${articleList}

Respond in valid JSON array format:
[{"index":1,"summary":"...","whyItMatters":"..."},...]

Only return the JSON array, nothing else.`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 2000,
      }),
    });

    if (!res.ok) {
      console.error("[AI-News] Groq error:", res.status);
      return articles;
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return articles;

    const enriched = JSON.parse(jsonMatch[0]);

    for (const e of enriched) {
      const idx = (e.index || 0) - 1;
      if (idx >= 0 && idx < articles.length) {
        articles[idx].summary = e.summary || articles[idx].description;
        articles[idx].whyItMatters = e.whyItMatters || "";
      }
    }
  } catch (err) {
    console.error("[AI-News] Groq enrichment failed:", err.message);
  }

  return articles;
}

// ── Fetch all feeds ──
async function fetchAllNews() {
  const feedPromises = RSS_FEEDS.map(async (feed) => {
    try {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "Mozilla/5.0 AI-News-Bot" },
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      });
      if (!res.ok) return [];
      const xml = await res.text();
      return parseRSS(xml, feed.source);
    } catch (err) {
      console.error(`[AI-News] Feed error (${feed.source}):`, err.message);
      return [];
    }
  });

  const results = await Promise.all(feedPromises);
  let allArticles = results.flat();

  // Deduplicate by title similarity
  const seen = new Set();
  allArticles = allArticles.filter(a => {
    const key = a.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by date (newest first)
  allArticles.sort((a, b) => {
    const da = new Date(a.pubDate || 0);
    const db = new Date(b.pubDate || 0);
    return db - da;
  });

  // Take top 15
  allArticles = allArticles.slice(0, 15);

  // Detect categories
  allArticles = allArticles.map((a, i) => {
    const cat = detectCategory(a.title, a.description);
    return {
      id: i + 1,
      title: a.title,
      summary: a.description,
      whyItMatters: "",
      link: a.link,
      source: a.source,
      thumbnail: a.thumbnail || getFallbackImage(cat.category, i),
      date: a.pubDate ? new Date(a.pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
      category: cat.category,
      categoryIcon: cat.icon,
      categoryColor: cat.color,
      trending: i < 3, // top 3 are "trending"
    };
  });

  // Enrich with Groq summaries
  allArticles = await enrichWithGroq(allArticles);

  return allArticles;
}

// ── API route ──
export async function GET() {
  try {
    // Check cache
    if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json({ articles: cache.data, cached: true });
    }

    const articles = await fetchAllNews();
    cache = { data: articles, ts: Date.now() };

    return NextResponse.json({ articles, cached: false });
  } catch (err) {
    console.error("[AI-News] Route error:", err);
    return NextResponse.json({ articles: [], error: err.message }, { status: 500 });
  }
}
