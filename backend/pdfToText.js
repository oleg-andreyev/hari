

const pdfjsLib = require("pdfjs-dist");

async function GetTextFromPDF(path) {
    let strings;
    let doc = await pdfjsLib.getDocument(path).promise;
    let number = doc.numPages
    for (let index = 1; index <= number; index++) {
      strings += (await (await doc.getPage(index)).getTextContent()).items.map(item => { return item.str});

    }
    return strings.toString();
}

//test
const pdf_path = 'C:\\Users\\c5274664\\Desktop\\dataset - Copy\\0001.pdf';
GetTextFromPDF(pdf_path).then(data => {
  console.log(data)
});

module.exports = { GetTextFromPDF }
