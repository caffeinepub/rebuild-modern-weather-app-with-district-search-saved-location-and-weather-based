import Map "mo:core/Map";
import Text "mo:core/Text";

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

  type OldActor = {};

  type NewActor = {
    oracleCache : Map.Map<Text, WeatherResponse>;
    lastCacheClear : Int;
  };

  public func run(_ : OldActor) : NewActor {
    {
      oracleCache = Map.empty<Text, WeatherResponse>();
      lastCacheClear = 0;
    };
  };
};
