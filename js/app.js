// The Global Chronicle — Broadsheet Newspaper Application Logic & AI Agent Controller

const STORAGE_BOOKMARKS_KEY = 'chronicle_bookmarks_v1';
const STORAGE_THEME_KEY = 'chronicle_theme_v1';

class NewsApp {
  constructor() {
    this.articles = [];
    this.bookmarks = this.loadBookmarks();
    this.activeCategory = 'All';
    this.searchQuery = '';
    this.currentArticleId = null;
    this.speechUtterance = null;
    this.isSpeaking = false;
    this.weatherIndex = 0;
    this.agentStatus = null;

    this.init();
  }

  loadBookmarks() {
    const saved = localStorage.getItem(STORAGE_BOOKMARKS_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  saveBookmarks() {
    localStorage.setItem(STORAGE_BOOKMARKS_KEY, JSON.stringify(this.bookmarks));
    this.updateBookmarkBadge();
    this.renderBookmarksList();
  }

  async init() {
    this.initTheme();
    this.initDateAndClock();
    this.initMarketTicker();
    this.initWeatherWidget();
    this.initCategoryNav();
    this.initSearch();
    this.initModalListeners();
    this.initPublishModal();
    this.initBookmarkDrawer();
    this.initAgentModal();

    await this.fetchArticles();
    await this.fetchAgentStatus();

    this.updateBookmarkBadge();
    this.checkUrlHash();

    // Auto-refresh every 25 seconds
    setInterval(() => {
      this.fetchArticles(false);
      this.fetchAgentStatus();
    }, 25000);

    window.addEventListener('hashchange', () => this.checkUrlHash());
  }

  // Fetch articles from REST API (with fallback to INITIAL_ARTICLES)
  async fetchArticles(showLoader = true) {
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        this.articles = await res.json();
        this.renderNewsFeed();
        return;
      }
    } catch (e) {
      console.warn("Backend API not reachable, falling back to local dataset:", e.message);
    }

    if (typeof INITIAL_ARTICLES !== 'undefined') {
      this.articles = [...INITIAL_ARTICLES];
      this.renderNewsFeed();
    }
  }

  // Fetch AI Agent Status
  async fetchAgentStatus() {
    try {
      const res = await fetch('/api/agent/status');
      if (res.ok) {
        this.agentStatus = await res.json();
        this.updateAgentHeaderBadge();
        this.renderAgentModalData();
      }
    } catch (e) {
      // Standalone mode
    }
  }

