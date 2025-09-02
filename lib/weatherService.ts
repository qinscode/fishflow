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
  private readonly BOM_API_BASE = 'http://www.bom.gov.au/fwo';
  private readonly TIDE_API_BASE = 'https://api.willyweather.com.au';
  private readonly WAVE_API_BASE = 'https://api.willyweather.com.au';

  /**
   * Get current weather conditions for Australian location
   * Uses Bureau of Meteorology (BOM) data
   */
  async getCurrentWeather(location: LocationData): Promise<AustralianWeatherData> {
    try {
      // For now, return mock data as BOM doesn't have a public REST API
      // In production, you would integrate with a paid weather service like:
      // - WillyWeather API (Australian focused)
      // - OpenWeatherMap (has Australian data)
      // - WeatherAPI (covers Australia well)
      
      return this.getMockWeatherData(location);
    } catch (error) {
      console.error('Failed to fetch Australian weather data:', error);
      throw new Error('Unable to fetch weather information');
    }
  }

  /**
   * Get tide information for Australian coastal locations
   */
  async getTideData(location: LocationData): Promise<TideData[]> {
    try {
      // Mock tide data for Australian locations
      return this.getMockTideData(location);
    } catch (error) {
      console.error('Failed to fetch tide data:', error);
      throw new Error('Unable to fetch tide information');
    }
  }

  /**
   * Get wave conditions for Australian coastal locations
   */
  async getWaveData(location: LocationData): Promise<WaveData> {
    try {
      // Mock wave data
      return this.getMockWaveData(location);
    } catch (error) {
      console.error('Failed to fetch wave data:', error);
      throw new Error('Unable to fetch wave information');
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
}

export const australianWeatherService = new AustralianWeatherService();