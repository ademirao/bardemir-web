function Ride(id, owner, directions) {
  this.id = id || 0;
  this.owner = owner;
  this.directions = directions;
}

Ride.fromJSON = function(json) {
  var id = null;
  if (json.hasOwnProperty('id')) {
    id = json.id;
  }

  var owner = null;
  if (json.hasOwnProperty('owner')) {
    owner = json.owner;
  }

  var directions = null;
  if (json.hasOwnProperty('directions')) {
    directions = deserialize(json.directions);
  }

  return new Ride(id, owner, directions);
}

Ride.prototype.toJSON = function(json) {
  return {
    'id': this.id || "0",
    'directions': serialize(this.directions),
    'owner': this.owner,
  }
}

function Hitchhike(id, owner, position) {
  this.id = id; 
  this.owner = owner;
  this.position = position;
}

Hitchhike.fromJSON = function(json) {
  var id = null;
  if (json.hasOwnProperty('id')) {
    id = json.id;
  }

  var owner = null;
  if (json.hasOwnProperty('owner')) {
    owner = json.owner;
  }
  var position = null;
  if (json.hasOwnProperty('position')) {
    position = deserialize(json.position);
  }

  return new Hitchhike(id, owner, position);
}

Hitchhike.prototype.toJSON = function() {
  return {
    'id': this.id || "0",
    'position': serialize(this.position),
    'owner': this.owner,
  }
}

