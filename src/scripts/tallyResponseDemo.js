// tallyResponseDemo.js
const xmlString = `<ENVELOPE>
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

// Using the fast-xml-parser library which is already in your project
const { XMLParser } = require('fast-xml-parser');

function parseXmlResponse(xmlString) {
  // Configure parser with same settings as in the tally-service.js
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
    parseAttributeValue: true,
    textNodeName: "_text",
    isArray: (name, jpath, isLeafNode, isAttribute) => {
      // Force these elements to always be arrays
      const arrayElements = ['COMPANY', 'LEDGER', 'BILL'];
      return arrayElements.includes(name);
    }
  });
  
  // Parse the XML string
  const parsed = parser.parse(xmlString);
  
  // Extract company information
  const companyData = parsed?.ENVELOPE?.BODY?.DATA?.COLLECTION?.COMPANY;
  
  if (!companyData || companyData.length === 0) {
    return { error: 'No company data found in the response' };
  }
  
  // Get the first company in the array
  const company = companyData[0];
  
  // Extract name from the company data
  let name = '';
  if (company['@_NAME']) {
    // Get from NAME attribute
    name = company['@_NAME'];
  } else if (typeof company.NAME === 'string') {
    // Get from NAME element as string
    name = company.NAME;
  } else if (company.NAME && company.NAME._text) {
    // Get from NAME element with text property
    name = company.NAME._text;
  }
  
  // Extract starting date
  let startingFrom = '';
  let formattedDate = '';
  
  if (company.STARTINGFROM) {
    if (typeof company.STARTINGFROM === 'string') {
      startingFrom = company.STARTINGFROM;
    } else if (company.STARTINGFROM._text) {
      startingFrom = company.STARTINGFROM._text;
    }
    
    // If we have a date in format YYYYMMDD, format it
    if (startingFrom && startingFrom.match(/^\d{8}$/)) {
      const year = startingFrom.substring(0, 4);
      const month = startingFrom.substring(4, 6);
      const day = startingFrom.substring(6, 8);
      const date = new Date(`${year}-${month}-${day}`);
      formattedDate = date.toLocaleDateString();
    }
  }
  
  return {
    companyName: name,
    financialYearStart: formattedDate || startingFrom,
    rawData: company
  };
}

// Parse and display the result
const result = parseXmlResponse(xmlString);
console.log('Parsed Company Information:');
console.log('==========================');
console.log(`Company Name: ${result.companyName}`);
console.log(`Financial Year Start: ${result.financialYearStart}`);

module.exports = { parseXmlResponse };
