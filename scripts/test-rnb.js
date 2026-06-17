const n = require("netease-cloud-music-api-alger");
(async () => {
  // Check more songs to see the language field
  const ids = [
    [212959, "Miguel - Adorn"],
    [28285878, "John Legend - Ordinary People"],
    [3953006, "Frank Ocean - Thinkin Bout You"],
    [445230, "陶喆 - 小镇姑娘"],
    [190137, "陶喆 - 普通朋友"],
    [1973665667, "马也 - 海屿你"],
    [41612033, "李荣浩 - 李白"]
  ];
  for (const [id, name] of ids) {
    try {
      const r = await n.song_wiki_summary({id, cookie: ""});
      const d = r.body || r;
      const blocks = d.data?.blocks || [];
      
      let melody = "none";
      let lang = "none";
      
      for (const block of blocks) {
        for (const cr of (block.creatives || [])) {
          if (cr.creativeType === "songTag") {
            for (const res of (cr.resources || [])) {
              if (res.resourceType === "melody_style") {
                melody = res.uiElement?.mainTitle?.title || "?";
              }
            }
          }
          if (cr.creativeType === "language") {
            for (const link of (cr.uiElement?.textLinks || [])) {
              lang = link.text || "?";
            }
          }
        }
      }
      console.log(name + " | style: " + melody + " | lang: " + lang);
    } catch(e) { console.log(name + ": ERR"); }
  }
})();
