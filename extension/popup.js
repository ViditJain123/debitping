document.addEventListener("DOMContentLoaded", () => {
  const elEnabled   = document.getElementById("enabled");
  const elEndpoint  = document.getElementById("endpoint");
  const out         = document.getElementById("out");

  // load saved cfg
  chrome.storage.local.get("tallyConfig").then(({ tallyConfig }) => {
    const cfg = tallyConfig || { enabled: true, endpoint: "http://localhost:9000" };
    if (elEnabled)   elEnabled.checked  = cfg.enabled;
    if (elEndpoint)  elEndpoint.value   = cfg.endpoint;
  });

  document.getElementById("save").addEventListener("click", async () => {
    await chrome.storage.local.set({ tallyConfig: {
      enabled: elEnabled?.checked,
      endpoint: (elEndpoint?.value || "http://localhost:9000").trim()
    }});
    out.textContent = "✔ Settings saved";
  });

  document.getElementById("test").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "testTallyConnection", config: { endpoint: elEndpoint.value.trim() } }, (res) => {
      out.textContent = JSON.stringify(res, null, 2);
    });
  });
});
