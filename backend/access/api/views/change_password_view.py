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

        if not user.check_password(current_password):
            return Response(
                {"error": "Current password is incorrect"}, status=400
            )

        try:
            validate_password(new_password)
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password changed successfully"})
        except ValidationError as e:
            return Response({"error": str(e)}, status=400)
