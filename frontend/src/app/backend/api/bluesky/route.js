import { getTimeline } from '../../lib/Timeline';
import redis from '../../lib/redis';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") || null;
    const limit = Number(searchParams.get("limit")) || 20;

    const cacheKey = cursor ? `timeline_cache_${cursor}` : "timeline_cache_root";

    // Check Redis cache
    const cache = await redis.get(cacheKey);
    if (cache) {
      console.log("🔵 Returning cached timeline page");
      return NextResponse.json(JSON.parse(cache));
    }

    // Fetch fresh data
    const result = await getTimeline(limit, cursor);

    // Cache for 20 seconds
    await redis.set(cacheKey, JSON.stringify(result), "EX", 20);

    console.log("🟢 Saved timeline page to cache");

    return NextResponse.json(result);

  } catch (err) {
    console.error("Bluesky API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}
