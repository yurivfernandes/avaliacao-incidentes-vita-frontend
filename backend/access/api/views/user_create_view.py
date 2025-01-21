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
            # Extrair dados do request
            username = request.data.get("username")
            password = request.data.get("password")
            first_name = request.data.get("first_name", "")
            last_name = request.data.get("last_name", "")
            full_name = request.data.get("full_name", "")
            company_name = request.data.get("company_name", "")
            fila_atendimento = request.data.get("fila_atendimento", "")
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

            # Criar usuário
            user = User.objects.create_user(
                username=username,
                password=password,
                first_name=first_name,
                last_name=last_name,
                full_name=full_name,
                company_name=company_name,
                fila_atendimento=fila_atendimento,
                is_staff=is_staff,
                is_gestor=is_gestor,
                is_tecnico=is_tecnico,
            )

            return Response(
                {"message": "Usuário criado com sucesso", "id": user.id},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )
