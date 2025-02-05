from avaliacao.models import Avaliacao
from dw_analytics.api.serializers import (
    AssignmentGroupSerializer,
    IncidentSerializer,
)
from rest_framework import serializers


class AvaliacaoSerializer(serializers.ModelSerializer):
    incident = IncidentSerializer(read_only=True)
    incident_id = serializers.IntegerField(write_only=True)
    assignment_group = AssignmentGroupSerializer(read_only=True)
    assignment_group_id = serializers.IntegerField(write_only=True)
    created_by = serializers.StringRelatedField(
        source="user.username", read_only=True
    )

    class Meta:
        model = Avaliacao
        fields = "__all__"
        read_only_fields = ("user", "created_at", "updated_at")
