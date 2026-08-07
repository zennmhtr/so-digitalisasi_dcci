const express = require('express');
const { body, validationResult } = require('express-validator');
const Role = require('../models/Role');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const skip = (page - 1) * limit;

    const roles = await Role.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Role.countDocuments();

    res.json({
      success: true,
      data: roles,
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
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: role
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
  body('name').notEmpty().withMessage('Role name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('permissions').isArray({ min: 1 }).withMessage('At least one permission is required')
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

    const { name, description, permissions, active } = req.body;

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role with this name already exists'
      });
    }

    const role = new Role({
      name,
      description,
      permissions,
      active: active !== undefined ? active : true
    });

    await role.save();

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
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
  body('name').optional().notEmpty().withMessage('Role name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('permissions').optional().isArray({ min: 1 }).withMessage('At least one permission is required')
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

    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    const { name, description, permissions, active } = req.body;

    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ name });
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'Role with this name already exists'
        });
      }
    }

    if (name) role.name = name;
    if (description) role.description = description;
    if (permissions) role.permissions = permissions;
    if (active !== undefined) role.active = active;

    await role.save();

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: role
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
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    await Role.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Role deleted successfully'
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