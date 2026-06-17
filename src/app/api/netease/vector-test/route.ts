import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const neteaseMod: any = await import("netease-cloud-music-api-alger");
    const playmode_song_vector = neteaseMod.playmode_song_vector;
    const result = await playmode_song_vector({ ids: "[" + id + "]", cookie: "" });
    const data = result.body || result;
    return NextResponse.json({
      keys: Object.keys(data).slice(0, 20),
      sample: JSON.stringify(data).slice(0, 500),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
