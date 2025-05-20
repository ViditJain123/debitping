(function () {
  class TallyAPI {
    sendRequest(xml) {
      return new Promise((resolve, reject) => {
        const id = "tally_" + Math.random().toString(36).slice(2);
        const handler = (ev) => {
          if (ev.source !== window || ev.data?.id !== id) return;
          window.removeEventListener("message", handler);
          if (ev.data.error) return reject(new Error(ev.data.error.message));
          resolve(ev.data.data);
        };
        window.addEventListener("message", handler);
        window.postMessage({ type: "TALLY_API_REQUEST", id, payload: xml }, "*");
      });
    }

    static companyListXML() {
      return `<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<ENVELOPE>\n <HEADER>\n  <VERSION>1</VERSION>\n  <TALLYREQUEST>Export</TALLYREQUEST>\n  <TYPE>Collection</TYPE>\n  <ID>List of Companies</ID>\n </HEADER>\n <BODY/>\n</ENVELOPE>`;
    }
  }
  window.TallyAPI = TallyAPI;
})();