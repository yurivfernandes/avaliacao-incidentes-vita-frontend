from datetime import datetime, timedelta

from django.db import transaction
from django.db.models import Q
from service_now.models import Incident

from ..models import AssignmentGroup, ResolvedBy


def load_resolved_by_async(update_all=False):
    """
    Carrega os dados de resolved_by e seus assignment groups da tabela de incidents.

    Args:
        update_all (bool): Se True, busca todos os registros. Se False, busca apenas os últimos 10 dias.
    """
    try:
        # Define o filtro de data
        date_filter = Q()
        if not update_all:
            last_10_days = datetime.now() - timedelta(days=10)
            date_filter = Q(resolved_at__gte=last_10_days)

        # Busca os resolved_by únicos com seus assignment groups
        resolved_by_data = (
            Incident.objects.filter(date_filter)
            .exclude(
                Q(resolved_by__isnull=True)
                | Q(dv_resolved_by__isnull=True)
                | Q(assignment_group__isnull=True)
                | Q(dv_assignment_group__isnull=True)
            )
            .values(
                "resolved_by",
                "dv_resolved_by",
                "assignment_group",
                "dv_assignment_group",
            )
            .distinct()
        )

        # Agrupa os dados por resolved_by
        resolved_by_groups = {}
        for item in resolved_by_data:
            rb_name = item["dv_resolved_by"]
            if rb_name not in resolved_by_groups:
                resolved_by_groups[rb_name] = {
                    "groups": set(),
                    "dv_groups": set(),
                }
            resolved_by_groups[rb_name]["groups"].add(item["assignment_group"])
            resolved_by_groups[rb_name]["dv_groups"].add(
                item["dv_assignment_group"]
            )

        total_updated = 0
        total_created = 0

        with transaction.atomic():
            # Primeiro, vamos limpar registros duplicados
            for rb_name in resolved_by_groups.keys():
                duplicates = ResolvedBy.objects.filter(
                    dv_resolved_by=rb_name
                ).order_by("id")

                if duplicates.count() > 1:
                    # Mantém o primeiro registro e remove os outros
                    primary = duplicates.first()
                    duplicates.exclude(id=primary.id).delete()

            # Agora processa cada resolved_by
            for rb_name, data in resolved_by_groups.items():
                # Busca ou cria o resolved_by
                resolved_by = ResolvedBy.objects.filter(
                    dv_resolved_by=rb_name
                ).first()

                if not resolved_by:
                    resolved_by = ResolvedBy.objects.create(
                        dv_resolved_by=rb_name
                    )
                    total_created += 1
                else:
                    total_updated += 1

                # Busca os assignment groups existentes
                assignment_groups = AssignmentGroup.objects.filter(
                    dv_assignment_group__in=data["dv_groups"]
                )

                # Adiciona os novos grupos ao resolved_by
                current_groups = set(
                    resolved_by.assignment_group.values_list(
                        "dv_assignment_group", flat=True
                    )
                )
                new_groups = set(
                    ag.dv_assignment_group for ag in assignment_groups
                )
                groups_to_add = new_groups - current_groups

                if groups_to_add:
                    groups_to_add_ids = AssignmentGroup.objects.filter(
                        dv_assignment_group__in=groups_to_add
                    ).values_list("id", flat=True)
                    resolved_by.assignment_group.add(*groups_to_add_ids)

        return {
            "status": "success",
            "message": (
                f"Dados atualizados com sucesso. "
                f"Criados: {total_created}, Atualizados: {total_updated}"
            ),
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Erro ao carregar resolved_by: {str(e)}",
        }


class LoadResolvedByTask:
    """Classe para gerenciar o carregamento de resolved_by"""

    @staticmethod
    def execute(update_all=False):
        """
        Executa o carregamento dos dados de resolved_by

        Args:
            update_all (bool): Se True, busca todos os registros. Se False, busca apenas os últimos 10 dias.
        """
        return load_resolved_by_async(update_all)
