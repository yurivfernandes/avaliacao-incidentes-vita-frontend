from access.api.permissions.permissions import IsStaffOrGestor
from cadastro.api.serializers import FilaAtendimentoSerializer
from cadastro.models import FilaAtendimento
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView


class FilaAtendimentoListCreateView(APIView):
    permission_classes = [IsStaffOrGestor]

    def get(self, request):
        queryset = FilaAtendimento.objects.all()
        filter_backends = [SearchFilter, DjangoFilterBackend]
        search_fields = ["nome", "codigo", "status"]
        for backend in list(filter_backends):
            queryset = backend().filter_queryset(request, queryset, self)
        serializer = FilaAtendimentoSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FilaAtendimentoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FilaAtendimentoDetailView(APIView):
    permission_classes = [IsStaffOrGestor]

    def get_object(self, pk):
        try:
            return FilaAtendimento.objects.get(pk=pk)
        except FilaAtendimento.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        fila_atendimento = self.get_object(pk)
        serializer = FilaAtendimentoSerializer(fila_atendimento)
        return Response(serializer.data)

    def put(self, request, pk):
        fila_atendimento = self.get_object(pk)
        serializer = FilaAtendimentoSerializer(
            fila_atendimento, data=request.data
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        fila_atendimento = self.get_object(pk)
        fila_atendimento.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
