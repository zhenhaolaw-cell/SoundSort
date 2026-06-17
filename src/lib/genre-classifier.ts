export interface Classification { genre: string; confidence: number; }

const CHINESE = /[\u4e00-\u9fff]/;

export function classifyGenre(songName: string, artistName: string, albumName?: string): Classification {
  const scores: Record<string, number> = {};
  const add = (g: string, p: number) => { scores[g] = (scores[g] || 0) + p; };

  const s = (songName || "").trim();
  const a = (artistName || "").trim();
  const al = (albumName || "").trim();
  const titleText = [s, al].filter(Boolean).join(" ").toLowerCase();
  const allArtistText = a.toLowerCase();

  // === INSTRUMENTAL CHECK ===
  if (/^[\u4e00-\u9fff]{0,5}纯音乐/.test(s) || titleText.includes("instrumental") || titleText.includes("钢琴曲")) {
    return { genre: "轻音乐", confidence: 0.7 };
  }

  // === SONG-LEVEL KEYWORD ANALYSIS ===
  const rapKws = ["说唱","嘻哈","饶舌","rap","trap","freestyle","diss","cypher","flow","beatz",
    "drill","grime","boombap","boom bap","gangsta","匪帮","饶舌","说唱"];
  for (const kw of rapKws) {
    if (titleText.includes(kw)) add("嘻哈/说唱", 80);
    if (allArtistText.includes(kw)) add("嘻哈/说唱", 30);
  }

  const rockKws = ["摇滚","rock","punk","metal","riff","solo","电吉他","失真","乐队","乐团",
    "硬摇","重金属","朋克","独立摇滚","另类摇滚","英伦摇滚","后摇"];
  for (const kw of rockKws) {
    if (titleText.includes(kw)) add("摇滚", 80);
    if (allArtistText.includes(kw)) add("摇滚", 30);
  }

  const folkKws = ["民谣","folk","吉他弹唱","弹唱","木吉他","独立民谣"];
  for (const kw of folkKws) {
    if (titleText.includes(kw)) add("民谣", 80);
    if (allArtistText.includes(kw)) add("民谣", 30);
  }

  const edmKws = ["电子","电音","edm","remix","techno","dubstep","drop the beat","dj ",
    "舞曲","电子舞曲","浩室","house","trance","氛围"];
  for (const kw of edmKws) {
    if (titleText.includes(kw)) add("电子", 80);
    if (allArtistText.includes(kw)) add("电子", 20);
  }

  const classicKws = ["古典","classical","交响","协奏","奏鸣曲","钢琴曲","小提琴",
    "大提琴","管弦乐","室内乐","歌剧"];
  for (const kw of classicKws) {
    if (titleText.includes(kw)) add("古典", 80);
    if (allArtistText.includes(kw)) add("古典", 40);
  }

  const jazzKws = ["爵士","jazz","bossa nova","swing","爵士乐","自由爵士","冷爵士"];
  for (const kw of jazzKws) {
    if (titleText.includes(kw)) add("爵士", 80);
    if (allArtistText.includes(kw)) add("爵士", 40);
  }

  const gufengKws = ["古风","中国风","国风","戏腔","笛子","古筝","琵琶","二胡","水墨",
    "红尘","天涯","江湖","汉服","中国风"];
  for (const kw of gufengKws) {
    if (titleText.includes(kw)) add("古风/中国风", 80);
    if (allArtistText.includes(kw)) add("古风/中国风", 40);
  }

  const rnbKws = ["r&b","rnb","节奏布鲁斯","neo soul","soul","灵魂乐","放克","funk"];
  for (const kw of rnbKws) {
    if (titleText.includes(kw)) add("R&B", 80);
    if (allArtistText.includes(kw)) add("R&B", 30);
  }

  const acgKws = ["acg","vocaloid","初音","洛天依","动漫主题","游戏配乐","ost"];
  for (const kw of acgKws) {
    if (titleText.includes(kw)) add("二次元/ACG", 80);
    if (allArtistText.includes(kw)) add("二次元/ACG", 40);
  }

  const countryKws = ["乡村","country","country music","乡村音乐","country rock"];
  for (const kw of countryKws) {
    if (titleText.includes(kw)) add("乡村", 80);
    if (allArtistText.includes(kw)) add("乡村", 30);
  }

  // === DETERMINE WINNER ===
  let best = "";
  let bestScore = 0;
  for (const [g, sc] of Object.entries(scores)) {
    if (sc > bestScore) { bestScore = sc; best = g; }
  }

  // If we found keyword matches above threshold, return them
  if (best && bestScore >= 30) {
    return { genre: best, confidence: Math.min(0.9, bestScore / 100) };
  }

  // === LANGUAGE-BASED DEFAULT (last resort) ===
  if (a) {
    if (CHINESE.test(a)) return { genre: "华语流行", confidence: 0.2 };
    if (/[\uac00-\ud7af]/.test(a)) return { genre: "K-Pop", confidence: 0.2 };
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(a)) return { genre: "J-Pop", confidence: 0.2 };
    if (/^[a-zA-Z]/.test(a)) return { genre: "欧美流行", confidence: 0.2 };
  }
  return { genre: "未分类", confidence: 0 };
}

