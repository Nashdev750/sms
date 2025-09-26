const express = require('express');
const router = express.Router();
const { Student, Subject, Grade } = require('../models');
const { generateExcelReport, generatePDFReport } = require('../utils/reportGenerator');

// Reports dashboard
router.get('/', (req, res) => {
  res.render('reports/index', {
    title: 'Reports & Analytics',
    classLevels: ['7', '8', '9'],
    terms: ['1', '2', '3'],
    currentYear: new Date().getFullYear()
  });
});

// Generate ranking report
router.get('/ranking', async (req, res) => {
  try {
    const { class_level, term, year } = req.query;

    if (!class_level || !term || !year) {
      req.flash('error_msg', 'Please select class, term, and year');
      return res.redirect('/reports');
    }

    // Get all students in the class
    const students = await Student.findByClass(class_level);
    
    if (students.length === 0) {
      req.flash('warning_msg', 'No students found for this class');
      return res.redirect('/reports');
    }

    // Calculate rankings
    const rankings = [];
    
    for (const student of students) {
      const grades = await Grade.findByStudentAndTerm(student.id, term, year);
      
      if (grades.length > 0) {
        const totalMarks = grades.reduce((sum, grade) => sum + parseFloat(grade.score), 0);
        const averageScore = totalMarks / grades.length;
        const gradePoints = grades.reduce((sum, grade) => sum + grade.getGradePoints(), 0);
        const averageGradePoints = gradePoints / grades.length;

        rankings.push({
          student,
          totalMarks,
          averageScore: Math.round(averageScore * 100) / 100,
          averageGradePoints: Math.round(averageGradePoints * 100) / 100,
          subjectCount: grades.length,
          grades
        });
      }
    }

    // Sort by average score (descending)
    rankings.sort((a, b) => b.averageScore - a.averageScore);

    // Add rank
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
    });

    // Calculate class statistics
    const classStats = {
      totalStudents: students.length,
      studentsWithGrades: rankings.length,
      classAverage: rankings.length > 0 
        ? Math.round((rankings.reduce((sum, r) => sum + r.averageScore, 0) / rankings.length) * 100) / 100
        : 0,
      highestScore: rankings.length > 0 ? rankings[0].averageScore : 0,
      lowestScore: rankings.length > 0 ? rankings[rankings.length - 1].averageScore : 0
    };

    res.render('reports/ranking', {
      title: `Ranking Report - Grade ${class_level}`,
      classLevel: class_level,
      term,
      year,
      rankings,
      classStats
    });
  } catch (error) {
    console.error('Ranking report error:', error);
    req.flash('error_msg', 'Error generating ranking report');
    res.redirect('/reports');
  }
});

// Export ranking to Excel
router.get('/ranking/excel', async (req, res) => {
  try {
    const { class_level, term, year } = req.query;

    if (!class_level || !term || !year) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const students = await Student.findByClass(class_level);
    const rankings = [];

    for (const student of students) {
      const grades = await Grade.findByStudentAndTerm(student.id, term, year);
      
      if (grades.length > 0) {
        const totalMarks = grades.reduce((sum, grade) => sum + parseFloat(grade.score), 0);
        const averageScore = totalMarks / grades.length;

        rankings.push({
          student,
          totalMarks,
          averageScore: Math.round(averageScore * 100) / 100,
          subjectCount: grades.length,
          grades
        });
      }
    }

    rankings.sort((a, b) => b.averageScore - a.averageScore);
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
    });

    const excelBuffer = await generateExcelReport(rankings, class_level, term, year);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="ranking_grade_${class_level}_term_${term}_${year}.xlsx"`);
    res.send(excelBuffer);
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Error generating Excel report' });
  }
});

// Export ranking to PDF
router.get('/ranking/pdf', async (req, res) => {
  try {
    const { class_level, term, year } = req.query;

    if (!class_level || !term || !year) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const students = await Student.findByClass(class_level);
    const rankings = [];

    for (const student of students) {
      const grades = await Grade.findByStudentAndTerm(student.id, term, year);
      
      if (grades.length > 0) {
        const totalMarks = grades.reduce((sum, grade) => sum + parseFloat(grade.score), 0);
        const averageScore = totalMarks / grades.length;

        rankings.push({
          student,
          totalMarks,
          averageScore: Math.round(averageScore * 100) / 100,
          subjectCount: grades.length,
          grades
        });
      }
    }

    rankings.sort((a, b) => b.averageScore - a.averageScore);
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
    });

    const pdfBuffer = await generatePDFReport(rankings, class_level, term, year);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ranking_grade_${class_level}_term_${term}_${year}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Error generating PDF report' });
  }
});

// Subject performance report
router.get('/subjects', async (req, res) => {
  try {
    const { class_level, term, year } = req.query;

    if (!class_level || !term || !year) {
      req.flash('error_msg', 'Please select class, term, and year');
      return res.redirect('/reports');
    }

    const subjects = await Subject.findByClass(class_level);
    const subjectStats = [];

    for (const subject of subjects) {
      const grades = await Grade.findAll({
        where: { 
          subject_id: subject.id,
          term,
          year
        },
        include: [
          { 
            model: Student, 
            as: 'student',
            where: { class_level: class_level }
          }
        ]
      });

      if (grades.length > 0) {
        const scores = grades.map(grade => parseFloat(grade.score));
        const total = scores.reduce((sum, score) => sum + score, 0);
        const average = total / scores.length;
        const highest = Math.max(...scores);
        const lowest = Math.min(...scores);

        // Calculate grade distribution
        const distribution = {
          A: scores.filter(s => s >= 80).length,
          B: scores.filter(s => s >= 70 && s < 80).length,
          C: scores.filter(s => s >= 60 && s < 70).length,
          D: scores.filter(s => s >= 50 && s < 60).length,
          F: scores.filter(s => s < 50).length
        };

        subjectStats.push({
          subject,
          totalStudents: grades.length,
          average: Math.round(average * 100) / 100,
          highest,
          lowest,
          distribution
        });
      }
    }

    res.render('reports/subjects', {
      title: `Subject Performance - Grade ${class_level}`,
      classLevel: class_level,
      term,
      year,
      subjectStats
    });
  } catch (error) {
    console.error('Subject report error:', error);
    req.flash('error_msg', 'Error generating subject report');
    res.redirect('/reports');
  }
});

module.exports = router;
