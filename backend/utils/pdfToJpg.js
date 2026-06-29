const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const execFileAsync = promisify(execFile);

// Single-page: 90 DPI / q=55 → A4 at ~743×1050px, well under 300KB for typical CVs
// Multi-page:  110 DPI / q=65 → A4 at ~909×1285px, well under 600KB for typical CVs
const SETTINGS = {
  single: { dpi: 90,  quality: 55, maxBytes: 300 * 1024 },
  multi:  { dpi: 110, quality: 65, maxBytes: 600 * 1024 },
};

module.exports = async function pdfToJpg(pdfBuffer) {
  let pageCount = 1;
  try {
    const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    pageCount = doc.getPageCount();
  } catch (_) {
    // fall back to single-page settings if pdf-lib can't parse
  }

  const s = pageCount > 1 ? SETTINGS.multi : SETTINGS.single;
  const label = pageCount > 1 ? 'multi' : 'single';

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-'));
  const inputPath = path.join(tmpDir, 'input.pdf');
  const outputPrefix = path.join(tmpDir, 'page');

  try {
    fs.writeFileSync(inputPath, pdfBuffer);
    await execFileAsync('pdftoppm', [
      '-jpeg', '-r', String(s.dpi), '-jpegopt', `quality=${s.quality}`,
      inputPath, outputPrefix,
    ]);

    const jpgFiles = fs.readdirSync(tmpDir)
      .filter((f) => f.endsWith('.jpg'))
      .sort();
    if (!jpgFiles.length) throw new Error('pdftoppm produced no output');

    const buffers = jpgFiles.map((f) => fs.readFileSync(path.join(tmpDir, f)));
    const totalBytes = buffers.reduce((sum, b) => sum + b.length, 0);
    if (totalBytes > s.maxBytes) {
      throw new Error(
        `CV images too large after conversion: ${(totalBytes / 1024).toFixed(0)}KB ` +
        `(limit ${s.maxBytes / 1024}KB for ${label}-page PDF)`
      );
    }
    return buffers;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
};
