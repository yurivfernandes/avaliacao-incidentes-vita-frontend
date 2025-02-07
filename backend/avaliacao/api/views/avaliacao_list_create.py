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
        user = self.request.user

        # Filtrar baseado no tipo de usuário
        if user.is_staff:
            # Staff vê tudo
            pass
        elif user.is_gestor:
            # Gestor vê apenas tickets das suas filas
            if user.assignment_groups.exists():
                queryset = queryset.filter(
                    incident__assignment_group__in=user.assignment_groups.all()
                )
            else:
                return (
                    Avaliacao.objects.none()
                )  # Retorna queryset vazio se não tiver grupos
        else:
            # Técnico vê apenas seus tickets usando ID
            queryset = queryset.filter(incident__resolved_by=user.id)

        # Aplicar filtros de busca - atualizado para usar ID também
        search = self.request.query_params.get("search", "")
        if search:
            queryset = queryset.filter(
                Q(incident__number__icontains=search)
                | Q(incident__resolved_by=search if search.isdigit() else None)
            )

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
