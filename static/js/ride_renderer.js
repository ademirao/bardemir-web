var DEFAULT_MARKER_OPTION  = function() {
  return;
};

function optionForRide(styleIdx) {
  return {
    markerOptions: {
      visible: false,
      clickable: true,
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

function optionForOwnedRide(styleIdx) {
  return {
    markerOptions: {
      visible: true,
      clickable: true,
      draggable: false,
      icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|4DA6FF|",
    },
  };
};

function RideRenderer(styleIdx) {
  this.styleIdx = styleIdx;
  this.startMarker = null;
  this.polyline = null;
  this.ride = null;
  this.onClick = null;
  this.onMouseOver = null;
  var self = this;
  this.redrawForRide = function(ride) {
    var markerOptions = {
      clickable: true,
      draggable: false,
      opacity: 0.7,
      zIndex: DEFAULT_ZINDEX
    };
    markerOptions.position = ride.directions.routes[0].legs[0].start_location;
    markerOptions.title = ride.owner.name;
    markerOptions.icon = { url: ride.owner.photoUrl };
    if (self.startMarker == null) {
      self.startMarker = new google.maps.Marker(markerOptions);
    }
    self.startMarker.setOptions(markerOptions);
    var polylineOptions = {
      path: ride.directions.routes[0].overview_path,
      clickable: true,
      draggable: false,
      strokeOpacity: 0.7,
      strokeColor: color(styleIdx),
      strokeWeight: 4,
    }
    self.polyline = new google.maps.Polyline(polylineOptions);
  };
}

RideRenderer.prototype.setHighlight= function(isHighlighted) {
  if (isHighlighted) {
    this.polyline.setOptions({
      strokeOpacity: 1,
    })
    this.startMarker.setOptions({ opacity: 1 })
  } else {
    this.polyline.setOptions({
      strokeOpacity: 0.7,
    })
    this.startMarker.setOptions({ opacity: 0.7 })
  }
}

RideRenderer.prototype.clearListeners = function(evt) {
  var elems = [this.polyline, this.startMarker];
  for (i in elems) {
    var e = elems[i];
    if (e != null) {
      google.maps.event.clearInstanceListeners(e);
    } 
  }
}
RideRenderer.prototype.addListener = function(evt, f) {
  var elems = [this.polyline, this.startMarker];
  for (i in elems) {
    var e = elems[i];
    if (e != null) {
      e.addListener(evt, f);
    } 
  }
}

RideRenderer.prototype.setRide = function(ride) {
  this.redrawForRide(ride);
  this.ride = ride
}

RideRenderer.prototype.show = function() {
  var elems = [this.polyline, this.startMarker];
  for (i in elems) {
    var e = elems[i];
    if (e != null) {
      e.setMap(map);
    } 
  }
}
RideRenderer.prototype.hide = function() {
  var elems = [this.polyline, this.startMarker];
  for (i in elems) {
    var e = elems[i];
    if (e != null) {
      e.setMap(null);
    } 
  }
}
RideRenderer.prototype.getOrigin = function() {
  if (this.ride.directions.routes[0]) {
    return this.ride.directions.routes[0].legs[0].start_location;
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
