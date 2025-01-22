from access.api.permissions import IsStaffOrGestor
from django.shortcuts import get_object_or_404
from rest_framework import filters, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from ...models import FilaAtendimento
from ..serializers import FilaAtendimentoSerializer


class FilaAtendimentoPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class FilaAtendimentoListCreateView(APIView):
    permission_classes = [IsStaffOrGestor]
    pagination_class = FilaAtendimentoPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ["nome", "empresa__nome"]

    def get(self, request):
        if request.user.is_staff:
            queryset = FilaAtendimento.objects.all()
        elif request.user.is_gestor:
            # Buscar filas associadas ao gestor
            queryset = request.user.filas.all()
        else:
            queryset = FilaAtendimento.objects.none()

        queryset = queryset.order_by("nome")

        # Aplicar busca se houver termo de pesquisa
        search = request.query_params.get("search", "")
        if search:
            queryset = queryset.filter(
                models.Q(nome__icontains=search)
                | models.Q(empresa__nome__icontains=search)
            )

        # Implementar paginação
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        serializer = FilaAtendimentoSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        if not request.user.is_staff:
            return Response(
                {"detail": "Apenas administradores podem criar filas."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = FilaAtendimentoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FilaAtendimentoDetailView(APIView):
    permission_classes = [IsStaffOrGestor]

    def get(self, request, pk):
        fila = get_object_or_404(FilaAtendimento, pk=pk)

        # Verificar se o usuário tem acesso a esta fila
        if not request.user.is_staff and fila not in request.user.filas.all():
            return Response(
                {"detail": "Você não tem permissão para acessar esta fila."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = FilaAtendimentoSerializer(fila)
        return Response(serializer.data)

    def patch(self, request, pk):
        if not request.user.is_staff:
            return Response(
                {"detail": "Apenas administradores podem editar filas."},
                status=status.HTTP_403_FORBIDDEN,
            )
        fila = get_object_or_404(FilaAtendimento, pk=pk)
        serializer = FilaAtendimentoSerializer(
            fila, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        fila = get_object_or_404(FilaAtendimento, pk=pk)
        fila.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
