import json

from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.models import Token


@method_decorator(csrf_exempt, name="dispatch")
class LoginView(View):
    def options(self, request, *args, **kwargs):
        response = HttpResponse()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            response = JsonResponse(
                {
                    "message": "Login successful",
                    "token": token.key,
                    "user": {
                        "username": user.username,
                        "full_name": user.full_name,
                        "company_name": user.company_name,
                        "is_gestor": user.is_gestor,
                        "is_tecnico": user.is_tecnico,
                        "fila_atendimento": user.fila_atendimento,
                        "is_staff": user.is_staff,
                    },
                }
            )
        else:
            response = JsonResponse(
                {"error": "Invalid credentials"}, status=400
            )

        response["Access-Control-Allow-Origin"] = "*"
        return response


@method_decorator(csrf_exempt, name="dispatch")
class LogoutView(View):
    def post(self, request, *args, **kwargs):
        logout(request)
        return JsonResponse({"message": "Logout successful"})
