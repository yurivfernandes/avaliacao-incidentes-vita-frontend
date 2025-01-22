from access.models import User
from cadastro.models.empresa import Empresa
from cadastro.models.fila_atendimento import FilaAtendimento
from rest_framework import serializers


class UserListSerializer(serializers.ModelSerializer):
    empresa_data = serializers.SerializerMethodField()
    fila_data = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "full_name",
            "first_name",
            "last_name",
            "empresa_data",
            "fila_data",
            "is_staff",
            "is_gestor",
            "is_tecnico",
            "is_ativo",
        ]

    def get_empresa_data(self, obj):
        if obj.empresa:
            return {
                "id": obj.empresa.id,
                "nome": obj.empresa.nome,
                "codigo": obj.empresa.codigo,
            }
        return None

    def get_fila_data(self, obj):
        if obj.fila:
            return {
                "id": obj.fila.id,
                "nome": obj.fila.nome,
                "codigo": obj.fila.codigo,
            }
        return None
