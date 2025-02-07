from access.models import User
from django.db.models import Q
from rest_framework import filters, generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..permissions import IsStaffOrGestor
from ..serializers import UserListSerializer


class UserListView(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated, IsStaffOrGestor]
    pagination_class = PageNumberPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ["username", "full_name"]

    def get_queryset(self):
        if self.request.user.is_tecnico:
            return User.objects.none()

        queryset = User.objects.exclude(id=self.request.user.id)
        search = self.request.query_params.get("search", "")

        if self.request.user.is_gestor and not self.request.user.is_staff:
            # Gestor só vê usuários que compartilham pelo menos uma fila com ele
            gestor_groups = self.request.user.assignment_groups.all()
            queryset = queryset.filter(
                assignment_groups__in=gestor_groups,
                is_staff=False,  # Gestor não pode ver usuários staff
            ).distinct()

        # Aplicar busca se houver termo de pesquisa
        if search:
            if self.request.user.is_staff:
                # Staff pode buscar em todos os campos
                queryset = queryset.filter(
                    Q(username__icontains=search)
                    | Q(full_name__icontains=search)
                    | Q(
                        assignment_groups__dv_assignment_group__icontains=search
                    )
                ).distinct()
            else:
                # Gestor só busca nos campos básicos
                queryset = queryset.filter(
                    Q(username__icontains=search)
                    | Q(full_name__icontains=search)
                ).distinct()

        return queryset.order_by("username")

    def get_paginated_response(self, data):
        assert self.paginator is not None
        return Response(
            {
                "count": self.paginator.page.paginator.count,
                "num_pages": self.paginator.page.paginator.num_pages,
                "next": self.paginator.get_next_link(),
                "previous": self.paginator.get_previous_link(),
                "results": data,
            }
        )
