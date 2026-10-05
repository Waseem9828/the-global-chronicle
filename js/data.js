// Seed Data: International Daily News Articles & Market Data
const INITIAL_ARTICLES = [
  {
    id: "art-world-1",
    title: "Global Climate Accord: Over 140 Nations Ratify Binding Clean Grid Infrastructure Treaty",
    slug: "global-climate-accord-clean-grid-treaty",
    category: "World",
    featured: true,
    leadHero: true,
    trendingRank: 1,
    author: {
      name: "Amira Al-Mansoor",
      role: "Chief International Diplomatic Correspondent",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "2026-10-04T18:45:00Z",
    readTime: "6 min read",
    coverImage: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1400&q=80",
    coverCaption: "Delegates gather at the International Convention Centre in Geneva following ratification.",
    summary: "In an unprecedented diplomatic breakthrough in Geneva, representatives from 142 nations approved landmark multi-lateral financing frameworks ensuring renewable energy transmission interconnectivity across three continents.",
    tags: ["World", "Diplomacy", "Climate", "Global Politics", "Infrastructure"],
    likes: 2420,
    claps: 684,
    commentsCount: 142,
    content: `
      <p class="text-xl font-light leading-relaxed text-slate-300 mb-6">
        In what environmental economists are hailing as the most consequential diplomatic accord in a generation, delegates from 142 sovereign nations concluded intense negotiations in Geneva by approving a binding global clean grid transmission pact.
      </p>
      <div class="my-8 p-6 rounded-2xl bg-cyan-950/30 border border-cyan-500/30">
        <h4 class="text-cyan-400 font-mono-code font-bold uppercase text-xs tracking-wider mb-2">Key Provisions</h4>
        <ul class="list-disc list-inside space-y-2 text-slate-200 text-sm">
          <li>$1.2 Trillion sovereign bond underwriting pool established for cross-border HVDC cables.</li>
          <li>Standardized tariff-free clean energy wheeling protocols between Africa, Europe, and Asia.</li>
          <li>Binding decommission timetables for unabated fossil infrastructure by 2038.</li>
        </ul>
      </div>
      <h3 class="text-2xl font-bold font-headline text-white mt-8 mb-4">Diplomatic Breakthrough in Geneva</h3>
      <p class="text-slate-300 leading-relaxed mb-6">
        The marathon negotiations, which extended through three consecutive nights of bilateral disputes regarding sovereign debt guarantees, reached consensus after a tripartite compromise led by developing nations, the European Union, and East Asian trade delegations.
      </p>
    `
  },
  {
    id: "art-tech-1",
    title: "Autonomous Quantum Accelerators Shatter Petascale Compute Limits",
    slug: "quantum-accelerators-petascale-compute",
    category: "Technology",
    featured: true,
    leadHero: false,
    trendingRank: 2,
    author: {
      name: "Dr. Elena Vance",
      role: "Chief Silicon Correspondent",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "2026-10-04T17:15:00Z",
    readTime: "5 min read",
    coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
    coverCaption: "A cryogenically stabilized 256-qubit interconnect chamber at Zurich Labs.",
    summary: "The first commercially viable room-temperature optical quantum processor has been unveiled, slashing foundation model training overhead by over 400x.",
    tags: ["Technology", "Quantum", "AI", "Semiconductors"],
    likes: 1890,
    claps: 495,
    commentsCount: 78,
    content: `
      <p class="text-lg leading-relaxed text-slate-300 mb-6">
        In a milestone for computational physics, researchers demonstrated an optical-topological quantum processor capable of computing matrix multiplications at room temperature with unprecedented electrical efficiency.
      </p>
    `
  },
  {
    id: "art-biz-1",
    title: "Central Banks Announce Unified Cross-Border Settlement Protocols for Sovereign Digital Currencies",
    slug: "central-banks-cross-border-settlement-cbdc",
    category: "Business",
    featured: true,
    leadHero: false,
    trendingRank: 3,
    author: {
      name: "Julian Thorne",
      role: "Global Financial Markets Analyst",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "2026-10-04T16:30:00Z",
    readTime: "5 min read",
    coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    coverCaption: "Financial district stock tickers displaying global index surges.",
    summary: "Major monetary authorities in London, Tokyo, Singapore, and New York have initiated interoperable multi-CBDC rails, drastically cutting foreign exchange transaction latencies and fees.",
    tags: ["Business", "Finance", "Economy", "Markets", "Banking"],
    likes: 1540,
    claps: 312,
    commentsCount: 64,
    content: `
      <p class="text-lg leading-relaxed text-slate-300 mb-6">
        International wire settlement systems that long required up to 48 hours for correspondent bank clearance can now finalize in under two seconds under new Project Meridian standards unveiled by multilateral financial consortiums.
      </p>
    `
  },
  {
    id: "art-sci-1",
    title: "James Webb Telescope Detects Atmospheric Moisture and Cyclonic Weather on Super-Earth K2-18d",
    slug: "jwst-exoplanet-weather-water-cycle",
    category: "Science",
    featured: false,
    leadHero: false,
    trendingRank: 4,
    author: {
      name: "Dr. Marcus Sterling",
      role: "Senior Astrophysics Editor",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "2026-10-04T14:20:00Z",
    readTime: "4 min read",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    coverCaption: "Infrared spectrum composite rendering of super-Earth candidate K2-18d.",
    summary: "Spectroscopic measurements from 124 light-years away confirm dynamic atmospheric condensation and convective cloud systems in the circumstellar habitable zone.",
    tags: ["Science", "Space", "Astronomy", "JWST", "Exoplanets"],
    likes: 2980,
    claps: 820,
    commentsCount: 182,
    content: `
      <p class="text-lg leading-relaxed text-slate-300 mb-6">
        Orbiting within the temperate sweet spot of its parent star, K2-18d has yielded unmistakable spectral absorptions indicating water vapor and complex convective storm systems.
      </p>
    `
  },
  {
    id: "art-sports-1",
    title: "Historic Champions League Quarterfinal Set as High-Altitude Tacticians Redefine Continental Football",
    slug: "champions-league-tactical-revolution-europe",
    category: "Sports",
    featured: false,
    leadHero: false,
    trendingRank: 5,
    author: {
      name: "Mateo Rossi",
      role: "European Sports Columnist",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "2026-10-04T12:00:00Z",
    readTime: "4 min read",
    coverImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    coverCaption: "Packed stadium under floodlights during thrilling continental clash.",
    summary: "A tactical revolution involving inverted spatial overloads and biometric pacing has produced record-breaking goal tallies across European football.",
    tags: ["Sports", "Football", "Soccer", "Champions League", "Athletics"],
    likes: 980,
    claps: 215,
    commentsCount: 56,
    content: `
      <p class="text-lg leading-relaxed text-slate-300 mb-6">
        European football is undergoing a tactical metamorphosis. Managers utilizing spatial positional analysis have shattered conventional low-block defensive formations, delivering breathtaking fixtures across the continent.
      </p>
    `
  },
  {
    id: "art-culture-1",
    title: "The Global Revival of Analogue Craft: Why Young Urbanites are Abandoning Screen Saturation",
    slug: "analogue-craft-revival-digital-detox-culture",
    category: "Culture",
    featured: false,
    leadHero: false,
    trendingRank: null,
    author: {
      name: "Kaelen Chen",
      role: "Culture & Trends Lead",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "2026-10-04T10:15:00Z",
    readTime: "5 min read",
    coverImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
    coverCaption: "A bustling independent letterpress and vinyl listening lounge in Tokyo.",
    summary: "From vinyl pressings and fountain pens to film cameras and physical libraries, younger demographics are deliberately carving out screenless sanctuaries.",
    tags: ["Culture", "Lifestyle", "Trends", "Society"],
    likes: 1240,
    claps: 380,
    commentsCount: 89,
    content: `
      <p class="text-lg leading-relaxed text-slate-300 mb-6">
        In major metropolitan hubs from Tokyo to Berlin, quiet record lounges, mechanical clock workshops, and letterpress studios are overflowing with digital natives seeking refuge from 24/7 algorithmic feeds.
      </p>
    `
  }
];

// Market Ticker Seed Data
const MARKET_DATA = [
  { symbol: "NASDAQ", value: "19,842.10", change: "+1.42%", positive: true },
  { symbol: "NVDA", value: "$148.90", change: "+3.85%", positive: true },
  { symbol: "BTC/USD", value: "$84,210.00", change: "+2.15%", positive: true },
  { symbol: "ETH/USD", value: "$4,620.50", change: "+1.90%", positive: true },
  { symbol: "TSLA", value: "$286.40", change: "-0.78%", positive: false },
  { symbol: "AAPL", value: "$244.15", change: "+0.65%", positive: true },
  { symbol: "S&P 500", value: "5,892.40", change: "+0.92%", positive: true },
  { symbol: "SOL/USD", value: "$218.40", change: "+4.12%", positive: true }
];

// Weather Cities
const WEATHER_DATA = [
  { city: "Geneva", temp: "19°C", condition: "Alpine Clear", icon: "☀️" },
  { city: "Tokyo", temp: "22°C", condition: "Cyber Drizzle", icon: "🌧️" },
  { city: "New York", temp: "68°F", condition: "Crisp & Clear", icon: "☀️" },
  { city: "London", temp: "16°C", condition: "Overcast Breeze", icon: "☁️" },
  { city: "Singapore", temp: "29°C", condition: "Tropical Warmth", icon: "🌤️" }
];
