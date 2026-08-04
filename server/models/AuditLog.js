const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    plotId: {
      type: String,
      required: [true, 'Plot ID is required for audit log'],
      trim: true,
      index: true
    },
    plotNo: {
      type: String,
      required: [true, 'Plot Number is required for audit log'],
      trim: true
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Admin ID is required for audit log']
    },
    adminName: {
      type: String,
      required: [true, 'Admin Name is required for audit log'],
      trim: true
    },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE'],
      required: [true, 'Action (CREATE, UPDATE, DELETE) is required']
    },
    changedFields: {
      type: [String],
      default: []
    },
    oldValues: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    newValues: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
