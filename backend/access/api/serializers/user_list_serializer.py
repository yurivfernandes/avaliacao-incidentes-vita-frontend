from access.models import User
from rest_framework import serializers


class UserListSerializer(serializers.ModelSerializer):
    assignment_groups = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "full_name",
            "first_name",
            "last_name",
            "assignment_groups",
            "is_staff",
            "is_gestor",
            "is_tecnico",
            "is_ativo",
        ]

    def get_assignment_groups(self, obj):
        return [
            {
                "id": group.id,
                "dv_assignment_group": group.dv_assignment_group,
            }
            for group in obj.assignment_groups.all()
        ]
