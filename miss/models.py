from django.contrib.gis.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save

def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

post_save.connect(create_user_profile, sender=User)

# Create your models here.

class UserProfile(models.Model):
    user = models.OneToOneField(User)

    def __unicode__(self):
        return self.user.get_full_name() or self.user.username

class Region(models.Model):
    PRIORITIY_TPYES = (
        ('aaa', 'First Priority'),
        ('bbb', 'Second Priority'),
        ('ccc', 'Third Priority'),
    )

    IMAGERY_TPYES = (
        ('aaa', 'First IMAGERY'),
        ('bbb', 'Second IMAGERY'),
        ('ccc', 'Third IMAGERY'),
    )

    IMAGERY_PROBLEM_TPYES = (
        ('aaa', 'First Problem'),
        ('bbb', 'Second Problem'),
        ('ccc', 'Third Problem'),
    )

    user = models.ForeignKey(User)
    region = models.GeometryField(db_column='the_geom')
    when_to_take = None

    priority = models.CharField(max_length=3, choices=PRIORITY_TYPES)
    imagery_type = models.CharField(max_length=3, choices=IMAGERY_TYPES)
    current_imagery_problem = models.CharField(max_length=3, choices=IMAGERY_PROBLEM_TYPES)
    gained_vote = None
    objects = models.GeoManager()

class Vote(models.Model):
    user = models.ForeignKey(User)
    region = models.ForeignKey(Region)
    weight = models.IntegerField()
    creation_time = models.DateTimeField('date voted', auto_now_add=True))
