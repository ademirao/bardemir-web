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

var directionsService;
var geocoder;
var currentRoute;
var currentMark;
var map;

function initMap() {
  mapDiv = document.getElementById('div-map');
  map = new google.maps.Map(mapDiv, {
    zoom: 16,
    center: BARDEMIR_LAT_LONG,
    mapTypeControl: true,
    mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.LEFT_BOTTOM
    },
    zoomControl: true,
    zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
    },
    scaleControl: true,
    streetViewControl: true,
    streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
    } }
    );
  geocoder = new google.maps.Geocoder();
  directionsService = new google.maps.DirectionsService();
  currentRoute = new google.maps.DirectionsRenderer({draggable: true});
  currentMarker = new google.maps.Marker();
  var marker = new google.maps.Marker({
    position: BARDEMIR_LAT_LONG,
    map: map,
    title: 'Bardemir!',
  });
}

function calcRoute() {
  clearCurrentMarker();
  var request = {
    origin: $('#input-search').val(),
    destination: BARDEMIR_LAT_LONG,
    travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      currentRoute.setMap(map);
      currentRoute.setDirections(response);
    } else {
      alert(status);
    }
 });
}

function findLocation() {
  clearCurrentRoute();
  geocoder.geocode({
    address: $("#input-search").val()
  }, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      currentMarker.setMap(map);
      currentMarker.setPosition(results[0].geometry.location);
    } else {
      window.alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

var markers = [];
var offers = []; 
var colors = ["#000000", "#0000FF", "#00FF00", "#FF0000"];

function color(i) {
  return colors[i%colors.length];
}

function label(i) {
  return String.fromCharCode(65 + (i % 26)); 
}

function addOffer() {
  if (offers.indexOf(currentRoute) > 0) {
    return;
  }
  currentRoute.setOptions({
      draggable: false,
      markerOptions: { clickable: true, draggable: false, icon: null, label: label(offers.length) },
      polylineOptions: { clickable: true, draggable: false, strokeColor: color(offers.length)}
    });
  currentRoute.setMap(map);
  offers.push(currentRoute);
  currentRoute = new google.maps.DirectionsRenderer({draggable: true});
}

function showOffers() {
  clearOffers();
  for (i in offers) {
    offers[i].setMap(map);
  }
}

function clearCurrentRoute() {
  currentRoute.setMap(null);
}

function clearCurrentMarker() {
  currentMarker.setMap(null);
}

function clearAllRoutes() {
  clearCurrentRoute();
  clearOffers();
}

function clearOffers() {
  for (i in offers) {
    offers[i].setMap(null);
  }
}

$(document).on("pagebeforecreate", function(event) {
  var target = $(event.target);
  target.find("[data-id=header-common]").each(function(idx, v) {
    $(v).attr("data-role", "header");
    $(v).attr("data-position", "fixed");
    if ($(v).attr("custom-header") !== undefined) {
      return;
    }
    $(v).append($("#header-common").children().clone());
  });
  target.find("[data-id=footer-common]").each(function(idx, v) {
    $(v).attr("data-role", "footer");
    $(v).attr("data-position", "fixed");
    $(v).append($("#footer-common").children().clone());
  });
  target.find("[page-href]").each(function(t) {
      return function(idx, v) {
        $(v).attr("data-transition", "none");
        page = $(v).attr("page-href");
        if (page == "page-logout") {
          $(v).click(function() {
            logout();
            location.reload();
          });
          $(v).attr("href", "#");
          return;
        }

        $(v).attr("href", "#" + page);
        if (page == t.attr("id")) {
          $(v).addClass("ui-btn-active");
          $(v).addClass("ui-state-persist");
        }
      }
  }(target));
});


$(document).on("pagebeforecreate", "#page-rides", function(event) {
  $("#main-rides").append($('<script src="https://maps.googleapis.com/' +
        'maps/api/js?key=AIzaSyDNTbyli1Crny1z2fH8B3fhEev0v6jjfQU&' +
        'signed_in=false&callback=initMap"async defer></script>'));
})

function logout() {
  $.removeCookie('facebook_access_token');
}

function search() {
  if ($("#input-search").val()) { 
    var option = $("#select-search").val();
    switch(option) {
      case "route":
        calcRoute();
        $("#button-offer").show(600, "swing");
        $("#button-share").show(600, "swing");
        $("#button-ask").hide(600, "swing");
        break;
      case "place":
        findLocation();
        $("#button-offer").hide(600, "swing");
        $("#button-share").hide(600, "swing");
        $("#button-ask").show(600, "swing");
        break;
    }
    return;
  }
  clearCurrentRoute();
  clearCurrentMarker();
  $("#button-offer").hide(600, "swing");
  $("#button-share").hide(600, "swing");
  $("#button-ask").hide(600, "swing");
}

$(document).on("pagebeforeshow", "#page-rides", function(event) {
  var search_closure = function() {
    search();
    $("#collapsible-search").collapsible("collapse");
  }
  $("#input-search").on("change", search_closure);
  $("#button-search").click(search_closure);
  $("#select-search").on("change", search);
  $("#show_rides").click(function () {
    if ($(this).val() == "all") showOffers();
    else if ($(this).val() == "none") clearAllRoutes();
  });
  $("#button-offer").click(addOffer);
  $("#button-bardemir").click(function() { map.setCenter(BARDEMIR_LAT_LONG); });
  showOffers();
});

$(document).on("pagebeforeshow", "#page-logout", function(event) {
  $("#button-permission").click(function() {
    window.location.replace('https://www.facebook.com/dialog/oauth?client_id=433202543531394&redirect_uri=' + BARDEMIR_HOST +  '/facebook/login&scope=user_managed_groups,user_events');
  });
});

$(document).on("pagecontainerbeforechange", function(event, data) {
  var to = data.toPage;
  if (typeof(to) == "string") {
    var idx = to.indexOf('#');
    if (idx <= 0) {
      to = $('[data-role=page]')[0];
    } else {
      to = $(to.substr(idx));
    }
  } else {
    to = $(to);
  }
  if (to.attr("id") != "page-logout") {
    APP_PROPERTIES.facebookToken = getCookie("facebook_access_token");
    if (APP_PROPERTIES.facebookToken == null) {
      window.location.replace("#page-logout");
      event.preventDefault();
      return;
    }
  }
  $("body").show();
});

function loadBardemirApi() {
  var bardemir = BARDEMIR_BACKEND + "/_ah/api";
  gapi.client.load('bardemir', 'v1', function() { bardemirMain(); }, bardemir);
}

var bardemirMain = function () {
}

script_node = document.createElement("script");
script_node.src= "https://apis.google.com/js/client.js?onload=loadBardemirApi";
document.head.appendChild(script_node); 

$(document).ready(function() {
});


