import { LocationData, WeatherData } from './types';

// Australia Bureau of Meteorology API and related services
export interface AustralianWeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  conditions: string;
  icon: string;
  // Additional Australian-specific data
  uvIndex?: number;
  rainfall?: number;
}

export interface TideData {
  height: number;
  time: string;
  type: 'high' | 'low';
}

export interface WaveData {
  height: number;
  period: number;
  direction: number;
}

export interface AustralianEnvironmentData {
  weather: AustralianWeatherData;
  tides: TideData[];
  waves: WaveData;
  location: {
    state: string;
    region: string;
    nearestStation: string;
  };
}

class AustralianWeatherService {
  
  // Simple in-memory cache to reduce network calls (30 minutes TTL)
  private cache = new Map<string, { expires: number; data: any }>();
  // Enable verbose logging for debugging BOM fetch/parse
  private debug = true;

  private dbg(label: string, payload?: any) {
    if (!this.debug) return;
    try {
      // Avoid dumping huge objects
      if (payload && typeof payload === 'object') {
        const safe = JSON.stringify(payload, (k, v) => v, 2);
        console.log(`[Weather] ${label}:`, safe.length > 1000 ? safe.slice(0, 1000) + '…' : safe);
      } else {
        console.log(`[Weather] ${label}:`, payload);
      }
    } catch {
      console.log(`[Weather] ${label}`);
    }
  }

  private previewJson(json: any) {
    const keys = json && typeof json === 'object' ? Object.keys(json).slice(0, 20) : [];
    const dataKeys = json?.data && typeof json.data === 'object' ? Object.keys(json.data).slice(0, 20) : [];
    const obsLen = Array.isArray(json?.observations?.data) ? json.observations.data.length : undefined;
    const obs0Keys = obsLen ? Object.keys(json.observations.data[0] || {}).slice(0, 20) : [];
    return { keys, dataType: typeof json?.data, dataKeys, obsLen, obs0Keys };
  }

  private previewNode(node: any) {
    if (!node || typeof node !== 'object') return node;
    const out: Record<string, any> = {};
    for (const k of Object.keys(node).slice(0, 12)) {
      const v = (node as any)[k];
      if (v && typeof v === 'object') {
        const sub: Record<string, any> = {};
        for (const kk of Object.keys(v).slice(0, 6)) {
          const vv = (v as any)[kk];
          sub[kk] = typeof vv;
        }
        out[k] = { type: 'object', keys: Object.keys(v).slice(0, 6), shape: sub };
      } else {
        out[k] = typeof v;
      }
    }
    return out;
  }

  /**
   * Get current weather conditions for Australian location.
   * Uses BOM Weather API (free). Falls back to mock on failure.
   */
  async getCurrentWeather(location: LocationData): Promise<AustralianWeatherData> {
    const key = this.keyFor('wx', location);
    const cached = this.getFromCache<AustralianWeatherData>(key);
    if (cached) return cached;

    try {
      // 1) Try BOM Weather API (no key, geohash-based)
      this.dbg('getCurrentWeather.loc', { lat: location.latitude, lon: location.longitude });
      const bom = await this.fetchBomWeather(location);
      if (bom) {
        this.putToCache(key, bom, 15 * 60 * 1000);
        return bom;
      }
    } catch (error) {
      console.warn('BOM weather failed, returning zeros:', error);
    }

    // Fallback to zeros if BOM response unavailable or unparsable
    const zero: AustralianWeatherData = {
      temperature: 0,
      humidity: 0,
      pressure: 0,
      windSpeed: 0,
      windDirection: 0,
      conditions: 'Unknown',
      icon: 'cloud.fill',
    };
    this.putToCache(key, zero, 5 * 60 * 1000);
    return zero;
  }

  /**
   * Get tide information for Australian coastal locations.
   * Tries BOM Weather API tide endpoint first; falls back to mock on failure.
   */
  async getTideData(location: LocationData): Promise<TideData[]> {
    const key = this.keyFor('tide', location);
    const cached = this.getFromCache<TideData[]>(key);
    if (cached) return cached;
    try {
      const bom = await this.fetchBomTides(location);
      if (bom && bom.length) {
        this.putToCache(key, bom, 6 * 60 * 60 * 1000); // cache tides for 6h
        return bom;
      }
    } catch (e) {
      console.warn('BOM tides failed, returning empty list:', e);
    }

    // Fallback to empty list
    const empty: TideData[] = [];
    this.putToCache(key, empty, 60 * 60 * 1000);
    return empty;
  }

