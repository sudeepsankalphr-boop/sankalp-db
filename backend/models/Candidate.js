const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    currentCompany: { type: String, trim: true },
    currentDesignation: { type: String, trim: true },
    totalExp: { type: Number },
    relevantExp: { type: Number },
    currentCTC: { type: Number },
    expectedCTC: { type: Number },
    noticePeriod: { type: String },
    editableDate: { type: Date },
    skills: [{ type: String }],
    source: {
      type: String,
      enum: ['LinkedIn', 'Naukri', 'Referral', 'Direct', 'Other'],
      default: 'Other',
    },
    status: {
      type: String,
      enum: ['Sent - No Luck', 'Screened', 'R1', 'R2', 'R3', 'Shortlisted', 'Rejected', 'Offered', 'Joined',
             'New', 'Screening', 'L1', 'L2', 'HR', 'On Hold'],
      default: 'Screened',
    },
    remarks: { type: String },
    cvUrl: { type: String },
    cvPublicId: { type: String },
    cvPages: [{ type: String }],
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

candidateSchema.index({ phone: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('Candidate', candidateSchema);
