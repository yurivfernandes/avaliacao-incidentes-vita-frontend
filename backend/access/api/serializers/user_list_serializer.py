from access.models import User
from rest_framework import serializers


class UserListSerializer(serializers.ModelSerializer):
    empresa_data = serializers.SerializerMethodField()
    filas_data = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "full_name",
            "first_name",
            "last_name",
            "empresa_data",
            "filas_data",
            "is_staff",
            "is_gestor",
            "is_tecnico",
            "is_ativo",
        ]

    def get_empresa_data(self, obj):
        # Pega a empresa da primeira fila
        if obj.filas.exists() and obj.filas.first().empresa:
            fila = obj.filas.first()
            return {
                "id": fila.empresa.id,
                "nome": fila.empresa.nome,
            }
        return None

    def get_filas_data(self, obj):
        return [
            {
                "id": fila.id,
                "nome": fila.nome,
            }
            for fila in obj.filas.all()
        ]
