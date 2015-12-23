APP_PROPERTIES = {
  facebookToken: null,
  googleBrowserKey: "AIzaSyDNTbyli1Crny1z2fH8B3fhEev0v6jjfQU",
}

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

function listPosts() {
  gapi.client.bardemir.posts.list({"auth": APP_PROPERTIES.facebookToken}).execute(function(response) {
      $("#main_frame").empty();
      for (i in response.items) {
        post_div = $("<div class=post>"+ response.items[i].title  + "</div>");
        $("#main_frame").append(post_div);
      }
  });
}

BARDEMIR_LAT_LONG = {lat: -19.8887119, lng:-43.9949358}

BARDEMIR_LOCATION = {
  zoom: 16,
  center: BARDEMIR_LAT_LONG
}

function initMap() {
  var map = new google.maps.Map(document.getElementById('caronasMap'), BARDEMIR_LOCATION)
  var marker = new google.maps.Marker({
    position: BARDEMIR_LAT_LONG,
    map: map,
    title: 'Bardemir!',
  });
}

function caronas() {
  mainFrame = $("#main_frame");
  mainFrame.empty();
  need = $("<button>Quero</button>");
  offer = $("<button>Ofereço</button>");
  share = $("<button>Compartilhar Taxi</button>");
  share = $("<button>Bardemir</button>");
  mapDiv = $("<div id=caronasMap></div>")
  map = $('<script src="https://maps.googleapis.com/maps/api/js' +
      '?key=' + APP_PROPERTIES.googleBrowserKey + '&signed_in=false&callback=initMap" async defer></script>');
  mainFrame.append(need);
  mainFrame.append(offer);
  mainFrame.append(share);
  mainFrame.append(mapDiv);
  mainFrame.append(map);
}

function MenuItem(id, name, onClick) {
  var self = this;
  self.id = id;
  self.name = name;
  self.onClick = onClick;
  self.li = $('<li class=unselected>' + name + '</li>');
  self.li.click(function() { navigateToItem(self); });
}

function navigateToItem(menuItem) {
  $("#menu_items li").switchClass("selected", "unselected", 200, "easeInExpo");
  menuItem.li.switchClass("unselected", "selected", 0);
  menuItem.onClick();
}

function empty() {
 $("#main_frame").empty();
}

function main() {
  menuItemsArray = [
    new MenuItem('events', 'Eventos', empty),
    new MenuItem('playlists', 'Playlists', empty),
    new MenuItem('rides', 'Caronas', caronas),
    new MenuItem('studygroup', 'Estudos', listPosts),
  ]

  menuItems = $("#menu_items");
  for (i in menuItemsArray) {
    menuItem = menuItemsArray[i];
    menuItems.append(menuItem.li);
  }
}

var bardemirMain = function () {
  $("#spinner").show();
  APP_PROPERTIES.facebookToken = getCookie("facebook_access_token");
  if (APP_PROPERTIES.facebookToken == null) {
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
  main();
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


