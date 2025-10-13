const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Role = require('./models/Role');
const Department = require('./models/Department');
const JobDescription = require('./models/JobDescription');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear ALL existing data including dummy data
    await User.deleteMany({});
    await Role.deleteMany({});
    await Department.deleteMany({});
    await JobDescription.deleteMany({});

    console.log('Cleared ALL existing data including dummy data');

    // Create departments that match the frontend
    const departments = await Department.insertMany([
      {
        code: 'FIN',
        name: 'Finance Department',
        description: 'Finance and Accounting Department'
      },
      {
        code: 'HRGA',
        name: 'HRGA & IT Department',
        description: 'Human Resources and IT Department'
      },
      {
        code: 'MD',
        name: 'Management Development',
        description: 'Management Development Department'
      },
      {
        code: 'MR',
        name: 'Management Representative',
        description: 'Management Representative Department'
      },
      {
        code: 'MFB',
        name: 'Manufacturing Battery',
        description: 'Manufacturing Battery Department'
      },
      {
        code: 'MFC',
        name: 'Manufacturing Cable',
        description: 'Manufacturing Cable Department'
      },
      {
        code: 'MKB',
        name: 'Marketing Battery Department',
        description: 'Marketing Battery Department'
      },
      {
        code: 'MKE',
        name: 'Marketing Engineering',
        description: 'Marketing Engineering Department'
      },
      {
        code: 'SHE',
        name: 'MI & SHE',
        description: 'MI & SHE Department'
      },
      {
        code: 'PPIC',
        name: 'PPIC',
        description: 'PPIC Department'
      },
      {
        code: 'PCH',
        name: 'Purchasing',
        description: 'Purchasing Department'
      },
      {
        code: 'QA',
        name: 'QA Department',
        description: 'Quality Assurance Department'
      }
    ]);

    console.log('Created departments');

    // Create roles
    const roles = await Role.insertMany([
      {
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        permissions: [
          'Admin',
          'HR Manager',
          'View Dashboard',
          'Manage Users',
          'Manage Roles',
          'Manage Departments',
          'System Configuration',
          'View Reports',
          'Export Data',
          'Dashboard Editor',
          'SO Bagian Editor',
          'Dashboard Print'
        ],
        active: true
      },
      {
        name: 'HR Manager',
        description: 'HR department administrator with user management access',
        permissions: [
          'HR Manager',
          'HRGA',
          'IT',
          'View Dashboard',
          'Manage Users',
          'View Roles',
          'View Departments',
          'View Reports',
          'Dashboard Editor',
          'SO Bagian Editor',
          'Dashboard Print'
        ],
        active: true
      },
      {
        name: 'Department Manager',
        description: 'Department-level manager with limited administrative access',
        permissions: [
          'View Dashboard',
          'View Users',
          'View Reports'
        ],
        active: true
      },
      {
        name: 'Dept Head',
        description: 'Department Head with administrative access',
        permissions: [
          'View Dashboard',
          'Manage Users',
          'View Reports'
        ],
        active: true
      },
      {
        name: 'Staff',
        description: 'Standard employee with basic access',
        permissions: [
          'View Dashboard'
        ],
        active: true
      }
    ]);

    console.log('Created roles');

    // Create clean admin user only
    const salt = await bcrypt.genSalt(10);
    const users = [
      {
        noPNK: 'ADM001',
        name: 'System Administrator',
        email: 'admin@hr-digital.com',
        username: 'admin',
        password: await bcrypt.hash('admin123', salt),
        role: roles[0]._id, // Super Admin
        department: departments[1]._id, // HRGA & IT Department
        status: 'active'
      }
    ];

    await User.insertMany(users);

    console.log('Created admin user');

    console.log('\n✅ === SEEDING COMPLETED SUCCESSFULLY === ✅');
    console.log('\n🔑 ADMIN ACCOUNT:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@hr-digital.com');
    console.log('Role: Super Admin');
    console.log('\n📊 DATABASE SEEDED WITH:');
    console.log(`- ${departments.length} Departments (matching frontend)`);
    console.log(`- ${roles.length} Roles`);
    console.log(`- ${users.length} Admin User`);
    console.log('\n🗑️ ALL DUMMY DATA REMOVED');
    console.log('- Removed all existing users, roles, departments, and job descriptions');
    console.log('- Fresh start with clean data structure');

    process.exit(0);

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();