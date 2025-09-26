const XLSX = require('xlsx');
const puppeteer = require('puppeteer');
const path = require('path');

/**
 * Generate Excel report for ranking data
 */
async function generateExcelReport(rankings, classLevel, term, year) {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Prepare data for Excel
    const excelData = rankings.map((ranking, index) => ({
      'Rank': ranking.rank,
      'Student Name': ranking.student.name,
      'Admission Number': ranking.student.admission_no,
      'Total Marks': ranking.totalMarks,
      'Average Score': ranking.averageScore,
      'Grade Points': ranking.averageGradePoints,
      'Subject Count': ranking.subjectCount,
      'Grade': getGradeLetter(ranking.averageScore)
    }));
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const columnWidths = [
      { wch: 8 },   // Rank
      { wch: 25 },  // Student Name
      { wch: 15 },  // Admission Number
      { wch: 12 },  // Total Marks
      { wch: 15 },  // Average Score
      { wch: 12 },  // Grade Points
      { wch: 12 },  // Subject Count
      { wch: 8 }    // Grade
    ];
    worksheet['!cols'] = columnWidths;
    
    // Add title row
    XLSX.utils.sheet_add_aoa(worksheet, [
      [`Grade ${classLevel} Ranking Report - Term ${term}, ${year}`],
      ['Generated on: ' + new Date().toLocaleDateString()],
      ['']
    ], { origin: 'A1' });
    
    // Add data starting from row 4
    XLSX.utils.sheet_add_json(worksheet, excelData, { origin: 'A4' });
    
    // Add summary statistics
    const summaryRow = 4 + rankings.length + 2;
    const classAverage = rankings.length > 0 
      ? rankings.reduce((sum, r) => sum + r.averageScore, 0) / rankings.length 
      : 0;
    
    XLSX.utils.sheet_add_aoa(worksheet, [
      [''],
      ['Summary Statistics:'],
      ['Total Students:', rankings.length],
      ['Class Average:', classAverage.toFixed(2) + '%'],
      ['Highest Score:', rankings.length > 0 ? rankings[0].averageScore + '%' : 'N/A'],
      ['Lowest Score:', rankings.length > 0 ? rankings[rankings.length - 1].averageScore + '%' : 'N/A']
    ], { origin: `A${summaryRow}` });
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ranking Report');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    return buffer;
  } catch (error) {
    console.error('Excel generation error:', error);
    throw new Error('Failed to generate Excel report');
  }
}

/**
 * Generate PDF report for ranking data
 */
async function generatePDFReport(rankings, classLevel, term, year) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Generate HTML content
    const htmlContent = generateRankingHTML(rankings, classLevel, term, year);
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    await browser.close();
    
    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF report');
  }
}

/**
 * Generate HTML content for PDF
 */
function generateRankingHTML(rankings, classLevel, term, year) {
  const classAverage = rankings.length > 0 
    ? rankings.reduce((sum, r) => sum + r.averageScore, 0) / rankings.length 
    : 0;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Ranking Report - Grade ${classLevel}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #667eea;
                padding-bottom: 20px;
            }
            .header h1 {
                color: #667eea;
                margin: 0;
                font-size: 24px;
            }
            .header p {
                margin: 5px 0 0 0;
                color: #666;
            }
            .stats {
                display: flex;
                justify-content: space-around;
                margin-bottom: 30px;
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
            }
            .stat-item {
                text-align: center;
            }
            .stat-number {
                font-size: 24px;
                font-weight: bold;
                color: #667eea;
            }
            .stat-label {
                color: #666;
                font-size: 14px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }
            th {
                background-color: #667eea;
                color: white;
                font-weight: bold;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            .rank-1 { background-color: #fff3cd !important; }
            .rank-2, .rank-3 { background-color: #d4edda !important; }
            .summary {
                margin-top: 30px;
                padding: 20px;
                background: #e9ecef;
                border-radius: 8px;
            }
            .footer {
                margin-top: 30px;
                text-align: center;
                color: #666;
                font-size: 12px;
                border-top: 1px solid #ddd;
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Grade ${classLevel} Ranking Report</h1>
            <p>Term ${term}, Academic Year ${year}</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number">${rankings.length}</div>
                <div class="stat-label">Total Students</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${classAverage.toFixed(2)}%</div>
                <div class="stat-label">Class Average</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${rankings.length > 0 ? rankings[0].averageScore + '%' : 'N/A'}</div>
                <div class="stat-label">Highest Score</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${rankings.length > 0 ? rankings[rankings.length - 1].averageScore + '%' : 'N/A'}</div>
                <div class="stat-label">Lowest Score</div>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Student Name</th>
                    <th>Admission No.</th>
                    <th>Total Marks</th>
                    <th>Average Score</th>
                    <th>Grade Points</th>
                    <th>Grade</th>
                </tr>
            </thead>
            <tbody>
                ${rankings.map(ranking => `
                    <tr class="rank-${ranking.rank}">
                        <td><strong>${ranking.rank}</strong></td>
                        <td>${ranking.student.name}</td>
                        <td>${ranking.student.admission_no}</td>
                        <td>${ranking.totalMarks.toFixed(0)}</td>
                        <td>${ranking.averageScore}%</td>
                        <td>${ranking.averageGradePoints.toFixed(2)}</td>
                        <td><strong>${getGradeLetter(ranking.averageScore)}</strong></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="summary">
            <h3>Summary</h3>
            <p>This report shows the academic performance ranking for Grade ${classLevel} students in Term ${term} of ${year}.</p>
            <p>The class average of ${classAverage.toFixed(2)}% indicates ${getPerformanceLevel(classAverage)} performance.</p>
        </div>
        
        <div class="footer">
            <p>Generated by Junior Secondary Grading System</p>
            <p>Report generated on ${new Date().toLocaleString()}</p>
        </div>
    </body>
    </html>
  `;
}

/**
 * Get grade letter based on score
 */
function getGradeLetter(score) {
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

/**
 * Get performance level description
 */
function getPerformanceLevel(average) {
  if (average >= 80) return 'excellent';
  if (average >= 70) return 'very good';
  if (average >= 60) return 'good';
  if (average >= 50) return 'satisfactory';
  return 'needs improvement';
}

module.exports = {
  generateExcelReport,
  generatePDFReport
};
