# 📰 THE GLOBAL CHRONICLE — Broadsheet Newspaper & Omni-Reach AI Wire

An authentic, vintage & modern broadsheet newspaper powered by an autonomous **Omni-Reach AI News Agent** (inspired by [`Panniantong/Agent-Reach`](https://github.com/Panniantong/Agent-Reach)). Scans live global wires, Google Trends, GitHub trending releases, Reddit viral discussions, and any arbitrary web URL with **zero API fees**, saving to an embedded native SQLite database.

---

## 👁️ Agent-Reach Multi-Platform Intelligence (Zero API Fees)

Inspired by **Agent-Reach**, your AI Agent is equipped with eyes across the entire internet:

| Channel | Method | Cost | Capability |
| :--- | :--- | :--- | :--- |
| **🐙 GitHub Trending** | Public GitHub API | **$0** | Tracks viral open-source AI models & repositories with live star metrics. |
| **📱 Reddit Viral Wire** | Public RSS & Search Proxies | **$0** | Discovers trending discussions in `/r/entertainment`, `/r/news`, `/r/technology`. |
| **🔗 Any Web URL** | Jina Reader Integration | **$0** | Paste **ANY** article, paywalled link, or blog post; the agent ingests clean markdown and writes a broadsheet column. |
| **🌍 Google Trends Wire** | Real-time Search RSS | **$0** | Continuously calculates a Trending Velocity Index (85%–99%) for breaking news. |

---

## 🎯 Google SEO Architecture

- **XML Sitemap:** Live dynamic [`http://localhost:5050/sitemap.xml`](http://localhost:5050/sitemap.xml) for Google Search Console.
- **Robots.txt:** Standard [`http://localhost:5050/robots.txt`](http://localhost:5050/robots.txt) guiding web crawlers.
- **Schema.org Structured Data:** Every dispatch embeds official `NewsArticle` JSON-LD schema for Google Top Stories eligibility.
- **On-Page Optimization:** High-CTR SERP titles, meta descriptions, and Google Featured Snippet key takeaways boxes.
- **Audited SEO Scores:** Real-time on-page SEO scores (92–98/100).

---

## 🗄️ Native SQLite Database

- Embedded in [`data/chronicle.db`](data/chronicle.db) using Node.js native `node:sqlite`.
- Fast indexed queries by category, slug, and publication date.
- Zero npm installs, zero database server configuration needed.

---

## 🚀 How to Run

### 1-Click Launch:
Double-click [`start.bat`](start.bat) in the project folder.

### Command Line:
```powershell
node server.js
```
Then visit: **`http://localhost:5050`** (or `http://127.0.0.1:5050`).
