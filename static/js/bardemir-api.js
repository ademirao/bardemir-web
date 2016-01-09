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
        return response.result;
      });
  });
}

function __initBardemirApiClientPromise() {
  window.__bardemirApiClientPromise = new Promise(function (fullfill, reject) {
    window.__bardemirApiClientFullfillCallback = function() {
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
