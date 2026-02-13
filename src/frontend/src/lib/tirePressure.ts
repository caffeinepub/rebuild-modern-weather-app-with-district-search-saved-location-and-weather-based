import type { TranslationKey } from '../i18n/translations';

export interface TirePressureRecommendation {
  adjustment: string;
  explanationKey: TranslationKey;
  temperature: number;
}

const VEHICLE_BASE_PRESSURE = {
  passenger: 32, // PSI
  suv: 35,
  commercial: 50,
};

const REFERENCE_TEMP = 20; // °C
const PSI_PER_10C = 1; // PSI change per 10°C

export function calculateTirePressureRecommendation(
  temperature: number,
  vehicleType: string
): TirePressureRecommendation {
  const basePressure = VEHICLE_BASE_PRESSURE[vehicleType as keyof typeof VEHICLE_BASE_PRESSURE] || VEHICLE_BASE_PRESSURE.passenger;
  
  // Calculate temperature difference from reference
  const tempDiff = temperature - REFERENCE_TEMP;
  const pressureChange = (tempDiff / 10) * PSI_PER_10C;
  const recommendedPressure = basePressure + pressureChange;
  
  // Determine adjustment message
  let adjustment: string;
  let explanationKey: TranslationKey;
  
  if (temperature < 0) {
    adjustment = `+${Math.abs(pressureChange).toFixed(1)} PSI`;
    explanationKey = 'tire.cold';
  } else if (temperature < 10) {
    adjustment = `+${Math.abs(pressureChange).toFixed(1)} PSI`;
    explanationKey = 'tire.cool';
  } else if (temperature > 30) {
    adjustment = `-${Math.abs(pressureChange).toFixed(1)} PSI`;
    explanationKey = 'tire.hot';
  } else if (temperature > 25) {
    adjustment = `-${Math.abs(pressureChange).toFixed(1)} PSI`;
    explanationKey = 'tire.warm';
  } else {
    adjustment = '±0 PSI';
    explanationKey = 'tire.optimal';
  }

  return {
    adjustment,
    explanationKey,
    temperature,
  };
}
