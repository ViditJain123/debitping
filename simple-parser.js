// Simple XML parsing demonstration
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

/**
 * Simple function to extract company name from Tally XML response
 */
function extractCompanyInfo(xmlString) {
  // Extract company name using regex for simplicity
  const companyNameMatch = xmlString.match(/<COMPANY NAME="([^"]+)"/);
  const companyName = companyNameMatch ? companyNameMatch[1] : '';
  
  // Extract starting date using regex
  const startingFromMatch = xmlString.match(/<STARTINGFROM[^>]*>(\d{8})<\/STARTINGFROM>/);
  let startDate = '';
  
  if (startingFromMatch && startingFromMatch[1]) {
    const dateStr = startingFromMatch[1];
    // Format YYYYMMDD to a readable date
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const date = new Date(`${year}-${month}-${day}`);
    startDate = date.toLocaleDateString();
  }
  
  return {
    companyName,
    startDate
  };
}

// Parse and display the result
const companyInfo = extractCompanyInfo(xmlString);
console.log('Tally Company Information:');
console.log('-------------------------');
console.log(`Company Name: ${companyInfo.companyName}`);
console.log(`Financial Year Start: ${companyInfo.startDate}`);
console.log('-------------------------');
console.log('Company name extracted successfully!');
