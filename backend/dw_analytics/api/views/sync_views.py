from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ...tasks import sync_service_now_data


class SyncServiceNowView(APIView):
    """
    View para sincronizar dados do ServiceNow para o DW Analytics.
    """

    def post(self, request):
        """
        Endpoint para iniciar a sincronização dos dados do ServiceNow.
        """
        try:
            full_sync = request.data.get("full_sync", False)
            task = sync_service_now_data.delay(full_sync=full_sync)

            return Response(
                {
                    "message": "Sincronização iniciada com sucesso",
                    "task_id": task.id,
                    "sync_type": "completa" if full_sync else "parcial",
                },
                status=status.HTTP_202_ACCEPTED,
            )
        except Exception as e:
            return Response(
                {"error": f"Erro ao iniciar a sincronização: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
