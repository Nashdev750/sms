const express = require('express');
const router = express.Router();
const { Student, Subject, Grade } = require('../models');

// Dashboard home
router.get('/', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentTerm = '1';

    // Get statistics for all classes
    const stats = {};
    const classLevels = ['7', '8', '9'];

    for (const classLevel of classLevels) {
      try {
        const studentCount = await Student.count({ where: { class_level: classLevel } });
        const subjectCount = await Subject.count({ where: { class_level: classLevel } });
        
        // Get grade statistics for current term
        const grades = await Grade.findAll({
          include: [
            { 
              model: Student, 
              as: 'student',
              where: { class_level: classLevel }
            }
          ],
          where: { 
            term: currentTerm,
            year: currentYear
          }
        });

        const totalGrades = grades.length;
        const averageScore = totalGrades > 0 
          ? grades.reduce((sum, grade) => sum + parseFloat(grade.score), 0) / totalGrades
          : 0;

        stats[`grade${classLevel}`] = {
          studentCount: studentCount || 0,
          subjectCount: subjectCount || 0,
          totalGrades: totalGrades || 0,
          averageScore: Math.round(averageScore * 100) / 100
        };
      } catch (error) {
        console.error(`Error getting stats for grade ${classLevel}:`, error);
        // Set default values if there's an error
        stats[`grade${classLevel}`] = {
          studentCount: 0,
          subjectCount: 0,
          totalGrades: 0,
          averageScore: 0
        };
      }
    }

    res.render('dashboard/index', {
      title: 'Dashboard',
      stats,
      currentYear,
      currentTerm,
      classLevels
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error_msg', 'Error loading dashboard data');
    // Set default stats structure
    const defaultStats = {};
    ['7', '8', '9'].forEach(classLevel => {
      defaultStats[`grade${classLevel}`] = {
        studentCount: 0,
        subjectCount: 0,
        totalGrades: 0,
        averageScore: 0
      };
    });

    res.render('dashboard/index', {
      title: 'Dashboard',
      stats: defaultStats,
      currentYear: new Date().getFullYear(),
      currentTerm: '1',
      classLevels: ['7', '8', '9']
    });
  }
});

// Class selection for grade entry
router.get('/select-class', (req, res) => {
  res.render('dashboard/select-class', {
    title: 'Select Class for Grade Entry',
    classLevels: ['7', '8', '9'],
    terms: ['1', '2', '3'],
    currentYear: new Date().getFullYear()
  });
});

// Process class selection
router.post('/select-class', (req, res) => {
  const { class_level, term, year } = req.body;
  
  if (!class_level || !term || !year) {
    req.flash('error_msg', 'Please select class, term, and year');
    return res.redirect('/dashboard/select-class');
  }

  res.redirect(`/grades/entry?class=${class_level}&term=${term}&year=${year}`);
});

module.exports = router;
