import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keywords = searchParams.get("keywords");
  const type = searchParams.get("type") || "1"; // 1: songs, 1000: playlists

  if (!keywords) {
    return NextResponse.json({ error: "Missing keywords" }, { status: 400 });
  }

  try {
    const { cloudsearch } = await import("netease-cloud-music-api-alger");
    const result = await cloudsearch({ keywords, type: Number(type), cookie: "" });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Netease search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
