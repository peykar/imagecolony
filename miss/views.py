# Create your views here.
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ObjectDoesNotExist
from django.utils.translation import ugettext as _


from mission_earth.decorators import json_response

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

    return {'success': True, 'message': _("User registered successfully.")}

@json_response(ajax_required=False, login_required=True)
def user_info_view(request):
    return {'success': True, 'name': request.user.get_full_name() or request.user.get_username()}
