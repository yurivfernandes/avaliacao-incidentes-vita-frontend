from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


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
                "company_name": user.company_name,
                "is_gestor": user.is_gestor,
                "is_tecnico": user.is_tecnico,
                "fila_atendimento": user.fila_atendimento,
                "is_staff": user.is_staff,
            }
        )

    def put(self, request):
        user = request.user
        try:
            for field in ["full_name", "company_name", "fila_atendimento"]:
                if field in request.data:
                    setattr(user, field, request.data[field])
            user.save()
            return Response({"message": "Profile updated successfully"})
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )
