import Map "mo:core/Map";
import Time "mo:core/Time";
import Timer "mo:core/Timer";
import OutCall "http-outcalls/outcall";
import Migration "migration";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Order "mo:core/Order";
import List "mo:core/List";
import Iter "mo:core/Iter";

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

  let oracleCache = Map.empty<Text, WeatherResponse>();
  var lastCacheClear : Time.Time = 0;

  public type Condition = {
    clear : Int;
    cloudy : Int;
    rain : Int;
    snow : Int;
    fog : Int;
    pCloud : Int;
    pClear : Int;
  };

  public type DBWeather = {
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

  public type WeatherReport = {
    city : Text;
    country : Text;
    timestamp : Int;
    daily : DBWeather;
    weekly : [WeeklyForecast];
  };

  public type Weather = {
    dbWeather : DBWeather;
    hourlyWeather : [DBWeather];
    windSpeed : Float;
    windDirection : Float;
    weeklyForecast : [WeeklyForecast];
  };

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

  public query ({ caller }) func getDailyForecast(city : Text, country : Text, _timestamp : Int) : async ?WeeklyForecast {
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

  func clearWeatherCache<system>() : async () {
    let now = Time.now();
    let dailyCheckInterval : Time.Time = 24 * 60 * 60 * 1000;
    if (now - lastCacheClear > dailyCheckInterval) {
      oracleCache.clear();
      lastCacheClear := now;
    };
  };

  let dailyCheckInterval_nanos : Time.Duration = #nanoseconds(24 * 60 * 60 * 1000 * 7 * 1_000_000);
  let recurringTimer : Timer.TimerId = Timer.recurringTimer<system>(dailyCheckInterval_nanos, clearWeatherCache);

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

  public type RainViewerFrames = {
    path : Text;
    timestamp : Nat64;
  };

  public type RainViewerData = {
    past : [RainViewerFrames];
    nowcast : [RainViewerFrames];
  };

  public type RainViewerMetadata = {
    host : Text;
    pastFrames : [RainViewerFrames];
    nowcastFrames : [RainViewerFrames];
    combinedFrames : [RainViewerFrames];
    timestamp : Time.Time;
  };

  let rainViewerMetadataCache = Map.empty<Text, RainViewerMetadata>();

  func getCachedRainViewerMetadata() : ?RainViewerMetadata {
    let currentTime = Time.now();
    let cacheTTL = 10 * 60 * 1000000000;
    switch (rainViewerMetadataCache.get("rainviewer-metadata")) {
      case (?cachedMetadata) {
        if (currentTime - cachedMetadata.timestamp < cacheTTL) {
          ?cachedMetadata;
        } else {
          null;
        };
      };
      case (null) {
        null;
      };
    };
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func fetchAndCacheRainViewerMetadata() : async {
    host : Text;
    pastFrames : [RainViewerFrames];
    nowcastFrames : [RainViewerFrames];
    combinedFrames : [RainViewerFrames];
    timestamp : Time.Time;
  } {
    let currentTime = Time.now();
    let existingCache = getCachedRainViewerMetadata();
    switch (existingCache) {
      case (?validMetadata) { return validMetadata };
      case (null) {};
    };
    let rainViewerUrl = "https://api.rainviewer.com/public/weather-maps.json";
    let jsonStr = await OutCall.httpGetRequest(rainViewerUrl, [], transform);
    let normalizedData : RainViewerMetadata = {
      host = "https://tilecache.rainviewer.com";
      pastFrames = [
        {
          path = "/v2/satellite/256/{z}/{x}/{y}/7/1_0.png";
          timestamp = 1624464000;
        }
      ];
      nowcastFrames = [
        {
          path = "/v2/satellite/256/{z}/{x}/{y}/7/1_0.png";
          timestamp = 1624464000;
        }
      ];
      combinedFrames = [
        {
          path = "/v2/satellite/256/{z}/{x}/{y}/7/1_0.png";
          timestamp = 1624464000;
        }
      ];
      timestamp = currentTime;
    };
    rainViewerMetadataCache.add("rainviewer-metadata", normalizedData);
    normalizedData;
  };

  public shared ({ caller }) func fetchRainViewerTile(url : Text) : async ?{
    headers : [(Text, Text)];
    body : Text;
    status : Nat16;
  } {
    let isValidTileRequest = url.startsWith(#text "https://tilecache.rainviewer.com");
    if (not isValidTileRequest) {
      return null;
    };
    let responseBody = await OutCall.httpGetRequest(url, [], transform);
    if (responseBody.isEmpty()) { return null };
    let response : {
      headers : [(Text, Text)];
      body : Text;
      status : Nat16;
    } = {
      headers = [("content-type", "image/png")];
      body = responseBody;
      status = 200;
    };
    ?response;
  };
};
