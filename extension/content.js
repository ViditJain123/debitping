(() => {
  const DEFAULT = { enabled: true, endpoint: "http://localhost:9000" };

  // Inject helper library into page context
  const s = document.createElement("script");
  s.src = chrome.runtime.getURL("tally-api.js");
  (document.head || document.documentElement).appendChild(s);
  s.onload = () => s.remove();

  // Tell the page we are alive
  window.postMessage({ type: "TALLY_EXTENSION_READY", ts: Date.now() }, "*");

  window.addEventListener("message", async (ev) => {
    if (ev.source !== window || ev.data?.type !== "TALLY_API_REQUEST") return;
    const { id, payload } = ev.data;

    const { tallyConfig } = await chrome.storage.local.get("tallyConfig");
    const { enabled, endpoint } = tallyConfig || DEFAULT;

    if (!enabled) {
      window.postMessage({ type: "TALLY_API_RESPONSE", id, error: { message: "Bridge disabled" } }, "*");
      return;
    }

    try {
      const res = await fetchWithTimeout(endpoint, payload, 15000);
      const txt = await res.text();
      window.postMessage({ type: "TALLY_API_RESPONSE", id, data: txt }, "*");
    } catch (e) {
      window.postMessage({ type: "TALLY_API_RESPONSE", id, error: { message: e.message } }, "*");
    }
  });

  function fetchWithTimeout(url, body, timeout) {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), timeout);
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/xml" },
      body,
      signal: c.signal
    }).finally(() => clearTimeout(t));
  }
})();