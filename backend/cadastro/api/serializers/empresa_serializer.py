from cadastro.models import Empresa
from rest_framework import serializers


class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = "__all__"
