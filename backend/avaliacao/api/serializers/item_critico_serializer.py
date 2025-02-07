from rest_framework import serializers

from .tecnico_nota_serializer import TecnicoNotaSerializer


class ItemCriticoSerializer(serializers.Serializer):
    nome = serializers.CharField()
    percentual = serializers.FloatField()
    tecnicos = TecnicoNotaSerializer(many=True)
