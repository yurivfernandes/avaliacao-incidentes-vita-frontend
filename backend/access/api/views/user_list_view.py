from access.models import User
from django.db.models import Q
from rest_framework import filters, generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from ..permissions import IsStaffOrGestor
from ..serializers import UserListSerializer


class UserListView(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated, IsStaffOrGestor]
    pagination_class = PageNumberPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ["username", "full_name"]

    def get_queryset(self):
        queryset = User.objects.exclude(id=self.request.user.id)
        search = self.request.query_params.get("search", "")

        # Se for gestor, filtrar apenas usuários das suas filas
        if self.request.user.is_gestor and not self.request.user.is_staff:
            gestor_filas = self.request.user.filas.all()
            queryset = queryset.filter(
                filas__in=gestor_filas,
                is_staff=False,  # Gestor não pode ver usuários staff
            ).distinct()

            if search:
                queryset = queryset.filter(
                    Q(username__icontains=search)
                    | Q(full_name__icontains=search)
                )
        else:
            # Para staff, permite busca em todos os campos
            if search:
                queryset = queryset.filter(
                    Q(username__icontains=search)
                    | Q(full_name__icontains=search)
                    | Q(filas__nome__icontains=search)
                    | Q(filas__empresa__nome__icontains=search)
                ).distinct()

        return queryset.order_by("username")
