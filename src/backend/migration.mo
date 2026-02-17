import Time "mo:core/Time";

module {
  type OldCacheEntry = {
    data : Text;
    timestamp : Time.Time;
  };

  type OldActor = {
    rainViewerCache : ?OldCacheEntry;
  };

  type NewCacheEntry = {
    data : Text;
    timestamp : Time.Time;
    valid : Bool;
  };

  type NewActor = {
    rainViewerCache : NewCacheEntry;
  };

  public func run(old : OldActor) : NewActor {
    let defaultCacheEntry : NewCacheEntry = {
      data = "";
      timestamp = 0;
      valid = false;
    };

    let newCache = switch (old.rainViewerCache) {
      case (?entry) {
        {
          data = entry.data;
          timestamp = entry.timestamp;
          valid = (entry.timestamp > 0); // valid if timestamp is older than 0
        };
      };
      case (null) { defaultCacheEntry };
    };

    { rainViewerCache = newCache };
  };
};
