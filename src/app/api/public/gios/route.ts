import { NextRequest, NextResponse } from 'next/server';
import { findNearestStations, getAirIndex, aqiHasData, type GiosAqi } from '@/lib/sources/gios';
import { rateLimit, publicError } from '@/lib/sources/_helpers';

function shape(stationId: number, stationName: string | undefined, distanceKm: number | undefined, aqi: GiosAqi) {
  return {
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
  };
}

export async function GET(request: NextRequest) {
  const limit = rateLimit('gios', request, 30, 60_000);
  if (!limit.ok) return limit.response;

  const url = new URL(request.url);
  const stationParam = url.searchParams.get('station');
  const latParam = url.searchParams.get('lat');
  const lonParam = url.searchParams.get('lon');

  try {
    if (stationParam) {
      const stationId = parseInt(stationParam, 10);
      if (!Number.isFinite(stationId)) {
        return NextResponse.json({ error: 'Nieprawidłowe ID stacji' }, { status: 400 });
      }
      const aqi = await getAirIndex(stationId);
      return NextResponse.json(shape(stationId, undefined, undefined, aqi));
    }

    if (latParam && lonParam) {
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return NextResponse.json({ error: 'Nieprawidłowe lat/lon' }, { status: 400 });
      }
      // Najblizsza stacja bywa bez policzonego indeksu (zwraca puste dane) --
      // probujemy kolejne, az trafimy na taka z realnym pomiarem (do 6 najblizszych).
      const candidates = await findNearestStations(lat, lon, 6);
      if (!candidates.length) {
        return NextResponse.json({ error: 'Nie znaleziono stacji' }, { status: 404 });
      }
      let fallback: ReturnType<typeof shape> | null = null;
      for (const c of candidates) {
        const aqi = await getAirIndex(c.station.id);
        const payload = shape(c.station.id, c.station.stationName, Math.round(c.distanceKm * 10) / 10, aqi);
        if (aqiHasData(aqi)) return NextResponse.json(payload);
        if (!fallback) fallback = payload; // najblizsza, gdyby zadna nie miala danych
      }
      return NextResponse.json(fallback);
    }

    return NextResponse.json(
      { error: 'Podaj station=<id> albo lat=<lat>&lon=<lon>' },
      { status: 400 },
    );
  } catch (err) {
    return publicError(err, 'gios');
  }
}
