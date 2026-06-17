"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Music, Search, Loader2, User, ListMusic, X, ChevronDown, ChevronUp, Disc3, Filter, SortAsc, SortDesc, Sparkles, ExternalLink, Play } from "lucide-react";
import Link from "next/link";
import { classifyGenre, getGenreColor } from "@/lib/genre-classifier";

interface Track { id: number; name: string; ar: { id: number; name: string }[]; al: { id: number; name: string; picUrl?: string }; dt: number; _genre?: string; _genres?: string[]; }
interface PlaylistData { id: number; name: string; coverImgUrl?: string; description?: string; trackCount?: number; creator?: { nickname: string }; tracks: Track[]; }

function fmt(ms: number) { return Math.floor(ms / 60000) + ":" + String(Math.floor((ms % 60000) / 1000)).padStart(2, "0"); }
function extractId(s: string) { const m = s.match(/[?&]id=(\d+)/) || s.match(/playlist\/(\d+)/); return m ? m[1] : s.trim(); }

const playSong = (id: number) => window.open("https://music.163.com/#/song?id=" + id, "_blank");

function SongModal({ track, onClose }: { track: Track | null; onClose: () => void }) {
  if (!track) return null;
    const gs = track._genres && track._genres.length > 0 ? [...new Set(track._genres)] : [track._genre || "未分类"];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="glass w-full max-w-sm rounded-3xl p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-1.5 text-music-muted hover:text-white"><X size={16} /></button>
        <div className="flex items-start gap-4 mb-5 pr-8">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
            {track.al?.picUrl ? <img src={track.al.picUrl.replace("http://", "https://")} alt="" className="h-full w-full object-cover" />
              : <div className="flex h-full w-full items-center justify-center bg-music-card"><Music size={20} className="text-music-muted/40" /></div>}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold truncate">{track.name}</h3>
            <p className="text-xs text-music-muted truncate">{track.ar.map(a => a.name).join(", ")}</p>
            <p className="text-xs text-music-muted/60 mt-0.5">{track.al?.name || ""}</p>
            <span className="inline-block mt-1.5 text-[11px] text-music-muted/50">{fmt(track.dt)}</span>
          </div>
        </div>
        <p className="text-xs font-semibold text-music-muted mb-2">风格标签</p>
        <div className="flex flex-wrap gap-2">
          {gs.map(g => <span key={g} className={"text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/80 border border-white/10"}>{g}</span>)}
        </div>
        <button onClick={() => playSong(track.id)}
          className="music-gradient mt-5 w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-music-accent/20 transition-all hover:scale-[1.02]">
          <Play size={16} />在网易云音乐播放
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function PlaylistPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
  const [groups, setGroups] = useState<Record<string, Track[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "name" | "duration">("default");
  const [sortOrd, setSortOrd] = useState<"asc" | "desc">("asc");
  const [filterGenre, setFilterGenre] = useState("all");
  const [modalTrack, setModalTrack] = useState<Track | null>(null);
  const [showAllView, setShowAllView] = useState(false);
  const [focused, setFocused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

      useEffect(() => { if (!loading) { setProgress(0); progressRef.current = 0; } }, [loading]);

  const processTracks = (body: any): Track[] => {
    const raw = body?.playlist?.tracks || body?.songs || [];
    return raw.map((t: any) => ({
      id: t.id, name: t.name, ar: t.ar || t.artists || [],
      al: t.al || t.album || { id: 0, name: "" }, dt: t.dt || t.duration || 0,
      _genre: (t as any)._genre || undefined,
      _genres: (t as any)._genres || ((t as any)._genre ? [(t as any)._genre] : undefined),
    }));
  };

  const classifyTracks = (tracks: Track[]) => {
    const g: Record<string, Track[]> = {};
    tracks.forEach(t => {
      const gs = t._genres && t._genres.length > 0 ? [...new Set(t._genres)] : [t._genre].filter(Boolean);
      if (gs.length === 0) { const r = classifyGenre(t.name, t.ar.map(a => a.name).join(", "), t.al?.name || ""); gs.push(r.genre); }
      gs.forEach(gg => { if (!g[gg]) g[gg] = []; g[gg].push(t); });
    });
    return g;
  };

  const fetchPl = async () => {
    const id = extractId(input);
    if (!id || !/^\d+$/.test(id)) { setError("请输入有效歌单 ID"); return; }
    setLoading(true); setProgress(0); progressRef.current = 0; setError(""); setPlaylist(null); setExpanded({}); setSearch(""); setFilterGenre("all"); setModalTrack(null); setShowAllView(false);
    const progInterval = setInterval(() => {
      const cur = progressRef.current;
      const next = cur < 85 ? cur + (85 - cur) * 0.08 + 0.5 : Math.min(cur + 0.3, 90);
      progressRef.current = next;
      setProgress(next);
    }, 300);
    try {
      setProgress(8);
      const res = await fetch("/api/netease/playlist?id=" + id);
      if (!res.ok) throw new Error(((await res.json()).error) || "获取失败");
      setProgress(35);
      const data = await res.json();
      setProgress(45);
      const tracks = processTracks(data);
      setProgress(60);
      const pl = data?.playlist;
      setPlaylist({
        id: pl?.id || Number(id), name: pl?.name || "歌单", coverImgUrl: pl?.coverImgUrl,
        description: pl?.description, trackCount: pl?.trackCount || tracks.length,
        creator: pl?.creator, tracks,
      });
      setProgress(75);
      setGroups(classifyTracks(tracks));
      setProgress(100);
    } catch (e) { setError(e instanceof Error ? e.message : "获取失败"); }
    finally { clearInterval(progInterval); setLoading(false); }
  };

  const total = playlist?.tracks.length || 0;
  const stats = useMemo(() =>
    Object.entries(groups).map(([g, ts]) => ({ genre: g, count: ts.length, pct: Math.round(ts.length / total * 100) })).sort((a, b) => b.count - a.count),
  [groups, total]);

  // Apply search + sort + genre filter to ALL tracks (used for "all" view mode)
  const allFiltered = useMemo(() => {
    let t = playlist?.tracks || [];
    if (search) { const q = search.toLowerCase(); t = t.filter(tr => tr.name.toLowerCase().includes(q) || tr.ar.some(a => a.name.toLowerCase().includes(q))); }
    if (filterGenre !== "all") t = t.filter(tr => { const gs = tr._genres || [tr._genre || ""]; return gs.includes(filterGenre); });
    const s = [...t];
    if (sortBy === "name") s.sort((a, b) => sortOrd === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    else if (sortBy === "duration") s.sort((a, b) => sortOrd === "asc" ? a.dt - b.dt : b.dt - a.dt);
    return s;
  }, [playlist, search, filterGenre, sortBy, sortOrd]);

  // Apply search + sort within each genre group
  const filteredGroups = useMemo(() => {
    const result: Record<string, Track[]> = {};
    for (const [genre, tracks] of Object.entries(groups)) {
      let t = tracks;
      if (search) { const q = search.toLowerCase(); t = tracks.filter(tr => tr.name.toLowerCase().includes(q) || tr.ar.some(a => a.name.toLowerCase().includes(q))); }
      if (t.length === 0) continue;
      const s = [...t];
      if (sortBy === "name") s.sort((a, b) => sortOrd === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
      else if (sortBy === "duration") s.sort((a, b) => sortOrd === "asc" ? a.dt - b.dt : b.dt - a.dt);
      result[genre] = s;
    }
    return result;
  }, [groups, search, sortBy, sortOrd]);

  const hasActiveFilter = search || filterGenre !== "all" || sortBy !== "default";
  const showGenres = filterGenre === "all" && !search && sortBy === "default";

  return (
    <div className="min-h-screen bg-music-bg">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-music-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-music-muted hover:text-music-text"><Disc3 size={20} /><span className="text-sm">SoundSort</span></Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-2xl font-bold sm:text-3xl">导入网易云音乐歌单</h1>
          <p className="mt-2 text-sm text-music-muted">粘贴歌单链接或 ID，自动分析风格构成</p>
          <div className="mx-auto mt-6 flex max-w-xl gap-3">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchPl()}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              placeholder="粘贴歌单 ID 或链接（如 3778678）" className="glass flex-1 rounded-2xl px-5 py-3 text-sm outline-none placeholder:text-music-muted/40" />
            <button onClick={fetchPl} disabled={loading}
              className="music-gradient flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-music-accent/20 transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}分析</button>
          </div>
          {/* Animated equalizer under search bar */}
          <motion.div initial={false} animate={{ opacity: focused ? 1 : 0, height: focused ? 24 : 0 }}
            className="mx-auto max-w-xl overflow-hidden" style={{ marginTop: focused ? 8 : 0 }}>
            <div className="flex items-center justify-center gap-[3px] h-6">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                <motion.div key={i}
                  className="w-[3px] rounded-full bg-gradient-to-t from-music-accent/60 to-cyan-400/60"
                  animate={{
                    height: focused
                      ? [4 + Math.sin(i) * 8, 12 + Math.cos(i*1.3) * 10, 6 + Math.sin(i*0.7) * 6, 20 + Math.cos(i*2.1) * 8, 4 + Math.sin(i) * 8][i % 5] + "px"
                      : "2px",
                    opacity: focused ? [0.4, 0.8, 0.3, 0.9, 0.5, 0.7][i % 6] : 0.1
                  }}
                  transition={{ duration: 0.6 + (i % 4) * 0.15, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
                />
              ))}
            </div>
          </motion.div>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10">
            <div className="mx-auto flex max-w-md flex-col items-center gap-6">
              {/* Animated equalizer */}
              <div className="flex items-end gap-1.5 h-16">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <motion.div key={i}
                    className="w-2 rounded-full bg-gradient-to-t from-music-accent/60 to-cyan-400/60"
                    animate={{ height: ["12px", "48px", "20px", "56px", "16px", "40px", "60px", "28px"][i-1], opacity: [0.4, 1, 0.6, 0.9, 0.3, 0.7, 0.8, 0.5] }}
                    transition={{ duration: 0.8 + i * 0.1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  />
                ))}
              </div>
              {/* Bouncing music notes */}
              <div className="flex items-center gap-3 text-2xl">
                {["♪", "♫", "♬"].map((note, i) => (
                  <motion.span key={i}
                    className="text-music-accent/70"
                    animate={{ y: [-8, 8, -8], scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.2 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                  >{note}</motion.span>
                ))}
              </div>
              <div className="w-full max-w-xs mx-auto">
                <p className="text-sm text-music-muted/60 animate-pulse text-center">正在分析歌单风格...</p>
                <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: progress + "%", background: "linear-gradient(to right, #d946ef, #06b6d4)" }}
                  />
                </div>
              </div>
              {/* Music-themed skeleton cards */}
              <div className="w-full space-y-3">
                {[1,2,3,4].map(i => (
                  <motion.div key={i}
                    className="glass rounded-2xl overflow-hidden relative p-4"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.12, ease: "easeOut" }}>
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
                      style={{ backgroundSize: "200% 100%" }}
                      animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }} />
                    <div className="relative flex items-center gap-3">
                      {/* Album art placeholder */}
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-music-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                      {/* Song info placeholders */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3 w-3/5 rounded-full bg-white/10" />
                        <div className="h-2.5 w-2/5 rounded-full bg-white/5" />
                      </div>
                      {/* Duration placeholder */}
                      <div className="h-2.5 w-10 rounded-full bg-white/5 shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        </motion.div>

        {playlist && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Playlist Header */}
            <div className="glass mb-8 overflow-hidden rounded-3xl">
              <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
                <div className="mx-auto h-36 w-36 shrink-0 overflow-hidden rounded-2xl sm:mx-0">
                  {playlist.coverImgUrl ? <img src={playlist.coverImgUrl.replace("http://", "https://")} alt="" className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center bg-music-card"><Music size={40} className="text-music-muted/40" /></div>}
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <h2 className="text-xl font-bold truncate">{playlist.name}</h2>
                  {playlist.creator && <p className="mt-1 flex items-center justify-center gap-1 text-xs text-music-muted sm:justify-start"><User size={12} />{playlist.creator.nickname}</p>}
                  {playlist.description && <p className="mt-2 text-xs text-music-muted/70 line-clamp-2">{playlist.description}</p>}
                  <p className="mt-2 text-xs text-music-accent">{total} 首歌曲</p>
                </div>
              </div>
            </div>

            {/* Genre Distribution Bars */}
            {stats.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold"><ListMusic size={16} className="text-music-accent" />风格分布</h3>
                <div className="grid grid-cols-2 gap-2">
                  {stats.map((s, i) => (
                    <motion.div key={s.genre} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className={"glass rounded-2xl p-3 cursor-pointer hover:bg-white/[0.08] transition-colors " + (filterGenre === s.genre ? "ring-1 ring-music-accent/50" : "")}
                      onClick={() => { setFilterGenre(filterGenre === s.genre ? "all" : s.genre); setShowAllView(false); }}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={"inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-r " + getGenreColor(s.genre)} />
                          <span className={"text-sm font-medium truncate " + (filterGenre === s.genre ? "text-music-accent" : "")}>{s.genre}</span>
                          {filterGenre === s.genre && <span className="text-[10px] text-music-accent/60 shrink-0">筛选中</span>}
                        </div>
                        <span className="text-xs text-music-muted shrink-0 ml-2">{s.count} 首 ({s.pct}%)</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <motion.div initial={{ width: 0 }} animate={{ width: s.pct + "%" }} transition={{ duration: 0.8, delay: i * 0.1 }}
                          className={"h-full rounded-full bg-gradient-to-r " + getGenreColor(s.genre)} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Search, Filter, Sort Controls */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-music-muted/50" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索歌曲或艺人..." className="glass w-full rounded-2xl py-2.5 pl-9 pr-4 text-sm outline-none placeholder:text-music-muted/40" />
              </div>
              <select value={sortBy} onChange={e => { setSortBy(e.target.value as any); }} className="glass rounded-2xl px-3 py-2.5 text-xs outline-none text-music-muted">
                <option value="default">默认排序</option><option value="name">按歌名</option><option value="duration">按时长</option>
              </select>
              <button onClick={() => setSortOrd(o => o === "asc" ? "desc" : "asc")} className="glass flex items-center gap-1 rounded-2xl px-3 py-2.5 text-xs text-music-muted hover:text-white transition-colors">
                {sortOrd === "asc" ? <SortAsc size={14} /> : <SortDesc size={14} />}{sortOrd === "asc" ? "正序" : "倒序"}
              </button>
              {hasActiveFilter && (
                <button onClick={() => { setSearch(""); setSortBy("default"); setSortOrd("asc"); setFilterGenre("all"); setShowAllView(false); }}
                  className="glass rounded-2xl px-3 py-2.5 text-xs text-red-400/70 hover:text-red-400 transition-colors">
                  <X size={14} className="inline mr-1" />清除所有
                </button>
              )}
            </div>

            {/* Show all tracks view when searching/sorting, or genre-grouped view */}
            {search && filterGenre === "all" && (
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold">所有歌曲 {search && <span className="text-xs font-normal text-music-muted">(搜索: "{search}")</span>}</h3>
                <div className="glass divide-y divide-white/5 overflow-hidden rounded-2xl">
                  {allFiltered.map((track, i) => (
                    <div key={track.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setModalTrack(track)}>
                      <span className="w-5 shrink-0 text-right text-xs text-music-muted/50">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{track.name}</p>
                        <p className="truncate text-[10px] text-music-muted/60">{track.ar.map(a => a.name).join(", ")}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(track._genres && track._genres.length > 0 ? [...new Set(track._genres)] : [track._genre || "未分类"]).map(g => (
                            <span key={g} className={"text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/70"}>{g}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-music-muted/60">{fmt(track.dt)}</span>
                      <button onClick={(e) => { e.stopPropagation(); playSong(track.id); }}
                        className="rounded-full bg-white/10 p-1.5 text-music-muted/50 hover:text-music-accent hover:bg-white/20 transition-all">
                        <Play size={12} />
                      </button>
                    </div>
                    </div>
                  ))}
                  {allFiltered.length === 0 && <div className="p-6 text-center text-sm text-music-muted">未找到匹配的歌曲</div>}
                </div>
              </div>
            )}

            {/* Genre Grouped View (when no filter/search/sort is active) */}
            {!search && Object.entries(filteredGroups).filter(([g]) => filterGenre === "all" || g === filterGenre).map(([genre, tracks]) => (
              <div key={genre} className="mb-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <span className={"inline-block h-3 w-3 rounded-full bg-gradient-to-r " + getGenreColor(genre)} />
                  {genre} <span className="text-xs font-normal text-music-muted">({tracks.length})</span>
                </h3>
                <div className="glass divide-y divide-white/5 overflow-hidden rounded-2xl">
                  {(expanded[genre] ? tracks : tracks.slice(0, 8)).map((track, i) => (
                    <div key={track.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setModalTrack(track)}>
                      <span className="w-5 shrink-0 text-right text-xs text-music-muted/50">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{track.name}</p>
                        <p className="truncate text-[11px] text-music-muted/70">{track.ar.map(a => a.name).join(", ")}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(track._genres && track._genres.length > 0 ? [...new Set(track._genres)] : [track._genre || "未分类"])
                            .map(g => (
                            <span key={g} className={"text-[10px] px-1.5 py-0.5 rounded-full " + (g === genre ? "bg-white/20 text-white" : "bg-white/10 text-white/70")}>{g}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-music-muted/60">{fmt(track.dt)}</span>
                      <button onClick={(e) => { e.stopPropagation(); playSong(track.id); }}
                        className="rounded-full bg-white/10 p-1.5 text-music-muted/50 hover:text-music-accent hover:bg-white/20 transition-all">
                        <Play size={12} />
                      </button>
                    </div>
                    </div>
                  ))}
                  {tracks.length > 8 && (
                    <button onClick={() => setExpanded(p => ({ ...p, [genre]: !p[genre] }))}
                      className="w-full py-3 text-xs text-music-accent hover:bg-white/5 transition-colors flex items-center justify-center gap-1">
                      {expanded[genre] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {expanded[genre] ? "收起" : "展开全部 " + tracks.length + " 首"}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {Object.keys(filteredGroups).filter(g => filterGenre === "all" || g === filterGenre).length === 0 && <div className="glass rounded-2xl p-8 text-center"><Music size={32} className="mx-auto text-music-muted/30 mb-2" /><p className="text-sm text-music-muted">未找到匹配的歌曲</p></div>}
            <SongModal track={modalTrack} onClose={() => setModalTrack(null)} />
          </motion.div>
        )}
      </main>
    </div>
  );
}