const fs = require('fs');
const glob = require('glob'); // Not available by default, we'll use a simple recursive read

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.css')) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

walk('d:/Project_/2026/js/nextjs/bozunovel/src', function(err, results) {
  if (err) throw err;
  
  results.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace combinations
    content = content.replace(/popularNovels/g, 'popularSeries');
    content = content.replace(/initialNovels/g, 'initialSeries');
    content = content.replace(/moreNovels/g, 'moreSeries');
    content = content.replace(/novels/g, 'seriesList');
    content = content.replace(/Novels/g, 'SeriesList');
    content = content.replace(/novelId/g, 'seriesId');
    content = content.replace(/novelUrl/g, 'seriesUrl');
    
    // Only replace standalone 'novel' or 'Novel'
    content = content.replace(/\bnovel\b/g, 'seriesItem');
    content = content.replace(/\bNovel\b/g, 'Series');
    
    // Replace mapWpPostToNovel -> mapWpPostToSeries
    content = content.replace(/mapWpPostToNovel/g, 'mapWpPostToSeries');
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated:', file);
    }
  });
});
