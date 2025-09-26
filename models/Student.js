module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    admission_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 20]
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    class_level: {
      type: DataTypes.ENUM('7', '8', '9'),
      allowNull: false,
      validate: {
        isIn: [['7', '8', '9']]
      }
    }
  }, {
    tableName: 'students',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['admission_no']
      },
      {
        fields: ['class_level']
      }
    ]
  });

  // Instance methods
  Student.prototype.getFullInfo = function() {
    return {
      id: this.id,
      admission_no: this.admission_no,
      name: this.name,
      class_level: this.class_level,
      class_name: `Grade ${this.class_level}`
    };
  };

  // Class methods
  Student.findByClass = function(classLevel) {
    return this.findAll({
      where: { class_level: classLevel },
      order: [['name', 'ASC']]
    });
  };

  Student.findByAdmissionNo = function(admissionNo) {
    return this.findOne({
      where: { admission_no: admissionNo }
    });
  };

  return Student;
};
