const mongoose = require('mongoose');

const plotSchema = new mongoose.Schema(
  {
    plotId: {
      type: String,
      required: [true, 'Plot ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    plotNo: {
      type: String,
      required: [true, 'Plot Number is required'],
      trim: true
    },
    status: {
      type: String,
      default: 'Available',
      trim: true
    },
    length: {
      type: String,
      default: '',
      trim: true
    },
    width: {
      type: String,
      default: '',
      trim: true
    },
    facing: {
      type: String,
      default: 'North',
      trim: true
    },
    svgPath: {
      type: String,
      default: '',
      trim: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    syncPending: {
      type: Boolean,
      default: false
    },
    lastSyncError: {
      type: String,
      default: null
    },
    createdBy: {
      adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
      },
      adminName: {
        type: String,
        required: true
      }
    },
    updatedBy: {
      adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
      },
      adminName: {
        type: String,
        required: true
      }
    }
  },
  {
    timestamps: true
  }
);

// Virtual for id getter to maintain compatibility with frontends expecting .id or .ID
plotSchema.virtual('id').get(function () {
  return this.plotId;
});

plotSchema.set('toJSON', { virtuals: true });
plotSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Plot', plotSchema);
