function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return null 
}


function loadBardemirApi() {
  var bardemir = BARDEMIR_BACKEND + "/_ah/api";
  gapi.client.load('bardemir', 'v1', function() { bardemirMain(); }, bardemir);
}

var bardemirMain = function () {
  $("#spinner").show();
  facebook_token = getCookie("facebook_access_token");
  if (facebook_token == null) {
    var login_frame = $('<a id="login_frame" href="https://www.facebook.com/dialog/oauth?client_id=433202543531394&redirect_uri=' + BARDEMIR_HOST +  '/facebook/login&scope=user_managed_groups,user_events">Allow Bardemir to see my facebook information</a>');
    login_frame.display = "none";
    login_frame.appendTo("#main_frame");
    login_frame.fadeIn("slow");
    $("#spinner").hide();
    return;
  }
  $("#login_frame").fadeOut("fast", function() {
    $("#login_frame").remove();
  });
  $("#spinner").hide();
  button = $("<button>List</button>");
  button.click(function () {
      gapi.client.bardemir.posts.list({"auth": facebook_token }).execute(function(response) {
            for (i in response.items) {
              post_div = $("<div class=post><pre>"+ response.items[i].title  + "</pre></div>");
              $("#main_frame").append(post_div);
            }
          });
  });
  $("#main_frame").append(button);
}

$(document).ready(function() {
    $("#logout").click(function() {
      $("#spinner").show();
      $.removeCookie('facebook_access_token');
      window.location.reload(true);
    });
    $("#spinner").show();
    script_node = document.createElement("script");
    script_node.src= "https://apis.google.com/js/client.js?onload=loadBardemirApi";
    document.head.appendChild(script_node);
});

