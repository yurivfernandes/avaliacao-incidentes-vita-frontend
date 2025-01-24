from django.core.paginator import Paginator
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ...models import AssignmentGroup
from ..serializers import AssignmentGroupSerializer


class AssignmentGroupListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        page_number = request.query_params.get("page", 1)
        search_term = request.query_params.get("search", "")
        assignment_groups = AssignmentGroup.objects.filter(
            dv_assignment_group__icontains=search_term
        )
        paginator = Paginator(assignment_groups, 10)
        page_obj = paginator.get_page(page_number)
        serializer = AssignmentGroupSerializer(page_obj, many=True)
        return Response(
            {"results": serializer.data, "num_pages": paginator.num_pages}
        )

    def patch(self, request, pk):
        # Verificar se o usuário é staff
        if not request.user.is_staff:
            return Response(
                {
                    "error": "Apenas administradores podem editar assignment groups"
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            assignment_group = AssignmentGroup.objects.get(pk=pk)
            serializer = AssignmentGroupSerializer(
                assignment_group, data=request.data, partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )
        except AssignmentGroup.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
