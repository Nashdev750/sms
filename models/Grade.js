module.exports = (sequelize, DataTypes) => {
  const Grade = sequelize.define('Grade', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      }
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'subjects',
        key: 'id'
      }
    },
    term: {
      type: DataTypes.ENUM('1', '2', '3'),
      allowNull: false,
      validate: {
        isIn: [['1', '2', '3']]
      }
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 2020,
        max: 2030
      }
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    }
  }, {
    tableName: 'grades',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'subject_id', 'term', 'year']
      },
      {
        fields: ['student_id', 'term', 'year']
      },
      {
        fields: ['subject_id', 'term', 'year']
      }
    ]
  });

  // Instance methods
  Grade.prototype.getGradeLetter = function() {
    const score = parseFloat(this.score);
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  Grade.prototype.getGradePoints = function() {
    const score = parseFloat(this.score);
    if (score >= 80) return 4.0;
    if (score >= 70) return 3.0;
    if (score >= 60) return 2.0;
    if (score >= 50) return 1.0;
    return 0.0;
  };

  // Class methods
  Grade.findByStudentAndTerm = function(studentId, term, year) {
    return this.findAll({
      where: { 
        student_id: studentId,
        term: term,
        year: year
      },
      include: [
        { model: sequelize.models.Subject, as: 'subject' }
      ]
    });
  };

  Grade.findByClassAndTerm = function(classLevel, term, year) {
    return this.findAll({
      include: [
        { 
          model: sequelize.models.Student, 
          as: 'student',
          where: { class_level: classLevel }
        },
        { model: sequelize.models.Subject, as: 'subject' }
      ],
      where: { term, year }
    });
  };

  Grade.calculateStudentAverage = async function(studentId, term, year) {
    const grades = await this.findAll({
      where: { 
        student_id: studentId,
        term: term,
        year: year
      }
    });

    if (grades.length === 0) return 0;

    const total = grades.reduce((sum, grade) => sum + parseFloat(grade.score), 0);
    return total / grades.length;
  };

  Grade.calculateClassAverage = async function(classLevel, term, year) {
    const grades = await this.findByClassAndTerm(classLevel, term, year);
    
    if (grades.length === 0) return 0;

    const total = grades.reduce((sum, grade) => sum + parseFloat(grade.score), 0);
    return total / grades.length;
  };

  return Grade;
};
