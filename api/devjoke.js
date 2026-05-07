const SUPABASE_URL = "https://mknsvxajrvdlwqywvlrf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbnN2eGFqcnZkbHdxeXd2bHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzE5ODIsImV4cCI6MjA4MTA0Nzk4Mn0.2urjAD5bb20Y73ZuWffeyfjDjoj7ISsowMRq9iYm-xo";
const STORAGE_BASE = "https://mknsvxajrvdlwqywvlrf.supabase.co/storage/v1/object/public/memes/";
const FALLBACK_IMAGE = "https://www.donkeyapp.com/icon-512.png";

function escapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
  try {
    const url = SUPABASE_URL +
      "/rest/v1/jokes?id=eq." + encodeURIComponent(id) +
      "&select=id,content,user_id,content_type,image_path";
    const r = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY
      }
    });
    if (r.ok) {
      const arr = await r.json();
      if (Array.isArray(arr) && arr.length > 0) joke = arr[0];
    }
  } catch (e) {
    // ignore, treat as not found
  }

  const isMeme = !!(joke && joke.content_type === "meme" && joke.image_path);
  const memeImageUrl = isMeme ? STORAGE_BASE + joke.image_path : "";
  const ogImage = isMeme ? memeImageUrl : FALLBACK_IMAGE;
  const ogTitle = "Shared Joke | Donkey App Comedy";
  const ogDescription = (joke && joke.content)
    ? joke.content.replace(/\s+/g, " ").slice(0, 200)
    : "Read a shared joke from Donkey App Comedy.";

  const host = req.headers["x-forwarded-host"] || req.headers.host || "donkeyapp.com";
  const proto = req.headers["x-forwarded-proto"] || "https";
  const pageUrl = proto + "://" + host + "/api/devjoke?id=" + encodeURIComponent(id);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, max-age=60");
  res.statusCode = 200;

  res.end(
    "<!DOCTYPE html>\n" +
    "<html lang=\"en\">\n" +
    "<head>\n" +
    "<meta charset=\"UTF-8\" />\n" +
    "<title>" + escapeHtml(ogTitle) + "</title>\n" +
    "<meta name=\"description\" content=\"" + escapeHtml(ogDescription) + "\" />\n" +
    "<meta name=\"robots\" content=\"noindex,nofollow\" />\n" +
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n" +
    "<meta name=\"theme-color\" content=\"#0b3d91\" />\n" +
    "<meta property=\"og:type\" content=\"website\" />\n" +
    "<meta property=\"og:url\" content=\"" + escapeHtml(pageUrl) + "\" />\n" +
    "<meta property=\"og:title\" content=\"" + escapeHtml(ogTitle) + "\" />\n" +
    "<meta property=\"og:description\" content=\"" + escapeHtml(ogDescription) + "\" />\n" +
    "<meta property=\"og:image\" content=\"" + escapeHtml(ogImage) + "\" />\n" +
    "<meta property=\"og:image:secure_url\" content=\"" + escapeHtml(ogImage) + "\" />\n" +
    "<meta property=\"og:image:type\" content=\"" + (isMeme ? "image/jpeg" : "image/png") + "\" />\n" +
    "<meta property=\"og:image:width\" content=\"" + (isMeme ? "1024" : "512") + "\" />\n" +
    "<meta property=\"og:image:height\" content=\"" + (isMeme ? "1024" : "512") + "\" />\n" +
    "<meta property=\"og:image:alt\" content=\"Donkey App meme\" />\n" +
    "<meta name=\"twitter:card\" content=\"summary_large_image\" />\n" +
    "<meta name=\"twitter:title\" content=\"" + escapeHtml(ogTitle) + "\" />\n" +
    "<meta name=\"twitter:description\" content=\"" + escapeHtml(ogDescription) + "\" />\n" +
    "<meta name=\"twitter:image\" content=\"" + escapeHtml(ogImage) + "\" />\n" +
    "<style>\n" +
    "  body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 24px; background: linear-gradient(180deg,#f7f9fd 0%,#eef3fb 100%); color: #1e2430; min-height: 100vh; }\n" +
    "  .wrap { max-width: 720px; margin: 0 auto; background: #fff; border: 1px solid #dfe5f0; border-radius: 18px; padding: 24px; box-shadow: 0 10px 30px rgba(11,61,145,0.08); }\n" +
    "  h1 { font-size: 22px; margin: 0 0 14px; color: #0b3d91; }\n" +
    "  .meme { width: 100%; border-radius: 12px; display: block; margin-bottom: 16px; }\n" +
    "  .text { font-size: 18px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }\n" +
    "  .cta { margin-top: 18px; text-align: center; }\n" +
    "  .cta a { display: inline-block; padding: 10px 16px; border-radius: 999px; background: #0b3d91; color: #fff; text-decoration: none; font-weight: 700; }\n" +
    "</style>\n" +
    "</head>\n" +
    "<body>\n" +
    "<div class=\"wrap\">\n" +
    "  <h1>Donkey App Comedy</h1>\n" +
    (isMeme ? "  <img class=\"meme\" src=\"" + escapeHtml(memeImageUrl) + "\" alt=\"Meme\" />\n" : "") +
    "  <div class=\"text\">" + (joke && joke.content ? escapeHtml(joke.content) : "This joke is no longer available.") + "</div>\n" +
    "  <div class=\"cta\"><a href=\"https://www.donkeyapp.com/\">Browse more on Donkey App</a></div>\n" +
    "</div>\n" +
    "</body>\n" +
    "</html>\n"
  );
};
