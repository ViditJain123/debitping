// src/utils/tally-parser.js
import { XMLParser } from 'fast-xml-parser';

/**
 * Parses Tally API XML responses and extracts useful information
 */
export class TallyParser {
  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      trimValues: true,
      parseAttributeValue: true,
      textNodeName: "_text",
      isArray: (name) => {
        // Force these elements to always be arrays
        const arrayElements = ['COMPANY', 'LEDGER', 'BILL'];
        return arrayElements.includes(name);
      }
    });
  }

  /**
   * Parse XML string to JavaScript object
   * @param {string} xmlString - XML string from Tally API
   * @returns {Object} Parsed JavaScript object
   */
  parseXML(xmlString) {
    try {
      return this.parser.parse(xmlString);
    } catch (error) {
      console.error('Error parsing XML:', error);
      throw new Error(`Failed to parse Tally XML: ${error.message}`);
    }
  }

  /**
   * Extract company information from Tally API response
   * @param {string} xmlString - XML response from Tally getCompanyList
   * @returns {Object} Company information with name and startDate
   */
  extractCompanyInfo(xmlString) {
    // First try using the XML parser
    try {
      const parsed = this.parseXML(xmlString);
      
      // Navigate to company data
      const companyData = parsed?.ENVELOPE?.BODY?.DATA?.COLLECTION?.COMPANY;
      
      if (companyData && Array.isArray(companyData) && companyData.length > 0) {
        // Extract company information from the first company in the list
        const company = companyData[0];
        
        // Extract company name
        let name = '';
        if (typeof company.NAME === 'string') {
          name = company.NAME;
        } else if (typeof company.NAME === 'object' && company.NAME?._text) {
          name = company.NAME._text;
        } else if (company['@_NAME']) {
          name = String(company['@_NAME']);
        }
        
        // Extract starting date
        let startingFrom = '';
        let startDate = null;
        
        if (company.STARTINGFROM) {
          if (typeof company.STARTINGFROM === 'object' && company.STARTINGFROM._text) {
            startingFrom = company.STARTINGFROM._text;
          } else if (typeof company.STARTINGFROM === 'string') {
            startingFrom = company.STARTINGFROM;
          }
          
          // If we have a date in format YYYYMMDD, convert it to a readable format
          if (startingFrom && startingFrom.match(/^\d{8}$/)) {
            const year = startingFrom.substring(0, 4);
            const month = startingFrom.substring(4, 6);
            const day = startingFrom.substring(6, 8);
            startDate = new Date(`${year}-${month}-${day}`);
          }
        }
        
        return {
          name,
          startingFrom,
          startDate: startDate ? startDate.toLocaleDateString() : null
        };
      }
    } catch (error) {
      console.error('Error parsing XML with fast-xml-parser:', error);
      // If parser fails, fall back to regex
    }
    
    // Fallback to regex-based parsing if XML parser fails or doesn't find company data
    return this.extractCompanyInfoWithRegex(xmlString);
  }
  
  /**
   * Extract company information using regex as a fallback method
   * @param {string} xmlString - XML response from Tally
   * @returns {Object} Company information with name and startDate
   */
  extractCompanyInfoWithRegex(xmlString) {
    // Extract company name
    let name = 'Unknown';
    const companyNameMatch = xmlString.match(/<COMPANY NAME="([^"]+)"/);
    if (companyNameMatch) {
      name = companyNameMatch[1];
    } else {
      // Try an alternative pattern for company name
      const altNameMatch = xmlString.match(/<NAME[^>]*>([^<]+)<\/NAME>/);
      if (altNameMatch) {
        name = altNameMatch[1];
      }
    }
    
    // Extract starting date
    let startDate = null;
    const startingFromMatch = xmlString.match(/<STARTINGFROM[^>]*>(\d{8})<\/STARTINGFROM>/);
    if (startingFromMatch) {
      const dateStr = startingFromMatch[1];
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      
      const date = new Date(`${year}-${month}-${day}`);
      startDate = date.toLocaleDateString();
    }
    
    return {
      name,
      startingFrom: startingFromMatch ? startingFromMatch[1] : null,
      startDate
    };
  }
  
  /**
   * Parses the XML response from Tally getCompanyList and returns a simplified object
   * @param {string} xmlString - XML response from Tally API
   * @returns {Object} A simplified object with company information
   */
  parseCompanyList(xmlString) {
    const companyInfo = this.extractCompanyInfo(xmlString);
    return {
      companyName: companyInfo.name,
      financialYearStart: companyInfo.startDate
    };
  }
}

export default new TallyParser();
