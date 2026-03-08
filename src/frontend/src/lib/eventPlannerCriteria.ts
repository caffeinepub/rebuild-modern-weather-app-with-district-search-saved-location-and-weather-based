export type EventType = "picnic" | "wedding" | "concert" | "sports";

export interface EventCriteria {
  temperatureMin: number;
  temperatureMax: number;
  maxRainProbability: number;
  maxWindSpeed: number;
}

export const EVENT_TYPE_CRITERIA: Record<EventType, EventCriteria> = {
  picnic: {
    temperatureMin: 15,
    temperatureMax: 28,
    maxRainProbability: 20,
    maxWindSpeed: 25,
  },
  wedding: {
    temperatureMin: 18,
    temperatureMax: 30,
    maxRainProbability: 10,
    maxWindSpeed: 15,
  },
  concert: {
    temperatureMin: 12,
    temperatureMax: 26,
    maxRainProbability: 15,
    maxWindSpeed: 30,
  },
  sports: {
    temperatureMin: 10,
    temperatureMax: 25,
    maxRainProbability: 20,
    maxWindSpeed: 20,
  },
};
