import json

from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.models import Token

from ..serializers import UserSerializer


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
            if user.is_ativo:  # Verificar se o usuário está ativo
                login(request, user)
                token, created = Token.objects.get_or_create(user=user)
                serializer = UserSerializer(user)
                response = JsonResponse(
                    {
                        "message": "Login successful",
                        "token": token.key,
                        "user": serializer.data,
                        "first_access": user.first_access,
                    }
                )
            else:
                response = JsonResponse(
                    {
                        "error": "Usuário inativo. Entre em contato com o administrador."
                    },
                    status=403,
                )
        else:
            response = JsonResponse(
                {"error": "Credenciais inválidas"}, status=400
            )

        response["Access-Control-Allow-Origin"] = "*"
        return response


@method_decorator(csrf_exempt, name="dispatch")
class LogoutView(View):
    def post(self, request, *args, **kwargs):
        logout(request)
        return JsonResponse({"message": "Logout successful"})
