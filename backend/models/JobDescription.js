const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema({
  // Reference to Member (preferred) or User (for backward compatibility)
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: function() { return !this.user; }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.member; }
  },
  // Legacy member information (kept for backward compatibility)
  memberName: {
    type: String,
    required: function() { return !this.user && !this.member; }
  },
  memberNoPNK: {
    type: String,
    required: function() { return !this.user && !this.member; }
  },
  memberEmail: {
    type: String,
    required: function() { return !this.user && !this.member; }
  },
  memberPosition: {
    type: String,
    required: function() { return !this.user && !this.member; }
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
jobDescriptionSchema.index({ member: 1 });
jobDescriptionSchema.index({ memberNoPNK: 1 });
jobDescriptionSchema.index({ department: 1 });
jobDescriptionSchema.index({ status: 1 });

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);