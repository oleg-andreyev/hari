

const pdfjsLib = require("pdfjs-dist");

// async function GetTextFromPDF(path) {
//     let strings;
//     let doc = await pdfjsLib.getDocument(path).promise;
//     let number = doc.numPages
//     for (let index = 1; index <= number; index++) {
//       strings += (await (await doc.getPage(index)).getTextContent()).items.map(item => { return item.str});

//     }
//     return strings.toString();
// }

async function GetTextFromPDF(fileStream) {
  let strings = '';
  const doc = await pdfjsLib.getDocument({ data: fileStream }).promise;
  const number = doc.numPages;
  for (let index = 1; index <= number; index++) {
    const page = await doc.getPage(index);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    strings += pageText;
  }
  return strings;
}

module.exports = { GetTextFromPDF }