  /**
   * Get wave conditions for Australian coastal locations.
   * BOM public API does not provide a unified free wave endpoint; return zeroes.
   */
  async getWaveData(location: LocationData): Promise<WaveData> {
    const key = this.keyFor('wave', location);
    const cached = this.getFromCache<WaveData>(key);
    if (cached) return cached;
    try {
      const data: WaveData = { height: 0, period: 0, direction: 0 };
      this.putToCache(key, data, 30 * 60 * 1000);
      return data;
    } catch (error) {
      console.warn('Wave data unavailable, returning zeroes:', error);
      const data = { height: 0, period: 0, direction: 0 } as WaveData;
      this.putToCache(key, data, 10 * 60 * 1000);
      return data;
    }
  }

  /**
   * Get comprehensive environmental data for fishing
   */
  async getEnvironmentalData(location: LocationData): Promise<AustralianEnvironmentData> {
    try {
      const [weather, tides, waves] = await Promise.all([
        this.getCurrentWeather(location),
        this.getTideData(location),
        this.getWaveData(location),
      ]);

      return {
        weather,
        tides,
        waves,
        location: this.getLocationInfo(location),
      };
    } catch (error) {
      console.error('Failed to fetch environmental data:', error);
      throw error;
    }
  }

  private getMockWeatherData(location: LocationData): AustralianWeatherData {
    // Generate realistic mock weather data for Australia
    const conditions = [
      'Sunny', 'Partly Cloudy', 'Cloudy', 'Overcast', 
      'Light Rain', 'Heavy Rain', 'Thunderstorms', 'Clear'
    ];
    
    return {
      temperature: Math.round(15 + Math.random() * 20), // 15-35°C typical Australian range
      humidity: Math.round(40 + Math.random() * 50), // 40-90%
      pressure: Math.round(1000 + Math.random() * 50), // 1000-1050 hPa
      windSpeed: Math.round(Math.random() * 25), // 0-25 km/h
      windDirection: Math.round(Math.random() * 360),
      conditions: conditions[Math.floor(Math.random() * conditions.length)],
      icon: 'sun.max', // Default icon
      uvIndex: Math.round(Math.random() * 11), // 0-11 UV index
      rainfall: Math.random() * 10, // 0-10mm
    };
  }

  private getMockTideData(location: LocationData): TideData[] {
    // Generate mock tide data (2 high and 2 low tides per day is typical)
    const now = new Date();
    const tides: TideData[] = [];
    
    for (let i = 0; i < 4; i++) {
      const time = new Date(now.getTime() + i * 6 * 60 * 60 * 1000); // Every 6 hours
      tides.push({
        height: Math.round((0.5 + Math.random() * 2) * 100) / 100, // 0.5-2.5m
        time: time.toISOString(),
        type: i % 2 === 0 ? 'high' : 'low',
      });
    }
    
    return tides;
  }

  private getMockWaveData(location: LocationData): WaveData {
    return {
      height: Math.round((0.5 + Math.random() * 3) * 10) / 10, // 0.5-3.5m
      period: Math.round(6 + Math.random() * 8), // 6-14 seconds
      direction: Math.round(Math.random() * 360), // 0-360 degrees
    };
  }

  private getLocationInfo(location: LocationData): { state: string; region: string; nearestStation: string } {
    // This would normally use reverse geocoding to determine Australian state/region
    // For now, return mock data
    const states = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'];
    const regions = ['Metropolitan', 'Coastal', 'Inland', 'Alpine', 'Tropical'];
    
    return {
      state: states[Math.floor(Math.random() * states.length)],
      region: regions[Math.floor(Math.random() * regions.length)],
      nearestStation: 'Sydney Harbour', // Mock station name
    };
  }

