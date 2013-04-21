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
    APPLICATION_TYPES = (
        ('aaa', 'First Priority'),
        ('bbb', 'Second Priority'),
        ('ccc', 'Third Priority'),
    )

    IMAGERY_TYPES = (
        ('aaa', 'First IMAGERY'),
        ('bbb', 'Second IMAGERY'),
        ('ccc', 'Third IMAGERY'),
    )

    IMAGERY_PROBLEM_TYPES = (
        ('noi', 'No Imagery'),
        ('cld', 'Cloudy Image'),
        ('low', 'Low Resolution Image'),
        ('old', 'Old Imagery'),
    )

    user = models.ForeignKey(User)
    name = models.CharField(max_length=255)
    region = models.PointField(db_column='the_geom')
    when_to_capture = models.CharField('when to take imagery', max_length=255)

    application_type = models.CharField(max_length=3, choices=APPLICATION_TYPES)
    imagery_type = models.CharField(max_length=3, choices=IMAGERY_TYPES)
    imagery_problem_type = models.CharField(max_length=3, choices=IMAGERY_PROBLEM_TYPES)

    objects = models.GeoManager()

    def __unicode__(self):
        self.region

class Vote(models.Model):
    user = models.ForeignKey(User)
    region = models.ForeignKey(Region)
    weight = models.IntegerField()
    creation_time = models.DateTimeField('date voted', auto_now_add=True)
