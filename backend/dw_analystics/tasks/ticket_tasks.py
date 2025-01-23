import random
from datetime import datetime

from celery import shared_task
from premissas.models import Premissas

from ..models import Incident, ResolvedBy, SortedTicket


class SorteioTicketsTask:
    """
    Classe responsável pelo sorteio de tickets para avaliação.
    Sorteia X tickets por analista, por fila e por data.
    """

    def __init__(self, data_sorteio: str):
        self.data = datetime.strptime(data_sorteio, "%Y-%m")
        self.mes_ano_fmt = self.data.strftime("%Y-%m")

    def _get_tickets_disponiveis(self, resolved_by, assignment_group):
        """
        Obtém os tickets disponíveis para sorteio de um técnico em uma fila específica
        """
        return (
            Incident.objects.filter(
                resolved_by=resolved_by,
                closed_at__year=self.data.year,
                closed_at__month=self.data.month,
                closed_at__isnull=False,
            )
            .exclude(sorted_tickets__mes_ano=self.mes_ano_fmt)
            .filter(resolved_by__assignment_group=assignment_group)
        )

    def _sortear_tickets(self, tickets_query, quantidade):
        """
        Sorteia uma quantidade específica de tickets
        """
        tickets_disponiveis = list(tickets_query)
        quantidade_real = min(len(tickets_disponiveis), quantidade)
        return (
            random.sample(tickets_disponiveis, quantidade_real)
            if quantidade_real > 0
            else []
        )

    def _salvar_tickets_sorteados(self, tickets):
        """
        Salva os tickets sorteados
        """
        sorted_tickets = [
            SortedTicket(incident=ticket, mes_ano=self.mes_ano_fmt)
            for ticket in tickets
        ]
        SortedTicket.objects.bulk_create(sorted_tickets)

    def executar(self):
        """
        Executa o processo de sorteio baseado nas premissas definidas
        """
        resumo_sorteio = []

        # Busca todas as premissas cadastradas
        premissas = Premissas.objects.all().select_related("assignment")

        for premissa in premissas:
            assignment_group = premissa.assignment
            qtd_tickets = premissa.qtd_incidents

            # Busca todos os técnicos da fila
            tecnicos = ResolvedBy.objects.filter(
                assignment_group=assignment_group
            )

            for tecnico in tecnicos:
                # Busca tickets disponíveis para o técnico na fila
                tickets_disponiveis = self._get_tickets_disponiveis(
                    tecnico, assignment_group
                )

                # Sorteia os tickets conforme quantidade definida na premissa
                tickets_sorteados = self._sortear_tickets(
                    tickets_disponiveis, qtd_tickets
                )

                if tickets_sorteados:
                    self._salvar_tickets_sorteados(tickets_sorteados)
                    resumo_sorteio.append(
                        f"Fila {assignment_group.dv_assignment_group} - "
                        f"Técnico {tecnico.dv_resolved_by}: "
                        f"{len(tickets_sorteados)} tickets sorteados"
                    )

        if not resumo_sorteio:
            return "Nenhum ticket encontrado para sorteio"

        return "\n".join(
            [
                f"Sorteio realizado com sucesso para {self.mes_ano_fmt}",
                "Resumo do sorteio:",
                *resumo_sorteio,
            ]
        )


@shared_task(
    name="sorteio.tickets",
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=5,
    retry_kwargs={"max_retries": 3},
)
def sortear_tickets_async(self, filtros: dict) -> dict:
    task = SorteioTicketsTask(filtros["data_sorteio"])
    return task.executar()
