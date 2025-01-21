from access.models import User
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from ..permissions import IsStaffOrGestor
from ..serializers import UserListSerializer


class UserListView(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated, IsStaffOrGestor]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        # Excluir o usuário atual da query
        queryset = User.objects.exclude(id=self.request.user.id).order_by(
            "username"
        )

        # Aplicar filtros
        is_staff = self.request.query_params.get("is_staff", None)
        is_gestor = self.request.query_params.get("is_gestor", None)
        is_tecnico = self.request.query_params.get("is_tecnico", None)

        if is_staff is not None:
            queryset = queryset.filter(is_staff=is_staff.lower() == "true")
        if is_gestor is not None:
            queryset = queryset.filter(is_gestor=is_gestor.lower() == "true")
        if is_tecnico is not None:
            queryset = queryset.filter(is_tecnico=is_tecnico.lower() == "true")

        return queryset
