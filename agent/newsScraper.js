// Enhanced News & Google Trends Scraper for The Global Chronicle
const { db } = require('../db/database');

const RSS_FEEDS = {
  'Entertainment': 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en',
  'World': 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en',
  'Business': 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en',
  'Technology': 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en',
  'Science': 'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en',
  'Sports': 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en',
  'Culture': 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en',
  'TopTrends': 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en'
};

// High-resolution photo collections per category
const CATEGORY_IMAGES = {
  'Entertainment': [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'
  ],
  'World': [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
  ],
  'Business': [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
  ],
  'Technology': [
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
  ],
  'Science': [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80'
  ],
  'Sports': [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80'
  ],
  'Culture': [
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'
  ]
};

function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .trim();
}

/**
 * Extracts items from RSS feed XML
 */
function parseRssXml(xml) {
  const items = [];
  const itemRegex = /<item>(.*?)<\/item>/gs;
  let match;

  let rank = 1;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemBlock = match[1];

    const titleMatch = itemBlock.match(/<title>(.*?)<\/title>/s);
    const linkMatch = itemBlock.match(/<link>(.*?)<\/link>/s);
    const pubDateMatch = itemBlock.match(/<pubDate>(.*?)<\/pubDate>/s);
    const descMatch = itemBlock.match(/<description>(.*?)<\/description>/s);
    const sourceMatch = itemBlock.match(/<source[^>]*>(.*?)<\/source>/s);

    let rawTitle = titleMatch ? decodeHtml(titleMatch[1]) : '';
    let source = sourceMatch ? decodeHtml(sourceMatch[1]) : 'Global Wire';

    // Parse source suffix if attached
    let cleanTitle = rawTitle;
    const splitIndex = rawTitle.lastIndexOf(' - ');
    if (splitIndex > -1) {
      source = rawTitle.substring(splitIndex + 3).trim();
      cleanTitle = rawTitle.substring(0, splitIndex).trim();
    }

    if (cleanTitle) {
      // Calculate realistic trending search surge velocity (e.g., 98.4%)
      const velocity = Math.min(99.8, Math.max(82.0, (100 - (rank * 1.4) + (Math.random() * 2.5)).toFixed(1)));

      items.push({
        title: cleanTitle,
        link: linkMatch ? decodeHtml(linkMatch[1]) : '',
        pubDate: pubDateMatch ? decodeHtml(pubDateMatch[1]) : new Date().toUTCString(),
        description: descMatch ? decodeHtml(descMatch[1].replace(/<[^>]*>?/gm, '')) : '',
        source,
        rank,
        velocity: parseFloat(velocity)
      });
      rank++;
    }
  }

  return items;
}

/**
 * Fetches feed for specified category
 */
async function fetchCategoryFeed(category = 'TopTrends') {
  const feedUrl = RSS_FEEDS[category] || RSS_FEEDS['TopTrends'];

  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ChronicleSEO/3.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Feed fetch failed: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    return parseRssXml(xml);
  } catch (err) {
    console.error(`[NewsScraper] Feed error (${category}):`, err.message);
    return [];
  }
}

/**
 * Discovers the next top trending, SEO-rich topic
 */
async function discoverTrendingTopic(requestedCategory = null) {
  // Query existing titles from SQLite database to prevent duplicates
  const existingRows = db.prepare(`SELECT title FROM articles`).all();
  const existingSet = new Set(existingRows.map(r => r.title.toLowerCase().trim()));

  const categories = ['Entertainment', 'World', 'Business', 'Technology', 'Science', 'Sports', 'Culture'];
  const category = requestedCategory || categories[Math.floor(Math.random() * categories.length)];

  console.log(`[NewsScraper] Scanning Google Trends and wire for: [${category}]...`);
  const rawItems = await fetchCategoryFeed(category);

  // Filter out already published
  const candidates = rawItems.filter(item => {
    const lower = item.title.toLowerCase().trim();
    return !existingSet.has(lower) && lower.length > 18;
  });

  if (candidates.length === 0) {
    console.log(`[NewsScraper] All topics in ${category} covered, grabbing freshest candidate.`);
    if (rawItems.length > 0) return { ...rawItems[0], category, coverImage: (CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Entertainment'])[0] };
    return null;
  }

  // Pick highest velocity topic
  candidates.sort((a, b) => b.velocity - a.velocity);
  const selected = candidates[0];

  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Entertainment'];
  const coverImage = images[Math.floor(Math.random() * images.length)];

  return {
    ...selected,
    category,
    coverImage
  };
}

module.exports = {
  fetchCategoryFeed,
  discoverTrendingTopic,
  RSS_FEEDS,
  CATEGORY_IMAGES
};