export function getGenreColor(genre: string): string {
  const m: Record<string, string> = {
    "嘻哈/说唱":"from-pink-500 to-rose-600","流行说唱":"from-pink-400 to-rose-500",
    "旋律说唱":"from-fuchsia-400 to-pink-500","陷阱说唱":"from-rose-500 to-red-500",
    "钻头说唱":"from-red-500 to-rose-700","情绪说唱":"from-purple-500 to-pink-500",
    "爵士嘻哈":"from-violet-400 to-indigo-500","硬核说唱":"from-red-600 to-rose-800",
    "Boom Bap":"from-amber-500 to-orange-600","车库嘻哈":"from-lime-500 to-green-600",
    "匪帮说唱":"from-gray-600 to-red-800",
    "华语流行":"from-fuchsia-500 to-purple-500","欧美流行":"from-blue-400 to-teal-400",
    "粤语流行":"from-indigo-400 to-violet-500","流行舞曲":"from-cyan-400 to-blue-500",
    "K-Pop":"from-fuchsia-400 to-pink-500","J-Pop":"from-indigo-400 to-purple-500",
    "摇滚":"from-red-500 to-orange-600","华语摇滚":"from-red-500 to-orange-500",
    "流行摇滚":"from-orange-400 to-red-500","独立摇滚":"from-amber-400 to-orange-500",
    "另类摇滚":"from-yellow-500 to-orange-600","英伦摇滚":"from-red-400 to-rose-500",
    "朋克":"from-rose-500 to-pink-600","金属":"from-gray-500 to-red-700",
    "后摇":"from-sky-400 to-indigo-500","民谣摇滚":"from-emerald-400 to-green-600",
    "民谣":"from-green-400 to-emerald-500","华语民谣":"from-green-400 to-emerald-500",
    "独立民谣":"from-teal-400 to-green-500","当代民谣":"from-emerald-300 to-green-400",
    "电子":"from-cyan-400 to-blue-500","电子舞曲":"from-cyan-300 to-blue-500",
    "浩室":"from-blue-400 to-indigo-500","迷幻舞曲":"from-violet-400 to-purple-500",
    "氛围音乐":"from-indigo-300 to-purple-400","R&B":"from-violet-500 to-indigo-600",
    "灵魂乐":"from-indigo-400 to-violet-600","放克":"from-yellow-400 to-orange-500",
    "古风/中国风":"from-red-400 to-amber-400","二次元/ACG":"from-pink-400 to-rose-400",
    "爵士":"from-amber-400 to-yellow-500","波萨诺瓦":"from-orange-300 to-amber-400",
    "古典":"from-emerald-400 to-teal-500","交响乐":"from-emerald-400 to-teal-600",
    "钢琴曲":"from-sky-400 to-indigo-400","轻音乐":"from-sky-400 to-teal-400",
    "乡村":"from-amber-400 to-yellow-600","乡村摇滚":"from-yellow-400 to-orange-500",
    "蓝调":"from-blue-400 to-indigo-500","雷鬼":"from-green-400 to-emerald-500",
    "拉丁":"from-red-400 to-orange-400","拉丁流行":"from-red-300 to-orange-400",
    "独立":"from-lime-400 to-green-500","独立流行":"from-lime-400 to-green-500",
    "世界音乐":"from-orange-400 to-amber-500","City Pop":"from-cyan-400 to-blue-500",
    "未分类":"from-gray-400 to-gray-500",
  };
  return m[genre] || "from-gray-400 to-gray-500";
}

export const GENRES = [
  "嘻哈/说唱","流行说唱","旋律说唱","陷阱说唱","钻头说唱","情绪说唱","爵士嘻哈","硬核说唱",
  "Boom Bap","车库嘻哈","匪帮说唱",
  "华语流行","欧美流行","粤语流行","流行舞曲","K-Pop","J-Pop",
  "摇滚","华语摇滚","流行摇滚","独立摇滚","另类摇滚","英伦摇滚","朋克","金属","后摇","民谣摇滚",
  "民谣","华语民谣","独立民谣",
  "电子","电子舞曲","浩室","迷幻舞曲","氛围音乐",
  "R&B","灵魂乐","放克",
  "古风/中国风","二次元/ACG",
  "爵士","波萨诺瓦",
  "古典","交响乐","钢琴曲",
  "轻音乐",
  "乡村","乡村摇滚","蓝调",
  "雷鬼","拉丁","拉丁流行",
  "独立","独立流行",
  "世界音乐","City Pop",
  "未分类"
];
