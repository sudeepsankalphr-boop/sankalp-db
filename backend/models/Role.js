const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    openings: { type: Number, default: 1 },
    status: { type: String, enum: ['open', 'closed', 'on_hold'], default: 'open' },
    jd: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
