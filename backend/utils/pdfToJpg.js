const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const os = require('os');
const path = require('path');

const execFileAsync = promisify(execFile);

module.exports = async function pdfToJpg(pdfBuffer) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-'));
  const inputPath = path.join(tmpDir, 'input.pdf');
  const outputPrefix = path.join(tmpDir, 'page');

  try {
    fs.writeFileSync(inputPath, pdfBuffer);
    // 120 DPI keeps A4 at ~993x1404px; quality=70 keeps output well under 1MB
    await execFileAsync('pdftoppm', [
      '-jpeg', '-r', '120', '-jpegopt', 'quality=70',
      '-f', '1', '-l', '1',
      inputPath, outputPrefix,
    ]);

    const jpgFiles = fs.readdirSync(tmpDir).filter((f) => f.endsWith('.jpg'));
    if (!jpgFiles.length) throw new Error('pdftoppm produced no output');

    const jpgBuffer = fs.readFileSync(path.join(tmpDir, jpgFiles[0]));
    if (jpgBuffer.length > 1024 * 1024) {
      throw new Error(`CV image too large after conversion: ${(jpgBuffer.length / 1024).toFixed(0)}KB`);
    }
    return jpgBuffer;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
};
