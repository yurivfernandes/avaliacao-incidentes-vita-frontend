from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ...tasks import LoadAssignmentGroupTask


class LoadAssignmentGroupView(APIView):
    """
    View para carregar dados de assignment_group
    """

    def post(self, request):
        """
        Executa o carregamento dos dados de assignment_group

        Parâmetros:
            update_all (bool): Se True, busca todos os registros. Se False, busca apenas os últimos 10 dias.
        """
        update_all = request.data.get("update_all", False)

        result = LoadAssignmentGroupTask.execute(update_all)

        if result["status"] == "success":
            return Response(result, status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
