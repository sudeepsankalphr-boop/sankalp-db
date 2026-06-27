const express = require('express');
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const Candidate = require('../models/Candidate');
const Client = require('../models/Client');
const { protect } = require('../middleware/auth');

const router = express.Router();

function fmtDate(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d)) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function sheetName(title) {
  return (title || 'Unknown').replace(/[/\\?*[\]:]/g, '-').substring(0, 31);
}

async function buildReport(clientId, from, to) {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  const rows = await Candidate.aggregate([
    {
      $match: {
        client: new mongoose.Types.ObjectId(clientId),
        $expr: {
          $and: [
            { $gte: [{ $ifNull: ['$editableDate', '$createdAt'] }, fromDate] },
            { $lte: [{ $ifNull: ['$editableDate', '$createdAt'] }, toDate] },
          ],
        },
      },
    },
    {
      $group: {
        _id: '$role',
        Screened:    { $sum: { $cond: [{ $eq: ['$status', 'Screened'] },       1, 0] } },
        R1:          { $sum: { $cond: [{ $eq: ['$status', 'R1'] },              1, 0] } },
        R2:          { $sum: { $cond: [{ $eq: ['$status', 'R2'] },              1, 0] } },
        R3:          { $sum: { $cond: [{ $eq: ['$status', 'R3'] },              1, 0] } },
        Shortlisted: { $sum: { $cond: [{ $eq: ['$status', 'Shortlisted'] },     1, 0] } },
        SentNoLuck:  { $sum: { $cond: [{ $eq: ['$status', 'Sent - No Luck'] },  1, 0] } },
        OnHold:      { $sum: { $cond: [{ $eq: ['$status', 'On Hold'] },         1, 0] } },
        Offered:     { $sum: { $cond: [{ $eq: ['$status', 'Offered'] },         1, 0] } },
        Joined:      { $sum: { $cond: [{ $eq: ['$status', 'Joined'] },          1, 0] } },
        Rejected:    { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] },        1, 0] } },
      },
    },
    {
      $lookup: { from: 'roles', localField: '_id', foreignField: '_id', as: 'roleDoc' },
    },
    { $unwind: { path: '$roleDoc', preserveNullAndEmptyArrays: true } },
    {
      $lookup: { from: 'locations', localField: 'roleDoc.location', foreignField: '_id', as: 'locationDoc' },
    },
    { $unwind: { path: '$locationDoc', preserveNullAndEmptyArrays: true } },
    { $sort: { 'roleDoc.title': 1 } },
  ]);

  return rows.map((r) => {
    const total = r.Screened + r.R1 + r.R2 + r.R3 + r.Shortlisted +
                  r.SentNoLuck + r.OnHold + r.Offered + r.Joined + r.Rejected;
    return {
      role:            r.roleDoc?.title || '(unknown role)',
      location:        r.locationDoc?.name || '—',
      total,
      Screened:        r.Screened,
      R1:              r.R1,
      R2:              r.R2,
      R3:              r.R3,
      Shortlisted:     r.Shortlisted,
      'Sent - No Luck': r.SentNoLuck,
      'On Hold':       r.OnHold,
      Offered:         r.Offered,
      Joined:          r.Joined,
      Rejected:        r.Rejected,
    };
  });
}

// GET /reports?clientId=&from=&to=
router.get('/', protect, async (req, res) => {
  try {
    const { clientId, from, to } = req.query;
    if (!clientId || !from || !to) {
      return res.status(400).json({ message: 'clientId, from, and to are required' });
    }
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const rows = await buildReport(clientId, from, to);
    res.json({ clientName: client.name, rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /reports/export?clientId=&from=&to=
router.get('/export', protect, async (req, res) => {
  try {
    const { clientId, from, to } = req.query;
    if (!clientId || !from || !to) {
      return res.status(400).json({ message: 'clientId, from, and to are required' });
    }
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const candidates = await Candidate.find({
      client: new mongoose.Types.ObjectId(clientId),
      $expr: {
        $and: [
          { $gte: [{ $ifNull: ['$editableDate', '$createdAt'] }, fromDate] },
          { $lte: [{ $ifNull: ['$editableDate', '$createdAt'] }, toDate] },
        ],
      },
    })
      .populate('location', 'name')
      .populate('role', 'title')
      .sort({ 'role': 1, fullName: 1 });

    // Group by role, preserving sort order of first appearance
    const roleMap = new Map();
    for (const c of candidates) {
      const title = c.role?.title || 'Unknown Role';
      if (!roleMap.has(title)) roleMap.set(title, []);
      roleMap.get(title).push(c);
    }

    // Sort role groups alphabetically
    const sortedRoles = [...roleMap.entries()].sort(([a], [b]) => a.localeCompare(b));

    const wb = XLSX.utils.book_new();

    for (const [title, roleCandidates] of sortedRoles) {
      const rows = roleCandidates.map((c, i) => ({
        'SI No':         i + 1,
        'Name':          c.fullName,
        'Phone':         c.phone,
        'Email':         c.email || '',
        'Company':       c.currentCompany || '',
        'Designation':   c.currentDesignation || '',
        'Location':      c.location?.name || '',
        'Exp':           c.totalExp != null ? `${c.totalExp} Yrs` : '',
        'Current CTC':   c.currentCTC != null ? `${c.currentCTC} LPA` : '',
        'Expected CTC':  c.expectedCTC != null ? `${c.expectedCTC} LPA` : '',
        'Notice Period': c.noticePeriod || '',
        'Status':        c.status || '',
        'Remarks':       c.remarks || '',
        'Sent Date':     fmtDate(c.editableDate),
      }));

      const ws = XLSX.utils.json_to_sheet(rows);

      // Center-align every cell
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const ref = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[ref]) continue;
          ws[ref].s = { alignment: { horizontal: 'center', vertical: 'center' } };
        }
      }

      XLSX.utils.book_append_sheet(wb, ws, sheetName(title));
    }

    if (wb.SheetNames.length === 0) {
      return res.status(404).json({ message: 'No candidates found for the selected filters' });
    }

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx', cellStyles: true });
    const safe = client.name.replace(/[^a-z0-9]/gi, '_');
    res.setHeader('Content-Disposition', `attachment; filename="${safe}_${from}_${to}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
