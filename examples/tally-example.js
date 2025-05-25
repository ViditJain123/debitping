// Example of parsing and displaying Tally company information

// Import the parser utility
const { parseTallyCompanyResponse } = require('../src/utils/parse-tally-response');

// Sample XML response from Tally API
const sampleXMLResponse = `<ENVELOPE>
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

// Function to display company information from Tally XML response
function displayTallyCompanyInfo(xmlResponse) {
  // Parse the XML response
  const result = parseTallyCompanyResponse(xmlResponse);
  
  // Check if parsing was successful
  if (result.success) {
    console.log('================================');
    console.log('Tally Company Information:');
    console.log('================================');
    console.log(`Company Name: ${result.data.companyName}`);
    
    if (result.data.financialYearStart) {
      console.log(`Financial Year Start: ${result.data.financialYearStart}`);
    }
    console.log('================================');
    
    return result.data;
  } else {
    console.error('Failed to parse Tally XML response:', result.error);
    return null;
  }
}

// Example usage:
// 1. Parsing the sample XML response
const companyInfo = displayTallyCompanyInfo(sampleXMLResponse);

// 2. Using the company information in your application
if (companyInfo) {
  // You can now use companyInfo in your application
  console.log('Now you can use this data in your application:');
  console.log(JSON.stringify(companyInfo, null, 2));
  
  // For example, to proceed with Tally sync:
  console.log(`\nExample: Proceeding with sync for company "${companyInfo.companyName}"`);
}
