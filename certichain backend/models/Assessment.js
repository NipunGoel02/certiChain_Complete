const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  candidateName: { type: String, required: true },
  roleKey: { type: String, required: true },
  roleTitle: { type: String, required: true },
  status: {
    type: String,
    enum: ['initiating', 'ringing', 'in_progress', 'completed', 'no_answer', 'failed', 'report_failed'],
    default: 'initiating',
    index: true
  },
  roomName: { type: String, default: '' },
  transcript: [{
    speaker: { type: String, enum: ['candidate', 'agent'], required: true },
    text: { type: String, required: true },
    at: { type: Number, default: 0 }
  }],
  report: { type: mongoose.Schema.Types.Mixed, default: null },
  reportHash: { type: String, default: '' },
  hashPayload: { type: String, default: '', select: false },
  proof: {
    chainId: Number,
    txHash: String,
    blockNumber: Number,
    anchoredAt: Date,
    walletAddress: String
  }
}, { timestamps: true });

assessmentSchema.index({ recruiter: 1, createdAt: -1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
