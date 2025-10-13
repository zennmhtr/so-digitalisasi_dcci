const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Department = require('../models/Department');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/members
// @desc    Get all members (both users and non-user members)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const departmentId = req.query.department;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (departmentId) {
      filter.department = departmentId;
    }

    // Get users from the department
    const users = await User.find(filter)
      .select('-password')
      .populate('role', 'name')
      .populate('department', 'name code')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Transform users to member format
    const members = users.map(user => ({
      id: user._id,
      type: 'user',
      name: user.name,
      noPNK: user.noPNK,
      email: user.email,
      position: user.role?.name || 'Staff',
      department: user.department,
      user: user._id,
      createdAt: user.createdAt
    }));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: members,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/members/department/:departmentId
// @desc    Get all members by department
// @access  Private
router.get('/department/:departmentId', auth, async (req, res) => {
  try {
    const departmentId = req.params.departmentId;

    // Get users from the department
    const users = await User.find({ department: departmentId })
      .select('-password')
      .populate('role', 'name')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    // Transform users to member format
    const members = users.map(user => ({
      id: user._id,
      type: 'user',
      name: user.name,
      noPNK: user.noPNK,
      email: user.email,
      position: user.role?.name || 'Staff',
      department: user.department,
      user: user._id,
      createdAt: user.createdAt
    }));

    res.json({
      success: true,
      data: members
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/members
// @desc    Create new member (as user)
// @access  Private
router.post('/', [
  auth,
  body('noPNK').notEmpty().withMessage('No PNK is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('department').notEmpty().withMessage('Department is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { noPNK, name, email, position, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { noPNK }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Member with this email or No PNK already exists'
      });
    }

    // Find or create a role for the position
    const Role = require('../models/Role');
    let role = await Role.findOne({ name: position });
    
    if (!role) {
      // Create a basic role if not exists
      role = new Role({
        name: position,
        description: `Role for ${position}`,
        permissions: ['View Dashboard'],
        active: true
      });
      await role.save();
    }

    // Generate username from name (simple approach)
    const username = name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
    const defaultPassword = 'password123'; // Should be changed on first login

    const user = new User({
      noPNK,
      name,
      email,
      username,
      password: defaultPassword,
      role: role._id,
      department,
      status: 'active'
    });

    await user.save();

    const newUser = await User.findById(user._id)
      .select('-password')
      .populate('role', 'name')
      .populate('department', 'name code');

    // Transform to member format
    const member = {
      id: newUser._id,
      type: 'user',
      name: newUser.name,
      noPNK: newUser.noPNK,
      email: newUser.email,
      position: newUser.role?.name || 'Staff',
      department: newUser.department,
      user: newUser._id,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: member
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/members/:id
// @desc    Update member
// @access  Private
router.put('/:id', [
  auth,
  body('noPNK').optional().notEmpty().withMessage('No PNK cannot be empty'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('position').optional().notEmpty().withMessage('Position cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const { noPNK, name, email, position, department } = req.body;

    // Check for duplicates if updating unique fields
    if (email || noPNK) {
      const existingUser = await User.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(email ? [{ email }] : []),
          ...(noPNK ? [{ noPNK }] : [])
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Member with this email or No PNK already exists'
        });
      }
    }

    // Update role if position changed
    if (position) {
      const Role = require('../models/Role');
      let role = await Role.findOne({ name: position });
      
      if (!role) {
        role = new Role({
          name: position,
          description: `Role for ${position}`,
          permissions: ['View Dashboard'],
          active: true
        });
        await role.save();
      }
      user.role = role._id;
    }

    // Update fields
    if (noPNK) user.noPNK = noPNK;
    if (name) user.name = name;
    if (email) user.email = email;
    if (department) user.department = department;

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('role', 'name')
      .populate('department', 'name code');

    // Transform to member format
    const member = {
      id: updatedUser._id,
      type: 'user',
      name: updatedUser.name,
      noPNK: updatedUser.noPNK,
      email: updatedUser.email,
      position: updatedUser.role?.name || 'Staff',
      department: updatedUser.department,
      user: updatedUser._id,
      createdAt: updatedUser.createdAt
    };

    res.json({
      success: true,
      message: 'Member updated successfully',
      data: member
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/members/:id
// @desc    Delete member
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Also delete related job descriptions
    const JobDescription = require('../models/JobDescription');
    await JobDescription.deleteMany({ user: req.params.id });

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Member and related data deleted successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;