const fs = require('fs');
const path = require('path');

function searchInFile(filePath, query) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes(query.toLowerCase())) {
        console.log(`${path.basename(filePath)}:${idx + 1}: ${line.trim()}`);
      }
    });
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
}

const dir = 'c:\\Users\\Huzur Bilgisayar\\Downloads\\YBS\\video_web';
const query = process.argv[2] || '';

if (!query) {
  console.log('Please provide a search query.');
  process.exit(1);
}

fs.readdirSync(dir).forEach(file => {
  const fullPath = path.join(dir, file);
  if (fs.statSync(fullPath).isFile() && (file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.html'))) {
    searchInFile(fullPath, query);
  }
});
