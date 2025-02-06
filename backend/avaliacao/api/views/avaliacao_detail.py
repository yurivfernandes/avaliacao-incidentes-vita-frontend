from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from ...models import Avaliacao
from ..serializers import AvaliacaoSerializer


class AvaliacaoDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AvaliacaoSerializer

    def get_queryset(self):
        queryset = Avaliacao.objects.select_related(
            "incident", "assignment_group", "user"
        )

        user = self.request.user

        if user.is_staff:
            return queryset
        elif user.is_gestor:
            return queryset.filter(
                assignment_group__in=user.assignment_groups.all()
            )
        else:
            return queryset.filter(user=user)

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)

        if not request.user.is_staff:
            if (
                request.user.is_gestor
                and obj.assignment_group
                not in request.user.assignment_groups.all()
            ):
                raise PermissionDenied(
                    "Você não tem permissão para acessar esta avaliação."
                )
            elif not request.user.is_gestor and obj.user != request.user:
                raise PermissionDenied(
                    "Você não tem permissão para acessar esta avaliação."
                )
