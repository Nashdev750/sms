const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Student } = require('../models');

// Get all students
router.get('/', async (req, res) => {
  try {
    const { class_level } = req.query;
    let students;

    if (class_level) {
      students = await Student.findByClass(class_level);
    } else {
      students = await Student.findAll({
        order: [['class_level', 'ASC'], ['name', 'ASC']]
      });
    }

    res.render('students/index', {
      title: 'Students Management',
      students,
      selectedClass: class_level,
      classLevels: ['7', '8', '9']
    });
  } catch (error) {
    console.error('Students index error:', error);
    req.flash('error_msg', 'Error loading students');
    res.redirect('/dashboard');
  }
});

// Show add student form
router.get('/add', (req, res) => {
  res.render('students/add', {
    title: 'Add New Student',
    classLevels: ['7', '8', '9'],
    formData: {},
    errors: []
  });
});

// Create new student
router.post('/add', [
  body('admission_no')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Admission number is required and must be less than 20 characters'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be less than 100 characters'),
  body('class_level')
    .isIn(['7', '8', '9'])
    .withMessage('Please select a valid class level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('students/add', {
        title: 'Add New Student',
        classLevels: ['7', '8', '9'],
        errors: errors.array(),
        formData: req.body
      });
    }

    const { admission_no, name, class_level } = req.body;

    // Check if admission number already exists
    const existingStudent = await Student.findByAdmissionNo(admission_no);
    if (existingStudent) {
      return res.render('students/add', {
        title: 'Add New Student',
        classLevels: ['7', '8', '9'],
        errors: [{ msg: 'Admission number already exists' }],
        formData: req.body
      });
    }

    await Student.create({
      admission_no,
      name,
      class_level
    });

    req.flash('success_msg', 'Student added successfully');
    res.redirect('/students');
  } catch (error) {
    console.error('Add student error:', error);
    req.flash('error_msg', 'Error adding student');
    res.redirect('/students/add');
  }
});

// Show edit student form
router.get('/edit/:id', async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      req.flash('error_msg', 'Student not found');
      return res.redirect('/students');
    }

    res.render('students/edit', {
      title: 'Edit Student',
      student,
      classLevels: ['7', '8', '9'],
      errors: []
    });
  } catch (error) {
    console.error('Edit student error:', error);
    req.flash('error_msg', 'Error loading student');
    res.redirect('/students');
  }
});

// Update student
router.post('/edit/:id', [
  body('admission_no')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Admission number is required and must be less than 20 characters'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be less than 100 characters'),
  body('class_level')
    .isIn(['7', '8', '9'])
    .withMessage('Please select a valid class level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const student = await Student.findByPk(req.params.id);
      return res.render('students/edit', {
        title: 'Edit Student',
        student,
        classLevels: ['7', '8', '9'],
        errors: errors.array()
      });
    }

    const { admission_no, name, class_level } = req.body;
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      req.flash('error_msg', 'Student not found');
      return res.redirect('/students');
    }

    // Check if admission number already exists (excluding current student)
    const existingStudent = await Student.findOne({
      where: {
        admission_no,
        id: { [require('sequelize').Op.ne]: req.params.id }
      }
    });

    if (existingStudent) {
      return res.render('students/edit', {
        title: 'Edit Student',
        student,
        classLevels: ['7', '8', '9'],
        errors: [{ msg: 'Admission number already exists' }]
      });
    }

    await student.update({
      admission_no,
      name,
      class_level
    });

    req.flash('success_msg', 'Student updated successfully');
    res.redirect('/students');
  } catch (error) {
    console.error('Update student error:', error);
    req.flash('error_msg', 'Error updating student');
    res.redirect(`/students/edit/${req.params.id}`);
  }
});

// Delete student
router.post('/delete/:id', async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      req.flash('error_msg', 'Student not found');
      return res.redirect('/students');
    }

    await student.destroy();
    req.flash('success_msg', 'Student deleted successfully');
    res.redirect('/students');
  } catch (error) {
    console.error('Delete student error:', error);
    req.flash('error_msg', 'Error deleting student');
    res.redirect('/students');
  }
});

module.exports = router;
