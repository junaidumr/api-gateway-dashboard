require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const [,, name, email, password] = process.argv;

if (!name || !email || !password) {
  console.log('Usage: npm run create-admin -- "Admin Name" "email@example.com" "password"');
  console.log('Example: npm run create-admin -- "John Admin" "john@company.com" "SecurePass123"');
  process.exit(1);
}

const createAdmin = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/api-gateway';
  await mongoose.connect(uri);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (existing.role === 'admin') {
      console.log(`Admin already exists: ${existing.email}`);
    } else {
      existing.role = 'admin';
      await existing.save();
      console.log(`User promoted to admin: ${existing.email}`);
    }
    await mongoose.disconnect();
    return;
  }

  const admin = await User.create({
    name,
    email,
    password,
    role: 'admin',
  });

  console.log('Admin created successfully');
  console.log(`  Name:  ${admin.name}`);
  console.log(`  Email: ${admin.email}`);
  console.log(`  Role:  ${admin.role}`);

  await mongoose.disconnect();
};

createAdmin().catch((err) => {
  console.error('Failed to create admin:', err.message);
  process.exit(1);
});
