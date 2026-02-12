export type Locale = 'tr' | 'en';

export const translations = {
  tr: {
    // Header
    'header.title': 'Hava Durumu Panosu',
    
    // Location Search
    'location.search.placeholder': 'İlçe veya şehir ara...',
    'location.search.error': 'Konum araması başarısız. Lütfen tekrar deneyin.',
    'location.search.noResults': 'Konum bulunamadı. Farklı bir arama terimi deneyin.',
    
    // Empty State
    'empty.title': 'Bir Konum Arayın',
    'empty.description': 'Hava durumu koşullarını görüntülemek için yukarıya bir ilçe adı girin',
    
    // Weather Panel
    'weather.current': 'Şu Anki Hava Durumu',
    'weather.feelsLike': 'Hissedilen',
    'weather.windSpeed': 'Rüzgar Hızı',
    'weather.humidity': 'Nem',
    'weather.pressure': 'Basınç',
    'weather.cloudCover': 'Bulut Örtüsü',
    'weather.hourlyForecast': '24 Saatlik Tahmin',
    'weather.dailyForecast': '7 Günlük Tahmin',
    'weather.high': 'Yüksek',
    'weather.low': 'Düşük',
    'weather.error': 'Hava durumu verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.',
    
    // Weather Conditions
    'weather.condition.0': 'Açık gökyüzü',
    'weather.condition.1': 'Çoğunlukla açık',
    'weather.condition.2': 'Parçalı bulutlu',
    'weather.condition.3': 'Kapalı',
    'weather.condition.45': 'Sisli',
    'weather.condition.48': 'Kırağı sisi',
    'weather.condition.51': 'Hafif çisenti',
    'weather.condition.53': 'Orta şiddette çisenti',
    'weather.condition.55': 'Yoğun çisenti',
    'weather.condition.56': 'Hafif dondurucu çisenti',
    'weather.condition.57': 'Yoğun dondurucu çisenti',
    'weather.condition.61': 'Hafif yağmur',
    'weather.condition.63': 'Orta şiddette yağmur',
    'weather.condition.65': 'Şiddetli yağmur',
    'weather.condition.66': 'Hafif dondurucu yağmur',
    'weather.condition.67': 'Şiddetli dondurucu yağmur',
    'weather.condition.71': 'Hafif kar yağışı',
    'weather.condition.73': 'Orta şiddette kar yağışı',
    'weather.condition.75': 'Şiddetli kar yağışı',
    'weather.condition.77': 'Kar taneleri',
    'weather.condition.80': 'Hafif sağanak yağmur',
    'weather.condition.81': 'Orta şiddette sağanak yağmur',
    'weather.condition.82': 'Şiddetli sağanak yağmur',
    'weather.condition.85': 'Hafif kar sağanağı',
    'weather.condition.86': 'Şiddetli kar sağanağı',
    'weather.condition.95': 'Gök gürültülü fırtına',
    'weather.condition.96': 'Hafif dolu ile gök gürültülü fırtına',
    'weather.condition.99': 'Şiddetli dolu ile gök gürültülü fırtına',
    'weather.condition.unknown': 'Bilinmeyen',
    
    // Footer
    'footer.builtWith': 'ile sevgiyle yapıldı',
    
    // Language
    'language.turkish': 'Türkçe',
    'language.english': 'English',
  },
  en: {
    // Header
    'header.title': 'Weather Dashboard',
    
    // Location Search
    'location.search.placeholder': 'Search for a district or city...',
    'location.search.error': 'Failed to search locations. Please try again.',
    'location.search.noResults': 'No locations found. Try a different search term.',
    
    // Empty State
    'empty.title': 'Search for a Location',
    'empty.description': 'Enter a district name above to view weather conditions',
    
    // Weather Panel
    'weather.current': 'Current Weather',
    'weather.feelsLike': 'Feels like',
    'weather.windSpeed': 'Wind Speed',
    'weather.humidity': 'Humidity',
    'weather.pressure': 'Pressure',
    'weather.cloudCover': 'Cloud Cover',
    'weather.hourlyForecast': '24-Hour Forecast',
    'weather.dailyForecast': '7-Day Forecast',
    'weather.high': 'High',
    'weather.low': 'Low',
    'weather.error': 'Failed to load weather data. Please try again later.',
    
    // Weather Conditions
    'weather.condition.0': 'Clear sky',
    'weather.condition.1': 'Mainly clear',
    'weather.condition.2': 'Partly cloudy',
    'weather.condition.3': 'Overcast',
    'weather.condition.45': 'Foggy',
    'weather.condition.48': 'Depositing rime fog',
    'weather.condition.51': 'Light drizzle',
    'weather.condition.53': 'Moderate drizzle',
    'weather.condition.55': 'Dense drizzle',
    'weather.condition.56': 'Light freezing drizzle',
    'weather.condition.57': 'Dense freezing drizzle',
    'weather.condition.61': 'Slight rain',
    'weather.condition.63': 'Moderate rain',
    'weather.condition.65': 'Heavy rain',
    'weather.condition.66': 'Light freezing rain',
    'weather.condition.67': 'Heavy freezing rain',
    'weather.condition.71': 'Slight snow fall',
    'weather.condition.73': 'Moderate snow fall',
    'weather.condition.75': 'Heavy snow fall',
    'weather.condition.77': 'Snow grains',
    'weather.condition.80': 'Slight rain showers',
    'weather.condition.81': 'Moderate rain showers',
    'weather.condition.82': 'Violent rain showers',
    'weather.condition.85': 'Slight snow showers',
    'weather.condition.86': 'Heavy snow showers',
    'weather.condition.95': 'Thunderstorm',
    'weather.condition.96': 'Thunderstorm with slight hail',
    'weather.condition.99': 'Thunderstorm with heavy hail',
    'weather.condition.unknown': 'Unknown',
    
    // Footer
    'footer.builtWith': 'Built with love using',
    
    // Language
    'language.turkish': 'Türkçe',
    'language.english': 'English',
  },
} as const;

export type TranslationKey = keyof typeof translations.tr;
