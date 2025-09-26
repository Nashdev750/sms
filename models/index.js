const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    define: dbConfig.define
  }
);

// Import models
const Student = require('./Student')(sequelize, Sequelize.DataTypes);
const Subject = require('./Subject')(sequelize, Sequelize.DataTypes);
const Grade = require('./Grade')(sequelize, Sequelize.DataTypes);

// Define associations
Student.hasMany(Grade, { foreignKey: 'student_id', as: 'grades' });
Grade.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

Subject.hasMany(Grade, { foreignKey: 'subject_id', as: 'grades' });
Grade.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

module.exports = {
  sequelize,
  Sequelize,
  Student,
  Subject,
  Grade,
  testConnection
};
