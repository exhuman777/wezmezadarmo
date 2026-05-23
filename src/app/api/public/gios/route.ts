import { NextRequest, NextResponse } from 'next/server';
import { findNearestStation, getAirIndex } from '@/lib/sources/gios';
import { rateLimit, publicError } from '@/lib/sources/_helpers';

export async function GET(request: NextRequest) {
  const limit = rateLimit('gios', request, 30, 60_000);
  if (!limit.ok) return limit.response;

  const url = new URL(request.url);
  const stationParam = url.searchParams.get('station');
  const latParam = url.searchParams.get('lat');
  const lonParam = url.searchParams.get('lon');

  try {
    let stationId: number;
    let stationName: string | undefined;
    let distanceKm: number | undefined;

    if (stationParam) {
      stationId = parseInt(stationParam, 10);
      if (!Number.isFinite(stationId)) {
        return NextResponse.json({ error: 'Nieprawidłowe ID stacji' }, { status: 400 });
      }
    } else if (latParam && lonParam) {
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return NextResponse.json({ error: 'Nieprawidłowe lat/lon' }, { status: 400 });
      }
      const nearest = await findNearestStation(lat, lon);
      if (!nearest) {
        return NextResponse.json({ error: 'Nie znaleziono stacji' }, { status: 404 });
      }
      stationId = nearest.station.id;
      stationName = nearest.station.stationName;
      distanceKm = Math.round(nearest.distanceKm * 10) / 10;
    } else {
      return NextResponse.json(
        { error: 'Podaj station=<id> albo lat=<lat>&lon=<lon>' },
        { status: 400 },
      );
    }

    const aqi = await getAirIndex(stationId);
    return NextResponse.json({
      stationId,
      stationName,
      distanceKm,
      measuredAt: aqi.calcDate,
      overall: aqi.overall,
      pollutants: {
        pm10: aqi.pm10,
        pm25: aqi.pm25,
        so2: aqi.so2,
        no2: aqi.no2,
        o3: aqi.o3,
      },
    });
  } catch (err) {
    return publicError(err, 'gios');
  }
}
