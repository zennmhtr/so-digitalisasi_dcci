const mongoose = require('mongoose');
const User = require('./models/User');
const Member = require('./models/Member');
const Role = require('./models/Role');
const Department = require('./models/Department');
const JobDescription = require('./models/JobDescription');

require('dotenv').config();

const migrateUsersToMembers = async () => {
  try {
    console.log('🔄 Starting migration: Users to Members');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({})
      .populate('role', 'name')
      .populate('department', 'name code');

    console.log(`📊 Found ${users.length} users to migrate`);

    for (const user of users) {
      // Check if member already exists
      const existingMember = await Member.findOne({ user: user._id });

      if (!existingMember) {
        // Create new member record
        const member = new Member({
          name: user.name,
          position: user.role?.name || 'Staff',
          department: user.department._id,
          noPNK: user.noPNK,
          email: user.email,
          user: user._id,
          status: user.status
        });

        await member.save();
        console.log(`✅ Created member record for: ${user.name}`);

        // Update job descriptions to reference the new member
        const jobDescriptions = await JobDescription.find({ user: user._id });

        for (const jobDesc of jobDescriptions) {
          jobDesc.member = member._id;
          await jobDesc.save();
          console.log(`✅ Updated job description ${jobDesc._id} to reference member ${member._id}`);
        }
      } else {
        console.log(`⚠️ Member already exists for user: ${user.name}`);
      }
    }

    console.log('✅ Migration completed successfully');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrateUsersToMembers();