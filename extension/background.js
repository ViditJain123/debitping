const DEFAULT_CONFIG = { enabled: true, endpoint: "http://localhost:9000" };
const PING_XML = `<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<ENVELOPE>\n <HEADER>\n  <VERSION>1</VERSION>\n  <TALLYREQUEST>Export</TALLYREQUEST>\n  <TYPE>Collection</TYPE>\n  <ID>CompanyList</ID>\n </HEADER>\n <BODY>\n  <DESC>\n   <STATICVARIABLES>\n    <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>\n   </STATICVARIABLES>\n   <TDL>\n    <TDLMESSAGE>\n     <COLLECTION NAME="CompanyList" ISMODIFY="No">\n      <TYPE>Company</TYPE>\n      <NATIVEMETHOD>Name</NATIVEMETHOD>\n      <NATIVEMETHOD>StartingFrom</NATIVEMETHOD>\n     </COLLECTION>\n    </TDLMESSAGE>\n   </TDL>\n  </DESC>\n </BODY>\n</ENVELOPE>`;

chrome.runtime.onInstalled.addListener(async () => {
  const { tallyConfig } = await chrome.storage.local.get("tallyConfig");
  if (!tallyConfig) await chrome.storage.local.set({ tallyConfig: DEFAULT_CONFIG });
});

chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  (async () => {
    switch (req.action) {
      case "getConfig": {
        const { tallyConfig } = await chrome.storage.local.get("tallyConfig");
        sendResponse({ config: tallyConfig || DEFAULT_CONFIG });
        break;
      }
      case "updateConfig": {
        await chrome.storage.local.set({ tallyConfig: req.config });
        sendResponse({ ok: true });
        break;
      }
      case "testTallyConnection": {
        sendResponse(await testTally(req.config));
        break;
      }
      case "clearDiagnostics": {
        await chrome.storage.local.remove("tallyErrorLog");
        sendResponse({ ok: true });
        break;
      }
      case "checkLocalStorage": {
        sendResponse(await checkStorage());
        break;
      }
      default:
        sendResponse({ error: "Unknown action" });
    }
  })();
  return true; // keep message channel open
});

async function testTally({ endpoint } = {}) {
  const { tallyConfig } = await chrome.storage.local.get("tallyConfig");
  const url = endpoint || tallyConfig?.endpoint || DEFAULT_CONFIG.endpoint;
  try {
    const res = await fetchWithTimeout(url, PING_XML, 5000);
    return { connected: res.ok, status: res.status };
  } catch (err) {
    logError(err);
    return { connected: false, error: err.message };
  }
}

function fetchWithTimeout(url, body, timeout) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/xml" },
    body,
    signal: ctrl.signal
  }).finally(() => clearTimeout(timer));
}

async function checkStorage() {
  try {
    const key = "storageTest";
    const val = Date.now();
    await chrome.storage.local.set({ [key]: val });
    const res = await chrome.storage.local.get(key);
    return { working: res[key] === val };
  } catch (err) {
    return { working: false, error: err.message };
  }
}

function logError(err) {
  chrome.storage.local.get("tallyErrorLog").then(({ tallyErrorLog = [] }) => {
    tallyErrorLog.push({ ts: new Date().toISOString(), msg: err.message });
    if (tallyErrorLog.length > 25) tallyErrorLog.shift();
    chrome.storage.local.set({ tallyErrorLog });
  });
}