  // Update Header Badge
  updateAgentHeaderBadge() {
    const badge = document.getElementById('agent-header-chip');
    if (!badge || !this.agentStatus) return;

    const count = this.agentStatus.totalGenerated || 0;
    const isProcessing = this.agentStatus.isProcessing;

    if (isProcessing) {
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-[#8a151b] animate-ping mr-1"></span>
        <span class="text-[#8a151b] font-bold">TELETYPE PRINTING...</span>
      `;
    } else {
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-600 mr-1"></span>
        <span>AI DESK: <strong class="text-[#121212]">${count} Printed</strong></span>
      `;
    }
  }

  // Dark / Light Theme
  initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const savedTheme = localStorage.getItem(STORAGE_THEME_KEY) || 'light';
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
          document.documentElement.classList.remove('dark');
          localStorage.setItem(STORAGE_THEME_KEY, 'light');
        } else {
          document.documentElement.classList.add('dark');
          localStorage.setItem(STORAGE_THEME_KEY, 'dark');
        }
      });
    }
  }

  // Date & Header Clock
  initDateAndClock() {
    const clockEl = document.getElementById('header-live-clock');
    const broadsheetDateEl = document.getElementById('broadsheet-date');

    const updateTime = () => {
      const now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      if (broadsheetDateEl) {
        broadsheetDateEl.textContent = now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }).toUpperCase();
      }
    };

    updateTime();
    setInterval(updateTime, 1000);
  }

  // Market Ticker
  initMarketTicker() {
    const tickerContainer = document.getElementById('market-ticker-content');
    if (!tickerContainer) return;

    const renderTickerItems = () => {
      const itemsHtml = MARKET_DATA.map(item => `
        <div class="inline-flex items-center space-x-2 mr-8 text-xs font-mono-code">
          <span class="font-bold text-slate-300">${item.symbol}</span>
          <span class="text-white">${item.value}</span>
          <span class="${item.positive ? 'text-emerald-400' : 'text-rose-400'} text-[11px] font-semibold">
            ${item.change}
          </span>
        </div>
      `).join('');
      tickerContainer.innerHTML = itemsHtml + itemsHtml;
    };

    renderTickerItems();

    setInterval(() => {
      MARKET_DATA.forEach(item => {
        if (Math.random() > 0.6) {
          const delta = (Math.random() * 0.1 - 0.04).toFixed(2);
          const currentChange = parseFloat(item.change);
          const newChange = (currentChange + parseFloat(delta)).toFixed(2);
          item.change = (newChange > 0 ? '+' : '') + newChange + '%';
          item.positive = newChange >= 0;
        }
      });
      renderTickerItems();
    }, 4000);
  }

  // Weather Widget
  initWeatherWidget() {
    const weatherContainer = document.getElementById('weather-widget');
    if (!weatherContainer) return;

    const renderWeather = () => {
      const current = WEATHER_DATA[this.weatherIndex];
      weatherContainer.innerHTML = `
        <div class="flex items-center space-x-2 cursor-pointer hover:text-[#8a151b] transition" title="Click to cycle world cities">
          <span>${current.icon}</span>
          <span class="font-bold text-[#121212]">${current.city}:</span>
          <span class="font-mono-code font-bold">${current.temp}</span>
          <span class="text-[11px] text-[#5a554a] hidden sm:inline">(${current.condition})</span>
        </div>
      `;
    };

    renderWeather();

    weatherContainer.addEventListener('click', () => {
      this.weatherIndex = (this.weatherIndex + 1) % WEATHER_DATA.length;
      renderWeather();
    });

    setInterval(() => {
      this.weatherIndex = (this.weatherIndex + 1) % WEATHER_DATA.length;
      renderWeather();
    }, 8000);
  }

  // Category Navigation
  initCategoryNav() {
    const catContainer = document.getElementById('category-pills');
    if (!catContainer) return;

    const categories = ['All', 'Entertainment', 'World', 'Business', 'Technology', 'Science', 'Sports', 'Culture'];

    catContainer.innerHTML = categories.map(cat => `
      <button data-category="${cat}" class="cat-pill whitespace-nowrap px-3 py-1 font-headline font-bold text-xs uppercase tracking-wider transition ${
        cat === this.activeCategory 
          ? 'bg-[#121212] text-white' 
          : 'text-[#5a554a] hover:text-[#121212] hover:bg-[#dcd7ca]/40'
      }">
        ${cat === 'All' ? 'Front Page' : cat}
      </button>
    `).join('');

    catContainer.addEventListener('click', (e) => {
      const target = e.target.closest('.cat-pill');
      if (target) {
        this.activeCategory = target.dataset.category;
        
        catContainer.querySelectorAll('.cat-pill').forEach(btn => {
          if (btn.dataset.category === this.activeCategory) {
            btn.className = 'cat-pill whitespace-nowrap px-3 py-1 font-headline font-bold text-xs uppercase tracking-wider transition bg-[#121212] text-white';
          } else {
            btn.className = 'cat-pill whitespace-nowrap px-3 py-1 font-headline font-bold text-xs uppercase tracking-wider transition text-[#5a554a] hover:text-[#121212] hover:bg-[#dcd7ca]/40';
          }
        });

        this.renderNewsFeed();
      }
    });
  }

  // Search
  initSearch() {
    const searchInput = document.getElementById('global-search-input');
    const searchClear = document.getElementById('search-clear-btn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        if (searchClear) {
          searchClear.classList.toggle('hidden', this.searchQuery.length === 0);
        }
        this.renderNewsFeed();
      });
    }

    if (searchClear && searchInput) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        this.searchQuery = '';
        searchClear.classList.add('hidden');
        this.renderNewsFeed();
        searchInput.focus();
      });
    }
  }

  getFilteredArticles() {
    return this.articles.filter(article => {
      const matchesCategory = this.activeCategory === 'All' || article.category.toLowerCase() === this.activeCategory.toLowerCase();
      const matchesSearch = !this.searchQuery || 
        article.title.toLowerCase().includes(this.searchQuery) ||
        (article.summary && article.summary.toLowerCase().includes(this.searchQuery)) ||
        (article.tags && article.tags.some(t => t.toLowerCase().includes(this.searchQuery))) ||
        (article.author && article.author.name.toLowerCase().includes(this.searchQuery));

      return matchesCategory && matchesSearch;
    });
  }

  // Render Full News Feed
  renderNewsFeed() {
    const filtered = this.getFilteredArticles();
    const heroContainer = document.getElementById('hero-lead-section');
    const gridContainer = document.getElementById('articles-grid');
    const trendingContainer = document.getElementById('trending-sidebar');
    const resultsCountEl = document.getElementById('results-count');

    if (resultsCountEl) {
      resultsCountEl.textContent = `${filtered.length} Dispatches in Edition`;
    }

    if (filtered.length === 0) {
      if (heroContainer) heroContainer.innerHTML = '';
      if (gridContainer) {
        gridContainer.innerHTML = `
          <div class="col-span-full py-12 text-center border border-[#dcd7ca] bg-white p-8">
            <h3 class="font-headline font-bold text-xl text-[#121212] mb-2">No Reports Filed In This Section</h3>
            <p class="text-[#5a554a] text-sm max-w-md mx-auto mb-4">No stories currently matched "${this.searchQuery || this.activeCategory}". Trigger the AI teletype to scour global feeds.</p>
            <button onclick="newsApp.openAgentModal()" class="px-4 py-2 bg-[#8a151b] text-white font-mono-code font-bold text-xs uppercase tracking-wider">
              ⚡ Sweep Global Wire
            </button>
          </div>
        `;
      }
      return;
    }

    // Lead Hero Story
    const isDefaultView = this.activeCategory === 'All' && !this.searchQuery;
    let heroArticle = isDefaultView ? (filtered.find(a => a.leadHero) || filtered[0]) : null;
    let secondaryArticles = filtered.filter(a => a !== heroArticle);

    if (heroContainer) {
      if (heroArticle) {
        heroContainer.classList.remove('hidden');
        heroContainer.innerHTML = this.createHeroMarkup(heroArticle);
      } else {
        heroContainer.classList.add('hidden');
      }
    }

    // Grid Articles
    if (gridContainer) {
      gridContainer.innerHTML = secondaryArticles.map(art => this.createCardMarkup(art)).join('');
    }

    // Trending Sidebar
    if (trendingContainer) {
      const trendingArticles = [...this.articles]
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 5);

      trendingContainer.innerHTML = trendingArticles.map((art, idx) => `
        <div class="group cursor-pointer border-b border-[#dcd7ca] pb-3 last:border-b-0 hover:bg-[#f1ede2]/60 p-1.5 transition" onclick="newsApp.openArticle('${art.id}')">
          <div class="flex items-start space-x-3">
            <span class="font-headline font-bold text-2xl text-[#8a151b] leading-none">
              ${idx + 1}.
            </span>
            <div class="flex-1">
              <span class="text-[10px] font-mono-code uppercase font-bold text-[#8a151b] tracking-wider">
                ${art.category} ${art.autoGenerated ? '• AI WIRE' : ''}
              </span>
              <h4 class="font-headline font-bold text-sm text-[#121212] group-hover:text-[#8a151b] transition line-clamp-2 mt-0.5">
                ${art.title}
              </h4>
              <p class="text-[11px] text-[#5a554a] font-mono-code mt-1">
                ${art.readTime || '4 min'} read • ${(art.likes || 0).toLocaleString()} readers
              </p>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  // Broadsheet Hero Article Markup
  createHeroMarkup(art) {
    const isBookmarked = this.bookmarks.includes(art.id);
    return `
      <article class="bg-white border-2 border-[#121212] p-6 sm:p-8 shadow-sm">
        
        <!-- Top Section Header -->
        <div class="flex flex-wrap items-center justify-between border-b border-[#dcd7ca] pb-2 mb-4 text-xs font-mono-code gap-2">
          <div class="flex items-center space-x-2">
            <span class="bg-[#8a151b] text-white px-2 py-0.5 font-bold uppercase text-[10px] tracking-wider">
              LEAD STORY
            </span>
            <span class="font-bold text-[#121212] uppercase tracking-wider">${art.category}</span>
            ${art.autoGenerated ? '<span class="text-[10px] text-[#8a151b] font-bold border border-[#8a151b] px-1.5 rounded-xs">⚡ AI WIRE</span>' : ''}
            <span class="text-[10px] bg-emerald-800 text-white font-bold px-1.5 py-0.5 rounded-xs">📈 ${art.trendingVelocity || 98.4}% VELOCITY</span>
            <span class="text-[10px] bg-[#121212] text-white font-bold px-1.5 py-0.5 rounded-xs">SEO: ${art.seo?.score || 96}/100</span>
          </div>
          <div class="text-[#5a554a]">
            <span>${new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>• ${art.readTime || '5 min read'}</span>
          </div>
        </div>

        <!-- Big Headline -->
        <h1 class="font-headline text-3xl sm:text-5xl lg:text-6xl font-black text-[#121212] leading-[1.08] tracking-tight hover:text-[#8a151b] transition cursor-pointer mb-4" onclick="newsApp.openArticle('${art.id}')">
          ${art.title}
        </h1>

        <!-- Byline -->
        <p class="font-headline italic text-sm text-[#5a554a] mb-6 pb-3 border-b border-[#121212]">
          By <strong class="not-italic text-[#121212] uppercase tracking-wider">${art.author.name}</strong>, ${art.author.role}
        </p>

        <!-- Two-Column Newspaper Split -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Column 1: Lead Excerpt & Drop Cap (5 cols) -->
          <div class="lg:col-span-5 space-y-4">
            <p class="drop-cap font-body text-lg leading-relaxed text-[#121212] text-justify">
              ${art.summary}
            </p>
            <p class="font-body text-base text-[#383838] leading-relaxed">
              Dispatches received through sovereign delegations and independent wire observers emphasize the compounding long-term ramifications of today's disclosure.
            </p>
            
            <div class="pt-4 flex items-center space-x-3">
              <button 
                onclick="newsApp.openArticle('${art.id}')"
                class="px-5 py-2 bg-[#121212] hover:bg-[#8a151b] text-white font-mono-code font-bold text-xs uppercase tracking-wider transition"
              >
                Read Full Dispatch →
              </button>
              <button 
                onclick="event.stopPropagation(); newsApp.toggleBookmark('${art.id}')"
                class="p-2 border border-[#dcd7ca] bg-[#f8f6f0] hover:bg-white text-[#121212] transition"
                title="${isBookmarked ? 'Remove Bookmark' : 'Save Story'}"
              >
                <svg class="w-4 h-4" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
              </button>
            </div>
          </div>

          <!-- Column 2: Large Photograph with Caption (7 cols) -->
          <div class="lg:col-span-7 cursor-pointer" onclick="newsApp.openArticle('${art.id}')">
            <div class="border border-[#121212] p-1 bg-white">
              <img 
                src="${art.coverImage}" 
                alt="${art.title}" 
                class="w-full h-80 sm:h-96 object-cover media-card-img"
                loading="lazy"
              />
            </div>
            <p class="text-[11px] font-mono-code text-[#5a554a] mt-2 italic border-l-2 border-[#8a151b] pl-2">
              ${art.coverCaption || 'Photographed for The Global Chronicle by international staff correspondents.'}
            </p>
          </div>

        </div>

      </article>
    `;
  }

  // Newspaper Card Markup
  createCardMarkup(art) {
    const isBookmarked = this.bookmarks.includes(art.id);
    return `
      <article class="bg-white border border-[#dcd7ca] hover:border-[#121212] p-4 flex flex-col justify-between transition group shadow-xs">
        <div>
          <!-- Photograph -->
          <div class="relative overflow-hidden aspect-[16/10] cursor-pointer mb-3 border border-[#dcd7ca]" onclick="newsApp.openArticle('${art.id}')">
            <img 
              src="${art.coverImage}" 
              alt="${art.title}" 
              class="w-full h-full object-cover media-card-img"
              loading="lazy"
            />
            <span class="absolute top-2 left-2 bg-[#121212] text-white px-2 py-0.5 text-[9px] font-mono-code uppercase font-bold tracking-wider">
              ${art.category}
            </span>
            ${art.trendingVelocity ? `<span class="absolute top-2 right-2 bg-emerald-800 text-white px-1.5 py-0.5 text-[9px] font-mono-code font-bold shadow">📈 ${art.trendingVelocity}%</span>` : ''}
          </div>

          <!-- Section & Date -->
          <div class="flex items-center justify-between text-[11px] font-mono-code text-[#5a554a] mb-1.5">
            <span>${new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <span>⏱️ ${art.readTime || '4 min'}</span>
          </div>

          <!-- Headline -->
          <h3 class="font-headline font-bold text-lg sm:text-xl text-[#121212] group-hover:text-[#8a151b] transition leading-snug cursor-pointer line-clamp-3 mb-2" onclick="newsApp.openArticle('${art.id}')">
            ${art.title}
          </h3>

          <!-- Excerpt -->
          <p class="font-body text-xs text-[#5a554a] leading-relaxed line-clamp-3 mb-3">
            ${art.summary}
          </p>
        </div>

        <!-- Footer -->
        <div class="pt-2 border-t border-[#dcd7ca] flex items-center justify-between text-xs font-mono-code">
          <span class="italic text-[#121212] font-headline text-[13px] truncate max-w-[140px]">
            By ${art.author.name}
          </span>

          <div class="flex items-center space-x-2">
            <button 
              onclick="event.stopPropagation(); newsApp.toggleBookmark('${art.id}')"
              class="text-[#5a554a] hover:text-[#8a151b]"
              title="Bookmark"
            >
              <svg class="w-4 h-4" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
            </button>
            <button 
              onclick="newsApp.openArticle('${art.id}')"
              class="text-[#8a151b] font-bold hover:underline"
            >
              Read →
            </button>
          </div>
        </div>
      </article>
    `;
  }

  // Check URL Hash
  checkUrlHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash.startsWith('art-')) {
      this.openArticle(hash);
    }
  }

  // Open Broadsheet Article Reader Modal
  openArticle(articleId) {
    const article = this.articles.find(a => a.id === articleId);
    if (!article) return;

    this.currentArticleId = articleId;
    window.location.hash = articleId;

    const modal = document.getElementById('article-reader-modal');
    const container = document.getElementById('article-modal-content');
    if (!modal || !container) return;

    const isBookmarked = this.bookmarks.includes(article.id);

    container.innerHTML = `
      <!-- Modal Top Ribbon -->
      <div class="border-b-2 border-[#121212] bg-[#f1ede2] px-6 py-2.5 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <span class="font-masthead font-bold text-sm tracking-wider text-[#121212]">THE GLOBAL CHRONICLE</span>
          <span class="text-[#5a554a]">•</span>
          <span class="text-xs font-mono-code font-bold uppercase text-[#8a151b]">${article.category} DISPATCH</span>
        </div>

        <div class="flex items-center space-x-2">
          <!-- Voice Narration -->
          <button id="tts-btn" class="px-2.5 py-1 bg-white border border-[#dcd7ca] hover:border-[#121212] text-xs font-mono-code font-bold flex items-center space-x-1 transition">
            <span>🎙️</span>
            <span id="tts-label">Listen</span>
          </button>

          <!-- Bookmark -->
          <button id="modal-bookmark-btn" class="p-1 border border-[#dcd7ca] bg-white">
            <svg class="w-4 h-4 text-[#8a151b]" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
          </button>

          <!-- Share -->
          <button id="modal-share-btn" class="p-1 border border-[#dcd7ca] bg-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
          </button>

          <!-- Close -->
          <button id="modal-close-btn" class="p-1 bg-[#121212] text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>

      <!-- Article Scrollable Body -->
      <div id="modal-scroll-pane" class="overflow-y-auto max-h-[85vh] p-6 sm:p-10 space-y-6">
        
        <!-- Header -->
        <div class="border-b border-[#121212] pb-4">
          <h1 class="font-headline font-black text-3xl sm:text-5xl text-[#121212] leading-[1.1] mb-4">
            ${article.title}
          </h1>

          <p class="font-body italic text-lg sm:text-xl text-[#383838] leading-relaxed mb-4">
            ${article.summary}
          </p>

          <div class="flex items-center justify-between text-xs font-mono-code text-[#5a554a] pt-3 border-t border-[#dcd7ca]">
            <p>
              By <strong class="font-headline not-italic text-sm text-[#121212] uppercase">${article.author.name}</strong>, ${article.author.role}
            </p>
            <p>
              Filed ${new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <!-- Photograph -->
        <div class="border border-[#121212] p-1 bg-white">
          <img src="${article.coverImage}" alt="${article.title}" class="w-full max-h-[460px] object-cover" />
          ${article.coverCaption ? `<p class="p-2 text-xs font-mono-code text-[#5a554a] border-t border-[#dcd7ca] italic">${article.coverCaption}</p>` : ''}
        </div>

        <!-- Article Prose Body -->
        <div class="article-prose font-body text-[#121212] text-lg leading-relaxed space-y-6">
          ${article.content}
        </div>

        <!-- Tags -->
        <div class="pt-4 border-t border-[#dcd7ca] flex flex-wrap gap-2 text-xs font-mono-code">
          <span class="font-bold text-[#121212]">ARCHIVE INDEX:</span>
          ${(article.tags || []).map(t => `<span class="bg-[#f1ede2] px-2 py-0.5 border border-[#dcd7ca]">#${t}</span>`).join('')}
        </div>

        <!-- Readers Claps & Likes -->
        <div class="p-4 bg-[#f1ede2] border border-[#dcd7ca] flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <button id="modal-clap-btn" class="px-3 py-1 bg-white border border-[#121212] font-mono-code text-xs font-bold hover:bg-[#8a151b] hover:text-white transition">
              👏 <span id="modal-clap-count">${article.claps || 0} Claps</span>
            </button>
            <button id="modal-like-btn" class="px-3 py-1 bg-white border border-[#121212] font-mono-code text-xs font-bold hover:bg-[#8a151b] hover:text-white transition">
              ❤️ <span id="modal-like-count">${article.likes || 0} Likes</span>
            </button>
          </div>
          <span class="text-xs font-mono-code text-[#5a554a]">Teletype Wire Edition</span>
        </div>

        <!-- Reader Letters & Comments -->
        <div class="pt-6 border-t border-[#121212]">
          <h3 class="font-headline font-bold text-xl text-[#121212] mb-4">Letters to the Editor (${article.commentsCount || 0})</h3>
          
          <form id="comment-form" class="mb-6 flex gap-2">
            <input 
              id="comment-input" 
              type="text" 
              placeholder="Submit an editorial response or letter..." 
              class="flex-1 bg-white border border-[#dcd7ca] px-3 py-2 text-xs text-[#121212] font-mono-code focus:outline-none focus:border-[#8a151b]"
              required
            />
            <button type="submit" class="px-4 py-2 bg-[#121212] hover:bg-[#8a151b] text-white font-mono-code text-xs font-bold uppercase tracking-wider">
              Submit Letter
            </button>
          </form>

          <div id="comments-list" class="space-y-3 font-body text-sm">
            <div class="p-3 bg-white border border-[#dcd7ca]">
              <div class="flex justify-between text-xs font-mono-code text-[#5a554a] mb-1">
                <span class="font-bold text-[#121212]">CORRESPONDENT IN GENEVA</span>
                <span>Earlier today</span>
              </div>
              <p class="text-[#383838]">A remarkably balanced overview of this development. Sovereign delegates are already convening emergency bilateral panels.</p>
            </div>
          </div>
        </div>

      </div>
    `;

    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');

    this.attachModalActionListeners(article);
  }

  // Attach Modal Actions
  attachModalActionListeners(article) {
    const modal = document.getElementById('article-reader-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const clapBtn = document.getElementById('modal-clap-btn');
    const likeBtn = document.getElementById('modal-like-btn');
    const shareBtn = document.getElementById('modal-share-btn');
    const bookmarkBtn = document.getElementById('modal-bookmark-btn');
    const ttsBtn = document.getElementById('tts-btn');
    const ttsLabel = document.getElementById('tts-label');
    const commentForm = document.getElementById('comment-form');
    const commentsList = document.getElementById('comments-list');

    const closeModal = () => {
      this.stopTTS();
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      window.location.hash = '';
      this.currentArticleId = null;
    };

    if (closeBtn) closeBtn.onclick = closeModal;

    if (clapBtn) {
      clapBtn.onclick = () => {
        article.claps = (article.claps || 0) + 1;
        document.getElementById('modal-clap-count').textContent = `${article.claps} Claps`;
        this.renderNewsFeed();
      };
    }

    if (likeBtn) {
      likeBtn.onclick = () => {
        article.likes = (article.likes || 0) + 1;
        document.getElementById('modal-like-count').textContent = `${article.likes} Likes`;
        this.renderNewsFeed();
      };
    }

    if (shareBtn) {
      shareBtn.onclick = () => {
        navigator.clipboard.writeText(window.location.href);
        this.showToast("Story archive link copied to clipboard!");
      };
    }

    if (bookmarkBtn) {
      bookmarkBtn.onclick = () => {
        this.toggleBookmark(article.id);
        const isBookmarked = this.bookmarks.includes(article.id);
        bookmarkBtn.querySelector('svg').setAttribute('fill', isBookmarked ? 'currentColor' : 'none');
      };
    }

    if (ttsBtn) {
      ttsBtn.onclick = () => {
        if (this.isSpeaking) {
          this.stopTTS();
          ttsLabel.textContent = "Listen";
        } else {
          this.speakArticle(article);
          ttsLabel.textContent = "Stop Audio";
        }
      };
    }

    if (commentForm && commentsList) {
      commentForm.onsubmit = (e) => {
        e.preventDefault();
        const input = document.getElementById('comment-input');
        const text = input.value.trim();
        if (!text) return;

        const newCommentHtml = `
          <div class="p-3 bg-white border border-[#8a151b]">
            <div class="flex justify-between text-xs font-mono-code text-[#5a554a] mb-1">
              <span class="font-bold text-[#8a151b]">READER IN QUORUM</span>
              <span>Just now</span>
            </div>
            <p class="text-[#121212]">${text}</p>
          </div>
        `;
        commentsList.insertAdjacentHTML('afterbegin', newCommentHtml);
        input.value = '';
        article.commentsCount = (article.commentsCount || 0) + 1;
      };
    }
  }

  speakArticle(article) {
    if (!('speechSynthesis' in window)) {
      this.showToast("Speech synthesis not supported on this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `${article.title}. ${article.summary}. ${article.content}`;
    const cleanText = tempDiv.textContent || tempDiv.innerText || '';

    this.speechUtterance = new SpeechSynthesisUtterance(cleanText);
    this.speechUtterance.rate = 1.0;
    this.speechUtterance.pitch = 1.0;

    this.speechUtterance.onend = () => {
      this.isSpeaking = false;
      const ttsLabel = document.getElementById('tts-label');
      if (ttsLabel) ttsLabel.textContent = "Listen";
    };

    window.speechSynthesis.speak(this.speechUtterance);
    this.isSpeaking = true;
  }

  stopTTS() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }

  toggleBookmark(articleId) {
    const idx = this.bookmarks.indexOf(articleId);
    if (idx > -1) {
      this.bookmarks.splice(idx, 1);
      this.showToast("Removed from reading archive");
    } else {
      this.bookmarks.push(articleId);
      this.showToast("Saved to reading archive!");
    }
    this.saveBookmarks();
    this.renderNewsFeed();
  }

  updateBookmarkBadge() {
    const badge = document.getElementById('bookmark-count-badge');
    if (badge) {
      badge.textContent = this.bookmarks.length;
      badge.classList.toggle('hidden', this.bookmarks.length === 0);
    }
  }

  initBookmarkDrawer() {
    const openBtn = document.getElementById('open-bookmarks-btn');
    const closeBtn = document.getElementById('close-bookmarks-btn');
    const drawer = document.getElementById('bookmarks-drawer');
    const backdrop = document.getElementById('bookmarks-backdrop');

    if (openBtn && drawer && backdrop) {
      openBtn.addEventListener('click', () => {
        this.renderBookmarksList();
        drawer.classList.remove('translate-x-full');
        backdrop.classList.remove('hidden');
      });
    }

    const closeDrawer = () => {
      if (drawer) drawer.classList.add('translate-x-full');
      if (backdrop) backdrop.classList.add('hidden');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
  }

  renderBookmarksList() {
    const container = document.getElementById('bookmarks-list-container');
    if (!container) return;

    const bookmarkedArticles = this.articles.filter(a => this.bookmarks.includes(a.id));

    if (bookmarkedArticles.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center text-[#5a554a] font-mono-code text-xs">
          <p class="mb-2">No archived dispatches saved yet.</p>
          <p class="text-[#8c877c]">Bookmark any column to read later.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = bookmarkedArticles.map(art => `
      <div class="p-3 bg-white border border-[#dcd7ca] flex items-center justify-between">
        <div class="flex-1 cursor-pointer pr-2" onclick="newsApp.openArticle('${art.id}')">
          <span class="text-[10px] font-mono-code text-[#8a151b] uppercase font-bold">${art.category}</span>
          <h4 class="font-headline font-bold text-xs text-[#121212] line-clamp-1 mt-0.5">${art.title}</h4>
        </div>
        <button onclick="newsApp.toggleBookmark('${art.id}')" class="text-[#8a151b] hover:opacity-80 p-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    `).join('');
  }

  // Publish Form (Manual)
  initPublishModal() {
    const openBtn = document.getElementById('open-publish-modal-btn');
    const closeBtn = document.getElementById('close-publish-modal-btn');
    const modal = document.getElementById('publish-modal');
    const form = document.getElementById('publish-article-form');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
      });
    }

    const closeModal = () => {
      if (modal) modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('post-title').value.trim();
        const category = document.getElementById('post-category').value;
        const authorName = document.getElementById('post-author').value.trim() || 'Staff Correspondent';
        const coverImage = document.getElementById('post-cover').value.trim() || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80';
        const readTime = document.getElementById('post-readtime').value.trim() || '5 min read';
        const summary = document.getElementById('post-summary').value.trim();
        const tags = document.getElementById('post-tags').value.split(',').map(t => t.trim()).filter(Boolean);
        const content = document.getElementById('post-content').value.trim();

        const newPost = {
          id: `art-${Date.now()}`,
          title,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category,
          featured: false,
          leadHero: false,
          trendingRank: null,
          author: {
            name: authorName,
            role: "Independent Columnist",
            avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`
          },
          publishedAt: new Date().toISOString(),
          readTime,
          coverImage,
          coverCaption: "Dispatched to The Global Chronicle wire.",
          summary,
          tags: tags.length > 0 ? tags : ["News", "Chronicle"],
          likes: 1,
          claps: 0,
          commentsCount: 0,
          content: `<p class="drop-cap font-body text-lg leading-relaxed text-[#121212] mb-6">${content.replace(/\n\n/g, '</p><p class="font-body text-base text-[#121212] leading-relaxed mb-6">')}</p>`
        };

        try {
          await fetch('/api/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPost)
          });
        } catch (err) {
          console.error("Failed to post to API:", err);
        }

        this.articles.unshift(newPost);
        this.renderNewsFeed();
        closeModal();
        form.reset();
        this.showToast("📰 Column successfully printed to front page!");
      });
    }
  }

  // AI Agent Control Modal
  initAgentModal() {
    const chipBtn = document.getElementById('agent-header-chip');
    const openBtn = document.getElementById('open-agent-modal-btn');
    const closeBtn = document.getElementById('close-agent-modal-btn');
    const modal = document.getElementById('agent-modal');
    const triggerBtn = document.getElementById('trigger-agent-now-btn');
    const settingsForm = document.getElementById('agent-settings-form');

    const openModal = () => {
      this.fetchAgentStatus();
      if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
      }
    };

    if (chipBtn) chipBtn.onclick = openModal;
    if (openBtn) openBtn.onclick = openModal;

    const closeModal = () => {
      if (modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    };

    if (closeBtn) closeBtn.onclick = closeModal;

    // Trigger AI Agent Now button
    if (triggerBtn) {
      triggerBtn.onclick = async () => {
        const catSelect = document.getElementById('agent-trigger-category');
        const category = catSelect ? catSelect.value : null;

        triggerBtn.disabled = true;
        triggerBtn.innerHTML = `
          <span class="animate-spin inline-block mr-2">⚙️</span>
          Scouring Global Wire Feeds & Typesetting...
        `;

        try {
          const res = await fetch('/api/agent/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category })
          });
          const result = await res.json();

          if (result.success && result.article) {
            this.showToast(`📰 Printed: "${result.article.title.substring(0, 32)}..."`);
            await this.fetchArticles();
            await this.fetchAgentStatus();
            setTimeout(() => {
              this.openArticle(result.article.id);
            }, 600);
          } else {
            this.showToast("No new unique wire item found or error occurred.");
          }
        } catch (e) {
          this.showToast("Teletype daemon communication failure.");
        } finally {
          triggerBtn.disabled = false;
          triggerBtn.innerHTML = `<span>⚡ Sweep Wire & Print Story Now</span>`;
        }
      };
    }

    // Agent-Reach: Sweep GitHub Trending AI
    const reachGithubBtn = document.getElementById('reach-github-btn');
    if (reachGithubBtn) {
      reachGithubBtn.onclick = async () => {
        reachGithubBtn.disabled = true;
        this.showToast("🐙 Scouring GitHub trending AI repositories...");
        try {
          const res = await fetch('/api/agent/reach/github', { method: 'POST' });
          const data = await res.json();
          if (data.success && data.article) {
            this.showToast(`🐙 Printed: "${data.article.title.substring(0, 30)}..."`);
            await this.fetchArticles();
            await this.fetchAgentStatus();
            setTimeout(() => this.openArticle(data.article.id), 500);
          }
        } catch (e) {
          this.showToast("GitHub sweep encountered an issue");
        } finally {
          reachGithubBtn.disabled = false;
        }
      };
    }

    // Agent-Reach: Sweep Reddit Viral Wire
    const reachRedditBtn = document.getElementById('reach-reddit-btn');
    if (reachRedditBtn) {
      reachRedditBtn.onclick = async () => {
        reachRedditBtn.disabled = true;
        this.showToast("📱 Scouring Reddit viral discussions...");
        try {
          const res = await fetch('/api/agent/reach/reddit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subreddit: 'entertainment' })
          });
          const data = await res.json();
          if (data.success && data.article) {
            this.showToast(`📱 Printed: "${data.article.title.substring(0, 30)}..."`);
            await this.fetchArticles();
            await this.fetchAgentStatus();
            setTimeout(() => this.openArticle(data.article.id), 500);
          }
        } catch (e) {
          this.showToast("Reddit sweep encountered an issue");
        } finally {
          reachRedditBtn.disabled = false;
        }
      };
    }

    // Agent-Reach: Ingest Web URL via Jina Reader
    const reachUrlBtn = document.getElementById('reach-url-btn');
    const reachUrlInput = document.getElementById('reach-url-input');
    if (reachUrlBtn && reachUrlInput) {
      reachUrlBtn.onclick = async () => {
        const url = reachUrlInput.value.trim();
        if (!url) {
          this.showToast("Please enter an article URL first!");
          return;
        }
        reachUrlBtn.disabled = true;
        reachUrlBtn.textContent = "Ingesting...";
        this.showToast("🔗 Reading & converting web page via Jina Reader...");

        try {
          const res = await fetch('/api/agent/reach/url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
          });
          const data = await res.json();
          if (data.success && data.article) {
            this.showToast(`✨ Ingested & Printed: "${data.article.title.substring(0, 30)}..."`);
            reachUrlInput.value = '';
            await this.fetchArticles();
            await this.fetchAgentStatus();
            setTimeout(() => this.openArticle(data.article.id), 500);
          } else {
            this.showToast("Failed to ingest URL: " + (data.error || "Unknown error"));
          }
        } catch (e) {
          this.showToast("Network error while ingesting URL");
        } finally {
          reachUrlBtn.disabled = false;
          reachUrlBtn.textContent = "⚡ Ingest via Jina Reader & Print";
        }
      };
    }

    // Save Settings
    if (settingsForm) {
      settingsForm.onsubmit = async (e) => {
        e.preventDefault();
        const autoPostEnabled = document.getElementById('agent-setting-enabled').checked;
        const intervalHours = parseFloat(document.getElementById('agent-setting-interval').value) || 3;
        const aiProvider = document.getElementById('agent-setting-provider').value;
        const apiKey = document.getElementById('agent-setting-key').value.trim();

        try {
          const res = await fetch('/api/agent/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              autoPostEnabled,
              intervalHours,
              aiProvider,
              apiKey
            })
          });
          const data = await res.json();
          if (data.success) {
            this.agentStatus = data.status;
            this.updateAgentHeaderBadge();
            this.showToast("Bureau settings updated successfully!");
          }
        } catch (err) {
          this.showToast("Error updating configuration");
        }
      };
    }
  }

  openAgentModal() {
    const modal = document.getElementById('agent-modal');
    if (modal) {
      this.fetchAgentStatus();
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }
  }

  // Render Telemetry
  renderAgentModalData() {
    if (!this.agentStatus) return;

    const totalEl = document.getElementById('agent-stat-total');
    const intervalEl = document.getElementById('agent-stat-interval');
    const nextRunEl = document.getElementById('agent-stat-next');
    const logsContainer = document.getElementById('agent-logs-container');
    const enabledInput = document.getElementById('agent-setting-enabled');
    const intervalInput = document.getElementById('agent-setting-interval');
    const providerInput = document.getElementById('agent-setting-provider');

    if (totalEl) totalEl.textContent = this.agentStatus.totalGenerated || 0;
    if (intervalEl) intervalEl.textContent = `Every ${this.agentStatus.intervalHours || 3}h`;
    
    if (nextRunEl) {
      if (this.agentStatus.nextRun) {
        const nextDate = new Date(this.agentStatus.nextRun);
        nextRunEl.textContent = nextDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        nextRunEl.textContent = 'Standby';
      }
    }

    if (enabledInput) enabledInput.checked = !!this.agentStatus.autoPostEnabled;
    if (intervalInput) intervalInput.value = this.agentStatus.intervalHours || 3;
    if (providerInput) providerInput.value = this.agentStatus.aiProvider || 'built-in';

    if (logsContainer && this.agentStatus.recentLogs) {
      logsContainer.innerHTML = this.agentStatus.recentLogs.map(l => {
        const time = new Date(l.timestamp).toLocaleTimeString();
        let badgeColor = 'text-amber-400';
        if (l.type === 'PUBLISHED') badgeColor = 'text-emerald-400 font-bold';
        if (l.type === 'DISCOVERY') badgeColor = 'text-cyan-400';
        if (l.type === 'ERROR') badgeColor = 'text-rose-400';

        return `
          <div class="flex items-start space-x-2 text-[11px] font-mono-code border-b border-[#2e2e2a] pb-1 last:border-b-0">
            <span class="text-slate-500 shrink-0">${time}</span>
            <span class="${badgeColor} uppercase shrink-0">[${l.type}]</span>
            <span class="text-slate-300 break-words">${l.message}</span>
          </div>
        `;
      }).join('');
    }
  }

  initModalListeners() {
    const readerModal = document.getElementById('article-reader-modal');
    if (readerModal) {
      readerModal.addEventListener('click', (e) => {
        if (e.target === readerModal) {
          this.stopTTS();
          readerModal.classList.add('hidden');
          document.body.classList.remove('overflow-hidden');
          window.location.hash = '';
          this.currentArticleId = null;
        }
      });
    }
  }

  showToast(message) {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.remove('translate-y-24', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-24', 'opacity-0');
    }, 3200);
  }
}

// Global instance
let newsApp;
document.addEventListener('DOMContentLoaded', () => {
  newsApp = new NewsApp();
});
