from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ...tasks import LoadResolvedBy, load_resolved_by_async


class LoadResolvedByView(APIView):
    """
    View para carregar dados de resolved_by
    """

    def post(self, request):
        """
        Executa o carregamento dos dados de resolved_by

        Parâmetros:
            update_all (bool): Se True, busca todos os registros. Se False, busca apenas os últimos 10 dias.
        """
        update_all = request.data.get("update_all", False)

        LoadResolvedBy(update_all=update_all).run()

        # result = load_resolved_by_async.apply_async(
        #     kwargs={"update_all": update_all}
        # )

        if result.status == "SUCCESS":
            return Response(result.result, status=status.HTTP_200_OK)
        return Response(result.result, status=status.HTTP_400_BAD_REQUEST)
