/* ===== Global Markets Pulse — app logic (no need to edit; settings live in config.js) ===== */
(function () {
  "use strict";
  const C = window.PULSE_CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const TV_BASE = "https://s3.tradingview.com/external-embedding/embed-widget-";

  /* ---------- small helpers ---------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "#");
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };

  /* ---------- branding ---------- */
  if (C.siteName) {
    const [main, ...rest] = C.siteName.split(" - ");
    $("#siteName").textContent = main;
    const ver = rest.join(" - ");
    $("#siteVer").textContent = ver; $("#siteVer").hidden = !ver;
    $("#footName").textContent = C.siteName; document.title = C.siteName;
  }
  if (C.tagline) $("#tagline").textContent = C.tagline;
  if (C.localClockLabel) $("#localLabel").textContent = C.localClockLabel;
  const baseTitle = document.title;

  /* ---------- TradingView widget loader ---------- */
  function tvWidget(el, name, config) {
    if (!el) return;
    el.innerHTML = "";
    el.classList.add("loading");
    const wrap = document.createElement("div");
    wrap.className = "tradingview-widget-container";
    const inner = document.createElement("div");
    inner.className = "tradingview-widget-container__widget";
    wrap.appendChild(inner);
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = TV_BASE + name + ".js";
    s.innerHTML = JSON.stringify(config);
    wrap.appendChild(s);
    el.appendChild(wrap);
    const mo = new MutationObserver(() => {
      const f = el.querySelector("iframe");
      if (f) { mo.disconnect(); f.addEventListener("load", () => el.classList.remove("loading")); setTimeout(() => el.classList.remove("loading"), 4000); }
    });
    mo.observe(el, { childList: true, subtree: true });
  }

  // load heavy widgets only when they scroll near the screen
  function whenVisible(el, fn) {
    if (!("IntersectionObserver" in window)) return fn();
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); fn(); }
    }, { rootMargin: "400px" });
    io.observe(el);
  }

  /* ---------- live price widgets ---------- */
  tvWidget($("#tickerTape"), "ticker-tape", {
    symbols: C.tickerTape || [], showSymbolLogo: true, isTransparent: true,
    displayMode: "adaptive", colorTheme: "dark", locale: "en"
  });

  const spot = $("#spotlight");
  (C.spotlight || []).forEach((s) => {
    const card = document.createElement("div");
    card.className = "spot";
    const slot = document.createElement("div");
    slot.className = "tv-slot";
    card.appendChild(slot);
    spot.appendChild(card);
    tvWidget(slot, "mini-symbol-overview", {
      symbol: s.symbol, width: "100%", height: "100%", locale: "en", dateRange: "1D",
      colorTheme: "dark", isTransparent: true, autosize: true, largeChartUrl: "",
      trendLineColor: "rgba(0, 224, 184, 1)", underLineColor: "rgba(0, 224, 184, 0.18)",
      underLineBottomColor: "rgba(0, 224, 184, 0)", chartOnly: false, noTimeScale: false
    });
  });

  function quotesConfig(groups) {
    return {
      width: "100%", height: "100%", showSymbolLogo: true, isTransparent: true,
      colorTheme: "dark", locale: "en", backgroundColor: "rgba(0,0,0,0)",
      symbolsGroups: groups.map((g) => ({ name: g.name, originalName: g.name, symbols: g.symbols }))
    };
  }
  // three tabs: each table is built the first time its tab is opened
  const TAB_DATA = { indices: C.indices || [], commodities: C.commodities || [], forex: C.forex || [] };
  const loadedTabs = new Set();
  function showTab(name) {
    if (!TAB_DATA[name]) name = "indices";
    document.querySelectorAll(".tab").forEach((b) => { const on = b.dataset.tab === name; b.classList.toggle("active", on); b.setAttribute("aria-selected", on); });
    Object.keys(TAB_DATA).forEach((k) => ($("#quotes-" + k).hidden = k !== name));
    if (!loadedTabs.has(name)) { loadedTabs.add(name); tvWidget($("#quotes-" + name), "market-quotes", quotesConfig(TAB_DATA[name])); }
    store.set("gmp_tab", name);
  }
  document.querySelectorAll(".tab").forEach((btn) => btn.addEventListener("click", () => showTab(btn.dataset.tab)));
  showTab(store.get("gmp_tab", "indices"));

  // advanced chart with quick-pick chips
  const presets = C.chartPresets || [];
  let chartSymbol = store.get("gmp_chart", presets[0] && presets[0].symbol) || "OANDA:SPX500USD";
  function loadChart() {
    tvWidget($("#advancedChart"), "advanced-chart", {
      autosize: true, symbol: chartSymbol, interval: "15", timezone: C.timezone || "Etc/UTC",
      theme: "dark", style: "1", locale: "en", backgroundColor: "rgba(10, 15, 28, 1)",
      gridColor: "rgba(120, 150, 210, 0.06)", allow_symbol_change: true, calendar: false,
      hide_volume: true, support_host: "https://www.tradingview.com"
    });
    document.querySelectorAll("#chartChips .chip").forEach((c) => c.classList.toggle("active", c.dataset.symbol === chartSymbol));
  }
  const chipsEl = $("#chartChips");
  presets.forEach((p) => {
    const b = document.createElement("button");
    b.className = "chip"; b.textContent = p.label; b.dataset.symbol = p.symbol;
    b.addEventListener("click", () => { chartSymbol = p.symbol; store.set("gmp_chart", chartSymbol); loadChart(); });
    chipsEl.appendChild(b);
  });
  whenVisible($("#advancedChart"), loadChart);
  $("#fullscreenBtn").addEventListener("click", () => {
    const p = $("#chartPanel");
    if (document.fullscreenElement) document.exitFullscreen(); else if (p.requestFullscreen) p.requestFullscreen();
  });

  whenVisible($("#ecoCalendar"), () => tvWidget($("#ecoCalendar"), "events", {
    colorTheme: "dark", isTransparent: true, width: "100%", height: "100%", locale: "en",
    importanceFilter: "0,1", countryFilter: "us,eu,gb,de,jp,cn,in,au,ca"
  }));
  whenVisible($("#heatmap"), () => tvWidget($("#heatmap"), "stock-heatmap", {
    exchanges: [], dataSource: "SPX500", grouping: "sector", blockSize: "market_cap_basic",
    blockColor: "change", locale: "en", symbolUrl: "", colorTheme: "dark", hasTopBar: false,
    isDataSetEnabled: false, isZoomEnabled: true, hasSymbolTooltip: true, isMonoSize: false,
    width: "100%", height: "100%"
  }));

  /* ---------- clocks & market sessions ---------- */
  const fmtCache = {};
  function partsIn(tz, d) {
    const f = fmtCache[tz] || (fmtCache[tz] = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }));
    const p = {}; f.formatToParts(d).forEach((x) => (p[x.type] = x.value));
    return { wd: p.weekday, h: +p.hour % 24, m: +p.minute, s: +p.second };
  }
  const pad = (n) => String(n).padStart(2, "0");
  const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const dur = (min) => { const t = Math.ceil(min), h = Math.floor(t / 60), m = t % 60; return h ? `${h}h ${m}m` : `${m}m`; };
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function sessionState(ex, now) {
    const p = partsIn(ex.tz, now);
    const mins = p.h * 60 + p.m + p.s / 60;
    const ses = ex.sessions.map(([a, b]) => [toMin(a), toMin(b)]);
    const first = ses[0][0], last = ses[ses.length - 1][1];
    const day = DAYS.indexOf(p.wd);
    const weekday = day >= 1 && day <= 5;
    const time = `${pad(p.h)}:${pad(p.m)}`;
    if (weekday) {
      for (const [a, b] of ses) if (mins >= a && mins < b) return { time, cls: "open", label: "OPEN", note: `Closes in ${dur(b - mins)}`, pct: ((mins - first) / (last - first)) * 100 };
      if (mins >= first && mins < last) { const nxt = ses.find(([a]) => a > mins); return { time, cls: "lunch", label: "BREAK", note: `Reopens in ${dur(nxt[0] - mins)}`, pct: ((mins - first) / (last - first)) * 100 }; }
      if (mins < first) return { time, cls: first - mins <= 60 ? "pre" : "closed", label: first - mins <= 60 ? "PRE" : "CLOSED", note: `Opens in ${dur(first - mins)}`, pct: 0 };
    }
    // after close or weekend: find next weekday
    let add = 1, d = (day + 1) % 7;
    while (d === 0 || d === 6) { add++; d = (d + 1) % 7; }
    if (!weekday && day === 0) { add = 1; } // Sunday -> Monday
    if (!weekday && day === 6) { add = 2; } // Saturday -> Monday
    const until = add * 1440 - mins + first;
    return { time, cls: "closed", label: "CLOSED", note: until > 1440 ? `Opens ${DAYS[(day + add) % 7]} ${ex.sessions[0][0]}` : `Opens in ${dur(until)}`, pct: weekday ? 100 : 0 };
  }

  const sessEl = $("#sessions");
  const exchanges = C.exchanges || [];
  sessEl.innerHTML = exchanges.map((ex, i) => `
    <div class="sess" id="sess${i}">
      <div class="sess-city">${esc(ex.city)}</div>
      <div class="sess-top"><span class="sess-time">--:--</span><span class="sess-code">${esc(ex.code)}</span></div>
      <div class="bar"><i style="width:0%"></i></div>
      <div class="sess-note"><span class="badge closed">—</span> <span class="note-txt"></span></div>
    </div>`).join("");

  function tickClocks() {
    const now = new Date();
    const lp = partsIn(C.timezone || "Etc/UTC", now);
    $("#localClock").textContent = `${pad(lp.h)}:${pad(lp.m)}:${pad(lp.s)}`;
    $("#utcClock").textContent = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
    const ny = partsIn("America/New_York", now);
    $("#nyClock").textContent = `${pad(ny.h)}:${pad(ny.m)}`;
  }
  function tickSessions() {
    const now = new Date();
    exchanges.forEach((ex, i) => {
      const st = sessionState(ex, now);
      const el = $("#sess" + i);
      el.classList.toggle("is-open", st.cls === "open");
      const b = el.querySelector(".badge"); b.className = "badge " + st.cls; b.textContent = st.label;
      el.querySelector(".sess-time").textContent = st.time;
      el.querySelector(".bar > i").style.width = Math.max(0, Math.min(100, st.pct)).toFixed(1) + "%";
      el.querySelector(".note-txt").textContent = st.note.replace(/^(Closes|Reopens|Opens) in /, "").replace(/^Opens /, "");
      el.title = `${ex.city} (${ex.code}) — ${st.label.toLowerCase()} · ${st.note}`;
    });
  }
  tickClocks(); tickSessions();
  setInterval(tickClocks, 1000);
  setInterval(tickSessions, 15000);

  /* ---------- NEWS ---------- */
  const REFRESH_MS = Math.max(1, C.newsRefreshMinutes || 5) * 60 * 1000;
  const CATS = ["All", "Markets", "Economy", "World", "Commodities", "Asia"];
  const CAT_LABEL = { Asia: "Asia & Sri Lanka" };
  const state = { items: [], data: null, cat: store.get("gmp_cat", "All"), source: "", q: "", fresh: new Set(), prevIds: null, nextAt: 0, loading: false };

  function newsUrls() {
    const urls = [];
    if (C.newsJsonUrl) urls.push(C.newsJsonUrl);
    const h = location.hostname;
    if (h.endsWith(".github.io")) {
      const owner = h.split(".")[0];
      const seg = location.pathname.split("/").filter(Boolean)[0];
      const repo = seg && !seg.includes(".") ? seg : h;
      urls.push(`https://raw.githubusercontent.com/${owner}/${repo}/news-data/news.json`);
    }
    urls.push("data/news.json");
    return urls;
  }

  function hueOf(name) { let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }
  function ago(iso) {
    if (!iso) return "";
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  async function loadNews(manual) {
    if (state.loading) return;
    state.loading = true;
    const btn = $("#refreshNow"); btn.classList.add("spin");
    let data = null;
    for (const u of newsUrls()) {
      try {
        const r = await fetch(u + (u.includes("?") ? "&" : "?") + "t=" + Date.now(), { cache: "no-store" });
        if (!r.ok) continue;
        const j = await r.json();
        if (j && Array.isArray(j.items) && (j.items.length || !data)) { data = j; if (j.items.length) break; }
      } catch (e) { /* try next address */ }
    }
    state.loading = false; btn.classList.remove("spin");
    state.nextAt = Date.now() + REFRESH_MS;
    if (!data) { $("#newsStatus").innerHTML = `<span style="color:var(--down)">Could not reach the news feed — retrying in ${C.newsRefreshMinutes || 5} min</span>`; if (!state.items.length) renderEmpty(true); return; }

    const ids = new Set(data.items.map((i) => i.id));
    let freshIds;
    if (state.prevIds) freshIds = data.items.filter((i) => !state.prevIds.has(i.id)).map((i) => i.id);
    else { const seen = new Set(store.get("gmp_seen", [])); freshIds = seen.size ? data.items.filter((i) => !seen.has(i.id)).map((i) => i.id) : []; }
    state.fresh = new Set(freshIds);
    state.prevIds = ids;
    store.set("gmp_seen", data.items.slice(0, 600).map((i) => i.id));
    if (document.hidden && freshIds.length) document.title = `(${freshIds.length}) ${baseTitle}`;

    state.data = data; state.items = data.items;
    buildFilters(); renderNews(); renderBreaking(); renderStatus();
  }

  function buildFilters() {
    const counts = {}; state.items.forEach((i) => (counts[i.category] = (counts[i.category] || 0) + 1));
    $("#catChips").innerHTML = CATS.map((c) => {
      const n = c === "All" ? state.items.length : counts[c] || 0;
      return `<button class="chip ${state.cat === c ? "active" : ""}" data-cat="${c}">${esc(CAT_LABEL[c] || c)}<span class="n">${n}</span></button>`;
    }).join("");
    const sources = [...new Set(state.items.map((i) => i.source))].sort();
    const sel = $("#sourceSelect"); const cur = state.source;
    sel.innerHTML = `<option value="">All sources (${sources.length})</option>` + sources.map((s) => `<option ${s === cur ? "selected" : ""}>${esc(s)}</option>`).join("");
  }

  function renderEmpty(err) {
    $("#newsList").innerHTML = `<div class="empty"><strong>${err ? "News feed not available yet" : "No headlines match"}</strong>${err ? "Once the “Update News” GitHub Action has run, headlines appear here automatically." : "Try another category, source or search word."}</div>`;
  }

  function renderNews() {
    const q = state.q.trim().toLowerCase();
    const list = state.items.filter((i) =>
      (state.cat === "All" || i.category === state.cat) &&
      (!state.source || i.source === state.source) &&
      (!q || (i.title + " " + (i.summary || "") + " " + i.source).toLowerCase().includes(q))
    ).slice(0, 150);
    if (!list.length) return renderEmpty(!state.items.length);
    $("#newsList").innerHTML = list.map((i, idx) => {
      const hue = hueOf(i.source);
      const recent = i.published && Date.now() - new Date(i.published).getTime() < 30 * 60 * 1000;
      const tags = (i.tags || []).map((t) => `<span class="hot-tag">${esc(t)}</span>`).join("");
      const img = i.image ? `<img class="news-thumb" src="${esc(safeUrl(i.image))}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : "";
      return `<a class="news-item" href="${esc(safeUrl(i.link))}" target="_blank" rel="noopener noreferrer" style="animation-delay:${Math.min(idx, 12) * 25}ms">
        <div>
          <div class="news-meta">
            ${state.fresh.has(i.id) ? '<span class="new-tag">NEW</span>' : ""}
            <span class="src" style="color:hsl(${hue} 85% 72%);background:hsl(${hue} 70% 50% / .13)">${esc(i.source)}</span>
            <span class="${recent ? "just" : ""}" data-ts="${esc(i.published || "")}">${ago(i.published)}</span>
            ${tags}
          </div>
          <p class="news-title">${esc(i.title)}</p>
          ${i.summary ? `<p class="news-sum">${esc(i.summary)}</p>` : ""}
        </div>${img}</a>`;
    }).join("");
  }

  function renderBreaking() {
    const top = state.items.slice(0, 18);
    if (!top.length) return;
    $("#breakingInner").innerHTML = top.map((i) => `<a href="${esc(safeUrl(i.link))}" target="_blank" rel="noopener noreferrer"><b>${esc(i.source.toUpperCase())}</b>${esc(i.title)}</a>`).join("");
  }

  function renderStatus() {
    const d = state.data; if (!d) return;
    const age = d.generated_at ? (Date.now() - new Date(d.generated_at).getTime()) / 60000 : null;
    const stale = age !== null && age > 30;
    const fresh = state.fresh.size ? ` · <span style="color:var(--accent)">${state.fresh.size} new</span>` : "";
    $("#newsStatus").innerHTML = (d.generated_at
      ? `<span style="${stale ? "color:var(--amber)" : ""}">Feed updated ${ago(d.generated_at)}</span>`
      : "Waiting for first update") +
      ` · ${d.items.length} headlines · ${d.sources_ok ?? "?"}/${d.sources_total ?? "?"} sources${fresh}`;
  }

  // filter events
  $("#catChips").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    state.cat = b.dataset.cat; store.set("gmp_cat", state.cat);
    document.querySelectorAll("#catChips .chip").forEach((c) => c.classList.toggle("active", c === b));
    renderNews();
  });
  $("#sourceSelect").addEventListener("change", (e) => { state.source = e.target.value; renderNews(); });
  let qTimer; $("#newsSearch").addEventListener("input", (e) => { clearTimeout(qTimer); qTimer = setTimeout(() => { state.q = e.target.value; renderNews(); }, 150); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement.tagName !== "INPUT") { e.preventDefault(); $("#newsSearch").focus(); }
  });
  $("#refreshNow").addEventListener("click", () => loadNews(true));
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) { document.title = baseTitle; if (Date.now() >= state.nextAt) loadNews(); }
  });

  // countdown ring + relative times
  const ring = $("#ringFg"), CIRC = 97.4;
  setInterval(() => {
    const left = Math.max(0, state.nextAt - Date.now());
    $("#countdown").textContent = `${Math.floor(left / 60000)}:${pad(Math.floor((left % 60000) / 1000))}`;
    ring.style.strokeDashoffset = String(CIRC * (1 - left / REFRESH_MS));
    if (left <= 0 && !document.hidden && !state.loading) loadNews();
  }, 1000);
  setInterval(() => {
    document.querySelectorAll("[data-ts]").forEach((el) => (el.textContent = ago(el.dataset.ts)));
    renderStatus();
  }, 30000);

  loadNews();
})();
