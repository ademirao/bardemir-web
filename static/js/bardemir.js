var APP_PROPERTIES = {
  facebookToken: null,
  googleBrowserKey: "AIzaSyDNTbyli1Crny1z2fH8B3fhEev0v6jjfQU",
}

var BARDEMIR_LAT_LONG = {lat: -19.8887119, lng:-43.9949358}

var BARDEMIR_LOCATION = {
  zoom: 16,
  center: BARDEMIR_LAT_LONG
}

var directionsService;
var geocoder;
var currentRoute;
var currentMark;
var map;
var rideRenderersPool = new RideRenderersPool();
var hitchhikingRenderersPool = new HitchhikingRenderersPool();

function backend() {
  return APP_PROPERTIES.backend();
}

var DEFAULT_ZINDEX = 99997;
var ROUTE_ZINDEX = 99998;
var TOP_ZINDEX = 99999;
function initMap() {
  geocoder = new google.maps.Geocoder();
  directionsService = new google.maps.DirectionsService();
  currentRoute = new google.maps.DirectionsRenderer({
    draggable: true,
  });
  currentMarker = new google.maps.Marker({
    draggable: true,
    clickable: true,
    zIndex: TOP_ZINDEX,
  });

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

  Promise.all([listRides(), listHitchhikes()]).then(function(values) {
    new google.maps.Marker({
      position: BARDEMIR_LAT_LONG,
      map: map,
      title: 'Bardemir!',
      zIndex: TOP_ZINDEX,
    });
    $('#div-map').show();
    $('#menu-map-left').show();
    $('#menu-map-right').show();
    google.maps.event.trigger(map, 'resize');
    map.setZoom(map.getZoom());
    centerMap();
  });
}

function calcRoute() {
  clearCurrentMarker();
  var request = {
    origin: $('#input-search').val(),
    destination: BARDEMIR_LAT_LONG,
    travelMode: google.maps.TravelMode.DRIVING
  };
  backend().getProfile().then(function(profile) {
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        currentRoute.setMap(map);
        currentRoute.setDirections(response);
      } else {
        alert(status);
      }
    });
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

function upsertRide() {
  return backend().getProfile().then(function(owner) {
      return backend().upsertRide(
          new Ride(null, owner, currentRoute.getDirections())).then(listRides)
  }, function(reason) {
    alert("SHIT!!" + reason);
    return reason;
  });
}

function upsertHitchhike() {
  return backend().getProfile().then(function(owner) {
    return backend().upsertHitchhike(
        new Hitchhike(null, owner, currentMarker.getPosition())).then(listHitchhikes);
  }, function(reason) {
    alert("SHIT!!" + reason);
    return reason;
  });
}

function listRides() {
  return backend().listRides().then(function(rides) {
    var all = [];
    for (i in rides) {
      all.push(rideRenderersPool.getRenderer(i)
          .setRide(rides[i])
          .then(function(renderer) {
            renderer.show();
            return renderer;
          }));

    }
    return Promise.all(all);
  });
}

function listHitchhikes() {
  return backend().listHitchhikes().then(function(hitches) {
    var all = [];
    for (i in hitches) {
      all.push(hitchhikingRenderersPool.getRenderer(i)
          .setHitchhike(hitches[i])
          .then(function(renderer) {
            renderer.show();
            return renderer;
          }));
    }
    return Promise.all(all);
  });
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
  var renderers = rideRenderersPool.getRenderers();
  for (i in renderers) {
    renderers[i].hide();
  }
}

function centerMap() {
  var bardemirLatLng = new google.maps.LatLng(
      BARDEMIR_LAT_LONG.lat, BARDEMIR_LAT_LONG.lng);
  var bounds = new google.maps.LatLngBounds();
  bounds.extend(bardemirLatLng);
  var markers = hitchhikingRenderersPool.getRenderers();
  for (i in markers) {
    var marker = markers[i];
    var pos = marker.getPosition();
    if (pos != null) {
      bounds.extend(pos);
    }
  }

  var renderers = rideRenderersPool.getRenderers();
  for (i in renderers) {
    var renderer = renderers[i];
    var origin = renderer.getOrigin();
    if (origin != null) {
      bounds.extend(origin);
    }
  }

  map.fitBounds(bounds);
  if (map.getZoom() > 16) {
    map.setZoom(16);
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

$(document).on("pagebeforecreate", "#page-events", function(event) {
  backend().listPosts().then(function(posts) {
    $("#events_dest").empty();
    for (i in posts) {
      post_div = $("<div class=post>"+ posts[i] + "</div>");
      $("#events_dest").append(post_div);
    }
  }, function (reason) {
    alert("Oh shit!!! " + reason);
  });
});

$(document).on("pagebeforeshow", "#page-rides", function(event) {
  var search_closure = function() {
    search();
    $("#collapsible-search").collapsible("collapse");
  };
  $("#input-search").on("change", search_closure);
  $("#button-search").click(search_closure);
  $("#select-search").on("change", search);
  $("#button-ask").click(upsertHitchhike);
  $("#button-offer").click(upsertRide);
  $("#button-bardemir").click(centerMap);
  $("#button-accessibility").click(function() {
    COLOR_PALLETE.nextPalete();
    listRides();
    listHitchhikes();
  });
});

$(document).on("pagebeforeshow", "#page-logout", function(event) {
  $("#button-permission").click(function() {
    window.location.replace('https://www.facebook.com/dialog/oauth?client_id=433202543531394&redirect_uri='
        + BARDEMIR_HOST +
        '/facebook/login&scope=user_managed_groups,user_events');
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
    APP_PROPERTIES.backend = function() {
      if (!APP_PROPERTIES.__backend) {
        APP_PROPERTIES.__backend = new BardemirApi(APP_PROPERTIES.facebookToken);
      }
      return APP_PROPERTIES.__backend;
    }
    if (APP_PROPERTIES.facebookToken == null) {
      window.location.replace("#page-logout");
      event.preventDefault();
      return;
    }
  }
  $("body").show();
});

$(document).ready(function() {
});

