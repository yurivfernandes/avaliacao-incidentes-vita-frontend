from access.models import User
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
    search_fields = ["username", "full_name", "empresa__nome", "fila__nome"]

    def get_queryset(self):
        queryset = User.objects.exclude(id=self.request.user.id)

        # Se for gestor, filtrar apenas usuários da mesma fila
        if self.request.user.is_gestor and not self.request.user.is_staff:
            queryset = queryset.filter(
                fila=self.request.user.fila,
                is_staff=False,  # Gestor não pode ver usuários staff
            )

        # Filtros
        empresa_id = self.request.query_params.get("empresa")
        fila_id = self.request.query_params.get("fila")
        is_staff = self.request.query_params.get("is_staff")
        is_gestor = self.request.query_params.get("is_gestor")
        is_tecnico = self.request.query_params.get("is_tecnico")

        if empresa_id:
            queryset = queryset.filter(empresa_id=empresa_id)
        if fila_id:
            queryset = queryset.filter(fila_id=fila_id)
        if is_staff is not None:
            queryset = queryset.filter(is_staff=is_staff.lower() == "true")
        if is_gestor is not None:
            queryset = queryset.filter(is_gestor=is_gestor.lower() == "true")
        if is_tecnico is not None:
            queryset = queryset.filter(is_tecnico=is_tecnico.lower() == "true")

        return queryset.order_by("username")
