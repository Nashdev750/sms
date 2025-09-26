module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define('Subject', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    tableName: 'subjects',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['name', 'class_level']
      },
      {
        fields: ['class_level']
      }
    ]
  });

  // Instance methods
  Subject.prototype.getFullInfo = function() {
    return {
      id: this.id,
      name: this.name,
      class_level: this.class_level,
      class_name: `Grade ${this.class_level}`
    };
  };

  // Class methods
  Subject.findByClass = function(classLevel) {
    return this.findAll({
      where: { class_level: classLevel },
      order: [['name', 'ASC']]
    });
  };

  Subject.findByNameAndClass = function(name, classLevel) {
    return this.findOne({
      where: { 
        name: name,
        class_level: classLevel 
      }
    });
  };

  return Subject;
};
