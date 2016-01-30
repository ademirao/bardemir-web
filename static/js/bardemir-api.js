function BardemirApi(authToken) {
  this.authToken = authToken;
  this.client = function () {
    if (!window.__bardemirApiClientPromise) {
      __initBardemirApiClientPromise();
    }

    return window.__bardemirApiClientPromise;
  }
}

function gapiThen(gpromise) {
  return new Promise(function(fullfill, reject) {
    gpromise.then(function(response) {
      fullfill(response);
    }, function(reason) {
      reject(reason);
    })
  });
}

BardemirApi.prototype.listPosts = function () {
  var authToken = this.authToken;
  return this.client().then(function (client) {
    return gapiThen(client.posts.list({"auth": authToken}))
      .then(function(response) {
        var posts = [];
        for (i in response.result.items) {
          var post = response.result.items[i].title;
          posts.push(post);
        }
        return posts;
      });
  });
}

BardemirApi.prototype.getEvents= function () {
  var authToken = this.authToken;
  return this.client().then(function (client) {
    console.log("getting evnets...");
    return gapiThen(client.events.get({
      "auth": authToken,
    })).then(function (response) {
        var events = [];
        for (i in response.result.events) {
          events.push(Event.fromJSON(response.result.events[i]))
        }
        return events;
    });
  });
}

BardemirApi.prototype.setAdminToken = function () {
  var authToken = this.authToken;
  return this.client().then(function (client) {
    console.log("setting token ...");
    return gapiThen(client.admin.setToken({
      "auth": authToken,
    }));
  });
}


BardemirApi.prototype.upsertRide = function (ride) {
  var authToken = this.authToken;
  return this.client().then(function (client) {
    console.log("adding ride...");
    return gapiThen(client.rides.upsert({
      "auth": authToken,
      "ride": ride.toJSON(),
    }));
  });
}

BardemirApi.prototype.removeHitchhike = function (id) {
  var authToken = this.authToken;
  return this.client().then(function (client) {
    console.log("remove ride...");
    return gapiThen(client.hitchhike.remove({
      "auth": authToken,
      "id": id,
    }));
  });
}

BardemirApi.prototype.removeRide = function (id) {
  var authToken = this.authToken;
  return this.client().then(function (client) {
    console.log("remove ride...");
    return gapiThen(client.rides.remove({
      "auth": authToken,
      "id": id,
    }));
  });
}

BardemirApi.prototype.upsertHitchhike = function (hitchhike) {
  var authToken = this.authToken;
  return this.client().then(function (client) {
    console.log("adding hitchhike...");
    return gapiThen(client.hitchhike.upsert({
      "auth": authToken,
      "hitchhike": hitchhike.toJSON(),
    }));
  });
}

BardemirApi.prototype.listHitchhikes= function () {
  var authToken = this.authToken;
  return this.client().then(function (client) {
    return gapiThen(client.hitchhike.list({"auth": authToken}))
      .then(function(response) {
        var results = [];
        if (!("items" in response.result)) {
          return results;
        }
        for (i in response.result.items) {
          var result = response.result.items[i];
          results.push(Hitchhike.fromJSON(result));
        }
        return results;
      });
  });
}

BardemirApi.prototype.listRides = function () {
  var authToken = this.authToken;
  return this.client().then(function (client) {
    return gapiThen(client.rides.list({"auth": authToken}))
      .then(function(response) {
        var results = [];
        if (!("items" in response.result)) {
          return results;
        }
        for (i in response.result.items) {
          var result = response.result.items[i];
          results.push(Ride.fromJSON(result));
        }
        return results;
      });
  });
}

BardemirApi.prototype.getProfile = function() {
  var authToken = this.authToken;
  return this.client().then(function (client) {
    return gapiThen(client.profile.get({"auth": authToken})).then(function(response) {
      return response.result;
    });
  })
}

function __initBardemirApiClientPromise() {
  console.log("Initializing bardemir api client");
  window.__bardemirApiClientPromise = new Promise(function (fullfill, reject) {
    window.__bardemirApiClientFullfillCallback = function() {
      console.log("Bardemir api client initialized");
      fullfill(gapi.client.bardemir);
    }
    var script_node = document.createElement("script");
    script_node.src= "https://apis.google.com/js/client.js?onload=__onBardemirApiClientReady";
    document.head.appendChild(script_node); 
  });
}

function __onBardemirApiClientReady() {
  var bardemir = BARDEMIR_BACKEND + "/_ah/api";
  gapi.client.load('bardemir', 'v1', window.__bardemirApiClientFullfillCallback, bardemir);
}
