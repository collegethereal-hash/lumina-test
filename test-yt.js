const https = require('https');

function searchYouTube(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const match = data.match(/"videoId":"([^"]{11})"/);
      if (match) {
        console.log('FOUND ID:', match[1]);
      } else {
        console.log('NO MATCH', data.substring(0, 200));
      }
    });
  }).on('error', err => console.log('ERROR:', err));
}

searchYouTube('mzlff царапка audio');