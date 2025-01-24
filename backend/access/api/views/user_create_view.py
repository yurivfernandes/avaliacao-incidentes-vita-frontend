from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import transaction
from dw_analytics.models import AssignmentGroup
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

User = get_user_model()


class UserCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_staff:
            return Response(
                {"error": "Apenas usuários staff podem criar novos usuários"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            with transaction.atomic():
                # Validar grupos
                groups_ids = request.data.get("assignment_groups", [])
                if not groups_ids:
                    raise ValidationError(
                        "É necessário informar ao menos uma fila"
                    )

                groups = AssignmentGroup.objects.filter(id__in=groups_ids)
                if not groups.exists():
                    raise ValidationError("Nenhuma fila válida encontrada")

                # Criar usuário usando create_user
                user = User.objects.create_user(
                    username=request.data.get("username", "").lower(),
                    password=request.data.get("password", "").strip(),
                    first_name=request.data.get("first_name", "").strip(),
                    last_name=request.data.get("last_name", "").strip(),
                    full_name=f"{request.data.get('first_name', '').strip()} {request.data.get('last_name', '').strip()}",
                    is_staff=request.data.get("is_staff", False),
                    is_gestor=request.data.get("is_gestor", False),
                    is_tecnico=request.data.get("is_tecnico", True),
                    is_ativo=True,
                    first_access=True,
                )

                # Associar grupos após criar o usuário
                user.assignment_groups.add(*groups)

                return Response(
                    {
                        "message": "Usuário criado com sucesso",
                        "id": user.id,
                        "username": user.username,
                    },
                    status=status.HTTP_201_CREATED,
                )

        except ValidationError as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"Erro ao criar usuário: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
