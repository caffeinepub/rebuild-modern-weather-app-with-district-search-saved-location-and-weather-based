import Text "mo:core/Text";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Timer "mo:core/Timer";

module {
  type WeatherResponse = {
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
    weekly : [WeeklyForecast];
  };

  type WeeklyForecast = {
    timestamp : Int;
    temperature : ?Float;
    condition : Text;
    precipitation : {
      amount : Float;
      probability : Float;
    };
    windSpeed : Float;
    windDir : Float;
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

  type Weather = {
    dbWeather : DBWeather;
    hourlyWeather : [DBWeather];
    windSpeed : Float;
    windDirection : Float;
    weeklyForecast : [WeeklyForecast];
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

  type RainViewerFrames = {
    path : Text;
    timestamp : Nat64;
  };

  type RainViewerData = {
    past : [RainViewerFrames];
    nowcast : [RainViewerFrames];
  };

  type RainViewerMetadata = {
    host : Text;
    pastFrames : [RainViewerFrames];
    nowcastFrames : [RainViewerFrames];
    combinedFrames : [RainViewerFrames];
    timestamp : Time.Time;
  };

  type OldActor = {
    oracleCache : Map.Map<Text, WeatherResponse>;
    lastCacheClear : Time.Time;
    dailyCheckInterval : Nat;
    recurringTimer : Timer.TimerId;
  };

  type NewActor = {
    oracleCache : Map.Map<Text, WeatherResponse>;
    lastCacheClear : Time.Time;
    recurringTimer : Timer.TimerId;
    rainViewerMetadataCache : Map.Map<Text, RainViewerMetadata>;
  };

  public func run(old : OldActor) : NewActor {
    {
      oracleCache = old.oracleCache;
      lastCacheClear = old.lastCacheClear;
      recurringTimer = old.recurringTimer;
      rainViewerMetadataCache = Map.empty<Text, RainViewerMetadata>();
    };
  };
};
