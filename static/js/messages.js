function Ride(id, owner, directions, time, numSeats) {
  this.id = id || 0;
  this.owner = owner;
  this.directions = directions;
  this.time = time;
  this.numSeats = numSeats;
}

Ride.fromJSON = function(json) {
  var id = null;
  if (json.hasOwnProperty('id')) {
    id = json.id;
  }

  var numSeats = null;
  if (json.hasOwnProperty('numSeats')) {
    numSeats = json.numSeats;
  }

  var time = null;
  if (json.hasOwnProperty('time')) {
    time = json.time;
  }

  var owner = null;
  if (json.hasOwnProperty('owner')) {
    owner = json.owner;
  }

  var directions = null;
  if (json.hasOwnProperty('directions')) {
    directions = deserialize(json.directions);
  }

  return new Ride(id, owner, directions, time, numSeats);
}

Ride.prototype.toJSON = function(json) {
  return {
    'id': this.id || "0",
    'directions': serialize(this.directions),
    'owner': this.owner,
    'time': this.time,
    'numSeats': this.numSeats,
  }
}

function Hitchhike(id, owner, position, time) {
  this.id = id; 
  this.owner = owner;
  this.position = position;
  this.time = time;
}

Hitchhike.fromJSON = function(json) {
  var id = null;
  if (json.hasOwnProperty('id')) {
    id = json.id;
  }

  var time = null;
  if (json.hasOwnProperty('time')) {
    time = json.time;
  }

  var owner = null;
  if (json.hasOwnProperty('owner')) {
    owner = json.owner;
  }
  var position = null;
  if (json.hasOwnProperty('position')) {
    position = deserialize(json.position);
  }

  return new Hitchhike(id, owner, position, time);
}

Hitchhike.prototype.toJSON = function() {
  return {
    'id': this.id || "0",
    'position': serialize(this.position),
    'owner': this.owner,
    'time': this.time,
  }
}


function Event(name, time) {
  this.name = name;
  this.time = time;
}

Event.fromJSON = function(json) {
  var name = null;
  if (json.hasOwnProperty('name')) {
    name = json.name;
  }

  var time = null;
  if (json.hasOwnProperty('time')) {
    time = json.time;
  }

  return new Event(name, time);
}

Event.prototype.toJSON = function() {
  return {
    'name': this.name,
    'time': this.time,
  }
}

