import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface WeatherResponse {
    country: string;
    city: string;
    daily: {
        precipitation: Precipitation;
        temperature?: number;
        windSpeed: number;
        windDir: number;
        condition: string;
    };
    weekly: Array<WeeklyForecast>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Precipitation {
    probability: number;
    amount: number;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface WeeklyForecast {
    precipitation: Precipitation;
    temperature?: number;
    windSpeed: number;
    timestamp: bigint;
    windDir: number;
    condition: string;
}
export interface DBWeather {
    cloudCover?: number;
    temperatureMax?: number;
    temperatureMin?: number;
    country: string;
    precipitation?: number;
    temperature?: number;
    city: string;
    windSpeed?: number;
    solar?: number;
    windDirection?: number;
    temperatureDaily?: number;
    precipitationProbability?: number;
    condition: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface backendInterface {
    conditionForWeather(weather: DBWeather): Promise<string>;
    getBackendCachedRainViewer(): Promise<string>;
    getCachedWeather(key: string): Promise<WeatherResponse | null>;
    getCurrentWeather(city: string, country: string): Promise<WeatherResponse | null>;
    getDailyForecast(city: string, country: string, timestamp: bigint): Promise<WeeklyForecast | null>;
    getHealthCheck(): Promise<{
        status: string;
        version: string;
        timestamp: bigint;
    }>;
    getRainViewerCache(): Promise<string>;
    getWeather(city: string, country: string): Promise<WeatherResponse | null>;
    getWeatherData(city: string, country: string): Promise<{
        country: string;
        city: string;
        daily: {
            precipitation: {
                probability: number;
                amount: number;
            };
            temperature?: number;
            windSpeed: number;
            windDir: number;
            condition: string;
        };
        weekly: Array<{
            precipitation: {
                probability: number;
                amount: number;
            };
            temperature?: number;
            windSpeed: number;
            timestamp: bigint;
            windDir: number;
            condition: string;
        }>;
    }>;
    getWeeklyForecast(city: string, country: string): Promise<Array<WeeklyForecast> | null>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    upsertWeather(key: string, weatherData: WeatherResponse): Promise<boolean>;
}
