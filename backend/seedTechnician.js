const bcrypt = require('bcrypt');
const sequelize = require('./db');
const User = require('./models/User');

async function seed() {
  await sequelize.sync();

  const hashedPassword = await bcrypt.hash('tech123', 10);

  const technician = await User.create({
    name: 'Kamal Tech',
    email: 'kamal@mycity.com',
    password: hashedPassword,
    role: 'technician',
  });

  console.log('Technician created:', technician.email);
  process.exit();
}

seed();