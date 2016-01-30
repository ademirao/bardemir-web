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
var currentRide;
var currentHitchhike;
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
  currentRide = new google.maps.DirectionsRenderer({
    draggable: true,
  });
  currentRide.id = 0;
  currentHitchhike = new google.maps.Marker({
    draggable: true,
    clickable: true,
    zIndex: TOP_ZINDEX,
    label: 'A',
  });

  currentHitchhike.id = 0;
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
    }
  });

  Promise.all([listRides(), listHitchhikes(), listEvents()]).then(function(values) {
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
  clearCurrentHitchhike();
  var request = {
    origin: $('#input-search').val(),
    destination: BARDEMIR_LAT_LONG,
    travelMode: google.maps.TravelMode.DRIVING
  };
  return backend().getProfile().then(function(profile) {
    return new Promise(function(fullfill, reject) {
      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          currentRide.setMap(map);
          currentRide.setDirections(response);
          fullfill(response)
        } else {
          reject(status);
        }
      });
    });
  });
}

function findLocation() {
  clearCurrentRide();
  return new Promise(function(fullfill, reject) {
    geocoder.geocode({
      address: $("#input-search").val()
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        currentHitchhike.setMap(map);
        currentHitchhike.setPosition(results[0].geometry.location);
        fullfill(results);
      } else {
        reject('Geocode was not successful for the following reason: ' + status);
      }
    });
  });
}

function shit(reason) {
  alert("SHIT!!!" + reason);
  return reason;
}

function upsertRide() {
  return backend().upsertRide(
      new Ride(currentRide.id, null, currentRide.getDirections())
      ).then(function() {
    currentRide.id = null;
    currentRide.setMap(null);
    showMainButtons();
    return refresh();
  }, shit);
}

function removeRide() {
  return backend().removeRide(currentRide.id).then(function() {
    currentRide.id = null;
    currentRide.setMap(null);
    showMainButtons();
    return refresh();
  }, shit);
}

function removeHitchhike() {
  return backend().removeHitchhike(currentHitchhike.id).then(function() {
    currentHitchhike.id = null;
    currentHitchhike.setMap(null);
    showMainButtons();
    return refresh();
  }, shit);
}

function upsertHitchhike() {
  return backend().upsertHitchhike(
      new Hitchhike(currentHitchhike.id, null, currentHitchhike.getPosition())
      ).then(function () {
    currentHitchhike.id = null;
    currentHitchhike.setMap(null);
    showMainButtons();
    return refresh();
  }, shit);
}

var currentDate = null;

function formatedDate(date) {
  return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
}

function setCurrentDateAndUI(date) {
  setCurrentDate(date);
  $("#input-date").val(formatedDate);
}
function setCurrentDate(date) {
  $("#span-selected-date").text(formatedDate(date));
  currentDate = date;
}

var weekdayName = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sab"
  ];

function listEvents() {
  return backend().getEvents().then(function(events) {
    console.log(events)
      if (events.length == 0) {
        return;
      }

    var col = $("#collapsible-rides");
    var list_items = '';
    $.each(events, function (i, e) {
      date = new Date(Date.parse(e.time));
      dateStr = formatedDate(date);
      weekday = weekdayName[date.getDay()];
      if (i == 0) {
        $("#span-selected-date").text(weekday + ", " + dateStr);
        $("#input-date").val(dateStr);
      }
      list_items += "<li><a href='#'>" + e.name + " (" + weekday + " - " + dateStr + ")</li>";
    });
    var list = $("#listview-events")
    list.empty();
    list.append(list_items);
    list.listview().trigger("create");
    col.collapsible().trigger("create");
    $("#collapsible-set-rides").collapsibleset().trigger("create");
    $("#collapsible-rides").show()
  });
}

function listRides() {
  return Promise.all([
      backend().getProfile(),
      backend().listRides()]).then(function(result) {
    var sessionUser = result[0];
    var rides = result[1];
    var renderers = [];
    for (i in rides) {
      var renderer = rideRenderersPool.getRenderer(i);
      renderer.setRide(rides[i]);
      renderer.clearListeners();
      renderer.addListener("click", function(r, isOwner) {
        return function() {
          r.setHighlight(true);
          clearRides();
          clearAllHitchhikes();
          if (isOwner) {
            currentRide.setDirections(r.ride.directions);
            currentRide.setMap(map);
            currentRide.id = r.ride.id;
            showEditRideButtons();
          } else {
            showCreateHitchhikeButtons();
          }
        };
      }(renderer, sessionUser.id == renderer.ride.owner.id));
      renderer.addListener("mouseover", function (r) {
        return function() {
          r.setHighlight(true);
        };
      }(renderer));
      renderer.addListener("mouseout", function (r) {
        return function() {
          r.setHighlight(false);
        };
      }(renderer));

      renderer.show();
      renderers.push(renderer);
    }
    return renderers
  });
}

