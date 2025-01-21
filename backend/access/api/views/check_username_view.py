from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.views import APIView

User = get_user_model()


class CheckUsernameView(APIView):
    def get(self, request, username):
        is_available = not User.objects.filter(username=username).exists()
        return Response({"available": is_available})
