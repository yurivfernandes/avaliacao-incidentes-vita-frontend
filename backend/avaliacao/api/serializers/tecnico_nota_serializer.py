from rest_framework import serializers

from .item_stat_serializer import ItemStatSerializer


class TecnicoNotaSerializer(serializers.Serializer):
    tecnico_id = serializers.IntegerField()
    tecnico_nome = serializers.CharField()
    total_pontos = serializers.IntegerField()
    total_avaliacoes = serializers.IntegerField()
    total_possivel = serializers.IntegerField()
    percentual = serializers.FloatField()
    tendencia = serializers.CharField()
    item_stats = serializers.DictField(child=ItemStatSerializer())
