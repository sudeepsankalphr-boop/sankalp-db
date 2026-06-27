const { PDFDocument } = require('pdf-lib');

module.exports = async function compressPdf(buffer) {
  try {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    return Buffer.from(await doc.save({ useObjectStreams: true }));
  } catch (err) {
    // If pdf-lib can't parse it (e.g. it's a .doc), return as-is
    return buffer;
  }
};
