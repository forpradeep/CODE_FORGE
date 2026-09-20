require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');

async function seed() {
  try {
    await mongoose.connect(process.env.DB_CONNECT_STRING);
    console.log("Connected to DB");

    // Check all users
    const allUsers = await User.find({}, 'firstName emailId role');
    console.log("Existing users:", allUsers);

    // Promote all existing users to admin or create seed accounts
    const hashedPassword = await bcrypt.hash('Password@123', 10);

    // 1. Ensure admin@test.com exists
    let admin = await User.findOne({ emailId: 'admin@test.com' });
    if (!admin) {
      await User.create({
        firstName: 'Admin',
        emailId: 'admin@test.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log("Created demo admin account: admin@test.com / Password@123");
    } else {
      admin.role = 'admin';
      admin.password = hashedPassword;
      await admin.save();
      console.log("Updated admin account: admin@test.com / Password@123");
    }

    // 2. Ensure faculty@test.com exists
    let faculty = await User.findOne({ emailId: 'faculty@test.com' });
    if (!faculty) {
      await User.create({
        firstName: 'Professor',
        emailId: 'faculty@test.com',
        password: hashedPassword,
        role: 'faculty'
      });
      console.log("Created demo faculty account: faculty@test.com / Password@123");
    } else {
      faculty.role = 'faculty';
      faculty.password = hashedPassword;
      await faculty.save();
      console.log("Updated faculty account: faculty@test.com / Password@123");
    }

    // 3. Ensure student@test.com exists
    let student = await User.findOne({ emailId: 'student@test.com' });
    if (!student) {
      await User.create({
        firstName: 'Student',
        emailId: 'student@test.com',
        password: hashedPassword,
        role: 'user'
      });
      console.log("Created demo student account: student@test.com / Password@123");
    } else {
      student.password = hashedPassword;
      await student.save();
      console.log("Updated student account: student@test.com / Password@123");
    }

    // Also promote your current pradeep user if present
    const pradeepUser = await User.findOne({ firstName: { $regex: /pradeep/i } });
    if (pradeepUser) {
      pradeepUser.role = 'admin';
      await pradeepUser.save();
      console.log(`Promoted user '${pradeepUser.emailId}' (${pradeepUser.firstName}) to admin!`);
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

seed();
