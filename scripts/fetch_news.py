#!/usr/bin/env python3
"""
Global Markets Pulse - news collector.

Runs inside GitHub Actions every 5 minutes. It downloads RSS feeds from
global news sites, merges them, removes duplicates and writes ONE small
file (news.json) that the website reads.

You normally never need to run this yourself. To add or remove a news
source, edit the FEEDS list below (name, category, url).
"""
import argparse
import hashlib
import html
import json
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

import feedparser

# ---------------------------------------------------------------------------
# NEWS SOURCES  (category must be one of: Markets, Economy, World,
#                Commodities, Asia)
# ---------------------------------------------------------------------------
FEEDS = [
    # Markets
    ("CNBC", "Markets", "https://www.cnbc.com/id/100003114/device/rss/rss.html"),
    ("CNBC", "Markets", "https://www.cnbc.com/id/15839069/device/rss/rss.html"),
    ("MarketWatch", "Markets", "https://feeds.content.dowjones.io/public/rss/mw_topstories"),
    ("MarketWatch", "Markets", "https://feeds.content.dowjones.io/public/rss/mw_marketpulse"),
    ("WSJ", "Markets", "https://feeds.content.dowjones.io/public/rss/RSSMarketsMain"),
    ("Yahoo Finance", "Markets", "https://finance.yahoo.com/news/rssindex"),
    ("Investing.com", "Markets", "https://www.investing.com/rss/news_25.rss"),
    # Economy / business
    ("BBC", "Economy", "https://feeds.bbci.co.uk/news/business/rss.xml"),
    ("The Guardian", "Economy", "https://www.theguardian.com/business/economics/rss"),
    ("NYT", "Economy", "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml"),
    ("CNBC", "Economy", "https://www.cnbc.com/id/20910258/device/rss/rss.html"),
    # World
    ("BBC", "World", "https://feeds.bbci.co.uk/news/world/rss.xml"),
    ("Al Jazeera", "World", "https://www.aljazeera.com/xml/rss/all.xml"),
    ("The Guardian", "World", "https://www.theguardian.com/world/rss"),
    ("NYT", "World", "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"),
    ("DW", "World", "https://rss.dw.com/rdf/rss-en-all"),
    ("CNBC", "World", "https://www.cnbc.com/id/100727362/device/rss/rss.html"),
    # Commodities
    ("OilPrice", "Commodities", "https://oilprice.com/rss/main"),
    ("Mining.com", "Commodities", "https://www.mining.com/feed/"),
    # Asia & Sri Lanka
    ("EconomyNext", "Asia", "https://economynext.com/feed/"),
    ("Nikkei Asia", "Asia", "https://asia.nikkei.com/rss/feed/nar"),
    ("SCMP", "Asia", "https://www.scmp.com/rss/92/feed"),
    ("Economic Times", "Asia", "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms"),
]

MAX_ITEMS = 250          # total headlines kept
MAX_PER_FEED = 25        # headlines taken from each feed
MAX_AGE_HOURS = 48       # drop anything older than this
SUMMARY_CHARS = 240
USER_AGENT = "Mozilla/5.0 (compatible; GlobalMarketsPulse/1.0; RSS reader)"

HOT_WORDS = {
    "Fed": r"\b(fed|fomc|powell|federal reserve)\b",
    "Rates": r"\b(rate cut|rate hike|interest rate|yields?|bond)\b",
    "Inflation": r"\b(inflation|cpi|ppi)\b",
    "Oil": r"\b(oil|crude|opec|brent|wti)\b",
    "Gold": r"\b(gold|bullion)\b",
    "Tariffs": r"\b(tariffs?|trade war|sanctions?)\b",
    "Earnings": r"\b(earnings|quarterly profit|results)\b",
    "Crypto": r"\b(bitcoin|crypto|ethereum)\b",
    "Sri Lanka": r"\b(sri lanka|cbsl|colombo|cse)\b",
    "China": r"\b(china|beijing|pboc|yuan)\b",
}
HOT_RE = {k: re.compile(v, re.I) for k, v in HOT_WORDS.items()}
TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")


