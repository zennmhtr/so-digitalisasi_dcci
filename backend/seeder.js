const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Role = require("./models/Role");
const Department = require("./models/Department");

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Role.deleteMany({});
    await Department.deleteMany({});

    console.log("Cleared existing data");

    // Create departments
    const departments = await Department.insertMany([
      {
        code: "IT",
        name: "Information Technology",
        description: "Handles all technology-related operations and systems",
      },
      {
        code: "HR",
        name: "Human Resources",
        description:
          "Manages employee relations, recruitment, and organizational development",
      },
      {
        code: "FIN",
        name: "Finance",
        description:
          "Oversees financial planning, budgeting, and accounting operations",
      },
      {
        code: "OPS",
        name: "Operations",
        description: "Manages day-to-day business operations and processes",
      },
    ]);

    console.log("Created departments");

    // Create roles
    const roles = await Role.insertMany([
      {
        name: "Super Admin",
        description: "Full system access with all permissions",
        permissions: [
          "View Dashboard",
          "Manage Users",
          "Manage Roles",
          "Manage Departments",
          "System Configuration",
          "View Reports",
          "Export Data",
          "Dashboard Editor",
          "SO Bagian Editor",
          "Dashboard Print",
          "Approve SO Changes", 
          "View Own SO Change Requests", 
        ],
        active: true,
      },
      {
        name: "HR Admin",
        description: "HR department administrator with user management access",
        permissions: [
          "View Dashboard",
          "Manage Users",
          "View Roles",
          "View Departments",
          "View Reports",
          "Dashboard Editor",
          "SO Bagian Editor",
          "Dashboard Print",
          "Approve SO Changes", 
          "View Own SO Change Requests", 
        ],
        active: true,
      },
      {
        name: "Department Manager",
        description:
          "Department-level manager with limited administrative access",
        permissions: [
          "View Dashboard",
          "View Users",
          "View Reports",
          "Approve SO Changes", 
          "View Own SO Change Requests",  
        ],
        active: true,
      },
      {
        name: "Employee",
        description: "Standard employee with basic access",
        permissions: [
          "View Dashboard",
          "View Own SO Change Requests", 
        ],
        active: true,
      },
    ]);

    console.log("Created roles");

    // Create users with hashed passwords
    const salt = await bcrypt.genSalt(10);
    const users = [
      {
        noPNK: "ADM001",
        name: "System Administrator",
        email: "admin@hr-digital.com",
        username: "admin",
        password: await bcrypt.hash("admin123", salt),
        role: roles[0]._id, // Super Admin
        department: departments[0]._id, // IT
        status: "active",
      },
      {
        noPNK: "HR001",
        name: "HR Manager",
        email: "hr.manager@hr-digital.com",
        username: "hrmanager",
        password: await bcrypt.hash("hrmanager123", salt),
        role: roles[0]._id, // Super Admin
        department: departments[1]._id, // HR
        status: "active",
      },
      {
        noPNK: "IT001",
        name: "IT Manager",
        email: "it.manager@hr-digital.com",
        username: "itmanager",
        password: await bcrypt.hash("itmanager123", salt),
        role: roles[2]._id, // Department Manager
        department: departments[0]._id, // IT
        status: "active",
      },
      {
        noPNK: "FIN001",
        name: "Finance Manager",
        email: "finance.manager@hr-digital.com",
        username: "finmanager",
        password: await bcrypt.hash("finmanager123", salt),
        role: roles[2]._id, // Department Manager
        department: departments[2]._id, // Finance
        status: "active",
      },
      {
        noPNK: "EMP001",
        name: "John Doe",
        email: "john.doe@hr-digital.com",
        username: "johndoe",
        password: await bcrypt.hash("employee123", salt),
        role: roles[3]._id, // Employee
        department: departments[3]._id, // Operations
        status: "active",
      },
    ];

    await User.insertMany(users);

    console.log("Created users");

    console.log("\n✅ === SEEDING COMPLETED SUCCESSFULLY === ✅");
    console.log("\n🔑 DEFAULT ADMIN ACCOUNT (FULL ACCESS):");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("Email: admin@hr-digital.com");
    console.log("Role: Super Admin (Can manage everything)");
    console.log("\n👥 OTHER TEST ACCOUNTS:");
    console.log("HR Admin - Username: hrmanager, Password: hrmanager123");
    console.log("IT Manager - Username: itmanager, Password: itmanager123");
    console.log(
      "Finance Manager - Username: finmanager, Password: finmanager123"
    );
    console.log("Employee - Username: johndoe, Password: employee123");
    console.log("\n📊 DATABASE SEEDED WITH:");
    console.log(`- ${departments.length} Departments`);
    console.log(`- ${roles.length} Roles`);
    console.log(`- ${users.length} Users`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