function listHitchhikes() {
  return Promise.all([
      backend().getProfile(),
      backend().listHitchhikes()]).then(function(result) {
    var sessionUser = result[0];
    var hitches = result[1];
    var renderers = [];
    for (i in hitches) {
      var renderer = hitchhikingRenderersPool.getRenderer(i);
      renderer.clearListeners();
      renderer.setHitchhike(hitches[i]);
      renderer.show();
      renderers.push(renderer);
      renderer.addListener("click", function(r, isOwner) {
        return function() {
          r.setHighlight(true);
          clearRides();
          clearAllHitchhikes();
          if (isOwner) {
            currentHitchhike.setPosition(r.hitchhike.position);
            currentHitchhike.setMap(map);
            currentHitchhike.id = r.hitchhike.id;
            showEditHitchhikeButtons();
          } else {
            // TODO(ademirao): implement whta to do when clicking...
          }
        };
      }(renderer, sessionUser.id == renderer.hitchhike.owner.id));
      renderer.addListener("mouseover", function (r) {
        return function() {
          r.setHighlight(true);
        };
      }(renderer));
      renderer.addListener("mouseout", function (r) {
        return function() {
          r.setHighlight(false);
        };
      }(renderer));

    }
    return renderers;
  });
}

function clearCurrentRide() {
  currentRide.setMap(null);
}

function clearCurrentHitchhike() {
  currentHitchhike.setMap(null);
}

function clearAllRides() {
  clearCurrentRide();
  clearRides();
}

function clearAllHitchhikes() {
  clearCurrentHitchhike();
  clearHitchhikes();
}

function clearRides() {
  var renderers = rideRenderersPool.getRenderers();
  for (i in renderers) {
    renderers[i].hide();
  }
}

function clearHitchhikes() {
  var hitchhikes = hitchhikingRenderersPool.getRenderers();
  for (i in hitchhikes) {
    hitchhikes[i].hide();
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
  $("#div-datepicker").datepicker().hide();
  $("#button-pick-date").click(function() {
    $("#div-datepicker").datepicker().toggle();
    $("#div-datepicker").datepicker().click(function() {
      $(this).hide();
    });
  });
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


function logout() {
  $.removeCookie('facebook_access_token');
}

function showEditRideButtons() {
  hideAllButtons();
  $("#menu-edit-ride").show(600, "swing")
}

function showCreateRideButtons() {
  hideAllButtons();
  $("#menu-create-ride").show(600, "swing")
}

function showEditHitchhikeButtons() {
  hideAllButtons();
  $("#menu-edit-hitchhike").show(600, "swing")
}

function showCreateHitchhikeButtons() {
  hideAllButtons();
  $("#menu-create-hitchhike").show(600, "swing")
}

function hideAllButtons() {
  $("#menu-map-right").children().hide(600, "swing");
}

function showMainButtons() {
  hideAllButtons();
  $("#menu-default").show(600, "swing")
}

function search() {
  if ($("#input-search").val()) { 
    clearAllRides();
    clearAllHitchhikes();
    var option = $("#select-search").val();
    switch(option) {
      case "route":
        return calcRoute().then(showCreateRideButtons);
      case "place":
        return findLocation().then(showCreateHitchhikeButtons);
    }
    return null;
  }
  clearCurrentRide();
  clearCurrentHitchhike();
  return Promise.resolve(null);
}

$(document).on("pagebeforecreate", "#page-rides", function(event) {
  $("#main-rides").append($('<script src="https://maps.googleapis.com/' +
        'maps/api/js?key=AIzaSyDNTbyli1Crny1z2fH8B3fhEev0v6jjfQU&' +
        'signed_in=false&callback=initMap"async defer></script>'));
})

$(document).on("pagebeforecreate", "#page-events", function(event) {
  backend().getEvents().then(function(events) {
    $("#events_dest").empty();
    for (i in events) {
      post_div = $("<div class=post>"+ events[i].name + "&nbsp;"  + events[i].time+ "</div>");
      $("#events_dest").append(post_div);
    }
  }, function (reason) {
    alert("Oh shit!!! " + reason);
  });
});

function refresh() {
  clearAllHitchhikes();
  clearAllRides();
  return Promise.all([listRides(), listHitchhikes()])
}

$(document).on("pagebeforeshow", "#page-rides", function(event) {
  var onSearch = function() {
    hideAllButtons();
    search();
    $("#collapsible-search").collapsible("collapse");
  };
  $("#input-search").on("change", onSearch);
  $("#button-search").click(onSearch);
  $("#select-search").on("change", search);
  $("#button-ask-hitchhike").click(upsertHitchhike);

  $(".button-dismiss").click(function() {
    hideAllButtons();
    refresh().then(showMainButtons);
  });

  $("#button-delete-ride").click(removeRide);
  $("#button-offer-ride").click(upsertRide);
  $("#button-share-ride").click(upsertRide);
  $("#button-update-ride").click(upsertRide);
  $("#button-update-share").click(upsertRide);
  $("#button-edit-hitchhike").click(upsertHitchhike);
  $("#button-delete-hitchhike").click(removeHitchhike);

  $("#button-bardemir").click(centerMap);
  $("#button-refresh").click(refresh);
  $("#button-accessibility").click(function() {
    COLOR_PALLETE.nextPalete();
    refresh();
  });
});

$(document).on("pagebeforeshow", "#page-logout", function(event) {
  $("#button-permission").click(function() {
    window.location.replace('https://www.facebook.com/dialog/oauth?client_id=433202543531394&redirect_uri='
        + BARDEMIR_HOST +
        '/facebook/login&scope=user_managed_groups,user_events');
  });
});

$(document).on("pagebeforeshow", "#page-admin", function(event) {
  backend().getProfile().then(function(profile) {
    $("#span-user-name").append(profile.name);
    $("#div-admin-content").show();
    $("#button-admin-token").click(function() {
      backend().setAdminToken().then(function(result) {
        $("#page-admin").empty().append("DONE");
        window.location.replace("/");
      });
    });
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

