function HitchhikingRenderer() {
  this.marker = new google.maps.Marker();
  this.hitchhike = null;
  var self = this;
  this.redrawForHitchhike = function(hitchhike) {
    var options = {
      draggable: false,
      clickable: true,
      opacity: 0.7,
      icon: hitchhike.owner.photoUrl,
      title: hitchhike.owner.name,
    };
    self.marker.setOptions(options);
    self.marker.setPosition(hitchhike.position);
  }
}

HitchhikingRenderer.prototype.setHighlight= function(isHighlighted) {
  if (isHighlighted) {
    this.marker.setOptions({ opacity: 1 })
  } else {
    this.marker.setOptions({ opacity: 0.7 })
  }
}

HitchhikingRenderer.prototype.setHitchhike = function(hitchhike) {
  this.redrawForHitchhike(hitchhike);
  this.hitchhike = hitchhike;
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

HitchhikingRenderer.prototype.clearListeners = function(evt) {
  google.maps.event.clearInstanceListeners(this.marker);
}

HitchhikingRenderer.prototype.addListener = function(evt, f) {
  this.marker.addListener(evt, f);
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
