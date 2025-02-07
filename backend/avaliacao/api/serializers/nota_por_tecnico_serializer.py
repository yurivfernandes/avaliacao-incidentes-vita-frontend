from rest_framework import serializers

from .tecnico_nota_serializer import TecnicoNotaSerializer


class NotaPorTecnicoSerializer(serializers.Serializer):
    assignment_group_id = serializers.IntegerField()
    assignment_group_nome = serializers.CharField()
    mes = serializers.CharField()  # Será apenas MM/YYYY
    tecnicos = TecnicoNotaSerializer(many=True)
