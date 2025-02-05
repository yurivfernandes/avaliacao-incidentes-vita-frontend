from avaliacao.models import Avaliacao
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from ..serializers.avaliacao_serializer import AvaliacaoSerializer


class AvaliacaoListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AvaliacaoSerializer
    pagination_class = PageNumberPagination

    def get_queryset(self):
        return Avaliacao.objects.select_related(
            "incident", "assignment_group", "user"
        ).all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
