# views/user_create_view.py
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

User = get_user_model()


class UserCreateView(APIView):
    def post(self, request):
        data = request.data
        try:
            user = User.objects.create_user(
                username=data["username"].lower(),
                password=data["password"],
                full_name=data.get("full_name", ""),
                company_name=data.get("company_name", ""),
                is_gestor=data.get("is_gestor", False),
                is_tecnico=data.get("is_tecnico", False),
                fila_atendimento=data.get("fila_atendimento", ""),
            )
            return Response(
                {
                    "message": "User created successfully",
                    "user": {
                        "username": user.username,
                        "full_name": user.full_name,
                        "company_name": user.company_name,
                        "is_gestor": user.is_gestor,
                        "is_tecnico": user.is_tecnico,
                        "fila_atendimento": user.fila_atendimento,
                    },
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )
