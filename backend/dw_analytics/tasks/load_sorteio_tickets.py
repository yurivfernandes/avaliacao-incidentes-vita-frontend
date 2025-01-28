import random
from datetime import datetime, timedelta
from typing import Dict, List

from celery import shared_task
from django.db import transaction
from premissas.models import Premissas

from ..models import Incident, ResolvedBy, SortedTicket


class SorteioIncidentsTask:
    """Classe responsável pelo sorteio de tickets para avaliação."""

    def __init__(self, data_sorteio: str = None):
        self.data = datetime.strptime(data_sorteio, "%Y-%m")
        self.mes_ano_fmt = self.data.strftime("%Y-%m")
        self.log = {
            "n_deleted": 0,
            "n_inserted": 0,
            "resumo_sorteio": [],
        }
        self.dataset = []

    def run(self) -> Dict:
        """Executa o processo completo de sorteio"""
        self.extract_and_transform_dataset()
        self.load()

        if not self.log["resumo_sorteio"]:
            return {"message": "Nenhum ticket encontrado para sorteio"}

        return {
            "message": f"Sorteio realizado com sucesso para {self.mes_ano_fmt}",
            "resumo": self.log["resumo_sorteio"],
            "estatisticas": {
                "deletados": self.log["n_deleted"],
                "inseridos": self.log["n_inserted"],
            },
        }

    def extract_and_transform_dataset(self) -> None:
        """Extrai e transforma os dados para o sorteio"""
        premissas = Premissas.objects.all().select_related("assignment")

        for premissa in premissas:
            tecnicos = ResolvedBy.objects.filter(
                assignment_group=premissa.assignment
            )

            for tecnico in tecnicos:
                tickets_disponiveis = self._get_tickets_disponiveis(
                    tecnico, premissa.assignment
                )
                tickets_disponiveis = list(tickets_disponiveis)

                # Realiza o sorteio
                quantidade_real = min(
                    len(tickets_disponiveis), premissa.qtd_incidents
                )
                if quantidade_real > 0:
                    tickets_sorteados = random.sample(
                        tickets_disponiveis, quantidade_real
                    )

                    # Adiciona ao dataset
                    self.dataset.extend(
                        [
                            {"incident": ticket, "mes_ano": self.mes_ano_fmt}
                            for ticket in tickets_sorteados
                        ]
                    )

                    # Adiciona ao log
                    self.log["resumo_sorteio"].append(
                        f"Fila {assignment_group.dv_assignment_group} - "
                        f"Técnico {tecnico.dv_resolved_by}: "
                        f"{len(tickets_sorteados)} tickets sorteados"
                    )

    def _get_tickets_disponiveis(
        self, resolved_by, assignment_group
    ) -> List[Incident]:
        """Obtém os tickets disponíveis para sorteio"""
        return (
            Incident.objects.filter(
                resolved_by=resolved_by,
                closed_at__year=self.data.year,
                closed_at__month=self.data.month,
                closed_at__isnull=False,
            )
            .exclude(
                sorted_tickets__mes_ano=self.mes_ano_fmt,
                company="VITA IT - SP",
            )
            .filter(
                resolved_by__assignment_group=assignment_group,
                u_origem="vita_it",
            )
        )

    @transaction.atomic
    def load(self) -> None:
        """Carrega os dados transformados"""
        self._delete()
        self._save()

    def _delete(self) -> None:
        """Remove os registros existentes do período"""
        n_deleted, _ = SortedTicket.objects.filter(
            mes_ano=self.mes_ano_fmt
        ).delete()
        self.log["n_deleted"] = n_deleted

    def _save(self) -> None:
        """Salva os novos registros sorteados"""
        if not self.dataset:
            return

        objs = [SortedTicket(**data) for data in self.dataset]
        created = SortedTicket.objects.bulk_create(objs=objs, batch_size=1000)
        self.log["n_inserted"] = len(created)


@shared_task(
    name="sorteio.tickets",
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=5,
    retry_kwargs={"max_retries": 3},
)
def load_sorteio_incidents_async(self, filtros: dict) -> dict:
    task = SorteioIncidentsTask(filtros["data_sorteio"])
    return task.run()
