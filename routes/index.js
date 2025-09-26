const express = require('express');
const router = express.Router();

// Import route modules
const dashboardRoutes = require('./dashboard');
const studentRoutes = require('./students');
const subjectRoutes = require('./subjects');
const gradeRoutes = require('./grades');
const reportRoutes = require('./reports');

// Home route
router.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Mount routes
router.use('/dashboard', dashboardRoutes);
router.use('/students', studentRoutes);
router.use('/subjects', subjectRoutes);
router.use('/grades', gradeRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
