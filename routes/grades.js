const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Student, Subject, Grade } = require('../models');

// Grade entry page
router.get('/entry', async (req, res) => {
  try {
    const { class: classLevel, term, year } = req.query;

    if (!classLevel || !term || !year) {
      req.flash('error_msg', 'Please select class, term, and year');
      return res.redirect('/dashboard/select-class');
    }

    // Get students and subjects for the selected class
    const [students, subjects] = await Promise.all([
      Student.findByClass(classLevel),
      Subject.findByClass(classLevel)
    ]);

    if (students.length === 0) {
      req.flash('warning_msg', 'No students found for this class');
      return res.redirect('/students');
    }

    if (subjects.length === 0) {
      req.flash('warning_msg', 'No subjects found for this class');
      return res.redirect('/subjects');
    }

    // Get existing grades
    const existingGrades = await Grade.findAll({
      where: { term, year },
      include: [
        { 
          model: Student, 
          as: 'student',
          where: { class_level: classLevel }
        },
        { model: Subject, as: 'subject' }
      ]
    });

    // Create a map for quick grade lookup
    const gradeMap = {};
    existingGrades.forEach(grade => {
      const key = `${grade.student_id}-${grade.subject_id}`;
      gradeMap[key] = grade.score;
    });

    res.render('grades/entry', {
      title: `Grade Entry - Grade ${classLevel}`,
      students,
      subjects,
      classLevel,
      term,
      year,
      gradeMap
    });
  } catch (error) {
    console.error('Grade entry error:', error);
    req.flash('error_msg', 'Error loading grade entry page');
    res.redirect('/dashboard');
  }
});

// Auto-save single grade
router.post('/save-single', async (req, res) => {
  try {
    const { student_id, subject_id, score } = req.body;
    
    if (!student_id || !subject_id || score === undefined) {
      return res.json({ success: false, message: 'Missing required fields' });
    }
    
    // Get class level from student
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.json({ success: false, message: 'Student not found' });
    }
    
    // Get current term and year from query or use defaults
    const term = req.query.term || '1';
    const year = req.query.year || new Date().getFullYear();
    
    // Find or create grade
    const [grade, created] = await Grade.findOrCreate({
      where: {
        student_id: parseInt(student_id),
        subject_id: parseInt(subject_id),
        term: term,
        year: parseInt(year)
      },
      defaults: {
        student_id: parseInt(student_id),
        subject_id: parseInt(subject_id),
        term: term,
        year: parseInt(year),
        score: parseFloat(score) || 0
      }
    });
    
    if (!created) {
      // Update existing grade
      await grade.update({ score: parseFloat(score) || 0 });
    }
    
    res.json({ success: true, message: 'Grade saved successfully' });
  } catch (error) {
    console.error('Auto-save grade error:', error);
    res.json({ success: false, message: 'Error saving grade' });
  }
});

// Save grades
router.post('/save', [
  body('class_level').isIn(['7', '8', '9']).withMessage('Invalid class level'),
  body('term').isIn(['1', '2', '3']).withMessage('Invalid term'),
  body('year').isInt({ min: 2020, max: 2030 }).withMessage('Invalid year'),
  body('grades').isArray().withMessage('Grades must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error_msg', 'Invalid form data');
      return res.redirect('/dashboard/select-class');
    }

    const { class_level, term, year, grades } = req.body;

    // Validate grades data
    const validGrades = grades.filter(grade => 
      grade.student_id && 
      grade.subject_id && 
      grade.score !== '' && 
      !isNaN(grade.score) &&
      parseFloat(grade.score) >= 0 &&
      parseFloat(grade.score) <= 100
    );

    if (validGrades.length === 0) {
      req.flash('warning_msg', 'No valid grades to save');
      return res.redirect(`/grades/entry?class=${class_level}&term=${term}&year=${year}`);
    }

    // Use transaction for data consistency
    const transaction = await require('../models').sequelize.transaction();

    try {
      // Delete existing grades for this term/year/class
      await Grade.destroy({
        where: {
          term,
          year,
          student_id: {
            [require('sequelize').Op.in]: validGrades.map(g => g.student_id)
          }
        },
        transaction
      });

      // Insert new grades
      const gradeData = validGrades.map(grade => ({
        student_id: parseInt(grade.student_id),
        subject_id: parseInt(grade.subject_id),
        term,
        year: parseInt(year),
        score: parseFloat(grade.score)
      }));

      await Grade.bulkCreate(gradeData, { transaction });

      await transaction.commit();

      req.flash('success_msg', `${validGrades.length} grades saved successfully`);
      res.redirect(`/grades/entry?class=${class_level}&term=${term}&year=${year}`);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Save grades error:', error);
    req.flash('error_msg', 'Error saving grades');
    res.redirect('/dashboard/select-class');
  }
});

// View grades for a specific student
router.get('/student/:id', async (req, res) => {
  try {
    const { term, year } = req.query;
    const studentId = req.params.id;

    if (!term || !year) {
      req.flash('error_msg', 'Please select term and year');
      return res.redirect('/dashboard');
    }

    const student = await Student.findByPk(studentId);
    if (!student) {
      req.flash('error_msg', 'Student not found');
      return res.redirect('/students');
    }

    const grades = await Grade.findByStudentAndTerm(studentId, term, year);

    res.render('grades/student', {
      title: `Grades - ${student.name}`,
      student,
      grades,
      term,
      year
    });
  } catch (error) {
    console.error('Student grades error:', error);
    req.flash('error_msg', 'Error loading student grades');
    res.redirect('/students');
  }
});

// View grades for a class
router.get('/class', async (req, res) => {
  try {
    const { class: classLevel, term, year } = req.query;

    if (!classLevel || !term || !year) {
      req.flash('error_msg', 'Please select class, term, and year');
      return res.redirect('/dashboard');
    }

    const grades = await Grade.findByClassAndTerm(classLevel, term, year);

    // Group grades by student
    const studentGrades = {};
    grades.forEach(grade => {
      const studentId = grade.student_id;
      if (!studentGrades[studentId]) {
        studentGrades[studentId] = {
          student: grade.student,
          grades: []
        };
      }
      studentGrades[studentId].grades.push(grade);
    });

    res.render('grades/class', {
      title: `Class Grades - Grade ${classLevel}`,
      classLevel,
      term,
      year,
      studentGrades: Object.values(studentGrades)
    });
  } catch (error) {
    console.error('Class grades error:', error);
    req.flash('error_msg', 'Error loading class grades');
    res.redirect('/dashboard');
  }
});

module.exports = router;
