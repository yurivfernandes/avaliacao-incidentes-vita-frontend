from rest_framework import serializers

from ...models import Empresa


class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ["id", "nome", "codigo", "status"]
        read_only_fields = ["id"]
