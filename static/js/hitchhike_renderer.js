function optionForOwnedHitchhike() {
  return {
    draggable: true,
    clickable: true,
    icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|4DA6FF|",
  };
}

function optionForHitchhike() {
  return {
    draggable: false,
    clickable: false,
  }
}

function HitchhikingRenderer() {
  this.marker = new google.maps.Marker();
  var self = this;
  this.redrawForHitchhike = function(hitchhike, sessionUser) {
    var options = null;
    if (hitchhike.owner.id == sessionUser.id) {
      options = optionForOwnedHitchhike();
    } else {
      options = optionForHitchhike();
      options.icon = {
        url: owner.photoUrl,
      };
      options.title = owner.name;
    }
    self.marker.setOptions(options);
    self.marker.setPosition(hitchhike.position);
  }
}

HitchhikingRenderer.prototype.setHitchhike = function(hitchhike) {
  var self = this;
  var redrawForHitchhike = this.redrawForHitchhike;
  return backend().getProfile().then(function(sessionUser) {
    redrawForHitchhike(hitchhike, sessionUser);
    return self;
  });
}

HitchhikingRenderer.prototype.show = function() {
  this.marker.setMap(map);
}

HitchhikingRenderer.prototype.hide = function() {
  this.marker.setMap(null);
}

HitchhikingRenderer.prototype.getPosition = function() {
  var position = this.marker.getPosition();
  if (position) {
    return position;
  }
  return null;
}

function HitchhikingRenderersPool() {
  this.renderers = []
}

HitchhikingRenderersPool.prototype.getRenderer = function(i) {
  if (this.renderers.length < i || this.renderers[i] === undefined) {
    var marker = new HitchhikingRenderer();
    this.renderers[i] = marker;
  }
  return this.renderers[i];
}

HitchhikingRenderersPool.prototype.getRenderers = function () {
  return this.renderers;
}
