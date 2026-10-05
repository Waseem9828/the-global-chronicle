const http = require('http');
const fs = require('fs');
const path = require('path');
const scheduler = require('./agent/scheduler');
const { getAllArticles, insertArticle, getSitemapEntries, getArticleBySlug } = require('./db/database');

const PORT = process.env.PORT || 5050;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function readJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:5050'}`);
  const pathname = parsedUrl.pathname;

  // --- GOOGLE SEO ENDPOINTS ---

  // 1. /sitemap.xml -> Dynamic Google Search Console XML Sitemap
  if (req.method === 'GET' && pathname === '/sitemap.xml') {
    const baseUrl = `http://${req.headers.host || 'localhost:5050'}`;
    const entries = getSitemapEntries();
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;
    
    // Homepage
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>hourly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // Articles
    entries.forEach(item => {
      const date = item.publishedAt ? new Date(item.publishedAt).toISOString() : new Date().toISOString();
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/#${item.slug}</loc>\n`;
      xml += `    <lastmod>${date}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
    return res.end(xml);
  }

  // 2. /robots.txt -> Directs Googlebot & Bingbot to Sitemap
  if (req.method === 'GET' && pathname === '/robots.txt') {
    const baseUrl = `http://${req.headers.host || 'localhost:5050'}`;
    const txt = `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(txt);
  }

  // --- REST API ROUTES ---

  // 3. GET /api/articles -> Fetch from high-performance SQLite
  if (req.method === 'GET' && pathname === '/api/articles') {
    try {
      const articles = getAllArticles();
      return sendJson(res, 200, articles);
    } catch (e) {
      return sendJson(res, 500, { error: 'Database read failed', details: e.message });
    }
  }

  // 4. POST /api/articles -> Publish article
  if (req.method === 'POST' && pathname === '/api/articles') {
    const payload = await readJsonBody(req);
    if (!payload.title || !payload.content) {
      return sendJson(res, 400, { error: 'Missing title or content' });
    }

    try {
      insertArticle(payload);
      return sendJson(res, 201, { success: true, article: payload });
    } catch (e) {
      return sendJson(res, 500, { error: 'Database insert failed', details: e.message });
    }
  }

  // 5. GET /api/agent/status -> Live AI Wire telemetry
  if (req.method === 'GET' && pathname === '/api/agent/status') {
    const status = scheduler.getStatus();
    return sendJson(res, 200, status);
  }

  // 6. POST /api/agent/trigger -> On-demand trending wire scan & publish
  if (req.method === 'POST' && pathname === '/api/agent/trigger') {
    const body = await readJsonBody(req);
    const category = body.category || null;
    const result = await scheduler.runCycle(category);
    return sendJson(res, result.success ? 200 : 500, result);
  }

  // 7. POST /api/agent/config -> Update automation parameters
  if (req.method === 'POST' && pathname === '/api/agent/config') {
    const body = await readJsonBody(req);
    const updatedStatus = scheduler.updateSettings(body);
    return sendJson(res, 200, { success: true, status: updatedStatus });
  }

  // 8. POST /api/agent/reach/url -> Ingest any web URL via Jina Reader (Zero API fee)
  if (req.method === 'POST' && pathname === '/api/agent/reach/url') {
    const body = await readJsonBody(req);
    if (!body.url) return sendJson(res, 400, { error: 'Missing target URL' });

    try {
      const { ingestWebPageToTopic } = require('./agent/omniReach');
      const { writeArticleWithSeo } = require('./agent/articleWriter');
      const topic = await ingestWebPageToTopic(body.url);
      const article = await writeArticleWithSeo(topic, scheduler.config);
      insertArticle(article);
      return sendJson(res, 200, { success: true, article });
    } catch (err) {
      return sendJson(res, 500, { error: 'Failed to ingest URL', details: err.message });
    }
  }

  // 9. POST /api/agent/reach/github -> Sweep GitHub trending repositories (Zero API fee)
  if (req.method === 'POST' && pathname === '/api/agent/reach/github') {
    try {
      const { fetchGitHubTrending } = require('./agent/omniReach');
      const { writeArticleWithSeo } = require('./agent/articleWriter');
      const repos = await fetchGitHubTrending('artificial-intelligence');
      if (repos.length === 0) return sendJson(res, 404, { error: 'No GitHub repos found' });
      const article = await writeArticleWithSeo(repos[0], scheduler.config);
      insertArticle(article);
      return sendJson(res, 200, { success: true, article });
    } catch (err) {
      return sendJson(res, 500, { error: 'GitHub sweep failed', details: err.message });
    }
  }

  // 10. POST /api/agent/reach/reddit -> Sweep Reddit viral discussions (Zero API fee)
  if (req.method === 'POST' && pathname === '/api/agent/reach/reddit') {
    const body = await readJsonBody(req);
    const sub = body.subreddit || 'entertainment';
    try {
      const { fetchRedditViralDiscussions } = require('./agent/omniReach');
      const { writeArticleWithSeo } = require('./agent/articleWriter');
      const discussions = await fetchRedditViralDiscussions(sub);
      if (discussions.length === 0) return sendJson(res, 404, { error: 'No Reddit discussions found' });
      const article = await writeArticleWithSeo(discussions[0], scheduler.config);
      insertArticle(article);
      return sendJson(res, 200, { success: true, article });
    } catch (err) {
      return sendJson(res, 500, { error: 'Reddit sweep failed', details: err.message });
    }
  }

  // --- STATIC FILE SERVING ---
  let reqPath = pathname;
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`500 Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(content);
    }
  });
});

// Start scheduler background loop
scheduler.start();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ THE GLOBAL CHRONICLE server running at:`);
  console.log(`   - http://localhost:${PORT}`);
  console.log(`   - http://127.0.0.1:${PORT}`);
  console.log(`   - XML Sitemap: http://localhost:${PORT}/sitemap.xml`);
  console.log(`   - Robots.txt: http://localhost:${PORT}/robots.txt`);
  console.log(`🤖 AI News Agent active with native SQLite engine.`);
});
