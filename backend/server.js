const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./db');
const User = require('./models/User');
const Report = require('./models/Report');
const Confirmation = require('./models/Confirmation');
const reportRoutes = require('./routes/reports');
const authRoutes = require('./routes/auth');
const WorkOrder = require('./models/WorkOrder');
const workOrderRoutes = require('./routes/workorders');
const Announcement = require('./models/Announcement');
const announcementRoutes = require('./routes/announcements');
const statsRoutes = require('./routes/stats');
const Asset = require('./models/Asset');
const assetRoutes = require('./routes/assets');
const Budget = require('./models/Budget');
const budgetRoutes = require('./routes/budgets');

sequelize.sync({ alter: true })
  .then(() => console.log('Database synced — tables ready'))
  .catch((err) => console.error('Sync failed:', err));

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/workorders', workOrderRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/budgets', budgetRoutes);


app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});