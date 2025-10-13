const express = require('express');
const { body, validationResult } = require('express-validator');
const JobDescription = require('../models/JobDescription');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/jobdescriptions
// @desc    Get all job descriptions (with filtering)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.user) filter.user = req.query.user;
    if (req.query.memberNoPNK) filter.memberNoPNK = req.query.memberNoPNK;

    const jobDescriptions = await JobDescription.find(filter)
      .populate('user', 'name noPNK email')
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

// @route   GET /api/jobdescriptions/:id
// @desc    Get job description by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const jobDescription = await JobDescription.findById(req.params.id)
      .populate('user', 'name noPNK email')
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');

    if (!jobDescription) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found'
      });
    }

    res.json({
      success: true,
      data: jobDescription
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/jobdescriptions/member/:memberNoPNK
// @desc    Get job description by member PNK
// @access  Private
router.get('/member/:memberNoPNK', auth, async (req, res) => {
  try {
    const jobDescription = await JobDescription.findOne({ 
      memberNoPNK: req.params.memberNoPNK 
    })
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');

    if (!jobDescription) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found for this member'
      });
    }

    res.json({
      success: true,
      data: jobDescription
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/jobdescriptions
// @desc    Create new job description
// @access  Private
router.post('/', [
  auth,
  body('division').notEmpty().withMessage('Division is required'),
  body('positionTitle').notEmpty().withMessage('Position title is required'),
  body('reportsTo').notEmpty().withMessage('Reports to is required'),
  body('responsibilities').isArray({ min: 1 }).withMessage('At least one responsibility is required'),
  body('accountabilities').isArray({ min: 1 }).withMessage('At least one accountability is required'),
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

    const {
      user,
      memberName,
      memberNoPNK,
      memberEmail,
      memberPosition,
      department,
      tanggal,
      revisi,
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

    // Check if job description already exists for this user/member
    const existingJobDesc = user 
      ? await JobDescription.findOne({ user })
      : await JobDescription.findOne({ memberNoPNK });

    if (existingJobDesc) {
      return res.status(400).json({
        success: false,
        message: 'Job description already exists for this user/member'
      });
    }

    const jobDescription = new JobDescription({
      user,
      memberName,
      memberNoPNK,
      memberEmail,
      memberPosition,
      department,
      tanggal,
      revisi,
      division,
      positionTitle,
      reportsTo,
      responsibilities,
      accountabilities,
      interactions,
      competence,
      jobSpecification,
      status: status || 'draft',
      createdBy: req.user._id
    });

    await jobDescription.save();

    const newJobDescription = await JobDescription.findById(jobDescription._id)
      .populate('user', 'name noPNK email')
      .populate('department', 'name code')
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Job description created successfully',
      data: newJobDescription
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/jobdescriptions/:id
// @desc    Update job description
// @access  Private
router.put('/:id', [
  auth,
  body('division').optional().notEmpty().withMessage('Division cannot be empty'),
  body('positionTitle').optional().notEmpty().withMessage('Position title cannot be empty'),
  body('reportsTo').optional().notEmpty().withMessage('Reports to cannot be empty'),
  body('responsibilities').optional().isArray({ min: 1 }).withMessage('At least one responsibility is required'),
  body('accountabilities').optional().isArray({ min: 1 }).withMessage('At least one accountability is required')
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

    const jobDescription = await JobDescription.findById(req.params.id);

    if (!jobDescription) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found'
      });
    }

    const {
      tanggal,
      revisi,
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

    // Update fields
    if (tanggal) jobDescription.tanggal = tanggal;
    if (revisi) jobDescription.revisi = revisi;
    if (division) jobDescription.division = division;
    if (positionTitle) jobDescription.positionTitle = positionTitle;
    if (reportsTo) jobDescription.reportsTo = reportsTo;
    if (responsibilities) jobDescription.responsibilities = responsibilities;
    if (accountabilities) jobDescription.accountabilities = accountabilities;
    if (interactions) jobDescription.interactions = interactions;
    if (competence) jobDescription.competence = competence;
    if (jobSpecification) jobDescription.jobSpecification = jobSpecification;
    if (status) jobDescription.status = status;

    await jobDescription.save();

    const updatedJobDescription = await JobDescription.findById(jobDescription._id)
      .populate('user', 'name noPNK email')
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');

    res.json({
      success: true,
      message: 'Job description updated successfully',
      data: updatedJobDescription
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/jobdescriptions/:id
// @desc    Delete job description
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const jobDescription = await JobDescription.findById(req.params.id);

    if (!jobDescription) {
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

// @route   PUT /api/jobdescriptions/:id/approve
// @desc    Approve job description
// @access  Private
router.put('/:id/approve', auth, async (req, res) => {
  try {
    const jobDescription = await JobDescription.findById(req.params.id);

    if (!jobDescription) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found'
      });
    }

    jobDescription.status = 'approved';
    jobDescription.approvedBy = req.user._id;
    jobDescription.approvedAt = new Date();

    await jobDescription.save();

    const updatedJobDescription = await JobDescription.findById(jobDescription._id)
      .populate('user', 'name noPNK email')
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');

    res.json({
      success: true,
      message: 'Job description approved successfully',
      data: updatedJobDescription
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