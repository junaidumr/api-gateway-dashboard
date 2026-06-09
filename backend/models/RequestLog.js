const mongoose = require('mongoose');

const requestLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    endpoint: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    responseTime: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

requestLogSchema.index({ endpoint: 1, timestamp: -1 });
requestLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('RequestLog', requestLogSchema);
