from access.api.permissions import IsStaffOrGestor
from django.shortcuts import get_object_or_404
from rest_framework import filters, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from ...models import Empresa
from ..serializers import EmpresaSerializer


class EmpresaPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class EmpresaListCreateView(APIView):
    permission_classes = [IsStaffOrGestor]
    pagination_class = EmpresaPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ["nome"]

    def get(self, request):
        if request.user.is_staff:
            queryset = Empresa.objects.all()
        elif request.user.is_gestor:
            # Buscar empresas associadas às filas do gestor
            queryset = Empresa.objects.filter(
                filaatendimento__in=request.user.filas.all()
            ).distinct()
        else:
            queryset = Empresa.objects.none()

        queryset = queryset.order_by("nome")

        # Aplicar busca se houver termo de pesquisa
        search = request.query_params.get("search", "")
        if search:
            queryset = queryset.filter(nome__icontains=search)

        # Implementar paginação
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        serializer = EmpresaSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        if not request.user.is_staff:
            return Response(
                {"detail": "Apenas administradores podem criar empresas."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = EmpresaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmpresaDetailView(APIView):
    permission_classes = [IsStaffOrGestor]

    def get(self, request, pk):
        empresa = get_object_or_404(Empresa, pk=pk)
        serializer = EmpresaSerializer(empresa)
        return Response(serializer.data)

    def patch(self, request, pk):
        empresa = get_object_or_404(Empresa, pk=pk)
        serializer = EmpresaSerializer(
            empresa, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        empresa = get_object_or_404(Empresa, pk=pk)
        empresa.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
