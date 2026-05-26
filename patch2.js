const fs = require('fs');
let code = fs.readFileSync('videos.js', 'utf8');

// Find the first occurrence of `const delTag = ` and its block, up to `</button>\`;`
// and replace it with an empty string.

const regex = /    \/\/ Silme butonu\r?\n    const delTag = `[^`]+`;\r?\n/;

code = code.replace(regex, '');

fs.writeFileSync('videos.js', code);
console.log('Removed duplicate delTag');
