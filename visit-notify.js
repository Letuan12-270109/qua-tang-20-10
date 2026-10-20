/*
 * Telegram visit notifications.
 * Set WORKER_ENDPOINT to your deployed Cloudflare Worker URL + /visit.
 * Never put a Telegram bot token in this public file.
 */
(() => {
  "use strict";
  const WORKER_ENDPOINT = "https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/visit";
  if (window.__visitNotifyInstalled) return;
  window.__visitNotifyInstalled = true;

  function getClientHints() {
    const ua = navigator.userAgent || "";
    let device = "Không xác định";
    if (/Android/i.test(ua)) device = "Android";
    else if (/iPhone|iPad|iPod/i.test(ua)) device = "iPhone/iPad";
    else if (/Windows/i.test(ua)) device = "Windows PC";
    else if (/Macintosh|Mac OS X/i.test(ua)) device = "Mac";
    else if (/Linux/i.test(ua)) device = "Linux PC";

    let browser = "Không xác định";
    if (/Edg\//i.test(ua)) browser = "Microsoft Edge";
    else if (/OPR\//i.test(ua)) browser = "Opera";
    else if (/Firefox\//i.test(ua)) browser = "Firefox";
    else if (/CriOS|Chrome\//i.test(ua)) browser = "Chrome";
    else if (/Safari\//i.test(ua)) browser = "Safari";

    return { device, browser, userAgent: ua.slice(0, 300) };
  }

  function sendVisit() {
    if (WORKER_ENDPOINT.includes("YOUR-WORKER")) {
      console.warn("[visit-notify] Configure WORKER_ENDPOINT in visit-notify.js.");
      return;
    }
    const hint = getClientHints();
    let referrer = "";
    try { referrer = document.referrer ? new URL(document.referrer).hostname : ""; }
    catch (_) {}
    fetch(WORKER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: location.pathname,
        referrer,
        time: new Date().toISOString(),
        device: hint.device,
        browser: hint.browser,
        userAgent: hint.userAgent,
        language: navigator.language || ""
      }),
      credentials: "omit",
      referrerPolicy: "no-referrer",
      keepalive: true
    }).catch(() => {});
  }

  if (document.readyState === "complete") sendVisit();
  else window.addEventListener("load", sendVisit, { once: true });
})();
