const n = require("netease-cloud-music-api-alger");
(async () => {
  const ids = [1973665667, 186016, 167935];
  for (const id of ids) {
    try {
      const r = await n.song_wiki_summary({id, cookie:""});
      const d = r.body || r;
      const blocks = d.data?.blocks || [];
      
      // Extract ALL blocks with their codes
      for (const block of blocks) {
        const code = block.code || "";
        const channel = block.channel || "";
        for (const creative of (block.creatives || [])) {
          const ct = creative.creativeType || "";
          if (["songBizTag", "language", "bpm", "entertainment", "songAward"].includes(ct)) {
            console.log("Song " + id + " | Block: " + code + " | Creative: " + ct);
            
            // Extract all resources with their details
            for (const res of (creative.resources || [])) {
              const rt = res.resourceType || "";
              const ui = res.uiElement || {};
              const mainTitle = ui.mainTitle?.title || "";
              const subTitle = ui.subTitles?.map(s => s.title).join(", ") || "";
              
              // Try to extract ALL text content from this resource
              const str = JSON.stringify(res);
              // Look for useful fields
              const useful = [];
              let pos = 0;
              while (true) {
                const idx = str.indexOf('"title":', pos);
                if (idx < 0) break;
                const start = str.indexOf('"', idx + 9);
                if (start < 0) break;
                const end = str.indexOf('"', start + 1);
                if (end < 0) break;
                const val = str.substring(start + 1, end);
                if (val.length > 1 && val.length < 100) useful.push(val);
                pos = end;
              }
              
              if (useful.length > 0) {
                console.log("  resourceType: " + rt + " | titles: " + useful.join(", "));
              }
            }
          }
        }
      }
      console.log("");
    } catch(e) { console.log("ERR " + id + ": " + e.message); }
  }
})();