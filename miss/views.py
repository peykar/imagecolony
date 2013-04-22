# Create your views here.
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ObjectDoesNotExist
from django.utils.translation import ugettext as _
from django.shortcuts import render, get_object_or_404
from django.db.models import Sum
from django.contrib.gis.geos import GEOSGeometry

from mission_earth.decorators import json_response
from miss.models import Region, Vote 

from miss.lib.send_mail import send_registration_notif

def home(request):
    context = {}
    return render(request, 'index.html', context)

@json_response(ajax_required=False, login_required=False)
def types_view(request, _type):
    if _type == 'application':
        types = Region.APPLICATION_TYPES
    elif _type == 'imagery':
        types = Region.IMAGERY_TYPES
    elif _type == 'imagery_problem':
        types = Region.IMAGERY_PROBLEM_TYPES 
    else:
        types = {}

    return {'success': True, 'types': types}

@json_response(ajax_required=False, login_required=False)
def regions_view(request):
    if request.method != 'POST' or 'wkt' not in request.POST:
        return {'success': False, 'message': _("Invalid request")}

    limit = request.POST.get('limit', 15)
    regions = Region.objects.filter(region__within=request.POST.get('wkt'))[:limit]
    result = []
    for region in regions:
        current_vote = region.vote_set.aggregate(Sum('weight'))['weight__sum']
        if current_vote is None:
            current_vote = 0
        result.append({'name': region.name,
            'region_id': region.id,
            'region': region.region.wkt,
            'current_vote': current_vote,
            'when_to_capture': region.when_to_capture,
            'application_type': region.application_type,
            'imagery_type': region.imagery_type,
            'imagery_problem_type': region.imagery_type,
        })
    return {'success': True, 'regions': result}


@json_response(ajax_required=False, login_required=True)
def add_region_view(request):
    if request.method != 'POST' or 'point' not in request.POST:
        return {'success': False, 'message': _("Invalid request")}

    region = Region(
        user=User.objects.get(username = request.user),
        name=request.POST.get('name',''),
        region=GEOSGeometry(request.POST.get('point','')),
        when_to_capture=request.POST.get('appropriate_capture_time',''),
        application_type=request.POST.get('application',''),
        imagery_type=request.POST.get('imagery',''),
        imagery_problem_type=request.POST.get('imagery_problem','')
    )
    region.save()

    region.vote_set.create(user=request.user, weight=1)    

    return {'success': True, 'message': _("Your reguested region submitted."), 'extra': {'id': region.id}}

def support_aim_view(request, region_id):
    region = get_object_or_404(Region, pk=region_id)

    region.vote_set.create(user=request.user, weight=1)    
    context = {
        'zoom_to_point': region.region.wkt,
        'message': _("You've just up-voted your friend's aim! Your are AWESOME!")
    }
    return render(request, 'index.html', context)


@json_response(ajax_required=False, login_required=False)
def add_vote_view(request):
    if request.REQUEST.get('vote', None) not in ('up', 'down') \
        or request.REQUEST.get('region_id', None) is None:
        return {'success': False, 'message': _("Invalid request")}

    value = 1 if request.REUQEST['vote'] == 'up' else -1

    try:
        region = Region.objects.get(pk=region_id)
    except Region.DoesNotExist:
        return {'success': False, 'message': _("Invalid request")}

    region.vote_set.create(user=request.user, weight=value)    

    current_vote = region.vote_set.aggregate(Sum('weight'))
    current_vote = current_vote['weight__sum']
    if current_vote is None:
        current_vote = 0

    return {'success': True, 'current_vote_value': current_vote}

@json_response(ajax_required=False, login_required=False)
def login_view(request):
    if request.method != 'POST' or 'username' not in request.POST or 'password' not in request.POST:
        return {'success': False, 'message': _("Invalid Login")}
    username = request.POST['username']
    password = request.POST['password']
 
    user = authenticate(username=username, password=password)
    if user is not None:
        if user.is_active:
            login(request, user)
            return {'success': True}
        else:
            return {'success': False, 'message': _("Account is disabled")}
    else:
        return {'success': False, 'message': _("Invalid Login")}

@json_response(ajax_required=False, login_required=False)
def logout_view(request):
    logout(request)
    return {'success': True}

@json_response(ajax_required=False, login_required=False)
def register_view(request):
    if request.method != 'POST' \
        or 'username' not in request.POST \
        or 'password' not in request.POST \
        or 'password_retype' not in request.POST \
        or 'email' not in request.POST:
        return {'success': False, 'message': _("Incomplete request.")}

    username = request.POST['username']
    password = request.POST['password']
    email = request.POST['email']

    try:
        User.objects.get(username=username)
    except ObjectDoesNotExist:
        pass
    else:
        return {'success': False, 'message': _("User exists.")}

    try:
        User.objects.get(email=email)
    except ObjectDoesNotExist:
        pass
    else:
        return {'success': False, 'message': _("User exists.")}

    user = User.objects.create_user(
        username = username,
        password = password,
        email = email 
    )
    user.save()
    try:
        send_registration_notif(username, email)
    except:
        pass

    return {'success': True, 'message': _("User registered successfully.")}

@json_response(ajax_required=False, login_required=True)
def user_info_view(request):
    return {'success': True, 'name': request.user.get_full_name() or request.user.get_username()}
