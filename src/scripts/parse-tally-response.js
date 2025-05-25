// src/scripts/parse-tally-response.js
import tallyParser from '../utils/tally-parser.js';

/**
 * Parse and display Tally company information from XML response
 * @param {string} xmlResponse - XML response from Tally API
 */
export function parseTallyCompanyResponse(xmlResponse) {
  try {
    // Extract company information
    const companyInfo = tallyParser.extractCompanyInfo(xmlResponse);
    
    console.log('Tally Company Information:');
    console.log('-------------------------');
    console.log(`Company Name: ${companyInfo.name}`);
    
    if (companyInfo.startDate) {
      console.log(`Financial Year Starting From: ${companyInfo.startDate}`);
    }
    
    return companyInfo;
  } catch (error) {
    console.error('Error parsing Tally response:', error);
    throw error;
  }
}

// Example usage with the XML response
const sampleXmlResponse = `<ENVELOPE>
 <HEADER>
  <VERSION>1</VERSION>
  <STATUS>1</STATUS>
 </HEADER>
 <BODY>
  <DESC>
   <CMPINFO>
    <COMPANY>0</COMPANY>
    <GROUP>0</GROUP>
    <LEDGER>0</LEDGER>
    <COSTCATEGORY>0</COSTCATEGORY>
    <COSTCENTRE>0</COSTCENTRE>
    <GODOWN>0</GODOWN>
    <STOCKGROUP>0</STOCKGROUP>
    <STOCKCATEGORY>0</STOCKCATEGORY>
    <STOCKITEM>0</STOCKITEM>
    <VOUCHERTYPE>0</VOUCHERTYPE>
    <CURRENCY>0</CURRENCY>
    <UNIT>0</UNIT>
    <BUDGET>0</BUDGET>
    <CLIENTRULE>0</CLIENTRULE>
    <SERVERRULE>0</SERVERRULE>
    <STATE>0</STATE>
    <TDSRATE>0</TDSRATE>
    <TAXCLASSIFICATION>0</TAXCLASSIFICATION>
    <STCATEGORY>0</STCATEGORY>
    <DEDUCTEETYPE>0</DEDUCTEETYPE>
    <ATTENDANCETYPE>0</ATTENDANCETYPE>
    <FBTCATEGORY>0</FBTCATEGORY>
    <FBTASSESSEETYPE>0</FBTASSESSEETYPE>
    <TARIFFCLASSIFICATION>0</TARIFFCLASSIFICATION>
    <EXCISEDUTYCLASSIFICATION>0</EXCISEDUTYCLASSIFICATION>
    <SERIALNUMBER>0</SERIALNUMBER>
    <ADJUSTMENTCLASSIFICATION>0</ADJUSTMENTCLASSIFICATION>
    <INCOMETAXSLAB>0</INCOMETAXSLAB>
    <INCOMETAXCLASSIFICATION>0</INCOMETAXCLASSIFICATION>
    <LBTCLASSIFICATION>0</LBTCLASSIFICATION>
    <TAXUNIT>0</TAXUNIT>
    <RETURNMASTER>0</RETURNMASTER>
    <GSTCLASSIFICATION>0</GSTCLASSIFICATION>
    <VOUCHERNUMBERSERIES>0</VOUCHERNUMBERSERIES>
    <VOUCHER>0</VOUCHER>
   </CMPINFO>
  </DESC>
  <DATA>
   <COLLECTION>
    <COMPANY NAME="Zyver" RESERVEDNAME="">
     <STARTINGFROM TYPE="Date">20250401</STARTINGFROM>
     <NAME TYPE="String">Zyver</NAME>
    </COMPANY>
   </COLLECTION>
  </DATA>
 </BODY>
</ENVELOPE>`;

// Parse and display the sample response
parseTallyCompanyResponse(sampleXmlResponse);
