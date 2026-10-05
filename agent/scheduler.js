// Enhanced AI News Agent Scheduler with SQLite & Google SEO Integration
const fs = require('fs');
const path = require('path');
const { discoverTrendingTopic } = require('./newsScraper');
const { writeArticleWithSeo } = require('./articleWriter');
const { insertArticle, getAllArticles, logTelemetry, getRecentLogs } = require('../db/database');

const CONFIG_PATH = path.join(__dirname, '..', 'data', 'agent_config.json');
const JSON_BACKUP_PATH = path.join(__dirname, '..', 'data', 'articles.json');

class NewsAgentScheduler {
  constructor() {
    this.intervalId = null;
    this.isProcessing = false;
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(CONFIG_PATH)) {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      }
    } catch (e) {
      console.error('[Scheduler] Error loading config:', e.message);
    }
    return {
      autoPostEnabled: true,
      intervalHours: 3,
      postsPerDay: 8,
      lastRun: null,
      nextRun: null,
      totalGenerated: 0,
      aiProvider: 'built-in',
      apiKey: '',
      categories: ['Entertainment', 'World', 'Business', 'Technology', 'Science', 'Sports', 'Culture'],
      logs: []
    };
  }

  saveConfig() {
    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(this.config, null, 2), 'utf8');
    } catch (e) {
      console.error('[Scheduler] Error saving config:', e.message);
    }
  }

  log(type, message) {
    console.log(`[AI Wire][${type}] ${message}`);
    logTelemetry(type, message);
    this.config.logs = this.config.logs || [];
    this.config.logs.unshift({
      timestamp: new Date().toISOString(),
      type,
      message
    });
    if (this.config.logs.length > 50) this.config.logs.pop();
    this.saveConfig();
  }

  /**
   * Executes one full discovery, writing, SEO optimization, and publishing cycle
   */
  async runCycle(categoryOverride = null) {
    if (this.isProcessing) {
      this.log('WARNING', 'Cycle currently in progress. Skipping duplicate run.');
      return { success: false, message: 'Cycle already in progress' };
    }

    this.isProcessing = true;
    this.log('INFO', 'Scanning global wire feeds and Google Trends...');

    try {
      // Step 1: Discover high-velocity trending topic
      const topic = await discoverTrendingTopic(categoryOverride);
      if (!topic) {
        this.log('WARNING', 'No new uncurated wire stories found in current sweep.');
        this.isProcessing = false;
        return { success: false, message: 'No new topic found' };
      }

      this.log('DISCOVERY', `Selected Trending Story: "${topic.title}" [${topic.category}] (Velocity: ${topic.velocity}% from ${topic.source})`);

      // Step 2: Write complete article with full Google SEO metadata
      this.log('AI_WRITER', `Drafting complete broadsheet article & Schema.org SEO using ${this.config.aiProvider} engine...`);
      const newArticle = await writeArticleWithSeo(topic, this.config);

      // Step 3: Insert directly into high-performance SQLite database
      insertArticle(newArticle);

      // Mirror to JSON for convenience and backup
      try {
        const all = getAllArticles();
        fs.writeFileSync(JSON_BACKUP_PATH, JSON.stringify(all, null, 2), 'utf8');
      } catch (err) {
        // Backup mirror non-critical
      }

      // Step 4: Update stats
      this.config.totalGenerated = (this.config.totalGenerated || 0) + 1;
      this.config.lastRun = new Date().toISOString();
      this.calculateNextRun();
      this.saveConfig();

      this.log('PUBLISHED', `Printed to Front Page: "${newArticle.title}" (SEO Score: ${newArticle.seo?.score || 95}/100)`);
      this.isProcessing = false;

      return {
        success: true,
        article: newArticle
      };
    } catch (error) {
      this.log('ERROR', `Automated cycle encountered an exception: ${error.message}`);
      this.isProcessing = false;
      return { success: false, error: error.message };
    }
  }

  calculateNextRun() {
    const hours = this.config.intervalHours || 3;
    const next = new Date(Date.now() + hours * 60 * 60 * 1000);
    this.config.nextRun = next.toISOString();
  }

  start() {
    if (!this.config.autoPostEnabled) {
      this.log('SYSTEM', 'Automatic posting is currently disabled in settings.');
      return;
    }

    this.calculateNextRun();
    this.saveConfig();

    const intervalMs = (this.config.intervalHours || 3) * 60 * 60 * 1000;
    this.log('SYSTEM', `Background AI Wire Agent started. Scheduled: every ${this.config.intervalHours} hours.`);

    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      this.runCycle();
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.config.nextRun = null;
    this.saveConfig();
    this.log('SYSTEM', 'Background automation paused.');
  }

  getStatus() {
    return {
      isProcessing: this.isProcessing,
      autoPostEnabled: this.config.autoPostEnabled,
      intervalHours: this.config.intervalHours,
      postsPerDay: this.config.postsPerDay,
      lastRun: this.config.lastRun,
      nextRun: this.config.nextRun,
      totalGenerated: this.config.totalGenerated,
      aiProvider: this.config.aiProvider,
      categories: this.config.categories,
      recentLogs: getRecentLogs(20)
    };
  }

  updateSettings(updates) {
    if (typeof updates.autoPostEnabled === 'boolean') {
      this.config.autoPostEnabled = updates.autoPostEnabled;
    }
    if (updates.intervalHours && Number(updates.intervalHours) > 0) {
      this.config.intervalHours = Number(updates.intervalHours);
    }
    if (updates.aiProvider) {
      this.config.aiProvider = updates.aiProvider;
    }
    if (updates.apiKey !== undefined) {
      this.config.apiKey = updates.apiKey;
    }
    if (Array.isArray(updates.categories)) {
      this.config.categories = updates.categories;
    }

    this.saveConfig();
    this.log('CONFIG', 'Bureau configuration updated.');

    if (this.config.autoPostEnabled) {
      this.start();
    } else {
      this.stop();
    }

    return this.getStatus();
  }
}

const scheduler = new NewsAgentScheduler();
module.exports = scheduler;
