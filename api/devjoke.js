const SUPABASE_URL = "https://mknsvxajrvdlwqywvlrf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbnN2eGFqcnZkbHdxeXd2bHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzE5ODIsImV4cCI6MjA4MTA0Nzk4Mn0.2urjAD5bb20Y73ZuWffeyfjDjoj7ISsowMRq9iYm-xo";
const STORAGE_BASE = "https://mknsvxajrvdlwqywvlrf.supabase.co/storage/v1/object/public/memes/";
const SITE_BASE = "https://www.donkeyapp.com";
const FALLBACK_IMAGE = SITE_BASE + "/icon-512.png";

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
  const ogTitle = "Shared Joke | Donkey App Comedy";
  const content = (joke && joke.content) ? joke.content : "";
  const hasText = content && content.trim().length > 0;
  const description = hasText
    ? content.replace(/\s+/g, " ").slice(0, 200)
    : (isMeme ? "Donkey App meme" : "Read a shared joke from Donkey App Comedy.");
  const userId = (joke && joke.user_id) ? joke.user_id : "";
  const nameToShow = displayName && displayName.trim() ? displayName : "Anonymous";

  const host = req.headers["x-forwarded-host"] || req.headers.host || "donkeyapp.com";
  const proto = req.headers["x-forwarded-proto"] || "https";
  const pageUrl = proto + "://" + host + "/devjoke?id=" + encodeURIComponent(id);

  const ogImageType = isMeme ? "image/jpeg" : "image/png";
  const ogImageWidth = isMeme ? "1024" : "512";
  const ogImageHeight = isMeme ? "1024" : "512";

  const jokeBootstrap = found
    ? JSON.stringify({ id: joke.id, content: content, user_id: userId, isMeme: isMeme })
        .replace(/</g, "\\u003c")
    : "null";

  const headerNav =
    '<a href="' + SITE_BASE + '/index.html">Home</a>' +
    '<a href="' + SITE_BASE + '/about.html">About</a>' +
    '<a href="' + SITE_BASE + '/favourites.html">Favourites</a>' +
    '<a href="' + SITE_BASE + '/addajoke.html">Add a Joke</a>' +
    '<a href="' + SITE_BASE + '/privacy.html">Privacy</a>' +
    '<a href="' + SITE_BASE + '/conditions.html">Terms</a>' +
    '<a href="' + SITE_BASE + '/cookies.html">Cookies</a>' +
    '<a href="' + SITE_BASE + '/guidelines.html">Guidelines</a>' +
    '<a href="' + SITE_BASE + '/contact.html">Contact</a>';

  let addedByMarkup = "";
  if (found) {
    if (nameToShow === "Anonymous" || !userId) {
      addedByMarkup = '<div id="addedBy" class="addedBy">Added by ' + escapeHtml(nameToShow) + '</div>';
    } else {
      addedByMarkup =
        '<div id="addedBy" class="addedBy">Added by ' +
        '<a class="addedByLink" href="' + SITE_BASE + '/userID.html?userId=' + escapeHtml(userId) + '">' +
        escapeHtml(nameToShow) +
        '</a></div>';
    }
  }

  const memeImgMarkup = isMeme
    ? '<img src="' + escapeHtml(memeImageUrl) + '" alt="Meme" style="width:100%;border-radius:12px;display:block;margin-bottom:16px;" />'
    : '';

  const jokeTextMarkup = hasText
    ? '<div id="jokeText" class="jokeText">' + escapeHtml(content) + '</div>'
    : '';

  const jokeBoxMarkup = found
    ? (
        '<h2 id="jokeHeading">Here is the joke</h2>' +
        '<div id="jokeBox" class="jokeBox" style="display:block;">' +
          memeImgMarkup +
          jokeTextMarkup +
          addedByMarkup +
          '<div class="cardFooter">' +
            '<div class="footerLeft">' +
              '<div id="ratingRow" class="ratingRow"></div>' +
            '</div>' +
            '<div class="footerDivider"></div>' +
            '<div class="footerRight">' +
              '<button id="copyBtn" type="button" class="iconBtn" title="Copy joke" aria-label="Copy joke">' +
                '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
                  '<path d="M8 7.5C8 6.7 8.7 6 9.5 6H18.5C19.3 6 20 6.7 20 7.5V16.5C20 17.3 19.3 18 18.5 18H9.5C8.7 18 8 17.3 8 16.5V7.5Z" stroke="currentColor" stroke-width="2"></path>' +
                  '<path d="M4 11.5C4 10.7 4.7 10 5.5 10H14.5C15.3 10 16 10.7 16 11.5V20.5C16 21.3 15.3 22 14.5 22H5.5C4.7 22 4 21.3 4 20.5V11.5Z" stroke="currentColor" stroke-width="2"></path>' +
                '</svg>' +
              '</button>' +
              '<button id="shareBtn" type="button" class="iconBtn" title="Share joke" aria-label="Share joke">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
                  '<circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"></circle>' +
                  '<circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle>' +
                  '<circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"></circle>' +
                  '<path d="M8.7 10.7L15.3 6.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>' +
                  '<path d="M8.7 13.3L15.3 17.7" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>' +
                '</svg>' +
              '</button>' +
              '<button id="reportBtn" type="button" class="iconBtn" title="Report joke" aria-label="Report joke">⚐</button>' +
            '</div>' +
          '</div>' +
        '</div>'
      )
    : (
        '<h2 id="jokeHeading">Joke unavailable</h2>' +
        '<div id="unavailableBox" class="unavailableBox" style="display:block;">' +
          '<p class="unavailableText">This joke is no longer available.</p>' +
        '</div>'
      );

  const html =
    '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '<meta charset="UTF-8" />\n' +
    '<title>' + escapeHtml(ogTitle) + '</title>\n' +
    '<meta name="description" content="' + escapeHtml(description) + '" />\n' +
    '<meta name="robots" content="noindex,nofollow" />\n' +
    '<link rel="canonical" href="' + escapeHtml(pageUrl) + '" />\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1" />\n' +
    '<meta name="theme-color" content="#0b3d91" />\n' +
    '<meta property="og:type" content="website" />\n' +
    '<meta property="og:url" content="' + escapeHtml(pageUrl) + '" />\n' +
    '<meta property="og:title" content="' + escapeHtml(ogTitle) + '" />\n' +
    '<meta property="og:description" content="' + escapeHtml(description) + '" />\n' +
    '<meta property="og:image" content="' + escapeHtml(ogImage) + '" />\n' +
    '<meta property="og:image:secure_url" content="' + escapeHtml(ogImage) + '" />\n' +
    '<meta property="og:image:type" content="' + ogImageType + '" />\n' +
    '<meta property="og:image:width" content="' + ogImageWidth + '" />\n' +
    '<meta property="og:image:height" content="' + ogImageHeight + '" />\n' +
    '<meta property="og:image:alt" content="Donkey App meme" />\n' +
    '<meta name="twitter:card" content="summary_large_image" />\n' +
    '<meta name="twitter:title" content="' + escapeHtml(ogTitle) + '" />\n' +
    '<meta name="twitter:description" content="' + escapeHtml(description) + '" />\n' +
    '<meta name="twitter:image" content="' + escapeHtml(ogImage) + '" />\n' +
    '<style>\n' +
    ':root{--bg:#f5f7fb;--card:#ffffff;--text:#1e2430;--muted:#5c667a;--accent:#0b3d91;--accent-2:#1f5fd1;--border:#dfe5f0;--danger-bg:#fff4f4;--danger-border:#ffd2d2;--danger-text:#a40000;--shadow:0 10px 30px rgba(11,61,145,0.08);--max:1180px;}\n' +
    '*{box-sizing:border-box;}\n' +
    'html{scroll-behavior:smooth;}\n' +
    'body{margin:0;font-family:Arial,Helvetica,sans-serif;background:linear-gradient(180deg,#f7f9fd 0%,#eef3fb 100%);color:var(--text);line-height:1.65;}\n' +
    'a{color:var(--accent);text-decoration:none;}\n' +
    'a:hover{text-decoration:underline;}\n' +
    'button{font:inherit;}\n' +
    '.topbar{width:100%;background:#ffffffcc;backdrop-filter:blur(10px);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10;}\n' +
    '.topbar-inner{max-width:var(--max);margin:0 auto;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;gap:16px;}\n' +
    '.brand{display:flex;align-items:center;gap:12px;font-weight:700;font-size:20px;color:var(--accent);}\n' +
    '.brand img{width:42px;height:42px;border-radius:10px;}\n' +
    '.nav{display:flex;gap:18px;flex-wrap:wrap;font-size:14px;}\n' +
    '.hero{max-width:var(--max);margin:0 auto;padding:56px 20px 32px;}\n' +
    '.hero-card{background:var(--card);border:1px solid var(--border);border-radius:24px;box-shadow:var(--shadow);overflow:hidden;}\n' +
    '.hero-grid{display:grid;grid-template-columns:1fr;gap:0;}\n' +
    '.hero-right{padding:40px 34px;}\n' +
    '.hero-right h2{margin:0 0 16px;font-size:30px;line-height:1.2;}\n' +
    '.unavailableBox{background:var(--danger-bg);border:1px solid var(--danger-border);color:var(--danger-text);border-radius:18px;padding:18px;}\n' +
    '.unavailableText{margin:0;color:var(--danger-text);font-size:17px;}\n' +
    '.jokeBox{}\n' +
    '.jokeText{font-size:20px;line-height:1.62;color:var(--text);white-space:pre-wrap;word-break:break-word;margin-bottom:16px;}\n' +
    '.addedBy{margin-top:8px;font-size:14px;color:var(--muted);}\n' +
    '.addedByLink{color:var(--accent);font-weight:700;}\n' +
    '.cardFooter{margin-top:18px;display:grid;grid-template-columns:minmax(0,1fr) 1px auto;align-items:stretch;background:#f9fbff;border:1px solid var(--border);border-radius:16px;overflow:hidden;}\n' +
    '.footerLeft{padding:10px;min-width:0;}\n' +
    '.footerDivider{background:var(--border);width:1px;}\n' +
    '.footerRight{display:flex;align-items:center;justify-content:center;gap:10px;padding:8px;}\n' +
    '.ratingRow{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-height:34px;}\n' +
    '.footerLabelInline{font-size:14px;color:#555;margin-right:6px;font-weight:600;}\n' +
    '.ratingEmojiBtn,.iconBtn{border:1px solid #e5e5e5;background:#fff;border-radius:12px;cursor:pointer;min-width:38px;height:34px;display:inline-flex;align-items:center;justify-content:center;line-height:1;transition:background 0.15s ease,transform 0.05s ease;}\n' +
    '.ratingEmojiBtn:hover,.iconBtn:hover{background:#eaeaea;}\n' +
    '.ratingEmojiBtn:active,.iconBtn:active{transform:scale(0.96);}\n' +
    '.ratingEmojiBtn{font-size:20px;width:38px;height:34px;}\n' +
    '.iconBtn{font-size:18px;color:#333;width:38px;height:34px;padding:0;}\n' +
    '.iconBtn svg{width:18px;height:18px;}\n' +
    '#reportBtn{font-size:24px;width:44px;height:38px;font-weight:700;}\n' +
    '.iconBtn.activeReport{color:var(--accent);}\n' +
    '.section{max-width:var(--max);margin:0 auto;padding:0 20px 28px;}\n' +
    '.section-card{background:var(--card);border:1px solid var(--border);border-radius:24px;box-shadow:var(--shadow);padding:30px 34px;text-align:center;}\n' +
    '.section-card h3{margin:0 0 12px;font-size:26px;line-height:1.2;}\n' +
    '.section-card p{margin:0 0 16px;color:var(--muted);font-size:16px;}\n' +
    '.ctaRow{display:flex;justify-content:center;flex-wrap:wrap;gap:12px;margin-top:18px;}\n' +
    '.ctaButton{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 16px;border-radius:999px;border:1px solid var(--border);background:#fff;color:var(--accent);font-weight:700;}\n' +
    '.ctaButton.primary{background:var(--accent);color:#fff;border-color:var(--accent);}\n' +
    '.footer{max-width:var(--max);margin:0 auto;padding:18px 20px 46px;}\n' +
    '.footer-card{background:#fff;border:1px solid var(--border);border-radius:20px;padding:22px 24px;box-shadow:var(--shadow);text-align:center;color:var(--muted);font-size:14px;}\n' +
    '.footer-links{display:flex;justify-content:center;flex-wrap:wrap;gap:14px;margin-top:10px;}\n' +
    '#copyToast{display:none;position:fixed;left:50%;transform:translateX(-50%);bottom:24px;background:rgba(0,0,0,0.88);color:#fff;padding:10px 16px;border-radius:20px;font-size:14px;z-index:10004;white-space:nowrap;max-width:calc(100vw - 24px);overflow:hidden;text-overflow:ellipsis;}\n' +
    '.hidden{display:none !important;}\n' +
    '.modalOverlay{position:fixed;inset:0;background:rgba(0,0,0,0.30);display:none;justify-content:flex-start;padding-top:60px;padding-inline:12px;z-index:10005;}\n' +
    '.modalSheet{width:min(520px,100%);margin:0 auto;background:var(--card);border:1px solid var(--border);border-radius:16px;padding:14px;box-shadow:var(--shadow);}\n' +
    '.modalTitle{font-size:16px;font-weight:700;color:var(--text);margin:0 0 10px 0;}\n' +
    '.modalItem{padding:12px 0;border-top:1px solid #eee;cursor:pointer;}\n' +
    '.modalItemRow{display:flex;align-items:center;justify-content:space-between;gap:10px;}\n' +
    '.modalItemText{font-size:15px;color:var(--text);}\n' +
    '.modalCheck{color:#2e7d32;font-weight:700;}\n' +
    '.reportDivider{height:1px;background:#ddd;margin-top:8px;margin-bottom:4px;}\n' +
    '.reportButtons{display:flex;gap:12px;margin-top:10px;}\n' +
    '.reportButton,.reportCloseButton{flex:1;border:0;min-height:44px;border-radius:10px;cursor:pointer;}\n' +
    '.reportButton{background:#2f71d3;color:#fff;font-weight:700;}\n' +
    '.reportButton:disabled{background:#ccc;cursor:default;}\n' +
    '.reportCloseButton{background:#eee;color:#333;font-weight:700;}\n' +
    '@media (max-width:900px){.hero-grid{grid-template-columns:1fr;}.hero-right h2,.section-card h3{font-size:24px;}.hero-right,.section-card{padding:28px 22px;}}\n' +
    '@media (max-width:640px){.brand{font-size:18px;}.nav{gap:10px;font-size:13px;}.hero{padding-top:28px;}.jokeText{font-size:18px;}.cardFooter{grid-template-columns:1fr;}.footerLeft{display:flex;justify-content:center;padding-bottom:6px;}.ratingRow{justify-content:center;}.footerDivider{display:none;}.footerRight{justify-content:center;border-top:1px solid var(--border);}}\n' +
    '</style>\n' +
    '</head>\n' +
    '<body>\n' +
    '<header class="topbar">' +
      '<div class="topbar-inner">' +
        '<a href="' + SITE_BASE + '/" class="brand" aria-label="Donkey App home">' +
          '<img src="' + SITE_BASE + '/icon-192.png" alt="Donkey App logo" />' +
          '<span>Donkey App</span>' +
        '</a>' +
        '<nav class="nav">' + headerNav + '</nav>' +
      '</div>' +
    '</header>\n' +
    '<main>' +
      '<section class="hero">' +
        '<div class="hero-card"><div class="hero-grid"><div class="hero-right">' +
          jokeBoxMarkup +
        '</div></div></div>' +
      '</section>' +
      '<section class="section">' +
        '<div class="section-card">' +
          '<h3>Want more jokes?</h3>' +
          '<p>Browse the full Donkey App Comedy feed, save favourites, submit your own joke, or download the app.</p>' +
          '<div class="ctaRow">' +
            '<a class="ctaButton primary" href="' + SITE_BASE + '/index.html">Browse jokes</a>' +
            '<a class="ctaButton" href="' + SITE_BASE + '/download.html">Download the app</a>' +
            '<a class="ctaButton" href="' + SITE_BASE + '/addajoke.html">Add a joke</a>' +
          '</div>' +
        '</div>' +
      '</section>' +
    '</main>\n' +
    '<footer class="footer">' +
      '<div class="footer-card">' +
        '<div>© 2026 Donkey App. Comedy first.</div>' +
        '<div class="footer-links">' +
          '<a href="' + SITE_BASE + '/index.html">Home</a>' +
          '<a href="' + SITE_BASE + '/privacy.html">Privacy Policy</a>' +
          '<a href="' + SITE_BASE + '/conditions.html">Terms &amp; Conditions</a>' +
          '<a href="' + SITE_BASE + '/guidelines.html">Community Guidelines</a>' +
          '<a href="' + SITE_BASE + '/contact.html">Contact</a>' +
        '</div>' +
      '</div>' +
    '</footer>\n' +
    '<div id="copyToast"></div>\n' +
    '<div id="reportModal" class="modalOverlay">' +
      '<div class="modalSheet">' +
        '<h2 class="modalTitle">Report joke</h2>' +
        '<div class="modalItem" data-report-reason="offensive"><div class="modalItemRow"><span class="modalItemText">This joke appears to be offensive</span><span class="modalCheck hidden">✓</span></div></div>' +
        '<div class="modalItem" data-report-reason="illegal"><div class="modalItemRow"><span class="modalItemText">This joke is clearly illegal</span><span class="modalCheck hidden">✓</span></div></div>' +
        '<div class="modalItem" data-report-reason="other"><div class="modalItemRow"><span class="modalItemText">Other</span><span class="modalCheck hidden">✓</span></div></div>' +
        '<div class="reportDivider"></div>' +
        '<div class="reportButtons">' +
          '<button id="reportSubmitButton" class="reportButton" type="button" disabled>Report</button>' +
          '<button id="reportCloseButton" class="reportCloseButton" type="button">Close</button>' +
        '</div>' +
      '</div>' +
    '</div>\n' +
    '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n' +
    '<script>\n' +
    'window.__JOKE__ = ' + jokeBootstrap + ';\n' +
    'window.__PAGE_URL__ = "' + escapeHtml(pageUrl).replace(/"/g, '\\"') + '";\n' +
    'document.addEventListener("DOMContentLoaded", function(){\n' +
    '  var joke = window.__JOKE__;\n' +
    '  if (!joke) return;\n' +
    '  var VOTES_KEY = "donkey:votes:v1";\n' +
    '  var ratingOptions = [\n' +
    '    { vote: "bad", emoji: "\\uD83D\\uDE15", title: "Vote bad" },\n' +
    '    { vote: "meh", emoji: "\\uD83D\\uDE10", title: "Vote meh" },\n' +
    '    { vote: "good", emoji: "\\uD83D\\uDE42", title: "Vote good" },\n' +
    '    { vote: "great", emoji: "\\uD83D\\uDE02", title: "Vote great" }\n' +
    '  ];\n' +
    '  var ratingRow = document.getElementById("ratingRow");\n' +
    '  var copyBtn = document.getElementById("copyBtn");\n' +
    '  var shareBtn = document.getElementById("shareBtn");\n' +
    '  var reportBtn = document.getElementById("reportBtn");\n' +
    '  var copyToast = document.getElementById("copyToast");\n' +
    '  var reportModal = document.getElementById("reportModal");\n' +
    '  var reportSubmitButton = document.getElementById("reportSubmitButton");\n' +
    '  var reportCloseButton = document.getElementById("reportCloseButton");\n' +
    '  var votesByJokeId = {};\n' +
    '  var reportReason = null;\n' +
    '  try { votesByJokeId = JSON.parse(localStorage.getItem(VOTES_KEY) || "{}"); } catch(e) { votesByJokeId = {}; }\n' +
    '  var client = (window.supabase && window.supabase.createClient) ? window.supabase.createClient("' + SUPABASE_URL + '","' + SUPABASE_ANON_KEY + '") : null;\n' +
    '  function showToast(msg){ if(!copyToast) return; copyToast.textContent = msg; copyToast.style.display = "block"; clearTimeout(showToast._t); showToast._t = setTimeout(function(){ copyToast.style.display = "none"; }, 2200); }\n' +
    '  function copyPlainText(text){ if(navigator.clipboard && window.isSecureContext){ return navigator.clipboard.writeText(text); } return new Promise(function(resolve,reject){ try { var ta = document.createElement("textarea"); ta.value = text; ta.style.position="fixed"; ta.style.left="-9999px"; document.body.appendChild(ta); ta.select(); var ok = document.execCommand("copy"); document.body.removeChild(ta); ok ? resolve() : reject(new Error("Copy failed")); } catch(e){ reject(e); } }); }\n' +
    '  function buildShareText(){ var url = window.__PAGE_URL__; if (joke.isMeme) { return "Check out this meme on Donkey App Comedy:\\n\\n" + url; } var c = (joke.content || "").trim(); if (!c) return "Found this on Donkey App Comedy:\\n\\n" + url; return "Found this joke on Donkey App Comedy:\\n\\n" + c + "\\n\\nRead it here:\\n" + url; }\n' +
    '  function onCopy(){ var c = (joke.content || "").trim(); var text = c ? c + "\\n\\nFound at donkeyapp.com" : "Donkey App Comedy\\n" + window.__PAGE_URL__; copyPlainText(text).then(function(){ showToast(joke.isMeme ? "Link copied." : "Joke copied. Share it however you want!"); }, function(){ showToast("Copy failed."); }); }\n' +
    '  function onShare(){ var text = buildShareText(); if (navigator.share) { navigator.share({ title: "Donkey App Comedy", text: text }).catch(function(e){ if(e && e.name === "AbortError") return; copyPlainText(text).then(function(){ showToast("Share message copied."); }); }); } else { copyPlainText(text).then(function(){ showToast("Share message copied."); }, function(){ showToast("Share failed."); }); } }\n' +
    '  function renderVoteArea(){ if(!ratingRow) return; ratingRow.innerHTML = ""; if (votesByJokeId[joke.id]) { var label = document.createElement("span"); label.className = "footerLabelInline"; label.textContent = "Your vote:"; var emoji = document.createElement("span"); emoji.textContent = votesByJokeId[joke.id] === "bad" ? "\\uD83D\\uDE15" : votesByJokeId[joke.id] === "meh" ? "\\uD83D\\uDE10" : votesByJokeId[joke.id] === "good" ? "\\uD83D\\uDE42" : "\\uD83D\\uDE02"; emoji.style.fontSize = "22px"; ratingRow.appendChild(label); ratingRow.appendChild(emoji); return; } ratingOptions.forEach(function(opt){ var btn = document.createElement("button"); btn.type = "button"; btn.className = "ratingEmojiBtn"; btn.textContent = opt.emoji; btn.title = opt.title; btn.setAttribute("aria-label", opt.title); btn.addEventListener("click", function(){ onVote(opt.vote); }); ratingRow.appendChild(btn); }); }\n' +
    '  function onVote(vote){ if (votesByJokeId[joke.id]) return; votesByJokeId[joke.id] = vote; try { localStorage.setItem(VOTES_KEY, JSON.stringify(votesByJokeId)); } catch(e){} renderVoteArea(); if (client) { client.rpc("rate_joke", { p_id: joke.id, p_vote: vote }).then(function(r){ if (r && r.error) { showToast("Vote saved locally, but failed to sync."); } }); } }\n' +
    '  function updateReportSelectionUi(){ var items = reportModal.querySelectorAll(".modalItem"); items.forEach(function(item){ var active = item.dataset.reportReason === reportReason; var check = item.querySelector(".modalCheck"); if (active) check.classList.remove("hidden"); else check.classList.add("hidden"); }); reportSubmitButton.disabled = !reportReason; }\n' +
    '  function openReportModal(){ reportReason = null; updateReportSelectionUi(); reportModal.style.display = "flex"; }\n' +
    '  function closeReportModal(){ reportModal.style.display = "none"; reportReason = null; updateReportSelectionUi(); }\n' +
    '  function submitReport(){ if (!reportReason || !client) return; client.rpc("report_joke", { p_joke_id: joke.id, p_reason: reportReason }).then(function(r){ if (r && r.error) { showToast("Report failed. Please try again."); return; } if (reportBtn){ reportBtn.classList.add("activeReport"); reportBtn.textContent = "\\u2691"; } closeReportModal(); showToast("Thank you. Report submitted."); }); }\n' +
    '  if (copyBtn) copyBtn.addEventListener("click", onCopy);\n' +
    '  if (shareBtn) shareBtn.addEventListener("click", onShare);\n' +
    '  if (reportBtn) reportBtn.addEventListener("click", openReportModal);\n' +
    '  if (reportModal) reportModal.addEventListener("click", function(e){ if (e.target === reportModal) closeReportModal(); });\n' +
    '  if (reportModal) reportModal.querySelectorAll(".modalItem").forEach(function(item){ item.addEventListener("click", function(){ reportReason = item.dataset.reportReason; updateReportSelectionUi(); }); });\n' +
    '  if (reportSubmitButton) reportSubmitButton.addEventListener("click", submitReport);\n' +
    '  if (reportCloseButton) reportCloseButton.addEventListener("click", closeReportModal);\n' +
    '  renderVoteArea();\n' +
    '});\n' +
    '</script>\n' +
    '</body>\n' +
    '</html>\n';

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, max-age=60");
  res.statusCode = 200;
  res.end(html);
};
