// src/utils/parse-tally-response.js
import tallyParser from './tally-parser';

/**
 * Parse Tally XML response and extract company information
 * @param {string} xmlResponse - The raw XML response from Tally
 * @returns {Object} An object containing the parsed company information
 */
export function parseTallyCompanyResponse(xmlResponse) {
  try {
    // Use the tally-parser to extract company information
    const result = tallyParser.parseCompanyList(xmlResponse);
    
    // Log the result for debugging
    console.log('Parsed Tally company information:', result);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error parsing Tally company response:', error);
    return {
      success: false,
      error: error.message || 'Failed to parse Tally response'
    };
  }
}

/**
 * Process Tally API response for company list
 * @param {string} xmlResponse - Raw XML response from Tally API
 * @returns {Object} Processed company data for use in the application
 */
export function processTallyCompanyResponse(xmlResponse) {
  // Parse the XML response
  const { success, data, error } = parseTallyCompanyResponse(xmlResponse);
  
  if (!success) {
    throw new Error(error || 'Failed to parse Tally company response');
  }
  
  // Return the processed data in a format ready for your application
  return {
    companyName: data.companyName,
    financialYearStart: data.financialYearStart
  };
}

// Export both functions individually and as default
export default {
  parseTallyCompanyResponse,
  processTallyCompanyResponse
}
