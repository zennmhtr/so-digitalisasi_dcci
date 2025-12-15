const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Member = require('../models/Member');
const Department = require('../models/Department');
const auth = require('../middleware/auth');

const router = express.Router();

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

    const members = await Member.find(filter)
      .populate('user', 'name noPNK email username')
      .populate('department', 'name code')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const transformedMembers = members.map(member => ({
      id: member._id,
      type: 'member',
      name: member.name,
      noPNK: member.noPNK || (member.user ? member.user.noPNK : null),
      email: member.email || (member.user ? member.user.email : null),
      position: member.position,
      department: member.department,
      user: member.user ? member.user._id : null,
      hasLoginAccount: !!member.user,
      createdAt: member.createdAt
    }));

    const total = await Member.countDocuments(filter);

    res.json({
      success: true,
      data: transformedMembers,
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

router.get('/department/:departmentId', auth, async (req, res) => {
  try {
    const departmentId = req.params.departmentId;

    const members = await Member.find({ department: departmentId })
      .populate('user', 'name noPNK email username')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    const transformedMembers = members.map(member => ({
      id: member._id,
      type: 'member',
      name: member.name,
      noPNK: member.noPNK || (member.user ? member.user.noPNK : null),
      email: member.email || (member.user ? member.user.email : null),
      position: member.position,
      department: member.department,
      user: member.user ? member.user._id : null,
      hasLoginAccount: !!member.user,
      createdAt: member.createdAt
    }));

    res.json({
      success: true,
      data: transformedMembers
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Name is required'),
  body('noPNK').notEmpty().withMessage('No PNK is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('department').notEmpty().withMessage('Department is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, position, department, noPNK, email } = req.body;

    console.log('📥 Received member data:', {
      name,
      noPNK,
      position,
      department
    });

    const existingMember = await Member.findOne({
      name: name,
      department: department
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'Member with this name already exists in the department'
      });
    }

    if (noPNK) {
      const noPNKConflict = await Member.findOne({ noPNK: noPNK });
      if (noPNKConflict) {
        return res.status(400).json({
          success: false,
          message: 'NPK already exists'
        });
      }
    }

    const member = new Member({
      name,
      position,
      department,
      noPNK: noPNK || null,
      email: email || null,
      status: 'active'
    });

    await member.save();

    const newMember = await Member.findById(member._id)
      .populate('department', 'name code');

    const transformedMember = {
      id: newMember._id,
      type: 'member',
      name: newMember.name,
      noPNK: newMember.noPNK,
      email: newMember.email,
      position: newMember.position,
      department: newMember.department,
      user: null,
      hasLoginAccount: false,
      createdAt: newMember.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: transformedMember
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/:id/create-user', [
  auth,
  body('noPNK').notEmpty().withMessage('No PNK is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('username').notEmpty().withMessage('Username is required')
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

    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    if (member.user) {
      return res.status(400).json({
        success: false,
        message: 'Member already has a user account'
      });
    }

    const { noPNK, email, username, password = 'password123' } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { noPNK }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email, NPK, or username already exists'
      });
    }

    const Role = require('../models/Role');
    let role = await Role.findOne({ name: member.position });
    
    if (!role) {
      role = new Role({
        name: member.position,
        description: `Role for ${member.position}`,
        permissions: ['View Dashboard'],
        active: true
      });
      await role.save();
    }

    const user = new User({
      noPNK,
      name: member.name,
      email,
      username,
      password,
      role: role._id,
      department: member.department,
      status: 'active'
    });

    await user.save();

    member.user = user._id;
    member.noPNK = noPNK;
    member.email = email;
    await member.save();

    const updatedMember = await Member.findById(member._id)
      .populate('user', 'name noPNK email username')
      .populate('department', 'name code');

    res.json({
      success: true,
      message: 'User account created successfully',
      data: {
        id: updatedMember._id,
        type: 'member',
        name: updatedMember.name,
        noPNK: updatedMember.noPNK,
        email: updatedMember.email,
        position: updatedMember.position,
        department: updatedMember.department,
        user: updatedMember.user._id,
        hasLoginAccount: true,
        createdAt: updatedMember.createdAt
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

router.put('/:id', [
  auth,
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
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

    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const { name, position, department, noPNK, email } = req.body;

    if (name && name !== member.name) {
      const nameConflict = await Member.findOne({
        _id: { $ne: req.params.id },
        name: name,
        department: department || member.department
      });
      if (nameConflict) {
        return res.status(400).json({
          success: false,
          message: 'Member with this name already exists in the department'
        });
      }
    }

    if (noPNK || email) {
      const conflicts = [];
      
      if (noPNK && noPNK !== member.noPNK) {
        const noPNKConflict = await Member.findOne({ _id: { $ne: req.params.id }, noPNK: noPNK }) || 
                             await User.findOne({ noPNK: noPNK });
        if (noPNKConflict) conflicts.push('NPK');
      }
      
      if (email && email !== member.email) {
        const emailConflict = await Member.findOne({ _id: { $ne: req.params.id }, email: email }) || 
                             await User.findOne({ email: email });
        if (emailConflict) conflicts.push('Email');
      }
      
      if (conflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message: `${conflicts.join(' and ')} already exists`
        });
      }
    }

    if (name) member.name = name;
    if (position) member.position = position;
    if (department) member.department = department;
    if (noPNK !== undefined) member.noPNK = noPNK || null;
    if (email !== undefined) member.email = email || null;

    await member.save();

    if (member.user && (name || position || department || noPNK || email)) {
      const user = await User.findById(member.user);
      if (user) {
        if (name) user.name = name;
        if (department) user.department = department;
        if (noPNK) user.noPNK = noPNK;
        if (email) user.email = email;
        
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
        
        await user.save();
      }
    }

    const updatedMember = await Member.findById(member._id)
      .populate('user', 'name noPNK email username')
      .populate('department', 'name code');

    res.json({
      success: true,
      message: 'Member updated successfully',
      data: {
        id: updatedMember._id,
        type: 'member',
        name: updatedMember.name,
        noPNK: updatedMember.noPNK || (updatedMember.user ? updatedMember.user.noPNK : null),
        email: updatedMember.email || (updatedMember.user ? updatedMember.user.email : null),
        position: updatedMember.position,
        department: updatedMember.department,
        user: updatedMember.user ? updatedMember.user._id : null,
        hasLoginAccount: !!updatedMember.user,
        createdAt: updatedMember.createdAt
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

router.delete('/:id', auth, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const JobDescription = require('../models/JobDescription');
    await JobDescription.deleteMany({ 
      $or: [
        { member: req.params.id },
        { user: member.user }
      ]
    });

    if (member.user) {
      await User.findByIdAndDelete(member.user);
    }

    await Member.findByIdAndDelete(req.params.id);

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