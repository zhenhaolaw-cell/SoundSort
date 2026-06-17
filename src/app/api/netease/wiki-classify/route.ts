import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");
  if (!idsParam) return NextResponse.json({ error: "Missing ids" }, { status: 400 });
  
  const ids = idsParam.split(",").map(Number).filter(Boolean);
  if (ids.length === 0) return NextResponse.json({ error: "No valid ids" }, { status: 400 });
  
  try {
    const { song_wiki_summary } = await import("netease-cloud-music-api-alger");
    const results: Record<string, string[]> = {};
    
    // Process in batches of 5 to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (id) => {
          try {
            const r = await song_wiki_summary({ id, cookie: "" });
            const d = r.body || r;
            const styles: string[] = [];
            const blocks = d.data?.blocks || [];
            for (const block of blocks) {
              for (const c of block.creatives || []) {
                if (c.creativeType === "songTag") {
                  for (const res of c.resources || []) {
                    if (res.resourceType === "melody_style") {
                      styles.push(res.uiElement?.mainTitle?.title || "");
                    }
                  }
                }
              }
            }
            return { id: String(id), styles };
          } catch {
            return { id: String(id), styles: [] };
          }
        })
      );
      for (const r of batchResults) {
        results[r.id] = r.styles;
      }
      if (i + batchSize < ids.length) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
    
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
