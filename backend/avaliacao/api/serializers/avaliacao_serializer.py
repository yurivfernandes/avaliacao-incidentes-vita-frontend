from avaliacao.models import Avaliacao
from dw_analytics.api.serializers import IncidentSerializer
from rest_framework import serializers


class AvaliacaoSerializer(serializers.ModelSerializer):
    incident = IncidentSerializer(read_only=True)
    incident_id = serializers.IntegerField(write_only=True)
    created_by = serializers.SerializerMethodField(read_only=True)
    nota_total = serializers.IntegerField(read_only=True)

    def get_created_by(self, obj):
        return (
            f"{obj.user.first_name} {obj.user.last_name}".strip()
            or obj.user.username
        )

    class Meta:
        model = Avaliacao
        fields = "__all__"
        read_only_fields = ("user", "created_at", "updated_at", "nota_total")
