var DEFAULT_MARKER_OPTION  = function() {
  return {
    clickable: true,
    draggable: false,
    opacity: 0.7,
    zIndex: DEFAULT_ZINDEX
  };
};

function optionForRide(styleIdx) {
  return {
    markerOptions: {
      visible: false,
      clickable: false,
      draggable: false
    },
    polylineOptions: {
      clickable: true,
      draggable: false,
      opacity: 0.7,
      strokeColor: color(styleIdx)
    }
  };
}

function optionForOwnedRide() {
  return {
    draggable: true,
    clickable: true,
    markerOptions: {
      visible: true,
      clickable: true,
      draggable: true,
      icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|4DA6FF|",
      zIndex: ROUTE_ZINDEX,
    },
  };
};


function RideRenderer(styleIdx) {
  this.mapsRenderer = new google.maps.DirectionsRenderer();
  this.marker = null;
  this.styleIdx = styleIdx;

  var self = this;
  this.redrawForRide = function(ride, sessionUser) {
    if (ride.owner.id == sessionUser.id) {
      self.mapsRenderer.setOptions(optionForOwnedRide());
    } else {
      var markerOptions = DEFAULT_MARKER_OPTION();
      markerOptions.position = ride.directions.routes[0].legs[0].start_location;
      markerOptions.title = ride.owner.name;
      markerOptions.icon = { url: ride.owner.photoUrl };
      if (self.marker == null) {
        self.marker = new google.maps.Marker(markerOptions);
      }
      self.marker.setMap(map);
      self.marker.setOptions(markerOptions);
      var rendererOption = optionForRide(self.styleIdx);
      self.mapsRenderer.setOptions(rendererOption);
    }
    self.mapsRenderer.setDirections(ride.directions);
  };
}

RideRenderer.prototype.setRide = function(ride) {
  var self = this;
  var redrawForRide = this.redrawForRide;
  return backend().getProfile().then(function(sessionUser) {
    redrawForRide(ride, sessionUser);
    return self;
  });
}
RideRenderer.prototype.show = function() {
  this.mapsRenderer.setMap(map);
  if (this.marker != null) {
    this.marker.setMap(map);
  }
}
RideRenderer.prototype.hide = function() {
  this.mapsRenderer.setMap(null);
  if (this.marker != null) {
    this.marker.setMap(null);
  }
}
RideRenderer.prototype.getOrigin = function() {
  var directions = this.mapsRenderer.getDirections();
  if (directions) {
    return directions.routes[0].legs[0].start_location;
  }
  return null;
}

function RideRenderersPool() {
  this.renderers = []
}

RideRenderersPool.prototype.getRenderer = function(i) {
  if (this.renderers.length < i || this.renderers[i] === undefined) {
    var renderer = new RideRenderer(i);
    this.renderers[i] = renderer;
  }
  return this.renderers[i];
}

RideRenderersPool.prototype.getRenderers = function () {
  return this.renderers;
}
