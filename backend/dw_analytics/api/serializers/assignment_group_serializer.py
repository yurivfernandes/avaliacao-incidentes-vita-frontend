from dw_analytics.models import AssignmentGroup
from rest_framework import serializers


class AssignmentGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentGroup
        fields = "__all__"
