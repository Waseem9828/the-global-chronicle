// Omni-Reach: Multi-Platform Zero-API-Fee Internet Intelligence Layer
// Inspired by Agent-Reach (Twitter/X, Reddit, GitHub, YouTube, Web via Jina Reader)

const { decodeHtml } = require('./newsScraper');

const PLATFORMS = {
  GITHUB: 'github',
  REDDIT: 'reddit',
  JINA_WEB: 'web',
  TWITTER_MIRROR: 'twitter'
};

/**
 * Reads any webpage or article URL via Jina Reader with ZERO API fees
 * Converts complex/gated web pages into clean Markdown
 */
async function fetchViaJinaReader(targetUrl) {
  try {
    const cleanUrl = targetUrl.replace(/^https?:\/\//, '');
    const jinaUrl = `https://r.jina.ai/https://${cleanUrl}`;
    
    const response = await fetch(jinaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ChronicleReach/1.0',
        'Accept': 'text/plain'
      }
    });

    if (!response.ok) {
      throw new Error(`Jina Reader returned status ${response.status}`);
    }

    const markdown = await response.text();
    return markdown;
  } catch (err) {
    console.error(`[OmniReach] Jina Reader error for ${targetUrl}:`, err.message);
    return null;
  }
}

/**
 * Fetches viral GitHub trending repositories (AI, Developer tools, Breakthroughs)
 * Zero API key required (Public GitHub API)
 */
async function fetchGitHubTrending(topic = 'artificial-intelligence') {
  try {
    const query = encodeURIComponent(`stars:>300 topic:${topic} pushed:>2026-08-01`);
    const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=10`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ChronicleAgent-Reach/3.0',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) {
      throw new Error(`GitHub API returned status ${res.status}`);
    }

    const data = await res.json();
    return (data.items || []).map(repo => ({
      title: `${repo.name}: ${repo.description || 'Open-source software breakthrough'}`,
      source: `GitHub (@${repo.owner?.login})`,
      link: repo.html_url,
      stars: repo.stargazers_count,
      category: 'Technology',
      description: `Trending with ${repo.stargazers_count.toLocaleString()} stars on GitHub. License: ${repo.license?.name || 'Open Source'}. Primary language: ${repo.language || 'Code'}.`,
      velocity: 99.4,
      platform: 'GitHub'
    }));
  } catch (err) {
    console.error('[OmniReach] GitHub search error:', err.message);
    return [];
  }
}

/**
 * Searches viral Reddit discussions via public feeds & search proxies
 * Zero API fee
 */
async function fetchRedditViralDiscussions(subreddit = 'entertainment') {
  try {
    // Search top weekly headlines via public RSS endpoints
    const feedUrl = `https://news.google.com/rss/search?q=site:reddit.com/r/${subreddit}+when:7d&hl=en-US&gl=US&ceid=US:en`;
    
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'ChronicleAgent/3.0' }
    });

    if (!res.ok) return [];

    const xml = await res.text();
    const items = [];
    const itemRegex = /<item>(.*?)<\/item>/gs;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
      const block = match[1];
      const titleMatch = block.match(/<title>(.*?)<\/title>/s);
      const linkMatch = block.match(/<link>(.*?)<\/link>/s);

      if (titleMatch && titleMatch[1]) {
        let title = titleMatch[1].replace(/ - reddit/i, '').replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').trim();
        items.push({
          title,
          source: `Reddit (r/${subreddit})`,
          link: linkMatch ? linkMatch[1] : 'https://reddit.com',
          category: subreddit === 'entertainment' ? 'Entertainment' : 'Technology',
          description: `Viral internet discussion trending across r/${subreddit} with intense community debate.`,
          velocity: 97.8,
          platform: 'Reddit'
        });
      }
    }

    return items;
  } catch (err) {
    console.error('[OmniReach] Reddit scan error:', err.message);
    return [];
  }
}

/**
 * Ingests any arbitrary URL from the internet, cleans it via Jina Reader,
 * and formats it for immediate broadsheet editorial writing
 */
async function ingestWebPageToTopic(url) {
  console.log(`[OmniReach] Ingesting external web article: ${url}...`);
  const markdown = await fetchViaJinaReader(url);

  if (!markdown) {
    throw new Error(`Failed to read web page via Jina Reader`);
  }

  // Extract title from first markdown H1 or title line
  let title = "Viral Internet Dispatch";
  const titleMatch = markdown.match(/^#\s+(.+)$/m) || markdown.match(/Title:\s*(.+)$/m);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
  }

  // Snippet from first 400 characters of markdown
  const cleanSnippet = markdown.replace(/^#+.*$/gm, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim().substring(0, 350);

  return {
    title,
    source: "Internet Wire via Agent-Reach",
    link: url,
    category: "World",
    description: cleanSnippet,
    velocity: 99.5,
    platform: "Agent-Reach Web",
    rawMarkdown: markdown
  };
}

module.exports = {
  fetchViaJinaReader,
  fetchGitHubTrending,
  fetchRedditViralDiscussions,
  ingestWebPageToTopic,
  PLATFORMS
};
