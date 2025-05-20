// Tally API utility for server-side operations
import { XMLParser } from 'fast-xml-parser';
import fetch from 'node-fetch';

/**
 * Class to handle Tally API operations
 */
export class TallyService {
  constructor(baseUrl = 'http://localhost:9000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Check if Tally is available at the configured endpoint
   * @returns {Promise<boolean>} True if Tally is available, false otherwise
   */
  async isTallyAvailable() {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'HEAD',
        timeout: 3000 // 3 second timeout
      });
      
      return response.ok;
    } catch (error) {
      console.error('Tally availability check failed:', error.message);
      return false;
    }
  }

  /**
   * Send an XML request to Tally
   * @param {string} xmlRequest The XML request to send
   * @returns {Promise<Object>} The parsed XML response
   * @throws {Error} If the request fails
   */
  async sendRequest(xmlRequest) {
    try {
      // Check connection before sending
      if (!(await this.isTallyAvailable())) {
        throw new Error(`Cannot connect to Tally server at ${this.baseUrl}`);
      }

      // Send the request
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml'
        },
        body: xmlRequest,
        timeout: 10000 // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status} ${response.statusText}`);
      }

      const xmlData = await response.text();
      
      // Parse XML to JavaScript object
      const options = {
        attributeNamePrefix: '@_',
        ignoreAttributes: false,
        parseAttributeValue: true,
        trimValues: true
      };
      
      const parser = new XMLParser(options);
      const result = parser.parse(xmlData);
      return result;
    } catch (error) {
      console.error('Error sending request to Tally:', error);
      throw error;
    }
  }

  /**
   * Get a list of companies from Tally
   * @returns {Promise<Array>} List of companies
   */
  async getCompanies() {
    const request = this.getCompanyListRequest();
    const response = await this.sendRequest(request);
    
    // Process the response to extract companies
    if (response && response.ENVELOPE && response.ENVELOPE.BODY && 
        response.ENVELOPE.BODY.DATA && response.ENVELOPE.BODY.DATA.COLLECTION) {
      return response.ENVELOPE.BODY.DATA.COLLECTION;
    }
    
    return [];
  }

  /**
   * Get ledger details for a specific company
   * @param {string} companyName The name of the company
   * @returns {Promise<Array>} List of ledgers
   */
  async getLedgers(companyName) {
    const request = this.getLedgersRequest(companyName);
    const response = await this.sendRequest(request);
    
    // Process the response to extract ledgers
    if (response && response.ENVELOPE && response.ENVELOPE.BODY && 
        response.ENVELOPE.BODY.DATA && response.ENVELOPE.BODY.DATA.COLLECTION) {
      return response.ENVELOPE.BODY.DATA.COLLECTION;
    }
    
    return [];
  }

  /**
   * Get outstanding bills for sundry debtors (dealers)
   * @param {string} companyName The name of the company
   * @returns {Promise<Array>} List of outstanding bills
   */
  async getOutstandingBills(companyName) {
    const request = this.getOutstandingBillsRequest(companyName);
    const response = await this.sendRequest(request);
    
    // Process the response to extract bills
    if (response && response.ENVELOPE && response.ENVELOPE.BODY && 
        response.ENVELOPE.BODY.DATA && response.ENVELOPE.BODY.DATA.COLLECTION) {
      return response.ENVELOPE.BODY.DATA.COLLECTION;
    }
    
    return [];
  }

  /**
   * Process ledger data to extract dealer information
   * @param {Array} ledgers The ledger data from Tally
   * @returns {Array} Processed dealer data
   */
  processDealerData(ledgers, outstandingBills) {
    const dealers = [];
    
    // Filter for ledgers that are Sundry Debtors (dealers/customers)
    const debtorLedgers = Array.isArray(ledgers.LEDGER) 
      ? ledgers.LEDGER.filter(ledger => ledger.PARENT === 'Sundry Debtors')
      : [];
      
    // Process each debtor ledger
    debtorLedgers.forEach(ledger => {
      // Extract phone number from LEDSTATENAME field or from ADDRESS
      let phoneNumber = '';
      if (ledger.LEDSTATENAME) {
        const phoneMatch = ledger.LEDSTATENAME.match(/(\+\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        if (phoneMatch) {
          phoneNumber = phoneMatch[0];
        }
      }
      
      // If no phone found in LEDSTATENAME, try to find in ADDRESS
      if (!phoneNumber && ledger.ADDRESS) {
        const addressLines = Array.isArray(ledger.ADDRESS) ? ledger.ADDRESS : [ledger.ADDRESS];
        for (const line of addressLines) {
          const phoneMatch = line.match(/(\+\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
          if (phoneMatch) {
            phoneNumber = phoneMatch[0];
            break;
          }
        }
      }
      
      // Format phone number to E.164 format
      if (phoneNumber) {
        // Clean the phone number: remove all non-digit characters except the + sign
        phoneNumber = phoneNumber.replace(/[^\d+]/g, '');
        
        // Ensure it starts with a + sign
        if (!phoneNumber.startsWith('+')) {
          phoneNumber = '+' + phoneNumber;
        }
      }
      
      // Find bills for this dealer
      const dealerBills = outstandingBills.filter(bill => bill.PARTYLEDGERNAME === ledger.NAME);
      
      // Calculate total outstanding amount
      const outstandingAmount = dealerBills.reduce((total, bill) => total + (bill.AMOUNT || 0), 0);
      
      // Process bills
      const processedBills = dealerBills.map(bill => ({
        billNumber: bill.BILLREF || `INV-${Date.now()}`,
        billDate: bill.BILLDATE ? new Date(bill.BILLDATE) : new Date(),
        billAmount: bill.AMOUNT || 0
      }));
      
      // Create dealer object
      const dealer = {
        companyName: ledger.NAME,
        phoneNumber: phoneNumber || '',
        amount: outstandingAmount,
        outstandingBills: processedBills
      };
      
      dealers.push(dealer);
    });
    
    return dealers;
  }

  // XML request templates
  
  // Get list of companies
  getCompanyListRequest() {
    return `<ENVELOPE>
      <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>List of Companies</ID>
      </HEADER>
      <BODY>
        <DESC>
          <STATICVARIABLES>
            <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
          </STATICVARIABLES>
        </DESC>
      </BODY>
    </ENVELOPE>`;
  }

  // Get list of ledgers
  getLedgersRequest(companyName) {
    return `<ENVELOPE>
      <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>List of Ledgers</ID>
      </HEADER>
      <BODY>
        <DESC>
          <STATICVARIABLES>
            <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            <COMPANYNAME>${companyName}</COMPANYNAME>
          </STATICVARIABLES>
        </DESC>
      </BODY>
    </ENVELOPE>`;
  }

  // Get outstanding bills
  getOutstandingBillsRequest(companyName) {
    return `<ENVELOPE>
      <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>Outstanding Bills</ID>
      </HEADER>
      <BODY>
        <DESC>
          <STATICVARIABLES>
            <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            <COMPANYNAME>${companyName}</COMPANYNAME>
          </STATICVARIABLES>
        </DESC>
      </BODY>
    </ENVELOPE>`;
  }
}

// Create a singleton instance
const tallyService = new TallyService();
export default tallyService;