  /**
   * Check if location is suitable for fishing based on weather conditions
   */
  evaluateFishingConditions(data: AustralianEnvironmentData): {
    score: number; // 0-100
    recommendation: string;
    factors: string[];
  } {
    let score = 50; // Base score
    const factors: string[] = [];

    // Temperature factors (ideal 15-25°C for most Australian fishing)
    if (data.weather.temperature >= 15 && data.weather.temperature <= 25) {
      score += 10;
      factors.push('Good temperature for fishing');
    } else if (data.weather.temperature < 10 || data.weather.temperature > 30) {
      score -= 10;
      factors.push('Extreme temperature may affect fish activity');
    }

    // Wind factors
    if (data.weather.windSpeed <= 15) {
      score += 15;
      factors.push('Calm conditions ideal for fishing');
    } else if (data.weather.windSpeed > 25) {
      score -= 20;
      factors.push('High winds may make fishing difficult');
    }

    // Rain factors
    if (data.weather.conditions.includes('Rain') || data.weather.conditions.includes('Storm')) {
      score -= 15;
      factors.push('Wet weather may reduce fishing success');
    }

    // Pressure factors (falling pressure often improves fishing)
    if (data.weather.pressure > 1020) {
      score += 5;
      factors.push('High pressure systems are stable');
    }

    // Wave factors for coastal fishing
    if (data.waves.height <= 1.5) {
      score += 10;
      factors.push('Small waves good for boat fishing');
    } else if (data.waves.height > 3) {
      score -= 15;
      factors.push('Large waves may be dangerous');
    }

    // Determine recommendation
    let recommendation: string;
    if (score >= 80) {
      recommendation = 'Excellent fishing conditions';
    } else if (score >= 65) {
      recommendation = 'Good fishing conditions';
    } else if (score >= 50) {
      recommendation = 'Fair fishing conditions';
    } else {
      recommendation = 'Poor fishing conditions - consider waiting';
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      recommendation,
      factors,
    };
  }

  // --- Helpers ---
  private keyFor(prefix: string, loc: LocationData) {
    // round to 2 decimals to encourage cache reuse within ~1km
    const lat = loc.latitude.toFixed(2);
    const lon = loc.longitude.toFixed(2);
    return `${prefix}:${lat},${lon}`;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private putToCache(key: string, data: any, ttlMs: number) {
    this.cache.set(key, { data, expires: Date.now() + ttlMs });
  }

  private safeNumber(n: any): number {
    const x = Number(n);
    return isFinite(x) ? x : 0;
  }

  private mapWmoToText(code: number): string {
    // WMO weather interpretation codes
    const m: Record<number, string> = {
      0: 'Clear',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Freezing drizzle',
      57: 'Freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Freezing rain',
      67: 'Freezing rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Thunderstorm with hail',
    };
    return m[Number(code)] || 'Unknown';
  }

  private mapWmoToIcon(code: number): string {
    // Map to SF Symbols-ish naming used in app
    const c = Number(code);
    if (c === 0) return 'sun.max.fill';
    if (c === 1 || c === 2) return 'cloud.sun.fill';
    if (c === 3) return 'cloud.fill';
    if (c >= 51 && c <= 57) return 'cloud.drizzle.fill';
    if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) return 'cloud.rain.fill';
    if (c >= 71 && c <= 77) return 'cloud.snow.fill';
    if (c === 45 || c === 48) return 'cloud.fog.fill';
    if (c >= 95) return 'cloud.bolt.rain.fill';
    return 'cloud.fill';
  }

