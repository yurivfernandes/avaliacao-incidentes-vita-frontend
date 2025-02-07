from rest_framework import serializers

from .nota_por_tecnico_serializer import NotaPorTecnicoSerializer
from .tecnico_nota_serializer import TecnicoNotaSerializer


class DashboardSerializer(serializers.Serializer):
    resultado_agrupado = NotaPorTecnicoSerializer(many=True)
    media_percentual = serializers.FloatField()
    ranking_tecnicos = TecnicoNotaSerializer(many=True)
    item_mais_critico = serializers.SerializerMethodField()

    def get_item_mais_critico(self, obj):
        if not obj.get("item_mais_critico"):
            return None
        campo, dados = obj["item_mais_critico"]
        return {"campo": campo, "dados": dados}
