
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ObjectDoesNotExist
from django.utils.translation import ugettext as _
from django.shortcuts import render
from django.conf import settings
import oauth2 as oauth
import urlparse

consumer_key = settings.twitter_consumer_key
consumer_secret = settinfs.twitter_consumer_key


request_token_url = 'http://twitter.com/oauth/request_token'
access_token_url = 'http://twitter.com/oauth/access_token'
authorize_url = 'http://twitter.com/oauth/authorize'

consumer = oauth.Consumer(consumer_key, consumer_secret)
client = oauth.Client(consumer)

def twitter_authorize():
    resp, content = client.request(request_token_url, "GET")
    if resp['status'] != '200':
        raise Exception("Invalid response %s." % resp['status'])
    
    request_token = dict(urlparse.parse_qsl(content))
    raise redirect( "%s?oauth_token=%s" % (authorize_url, request_token['oauth_token']) )

