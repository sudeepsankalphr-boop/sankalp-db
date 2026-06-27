const express = require('express');
const Role = require('../models/Role');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.clientId) filter.client = req.query.clientId;
    const roles = await Role.find(filter).populate('client', 'name').populate('location', 'name state').sort({ createdAt: -1 });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const role = await Role.create(req.body);
    await role.populate('client', 'name');
    await role.populate('location', 'name state');
    res.status(201).json(role);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('client', 'name')
      .populate('location', 'name state');
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json(role);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json({ message: 'Role deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
