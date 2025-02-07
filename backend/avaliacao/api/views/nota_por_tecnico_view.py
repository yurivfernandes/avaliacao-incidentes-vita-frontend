from datetime import datetime, timedelta

from django.contrib.auth import get_user_model
from django.db.models import Case, Count, IntegerField, Sum, When
from django.db.models.functions import TruncMonth
from dw_analytics.models import AssignmentGroup
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ...models import Avaliacao
from ..serializers import DashboardSerializer


class NotaPorTecnicoView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DashboardSerializer

    def get(self, request, *args, **kwargs):
        data = self.get_dashboard_data()
        serializer = self.get_serializer(data)
        return Response(serializer.data)

    def get_dashboard_data(self):
        User = get_user_model()
        user = self.request.user

        # Base query com joins necessários
        queryset = (
            Avaliacao.objects.select_related("incident")
            .filter(incident__resolved_by__isnull=False)
            .filter(
                incident__closed_at__isnull=False
            )  # Garantir que tem data de fechamento
        )

        # Filtros de permissão
        if not user.is_staff:
            if user.is_gestor:
                user_groups = user.assignment_groups.values_list(
                    "id", flat=True
                )
                queryset = queryset.filter(
                    incident__assignment_group__in=user_groups
                )
            else:
                queryset = queryset.filter(incident__resolved_by=str(user.id))

        # Obtém datas dos parâmetros ou usa últimos 6 meses
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if not start_date or not end_date:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=180)
        else:
            start_date = datetime.strptime(start_date, "%Y-%m-%d")
            end_date = datetime.strptime(end_date, "%Y-%m-%d")

        queryset = queryset.filter(
            incident__closed_at__date__range=[start_date, end_date]
        )

        # Busca os grupos primeiro
        grupos = AssignmentGroup.objects.all()
        grupo_map = {str(g.id): g.dv_assignment_group for g in grupos}

        # Calcula as notas
        notas = (
            queryset.annotate(mes=TruncMonth("incident__closed_at"))
            .values(
                "incident__resolved_by",
                "mes",
                "incident__assignment_group",
            )
            .annotate(
                total_contrato_lancado=Sum(
                    Case(
                        When(is_contrato_lancado=True, then=1),
                        default=0,
                        output_field=IntegerField(),
                    )
                ),
                total_horas_lancadas=Sum(
                    Case(
                        When(is_horas_lancadas=True, then=1),
                        default=0,
                        output_field=IntegerField(),
                    )
                ),
                total_first_response=Sum(
                    Case(
                        When(is_has_met_first_response_target=True, then=1),
                        default=0,
                        output_field=IntegerField(),
                    )
                ),
                total_resolution=Sum(
                    Case(
                        When(is_resolution_target=True, then=1),
                        default=0,
                        output_field=IntegerField(),
                    )
                ),
                total_logs_correto=Sum(
                    Case(
                        When(is_atualizaca_logs_correto=True, then=1),
                        default=0,
                        output_field=IntegerField(),
                    )
                ),
                total_encerrado_corretamente=Sum(
                    Case(
                        When(is_ticket_encerrado_corretamente=True, then=1),
                        default=0,
                        output_field=IntegerField(),
                    )
                ),
                total_troubleshooting=Sum(
                    Case(
                        When(is_descricao_troubleshooting=True, then=1),
                        default=0,
                        output_field=IntegerField(),
                    )
                ),
                total_cliente_notificado=Sum(
                    Case(
                        When(is_cliente_notificado=True, then=1),
                        default=0,
                        output_field=IntegerField(),
                    )
                ),
                total_category=Sum(
                    Case(
                        When(is_category_correto=True, then=1),
                        default=0,
                        output_field=IntegerField(),
                    )
                ),
                total_avaliacoes=Count("id"),
            )
            .order_by(
                "mes", "incident__assignment_group", "incident__resolved_by"
            )
        )

        # Agrupa os resultados
        resultado_agrupado = {}
        for nota in notas:
            if not nota["incident__resolved_by"]:
                continue

            mes_ano = nota["mes"].strftime("%m/%Y")
            group_id = nota["incident__assignment_group"]

            # Cria chave composta para agrupar por mês e grupo
            chave = f"{mes_ano}_{group_id}"

            if chave not in resultado_agrupado:
                resultado_agrupado[chave] = {
                    "assignment_group_id": group_id,
                    "assignment_group_nome": grupo_map.get(
                        group_id, "Desconhecido"
                    ),
                    "mes": mes_ano,
                    "tecnicos": [],
                }

            tecnico = User.objects.filter(
                id=nota["incident__resolved_by"]
            ).first()
            if tecnico:
                total_pontos = (
                    nota["total_contrato_lancado"]
                    + nota["total_horas_lancadas"]
                    + nota["total_first_response"]
                    + nota["total_resolution"]
                    + nota["total_logs_correto"]
                    + nota["total_encerrado_corretamente"]
                    + nota["total_troubleshooting"]
                    + nota["total_cliente_notificado"]
                    + nota["total_category"]
                )
                total_possivel = nota["total_avaliacoes"] * 9

                percentual = (
                    round((total_pontos / total_possivel) * 100, 2)
                    if total_possivel > 0
                    else 0
                )

                # Calculate percentages for each item
                item_stats = {
                    "contrato_lancado": {
                        "nome": "Contrato Lançado",
                        "total": nota["total_contrato_lancado"],
                        "percentual": (
                            nota["total_contrato_lancado"]
                            / nota["total_avaliacoes"]
                            * 100
                        )
                        if nota["total_avaliacoes"] > 0
                        else 0,
                    },
                    "horas_lancadas": {
                        "nome": "Horas Lançadas",
                        "total": nota["total_horas_lancadas"],
                        "percentual": (
                            nota["total_horas_lancadas"]
                            / nota["total_avaliacoes"]
                            * 100
                        )
                        if nota["total_avaliacoes"] > 0
                        else 0,
                    },
                    "first_response": {
                        "nome": "Primeiro Atendimento",
                        "total": nota["total_first_response"],
                        "percentual": (
                            nota["total_first_response"]
                            / nota["total_avaliacoes"]
                            * 100
                        )
                        if nota["total_avaliacoes"] > 0
                        else 0,
                    },
                    "resolution": {
                        "nome": "Meta de Resolução",
                        "total": nota["total_resolution"],
                        "percentual": (
                            nota["total_resolution"]
                            / nota["total_avaliacoes"]
                            * 100
                        )
                        if nota["total_avaliacoes"] > 0
                        else 0,
                    },
                    "logs_correto": {
                        "nome": "Logs Corretos",
                        "total": nota["total_logs_correto"],
                        "percentual": (
                            nota["total_logs_correto"]
                            / nota["total_avaliacoes"]
                            * 100
                        )
                        if nota["total_avaliacoes"] > 0
                        else 0,
                    },
                    "encerrado_corretamente": {
                        "nome": "Ticket Encerrado Corretamente",
                        "total": nota["total_encerrado_corretamente"],
                        "percentual": (
                            nota["total_encerrado_corretamente"]
                            / nota["total_avaliacoes"]
                            * 100
                        )
                        if nota["total_avaliacoes"] > 0
                        else 0,
                    },
                    "troubleshooting": {
                        "nome": "Descrição Troubleshooting",
                        "total": nota["total_troubleshooting"],
                        "percentual": (
                            nota["total_troubleshooting"]
                            / nota["total_avaliacoes"]
                            * 100
                        )
                        if nota["total_avaliacoes"] > 0
                        else 0,
                    },
                    "cliente_notificado": {
                        "nome": "Cliente Notificado",
                        "total": nota["total_cliente_notificado"],
                        "percentual": (
                            nota["total_cliente_notificado"]
                            / nota["total_avaliacoes"]
                            * 100
                        )
                        if nota["total_avaliacoes"] > 0
                        else 0,
                    },
                    "category": {
                        "nome": "Categorização Correta",
                        "total": nota["total_category"],
                        "percentual": (
                            nota["total_category"]
                            / nota["total_avaliacoes"]
                            * 100
                        )
                        if nota["total_avaliacoes"] > 0
                        else 0,
                    },
                }

                # Verifica o percentual do mês anterior
                mes_anterior = (nota["mes"] - timedelta(days=30)).strftime(
                    "%m/%Y"
                )
                chave_anterior = f"{mes_anterior}_{group_id}"
                tendencia = self.calculate_tendency(
                    percentual, chave_anterior, resultado_agrupado, tecnico.id
                )

                resultado_agrupado[chave]["tecnicos"].append(
                    {
                        "tecnico_id": tecnico.id,
                        "tecnico_nome": f"{tecnico.first_name} {tecnico.last_name}".strip()
                        or tecnico.username,
                        "total_pontos": total_pontos,
                        "total_avaliacoes": nota["total_avaliacoes"],
                        "total_possivel": total_possivel,
                        "percentual": percentual,
                        "tendencia": tendencia,
                        "item_stats": item_stats,
                    }
                )

        # Calcula a média do percentual no período filtrado
        media_percentual = (
            sum(
                tecnico["percentual"]
                for grupo in resultado_agrupado.values()
                for tecnico in grupo["tecnicos"]
            )
            / sum(
                len(grupo["tecnicos"]) for grupo in resultado_agrupado.values()
            )
            if resultado_agrupado
            else 0
        )

        # Calcula o ranking dos técnicos (removendo duplicatas)
        tecnicos_dict = {}
        for grupo in resultado_agrupado.values():
            for tecnico in grupo["tecnicos"]:
                tecnico_id = tecnico["tecnico_id"]
                if (
                    tecnico_id not in tecnicos_dict
                    or tecnicos_dict[tecnico_id]["percentual"]
                    < tecnico["percentual"]
                ):
                    tecnicos_dict[tecnico_id] = tecnico

        ranking_tecnicos = sorted(
            tecnicos_dict.values(), key=lambda x: x["percentual"], reverse=True
        )

        # Calcula os itens avaliados com piores notas (consolidado)
        itens_piores_notas = {}
        total_tecnicos = {}

        for grupo in resultado_agrupado.values():
            for tecnico in grupo["tecnicos"]:
                for item_key, item_data in tecnico["item_stats"].items():
                    if item_key not in total_tecnicos:
                        total_tecnicos[item_key] = set()
                    if (
                        item_data["percentual"] < 70
                    ):  # Threshold para considerar como problema
                        if item_key not in itens_piores_notas:
                            itens_piores_notas[item_key] = set()
                        itens_piores_notas[item_key].add(tecnico["tecnico_id"])
                    total_tecnicos[item_key].add(tecnico["tecnico_id"])

        # Calcula o percentual de falha para cada item
        itens_piores_consolidado = {
            item_key: {
                "nome": next(
                    (
                        t["item_stats"][item_key]["nome"]
                        for g in resultado_agrupado.values()
                        for t in g["tecnicos"]
                        if item_key in t["item_stats"]
                    ),
                    item_key,
                ),
                "percentual": len(falhas) / len(total_tecnicos[item_key]) * 100
                if total_tecnicos[item_key]
                else 0,
                "tecnicos": [
                    tecnicos_dict[tecnico_id]
                    for tecnico_id in falhas
                    if tecnico_id in tecnicos_dict
                ],
            }
            for item_key, falhas in itens_piores_notas.items()
        }

        # Ordena e pega apenas o item mais crítico
        item_mais_critico = (
            sorted(
                itens_piores_consolidado.items(),
                key=lambda x: x[1]["percentual"],
                reverse=True,
            )[0]
            if itens_piores_consolidado
            else None
        )

        return {
            "resultado_agrupado": [
                {
                    **grupo,
                    "tecnicos": [
                        tecnico
                        for tecnico in grupo["tecnicos"]
                        if tecnico["tecnico_id"] in tecnicos_dict
                    ],
                }
                for grupo in resultado_agrupado.values()
            ],
            "media_percentual": media_percentual,
            "ranking_tecnicos": ranking_tecnicos,
            "item_mais_critico": item_mais_critico,
        }

    def calculate_tendency(
        self,
        current_percentual,
        chave_anterior,
        resultado_agrupado,
        tecnico_id,
    ):
        percentual_anterior = next(
            (
                t["percentual"]
                for t in resultado_agrupado.get(chave_anterior, {}).get(
                    "tecnicos", []
                )
                if t["tecnico_id"] == tecnico_id
            ),
            None,
        )

        if percentual_anterior is not None:
            if current_percentual > percentual_anterior:
                return "up"
            elif current_percentual < percentual_anterior:
                return "down"
        return "same"
