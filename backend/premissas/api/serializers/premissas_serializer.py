from rest_framework import serializers

from ...models import Premissas


class PremissaSerializer(serializers.ModelSerializer):
    dv_assignment_group = serializers.CharField(
        source="assignment.dv_assignment_group", read_only=True
    )

    class Meta:
        model = Premissas
        fields = [
            "id",
            "assignment",
            "qtd_incidents",
            "dv_assignment_group",
            "is_contrato_lancado",
            "is_horas_lancadas",
            "is_has_met_first_response_target",
            "is_resolution_target",
            "is_atualizaca_logs_correto",
            "is_ticket_encerrado_corretamente",
            "is_descricao_troubleshooting",
            "is_cliente_notificado",
            "is_category_correto",
        ]
