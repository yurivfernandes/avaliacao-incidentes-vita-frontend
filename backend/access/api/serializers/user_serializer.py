from access.models import User
from rest_framework import serializers

from .assignment_group_serializer import AssignmentGroupSerializer


class UserSerializer(serializers.ModelSerializer):
    assignment_groups = AssignmentGroupSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "full_name",
            "is_staff",
            "is_gestor",
            "is_tecnico",
            "is_active",
            "assignment_groups",
        )

    def update(self, instance, validated_data):
        # Garantir que apenas um tipo de usuário está ativo
        if validated_data.get("is_staff"):
            validated_data["is_gestor"] = False
            validated_data["is_tecnico"] = False
        elif validated_data.get("is_gestor"):
            validated_data["is_staff"] = False
            validated_data["is_tecnico"] = False
        elif validated_data.get("is_tecnico"):
            validated_data["is_staff"] = False
            validated_data["is_gestor"] = False

        return super().update(instance, validated_data)