  // --- BOM helpers ---
  private async fetchBomWeather(location: LocationData): Promise<AustralianWeatherData | null> {
    const precisions = [6, 5, 4];
    for (const prec of precisions) {
      try {
        const gh = this.encodeGeohash(location.latitude, location.longitude, prec);
        const url = `https://api.weather.bom.gov.au/v1/locations/${gh}/observations`;
        this.dbg('fetchBomWeather.try', { url, geohash: gh, precision: prec });
        const res = await fetch(url);
        this.dbg('fetchBomWeather.res', { ok: res.ok, status: res.status, precision: prec });
        if (!res.ok) {
          continue; // try next precision
        }
        const json: any = await res.json();
        this.dbg('fetchBomWeather.jsonPreview', this.previewJson(json));

        // Try to find the observation node across known BOM shapes
        const d = this.pickBomObservation(json);
        this.dbg('fetchBomWeather.pick.keys', d && typeof d === 'object' ? Object.keys(d).slice(0, 20) : []);

        // Extract with multiple fallbacks for field names used across BOM responses
        this.dbg('fetchBomWeather.windRaw', {
          wind: this.previewNode(d?.wind),
          gust: this.previewNode(d?.gust),
          max_gust: this.previewNode(d?.max_gust),
        });
        // Temperature
        const temp = this.safeNumber(
          d?.temp?.now ??
            d?.temperature?.now ??
            d?.air_temp_now ??
            d?.air_temp ??
            d?.temperature ??
            d?.temp // some responses expose number directly
        );

        // Humidity
        const rh = this.safeNumber(
          d?.humidity?.now ??
            d?.relative_humidity?.now ??
            d?.rel_hum ??
            d?.humidity
        );

        // Pressure (may be missing on some feeds)
        const p = this.safeNumber(
          d?.pressure?.now ??
            d?.pressure_msl?.now ??
            d?.msl_pressure_now ??
            d?.msl_pres ??
            d?.press_msl ??
            d?.pressure
        );

        // Wind speed
        const extractKmh = (src: any): number => {
          if (src == null) return 0;
          if (typeof src === 'number') return this.safeNumber(src);
          // Common nested shapes
          const kmhNow = this.safeNumber(src?.speed_kilometre?.now ?? src?.speed_kmh?.now ?? src?.kmh?.now ?? src?.kph?.now);
          if (kmhNow) return kmhNow;
          const kmh = this.safeNumber(src?.speed_kilometre ?? src?.speed_kmh ?? src?.kmh ?? src?.kph ?? src?.speed);
          if (kmh) return kmh;
          const knotsNow = this.safeNumber(src?.speed_knots?.now ?? src?.knots?.now);
          if (knotsNow) return Math.round(knotsNow * 1.852);
          const knots = this.safeNumber(src?.speed_knots ?? src?.knots);
          if (knots) return Math.round(knots * 1.852);
          return 0;
        };
        let windKmh = extractKmh(d?.wind);
        if (!windKmh) windKmh = extractKmh(d?.gust);
        if (!windKmh) windKmh = extractKmh(d?.max_gust);

        // Wind direction; map cardinal to degrees if needed
        const toDeg = (v: any): number => {
          if (typeof v === 'number') return v;
          const s = (v || '').toString().trim().toUpperCase();
          const map: Record<string, number> = {
            N: 0, NNE: 22.5, NE: 45, ENE: 67.5,
            E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
            S: 180, SSW: 202.5, SW: 225, WSW: 247.5,
            W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
          };
          return map[s] ?? 0;
        };
        const dir = toDeg(
          d?.wind?.direction?.now ?? d?.wind?.direction?.value ?? d?.wind?.direction ?? d?.wind_dir_deg
        );

        const iconDesc: string | undefined = d?.icon_descriptor || d?.icon?.descriptor;
        const wxText: string | undefined = d?.weather || d?.short_text || iconDesc;

        const data: AustralianWeatherData = {
          temperature: temp,
          humidity: rh,
          pressure: p,
          windSpeed: windKmh,
          windDirection: dir,
          conditions: (wxText || 'Unknown') as string,
          icon: this.mapBomIcon(iconDesc),
        };
        this.dbg('fetchBomWeather.parsed', { ...data, precision: prec });

        return data;
      } catch (e) {
        // try next precision
        this.dbg('fetchBomWeather.error', { message: (e as Error)?.message, precision: prec });
      }
    }
    console.warn('BOM fetch failed at all precisions');
    return null;
  }

  // Attempt to locate the latest observation node in BOM responses
  private pickBomObservation(json: any): any {
    if (!json) return json;
    // Common shapes observed:
    // - { data: { temp: { now: ... }, ... } }
    // - { observations: { data: [ { air_temp: ..., rel_hum: ..., wind_spd_kmh: ... } ] } }
    // - { data: [ { ... } ] }
    const last = (arr: any[]) => (Array.isArray(arr) && arr.length ? arr[arr.length - 1] : null);
    const candidates: any[] = [
      json?.data,
      last(json?.observations?.data),
      json?.observations?.data?.[0],
      last(json?.data),
      Array.isArray(json?.data) ? json.data[0] : null,
      json,
    ];
    for (const c of candidates) {
      if (c && typeof c === 'object') return c;
    }
    return json;
  }

  private mapBomIcon(desc?: string): string {
    const d = (desc || '').toLowerCase();
    if (!d) return 'cloud.fill';
    if (d.includes('sunny') || d.includes('clear')) return 'sun.max.fill';
    if (d.includes('partly')) return 'cloud.sun.fill';
    if (d.includes('cloud')) return 'cloud.fill';
    if (d.includes('shower') || d.includes('rain')) return 'cloud.rain.fill';
    if (d.includes('storm') || d.includes('thunder')) return 'cloud.bolt.rain.fill';
    if (d.includes('snow')) return 'cloud.snow.fill';
    if (d.includes('fog')) return 'cloud.fog.fill';
    return 'cloud.fill';
  }

