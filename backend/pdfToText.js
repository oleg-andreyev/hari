

const pdfjsLib = require("pdfjs-dist");

async function GetTextFromPDF(path) {
    let doc = await pdfjsLib.getDocument(path).promise;
    let page1 = await doc.getPage(1);
    let content = await page1.getTextContent();
    let strings = content.items.map(function(item) {
        return item.str;
    });
    return strings.toString();
}

//test
const pdf_path = 'C:\\Users\\c5274664\\Desktop\\dataset - Copy\\0001.pdf';
GetTextFromPDF(pdf_path).then(data => {
  console.log(data)
});

module.exports = { GetTextFromPDF }
