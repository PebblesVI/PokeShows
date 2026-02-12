import { NextRequest, NextResponse } from 'next/server';
import { getNearbyShows } from '@/db/queries/shows';
import { getZipCoordinates } from '@/lib/city-coordinates';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const radius = parseInt(searchParams.get('radius') || '50', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  let lat = parseFloat(searchParams.get('lat') || '');
  let lng = parseFloat(searchParams.get('lng') || '');

  // If no lat/lng, try ZIP code
  const zip = searchParams.get('zip');
  if ((isNaN(lat) || isNaN(lng)) && zip) {
    const zipCoords = getZipCoordinates(zip);
    if (!zipCoords) {
      return NextResponse.json({ error: 'Could not determine location for this ZIP code' }, { status: 400 });
    }
    lat = zipCoords.lat;
    lng = zipCoords.lng;
  }

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  const clampedRadius = Math.min(Math.max(radius, 10), 500);
  const clampedLimit = Math.min(Math.max(limit, 1), 50);

  try {
    const shows = await getNearbyShows(lat, lng, clampedRadius, clampedLimit);
    return NextResponse.json({ shows });
  } catch (error) {
    console.error('[nearby] Query failed:', error);
    return NextResponse.json({ error: 'Failed to fetch nearby shows' }, { status: 500 });
  }
}
