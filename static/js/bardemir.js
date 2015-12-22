APP_PROPERTIES = {
  facebookToken: null,
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

function MenuItem(name, onClick) {
  this.name = name;
  this.onClick = onClick;
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

function caronas() {
  mainFrame = $("#main_frame");
  mainFrame.empty();
  need = $("<button>Quero</button>");
  offer = $("<button>Ofereço</button>");
  share = $("<button>Compartilhar Taxi</button>");
  mainFrame.append(need);
  mainFrame.append(offer);
  mainFrame.append(share);
}

function decorateMenu(menuItem) {
}

MENU_ITEMS = [
  new MenuItem('Eventos', null),
  new MenuItem('Playlists', null),
  new MenuItem('Caronas', caronas),
  new MenuItem('G. Estudos', listPosts),
]

function setMenuSelection(i) {
  $("#menu_items li").removeClass("selected");
  $("#menu_items").children().eq(i).addClass("selected");
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
  
  menuItems = $("#menu_items");
  for (i in MENU_ITEMS) {
    menuItem = MENU_ITEMS[i];
    menuItemLi = $('<li>' + menuItem.name + '</li>');
    (function(item, li) {
        menuItemLi.click(function () {
            setMenuSelection(li);
            item.onClick();
            })})(menuItem, i);
    menuItems.append(menuItemLi);
  }
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


