from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from ...models import Avaliacao
from ..serializers import AvaliacaoSerializer


class AvaliacaoDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AvaliacaoSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Avaliacao.objects.select_related("incident", "user")

        if user.is_staff:
            return queryset
        elif user.is_gestor:
            # Corrigido para usar todos os grupos do gestor
            assignment_groups = user.assignment_groups.all()
            return queryset.filter(
                incident__assignment_group__in=assignment_groups
            )
        else:
            return queryset.filter(incident__resolved_by=user.id)

    def check_object_permissions(self, request, obj):
        # Apenas staff e gestor podem editar
        if request.method in ["PUT", "PATCH"] and not (
            request.user.is_staff or request.user.is_gestor
        ):
            raise PermissionDenied(
                "Você não tem permissão para editar avaliações."
            )

        if not request.user.is_staff:
            if request.user.is_gestor:
                # Corrigido para verificar se o grupo pertence aos grupos do gestor
                if (
                    obj.incident.assignment_group
                    not in request.user.assignment_groups.all()
                ):
                    raise PermissionDenied(
                        "Você não tem permissão para acessar esta avaliação."
                    )
            elif obj.incident.resolved_by != str(request.user.id):
                raise PermissionDenied(
                    "Você não tem permissão para acessar esta avaliação."
                )
