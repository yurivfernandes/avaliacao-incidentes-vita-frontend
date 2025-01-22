# views/user_create_view.py
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..permissions import IsStaffOrGestor

User = get_user_model()


class UserCreateView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrGestor]

    def post(self, request):
        try:
            # Validar se gestor está criando usuário na própria fila
            if request.user.is_gestor and not request.user.is_staff:
                if str(request.user.fila_id) != str(request.data.get("fila")):
                    return Response(
                        {
                            "error": "Gestor só pode criar usuários em sua própria fila"
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

            # Extrair dados do request
            username = request.data.get("username")
            password = request.data.get("password").strip()
            first_name = request.data.get("first_name", "")
            last_name = request.data.get("last_name", "")
            full_name = request.data.get("full_name", "")
            empresa_id = request.data.get("empresa")
            fila_id = request.data.get("fila")
            is_staff = request.data.get("is_staff", False)
            is_gestor = request.data.get("is_gestor", False)
            is_tecnico = request.data.get("is_tecnico", True)

            # Validações
            if not username or not password:
                return Response(
                    {"error": "Username e password são obrigatórios"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Se o usuário não for staff, só pode criar técnicos
            if not request.user.is_staff:
                is_staff = False
                is_gestor = False
                is_tecnico = True

            # Garantir que first_access seja True
            user_data = {
                **request.data,
                "first_access": True,  # Força primeiro acesso
            }

            user = User.objects.create_user(
                username=user_data["username"].lower(),
                password=user_data["password"],
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                full_name=user_data["full_name"],
                empresa_id=user_data["empresa"],
                fila_id=user_data["fila"],
                is_staff=user_data["is_staff"],
                is_gestor=user_data["is_gestor"],
                is_tecnico=user_data["is_tecnico"],
                first_access=True,
            )

            return Response(
                {"message": "Usuário criado com sucesso", "id": user.id},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )
