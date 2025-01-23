from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ...tasks import SorteioTicketsTask, sortear_tickets_async


class SorteioTicketsView(APIView):
    """
    View para realizar o sorteio de tickets para avaliação.
    """

    def post(self, request):
        """
        Endpoint para iniciar o sorteio de tickets.
        Espera receber um parâmetro 'data' no formato YYYY-MM.
        """
        data = request.data.get("data")

        if not data:
            return Response(
                {"error": "Data é obrigatória (formato: YYYY-MM)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            task = sortear_tickets_async.delay({"data_sorteio": data})
            return Response(
                {
                    "message": "Sorteio iniciado com sucesso",
                    "task_id": task.id,
                },
                status=status.HTTP_202_ACCEPTED,
            )
        except Exception as e:
            return Response(
                {"error": f"Erro ao iniciar o sorteio: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
