const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Subject } = require('../models');

// Get all subjects
router.get('/', async (req, res) => {
  try {
    const { class_level } = req.query;
    let subjects;

    if (class_level) {
      subjects = await Subject.findByClass(class_level);
    } else {
      subjects = await Subject.findAll({
        order: [['class_level', 'ASC'], ['name', 'ASC']]
      });
    }

    res.render('subjects/index', {
      title: 'Subjects Management',
      subjects,
      selectedClass: class_level,
      classLevels: ['7', '8', '9']
    });
  } catch (error) {
    console.error('Subjects index error:', error);
    req.flash('error_msg', 'Error loading subjects');
    res.redirect('/dashboard');
  }
});

// Show add subject form
router.get('/add', (req, res) => {
  res.render('subjects/add', {
    title: 'Add New Subject',
    classLevels: ['7', '8', '9'],
    formData: {},
    errors: []
  });
});

// Create new subject
router.post('/add', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Subject name is required and must be less than 100 characters'),
  body('class_level')
    .isIn(['7', '8', '9'])
    .withMessage('Please select a valid class level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('subjects/add', {
        title: 'Add New Subject',
        classLevels: ['7', '8', '9'],
        errors: errors.array(),
        formData: req.body
      });
    }

    const { name, class_level } = req.body;

    // Check if subject already exists for this class
    const existingSubject = await Subject.findByNameAndClass(name, class_level);
    if (existingSubject) {
      return res.render('subjects/add', {
        title: 'Add New Subject',
        classLevels: ['7', '8', '9'],
        errors: [{ msg: 'Subject already exists for this class level' }],
        formData: req.body
      });
    }

    await Subject.create({
      name,
      class_level
    });

    req.flash('success_msg', 'Subject added successfully');
    res.redirect('/subjects');
  } catch (error) {
    console.error('Add subject error:', error);
    req.flash('error_msg', 'Error adding subject');
    res.redirect('/subjects/add');
  }
});

// Show edit subject form
router.get('/edit/:id', async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      req.flash('error_msg', 'Subject not found');
      return res.redirect('/subjects');
    }

    res.render('subjects/edit', {
      title: 'Edit Subject',
      subject,
      classLevels: ['7', '8', '9'],
      errors: []
    });
  } catch (error) {
    console.error('Edit subject error:', error);
    req.flash('error_msg', 'Error loading subject');
    res.redirect('/subjects');
  }
});

// Update subject
router.post('/edit/:id', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Subject name is required and must be less than 100 characters'),
  body('class_level')
    .isIn(['7', '8', '9'])
    .withMessage('Please select a valid class level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const subject = await Subject.findByPk(req.params.id);
      return res.render('subjects/edit', {
        title: 'Edit Subject',
        subject,
        classLevels: ['7', '8', '9'],
        errors: errors.array()
      });
    }

    const { name, class_level } = req.body;
    const subject = await Subject.findByPk(req.params.id);

    if (!subject) {
      req.flash('error_msg', 'Subject not found');
      return res.redirect('/subjects');
    }

    // Check if subject already exists for this class (excluding current subject)
    const existingSubject = await Subject.findOne({
      where: {
        name,
        class_level,
        id: { [require('sequelize').Op.ne]: req.params.id }
      }
    });

    if (existingSubject) {
      return res.render('subjects/edit', {
        title: 'Edit Subject',
        subject,
        classLevels: ['7', '8', '9'],
        errors: [{ msg: 'Subject already exists for this class level' }]
      });
    }

    await subject.update({
      name,
      class_level
    });

    req.flash('success_msg', 'Subject updated successfully');
    res.redirect('/subjects');
  } catch (error) {
    console.error('Update subject error:', error);
    req.flash('error_msg', 'Error updating subject');
    res.redirect(`/subjects/edit/${req.params.id}`);
  }
});

// Delete subject
router.post('/delete/:id', async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      req.flash('error_msg', 'Subject not found');
      return res.redirect('/subjects');
    }

    await subject.destroy();
    req.flash('success_msg', 'Subject deleted successfully');
    res.redirect('/subjects');
  } catch (error) {
    console.error('Delete subject error:', error);
    req.flash('error_msg', 'Error deleting subject');
    res.redirect('/subjects');
  }
});

module.exports = router;
