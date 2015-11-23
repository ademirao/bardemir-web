import webapp2
import json
from properties.properties import Properties, hosturi, redirect_url
from google.appengine.api import urlfetch


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
    self.response.write('<meta http-equiv="refresh" content="0; url=%s/" />' % hosturi());

APPLICATION = webapp2.WSGIApplication([
  ('/facebook/login', LoginPage),
], debug=True)
