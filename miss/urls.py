from django.conf.urls import patterns, url

from miss import views

urlpatterns = patterns('',
    #url(r'^$', views.index, name='index'),
    url(r'^login$', views.login_view, name='login'),
    url(r'^logout$', views.logout_view, name='logout'),
    url(r'^register$', views.register_view, name='register'),
    url(r'^user_info$', views.user_info_view, name='user_info'),

    url(r'^applications$', views.types_view, name='types', {'_type': 'application'}),
    url(r'^imageries$', views.types_view, name='types', {'_type': 'imagery'}),
    url(r'^imagery_problems$', views.types_view, name='types', {'_type': 'imagery_problem'}),

    url(r'^region/add$', views.add_region_view, name='add_region'),
    url(r'^vote/up/(?P<region_id>\d+)$', views.add_vote_view, name='add_vote', {'vote': 'up'}),
    url(r'^vote/down/(?P<region_id>\d+)$', views.add_vote_view, name='add_vote', {'vote': 'down'}),
    url(r'^aim/support/(?P<region_id>\d+)$', views.support_aim_view, name='support_aim',),
)
