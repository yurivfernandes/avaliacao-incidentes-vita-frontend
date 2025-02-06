from django.contrib.auth import get_user_model
from rest_framework import serializers

from ...models import AssignmentGroup, Contract, Incident, ResolvedBy

User = get_user_model()


class IncidentSerializer(serializers.ModelSerializer):
    resolved_by = serializers.SerializerMethodField()
    assignment_group = serializers.SerializerMethodField()
    contract = serializers.SerializerMethodField()

    def get_resolved_by(self, obj):
        try:
            if not obj.resolved_by:
                return ""
            user = User.objects.filter(id=obj.resolved_by).first()
            return (
                f"{user.first_name} {user.last_name}".strip() if user else ""
            )
        except (User.DoesNotExist, ValueError, AttributeError):
            return ""

    def get_assignment_group(self, obj):
        try:
            if not obj.assignment_group:
                return ""
            group = AssignmentGroup.objects.filter(
                id=obj.assignment_group
            ).first()
            return group.dv_assignment_group if group else obj.assignment_group
        except (AssignmentGroup.DoesNotExist, ValueError):
            return obj.assignment_group

    def get_contract(self, obj):
        try:
            if not obj.contract:
                return ""
            contract = Contract.objects.filter(id=obj.contract).first()
            return contract.dv_contract if contract else ""
        except (Contract.DoesNotExist, ValueError):
            return ""

    class Meta:
        model = Incident
        fields = (
            "id",
            "number",
            "resolved_by",
            "assignment_group",
            "contract",
            "opened_at",
            "closed_at",
        )
