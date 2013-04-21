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
        ('map', 'Mapping and Location-based Services'),
        ('dis', 'Disaster Response'),
        ('met', 'Meteorology'),
        ('agr', 'Agriculture'),
        ('fst', 'Forestry'),
        ('bio', 'Biodiversity conservation'),
        ('reg', 'Regional planning'),
        ('edu', 'Education'),
        ('iaw', 'Intelligence and warfare'),
        ('etc', 'etc...'),
    )

    IMAGERY_TYPES = (
        ('vis', 'Visible'),
        ('inf', 'Infrared'),
        ('wat', 'Water vapor'),
    )

    IMAGERY_PROBLEM_TYPES = (
        #('low', 'The spot has low resolution imagery'),
        #('noi', 'The spot has no imagery'),
        #('cld', 'The spot has cloudy imagery'),
        #('old', 'The spot has old imagery'),
        #('cen', 'The spot has censorsed imagery'),
        ('noi', 'no imagery'),
        ('cld', 'cloudy imagery'),
        ('low', 'low resolution imagery'),
        ('old', 'old imagery'),
        ('cen', 'censored imagery'),
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
        self.name or region.wkt

class Vote(models.Model):
    user = models.ForeignKey(User)
    region = models.ForeignKey(Region)
    weight = models.IntegerField()
    creation_time = models.DateTimeField('date voted', auto_now_add=True)
