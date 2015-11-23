import webapp2
from google.appengine.ext import ndb
import os

class BardemirProperties(ndb.Model):
  facebook_secret = ndb.StringProperty()
  facebook_url = ndb.StringProperty()
  group_id = ndb.StringProperty()
  client_id = ndb.StringProperty()

PROPERTIES_KEY_STR = "properties@bardemir-web.appspot.com"
PROPERTIES_KEY = ndb.Key(BardemirProperties, PROPERTIES_KEY_STR)
CLIENT_ID = "433202543531394"
GROUP_ID = "371519946346115"
FACEBOOK_URL = "https://graph.facebook.com/v2.3/oauth/access_token?"

def Properties():
  properties = PROPERTIES_KEY.get()
  if properties:
    return properties

  resetProperties()
  return PROPERTIES_KEY.get()

def resetProperties():
  bardemir_properties = BardemirProperties(group_id=GROUP_ID,
      facebook_url = FACEBOOK_URL,
      facebook_secret=None, client_id=CLIENT_ID, id=PROPERTIES_KEY_STR)
  bardemir_properties.put()

def home_page():
  return """
<html>
<body>
<form action="/properties/SetProperty" method="POST">
  App Secret: <input type="password" name="secret"><br>
  Group Id: <input type="text" name="group_id"><br>
  <input type="submit" name=change value="define">
  <input type="submit" name=reset value="reset">
</form>
</body>
</html>
"""

def backenduri():
  if os.environ['SERVER_SOFTWARE'].startswith('Development'):
    return "http://localhost:8080"
  return "https://bardemir-api.appspot.com"

def hosturi():
  if os.environ['SERVER_SOFTWARE'].startswith('Development'):
    return "http://localhost:9090"
  return "https://bardemir-web.appspot.com"

def redirect_url():
  return "%s/facebook/login" % hosturi()

def propertiesJs():
  return """
    var BARDEMIR_BACKEND="%s";
    var BARDEMIR_HOST="%s";""" % (
      backenduri(),hosturi());

class PropertiesJS(webapp2.RequestHandler):
  def get(self):
    self.response.headers['Content-Type'] = 'application/x-javascript'
    self.response.write(propertiesJs())

class PropertyHome(webapp2.RequestHandler):
  def get(self):
    self.response.headers['Content-Type'] = 'text/html charset=utf-8'
    self.response.write(home_page())

class SetProperty(webapp2.RequestHandler):
  def post(self):
    if self.request.get("reset"):
      resetProperties();
      self.response.write("Properties reset")
      return

    secret = self.request.get("secret")
    group_id = self.request.get("group_id")
    client_id = self.request.get("client_id")
    bardemir_properties = Properties()

    if secret:
      bardemir_properties.facebook_secret = secret
    if group_id:
      bardemir_properties.group_id = group_id
    if client_id:
      bardemir_properties.client_id = client_id

    bardemir_properties.put()
    self.response.write('Done')

APPLICATION = webapp2.WSGIApplication([
  ('/properties/SetProperty', SetProperty),
  ('/properties/properties.js', PropertiesJS),
  ('/properties.*', PropertyHome),
])
