import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");
  if (!ids) return NextResponse.json({ error: "Missing song ids" }, { status: 400 });
  try {
    const { song_detail } = await import("netease-cloud-music-api-alger");
    const idArr = ids.split(",").map(Number);
    const result = await song_detail({ ids: idArr.join(","), cookie: "" });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch song details" }, { status: 500 });
  }
}
