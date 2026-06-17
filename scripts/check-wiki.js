const n = require("netease-cloud-music-api-alger");
(async () => {
  const ids = [1973665667, 186016, 41612033, 65613, 167935];
  for (const id of ids) {
    try {
      const r = await n.song_wiki_summary({id, cookie:""});
      const d = r.body || r;
      const str = JSON.stringify(d);
      const types = new Set();
      let pos = 0;
      while (true) {
        const idx = str.indexOf('"creativeType"', pos);
        if (idx < 0) break;
        const start = str.indexOf('"', idx + 15);
        const end = str.indexOf('"', start + 1);
        types.add(str.substring(start + 1, end));
        pos = end;
      }
      const resources = new Set();
      pos = 0;
      while (true) {
        const idx = str.indexOf('"resourceType"', pos);
        if (idx < 0) break;
        const start = str.indexOf('"', idx + 15);
        const end = str.indexOf('"', start + 1);
        resources.add(str.substring(start + 1, end));
        pos = end;
      }
      console.log("Song " + id);
      console.log("  creativeTypes: " + [...types].join(", "));
      console.log("  resourceTypes: " + [...resources].join(", "));
      const tagPos = str.search(/tagId|"tags"|tagName|styleTag|subStyle|subGenre|subCategory/i);
      if (tagPos >= 0) {
        console.log("  Tag context: " + str.substring(Math.max(0,tagPos-20), tagPos+200));
      }
      console.log("");
    } catch(e) { console.log("ERR " + id + ": " + e.message); }
  }
})();