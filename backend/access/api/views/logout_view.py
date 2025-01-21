from django.contrib.auth import logout
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt


@method_decorator(csrf_exempt, name="dispatch")
class LogoutView(View):
    def post(self, request, *args, **kwargs):
        logout(request)
        return JsonResponse({"message": "Logout successful"})
