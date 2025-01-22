from access.api.permissions import IsStaffOrGestor
from django.shortcuts import get_object_or_404
from rest_framework import status
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

    def get(self, request):
        queryset = FilaAtendimento.objects.all().order_by("nome")

        # Implementar paginação
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(queryset, request)

        serializer = FilaAtendimentoSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = FilaAtendimentoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FilaAtendimentoDetailView(APIView):
    permission_classes = [IsStaffOrGestor]

    def get(self, request, pk):
        fila = get_object_or_404(FilaAtendimento, pk=pk)
        serializer = FilaAtendimentoSerializer(fila)
        return Response(serializer.data)

    def patch(self, request, pk):
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
