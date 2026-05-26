const fs = require('fs');
let code = fs.readFileSync('videos.js', 'utf8');

// 1. Add filtering logic to loadVideosFromServer
code = code.replace(
  /    let shuffled = \[\.\.\.LOCAL_VIDEOS\];\r?\n    for \(let i = shuffled\.length - 1; i > 0; i--\) \{/,
  `    let shuffled = [...LOCAL_VIDEOS];\n    try { const deletedList = JSON.parse(localStorage.getItem('deleted_videos') || '[]'); shuffled = shuffled.filter(v => !deletedList.includes(v.id)); } catch(e) {}\n    for (let i = shuffled.length - 1; i > 0; i--) {`
);

// 2. Add delTag
code = code.replace(
  /    \/\/ Favori butonu\r?\n    const favTag = `/,
  `    // Silme butonu
    const delTag = \`
      <button onclick="event.stopPropagation(); deleteVideo('\${video.id}')" title="Bu videoyu sil" style="position:absolute;top:8px;right:8px;background:rgba(255,255,255,0.92);border:none;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;z-index:15;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
        🗑️
      </button>\`;

    // Favori butonu
    const favTag = \``
);

// 3. Inject delTag into HTML
code = code.replace(
  /        ` \+ catTag \+ `\r?\n        <img class="video-thumbnail"/,
  `        \` + catTag + \`\n        \` + delTag + \`\n        <img class="video-thumbnail"`
);

fs.writeFileSync('videos.js', code);
console.log('Successfully patched videos.js');
