var BARDEMIR_CLIENT = null;

function BardemirApi(authToken) {
  this.authToken = authToken;
  this.client = function () {
    return new Promise();
  }
  if (!window.__bardemirApiClientInitialized) {
    __initBardemirApiClient();
  }
}

function listPosts() {
  gapi.client.bardemir.posts.list({"auth": APP_PROPERTIES.facebookToken}).execute(function(response) {
      $("#main_frame").empty();
      for (i in response.items) {
        post_div = $("<div class=post>"+ response.items[i].title  + "</div>");
        $("#main_frame").append(post_div);
      }
  });
}

function __initBardemirApiClient() {
  window.__bardemirApiClientInitialized = true
  var script_node = document.createElement("script");
  script_node.src= "https://apis.google.com/js/client.js?onload=__onBardemirApiClientReady";
  document.head.appendChild(script_node); 
}

function __onBardemirApiClientReady() {
  var bardemir = BARDEMIR_BACKEND + "/_ah/api";
  gapi.client.load('bardemir', 'v1', function() { alert("api ready!!!"); }, bardemir);
}
