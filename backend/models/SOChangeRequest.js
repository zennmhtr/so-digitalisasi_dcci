const mongoose = require('mongoose');

const soChangeRequestSchema = new mongoose.Schema({
  // Request Information
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Requested By
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // SO Data Changes
  changeType: {
    type: String,
    enum: ['update', 'add', 'delete'],
    required: true
  },
  
  // Store the new SO data that is being requested
  proposedData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Store the current/old SO data for comparison
  currentData: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Affected Section
  affectedSection: {
    type: String,
    enum: ['bod', 'management', 'divisions', 'departments', 'sections', 'header', 'signatures', 'commissioners'],
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled','revisi'],
    default: 'pending'
  },
  
  // Approval Information
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewComments: {
    type: String
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Metadata
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
soChangeRequestSchema.index({ requestedBy: 1, status: 1 });
soChangeRequestSchema.index({ status: 1, createdAt: -1 });
soChangeRequestSchema.index({ affectedSection: 1 });

module.exports = mongoose.model('SOChangeRequest', soChangeRequestSchema);
