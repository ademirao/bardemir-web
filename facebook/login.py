import webapp2
import json
from properties.properties import Properties
from google.appengine.api import urlfetch
from google.appengine.ext import ndb
import os

def redirect_url():
  if os.environ['SERVER_SOFTWARE'].startswith('Development'):
    return "http://localhost:9090/facebook/login"
  return "https://bardemir-api.appspot.com/facebook/login"

def home_page():
  return """
<html>
<body>
</br>
</br>
</html>
""" % redirect_url()

class HomePage(webapp2.RequestHandler):
  def get(self):
    self.response.headers['Content-Type'] = 'text/html charset=utf-8'
    self.response.write(home_page())

class LoginPage(webapp2.RequestHandler):
  def get(self):
    code=self.request.get("code")
    self.response.headers['Content-Type'] = 'text/html'

    bardemir_properties = Properties()
    if not bardemir_properties or not bardemir_properties.facebook_secret:
      self.response.write('Missing bardemir properties ')
      return

    url = "%sclient_id=%s&redirect_uri=%s&client_secret=%s&code=%s" % (
                    bardemir_properties.facebook_url,
                    bardemir_properties.client_id,
                    redirect_url(),
                    bardemir_properties.facebook_secret,
                    code)
    result = urlfetch.fetch(url)
    jsonobject = json.loads(result.content)
    self.response.headers['Set-Cookie'] = "facebook_access_token=%s; path=/;" % str(jsonobject['access_token'])
    self.response.write('<meta http-equiv="refresh" content="0; url=http://localhost:9090/" />');

APPLICATION = webapp2.WSGIApplication([
  ('/facebook/login', LoginPage),
  ('/facebook.*', HomePage),
], debug=True)
