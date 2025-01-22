from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        if not new_password:
            return Response(
                {"error": "Nova senha é obrigatória"},
                status=400,
            )

        # Verifica senha atual apenas se não for primeiro acesso
        if not user.first_access:
            if not current_password:
                return Response(
                    {"error": "Senha atual é obrigatória"},
                    status=400,
                )
            if not user.check_password(current_password):
                return Response(
                    {"error": "Senha atual está incorreta"},
                    status=400,
                )

        try:
            validate_password(new_password)
            user.set_password(new_password)
            user.first_access = False
            user.save()
            return Response({"message": "Senha alterada com sucesso"})
        except ValidationError as e:
            return Response(
                {
                    "error": "A senha deve conter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais"
                },
                status=400,
            )