def clean(text, limit=None):
    text = html.unescape(TAG_RE.sub(" ", text or ""))
    text = WS_RE.sub(" ", text).strip()
    if limit and len(text) > limit:
        text = text[: limit - 1].rsplit(" ", 1)[0] + "…"
    return text


def entry_time(e):
    for key in ("published_parsed", "updated_parsed", "created_parsed"):
        t = e.get(key)
        if t:
            try:
                return datetime(*t[:6], tzinfo=timezone.utc)
            except Exception:
                pass
    return None


def entry_image(e):
    for key in ("media_thumbnail", "media_content"):
        for m in e.get(key) or []:
            url = m.get("url")
            if url and url.startswith("http"):
                return url
    for link in e.get("links") or []:
        if link.get("rel") == "enclosure" and str(link.get("type", "")).startswith("image"):
            return link.get("href")
    m = re.search(r'<img[^>]+src="(https?://[^"]+)"', e.get("summary", "") or "")
    return m.group(1) if m else None


def fetch(feed):
    name, category, url = feed
    started = time.time()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/rss+xml, application/xml, text/xml, */*"})
        with urllib.request.urlopen(req, timeout=15) as r:
            raw = r.read()
        parsed = feedparser.parse(raw)
        items = []
        for e in parsed.entries[:MAX_PER_FEED]:
            title = clean(e.get("title"))
            link = e.get("link")
            if not title or not link:
                continue
            published = entry_time(e)
            items.append({
                "id": hashlib.sha1(link.encode("utf-8")).hexdigest()[:12],
                "title": title,
                "link": link,
                "source": name,
                "category": category,
                "published": published.isoformat().replace("+00:00", "Z") if published else None,
                "summary": clean(e.get("summary") or e.get("description"), SUMMARY_CHARS),
                "image": entry_image(e),
            })
        return name, category, url, items, None, round(time.time() - started, 2)
    except Exception as exc:  # one broken feed must never stop the rest
        return name, category, url, [], str(exc)[:160], round(time.time() - started, 2)


def build(feeds):
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=MAX_AGE_HOURS)
    with ThreadPoolExecutor(max_workers=12) as pool:
        results = list(pool.map(fetch, feeds))

    seen_titles, seen_ids, items, sources = set(), set(), [], []
    for name, category, url, feed_items, error, secs in results:
        sources.append({"name": name, "category": category, "url": url,
                        "ok": error is None, "count": len(feed_items),
                        "error": error, "seconds": secs})
        for it in feed_items:
            key = re.sub(r"[^a-z0-9]", "", it["title"].lower())[:90]
            if key in seen_titles or it["id"] in seen_ids:
                continue
            if it["published"]:
                ts = datetime.fromisoformat(it["published"].replace("Z", "+00:00"))
                if ts < cutoff:
                    continue
                if ts > now + timedelta(minutes=10):   # bad future dates
                    it["published"] = now.isoformat().replace("+00:00", "Z")
            text = f'{it["title"]} {it["summary"]}'
            it["tags"] = [k for k, rx in HOT_RE.items() if rx.search(text)][:3]
            seen_titles.add(key)
            seen_ids.add(it["id"])
            items.append(it)

    items.sort(key=lambda x: x["published"] or "", reverse=True)
    return {
        "generated_at": now.isoformat().replace("+00:00", "Z"),
        "item_count": min(len(items), MAX_ITEMS),
        "sources_ok": sum(1 for s in sources if s["ok"]),
        "sources_total": len(sources),
        "sources": sources,
        "items": items[:MAX_ITEMS],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="data/news.json")
    args = ap.parse_args()
    data = build(FEEDS)
    import os
    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Wrote {data['item_count']} headlines from {data['sources_ok']}/{data['sources_total']} sources -> {args.out}")
    for s in data["sources"]:
        flag = "OK " if s["ok"] else "ERR"
        print(f"  [{flag}] {s['name']:<15} {s['count']:>3}  {s['error'] or ''}")
    if data["sources_ok"] == 0:
        sys.exit("No feed could be downloaded - keeping the previous news file.")


if __name__ == "__main__":
    main()
