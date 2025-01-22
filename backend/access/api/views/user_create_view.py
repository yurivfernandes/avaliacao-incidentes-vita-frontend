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
            # Validar se gestor está criando usuário em suas filas
            if request.user.is_gestor and not request.user.is_staff:
                filas_ids = request.data.get("filas", [])
                gestor_filas_ids = set(
                    request.user.filas.values_list("id", flat=True)
                )
                if not all(
                    int(fila_id) in gestor_filas_ids for fila_id in filas_ids
                ):
                    return Response(
                        {
                            "error": "Gestor só pode criar usuários em suas próprias filas"
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
            is_ativo = request.data.get("is_ativo", True)

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

            user = User.objects.create_user(
                username=username.lower(),
                password=password,
                first_name=first_name,
                last_name=last_name,
                full_name=full_name,
                is_staff=is_staff,
                is_gestor=is_gestor,
                is_tecnico=is_tecnico,
                first_access=True,
                is_ativo=is_ativo,
            )

            # Adicionar filas ao usuário
            filas_ids = request.data.get("filas", [])
            if filas_ids:
                user.filas.set(filas_ids)

            return Response(
                {"message": "Usuário criado com sucesso", "id": user.id},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )
