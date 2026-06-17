import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const neteaseMod: any = await import("netease-cloud-music-api-alger");
    const ugc_song_get = neteaseMod.ugc_song_get;
    const result = await ugc_song_get({ id: Number(id), cookie: "" });
    const data = result.body || result;
    // Extract all keys to see what data is available
    return NextResponse.json({
      hasBody: !!data,
      keys: Object.keys(data).slice(0, 30),
      sample: JSON.stringify(data).slice(0, 500),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
