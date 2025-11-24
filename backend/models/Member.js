const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true,
    default: 'Staff'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  noPNK: {
    type: String,
    sparse: true 
  },
  email: {
    type: String,
    sparse: true 
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

memberSchema.index({ department: 1 });
memberSchema.index({ name: 1 });
memberSchema.index({ user: 1 });

module.exports = mongoose.model('Member', memberSchema);