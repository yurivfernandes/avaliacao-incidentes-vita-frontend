from rest_framework import serializers

from ...models import FilaAtendimento
from .empresa_serializer import EmpresaSerializer


class FilaAtendimentoSerializer(serializers.ModelSerializer):
    empresa_data = EmpresaSerializer(source="empresa", read_only=True)

    class Meta:
        model = FilaAtendimento
        fields = ["id", "nome", "status", "empresa", "empresa_data"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        return FilaAtendimento.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.nome = validated_data.get("nome", instance.nome)
        instance.status = validated_data.get("status", instance.status)
        instance.empresa_id = validated_data.get(
            "empresa", instance.empresa_id
        )
        instance.save()
        return instance
