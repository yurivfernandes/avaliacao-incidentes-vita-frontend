from access.models import User
from cadastro.models import Empresa, FilaAtendimento
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    empresa = serializers.SerializerMethodField(read_only=True)
    filas = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "empresa",
            "filas",
            "is_gestor",
            "is_tecnico",
            "is_staff",
            "is_ativo",
            "first_access",
        ]
        read_only_fields = ["id"]

    def get_empresa(self, obj):
        # Pega a empresa da primeira fila (assumindo que todas as filas são da mesma empresa)
        if obj.filas.exists() and obj.filas.first().empresa:
            fila = obj.filas.first()
            return {"id": fila.empresa.id, "nome": fila.empresa.nome}
        return None

    def get_filas(self, obj):
        return [{"id": fila.id, "nome": fila.nome} for fila in obj.filas.all()]
