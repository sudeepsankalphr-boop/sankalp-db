require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: 'admin@sankalp.com' });
  if (existing) {
    console.log('Admin user already exists');
    process.exit(0);
  }

  await User.create({
    name: 'Admin',
    email: 'admin@sankalp.com',
    password: 'Admin@123',
    role: 'admin',
    active: true,
  });

  console.log('Seed complete: admin@sankalp.com / Admin@123');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
