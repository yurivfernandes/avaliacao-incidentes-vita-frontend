from rest_framework import serializers

from ...models import Premissas


class PremissaSerializer(serializers.ModelSerializer):
    dv_assignment_group = serializers.CharField(
        source="assignment.dv_assignment_group", read_only=True
    )

    class Meta:
        model = Premissas
        fields = ["id", "assignment", "qtd_incidents", "dv_assignment_group"]