  // Minimal geohash implementation (base32) suitable for BOM API (precision 6 default)
  private encodeGeohash(lat: number, lon: number, precision = 6): string {
    const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    let idx = 0, bit = 0, evenBit = true;
    let latMin = -90, latMax = 90;
    let lonMin = -180, lonMax = 180;
    let hash = '';
    while (hash.length < precision) {
      if (evenBit) {
        const lonMid = (lonMin + lonMax) / 2;
        if (lon >= lonMid) { idx = idx * 2 + 1; lonMin = lonMid; } else { idx = idx * 2; lonMax = lonMid; }
      } else {
        const latMid = (latMin + latMax) / 2;
        if (lat >= latMid) { idx = idx * 2 + 1; latMin = latMid; } else { idx = idx * 2; latMax = latMid; }
      }
      evenBit = !evenBit;
      if (++bit == 5) { hash += base32.charAt(idx); bit = 0; idx = 0; }
    }
    return hash;
  }

  private async fetchBomTides(location: LocationData): Promise<TideData[] | null> {
    // BOM Weather API tide endpoint (geohash-based). Some locations may not have tide data.
    // Try a couple of plausible endpoints; if both fail, return null to trigger fallback.
    const precisions = [6, 5, 4];
    for (const prec of precisions) {
      const gh = this.encodeGeohash(location.latitude, location.longitude, prec);
      const candidates = [
        `https://api.weather.bom.gov.au/v1/locations/${gh}/tides`,
        `https://api.weather.bom.gov.au/v1/locations/${gh}/marine/tides`,
      ];
      for (const url of candidates) {
        try {
          this.dbg('fetchBomTides.try', { url, geohash: gh, precision: prec });
          const res = await fetch(url);
          this.dbg('fetchBomTides.res', { ok: res.ok, status: res.status, precision: prec });
          if (!res.ok) continue;
          const json: any = await res.json();
          this.dbg('fetchBomTides.jsonPreview', this.previewJson(json));
          const parsed = this.parseBomTideJson(json);
          this.dbg('fetchBomTides.parsedCount', { count: parsed.length, precision: prec });
          if (parsed.length) return parsed;
        } catch (e) {
          this.dbg('fetchBomTides.error', { message: (e as Error)?.message, precision: prec });
          // try next
        }
      }
    }
    return null;
  }

  private parseBomTideJson(json: any): TideData[] {
    const out: TideData[] = [];
    if (!json) return out;

    // Common structures observed in tide APIs
    const lists: any[] = [];
    if (Array.isArray(json?.tides)) lists.push(...json.tides);
    if (Array.isArray(json?.data)) lists.push(...json.data);
    if (Array.isArray(json?.predictions)) lists.push(...json.predictions);
    if (Array.isArray(json?.entries)) lists.push(...json.entries);

    const pushEntry = (timeStr: any, heightVal: any, typeVal: any) => {
      const t = typeof timeStr === 'string' ? timeStr : new Date(timeStr).toISOString();
      const hNum = this.safeNumber(heightVal);
      let tp: 'high' | 'low' | null = null;
      const tv = (typeVal || '').toString().toLowerCase();
      if (tv.includes('high')) tp = 'high';
      if (tv.includes('low')) tp = 'low';
      if (!tp) tp = hNum >= 1.5 ? 'high' : 'low';
      out.push({ time: t, height: Math.round(hNum * 100) / 100, type: tp });
    };

    for (const item of lists) {
      if (!item) continue;
      // Possible key variants
      const time = item.time || item.date || item.at || item.timestamp;
      const height = item.height || item.tide_height || item.value || item.metres || item.meters;
      const type = item.type || item.event || item.tide_type;
      if (time != null && height != null) {
        // Some feeds provide millimetres
        const h = typeof height === 'number' && height > 10 ? height / 1000 : height; // mm -> m
        pushEntry(time, h, type);
      }
    }
    // Sort by time
    out.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    // Limit to next ~4 entries
    return out.slice(0, 6);
  }
}

export const australianWeatherService = new AustralianWeatherService();
