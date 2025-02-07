from access.models import User
from django.contrib.auth import get_user_model
from dw_analytics.models import AssignmentGroup, Contract
from rest_framework import serializers

from ...models import Avaliacao

User = get_user_model()


class AvaliacaoSerializer(serializers.ModelSerializer):
    number = serializers.CharField(source="incident.number")
    resolved_by = serializers.SerializerMethodField()
    assignment_group = serializers.SerializerMethodField()
    contract = serializers.SerializerMethodField()
    created_by = (
        serializers.SerializerMethodField()
    )  # Alterado para SerializerMethodField
    nota_total = serializers.SerializerMethodField()

    class Meta:
        model = Avaliacao
        fields = [
            "id",
            "incident",
            "number",
            "assignment_group",
            "resolved_by",
            "contract",
            "created_by",
            "user",
            "is_contrato_lancado",
            "is_horas_lancadas",
            "is_has_met_first_response_target",
            "is_resolution_target",
            "is_atualizaca_logs_correto",
            "is_ticket_encerrado_corretamente",
            "is_descricao_troubleshooting",
            "is_cliente_notificado",
            "is_category_correto",
            "nota_total",
            "created_at",
            "updated_at",
        ]

    def get_created_by(self, obj):  # Novo método
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return ""

    def get_resolved_by(self, obj):
        try:
            if not obj.incident.resolved_by:
                return ""
            user = User.objects.filter(id=obj.incident.resolved_by).first()
            return (
                f"{user.first_name} {user.last_name}".strip() if user else ""
            )
        except (User.DoesNotExist, ValueError, AttributeError):
            return ""

    def get_assignment_group(self, obj):
        try:
            if not obj.incident.assignment_group:
                return ""
            group = AssignmentGroup.objects.filter(
                id=obj.incident.assignment_group
            ).first()
            return (
                group.dv_assignment_group
                if group
                else obj.incident.assignment_group
            )
        except (AssignmentGroup.DoesNotExist, ValueError):
            return obj.incident.assignment_group

    def get_contract(self, obj):
        try:
            if not obj.incident.contract:
                return ""
            contract = Contract.objects.filter(
                id=obj.incident.contract
            ).first()
            return contract.dv_contract if contract else ""
        except (Contract.DoesNotExist, ValueError):
            return ""

    def get_nota_total(self, obj):
        campos = [
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
        return sum(1 for campo in campos if getattr(obj, campo, False))
