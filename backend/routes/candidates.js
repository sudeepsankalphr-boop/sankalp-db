const express = require('express');
const multer = require('multer');
const axios = require('axios');
const archiver = require('archiver');
const XLSX = require('xlsx');
const Candidate = require('../models/Candidate');
const Client = require('../models/Client');
const Role = require('../models/Role');
const { protect } = require('../middleware/auth');
const { PDFDocument } = require('pdf-lib');
const { uploadBuffer, deleteFile } = require('../utils/cloudinary');
const pdfToJpg = require('../utils/pdfToJpg');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// GET /candidates?roleId=&page=&limit=&q=&status=&sort=updated
router.get('/', protect, async (req, res) => {
  try {
    const { roleId, page = 1, limit = 20, q, status, sort } = req.query;
    const filter = {};
    if (roleId) filter.role = roleId;
    if (status) {
      const arr = status.split(',').map((s) => s.trim()).filter(Boolean);
      filter.status = arr.length === 1 ? arr[0] : { $in: arr };
    }
    if (q) {
      const matchingClients = await Client.find({ name: { $regex: q, $options: 'i' } }, '_id');
      const clientIds = matchingClients.map((c) => c._id);
      filter.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { currentCompany: { $regex: q, $options: 'i' } },
        { currentDesignation: { $regex: q, $options: 'i' } },
        ...(clientIds.length ? [{ client: { $in: clientIds } }] : []),
      ];
    }
    const sortOrder = sort === 'updated' ? { updatedAt: -1 } : { createdAt: -1 };
    const total = await Candidate.countDocuments(filter);
    const candidates = await Candidate.find(filter)
      .populate('location', 'name')
      .populate('role', 'title')
      .populate('client', 'name')
      .populate('addedBy', 'name')
      .sort(sortOrder)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ candidates, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /candidates/export
router.get('/export', protect, async (req, res) => {
  try {
    const { roleId, clientId } = req.query;
    const filter = {};
    if (roleId) filter.role = roleId;
    if (clientId) filter.client = clientId;
    const candidates = await Candidate.find(filter)
      .populate('role', 'title')
      .populate('client', 'name')
      .populate('location', 'name')
      .populate('addedBy', 'name');

    const rows = candidates.map((c) => ({
      Name: c.fullName,
      Email: c.email || '',
      Phone: c.phone,
      Company: c.currentCompany || '',
      Designation: c.currentDesignation || '',
      'Total Exp': c.totalExp ?? '',
      'Relevant Exp': c.relevantExp ?? '',
      'Current CTC': c.currentCTC ?? '',
      'Expected CTC': c.expectedCTC ?? '',
      'Notice Period': c.noticePeriod ?? '',
      Skills: (c.skills || []).join(', '),
      Source: c.source || '',
      Status: c.status || '',
      Remarks: c.remarks || '',
      Role: c.role?.title || '',
      Client: c.client?.name || '',
      Location: c.location?.name || '',
      'CV URL': c.cvUrl || '',
      'Added On': c.createdAt ? c.createdAt.toISOString().split('T')[0] : '',
      Consultant: c.addedBy?.name || '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Candidates');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="candidates.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /candidates/bulk-download?roleId=
router.get('/bulk-download', protect, async (req, res) => {
  try {
    const { roleId } = req.query;
    const filter = { cvUrl: { $ne: null, $ne: '' } };
    if (roleId) filter.role = roleId;

    const candidates = await Candidate.find(filter).populate('role', 'title').select('fullName cvUrl cvPages role');
    if (!candidates.length) return res.status(404).json({ message: 'No CVs found' });

    const roleName = candidates[0]?.role?.title || 'candidates';
    res.setHeader('Content-Disposition', `attachment; filename="cvs_${roleName.replace(/\s+/g, '_')}.zip"`);
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.pipe(res);

    for (const c of candidates) {
      const safeName = c.fullName.replace(/[^a-z0-9_\-]/gi, '_');
      try {
        if (c.cvPages?.length) {
          const pdfDoc = await PDFDocument.create();
          for (const pageUrl of c.cvPages) {
            try {
              const response = await axios.get(pageUrl, { responseType: 'arraybuffer', timeout: 15000 });
              const jpgImage = await pdfDoc.embedJpg(Buffer.from(response.data));
              const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
              page.drawImage(jpgImage, { x: 0, y: 0, width: jpgImage.width, height: jpgImage.height });
            } catch (e) {
              // skip failed page silently
            }
          }
          const pdfBytes = await pdfDoc.save();
          archive.append(Buffer.from(pdfBytes), { name: `${safeName}.pdf` });
        } else if (c.cvUrl) {
          const response = await axios.get(c.cvUrl, { responseType: 'arraybuffer', timeout: 15000 });
          const ext = c.cvUrl.split('.').pop().split('?')[0] || 'pdf';
          archive.append(Buffer.from(response.data), { name: `${safeName}.${ext}` });
        }
      } catch (e) {
        // skip failed candidates silently
      }
    }

    await archive.finalize();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /candidates/import?roleId=&clientId=
router.post('/import', protect, upload.single('file'), async (req, res) => {
  try {
    const { roleId, clientId } = req.query;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    if (!roleId || !clientId) return res.status(400).json({ message: 'roleId and clientId required' });

    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws);

    const toInsert = rows
      .filter((r) => r['Name'] && r['Phone'])
      .map((r) => ({
        fullName: r['Name'],
        email: r['Email'] || '',
        phone: String(r['Phone']),
        currentCompany: r['Company'] || '',
        currentDesignation: r['Designation'] || '',
        totalExp: r['Total Exp'] !== undefined ? Number(r['Total Exp']) : undefined,
        relevantExp: r['Relevant Exp'] !== undefined ? Number(r['Relevant Exp']) : undefined,
        currentCTC: r['Current CTC'] !== undefined ? Number(r['Current CTC']) : undefined,
        expectedCTC: r['Expected CTC'] !== undefined ? Number(r['Expected CTC']) : undefined,
        noticePeriod: r['Notice Period'] !== undefined ? Number(r['Notice Period']) : undefined,
        skills: r['Skills'] ? r['Skills'].split(',').map((s) => s.trim()) : [],
        source: r['Source'] || 'Other',
        status: r['Status'] || 'New',
        remarks: r['Remarks'] || '',
        role: roleId,
        client: clientId,
        addedBy: req.user._id,
      }));

    if (!toInsert.length) return res.status(400).json({ message: 'No valid rows found (need Name and Phone columns)' });
    const result = await Candidate.insertMany(toInsert, { ordered: false });
    res.json({ inserted: result.length, skipped: rows.length - result.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /candidates
router.post('/', protect, upload.single('cv'), async (req, res) => {
  try {
    const data = { ...req.body, addedBy: req.user._id };
    if (data.skills && typeof data.skills === 'string') {
      data.skills = data.skills.split('\n').map((s) => s.trim()).filter(Boolean);
    }

    if (req.file) {
      const originalKB = (req.file.size / 1024).toFixed(1);
      if (req.file.mimetype === 'application/pdf') {
        console.log('[POST /candidates] before pdfToJpg', { originalKB, filename: req.file.originalname });
        const pageBuffers = await pdfToJpg(req.file.buffer);
        console.log('[POST /candidates] after pdfToJpg', { pages: pageBuffers.length, total_KB: (pageBuffers.reduce((s, b) => s + b.length, 0) / 1024).toFixed(1) });
        const ts = Date.now();
        console.log('[POST /candidates] before cloudinary upload', { pages: pageBuffers.length });
        const uploads = await Promise.all(
          pageBuffers.map((buf, i) => uploadBuffer(buf, { public_id: `cv_${ts}_p${i}`, format: 'jpg' }))
        );
        console.log('[POST /candidates] after cloudinary upload', {
          original_KB: originalKB,
          pages: uploads.length,
          total_KB: (pageBuffers.reduce((s, b) => s + b.length, 0) / 1024).toFixed(1),
          urls: uploads.map((u) => u.secure_url),
        });
        data.cvUrl = uploads[0].secure_url;
        data.cvPublicId = uploads[0].public_id;
        data.cvPages = uploads.map((u) => u.secure_url);
      } else {
        if (req.file.size > 1024 * 1024) {
          return res.status(400).json({ message: 'CV file too large. Maximum size is 1MB for non-PDF files.' });
        }
        console.log('[POST /candidates] before cloudinary upload (non-pdf)', { originalKB, filename: req.file.originalname, mimetype: req.file.mimetype });
        const result = await uploadBuffer(req.file.buffer, {
          public_id: `cv_${Date.now()}`,
          format: req.file.originalname.split('.').pop().toLowerCase(),
        });
        console.log('[POST /candidates] after cloudinary upload (non-pdf)', {
          original_KB: originalKB,
          cloudinary_KB: (result.bytes / 1024).toFixed(1),
          format: result.format,
          url: result.secure_url,
        });
        data.cvUrl = result.secure_url;
        data.cvPublicId = result.public_id;
        data.cvPages = [];
      }
    }

    const candidate = await Candidate.create(data);
    res.status(201).json(candidate);
  } catch (err) {
    console.error('[POST /candidates] error', { message: err.message, code: err.code, stack: err.stack });
    if (err.code === 11000) return res.status(409).json({ message: 'Candidate with this number already exists in this role' });
    res.status(400).json({ message: err.message });
  }
});

// PUT /candidates/:id
router.put('/:id', protect, upload.single('cv'), async (req, res) => {
  try {
    const existing = await Candidate.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Candidate not found' });

    const data = { ...req.body };
    if (data.skills && typeof data.skills === 'string') {
      data.skills = data.skills.split('\n').map((s) => s.trim()).filter(Boolean);
    }

    if (req.file) {
      if (existing.cvPublicId) {
        await deleteFile(existing.cvPublicId);
        // multi-page uploads are named cv_${ts}_p0 … cv_${ts}_pN; delete pages 1+
        const base = existing.cvPublicId.replace(/_p0$/, '');
        if (base !== existing.cvPublicId) {
          const extraCount = (existing.cvPages || []).length - 1;
          for (let i = 1; i <= extraCount; i++) {
            try { await deleteFile(`${base}_p${i}`); } catch (_) {}
          }
        }
      }

      const originalKB = (req.file.size / 1024).toFixed(1);
      if (req.file.mimetype === 'application/pdf') {
        const pageBuffers = await pdfToJpg(req.file.buffer);
        const ts = Date.now();
        const uploads = await Promise.all(
          pageBuffers.map((buf, i) => uploadBuffer(buf, { public_id: `cv_${ts}_p${i}`, format: 'jpg' }))
        );
        console.log('[CV upload]', {
          original_KB: originalKB,
          pages: uploads.length,
          total_KB: (pageBuffers.reduce((s, b) => s + b.length, 0) / 1024).toFixed(1),
        });
        data.cvUrl = uploads[0].secure_url;
        data.cvPublicId = uploads[0].public_id;
        data.cvPages = uploads.map((u) => u.secure_url);
      } else {
        const result = await uploadBuffer(req.file.buffer, {
          public_id: `cv_${Date.now()}`,
          format: req.file.originalname.split('.').pop().toLowerCase(),
        });
        console.log('[CV upload]', {
          original_KB: originalKB,
          cloudinary_KB: (result.bytes / 1024).toFixed(1),
          format: result.format,
        });
        data.cvUrl = result.secure_url;
        data.cvPublicId = result.public_id;
        data.cvPages = [];
      }
    }

    const updated = await Candidate.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Candidate with this number already exists in this role' });
    res.status(400).json({ message: err.message });
  }
});

// DELETE /candidates/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    if (candidate.cvPublicId) await deleteFile(candidate.cvPublicId);
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Candidate deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
