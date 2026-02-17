module {
  type OldActor = {};
  type NewActor = {
    rainViewerCache : ?{
      data : Text;
      timestamp : Int;
    };
  };

  public func run(_ : OldActor) : NewActor {
    { rainViewerCache = null };
  };
};
