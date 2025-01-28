from rest_framework import serializers

from ...models import Premissas


class PremissaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Premissas
        fields = "__all__"  # Inclui todos os campos do modelo Premissas
