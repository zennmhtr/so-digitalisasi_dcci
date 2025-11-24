const express = require('express');
const { body, validationResult } = require('express-validator');
const JobDescription = require('../models/JobDescription');
const User = require('../models/User');
const Member = require('../models/Member');
const Department = require('../models/Department');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const departmentId = req.query.department;

    const filter = {};
    if (departmentId) {
      filter.department = departmentId;
    }

    const jobDescriptions = await JobDescription.find(filter)
      .populate('user', 'name noPNK email')
      .populate('member', 'name noPNK email position')
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await JobDescription.countDocuments(filter);

    res.json({
      success: true,
      data: jobDescriptions,
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

router.get('/:id', auth, async (req, res) => {
  try {
    const jobDesc = await JobDescription.findById(req.params.id)
      .populate('user', 'name noPNK email')
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');

    if (!jobDesc) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found'
      });
    }

    res.json({
      success: true,
      data: jobDesc
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/member/:memberId', auth, async (req, res) => {
  try {
    const memberId = req.params.memberId;
    
    let jobDesc = await JobDescription.findOne({ 
      $or: [
        { member: memberId },
        { user: memberId },
        { memberNoPNK: memberId }
      ]
    })
      .populate('user', 'name noPNK email')
      .populate('member', 'name noPNK email position')
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');

    if (!jobDesc) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found for this member'
      });
    }

    res.json({
      success: true,
      data: jobDesc
    });

  } catch (error) {
    console.error('Error fetching job description by member:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/department/:departmentId', auth, async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    
    const jobDescriptions = await JobDescription.find({ department: departmentId })
      .populate('user', 'name noPNK email')
      .populate('member', 'name noPNK email position')
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: jobDescriptions
    });

  } catch (error) {
    console.error('Error fetching job descriptions by department:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/', [
  auth,
  body('department').notEmpty().withMessage('Department is required'),
  body('division').notEmpty().withMessage('Division is required'),
  body('positionTitle').notEmpty().withMessage('Position title is required'),
  body('reportsTo').notEmpty().withMessage('Reports to is required'),
  body('responsibilities').isArray().withMessage('Responsibilities must be an array'),
  body('accountabilities').isArray().withMessage('Accountabilities must be an array')
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

    const {
      member,
      user,
      memberName,
      memberNoPNK,
      memberEmail,
      memberPosition,
      department,
      division,
      positionTitle,
      reportsTo,
      responsibilities,
      accountabilities,
      interactions,
      competence,
      jobSpecification,
      status
    } = req.body;

    const existingJobDesc = await JobDescription.findOne({
      $or: [
        ...(member ? [{ member }] : []),
        ...(user ? [{ user }] : []),
        ...(memberNoPNK ? [{ memberNoPNK }] : [])
      ]
    });

    if (existingJobDesc) {
      return res.status(400).json({
        success: false,
        message: 'Job description already exists for this member'
      });
    }

    const jobDesc = new JobDescription({
      member: member || null,
      user: user || null,
      memberName,
      memberNoPNK,
      memberEmail,
      memberPosition,
      department,
      division,
      positionTitle,
      reportsTo,
      responsibilities: responsibilities.filter(r => r.trim()),
      accountabilities: accountabilities.filter(a => a.trim()),
      interactions: interactions || { internal: [], external: [] },
      competence: competence || { managerial: [], technical: [], behavioral: [], skill: [] },
      jobSpecification: jobSpecification || {},
      status: status || 'draft',
      createdBy: req.user.id
    });

    await jobDesc.save();

    const newJobDesc = await JobDescription.findById(jobDesc._id)
      .populate('user', 'name noPNK email')
      .populate('member', 'name noPNK email position')
      .populate('department', 'name code')
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Job description created successfully',
      data: newJobDesc
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
  body('division').optional().notEmpty().withMessage('Division cannot be empty'),
  body('positionTitle').optional().notEmpty().withMessage('Position title cannot be empty'),
  body('reportsTo').optional().notEmpty().withMessage('Reports to cannot be empty')
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

    const jobDesc = await JobDescription.findById(req.params.id);

    if (!jobDesc) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found'
      });
    }

    const updateFields = [
      'division', 'positionTitle', 'reportsTo', 'responsibilities', 
      'accountabilities', 'interactions', 'competence', 'jobSpecification', 'status'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        jobDesc[field] = req.body[field];
      }
    });

    await jobDesc.save();

    const updatedJobDesc = await JobDescription.findById(jobDesc._id)
      .populate('user', 'name noPNK email')
      .populate('member', 'name noPNK email position')
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');

    res.json({
      success: true,
      message: 'Job description updated successfully',
      data: updatedJobDesc
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
    const jobDesc = await JobDescription.findById(req.params.id);

    if (!jobDesc) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found'
      });
    }

    await JobDescription.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job description deleted successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.put('/:id/approve', auth, async (req, res) => {
  try {
    const jobDesc = await JobDescription.findById(req.params.id);

    if (!jobDesc) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found'
      });
    }

    jobDesc.status = 'approved';
    jobDesc.approvedBy = req.user.id;
    jobDesc.approvedAt = new Date();

    await jobDesc.save();

    const updatedJobDesc = await JobDescription.findById(jobDesc._id)
      .populate('user', 'name noPNK email')
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');

    res.json({
      success: true,
      message: 'Job description approved successfully',
      data: updatedJobDesc
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