const express = require('express');
const { body, validationResult } = require('express-validator');
const Department = require('../models/Department');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/departments
// @desc    Get all departments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const departments = await Department.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Department.countDocuments();

    res.json({
      success: true,
      data: departments,
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

// @route   GET /api/departments/:id
// @desc    Get department by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      data: department
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/departments
// @desc    Create new department
// @access  Private
router.post('/', [
  auth,
  body('code').notEmpty().withMessage('Department code is required'),
  body('name').notEmpty().withMessage('Department name is required'),
  body('description').notEmpty().withMessage('Description is required')
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

    const { code, name, description } = req.body;

    // Check if department already exists
    const existingDepartment = await Department.findOne({
      $or: [{ code: code.toUpperCase() }, { name }]
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Department with this code or name already exists'
      });
    }

    const department = new Department({
      code: code.toUpperCase(),
      name,
      description
    });

    await department.save();

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Private
router.put('/:id', [
  auth,
  body('code').optional().notEmpty().withMessage('Department code cannot be empty'),
  body('name').optional().notEmpty().withMessage('Department name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty')
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

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const { code, name, description } = req.body;

    // Check for duplicates if updating unique fields
    if (code || name) {
      const existingDepartment = await Department.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(code ? [{ code: code.toUpperCase() }] : []),
          ...(name ? [{ name }] : [])
        ]
      });

      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Department with this code or name already exists'
        });
      }
    }

    // Update fields
    if (code) department.code = code.toUpperCase();
    if (name) department.name = name;
    if (description) department.description = description;

    await department.save();

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/departments/:id
// @desc    Delete department
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Department deleted successfully'
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