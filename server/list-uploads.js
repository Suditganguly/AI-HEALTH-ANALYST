const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');

console.log('📁 PDF Upload Directory:', uploadsDir);
console.log('=' .repeat(60));

try {
  if (!fs.existsSync(uploadsDir)) {
    console.log('❌ Uploads directory does not exist yet.');
    console.log('💡 It will be created automatically when you upload your first PDF.');
    process.exit(0);
  }

  const files = fs.readdirSync(uploadsDir);
  
  if (files.length === 0) {
    console.log('📂 No PDF files uploaded yet.');
    console.log('💡 Upload a PDF through the app to see files here.');
  } else {
    console.log(`📄 Found ${files.length} uploaded file(s):\n`);
    
    files.forEach((filename, index) => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log(`${index + 1}. ${filename}`);
      console.log(`   📅 Uploaded: ${stats.birthtime.toLocaleString()}`);
      console.log(`   📏 Size: ${sizeInMB} MB`);
      console.log(`   📍 Full path: ${filePath}`);
      console.log('');
    });
  }
  
  console.log('=' .repeat(60));
  console.log('💡 To open the uploads folder:');
  console.log(`   Windows: explorer "${uploadsDir}"`);
  console.log(`   Command: cd "${uploadsDir}"`);
  
} catch (error) {
  console.error('❌ Error reading uploads directory:', error.message);
}