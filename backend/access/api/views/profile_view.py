from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

User = get_user_model()


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        assignment_groups = [
            {
                "id": group.id,
                "nome": group.dv_assignment_group,
            }
            for group in user.assignment_groups.all()
        ]

        return Response(
            {
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "full_name": user.full_name,
                "assignment_groups": assignment_groups,
                "is_gestor": user.is_gestor,
                "is_tecnico": user.is_tecnico,
                "is_staff": user.is_staff,
                "is_ativo": user.is_ativo,
                "first_access": user.first_access,
            }
        )

    def patch(self, request, user_id=None):
        try:
            # Se user_id for fornecido e o usuário for staff ou gestor, atualiza outro usuário
            if user_id and (request.user.is_staff or request.user.is_gestor):
                user = User.objects.get(id=user_id)

                # Validar se gestor está atualizando usuário dos próprios grupos
                if request.user.is_gestor and not request.user.is_staff:
                    gestor_groups = set(
                        request.user.assignment_groups.values_list(
                            "id", flat=True
                        )
                    )
                    user_groups = set(
                        user.assignment_groups.values_list("id", flat=True)
                    )
                    if not user_groups.issubset(gestor_groups):
                        return Response(
                            {
                                "error": "Gestor só pode atualizar usuários de seus grupos"
                            },
                            status=status.HTTP_403_FORBIDDEN,
                        )
            else:
                user = request.user

            # Campo especial para senha
            if "password" in request.data:
                user.set_password(request.data["password"])

            # Atualiza outros campos
            allowed_fields = [
                "full_name",
                "is_gestor",
                "is_tecnico",
                "is_ativo",
                "is_staff",
                "first_access",
            ]

            for field in allowed_fields:
                if field in request.data:
                    # Apenas staff pode alterar status de gestor/técnico
                    if (
                        field in ["is_gestor", "is_tecnico"]
                        and not request.user.is_staff
                    ):
                        continue

                    setattr(user, field, request.data[field])

            # Atualização dos assignment groups
            if "assignment_groups" in request.data:
                if request.user.is_gestor and not request.user.is_staff:
                    gestor_groups = set(
                        request.user.assignment_groups.values_list(
                            "id", flat=True
                        )
                    )
                    if not all(
                        int(group_id) in gestor_groups
                        for group_id in request.data["assignment_groups"]
                    ):
                        return Response(
                            {
                                "error": "Gestor só pode atribuir seus próprios grupos"
                            },
                            status=status.HTTP_403_FORBIDDEN,
                        )
                user.assignment_groups.set(request.data["assignment_groups"])

            user.save()
            return Response({"message": "Atualizado com sucesso"})

        except User.DoesNotExist:
            return Response(
                {"error": "Usuário não encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )
