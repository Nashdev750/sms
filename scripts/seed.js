require('dotenv').config({ path: './config.env' });
const { sequelize, Student, Subject, Grade } = require('../models');

// Sample data
const sampleStudents = [
  // Grade 7 Students
  { admission_no: 'JS7-001', name: 'Alice Johnson', class_level: '7' },
  { admission_no: 'JS7-002', name: 'Bob Smith', class_level: '7' },
  { admission_no: 'JS7-003', name: 'Carol Davis', class_level: '7' },
  { admission_no: 'JS7-004', name: 'David Wilson', class_level: '7' },
  { admission_no: 'JS7-005', name: 'Emma Brown', class_level: '7' },
  { admission_no: 'JS7-006', name: 'Frank Miller', class_level: '7' },
  { admission_no: 'JS7-007', name: 'Grace Taylor', class_level: '7' },
  { admission_no: 'JS7-008', name: 'Henry Anderson', class_level: '7' },
  { admission_no: 'JS7-009', name: 'Ivy Thomas', class_level: '7' },
  { admission_no: 'JS7-010', name: 'Jack Jackson', class_level: '7' },
  
  // Grade 8 Students
  { admission_no: 'JS8-001', name: 'Kate White', class_level: '8' },
  { admission_no: 'JS8-002', name: 'Liam Harris', class_level: '8' },
  { admission_no: 'JS8-003', name: 'Maya Martin', class_level: '8' },
  { admission_no: 'JS8-004', name: 'Noah Thompson', class_level: '8' },
  { admission_no: 'JS8-005', name: 'Olivia Garcia', class_level: '8' },
  { admission_no: 'JS8-006', name: 'Peter Martinez', class_level: '8' },
  { admission_no: 'JS8-007', name: 'Quinn Robinson', class_level: '8' },
  { admission_no: 'JS8-008', name: 'Ruby Clark', class_level: '8' },
  { admission_no: 'JS8-009', name: 'Samuel Rodriguez', class_level: '8' },
  { admission_no: 'JS8-010', name: 'Tina Lewis', class_level: '8' },
  
  // Grade 9 Students
  { admission_no: 'JS9-001', name: 'Uma Lee', class_level: '9' },
  { admission_no: 'JS9-002', name: 'Victor Walker', class_level: '9' },
  { admission_no: 'JS9-003', name: 'Wendy Hall', class_level: '9' },
  { admission_no: 'JS9-004', name: 'Xavier Allen', class_level: '9' },
  { admission_no: 'JS9-005', name: 'Yara Young', class_level: '9' },
  { admission_no: 'JS9-006', name: 'Zoe King', class_level: '9' },
  { admission_no: 'JS9-007', name: 'Aaron Wright', class_level: '9' },
  { admission_no: 'JS9-008', name: 'Bella Lopez', class_level: '9' },
  { admission_no: 'JS9-009', name: 'Caleb Hill', class_level: '9' },
  { admission_no: 'JS9-010', name: 'Diana Scott', class_level: '9' }
];

const sampleSubjects = [
  // Grade 7 Subjects
  { name: 'Mathematics', class_level: '7' },
  { name: 'English Language', class_level: '7' },
  { name: 'Kiswahili', class_level: '7' },
  { name: 'Science', class_level: '7' },
  { name: 'Social Studies', class_level: '7' },
  { name: 'Religious Education', class_level: '7' },
  { name: 'Creative Arts', class_level: '7' },
  { name: 'Physical Education', class_level: '7' },
  
  // Grade 8 Subjects
  { name: 'Mathematics', class_level: '8' },
  { name: 'English Language', class_level: '8' },
  { name: 'Kiswahili', class_level: '8' },
  { name: 'Integrated Science', class_level: '8' },
  { name: 'Social Studies', class_level: '8' },
  { name: 'Religious Education', class_level: '8' },
  { name: 'Business Studies', class_level: '8' },
  { name: 'Agriculture', class_level: '8' },
  { name: 'Computer Studies', class_level: '8' },
  
  // Grade 9 Subjects
  { name: 'Mathematics', class_level: '9' },
  { name: 'English Language', class_level: '9' },
  { name: 'Kiswahili', class_level: '9' },
  { name: 'Biology', class_level: '9' },
  { name: 'Chemistry', class_level: '9' },
  { name: 'Physics', class_level: '9' },
  { name: 'History', class_level: '9' },
  { name: 'Geography', class_level: '9' },
  { name: 'Religious Education', class_level: '9' },
  { name: 'Business Studies', class_level: '9' },
  { name: 'Agriculture', class_level: '9' },
  { name: 'Computer Studies', class_level: '9' }
];

// Function to generate random grade
function generateRandomGrade() {
  // Generate grades with realistic distribution
  const rand = Math.random();
  if (rand < 0.1) return Math.floor(Math.random() * 20) + 80; // 10% A grades (80-100)
  if (rand < 0.3) return Math.floor(Math.random() * 20) + 60; // 20% B grades (60-79)
  if (rand < 0.6) return Math.floor(Math.random() * 20) + 40; // 30% C grades (40-59)
  if (rand < 0.85) return Math.floor(Math.random() * 20) + 20; // 25% D grades (20-39)
  return Math.floor(Math.random() * 20); // 15% F grades (0-19)
}

// Function to generate sample grades
function generateSampleGrades(students, subjects, term, year) {
  const grades = [];
  
  students.forEach(student => {
    const studentSubjects = subjects.filter(subject => subject.class_level === student.class_level);
    
    studentSubjects.forEach(subject => {
      grades.push({
        student_id: student.id,
        subject_id: subject.id,
        term: term,
        year: year,
        score: generateRandomGrade()
      });
    });
  });
  
  return grades;
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database synchronized');
    
    // Create students
    console.log('👥 Creating students...');
    const createdStudents = await Student.bulkCreate(sampleStudents);
    console.log(`✅ Created ${createdStudents.length} students`);
    
    // Create subjects
    console.log('📚 Creating subjects...');
    const createdSubjects = await Subject.bulkCreate(sampleSubjects);
    console.log(`✅ Created ${createdSubjects.length} subjects`);
    
    // Generate grades for current term
    const currentYear = new Date().getFullYear();
    const currentTerm = '1';
    
    console.log('📊 Generating grades...');
    const sampleGrades = generateSampleGrades(createdStudents, createdSubjects, currentTerm, currentYear);
    const createdGrades = await Grade.bulkCreate(sampleGrades);
    console.log(`✅ Created ${createdGrades.length} grades for Term ${currentTerm}, ${currentYear}`);
    
    // Generate some historical data (previous terms)
    console.log('📈 Generating historical data...');
    const previousTerm = '3';
    const previousYear = currentYear - 1;
    const historicalGrades = generateSampleGrades(createdStudents, createdSubjects, previousTerm, previousYear);
    await Grade.bulkCreate(historicalGrades);
    console.log(`✅ Created ${historicalGrades.length} historical grades for Term ${previousTerm}, ${previousYear}`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Students: ${createdStudents.length}`);
    console.log(`   - Subjects: ${createdSubjects.length}`);
    console.log(`   - Current Grades: ${createdGrades.length}`);
    console.log(`   - Historical Grades: ${historicalGrades.length}`);
    console.log('\n🚀 You can now start the application with: npm start');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
