const bcrypt = require('bcrypt');
const sequelize = require('./db');
const User = require('./models/User');

async function seed() {
  await sequelize.sync();

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@mycity.com',
    password: hashedPassword,
    role: 'admin',
  });

  console.log('Admin created:', admin.email);
  process.exit();
}

seed();