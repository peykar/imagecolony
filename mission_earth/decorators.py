from django.utils import simplejson
from django.http import HttpResponse

class json_response(object):
    """
        JSON decorator based on: http://djangosnippets.org/snippets/2869/
    """
    def __init__(self, login_required = False, ajax_required = False):
        self.login_required = login_required
        self.ajax_required = ajax_required
    def __call__(self, func):
        class_args = self
        def decorator(request, *args, **kwargs):
            if class_args.login_required and not request.user.is_authenticated():
                objects = {
                    "success": False,
                    "message": "User not authenticated"
                }
            elif class_args.ajax_required and not request.is_ajax():
                objects = {
                    "success": False,
                    "message": "Request gone wrong :("
                }
            else:
                objects = func(request, *args, **kwargs)
            
            if isinstance(objects, HttpResponse):
                return objects
            try:
                data = simplejson.dumps(objects)
                if 'callback' in request.REQUEST:
                    # a jsonp response!
                    data = '%s(%s);' % (request.REQUEST['callback'], data)
                    return HttpResponse(data, "text/javascript")
            except:
                data = simplejson.dumps(str(objects))
            return HttpResponse(data, "application/json")
        
        return decorator
