from rest_framework import serializers


class ItemStatSerializer(serializers.Serializer):
    nome = serializers.CharField()
    total = serializers.IntegerField()
    percentual = serializers.FloatField()
