const SUPABASE_URL = "https://mknsvxajrvdlwqywvlrf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbnN2eGFqcnZkbHdxeXd2bHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzE5ODIsImV4cCI6MjA4MTA0Nzk4Mn0.2urjAD5bb20Y73ZuWffeyfjDjoj7ISsowMRq9iYm-xo";
const STORAGE_BASE = "https://mknsvxajrvdlwqywvlrf.supabase.co/storage/v1/object/public/memes/";
const SITE_BASE = "https://www.donkeyapp.com";
const FALLBACK_IMAGE = "https://donkeyapp.com/icon-512.png";

function escapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function fetchSupabase(path) {
  try {
    const r = await fetch(SUPABASE_URL + path, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY,
        "Accept": "application/json"
      }
    });
    if (!r.ok) return null;
    const arr = await r.json();
    return Array.isArray(arr) ? arr : null;
  } catch (e) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  const id = (req.query && req.query.id ? String(req.query.id) : "").trim();

  if (!id) {
    res.statusCode = 302;
    res.setHeader("Location", "/");
    res.end();
    return;
  }

  let joke = null;
  const jokeRows = await fetchSupabase(
    "/rest/v1/jokes?id=eq." + encodeURIComponent(id) +
    "&select=id,content,user_id,content_type,image_path"
  );
  if (jokeRows && jokeRows.length > 0) joke = jokeRows[0];

  let displayName = null;
  if (joke && joke.user_id) {
    const profileRows = await fetchSupabase(
      "/rest/v1/public_profiles?id=eq." + encodeURIComponent(joke.user_id) +
      "&select=display_name"
    );
    if (profileRows && profileRows.length > 0 && profileRows[0].display_name) {
      displayName = profileRows[0].display_name;
    }
  }

  const found = !!joke;
  const isMeme = !!(joke && joke.content_type === "meme" && joke.image_path);
  const memeImageUrl = isMeme ? STORAGE_BASE + joke.image_path : "";
  const ogImage = isMeme ? memeImageUrl : FALLBACK_IMAGE;
  const ogImageType = isMeme ? "image/jpeg" : "image/png";
  const ogImageWidth = isMeme ? "1024" : "512";
  const ogImageHeight = isMeme ? "1024" : "512";
  const ogTitle = isMeme ? "Shared Meme | Donkey App Comedy" : "Shared Joke | Donkey App Comedy";
  const content = (joke && joke.content) ? joke.content : "";
  const hasText = content && content.trim().length > 0;
  const description = hasText
    ? content.replace(/\s+/g, " ").slice(0, 200)
    : (isMeme ? "Check out this meme on Donkey App Comedy." : "Read a shared joke from Donkey App Comedy.");
  const userId = (joke && joke.user_id) ? joke.user_id : "";
  const nameToShow = displayName && displayName.trim() ? displayName : "Anonymous";

  const host = req.headers["x-forwarded-host"] || req.headers.host || "donkeyapp.com";
  const proto = req.headers["x-forwarded-proto"] || "https";
  const pageUrl = proto + "://" + host + "/joke.html?id=" + encodeURIComponent(id);

  const jokeBootstrap = found
    ? JSON.stringify({ id: joke.id, content: content, user_id: userId, isMeme: isMeme })
        .replace(/</g, "\\u003c")
    : "null";

  // ── Pinned joke card HTML ──────────────────────────────────────────────────

  let addedByMarkup = "";
  if (found) {
    if (nameToShow === "Anonymous" || !userId) {
      addedByMarkup = '<div class="addedBy">Added by Anonymous</div>';
    } else {
      addedByMarkup =
        '<div class="addedBy">Added by ' +
        '<a class="addedByLink" href="/userID.html?userId=' + escapeHtml(userId) + '">' +
        escapeHtml(nameToShow) + '</a></div>';
    }
  }

  const memeImgMarkup = isMeme
    ? '<img src="' + escapeHtml(memeImageUrl) + '" alt="Meme" style="width:100%;border-radius:10px;display:block;margin-bottom:10px;" />'
    : '';

  const jokeTextMarkup = hasText
    ? '<div class="jokeText">' + escapeHtml(content) + '</div>'
    : '';

  const pinnedCardMarkup = found ? (
    '<article class="card pinnedCard" id="pinnedJokeCard">' +
      '<div class="pinnedLabel">📌 Shared with you</div>' +
      memeImgMarkup +
      jokeTextMarkup +
      addedByMarkup +
      '<div class="cardFooter">' +
        '<div class="footerLeft"><div class="ratingRow" id="pinnedRatingRow"></div></div>' +
        '<div class="footerDivider"></div>' +
        '<div class="footerRight" id="pinnedFooterRight"></div>' +
      '</div>' +
    '</article>'
  ) : (
    '<article class="card" style="background:var(--danger-bg);border-color:var(--danger-border);color:var(--danger-text);">' +
      '<p style="margin:0;font-size:17px;">This joke is no longer available.</p>' +
    '</article>'
  );

  // ── Full HTML ──────────────────────────────────────────────────────────────

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(ogTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="noindex,nofollow" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#0b3d91" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />
  <meta property="og:title" content="${escapeHtml(ogTitle)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:type" content="${ogImageType}" />
  <meta property="og:image:width" content="${ogImageWidth}" />
  <meta property="og:image:height" content="${ogImageHeight}" />
  <meta property="og:image:alt" content="Donkey App Comedy" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />

  <script async src="https://www.googletagmanager.com/gtag/js?id=G-F63ZRL5GBH"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag("consent","default",{ad_storage:"denied",analytics_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
    gtag("js", new Date());
    gtag("config","G-F63ZRL5GBH");
  </script>

  <link rel="icon" href="/icon-192.png" type="image/png" />
  <link rel="apple-touch-icon" href="/icon-192.png" />

  <style>
    :root {
      --bg: #efefef;
      --bg-soft: #f5f7fb;
      --card: #ffffff;
      --border: #e2e2e2;
      --border-soft: #dfe5f0;
      --text: #111111;
      --muted: #666666;
      --link: #2f71d3;
      --panel: #fafafa;
      --blue: #0b3d91;
      --blue-2: #1f5fd1;
      --danger-bg: #fff4f4;
      --danger-border: #ffd2d2;
      --danger-text: #a40000;
      --shadow: 0 6px 18px rgba(0,0,0,0.07);
      --header-height: 74px;
      --desktop-left-width: 220px;
      --feed-width: 760px;
      --desktop-right-width: 220px;
      --max: 1240px;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: linear-gradient(180deg,#f7f9fd 0%,#eef3fb 100%); color: var(--text); font-family: Arial,Helvetica,sans-serif; }
    a { color: inherit; text-decoration: none; }
    button, input, select { font: inherit; }
    .sr-only { position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden; }

    /* ── Top bar ── */
    .topBar { position:fixed; top:0; left:0; right:0; min-height:var(--header-height); background:rgba(255,255,255,0.92); backdrop-filter:blur(10px); border-bottom:1px solid var(--border-soft); z-index:10001; }
    .topBarInner { max-width:var(--max); margin:0 auto; min-height:var(--header-height); padding:12px 20px; display:flex; align-items:center; gap:14px; }
    .brandLink { display:flex; align-items:center; gap:12px; color:var(--blue); font-weight:700; flex-shrink:0; }
    .logoWrap { width:42px; min-width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; }
    .logoWrap img { width:42px; height:42px; border-radius:10px; display:block; object-fit:cover; }
    .brandText { font-size:20px; line-height:1; white-space:nowrap; }
    .searchWrap { width:320px; max-width:100%; height:44px; display:flex; align-items:center; background:var(--card); border:1px solid var(--border); border-radius:14px; padding:0 10px; flex-shrink:1; box-shadow:0 2px 8px rgba(11,61,145,0.04); }
    .searchIcon { color:var(--muted); font-size:18px; margin-right:8px; line-height:1; flex-shrink:0; }
    #searchInput { flex:1; min-width:0; border:0; outline:none; background:transparent; font-size:15px; color:var(--text); }
    #searchClear { border:0; background:transparent; color:var(--muted); cursor:pointer; font-size:16px; padding:2px 4px; display:none; flex-shrink:0; }
    .desktopNav { display:flex; align-items:center; gap:16px; margin-left:auto; flex-wrap:wrap; justify-content:flex-end; font-size:14px; }
    .desktopNav a { color:var(--text); }
    .desktopNav a:hover { color:var(--blue); text-decoration:underline; }
    .menuButton { display:none; border:1px solid var(--border); background:var(--card); color:var(--text); height:44px; min-width:44px; border-radius:12px; cursor:pointer; font-size:20px; align-items:center; justify-content:center; flex-shrink:0; }

    /* ── Mobile menu ── */
    .mobileMenuOverlay { position:fixed; inset:0; background:rgba(0,0,0,0.22); display:none; z-index:10000; }
    .mobileMenuPanel { position:absolute; top:calc(var(--header-height) + 8px); right:12px; width:min(320px,calc(100vw - 24px)); background:#fff; border:1px solid var(--border); border-radius:18px; box-shadow:var(--shadow); padding:14px; }
    .mobileMenuTitle { font-size:15px; font-weight:700; margin:0 0 12px; color:var(--text); }
    .mobileMenuSection { margin-bottom:14px; }
    .mobileMenuSelect { width:100%; min-height:44px; border:1px solid var(--border); border-radius:12px; background:#fff; color:var(--text); padding:0 12px; }
    .mobileMenuLinks { display:flex; flex-direction:column; gap:8px; }
    .mobileMenuLink { border:1px solid var(--border); background:#fff; border-radius:12px; min-height:44px; padding:10px 12px; display:flex; align-items:center; color:var(--text); }

    /* ── Layout ── */
    .pageShell { width:100%; min-height:100vh; padding-top:calc(var(--header-height) + 18px); padding-bottom:96px; }
    .layout { max-width:var(--max); margin:0 auto; padding:0 20px; display:grid; grid-template-columns:var(--desktop-left-width) minmax(0,var(--feed-width)) var(--desktop-right-width); gap:16px; align-items:start; justify-content:center; }
    .desktopRail { position:sticky; top:calc(var(--header-height) + 18px); display:block; }
    .railStack { display:flex; flex-direction:column; gap:12px; }
    .railCard { background:var(--card); border:1px solid var(--border); border-radius:18px; padding:14px; box-shadow:var(--shadow); }
    .railTitle { font-size:14px; font-weight:700; color:var(--text); margin:0 0 12px; }
    .langButtonList { display:flex; flex-direction:column; gap:8px; max-height:calc(100vh - 150px); overflow:auto; padding-right:2px; scrollbar-width:none; -ms-overflow-style:none; }
    .langButtonList::-webkit-scrollbar { display:none; }
    .langButton { width:100%; border:1px solid var(--border); background:#fff; border-radius:12px; padding:10px 12px; text-align:left; cursor:pointer; color:var(--text); display:flex; align-items:center; justify-content:space-between; gap:8px; min-height:42px; }
    .langButton.active { border-color:#c9d8f7; background:#eef4ff; color:var(--link); font-weight:700; }
    .utilityLink { width:100%; border:1px solid var(--border); background:#fff; border-radius:12px; padding:12px 14px; text-align:center; color:var(--text); display:flex; align-items:center; justify-content:center; min-height:46px; font-weight:700; }
    .utilityLink:hover { background:#f9fbff; color:var(--blue); }
    .feedColumn { min-width:0; }

    /* ── Pinned card ── */
    .pinnedCard { border:2px solid #c9d8f7 !important; background:#f4f8ff !important; }
    .pinnedLabel { font-size:13px; font-weight:700; color:var(--link); margin-bottom:10px; letter-spacing:0.01em; }

    /* ── Feed cards ── */
    #errorBox { display:none; margin-bottom:12px; padding:10px 12px; background:var(--danger-bg); border:1px solid var(--danger-border); border-radius:14px; color:var(--danger-text); white-space:pre-wrap; box-shadow:var(--shadow); }
    #feed { display:flex; flex-direction:column; gap:12px; }
    .card, .appPromoCard { background:var(--card); border:1px solid var(--border); border-radius:18px; padding:14px; box-shadow:var(--shadow); }
    .recentLabel { font-size:15px; font-style:italic; color:var(--link); margin-bottom:8px; }
    .jokeText { font-size:16px; line-height:1.58; color:var(--text); white-space:pre-wrap; word-break:break-word; }
    .addedBy { margin-top:8px; font-size:13px; color:var(--muted); }
    .addedByLink { color:var(--link); font-weight:700; }
    .cardFooter { margin-top:12px; display:grid; grid-template-columns:minmax(0,1fr) 1px auto; align-items:stretch; background:var(--panel); border:1px solid #e6e6e6; border-radius:14px; overflow:hidden; }
    .footerLeft { padding:10px; min-width:0; }
    .footerDivider { background:#e0e0e0; width:1px; }
    .footerRight { display:flex; align-items:center; justify-content:center; gap:10px; padding:8px; }
    .ratingRow { display:flex; align-items:center; gap:6px; flex-wrap:wrap; min-height:34px; }
    .footerLabelInline { font-size:14px; color:#555; margin-right:6px; font-weight:600; }
    .ratingEmojiBtn, .iconBtn { border:1px solid #e5e5e5; background:#f8f8f8; border-radius:12px; cursor:pointer; min-width:38px; height:34px; display:inline-flex; align-items:center; justify-content:center; line-height:1; transition:background 0.15s ease,transform 0.05s ease; }
    .ratingEmojiBtn:hover, .iconBtn:hover { background:#eaeaea; }
    .ratingEmojiBtn:active, .iconBtn:active { transform:scale(0.96); }
    .ratingEmojiBtn { font-size:20px; width:38px; height:34px; }
    .iconBtn { font-size:18px; color:#333; width:38px; height:34px; padding:0; }
    .iconBtn svg { width:18px; height:18px; }
    .iconBtn.activeFav { color:#d32f2f; }
    .iconBtn.activeReport { color:var(--link); }
    .feedEnd, .feedLoading { text-align:center; color:var(--muted); font-size:14px; padding:14px 0; }
    .hidden { display:none !important; }
    #copyToast { display:none; position:fixed; left:50%; transform:translateX(-50%); bottom:24px; background:rgba(0,0,0,0.88); color:#fff; padding:10px 16px; border-radius:20px; font-size:14px; z-index:10004; white-space:nowrap; max-width:calc(100vw - 24px); overflow:hidden; text-overflow:ellipsis; }
    .appPromoCard { display:none; overflow:hidden; padding:0; }
    .appPromoCard img { display:block; width:100%; height:auto; border:0; border-radius:18px; }

    /* ── Report modal ── */
    .modalOverlay { position:fixed; inset:0; background:rgba(0,0,0,0.30); display:none; justify-content:flex-start; padding-top:60px; padding-inline:12px; z-index:10005; }
    .modalSheet { width:min(520px,100%); margin:0 auto; background:var(--card); border:1px solid var(--border); border-radius:16px; padding:14px; box-shadow:var(--shadow); }
    .modalTitle { font-size:16px; font-weight:700; color:var(--text); margin:0 0 10px; }
    .modalItem { padding:12px 0; border-top:1px solid #eee; cursor:pointer; }
    .modalItemRow { display:flex; align-items:center; justify-content:space-between; gap:10px; }
    .modalItemText { font-size:15px; color:var(--text); }
    .modalCheck { color:#2e7d32; font-weight:700; }
    .reportDivider { height:1px; background:#ddd; margin-top:8px; margin-bottom:4px; }
    .reportButtons { display:flex; gap:12px; margin-top:10px; }
    .reportButton, .reportCloseButton { flex:1; border:0; min-height:44px; border-radius:10px; cursor:pointer; }
    .reportButton { background:#2f71d3; color:#fff; font-weight:700; }
    .reportButton:disabled { background:#ccc; cursor:default; }
    .reportCloseButton { background:#eee; color:#333; font-weight:700; }

    /* ── Cookie consent ── */
    .cookieConsent { position:fixed; bottom:18px; left:12px; right:12px; z-index:10002; display:none; }
    .cookieInner { max-width:980px; margin:0 auto; background:#fff; border:1px solid var(--border); padding:12px; border-radius:16px; box-shadow:var(--shadow); display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; }
    .cookieTitle { font-size:18px; font-weight:700; margin-bottom:6px; }
    .cookieText { font-size:14px; line-height:1.55; }
    .cookieText a { color:var(--link); font-weight:600; }
    .cookieButtons { display:flex; gap:8px; flex-wrap:wrap; align-items:flex-start; }
    .cookieButtons button { border:1px solid var(--border); background:#fff; padding:8px 12px; border-radius:10px; cursor:pointer; }
    #cookieAccept { background:var(--blue); color:#fff; border:none; }

    /* ── App store footer ── */
    .appStoreFooter { display:none; }
    @media (max-width:980px) {
      .appStoreFooter { position:fixed; left:0; right:0; bottom:0; min-height:72px; display:flex; align-items:center; justify-content:center; gap:10px; padding:8px 10px; background:rgba(255,255,255,0.96); border-top:1px solid #ddd; z-index:9998; backdrop-filter:blur(8px); }
    }
    .appStoreFooter a { display:inline-flex; align-items:center; justify-content:center; opacity:0.92; transition:opacity 0.15s ease,transform 0.15s ease; flex:0 1 auto; }
    .appStoreFooter a:hover { opacity:1; transform:translateY(-1px); }
    .appStoreFooter img { height:40px; width:auto; max-width:44vw; display:block; border:0; object-fit:contain; }

    /* ── Responsive ── */
    @media (max-width:1180px) {
      .desktopNav { gap:12px; font-size:13px; }
      .searchWrap { width:260px; }
      .layout { grid-template-columns:200px minmax(0,1fr) 200px; }
    }
    @media (max-width:980px) {
      .topBarInner { padding:12px; }
      .desktopNav { display:none; }
      .menuButton { display:inline-flex; }
      .brandText { display:none; }
      .searchWrap { width:auto; flex:1; }
      .layout { grid-template-columns:1fr; padding:0 12px; }
      .desktopRail { display:none; }
      .feedColumn { width:100%; }
      .appPromoCard { display:block; }
      .appStoreFooter img { height:36px; max-width:43vw; }
    }
    @media (max-width:640px) {
      :root { --header-height:70px; }
      .topBarInner { gap:8px; }
      .logoWrap { width:38px; min-width:38px; height:38px; }
      .logoWrap img { width:38px; height:38px; }
      .searchWrap { height:42px; }
      .menuButton { height:42px; min-width:42px; }
      .card { padding:13px; }
      .cardFooter { grid-template-columns:1fr; }
      .footerLeft { display:flex; justify-content:center; padding-bottom:6px; }
      .ratingRow { justify-content:center; }
      .footerDivider { display:none; }
      .footerRight { justify-content:center; border-top:1px solid #e0e0e0; }
      #copyToast { bottom:18px; }
    }
  </style>
</head>
<body>

<header class="topBar">
  <div class="topBarInner">
    <a href="/" class="brandLink" aria-label="DonkeyApp home">
      <span class="logoWrap"><img src="/icon-512.png" alt="DonkeyApp logo" /></span>
      <span class="brandText">Donkey App</span>
    </a>
    <div class="searchWrap">
      <span class="searchIcon">⌕</span>
      <input id="searchInput" type="text" autocomplete="off" autocapitalize="none" autocorrect="off" enterkeyhint="search" placeholder="Search jokes…" />
      <button id="searchClear" type="button" aria-label="Clear search">✕</button>
    </div>
    <nav class="desktopNav" aria-label="Primary">
      <a href="/">Home</a>
      <a href="/about.html">About</a>
      <a href="/favourites.html">Favourites</a>
      <a href="/addajoke.html">Add a Joke</a>
      <a href="/privacy.html">Privacy</a>
      <a href="/conditions.html">Terms</a>
      <a href="/cookies.html">Cookies</a>
      <a href="/guidelines.html">Guidelines</a>
      <a href="/contact.html">Contact</a>
    </nav>
    <button id="menuButton" class="menuButton" type="button" aria-label="Open menu" aria-expanded="false">☰</button>
  </div>
</header>

<div id="mobileMenuOverlay" class="mobileMenuOverlay">
  <div class="mobileMenuPanel" role="dialog" aria-modal="true" aria-label="Menu">
    <div class="mobileMenuSection">
      <div class="mobileMenuTitle">Language</div>
      <select id="mobileLanguageSelect" class="mobileMenuSelect" aria-label="Select language">
        <option value="English">English</option>
        <option value="Polski">Polski</option>
        <option value="Deutsch">Deutsch</option>
        <option value="Français">Français</option>
        <option value="Español">Español</option>
        <option value="Italiano">Italiano</option>
        <option value="Nederlands">Nederlands</option>
        <option value="Português">Português</option>
        <option value="Svenska">Svenska</option>
        <option value="Dansk">Dansk</option>
        <option value="Suomi">Suomi</option>
        <option value="Norsk">Norsk</option>
        <option value="Čeština">Čeština</option>
        <option value="Slovenčina">Slovenčina</option>
        <option value="Magyar">Magyar</option>
        <option value="Română">Română</option>
        <option value="Hrvatski">Hrvatski</option>
        <option value="Slovenščina">Slovenščina</option>
        <option value="Eesti">Eesti</option>
        <option value="Latviešu">Latviešu</option>
      </select>
    </div>
    <div class="mobileMenuLinks">
      <a class="mobileMenuLink" href="/favourites.html">Favourites</a>
      <a class="mobileMenuLink" href="/addajoke.html">Add a Joke</a>
      <a class="mobileMenuLink" href="/privacy.html">Privacy</a>
      <a class="mobileMenuLink" href="/conditions.html">Terms</a>
      <a class="mobileMenuLink" href="/cookies.html">Cookies</a>
      <a class="mobileMenuLink" href="/guidelines.html">Guidelines</a>
      <a class="mobileMenuLink" href="/about.html">About</a>
      <a class="mobileMenuLink" href="/contact.html">Contact</a>
    </div>
  </div>
</div>

<div class="pageShell">
  <div class="layout">

    <!-- Left rail: languages -->
    <aside class="desktopRail">
      <div class="railCard">
        <div class="railTitle">Language</div>
        <div class="langButtonList">
          <button class="langButton" type="button" data-lang="English"><span>English</span><span>🇬🇧</span></button>
          <button class="langButton" type="button" data-lang="Polski"><span>Polski</span><span>🇵🇱</span></button>
          <button class="langButton" type="button" data-lang="Deutsch"><span>Deutsch</span><span>🇩🇪</span></button>
          <button class="langButton" type="button" data-lang="Français"><span>Français</span><span>🇫🇷</span></button>
          <button class="langButton" type="button" data-lang="Español"><span>Español</span><span>🇪🇸</span></button>
          <button class="langButton" type="button" data-lang="Italiano"><span>Italiano</span><span>🇮🇹</span></button>
          <button class="langButton" type="button" data-lang="Nederlands"><span>Nederlands</span><span>🇳🇱</span></button>
          <button class="langButton" type="button" data-lang="Português"><span>Português</span><span>🇵🇹</span></button>
          <button class="langButton" type="button" data-lang="Svenska"><span>Svenska</span><span>🇸🇪</span></button>
          <button class="langButton" type="button" data-lang="Dansk"><span>Dansk</span><span>🇩🇰</span></button>
          <button class="langButton" type="button" data-lang="Suomi"><span>Suomi</span><span>🇫🇮</span></button>
          <button class="langButton" type="button" data-lang="Norsk"><span>Norsk</span><span>🇳🇴</span></button>
          <button class="langButton" type="button" data-lang="Čeština"><span>Čeština</span><span>🇨🇿</span></button>
          <button class="langButton" type="button" data-lang="Slovenčina"><span>Slovenčina</span><span>🇸🇰</span></button>
          <button class="langButton" type="button" data-lang="Magyar"><span>Magyar</span><span>🇭🇺</span></button>
          <button class="langButton" type="button" data-lang="Română"><span>Română</span><span>🇷🇴</span></button>
          <button class="langButton" type="button" data-lang="Hrvatski"><span>Hrvatski</span><span>🇭🇷</span></button>
          <button class="langButton" type="button" data-lang="Slovenščina"><span>Slovenščina</span><span>🇸🇮</span></button>
          <button class="langButton" type="button" data-lang="Eesti"><span>Eesti</span><span>🇪🇪</span></button>
          <button class="langButton" type="button" data-lang="Latviešu"><span>Latviešu</span><span>🇱🇻</span></button>
        </div>
      </div>
    </aside>

    <!-- Feed column -->
    <section class="feedColumn">
      <div id="errorBox"></div>

      <!-- Pinned shared joke -->
      ${pinnedCardMarkup}

      <div id="feed"></div>
      <div id="feedLoading" class="feedLoading hidden">Loading more jokes…</div>
      <div id="feedEnd" class="feedEnd hidden">No more jokes.</div>
    </section>

    <!-- Right rail -->
    <aside class="desktopRail">
      <div class="railStack">
        <div class="railCard">
          <a href="/addajoke.html" class="utilityLink">➕ Add a Joke</a>
        </div>
        <div class="railCard">
          <a href="/favourites.html" class="utilityLink">❤️ Favourites</a>
        </div>
        <div class="railCard">
          <a href="/download.html" aria-label="Download Donkey App">
            <img src="/appadpt.jpg" alt="Download Donkey App" style="width:100%;border-radius:12px;display:block;" />
          </a>
        </div>
      </div>
    </aside>

  </div>
</div>

<div class="appStoreFooter">
  <a href="https://apps.apple.com/gb/app/donkey-app-comedy/id6760846120" target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store">
    <img src="/appstore.svg" alt="Download on the App Store" />
  </a>
  <a href="https://play.google.com/store/apps/details?id=com.donkeyapp.app" target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play">
    <img src="/googleplay.svg" alt="Get it on Google Play" />
  </a>
</div>

<div id="copyToast"></div>

<div id="reportModal" class="modalOverlay">
  <div class="modalSheet">
    <h2 class="modalTitle">Report joke</h2>
    <div class="modalItem" data-report-reason="offensive"><div class="modalItemRow"><span class="modalItemText">This joke appears to be offensive</span><span class="modalCheck hidden">✓</span></div></div>
    <div class="modalItem" data-report-reason="illegal"><div class="modalItemRow"><span class="modalItemText">This joke is clearly illegal</span><span class="modalCheck hidden">✓</span></div></div>
    <div class="modalItem" data-report-reason="other"><div class="modalItemRow"><span class="modalItemText">Other</span><span class="modalCheck hidden">✓</span></div></div>
    <div class="reportDivider"></div>
    <div class="reportButtons">
      <button id="reportSubmitButton" class="reportButton" type="button" disabled>Report</button>
      <button id="reportCloseButton" class="reportCloseButton" type="button">Close</button>
    </div>
  </div>
</div>

<div id="cookieConsent" class="cookieConsent">
  <div class="cookieInner">
    <div>
      <div class="cookieTitle">Entertainment Notice &amp; Privacy Choices</div>
      <div class="cookieText">
        DonkeyApp is a humour platform created for entertainment purposes. Some content may be considered offensive or controversial.
        Please refer to our <a href="/conditions.html" target="_blank">Terms &amp; Conditions</a> and <a href="/guidelines.html" target="_blank">Community Guidelines</a>.<br><br>
        We and our partners use cookies and similar technologies to store and/or access information on your device.
        See our <a href="/privacy.html" target="_blank">Privacy Policy</a> and <a href="/cookies.html" target="_blank">Cookie Policy</a>.
      </div>
    </div>
    <div class="cookieButtons">
      <button id="cookieAccept">Accept All Cookies</button>
      <button id="cookieReject">Reject All Cookies</button>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
// ── Bootstrap data from server ──────────────────────────────────────────────
window.__PINNED_JOKE__ = ${jokeBootstrap};
window.__PINNED_URL__  = "${escapeHtml(pageUrl).replace(/"/g, '\\"')}";

document.addEventListener("DOMContentLoaded", function () {

  // ── Config ──────────────────────────────────────────────────────────────
  var SUPABASE_URL      = "https://mknsvxajrvdlwqywvlrf.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbnN2eGFqcnZkbHdxeXd2bHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzE5ODIsImV4cCI6MjA4MTA0Nzk4Mn0.2urjAD5bb20Y73ZuWffeyfjDjoj7ISsowMRq9iYm-xo";
  var STORAGE_BASE      = "https://mknsvxajrvdlwqywvlrf.supabase.co/storage/v1/object/public/memes/";
  var PAGE_SIZE         = 20;
  var RECENT_INSERT_EVERY = 4;
  var RECENT_LIMIT      = 20;
  var MOBILE_PROMO_EVERY = 10;
  var FAVOURITES_KEY    = "donkey:favourites:v1";
  var VOTES_KEY         = "donkey:votes:v1";

  var ratingOptions = [
    { vote: "bad",   emoji: "😕", title: "Vote bad"   },
    { vote: "meh",   emoji: "😐", title: "Vote meh"   },
    { vote: "good",  emoji: "🙂", title: "Vote good"  },
    { vote: "great", emoji: "😂", title: "Vote great" }
  ];

  var allLanguages = [
    "English","Polski","Deutsch","Français","Español","Italiano",
    "Nederlands","Português","Svenska","Dansk","Suomi","Norsk",
    "Čeština","Slovenčina","Magyar","Română","Hrvatski",
    "Slovenščina","Eesti","Latviešu"
  ];

  // ── DOM refs ─────────────────────────────────────────────────────────────
  var searchInput         = document.getElementById("searchInput");
  var searchClear         = document.getElementById("searchClear");
  var feed                = document.getElementById("feed");
  var feedLoading         = document.getElementById("feedLoading");
  var feedEnd             = document.getElementById("feedEnd");
  var errorBox            = document.getElementById("errorBox");
  var copyToast           = document.getElementById("copyToast");
  var mobileLanguageSelect= document.getElementById("mobileLanguageSelect");
  var reportModal         = document.getElementById("reportModal");
  var reportSubmitButton  = document.getElementById("reportSubmitButton");
  var reportCloseButton   = document.getElementById("reportCloseButton");
  var menuButton          = document.getElementById("menuButton");
  var mobileMenuOverlay   = document.getElementById("mobileMenuOverlay");

  // ── State ─────────────────────────────────────────────────────────────────
  var currentLang    = "English";
  var searchQuery    = "";
  var mainJokes      = [];
  var recentJokes    = [];
  var finalFeed      = [];
  var cursorCreatedAt= null;
  var cursorId       = null;
  var loading        = false;
  var loadingRecent  = false;
  var hasMore        = true;
  var reportReason   = null;
  var reportJokeId   = null;
  var favouriteIds   = new Set();
  var votesByJokeId  = {};
  var reportedIds    = new Set();
  var pinnedJokeId   = window.__PINNED_JOKE__ ? window.__PINNED_JOKE__.id : null;

  // ── Supabase ──────────────────────────────────────────────────────────────
  if (!window.supabase || !window.supabase.createClient) { return; }
  var client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ── Local state ───────────────────────────────────────────────────────────
  function loadLocalState() {
    try { favouriteIds = new Set(JSON.parse(localStorage.getItem(FAVOURITES_KEY) || "[]")); } catch(e) { favouriteIds = new Set(); }
    try { votesByJokeId = JSON.parse(localStorage.getItem(VOTES_KEY) || "{}"); } catch(e) { votesByJokeId = {}; }
  }
  function saveFavourites() { localStorage.setItem(FAVOURITES_KEY, JSON.stringify(Array.from(favouriteIds))); }
  function saveVotes()      { localStorage.setItem(VOTES_KEY, JSON.stringify(votesByJokeId)); }

  // ── UI helpers ────────────────────────────────────────────────────────────
  function showToast(msg) {
    copyToast.textContent = msg;
    copyToast.style.display = "block";
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function(){ copyToast.style.display = "none"; }, 2200);
  }
  function showError(msg) { errorBox.style.display = "block"; errorBox.textContent = String(msg); }
  function clearError()   { errorBox.style.display = "none";  errorBox.textContent = ""; }

  function updateSearchUi() {
    searchClear.style.display = searchInput.value.trim() ? "inline-flex" : "none";
  }
  function updateLanguageUi() {
    mobileLanguageSelect.value = allLanguages.includes(currentLang) ? currentLang : "English";
    document.querySelectorAll(".langButton").forEach(function(btn){
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });
  }

  // ── Copy / share ──────────────────────────────────────────────────────────
  function copyPlainText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function(resolve, reject){
      try {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly",""); ta.style.position="fixed"; ta.style.left="-9999px";
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error("Copy failed"));
      } catch(e){ reject(e); }
    });
  }

  function getShareUrl(jokeId) {
    return window.location.origin + "/joke.html?id=" + encodeURIComponent(jokeId);
  }

  function onCopyJoke(item) {
    if (item.content_type === "meme") return; // no copy for memes
    var text = item.content.trim() + "\\n\\nFound at donkeyapp.com";
    copyPlainText(text).then(function(){ showToast("Joke copied. Share it however you want!"); },
                             function(){ showToast("Copy failed."); });
  }

  function onShareJoke(item) {
    var shareUrl = getShareUrl(item.id);
    var shareText = item.content_type === "meme"
      ? "Check out this meme on Donkey App 😂\\n" + shareUrl
      : "Found this joke on Donkey App Comedy:\\n\\n" + item.content.trim() + "\\n\\nRead it here:\\n" + shareUrl;

    if (navigator.share) {
      navigator.share({ title: "Donkey App Comedy", text: shareText }).catch(function(e){
        if (e && e.name === "AbortError") return;
        copyPlainText(shareText).then(function(){ showToast("Share message copied."); });
      });
    } else {
      copyPlainText(shareText).then(function(){ showToast("Share message copied."); },
                                    function(){ showToast("Share failed."); });
    }
  }

  // ── Voting ────────────────────────────────────────────────────────────────
  function renderVoteArea(container, jokeId) {
    container.innerHTML = "";
    if (votesByJokeId[jokeId]) {
      var label = document.createElement("span"); label.className = "footerLabelInline"; label.textContent = "Your vote:";
      var emoji = document.createElement("span");
      emoji.textContent = votesByJokeId[jokeId] === "bad" ? "😕" : votesByJokeId[jokeId] === "meh" ? "😐" : votesByJokeId[jokeId] === "good" ? "🙂" : "😂";
      emoji.style.fontSize = "22px";
      container.appendChild(label); container.appendChild(emoji);
      return;
    }
    ratingOptions.forEach(function(opt){
      var btn = document.createElement("button");
      btn.type = "button"; btn.className = "ratingEmojiBtn"; btn.textContent = opt.emoji; btn.title = opt.title;
      btn.addEventListener("click", function(){ onVote(jokeId, opt.vote, container); });
      container.appendChild(btn);
    });
  }

  function onVote(jokeId, vote, voteArea) {
    if (votesByJokeId[jokeId]) return;
    votesByJokeId[jokeId] = vote; saveVotes();
    renderVoteArea(voteArea, jokeId);
    client.rpc("rate_joke", { p_id: jokeId, p_vote: vote }).then(function(r){
      if (r && r.error) showToast("Vote saved locally, but failed to sync.");
    });
  }

  // ── Report ────────────────────────────────────────────────────────────────
  function openReportModal(jokeId) {
    reportJokeId = jokeId; reportReason = null;
    updateReportSelectionUi();
    reportModal.style.display = "flex";
  }
  function closeReportModal() {
    reportModal.style.display = "none"; reportJokeId = null; reportReason = null;
    updateReportSelectionUi();
  }
  function updateReportSelectionUi() {
    reportModal.querySelectorAll(".modalItem").forEach(function(item){
      var active = item.dataset.reportReason === reportReason;
      item.querySelector(".modalCheck").classList.toggle("hidden", !active);
    });
    reportSubmitButton.disabled = !reportReason;
  }
  function submitReport() {
    if (!reportJokeId || !reportReason) return;
    client.rpc("report_joke", { p_joke_id: reportJokeId, p_reason: reportReason }).then(function(r){
      if (r && r.error) { showToast("Report failed. Please try again."); return; }
      reportedIds.add(reportJokeId);
      closeReportModal();
      renderFeed();
      showToast("Thank you. Report submitted.");
    });
  }

  // ── Favourites ────────────────────────────────────────────────────────────
  function toggleFavourite(jokeId) {
    if (favouriteIds.has(jokeId)) { favouriteIds.delete(jokeId); } else { favouriteIds.add(jokeId); }
    saveFavourites(); renderFeed();
  }

  // ── Card builder ──────────────────────────────────────────────────────────
  function buildShareSvg() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"></circle><circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle><circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"></circle><path d="M8.7 10.7L15.3 6.3" stroke="currentColor" stroke-width="2"></path><path d="M8.7 13.3L15.3 17.7" stroke="currentColor" stroke-width="2"></path></svg>';
  }
  function buildCopySvg() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="9" y="9" width="10" height="10" rx="2" stroke="currentColor" stroke-width="2"></rect><rect x="5" y="5" width="10" height="10" rx="2" stroke="currentColor" stroke-width="2"></rect></svg>';
  }

  function createCard(item) {
    var card = document.createElement("article");
    card.className = "card";

    if (item.isRecentlyAdded) {
      var rl = document.createElement("div"); rl.className = "recentLabel"; rl.textContent = "Recently Added";
      card.appendChild(rl);
    }

    if (item.content_type === "meme" && item.image_path) {
      var memeImg = document.createElement("img");
      memeImg.src = STORAGE_BASE + item.image_path;
      memeImg.alt = "Meme"; memeImg.loading = "lazy";
      memeImg.style.cssText = "width:100%;border-radius:10px;display:block;margin-bottom:10px;";
      card.appendChild(memeImg);
    }

    var jokeText = document.createElement("div"); jokeText.className = "jokeText"; jokeText.textContent = item.content || "";
    card.appendChild(jokeText);

    var addedBy = document.createElement("div"); addedBy.className = "addedBy";
    var nameToShow = (item.display_name && item.display_name.trim()) ? item.display_name : "Anonymous";
    if (nameToShow !== "Anonymous" && item.user_id) {
      addedBy.appendChild(document.createTextNode("Added by "));
      var aLink = document.createElement("a"); aLink.className = "addedByLink";
      aLink.href = "/userID.html?userId=" + encodeURIComponent(item.user_id); aLink.textContent = nameToShow;
      addedBy.appendChild(aLink);
    } else {
      addedBy.textContent = "Added by " + nameToShow;
    }
    card.appendChild(addedBy);

    var footer = document.createElement("div"); footer.className = "cardFooter";
    var footerLeft = document.createElement("div"); footerLeft.className = "footerLeft";
    var ratingRow = document.createElement("div"); ratingRow.className = "ratingRow";
    renderVoteArea(ratingRow, item.id);
    footerLeft.appendChild(ratingRow);

    var footerDivider = document.createElement("div"); footerDivider.className = "footerDivider";
    var footerRight = document.createElement("div"); footerRight.className = "footerRight";

    if (item.content_type !== "meme") {
      var copyBtn = document.createElement("button"); copyBtn.type = "button"; copyBtn.className = "iconBtn"; copyBtn.title = "Copy joke"; copyBtn.innerHTML = buildCopySvg();
      copyBtn.addEventListener("click", function(){ onCopyJoke(item); });
      footerRight.appendChild(copyBtn);
    }

    var shareBtn = document.createElement("button"); shareBtn.type = "button"; shareBtn.className = "iconBtn"; shareBtn.title = "Share joke"; shareBtn.innerHTML = buildShareSvg();
    shareBtn.addEventListener("click", function(){ onShareJoke(item); });
    footerRight.appendChild(shareBtn);

    var reportBtn = document.createElement("button"); reportBtn.type = "button"; reportBtn.className = "iconBtn" + (reportedIds.has(item.id) ? " activeReport" : ""); reportBtn.title = "Report joke"; reportBtn.textContent = reportedIds.has(item.id) ? "⚑" : "⚐";
    reportBtn.addEventListener("click", function(){ openReportModal(item.id); });
    footerRight.appendChild(reportBtn);

    var favBtn = document.createElement("button"); favBtn.type = "button"; favBtn.className = "iconBtn" + (favouriteIds.has(item.id) ? " activeFav" : ""); favBtn.title = "Add to favourites"; favBtn.textContent = favouriteIds.has(item.id) ? "♥" : "♡";
    favBtn.addEventListener("click", function(){ toggleFavourite(item.id); });
    footerRight.appendChild(favBtn);

    footer.appendChild(footerLeft); footer.appendChild(footerDivider); footer.appendChild(footerRight);
    card.appendChild(footer);
    return card;
  }

  function createPromoCard() {
    var promo = document.createElement("article"); promo.className = "appPromoCard";
    var link = document.createElement("a"); link.href = "/download.html"; link.setAttribute("aria-label","Download Donkey App");
    var img = document.createElement("img"); img.src = "/appad.jpg"; img.alt = "Download Donkey App on iOS"; img.loading = "lazy";
    link.appendChild(img); promo.appendChild(link);
    return promo;
  }

  // ── Pinned joke interactive setup ─────────────────────────────────────────
  function setupPinnedJoke() {
    var pinned = window.__PINNED_JOKE__;
    if (!pinned) return;

    var ratingRow = document.getElementById("pinnedRatingRow");
    var footerRight = document.getElementById("pinnedFooterRight");
    if (!ratingRow || !footerRight) return;

    renderVoteArea(ratingRow, pinned.id);

    if (!pinned.isMeme) {
      var copyBtn = document.createElement("button"); copyBtn.type = "button"; copyBtn.className = "iconBtn"; copyBtn.title = "Copy joke"; copyBtn.innerHTML = buildCopySvg();
      copyBtn.addEventListener("click", function(){ onCopyJoke({ content: pinned.content, content_type: pinned.isMeme ? "meme" : "joke" }); });
      footerRight.appendChild(copyBtn);
    }

    var shareBtn = document.createElement("button"); shareBtn.type = "button"; shareBtn.className = "iconBtn"; shareBtn.title = "Share joke"; shareBtn.innerHTML = buildShareSvg();
    shareBtn.addEventListener("click", function(){
      var shareUrl = window.__PINNED_URL__;
      var shareText = pinned.isMeme
        ? "Check out this meme on Donkey App 😂\\n" + shareUrl
        : "Found this joke on Donkey App Comedy:\\n\\n" + pinned.content.trim() + "\\n\\nRead it here:\\n" + shareUrl;
      if (navigator.share) {
        navigator.share({ title: "Donkey App Comedy", text: shareText }).catch(function(e){
          if (e && e.name === "AbortError") return;
          copyPlainText(shareText).then(function(){ showToast("Share message copied."); });
        });
      } else {
        copyPlainText(shareText).then(function(){ showToast("Share message copied."); }, function(){ showToast("Share failed."); });
      }
    });
    footerRight.appendChild(shareBtn);

    var reportBtn = document.createElement("button"); reportBtn.type = "button"; reportBtn.className = "iconBtn"; reportBtn.title = "Report joke"; reportBtn.textContent = "⚐";
    reportBtn.addEventListener("click", function(){ openReportModal(pinned.id); });
    footerRight.appendChild(reportBtn);

    var favBtn = document.createElement("button"); favBtn.type = "button"; favBtn.className = "iconBtn" + (favouriteIds.has(pinned.id) ? " activeFav" : ""); favBtn.title = "Add to favourites"; favBtn.textContent = favouriteIds.has(pinned.id) ? "♥" : "♡";
    favBtn.addEventListener("click", function(){
      if (favouriteIds.has(pinned.id)) { favouriteIds.delete(pinned.id); favBtn.textContent = "♡"; favBtn.classList.remove("activeFav"); }
      else { favouriteIds.add(pinned.id); favBtn.textContent = "♥"; favBtn.classList.add("activeFav"); }
      saveFavourites();
    });
    footerRight.appendChild(favBtn);
  }

  // ── Feed mixing ───────────────────────────────────────────────────────────
  function mixFeed(mainRows, recentRows) {
    var maxRecent = Math.min(Math.floor(mainRows.length / RECENT_INSERT_EVERY), recentRows.length);
    var recentPool = recentRows.slice(0, maxRecent).map(function(item){ return Object.assign({}, item, { isRecentlyAdded: true }); });
    var recentIds = new Set(recentPool.map(function(item){ return item.id; }));
    var normalPool = mainRows.filter(function(item){ return !recentIds.has(item.id); });
    var mixed = []; var ni = 0; var ri = 0;
    while (ni < normalPool.length) {
      mixed.push(normalPool[ni]); ni++;
      if (ni % RECENT_INSERT_EVERY === 0 && ri < recentPool.length) { mixed.push(recentPool[ri]); ri++; }
    }
    while (ri < recentPool.length) { mixed.push(recentPool[ri]); ri++; }
    return mixed;
  }

  // ── Render feed ───────────────────────────────────────────────────────────
  function renderFeed() {
    feed.innerHTML = "";
    finalFeed.forEach(function(item, index){
      // Skip the pinned joke if it appears in the feed so it's not shown twice
      if (pinnedJokeId && item.id === pinnedJokeId) return;
      feed.appendChild(createCard(item));
      if ((index + 1) % MOBILE_PROMO_EVERY === 0) feed.appendChild(createPromoCard());
    });
  }

  // ── Data loading ──────────────────────────────────────────────────────────
  async function loadRecentJokes() {
    if (loadingRecent) return;
    loadingRecent = true;
    try {
      var r = await client.rpc("get_recent_jokes_with_names_mixed", { p_language: currentLang, p_limit: RECENT_LIMIT });
      recentJokes = Array.isArray(r.data) ? r.data : [];
    } catch(e) { recentJokes = []; }
    finally { loadingRecent = false; }
  }

  async function loadInitial() {
    clearError();
    loading = true; hasMore = true; cursorCreatedAt = null; cursorId = null;
    mainJokes = []; finalFeed = []; feed.innerHTML = "";
    feedLoading.classList.remove("hidden"); feedEnd.classList.add("hidden");
    try {
      await loadRecentJokes();
      var r = await client.rpc("get_jokes_feed_mixed", {
        p_limit: PAGE_SIZE, p_after_created_at: null, p_after_id: null,
        p_language: currentLang, p_search: searchQuery || null
      });
      if (r.error) throw r.error;
      var rows = Array.isArray(r.data) ? r.data : [];
      mainJokes = rows;
      var last = rows[rows.length - 1];
      cursorCreatedAt = last ? last.created_at : null; cursorId = last ? last.id : null;
      hasMore = rows.length === PAGE_SIZE;
      finalFeed = mixFeed(mainJokes, recentJokes);
      renderFeed();
      feedLoading.classList.add("hidden");
      if (!rows.length) { feedEnd.classList.remove("hidden"); feedEnd.textContent = "No jokes found."; }
      else { feedEnd.classList.toggle("hidden", hasMore); }
    } catch(e) {
      showError((e && e.message) ? e.message : "Error loading jokes.");
      feedLoading.classList.add("hidden");
    } finally { loading = false; }
  }

  async function loadMore() {
    if (loading || !hasMore || !cursorCreatedAt || !cursorId) return;
    loading = true; feedLoading.classList.remove("hidden");
    try {
      var r = await client.rpc("get_jokes_feed_mixed", {
        p_limit: PAGE_SIZE, p_after_created_at: cursorCreatedAt, p_after_id: cursorId,
        p_language: currentLang, p_search: searchQuery || null
      });
      if (r.error) throw r.error;
      var rowsRaw = Array.isArray(r.data) ? r.data : [];
      var knownIds = new Set(mainJokes.map(function(i){ return i.id; }));
      var rows = rowsRaw.filter(function(i){ return !knownIds.has(i.id); });
      mainJokes = mainJokes.concat(rows);
      var last = rowsRaw[rowsRaw.length - 1];
      cursorCreatedAt = last ? last.created_at : null; cursorId = last ? last.id : null;
      hasMore = rowsRaw.length === PAGE_SIZE;
      finalFeed = mixFeed(mainJokes, recentJokes);
      renderFeed();
      if (!hasMore) feedEnd.classList.remove("hidden");
    } catch(e) { console.log("Load more failed:", e); }
    finally { feedLoading.classList.add("hidden"); loading = false; }
  }

  function maybeLoadMoreOnScroll() {
    if (loading || !hasMore) return;
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 900) loadMore();
  }

  // ── Search ────────────────────────────────────────────────────────────────
  function runSearch() {
    var clean = searchInput.value.trim();
    if (!clean) { searchQuery = ""; loadInitial(); return; }
    if (clean.length < 3) { showToast("Please enter at least 3 characters."); return; }
    searchQuery = clean; loadInitial();
  }

  // ── Mobile menu ───────────────────────────────────────────────────────────
  function openMobileMenu()  { mobileMenuOverlay.style.display = "block"; menuButton.setAttribute("aria-expanded","true"); }
  function closeMobileMenu() { mobileMenuOverlay.style.display = "none";  menuButton.setAttribute("aria-expanded","false"); }

  // ── Language switch ───────────────────────────────────────────────────────
  function switchLang(lang) {
    if (!allLanguages.includes(lang)) lang = "English";
    currentLang = lang;
    try { localStorage.setItem("donkey:lang", lang); } catch(e){}
    updateLanguageUi();
    loadInitial();
  }

  // ── Event listeners ───────────────────────────────────────────────────────
  searchInput.addEventListener("input", function(){ updateSearchUi(); if (!searchInput.value) { searchQuery = ""; loadInitial(); } });
  searchInput.addEventListener("keydown", function(e){ if (e.key === "Enter") { e.preventDefault(); runSearch(); } });
  searchClear.addEventListener("click", function(){ searchInput.value = ""; updateSearchUi(); searchQuery = ""; loadInitial(); });

  mobileLanguageSelect.addEventListener("change", function(e){ switchLang(e.target.value); });
  document.querySelectorAll(".langButton").forEach(function(btn){ btn.addEventListener("click", function(){ switchLang(btn.dataset.lang); }); });

  menuButton.addEventListener("click", function(){ mobileMenuOverlay.style.display === "block" ? closeMobileMenu() : openMobileMenu(); });
  mobileMenuOverlay.addEventListener("click", function(e){ if (e.target === mobileMenuOverlay) closeMobileMenu(); });
  mobileMenuOverlay.querySelectorAll("a").forEach(function(link){ link.addEventListener("click", function(){ closeMobileMenu(); }); });

  reportModal.addEventListener("click", function(e){ if (e.target === reportModal) closeReportModal(); });
  reportModal.querySelectorAll(".modalItem").forEach(function(item){ item.addEventListener("click", function(){ reportReason = item.dataset.reportReason; updateReportSelectionUi(); }); });
  reportSubmitButton.addEventListener("click", submitReport);
  reportCloseButton.addEventListener("click", closeReportModal);

  window.addEventListener("scroll", maybeLoadMoreOnScroll, { passive: true });

  // ── Init ──────────────────────────────────────────────────────────────────
  loadLocalState();
  updateSearchUi();

  // Restore saved language
  try { var saved = localStorage.getItem("donkey:lang"); if (saved && allLanguages.includes(saved)) currentLang = saved; } catch(e){}
  updateLanguageUi();

  setupPinnedJoke();
  loadInitial();

}); // end DOMContentLoaded
</script>

<script>
  // ── Cookie consent ─────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function(){
    var consent   = localStorage.getItem("donkey_cookie");
    var cookieBox = document.getElementById("cookieConsent");
    var acceptBtn = document.getElementById("cookieAccept");
    var rejectBtn = document.getElementById("cookieReject");

    function applyConsent(choice) {
      var granted = choice === "accepted";
      gtag("consent", "update", {
        ad_storage:        granted ? "granted" : "denied",
        analytics_storage: granted ? "granted" : "denied",
        ad_user_data:      granted ? "granted" : "denied",
        ad_personalization:granted ? "granted" : "denied"
      });
    }

    if (consent === "accepted" || consent === "rejected") { applyConsent(consent); }
    else { cookieBox.style.display = "block"; }

    acceptBtn.onclick = function(){ localStorage.setItem("donkey_cookie","accepted"); applyConsent("accepted"); cookieBox.style.display = "none"; };
    rejectBtn.onclick = function(){ localStorage.setItem("donkey_cookie","rejected"); applyConsent("rejected"); cookieBox.style.display = "none"; };
  });
</script>

</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=60, max-age=30");
  res.statusCode = 200;
  res.end(html);
};
