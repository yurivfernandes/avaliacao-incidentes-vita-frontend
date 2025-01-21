from access.models import User
from rest_framework import serializers


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "company_name",
            "fila_atendimento",
            "is_gestor",
            "is_tecnico",
            "is_staff",
        ]
