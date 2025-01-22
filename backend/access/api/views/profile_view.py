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
        empresa = None
        filas = []

        if user.filas.exists():
            primeira_fila = user.filas.first()
            empresa = (
                {
                    "id": primeira_fila.empresa.id,
                    "nome": primeira_fila.empresa.nome,
                }
                if primeira_fila.empresa
                else None
            )

            filas = [
                {
                    "id": fila.id,
                    "nome": fila.nome,
                }
                for fila in user.filas.all()
            ]

        return Response(
            {
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "full_name": user.full_name,
                "empresa": empresa,
                "filas": filas,
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

                # Validar se gestor está atualizando usuário da própria fila
                if request.user.is_gestor and not request.user.is_staff:
                    if user.fila_id != request.user.fila_id:
                        return Response(
                            {
                                "error": "Gestor só pode atualizar usuários de sua própria fila"
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
                "fila",
                "is_gestor",
                "is_tecnico",
                "is_ativo",
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

                    # Validação especial para fila
                    if field == "fila" and request.data[field]:
                        # Gestor só pode atribuir sua própria fila
                        if (
                            request.user.is_gestor
                            and not request.user.is_staff
                        ):
                            if str(request.data[field]) != str(
                                request.user.fila_id
                            ):
                                return Response(
                                    {
                                        "error": "Gestor só pode atribuir sua própria fila"
                                    },
                                    status=status.HTTP_403_FORBIDDEN,
                                )
                        user.fila_id = request.data[field]
                    else:
                        setattr(user, field, request.data[field])

            # Atualização das filas
            if "filas" in request.data:
                # Validar se gestor está atualizando para suas próprias filas
                if request.user.is_gestor and not request.user.is_staff:
                    gestor_filas_ids = set(
                        request.user.filas.values_list("id", flat=True)
                    )
                    if not all(
                        int(fila_id) in gestor_filas_ids
                        for fila_id in request.data["filas"]
                    ):
                        return Response(
                            {
                                "error": "Gestor só pode atribuir suas próprias filas"
                            },
                            status=status.HTTP_403_FORBIDDEN,
                        )
                user.filas.set(request.data["filas"])

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
