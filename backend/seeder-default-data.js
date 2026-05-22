const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Department = require("./models/Department");
const Member = require("./models/Member");
const Role = require("./models/Role");
const User = require("./models/User");
const JobDescription = require("./models/JobDescription");
const JobDescChangeRequest = require("./models/JobDescChangeRequest");
const SOBagianChangeRequest = require("./models/SOBagianChangeRequest");
const SOChangeRequest = require("./models/SOChangeRequest");
const MatriksSkillChangeRequest = require("./models/MatriksSkillChangeRequest");

// Helper function to recursively parse Extended JSON
const parseEJSON = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => parseEJSON(item));
  }

  // Handle $oid
  if (obj.$oid) {
    return obj.$oid; // Mongoose will automatically cast valid string to ObjectId
  }

  // Handle $date
  if (obj.$date) {
    return new Date(obj.$date);
  }

  const result = {};
  for (const key in obj) {
    result[key] = parseEJSON(obj[key]);
  }
  return result;
};

const seedCollection = async (Model, filename, collectionName) => {
  try {
    const filePath = path.join(__dirname, "default_data", filename);
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${collectionName}: file ${filename} not found.`);
      return;
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(rawData);
    
    let parsedData = parseEJSON(jsonData);

    // Specific Collection Fixes
    if (collectionName === "Members") {
      parsedData = parsedData.map(member => {
        if (member.noPNK === null || member.noPNK === "") {
          delete member.noPNK;
        }
        return member;
      });
    }

    if (collectionName === "Job Desc Change Requests" || collectionName === "SO Bagian Change Requests" || collectionName === "SO Change Requests" || collectionName === "Matriks Skill Change Requests") {
      parsedData = parsedData.map(req => {
        if (req.changeType === "create") {
          req.changeType = "add";
        }
        if (collectionName === "SO Bagian Change Requests" && !req.department) {
          req.department = req.proposedData?.departmentName || "Unknown";
        }
        return req;
      });
    }

    // Delete existing
    await Model.deleteMany({});
    console.log(`Cleared existing data in ${collectionName}`);

    // Insert new
    if (parsedData.length > 0) {
      await Model.insertMany(parsedData);
      console.log(`Inserted ${parsedData.length} documents into ${collectionName}`);
    } else {
      console.log(`No documents to insert for ${collectionName}`);
    }
  } catch (error) {
    console.error(`Error seeding ${collectionName}:`, error);
  }
};

const seedAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB for Seeding Default Data");

    await seedCollection(Department, "hr-digital.departments.json", "Departments");
    await seedCollection(Role, "hr-digital.roles.json", "Roles");
    await seedCollection(User, "hr-digital.users.json", "Users");
    await seedCollection(Member, "hr-digital.members.json", "Members");
    await seedCollection(JobDescription, "hr-digital.jobdescriptions.json", "Job Descriptions");
    await seedCollection(JobDescChangeRequest, "hr-digital.jobdescchangerequests.json", "Job Desc Change Requests");
    await seedCollection(SOBagianChangeRequest, "hr-digital.sobagianchangerequests.json", "SO Bagian Change Requests");
    await seedCollection(SOChangeRequest, "hr-digital.sochangerequests.json", "SO Change Requests");
    await seedCollection(MatriksSkillChangeRequest, "hr-digital.matriksskillchangerequests.json", "Matriks Skill Change Requests");

    console.log("All default data seeded successfully!");
  } catch (error) {
    console.error("Database connection error:", error);
  } finally {
    process.exit(0);
  }
};

seedAll();
