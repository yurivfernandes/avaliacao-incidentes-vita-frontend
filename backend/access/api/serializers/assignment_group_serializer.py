from dw_analytics.models import AssignmentGroup
from rest_framework import serializers


class AssignmentGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentGroup
        fields = ["id", "dv_assignment_group", "status"]
