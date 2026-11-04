/* =====================================================================
   GLOBAL MARKETS PULSE — SETTINGS
   This is the ONLY file you need to edit to change the dashboard.
   - Change the site name, the instruments shown, refresh time, etc.
   - Symbol format is "PROVIDER:TICKER" exactly as on tradingview.com.
     If a box ever shows "This symbol is only available on TradingView",
     search the instrument on tradingview.com and try another provider
     (e.g. OANDA:, PEPPERSTONE:, CAPITALCOM:, FOREXCOM:).
   - Most symbols below are live CFD prices (tick-by-tick, real time).
     Exchange-index symbols (TSX:, NASDAQ:, BME:, CSELK:) are delayed
     by the exchange (about 15 minutes) under TradingView's free rules.
   ===================================================================== */
window.PULSE_CONFIG = {
  siteName: "Global Markets Pulse - SL Version",   // text after " - " shows as a badge
  tagline: "Live markets · Commodities · Forex · World news",
  timezone: "Asia/Colombo",          // charts & clocks use this timezone
  localClockLabel: "Colombo",

  newsRefreshMinutes: 5,             // how often the page reloads headlines
  // Leave empty: the page works out your GitHub news address by itself.
  // Only fill this if you use a custom domain, e.g.
  // "https://raw.githubusercontent.com/YOUR-NAME/YOUR-REPO/news-data/news.json"
  newsJsonUrl: "",

  /* ---- Scrolling live ticker at the top ---- */
  tickerTape: [
    { proName: "OANDA:SPX500USD", title: "S&P 500" },
    { proName: "OANDA:NAS100USD", title: "Nasdaq 100" },
    { proName: "OANDA:US30USD",  title: "Dow 30" },
    { proName: "OANDA:UK100GBP", title: "FTSE 100" },
    { proName: "OANDA:DE30EUR",  title: "DAX" },
    { proName: "OANDA:JP225USD", title: "Nikkei 225" },
    { proName: "OANDA:HK33HKD",  title: "Hang Seng" },
    { proName: "OANDA:XAUUSD",   title: "Gold" },
    { proName: "OANDA:BCOUSD",   title: "Brent" },
    { proName: "OANDA:WTICOUSD", title: "WTI" },
    { proName: "FX_IDC:USDLKR",  title: "USD/LKR" },
    { proName: "FX_IDC:EURLKR",  title: "EUR/LKR" },
    { proName: "FX:EURUSD",      title: "EUR/USD" },
    { proName: "FX:GBPUSD",      title: "GBP/USD" },
    { proName: "FX:USDJPY",      title: "USD/JPY" },
    { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" }
  ],

  /* ---- Spotlight cards (mini live charts) ---- */
  spotlight: [
    { symbol: "OANDA:SPX500USD", label: "S&P 500" },
    { symbol: "OANDA:XAUUSD",    label: "Gold Spot" },
    { symbol: "OANDA:BCOUSD",    label: "Brent Crude" },
    { symbol: "OANDA:JP225USD",  label: "Nikkei 225" },
    { symbol: "CSELK:ASI",       label: "CSE ASPI" },
    { symbol: "FX_IDC:USDLKR",   label: "USD / LKR" }
  ],

  /* ---- Stock index table (same groups as your Bloomberg list) ---- */
  indices: [
    { name: "Americas", symbols: [
      { name: "OANDA:US30USD",   displayName: "Dow Jones Industrial Avg" },
      { name: "OANDA:SPX500USD", displayName: "S&P 500" },
      { name: "NASDAQ:IXIC",     displayName: "Nasdaq Composite" },
      { name: "OANDA:NAS100USD", displayName: "Nasdaq 100" },
      { name: "NYSE:NYA",        displayName: "NYSE Composite" },
      { name: "TSX:TSX",         displayName: "S&P/TSX Composite" }
    ]},
    { name: "Europe, Middle East & Africa", symbols: [
      { name: "OANDA:EU50EUR",  displayName: "Euro Stoxx 50" },
      { name: "OANDA:UK100GBP", displayName: "FTSE 100" },
      { name: "OANDA:DE30EUR",  displayName: "DAX" },
      { name: "OANDA:FR40EUR",  displayName: "CAC 40" },
      { name: "BME:IBC",        displayName: "IBEX 35" }
    ]},
    { name: "Asia Pacific", symbols: [
      { name: "OANDA:JP225USD", displayName: "Nikkei 225" },
      { name: "OANDA:HK33HKD",  displayName: "Hang Seng" },
      { name: "OANDA:CN50USD",  displayName: "China A50 (CSI 300 proxy)" },
      { name: "OANDA:AU200AUD", displayName: "S&P/ASX 200" },
      { name: "OANDA:IN50USD",  displayName: "India Nifty 50" },
      { name: "CSELK:ASI",      displayName: "Sri Lanka CSE ASPI" }
    ]}
  ],

  /* ---- Commodities table ---- */
  commodities: [
    { name: "Energy", symbols: [
      { name: "OANDA:WTICOUSD",     displayName: "WTI Crude Oil" },
      { name: "OANDA:BCOUSD",       displayName: "Brent Crude" },
      { name: "CAPITALCOM:GASOLINE", displayName: "RBOB Gasoline" },
      { name: "OANDA:NATGASUSD",    displayName: "Natural Gas" },
      { name: "CAPITALCOM:HEATINGOIL", displayName: "Heating Oil" }
    ]},
    { name: "Precious & Industrial Metals", symbols: [
      { name: "OANDA:XAUUSD", displayName: "Gold Spot" },
      { name: "OANDA:XAGUSD", displayName: "Silver" },
      { name: "OANDA:XCUUSD", displayName: "Copper" },
      { name: "OANDA:XPTUSD", displayName: "Platinum Spot" }
    ]},
    { name: "Agriculture", symbols: [
      { name: "OANDA:CORNUSD",     displayName: "Corn" },
      { name: "OANDA:WHEATUSD",    displayName: "Wheat" },
      { name: "CAPITALCOM:COCOA",  displayName: "Cocoa" },
      { name: "SKILLING:COTTON",   displayName: "Cotton" },
      { name: "PEPPERSTONE:CATTLE", displayName: "Live Cattle" }
    ]}
  ],

  /* ---- Forex table ---- */
  forex: [
    { name: "Sri Lankan Rupee (LKR)", symbols: [
      { name: "FX_IDC:USDLKR", displayName: "USD / LKR" },
      { name: "FX_IDC:EURLKR", displayName: "EUR / LKR" },
      { name: "FX_IDC:GBPLKR", displayName: "GBP / LKR" },
      { name: "FX_IDC:JPYLKR", displayName: "JPY / LKR" },
      { name: "FX_IDC:AUDLKR", displayName: "AUD / LKR" },
      { name: "FX_IDC:INRLKR", displayName: "INR / LKR" },
      { name: "FX_IDC:CNYLKR", displayName: "CNY / LKR" },
      { name: "FX_IDC:AEDLKR", displayName: "AED / LKR" }
    ]},
    { name: "Major Pairs", symbols: [
      { name: "CAPITALCOM:DXY", displayName: "US Dollar Index (DXY)" },
      { name: "FX:EURUSD", displayName: "EUR / USD" },
      { name: "FX:GBPUSD", displayName: "GBP / USD" },
      { name: "FX:USDJPY", displayName: "USD / JPY" },
      { name: "FX:USDCHF", displayName: "USD / CHF" },
      { name: "FX:AUDUSD", displayName: "AUD / USD" },
      { name: "FX:USDCAD", displayName: "USD / CAD" },
      { name: "FX:NZDUSD", displayName: "NZD / USD" }
    ]},
    { name: "Asia & Emerging", symbols: [
      { name: "FX_IDC:USDINR", displayName: "USD / INR" },
      { name: "FX:USDCNH",     displayName: "USD / CNH" },
      { name: "FX:USDSGD",     displayName: "USD / SGD" },
      { name: "FX:USDHKD",     displayName: "USD / HKD" },
      { name: "FX_IDC:USDTHB", displayName: "USD / THB" },
      { name: "FX_IDC:USDAED", displayName: "USD / AED" }
    ]}
  ],

  /* ---- Quick buttons above the big chart ---- */
  chartPresets: [
    { symbol: "OANDA:SPX500USD", label: "S&P 500" },
    { symbol: "OANDA:NAS100USD", label: "Nasdaq 100" },
    { symbol: "OANDA:XAUUSD",    label: "Gold" },
    { symbol: "OANDA:BCOUSD",    label: "Brent" },
    { symbol: "OANDA:JP225USD",  label: "Nikkei" },
    { symbol: "OANDA:DE30EUR",   label: "DAX" },
    { symbol: "CSELK:ASI",       label: "ASPI" },
    { symbol: "FX_IDC:USDLKR",   label: "USD/LKR" },
    { symbol: "FX:EURUSD",       label: "EUR/USD" },
    { symbol: "FX:USDJPY",       label: "USD/JPY" }
  ],

  /* ---- World exchanges & trading hours (local exchange time) ---- */
  exchanges: [
    { city: "New York",  code: "NYSE", tz: "America/New_York",  sessions: [["09:30", "16:00"]] },
    { city: "Toronto",   code: "TSX",  tz: "America/Toronto",   sessions: [["09:30", "16:00"]] },
    { city: "London",    code: "LSE",  tz: "Europe/London",     sessions: [["08:00", "16:30"]] },
    { city: "Frankfurt", code: "XETRA", tz: "Europe/Berlin",    sessions: [["09:00", "17:30"]] },
    { city: "Paris",     code: "EPA",  tz: "Europe/Paris",      sessions: [["09:00", "17:30"]] },
    { city: "Mumbai",    code: "NSE",  tz: "Asia/Kolkata",      sessions: [["09:15", "15:30"]] },
    { city: "Colombo",   code: "CSE",  tz: "Asia/Colombo",      sessions: [["09:30", "14:30"]] },
    { city: "Shanghai",  code: "SSE",  tz: "Asia/Shanghai",     sessions: [["09:30", "11:30"], ["13:00", "15:00"]] },
    { city: "Hong Kong", code: "HKEX", tz: "Asia/Hong_Kong",    sessions: [["09:30", "12:00"], ["13:00", "16:00"]] },
    { city: "Tokyo",     code: "TSE",  tz: "Asia/Tokyo",        sessions: [["09:00", "11:30"], ["12:30", "15:30"]] },
    { city: "Sydney",    code: "ASX",  tz: "Australia/Sydney",  sessions: [["10:00", "16:00"]] }
  ]
};
