const n = require('netease-cloud-music-api-alger');
(async () => {
  // Check lyrics for some R&B songs to see if keywords would catch them
  const ids = [28285878, 28964478, 17245154, 5245139];
  for (const id of ids) {
    try {
      const r = await n.lyric({id, cookie:''});
      const d = r.body || r;
      const lrc = d.lrc?.lyric || '';
      // Check for R&B keywords
      const rnbKws = ['baby','love','soul','smooth','rhythm','wanna','gonna','hold you','kiss','touch','night','gentle'];
      let score = 0;
      for (const kw of rnbKws) {
        let pos = 0;
        while (true) {
          const idx = lrc.toLowerCase().indexOf(kw, pos);
          if (idx < 0) break;
          score++;
          pos = idx + 1;
        }
      }
      console.log(id + ': R&B lyric score=' + score + ' (length=' + lrc.length + ')');
    } catch(e) { console.log(id + ': ERR'); }
  }
})();