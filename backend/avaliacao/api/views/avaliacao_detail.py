from avaliacao.models import Avaliacao
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from ..serializers.avaliacao_serializer import AvaliacaoSerializer


class AvaliacaoDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AvaliacaoSerializer
    queryset = Avaliacao.objects.select_related(
        "incident", "assignment_group", "user"
    )
