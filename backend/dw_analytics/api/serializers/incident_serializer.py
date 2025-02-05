from dw_analytics.models import Incident
from rest_framework import serializers


class IncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = [
            "id",
            "number",
            "resolved_by",
            "dv_resolved_by",
            "assignment_group",
            "dv_assignment_group",
            "opened_at",
            "closed_at",
            "contract",
            "dv_contract",
            "sla_atendimento",
            "sla_resolucao",
            "company",
            "dv_company",
            "u_origem",
            "dv_u_categoria_da_falha",
            "dv_u_sub_categoria_da_falha",
            "dv_u_detalhe_sub_categoria_da_falha",
        ]
