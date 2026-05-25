const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('playlist_data.json', 'utf8'));
  const videos = [];

  // Extract from ytInitialData
  // Typically, playlist videos are in:
  // data.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents
  // or similar structure. Let's recursively search for videoId and title.
  
  function searchVideos(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    if (obj.playlistVideoRenderer) {
      const renderer = obj.playlistVideoRenderer;
      const videoId = renderer.videoId;
      let title = '';
      if (renderer.title && renderer.title.runs && renderer.title.runs[0]) {
        title = renderer.title.runs[0].text;
      } else if (renderer.title && renderer.title.simpleText) {
        title = renderer.title.simpleText;
      }
      
      let thumbnail = '';
      if (renderer.thumbnail && renderer.thumbnail.thumbnails && renderer.thumbnail.thumbnails.length > 0) {
        // Get the highest resolution thumbnail
        thumbnail = renderer.thumbnail.thumbnails[renderer.thumbnail.thumbnails.length - 1].url;
      }
      
      let duration = '';
      if (renderer.lengthText && renderer.lengthText.simpleText) {
        duration = renderer.lengthText.simpleText;
      } else if (renderer.lengthText && renderer.lengthText.runs && renderer.lengthText.runs[0]) {
        duration = renderer.lengthText.runs[0].text;
      }

      videos.push({ videoId, title, thumbnail, duration });
      return;
    }
    
    for (const key of Object.keys(obj)) {
      searchVideos(obj[key]);
    }
  }

  searchVideos(data);
  
  console.log(`Extracted ${videos.length} videos from the playlist!`);
  fs.writeFileSync('extracted_videos.json', JSON.stringify(videos, null, 2));
  console.log('Saved to extracted_videos.json');
  
  // Also print the first 5 videos to console
  console.log('First 5 videos:');
  console.log(videos.slice(0, 5));
} catch (e) {
  console.error('Error parsing playlist data:', e);
}
