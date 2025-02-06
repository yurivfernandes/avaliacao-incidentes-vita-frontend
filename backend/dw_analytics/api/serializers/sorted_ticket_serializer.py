from access.models import User
from django.contrib.auth import get_user_model
from rest_framework import serializers

from ...models import AssignmentGroup, Company, Contract, SortedTicket

User = get_user_model()


class SortedTicketSerializer(serializers.ModelSerializer):
    incident_id = serializers.IntegerField(source="incident.id")
    incident_number = serializers.CharField(source="incident.number")
    resolved_by = serializers.SerializerMethodField()
    assignment_group = serializers.SerializerMethodField()
    opened_at = serializers.DateTimeField(source="incident.opened_at")
    closed_at = serializers.DateTimeField(source="incident.closed_at")
    contract = serializers.SerializerMethodField()
    company = serializers.SerializerMethodField()
    categoria_falha = serializers.CharField(
        source="incident.dv_u_categoria_da_falha"
    )
    sub_categoria_falha = serializers.CharField(
        source="incident.dv_u_sub_categoria_da_falha"
    )
    origem = serializers.CharField(source="incident.u_origem")
    sla_atendimento = serializers.BooleanField(
        source="incident.sla_atendimento"
    )
    sla_resolucao = serializers.BooleanField(source="incident.sla_resolucao")

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

    def get_company(self, obj):
        try:
            if not obj.incident.company:
                return ""
            company = Company.objects.filter(id=obj.incident.company).first()
            return company.dv_company if company else ""
        except (Company.DoesNotExist, ValueError):
            return ""

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

    class Meta:
        model = SortedTicket
        fields = (
            "incident_id",
            "incident_number",
            "resolved_by",
            "assignment_group",
            "opened_at",
            "closed_at",
            "contract",
            "company",
            "categoria_falha",
            "sub_categoria_falha",
            "origem",
            "sla_atendimento",
            "sla_resolucao",
            "mes_ano",
        )
