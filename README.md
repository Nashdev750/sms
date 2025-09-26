# Junior Secondary Grading System

A comprehensive, professional-grade grading system for Junior Secondary schools (Grades 7, 8, 9) built with Node.js, Express, MySQL, and modern web technologies.

## 🚀 Features

### Core Functionality
- **Student Management**: Complete CRUD operations for student records
- **Subject Management**: Manage subjects per class level
- **Grade Entry**: Excel-like interface for efficient grade entry
- **Ranking System**: Automatic calculation of student rankings
- **Reports & Analytics**: Comprehensive reporting with export capabilities

### Advanced Features
- **Excel-like Grade Entry**: Inline editing with real-time calculations
- **Export Capabilities**: Export reports to Excel (.xlsx) and PDF formats
- **Responsive Design**: Mobile-friendly interface with Bootstrap 5
- **Professional UI**: Modern, clean design with smooth animations
- **Data Validation**: Comprehensive input validation and error handling
- **Docker Support**: Complete containerization with docker-compose

### Technical Features
- **MVC Architecture**: Clean separation of concerns
- **Sequelize ORM**: Robust database operations
- **Session Management**: Secure session handling
- **Rate Limiting**: Protection against abuse
- **Security Headers**: Helmet.js for security
- **Health Checks**: Built-in health monitoring

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.0 with Sequelize ORM
- **Frontend**: EJS templates, Bootstrap 5, Vanilla JavaScript
- **Export**: Excel (xlsx), PDF (Puppeteer)
- **Containerization**: Docker, Docker Compose
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 16+ (for local development)
- MySQL 8.0+ (for local development)

## 🚀 Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd junior-secondary-grading-system
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Seed the database with sample data**
   ```bash
   docker-compose exec backend npm run seed
   ```

4. **Access the application**
   - Open your browser and go to `http://localhost:3000`
   - The system will be ready with sample data

## 🏗️ Local Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp config.env .env
   # Edit .env with your database credentials
   ```

3. **Start MySQL database**
   ```bash
   # Using Docker
   docker run --name mysql-grading -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=grading_system -p 3306:3306 -d mysql:8.0
   ```

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

5. **Seed sample data**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 📊 Database Schema

### Students Table
```sql
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admission_no VARCHAR(20) UNIQUE,
  name VARCHAR(100),
  class_level ENUM('7','8','9'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Subjects Table
```sql
CREATE TABLE subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  class_level ENUM('7','8','9')
);
```

### Grades Table
```sql
CREATE TABLE grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  subject_id INT,
  term ENUM('1','2','3'),
  year INT,
  score DECIMAL(5,2),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id)
);
```

## 🎯 Usage Guide

### 1. Dashboard
- View system overview and statistics
- Quick access to all major functions
- Class-wise performance summaries

### 2. Student Management
- Add new students with admission numbers
- Edit student information
- Filter students by class level
- Delete students (with grade cleanup)

### 3. Subject Management
- Add subjects for each class level
- Edit subject information
- Manage subject-class associations

### 4. Grade Entry
- Select class, term, and year
- Excel-like interface for grade entry
- Real-time calculations and rankings
- Bulk save functionality

### 5. Reports & Analytics
- Student ranking reports
- Subject performance analysis
- Export to Excel and PDF
- Historical data comparison

## 🔧 Configuration

### Environment Variables
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=grading_system
DB_USER=root
DB_PASSWORD=your_password

# Application Configuration
NODE_ENV=development
PORT=3000
SESSION_SECRET=your-secret-key

# Security
BCRYPT_ROUNDS=12
```

### Docker Configuration
The system includes:
- **Backend service**: Node.js application
- **Database service**: MySQL 8.0 with persistent volume
- **Network**: Isolated Docker network
- **Health checks**: Built-in monitoring

## 📱 Responsive Design

The system is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

## 🔒 Security Features

- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection Protection**: Sequelize ORM with parameterized queries
- **XSS Protection**: Helmet.js security headers
- **Rate Limiting**: Protection against brute force attacks
- **Session Security**: Secure session configuration
- **CORS Configuration**: Proper cross-origin resource sharing

## 📈 Performance Features

- **Database Indexing**: Optimized database queries
- **Connection Pooling**: Efficient database connections
- **Compression**: Gzip compression for responses
- **Caching**: Strategic caching implementation
- **Lazy Loading**: Optimized data loading

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📦 Deployment

### Production Deployment
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure session secrets
4. Enable SSL/HTTPS
5. Configure reverse proxy (nginx)

### Docker Production
```bash
# Build production image
docker build -t grading-system:latest .

# Run with production config
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
- Complete CRUD operations
- Excel-like grade entry
- Export capabilities
- Docker support
- Professional UI

## 🎉 Acknowledgments

- Bootstrap for the UI framework
- Sequelize for database operations
- Express.js for the web framework
- All contributors and testers

---

**Built with ❤️ for Junior Secondary Education**
