const express = require('express');
const auth = require('../middleware/auth');
const SOBagianDepartment = require('../models/SOBagianDepartment');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const departments = await SOBagianDepartment.find({ deletedAt: null }).sort({ order: 1, name: 1 });
    res.json({ success: true, data: departments });
  } catch (error) {
    console.error('Error fetching SO Bagian departments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;