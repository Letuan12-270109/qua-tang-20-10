/*
 * Cloudflare Worker: forwards website visits to Telegram.
 * Worker Settings > Variables and Secrets:
 *   TELEGRAM_BOT_TOKEN = NEW bot token stored as a Secret
 *   TELEGRAM_CHAT_ID = 8272244464
 *   ALLOWED_ORIGIN = exact published website origin
 * Example ALLOWED_ORIGIN: https://letuan12-270109.github.io
 * Configure Cloudflare rate limiting for /visit.
 */
const cors = origin => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin"
});
const clean = (v, n = 250) => typeof v === "string"
  ? v.slice(0, n).replace(/[\r\n]/g, "") : "";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (!env.ALLOWED_ORIGIN || origin !== env.ALLOWED_ORIGIN)
      return new Response("Forbidden", { status: 403 });

    const headers = cors(env.ALLOWED_ORIGIN);
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    if (request.method !== "POST")
      return new Response("Method Not Allowed", { status: 405, headers });

    let data;
    try { data = await request.json(); }
    catch { return new Response("Bad Request", { status: 400, headers }); }

    // Cloudflare supplies this header for the connecting client IP.
    const ip = request.headers.get("CF-Connecting-IP") || "Không có sẵn";
    const page = clean(data.page, 200) || "/";
    const referrer = clean(data.referrer, 120);
    const time = clean(data.time, 40) || new Date().toISOString();
    const device = clean(data.device, 80) || "Không xác định";
    const browser = clean(data.browser, 80) || "Không xác định";
    const ua = clean(data.userAgent, 300) || "Không có";
    const language = clean(data.language, 30) || "Không có";

    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID)
      return new Response("Worker not configured", { status: 500, headers });

    const message = [
      "🔔 LƯỢT TRUY CẬP WEBSITE",
      `🌐 IP: ${ip}`,
      `📱 Thiết bị (ước lượng): ${device}`,
      `🧭 Trình duyệt: ${browser}`,
      `📄 Trang: ${page}`,
      `🕒 Thời gian: ${time}`,
      `🌍 Ngôn ngữ: ${language}`,
      referrer ? `🔗 Nguồn: ${referrer}` : "🔗 Nguồn: trực tiếp/không cung cấp",
      `ℹ️ User-Agent: ${ua}`
    ].join("\n");

    const response = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: message,
          disable_web_page_preview: true
        })
      }
    );
    if (!response.ok)
      return new Response("Telegram delivery failed", { status: 502, headers });
    return new Response("OK", { status: 200, headers });
  }
};
