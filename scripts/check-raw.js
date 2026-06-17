const n = require("netease-cloud-music-api-alger");
(async () => {
  // Look at the raw data for songBizTag, language, bpm blocks
  const r = await n.song_wiki_summary({id: 186016, cookie:""});
  const d = r.body || r;
  const blocks = d.data?.blocks || [];
  
  for (const block of blocks) {
    for (const creative of (block.creatives || [])) {
      const ct = creative.creativeType || "";
      if (["songBizTag", "language", "bpm", "songAward", "entertainment"].includes(ct)) {
        console.log("=== Creative: " + ct + " ===");
        console.log(JSON.stringify(creative, null, 2).substring(0, 2000));
        console.log("");
      }
    }
  }
})();