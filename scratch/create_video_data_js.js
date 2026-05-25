const fs = require('fs');
const path = require('path');

const projectDir = 'c:\\Users\\Huzur Bilgisayar\\Downloads\\YBS\\video_web';
const finalVideosPath = 'C:\\Users\\Huzur Bilgisayar\\.gemini\\antigravity\\brain\\012cd404-df99-4645-be19-26dd659940b9\\scratch\\final_65_videos.json';
const allVideos = JSON.parse(fs.readFileSync(finalVideosPath, 'utf8'));

// Format video_data.js
let jsContent = '// 65 ADET GERÇEK ÇOCUK VİDEOSU VERİTABANI\n';
jsContent += 'const LOCAL_VIDEOS = ' + JSON.stringify(allVideos, null, 2) + ';\n\n';
jsContent += '// Node.js (CommonJS) uyumluluğu için\n';
jsContent += 'if (typeof module !== \'undefined\' && module.exports) {\n';
jsContent += '  module.exports = LOCAL_VIDEOS;\n';
jsContent += '}\n';

fs.writeFileSync(path.join(projectDir, 'video_data.js'), jsContent, 'utf8');
console.log('Successfully created video_data.js in the workspace!');
