from django.conf.urls import patterns, url

from miss import views

urlpatterns = patterns('',
    #url(r'^$', views.index, name='index'),
    url(r'^login$', views.login_view, name='login'),
    url(r'^logout$', views.logout_view, name='logout'),
    url(r'^register$', views.register_view, name='register'),
    url(r'^user_info$', views.user_info_view, name='user_info'),
)
