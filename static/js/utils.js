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

function deserialize(obj) {
  var unescaped = unescape(obj);
  var json = JSON.parse(unescaped);
  return __decodeLatLng(json);
}

function __decodeLatLng(obj) {
  if (typeof obj !== 'object') {
    return obj;
  }

  if (obj.hasOwnProperty('LatLng') && obj.LatLng == "1") {
    return new google.maps.LatLng(obj.lat, obj.lng);
  }

  for (k in obj) {
    obj[k] = __decodeLatLng(obj[k])
  }

  return obj;
}


function __isLatLng(obj) {
  return obj.hasOwnProperty('lat') && obj.hasOwnProperty('lng') &&
    typeof obj.lat == 'function' && typeof obj.lng == 'function'
}

function __encodeLatLng(obj) {
  if (typeof obj !== 'object') {
    return obj;
  }

  if (__isLatLng(obj)) {
    return { 'LatLng': '1', 'lat': obj.lat(), 'lng': obj.lng() };
  }

  for (k in obj) {
    obj[k] = __encodeLatLng(obj[k])
  }

  return obj;
}

function serialize(obj) {
  obj = __encodeLatLng(obj);
  var cache = [];
  var serialized = JSON.stringify(obj, function(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }

    return value;
  }, 0);
  cache = null;
  var escaped = escape(serialized);
  var unescaped = unescape(escaped);
  return escaped;
  
}
