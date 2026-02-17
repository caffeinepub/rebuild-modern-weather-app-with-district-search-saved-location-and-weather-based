import Text "mo:core/Text";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Timer "mo:core/Timer";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Time "mo:core/Time";
import List "mo:core/List";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import OutCall "http-outcalls/outcall";
import Migration "migration";

(with migration = Migration.run)
actor {
  type WeatherResponse = {
    city : Text;
    country : Text;
    daily : {
      temperature : ?Float;
      condition : Text;
      precipitation : Precipitation;
      windSpeed : Float;
      windDir : Float;
    };
    weekly : [WeeklyForecast];
  };

  type WeeklyForecast = {
    timestamp : Int;
    temperature : ?Float;
    condition : Text;
    precipitation : Precipitation;
    windSpeed : Float;
    windDir : Float;
  };

  type Precipitation = {
    amount : Float;
    probability : Float;
  };

  type Condition = {
    clear : Int;
    cloudy : Int;
    rain : Int;
    snow : Int;
    fog : Int;
    pCloud : Int;
    pClear : Int;
  };

  type DBWeather = {
    city : Text;
    country : Text;
    temperature : ?Float;
    condition : Text;
    temperatureMin : ?Float;
    temperatureMax : ?Float;
    temperatureDaily : ?Float;
    precipitation : ?Float;
    precipitationProbability : ?Float;
    windSpeed : ?Float;
    windDirection : ?Float;
    cloudCover : ?Float;
    solar : ?Float;
  };

  type WeatherReport = {
    city : Text;
    country : Text;
    timestamp : Int;
    daily : DBWeather;
    weekly : [WeeklyForecast];
  };

  type Weather = {
    dbWeather : DBWeather;
    hourlyWeather : [DBWeather];
    windSpeed : Float;
    windDirection : Float;
    weeklyForecast : [WeeklyForecast];
  };

  let oracleCache = Map.empty<Text, WeatherResponse>();
  var lastCacheClear : Time.Time = 0;

  func isSnowCondition(condition : Text) : Bool {
    condition.contains(#text "Cloudy") or condition.contains(#text "Snowy");
  };

  public query ({ caller }) func getWeather(city : Text, country : Text) : async ?WeatherResponse {
    let dailyWeather = {
      temperature = ?10.0;
      condition = "Sunny";
      precipitation = { amount = 0.0; probability = 42.0 };
      windSpeed = 5.0;
      windDir = 2.2;
    };
    let weeklyWeather : [WeeklyForecast] = [
      {
        timestamp = 42;
        temperature = ?12.0;
        condition = "partly cloudy";
        precipitation = { amount = 0.61; probability = 33.33 };
        windSpeed = 4.0;
        windDir = 2.5;
      }
    ];
    ?{
      city;
      country;
      daily = dailyWeather;
      weekly = weeklyWeather;
    };
  };

  public query ({ caller }) func getWeeklyForecast(city : Text, country : Text) : async ?[WeeklyForecast] {
    let weeklyWeather : [WeeklyForecast] = [
      {
        timestamp = 42;
        temperature = ?10.0;
        condition = "partly cloudy";
        precipitation = { amount = 0.61; probability = 33.33 };
        windSpeed = 4.0;
        windDir = 2.5;
      }
    ];
    ?weeklyWeather;
  };

  public query ({ caller }) func getDailyForecast(city : Text, country : Text, timestamp : Int) : async ?WeeklyForecast {
    ?{
      timestamp = 42;
      temperature = ?10.0;
      condition = "partly cloudy";
      precipitation = { amount = 0.61; probability = 33.33 };
      windSpeed = 4.0;
      windDir = 2.5;
    };
  };

  public query ({ caller }) func getCurrentWeather(city : Text, country : Text) : async ?WeatherResponse {
    let dailyWeather = {
      temperature = ?10.0;
      condition = "Sunny";
      precipitation = { amount = 0.0; probability = 42.0 };
      windSpeed = 5.0;
      windDir = 2.2;
    };
    let weeklyWeather : [WeeklyForecast] = [
      {
        timestamp = 42;
        temperature = ?10.0;
        condition = "partly cloudy";
        precipitation = { amount = 0.61; probability = 33.33 };
        windSpeed = 4.0;
        windDir = 2.5;
      }
    ];
    ?{
      city;
      country;
      daily = dailyWeather;
      weekly = weeklyWeather;
    };
  };

  public shared ({ caller }) func upsertWeather(key : Text, weatherData : WeatherResponse) : async Bool {
    oracleCache.add(key, weatherData);
    true;
  };

  public query ({ caller }) func getCachedWeather(key : Text) : async ?WeatherResponse {
    oracleCache.get(key);
  };

  func timer<system>() : async () {
    let now = Time.now();
    let dailyCheckInterval : Time.Time = 24 * 60 * 60 * 1000;
    if (now - lastCacheClear > dailyCheckInterval) {
      oracleCache.clear();
      lastCacheClear := now;
    };
  };

  let dailyCheckInterval : Nat = 24 * 60 * 60 * 1000 * 7;

  let recurringTimer : Timer.TimerId = Timer.recurringTimer<system>(#seconds(dailyCheckInterval), timer);

  func compareHourlyWeather(a : DBWeather, b : DBWeather) : Order.Order {
    let aTemp = switch (a.temperature) {
      case (null) { 0.0 };
      case (?temp) { temp };
    };
    let bTemp = switch (b.temperature) {
      case (null) { 0.0 };
      case (?temp) { temp };
    };
    Float.compare(aTemp, bTemp);
  };

  func positionToCondition(pos : Int) : Text {
    switch (pos) {
      case (0) { "Clear" };
      case (1) { "Cloudy" };
      case (2) { "Rain" };
      case (3) { "Snow" };
      case (4) { "Fog" };
      case (5) { "Partly Cloudy" };
      case (6) { "Partly Clear" };
      case (_) { "Unknown" };
    };
  };

  public query ({ caller }) func conditionForWeather(weather : DBWeather) : async Text {
    let temp = switch (weather.temperature) {
      case (?t) { t };
      case (null) { 0.0 };
    };
    let windSpeed = switch (weather.windSpeed) {
      case (?ws) { ws };
      case (null) { 0.0 };
    };
    let precipitation = switch (weather.precipitation) {
      case (?p) { p };
      case (null) { 0.0 };
    };
    let cloudCover = switch (weather.cloudCover) {
      case (?c) { c };
      case (null) { 0.0 };
    };
    let condition = decideCondition(temp, windSpeed, precipitation, cloudCover);
    condition;
  };

  func decideCondition(temp : Float, windSpeed : Float, precipitation : Float, cloudCover : Float) : Text {
    if (temp > 27.0 and precipitation < 2.0) {
      "Clear";
    } else if (precipitation > 20.0) {
      "Rain";
    } else if (precipitation > 2.0) {
      "Showers";
    } else if (windSpeed > 16.0 and precipitation > 19.0 and temp < 0) {
      "Freezing Rain";
    } else if (windSpeed > 16.0 and temp < 10) {
      "Windy";
    } else if (precipitation > 7.0 and temp < 4) {
      "Drizzle";
    } else if (cloudCover > 65.0) {
      "Cloudy";
    } else if (cloudCover > 45.0) {
      "Partly Cloudy";
    } else if (temp < 0.0) {
      "Snow";
    } else if (temp < 6.0) {
      "Cold";
    } else {
      "Mild";
    };
  };

  public query ({ caller }) func getWeatherData(city : Text, country : Text) : async {
    city : Text;
    country : Text;
    daily : {
      temperature : ?Float;
      condition : Text;
      precipitation : {
        amount : Float;
        probability : Float;
      };
      windSpeed : Float;
      windDir : Float;
    };
    weekly : [{
      timestamp : Int;
      temperature : ?Float;
      condition : Text;
      precipitation : {
        amount : Float;
        probability : Float;
      };
      windSpeed : Float;
      windDir : Float;
    }];
  } {
    let daily = {
      temperature = ?10.0;
      condition = "Sunny";
      precipitation = { amount = 0.0; probability = 42.0 };
      windSpeed = 5.0;
      windDir = 2.2;
    };
    let weekly : [{
      timestamp : Int;
      temperature : ?Float;
      condition : Text;
      precipitation : {
        amount : Float;
        probability : Float;
      };
      windSpeed : Float;
      windDir : Float;
    }] = [
      {
        timestamp = 42;
        temperature = ?12.0;
        condition = "partly cloudy";
        precipitation = { amount = 0.61; probability = 33.33 };
        windSpeed = 4.0;
        windDir = 2.5;
      }
    ];
    {
      city;
      country;
      daily;
      weekly;
    };
  };

  public query ({ caller }) func getHealthCheck() : async {
    status : Text;
    version : Text;
    timestamp : Int;
  } {
    {
      status = "ok";
      version = "1.0.0";
      timestamp = Time.now();
    };
  };

  // RainViewer Backend Cache Implementation
  // ========================
  type CacheEntry = {
    data : Text;
    timestamp : Time.Time;
  };

  var rainViewerCache : ?CacheEntry = null;
  let cacheTTL : Time.Time = 10 * 1_000_000_000; // 10 minutes in nanoseconds

  // equivalent of a "transform" function for HTTP outcalls, needed for the actual GET
  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func getRainViewerCache() : async Text {
    switch (rainViewerCache) {
      case (?entry) {
        let now = Time.now();
        if (now - entry.timestamp < cacheTTL) {
          return entry.data; // Cache is still valid, return cached data
        } else {
          return entry.data;
        };
      };
      case (null) {
        // No cache available, fetch data from RainViewer
        let data = await fetchRainViewerData();
        return data;
      };
    };
  };

  func refreshCache() : async () {
    ignore await fetchRainViewerData();
  };

  func fetchRainViewerData() : async Text {
    switch (rainViewerCache) {
      case (?entry) {
        // Avoid concurrent refresh if another request just refreshed the cache
        let now = Time.now();
        if (now - entry.timestamp < cacheTTL) {
          return entry.data;
        };
      };
      case (null) {};
    };

    let url = "https://api.rainviewer.com/public/weather-maps.json";

    try {
      let data = await OutCall.httpGetRequest(url, [], transform);
      rainViewerCache := ?{ data; timestamp = Time.now() };
      data;
    } catch (e) {
      // On error, return last cached value if available
      switch (rainViewerCache) {
        case (?entry) { entry.data };
        case (null) { "" };
      };
    };
  };

  // Provide the RainViewer data via this endpoint for the frontend
  public shared ({ caller }) func getBackendCachedRainViewer() : async Text {
    await getRainViewerCache();
  };
};
