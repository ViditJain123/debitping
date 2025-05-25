// Use vanilla JavaScript to parse XML
const xmlText = `<ENVELOPE>
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

// Extract company name using regex
const companyNameMatch = xmlText.match(/<COMPANY NAME="([^"]+)"/);
let companyName = "Unknown";
if (companyNameMatch) {
  companyName = companyNameMatch[1];
  process.stdout.write(`Company Name: ${companyName}\n`);
} else {
  process.stdout.write("Company name not found in XML\n");
}

// Extract starting date using regex
const startingFromMatch = xmlText.match(/<STARTINGFROM[^>]*>(\d{8})<\/STARTINGFROM>/);
let startDate = "Unknown";
if (startingFromMatch) {
  const dateStr = startingFromMatch[1];
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  
  startDate = `${month}/${day}/${year}`;
  process.stdout.write(`Financial Year Starting From: ${startDate}\n`);
} else {
  process.stdout.write("Starting date not found in XML\n");
}

process.stdout.write("XML parsing complete\n");

// Return a formatted result
const result = {
  companyName: companyName,
  financialYearStart: startDate
};

// Explicitly print the result for PowerShell to capture
process.stdout.write("\nParsed Result:\n" + JSON.stringify(result, null, 2) + "\n");
