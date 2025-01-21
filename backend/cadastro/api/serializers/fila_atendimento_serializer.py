from cadastro.models import FilaAtendimento
from rest_framework import serializers


class FilaAtendimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FilaAtendimento
        fields = "__all__"
