import twitter
from imagecolony.settings import *


def send_tweet(msg):
  if not twitter_consumer_key or not twitter_consumer_secret or not twitter_access_key or not twitter_access_secret:
    return None

  api = twitter.Api(consumer_key=twitter_consumer_key, consumer_secret=twitter_consumer_secret,
                    access_token_key=twitter_access_key, access_token_secret=twitter_access_secret,
                    input_encoding=encoding)
  try:
    status = api.PostUpdate(message)
  except UnicodeDecodeError:
      return None

  return msg

