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
        return Response(
            {
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "full_name": user.full_name,
                "empresa": {
                    "id": user.empresa.id,
                    "nome": user.empresa.nome,
                    "codigo": user.empresa.codigo,
                }
                if user.empresa
                else None,
                "fila": {
                    "id": user.fila.id,
                    "nome": user.fila.nome,
                    "codigo": user.fila.codigo,
                }
                if user.fila
                else None,
                "is_gestor": user.is_gestor,
                "is_tecnico": user.is_tecnico,
                "is_staff": user.is_staff,
            }
        )

    def patch(self, request, user_id=None):
        try:
            # Se user_id for fornecido e o usuário for staff ou gestor, atualiza outro usuário
            if user_id and (request.user.is_staff or request.user.is_gestor):
                user = User.objects.get(id=user_id)
            else:
                user = request.user

            # Campo especial para senha
            if "password" in request.data:
                user.set_password(request.data["password"])

            # Atualiza outros campos
            allowed_fields = [
                "full_name",
                "empresa",
                "fila",
                "is_gestor",
                "is_tecnico",
            ]
            for field in allowed_fields:
                if field in request.data:
                    # Apenas staff pode alterar status de gestor/técnico
                    if (
                        field in ["is_gestor", "is_tecnico"]
                        and not request.user.is_staff
                    ):
                        continue
                    if field == "empresa" and request.data[field]:
                        user.empresa_id = request.data[field]
                    elif field == "fila" and request.data[field]:
                        user.fila_id = request.data[field]
                    else:
                        setattr(user, field, request.data[field])

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
