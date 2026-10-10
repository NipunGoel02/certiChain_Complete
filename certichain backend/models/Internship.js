const mongoose = require('mongoose');

const CertificateRequestSchema = new mongoose.Schema({
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'minted', 'rejected'], default: 'pending' },
  requestedAt: { type: Date, default: Date.now },
  mintedAt: { type: Date },
  certificateType: { type: String, enum: ['participation', 'completion'], default: 'participation' },
  outboundCallStatus: {
    type: String,
    enum: ['not_attempted', 'started', 'failed', 'skipped_missing_phone'],
    default: 'not_attempted'
  },
  outboundCallError: { type: String, default: '' },
  outboundCallStartedAt: { type: Date }
});

const InternshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  certificateRequests: [CertificateRequestSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Internship', InternshipSchema);
