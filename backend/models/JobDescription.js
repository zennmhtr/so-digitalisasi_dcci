const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Member information (for non-user members)
  memberName: {
    type: String,
    required: function() { return !this.user; }
  },
  memberNoPNK: {
    type: String,
    required: function() { return !this.user; }
  },
  memberEmail: {
    type: String,
    required: function() { return !this.user; }
  },
  memberPosition: {
    type: String,
    required: function() { return !this.user; }
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  tanggal: {
    type: Date,
    default: Date.now
  },
  revisi: {
    type: String,
    default: '0'
  },
  // Job Description Content
  division: {
    type: String,
    required: true
  },
  positionTitle: {
    type: String,
    required: true
  },
  reportsTo: {
    type: String,
    required: true
  },
  responsibilities: [{
    type: String,
    required: true
  }],
  accountabilities: [{
    type: String,
    required: true
  }],
  interactions: {
    internal: [String],
    external: [String]
  },
  competence: {
    managerial: [String],
    technical: [String],
    behavioral: [String],
    skill: [String]
  },
  jobSpecification: {
    age: String,
    education: String,
    nonFormalEducation: String,
    experience: String,
    skills: [String],
    certification: [String]
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date
}, {
  timestamps: true
});

// Index for faster queries
jobDescriptionSchema.index({ user: 1 });
jobDescriptionSchema.index({ memberNoPNK: 1 });
jobDescriptionSchema.index({ department: 1 });
jobDescriptionSchema.index({ status: 1 });

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);