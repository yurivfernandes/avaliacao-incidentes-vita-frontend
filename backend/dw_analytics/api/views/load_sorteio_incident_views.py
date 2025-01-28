from datetime import datetime, timedelta

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ...tasks import SorteioIncidentsTask, load_sorteio_incidents_async


class SorteioIncidentsView(APIView):
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
            data = (datetime.now() - timedelta(days=30)).strftime("%Y-%m")

        try:
            SorteioIncidentsTask(data_sorteio=data).run()
            # task = load_sorteio_incidents_async.delay({"data_sorteio": data})
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
