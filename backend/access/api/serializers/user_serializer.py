from access.models import User
from cadastro.models import Empresa, FilaAtendimento
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    empresa = serializers.SerializerMethodField()
    fila = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "full_name",
            "first_name",
            "last_name",
            "empresa",
            "fila",
            "is_gestor",
            "is_tecnico",
            "is_staff",
            "is_ativo",
        ]

    def get_empresa(self, obj):
        if obj.empresa:
            return {
                "id": obj.empresa.id,
                "nome": obj.empresa.nome,
                "codigo": obj.empresa.codigo,
            }
        return None

    def get_fila(self, obj):
        if obj.fila:
            return {
                "id": obj.fila.id,
                "nome": obj.fila.nome,
                "codigo": obj.fila.codigo,
            }
        return None
