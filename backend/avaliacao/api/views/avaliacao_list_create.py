from django.db.models import Q
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from ...models import Avaliacao
from ..serializers import AvaliacaoSerializer


class AvaliacaoListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AvaliacaoSerializer
    pagination_class = PageNumberPagination

    def get_queryset(self):
        queryset = Avaliacao.objects.select_related("incident", "user")

        search = self.request.query_params.get("search", "")
        if search:
            queryset = queryset.filter(
                Q(incident__number__icontains=search)
                | Q(incident__resolved_by__icontains=search)
            )

        # Filtro por data
        data_inicial = self.request.query_params.get("data_inicial")
        data_final = self.request.query_params.get("data_final")

        if data_inicial:
            queryset = queryset.filter(incident__closed_at__gte=data_inicial)
        if data_final:
            queryset = queryset.filter(incident__closed_at__lte=data_final)

        # Filtro por perfil de usuário
        user = self.request.user

        if user.is_staff:
            return queryset
        elif user.is_gestor:
            return queryset.filter(
                assignment_group__in=user.assignment_groups.all()
            )
        else:
            return queryset.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
