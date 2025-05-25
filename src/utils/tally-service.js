// src/TallyService.js – v1.3 (companies normalised)
import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';

export class TallyService {
  constructor(baseUrl = 'http://localhost:9000') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.parser = new XMLParser({ 
      ignoreAttributes: false, 
      attributeNamePrefix: '@_', 
      trimValues: true, 
      parseAttributeValue: true,
      // Add these options to handle text nodes better
      textNodeName: "_text",
      isArray: (name, jpath, isLeafNode, isAttribute) => {
        // Force these elements to always be arrays
        const arrayElements = ['COMPANY', 'LEDGER', 'BILL'];
        return arrayElements.includes(name);
      }
    });
  }
  /* ---------------- private helpers ---------------- */  async #fetchXML(xml, timeout = 10_000) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(this.baseUrl, {
        method: 'POST', headers: { 'Content-Type': 'text/xml' }, body: xml, signal: ctrl.signal
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.statusText}`);
      const responseText = await res.text();
      
      // Check if the response looks like HTML instead of XML
      if (responseText.trim().toLowerCase().startsWith('<!doctype') || 
          responseText.trim().toLowerCase().startsWith('<html')) {
        console.error('HTML response received from Tally instead of XML:', responseText.substring(0, 200) + '...');
        throw new Error('Received HTML instead of XML from Tally. This usually indicates that Tally is not properly configured or the CORS Bridge is not working correctly.');
      }
      
      console.log('Tally API Response:', responseText);
      return responseText;
    } finally { clearTimeout(timer); }
  }
  async #ping(timeout = 4_000) {
    try { 
      const response = await this.#fetchXML(this.getCompanyListRequest(), timeout);
      console.log("Tally Connection Test Response:", response);
      return true; 
    } catch (error) { 
      console.error("Tally Connection Test Failed:", error);
      return false; 
    }
  }
  
  // Helper to sanitize XML objects for React
  #sanitizeForReact(obj) {
    // Handle primitive values
    if (obj === null || obj === undefined) return '';
    if (typeof obj !== 'object') return obj;
    
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => this.#sanitizeForReact(item));
    }
    
    // Handle objects - create a new clean object
    const cleanObj = {};
    
    for (const key in obj) {
      // Skip XML special properties
      if (key === '#text' || key === '_text' || key.startsWith('@_')) continue;
      
      // Recursively sanitize nested objects
      cleanObj[key] = this.#sanitizeForReact(obj[key]);
    }
    
    return cleanObj;
  }
  /* ---------------- public API ---------------- */
  async isTallyAvailable(t = 4_000) { return this.#ping(t); }  async sendRequest(xml, timeout = 10_000) {
    if (!xml) throw new Error('XML request cannot be empty');
    if (!(await this.isTallyAvailable())) throw new Error(`Cannot reach Tally at ${this.baseUrl}`);
    console.log('Tally API Request:', xml);
    const txt = await this.#fetchXML(xml, timeout);
    
    // Parse the XML and then sanitize it to remove problematic XML properties
    try {
      const parsed = this.parser.parse(txt);
      console.log('Tally API Parsed Response:', parsed);
      // Apply the sanitization before returning the result
      return this.#sanitizeForReact(parsed);
    } catch (error) {
      console.error('Error parsing XML response:', error);
      console.error('Raw XML that failed to parse:', txt);
      throw new Error(`Failed to parse Tally XML response: ${error.message}`);
    }
  }
  
  // --- updated: always return array of { NAME: string, ... }
  async getCompanies() {
    const env = await this.sendRequest(this.getCompanyListRequest());
    
    // Log the full response for debugging
    console.log('Company list full response:', JSON.stringify(env, null, 2));
    
    // The new format has companies in ENVELOPE.BODY.DATA.COLLECTION.COMPANY
    const raw = env?.ENVELOPE?.BODY?.DATA?.COLLECTION?.COMPANY;
    
    // Ensure we have an array, even if empty
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
    console.log('Company list extracted:', list);
    
    return list.map(c => {
      // For string entries, just return a simple object
      if (typeof c === 'string') return { NAME: c };
      
      // For object entries, extract the name from various possible formats
      let name = '';
      if (typeof c.NAME === 'string') {
        name = c.NAME;
      } else if (typeof c.NAME === 'object' && c.NAME?._text) {
        // Handle the new format where NAME might be an object with _text property
        name = c.NAME._text;
      } else if (c['@_NAME']) {
        // Handle attribute-based name
        name = String(c['@_NAME']);
      } else if (c['@_COMPANY']) {
        name = String(c['@_COMPANY']);
      }
      
      // Extract starting date if available
      let startingFrom = '';
      if (c.STARTINGFROM && typeof c.STARTINGFROM === 'object' && c.STARTINGFROM._text) {
        startingFrom = c.STARTINGFROM._text;
      } else if (typeof c.STARTINGFROM === 'string') {
        startingFrom = c.STARTINGFROM;
      }
      
      // Create a clean object with NAME and additional info
      return { 
        NAME: name,
        STARTINGFROM: startingFrom
      };
    });
  }
  async getLedgers(company) {
    const env = await this.sendRequest(this.getLedgersRequest(company));
    const raw = env?.ENVELOPE?.BODY?.DATA?.COLLECTION?.LEDGER;
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
    
    // Clean up the ledgers to ensure they don't have problematic XML attributes
    return list.map(ledger => {
      if (typeof ledger !== 'object' || ledger === null) return { NAME: String(ledger) };
      
      // Create a clean object with just the main properties we need
      const cleanLedger = {};
      
      // Copy standard properties we know we need
      if ('NAME' in ledger) cleanLedger.NAME = typeof ledger.NAME === 'string' ? ledger.NAME : String(ledger.NAME);
      if ('PARENT' in ledger) cleanLedger.PARENT = typeof ledger.PARENT === 'string' ? ledger.PARENT : String(ledger.PARENT);
      if ('LEDSTATENAME' in ledger) cleanLedger.LEDSTATENAME = typeof ledger.LEDSTATENAME === 'string' ? ledger.LEDSTATENAME : String(ledger.LEDSTATENAME);
      
      // Copy any other properties that aren't XML-specific (don't start with @_)
      Object.keys(ledger).forEach(key => {
        if (!key.startsWith('@_') && !key.startsWith('#') && !(key in cleanLedger)) {
          // Convert complex objects to strings if necessary
          if (typeof ledger[key] === 'object' && ledger[key] !== null) {
            cleanLedger[key] = JSON.stringify(ledger[key]);
          } else {
            cleanLedger[key] = ledger[key];
          }
        }
      });
      
      return cleanLedger;
    });
  }
  async getOutstandingBills(company) {
    const env = await this.sendRequest(this.getOutstandingBillsRequest(company));
    const raw = env?.ENVELOPE?.BODY?.DATA?.COLLECTION?.BILL;
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
    
    // Clean up the bills to ensure they don't have problematic XML attributes
    return list.map(bill => {
      if (typeof bill !== 'object' || bill === null) return { BILLREF: String(bill) };
      
      // Create a clean object with just the main properties we need
      const cleanBill = {};
      
      // Copy standard properties we know we need
      if ('BILLREF' in bill) cleanBill.BILLREF = typeof bill.BILLREF === 'string' ? bill.BILLREF : String(bill.BILLREF);
      if ('BILLDATE' in bill) cleanBill.BILLDATE = typeof bill.BILLDATE === 'string' ? bill.BILLDATE : String(bill.BILLDATE);
      if ('AMOUNT' in bill) cleanBill.AMOUNT = typeof bill.AMOUNT === 'number' ? bill.AMOUNT : Number(bill.AMOUNT) || 0;
      if ('PARTYLEDGERNAME' in bill) cleanBill.PARTYLEDGERNAME = typeof bill.PARTYLEDGERNAME === 'string' ? bill.PARTYLEDGERNAME : String(bill.PARTYLEDGERNAME);
      
      // Copy any other properties that aren't XML-specific (don't start with @_)
      Object.keys(bill).forEach(key => {
        if (!key.startsWith('@_') && !key.startsWith('#') && !(key in cleanBill)) {
          // Convert complex objects to strings if necessary
          if (typeof bill[key] === 'object' && bill[key] !== null) {
            cleanBill[key] = JSON.stringify(bill[key]);
          } else {
            cleanBill[key] = bill[key];
          }
        }
      });
      
      return cleanBill;
    });
  }
  processDealerData(ledgers = [], bills = []) {
    // First ensure ledgers and bills are arrays
    const ledgersArray = Array.isArray(ledgers) ? ledgers : [];
    const billsArray = Array.isArray(bills) ? bills : [];
    
    // Filter debtors - ensure PARENT check is safe
    const debtors = ledgersArray.filter(l => typeof l === 'object' && l !== null && l.PARENT === 'Sundry Debtors');
    
    return debtors.map(lg => {
      // Safely extract phone number
      const ledgerStateName = typeof lg.LEDSTATENAME === 'string' ? lg.LEDSTATENAME : '';
      const phone = ledgerStateName.match(/\d{10,14}/)?.[0] || '';
      
      // Ensure NAME is a string for comparison
      const ledgerName = typeof lg.NAME === 'string' ? lg.NAME : '';
      
      // Find matching bills - ensure safe comparison
      const dealerBills = billsArray.filter(b => 
        typeof b === 'object' && b !== null && 
        typeof b.PARTYLEDGERNAME === 'string' && 
        b.PARTYLEDGERNAME === ledgerName
      );
      
      // Calculate total amount safely
      const amount = dealerBills.reduce((s, b) => {
        const billAmount = typeof b.AMOUNT === 'number' ? b.AMOUNT : Number(b.AMOUNT) || 0;
        return s + billAmount;
      }, 0);
      
      // Build clean outstanding bills objects
      const cleanBills = dealerBills.map(b => ({
        billNumber: typeof b.BILLREF === 'string' ? b.BILLREF : String(b.BILLREF) || '',
        billDate: typeof b.BILLDATE === 'string' ? b.BILLDATE : String(b.BILLDATE) || '',
        billAmount: typeof b.AMOUNT === 'number' ? b.AMOUNT : Number(b.AMOUNT) || 0
      }));
      
      // Return clean dealer object
      return {
        companyName: ledgerName,
        phoneNumber: phone ? `+${phone}` : '',
        amount,
        outstandingBills: cleanBills
      };
    });
  }

  /* ---------------- XML builders ---------------- */  getCompanyListRequest() {
    return `<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Collection</TYPE>
    <ID>CompanyList</ID>          
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
      <TDL>
        <TDLMESSAGE>
          <COLLECTION NAME="CompanyList" ISMODIFY="No">
            <TYPE>Company</TYPE>          <!-- built-in object -->
            <NATIVEMETHOD>Name</NATIVEMETHOD>
            <NATIVEMETHOD>StartingFrom</NATIVEMETHOD>
          </COLLECTION>
        </TDLMESSAGE>
      </TDL>
    </DESC>
  </BODY>
</ENVELOPE>`;
  }

  getLedgersRequest(company) {
    return `<?xml version="1.0"?><ENVELOPE><HEADER><VERSION>1</VERSION><TALLYREQUEST>Export</TALLYREQUEST><TYPE>Collection</TYPE><ID>List of Ledgers</ID></HEADER><BODY><DESC><STATICVARIABLES><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT><COMPANYNAME>${company}</COMPANYNAME></STATICVARIABLES></DESC></BODY></ENVELOPE>`;
  }
  getOutstandingBillsRequest(company) {
    return `<?xml version="1.0"?><ENVELOPE><HEADER><VERSION>1</VERSION><TALLYREQUEST>Export</TALLYREQUEST><TYPE>Collection</TYPE><ID>Bills Outstanding</ID></HEADER><BODY><DESC><STATICVARIABLES><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT><COMPANYNAME>${company}</COMPANYNAME></STATICVARIABLES></DESC></BODY></ENVELOPE>`;
  }
}

export default new TallyService();
