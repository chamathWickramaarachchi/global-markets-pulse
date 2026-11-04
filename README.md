# Global Markets Pulse - SL Version

This is a free, live dashboard for world markets, with a Sri Lanka focus. It runs on **GitHub Pages**, so there's no server, no hosting bill and no API keys.

- **Live prices**: stock indices (Americas, Europe, Asia Pacific, Sri Lanka ASPI) and commodities (energy, metals, agriculture). TradingView supplies them and they update by themselves.
- **Forex**: LKR rates (USD, EUR, GBP, JPY, AUD, INR, CNY, AED), the major pairs and the Dollar Index, plus Asian currencies.
- **World news, refreshed every 5 minutes**: headlines from about 23 sources, including CNBC, MarketWatch, WSJ, Yahoo Finance, BBC, NYT, The Guardian, Al Jazeera, DW, OilPrice, Nikkei Asia, SCMP, Economic Times and EconomyNext.
- **Other panels**: world market open/closed clocks, mini spotlight charts, a big interactive chart, an economic calendar and an S&P 500 heatmap.

```
 ┌──────────────── GitHub (free) ────────────────┐
 │                                               │
 │  GitHub Action  ── every 5 min ──►  news.json │  (branch: news-data)
 │  (scripts/fetch_news.py reads RSS feeds)      │
 │                                               │
 │  GitHub Pages   ── serves ──►  index.html     │  (branch: main)
 └───────────────────────────────────────────────┘
                 ▲                       ▲
   visitor's browser reads news.json     │ live prices stream straight
   every 5 min                           │ from TradingView widgets
```

---

## Step-by-step setup (about 10 minutes, no coding)

Everything below happens in your web browser on **github.com**.

### Step 1: Unzip the project
Unzip `global-markets-pulse.zip` on your computer. You'll get a folder with:
`index.html`, `README.md`, and the folders `assets`, `data`, `scripts` and `.github`.

> The `.github` folder name starts with a dot, so Windows and Mac often hide it. That's normal. Step 4 covers it.

### Step 2: Create a new repository
1. Sign in to github.com.
2. Click the **+** button (top right) and choose **New repository**.
3. Fill in the form:
   - **Repository name:** `global-markets-pulse` (or any name you like)
   - Choose **Public**. GitHub Pages is free only for public repositories.
   - Leave "Add a README" **unticked**.
4. Click **Create repository**.

### Step 3: Upload the files
1. On the new empty repository page, click the link **"uploading an existing file"**.
2. Open the unzipped folder on your computer. Select **everything inside it** (`index.html`, `README.md`, `assets`, `data`, `scripts`) and drag it all into the browser window.
3. Wait until every file shows in the list, then click the green **Commit changes** button.

### Step 4: Add the news robot (the 5-minute updater)
First, check whether the `.github` folder was uploaded. If your repository's file list already shows **`.github`**, skip to Step 5.

If it doesn't:
1. Click **Add file**, then **Create new file**.
2. In the file-name box, type exactly: `.github/workflows/update-news.yml`
   (GitHub turns each `/` into a folder as you type.)
3. Copy **all** of the text in the box below and paste it into the big editor:

```yaml
name: Update News

on:
  schedule:
    - cron: "*/5 * * * *"
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: update-news
  cancel-in-progress: true

jobs:
  news:
    runs-on: ubuntu-latest
    timeout-minutes: 6
    steps:
      - name: Get the website code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install the RSS reader
        run: pip install feedparser==6.0.11

      - name: Download the latest headlines
        run: python scripts/fetch_news.py --out out/news.json

      - name: Publish news.json to the news-data branch
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          cd out
          git init -q
          git checkout -q -b news-data
          git config user.name "news-bot"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add news.json
          git commit -q -m "News update $(date -u +'%Y-%m-%d %H:%M UTC')"
          git push -q -f "https://x-access-token:${GH_TOKEN}@github.com/${GITHUB_REPOSITORY}.git" news-data
```
4. Click **Commit changes…**, then **Commit changes** again.

### Step 5: Allow the robot to save news
1. In your repository, open **Settings** (top menu), then **Actions** (left menu), then **General**.
2. Scroll to **Workflow permissions** and select **Read and write permissions**.
3. Click **Save**.

### Step 6: Run the news robot once
1. Click the **Actions** tab at the top of the repository.
   - If GitHub asks you to enable workflows, click the green button to enable them.
2. Click **Update News** in the left list.
3. Click **Run workflow** (right side), then the green **Run workflow** button.
4. Wait about a minute and refresh. You should see a **green tick ✅**.
   After that, it runs by itself every 5 minutes.

### Step 7: Turn on the website (GitHub Pages)
1. Go to **Settings**, then **Pages** (left menu).
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Under **Branch**, choose **`main`** and **`/ (root)`**, then click **Save**.
4. Wait 1–2 minutes and refresh the page. A box appears at the top: **"Your site is live at https://YOUR-USERNAME.github.io/global-markets-pulse/"**.

🎉 **Open that link. Your dashboard is live!** Share the same link with anyone.

---

## Changing things later

All the settings are in **`assets/js/config.js`**. To edit it:
1. Click the file in GitHub, then the **pencil ✏️ icon**.
2. Make your change and click **Commit changes**.
3. Wait about 1 minute, then refresh the website (Ctrl + F5 on Windows, Cmd + Shift + R on Mac).

| I want to… | Edit this in `config.js` |
|---|---|
| Rename the site | `siteName` (the text after " - " shows as a badge) and `tagline` |
| Add or remove an index, commodity or currency | the `indices`, `commodities` or `forex` lists |
| Change the scrolling ticker | `tickerTape` |
| Change the spotlight cards | `spotlight` |
| Change the chart quick-buttons | `chartPresets` |
| Change the clock timezone | `timezone` and `localClockLabel` |

To add or remove **news sources**, edit the `FEEDS` list at the top of `scripts/fetch_news.py`.

### Finding a symbol
Search for the instrument on [tradingview.com](https://www.tradingview.com). The symbol is the `PROVIDER:TICKER` text, for example `OANDA:XAUUSD` for gold.
- Index and commodity CFDs from **OANDA, Pepperstone, Capital.com and FOREX.com** are **real-time** in free widgets.
- Exchange symbols such as `TSX:TSX`, `NASDAQ:IXIC`, `BME:IBC` and `CSELK:ASI` are **delayed** by the exchange (usually 15 minutes).
- Futures from CME/NYMEX/COMEX/CBOT/ICE are **not** allowed in free widgets. That's why this dashboard uses CFD prices, which track the same markets.

---

## Troubleshooting

| What you see | What to do |
|---|---|
| News panel says "News feed not available yet" | Do Step 6 again and check for a green tick. If you see a red ❌, click it to read the error. Usually Step 5 was missed. |
| A price box says "This symbol is only available on TradingView" | That provider isn't allowed in free widgets. Swap the symbol in `config.js` for one from another provider. |
| "Feed updated 40m ago" shows in orange | GitHub sometimes delays scheduled runs when it's busy. It catches up by itself. You can also press **Run workflow** to update now. |
| GitHub emails you that the scheduled workflow was disabled | GitHub pauses robots in repositories that see no activity for 60 days. Open **Actions**, click **Update News** and press **Enable workflow**. |
| My changes don't show | Wait 1–2 minutes, then hard-refresh with Ctrl + F5. |

---

## Notes
- Market data and charts come from TradingView's free widgets. The headlines link to the original publishers.
- Market open/closed times don't account for public holidays.
- This dashboard is for information only and isn't investment advice.
