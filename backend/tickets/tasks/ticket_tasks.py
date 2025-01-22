import random
from datetime import datetime

from celery import shared_task

from ..models import DAnalista, DSortedTicket, FTicket

TICKETS_POR_TECNICO = 3


class SorteioTicketsTask:
    """
    Classe responsável pelo sorteio de tickets para avaliação.
    Sorteia X tickets por analista, por fila e por data.
    """

    def __init__(self, data_sorteio: str):
        self.data = datetime.strptime(data_sorteio, "%Y-%m")

    def _get_tickets_analista(self, analista: DAnalista):
        """
        Obtém os tickets de um analista para o mês especificado,
        agrupados por fila e apenas tickets fechados.
        """
        return FTicket.objects.filter(
            analista=analista,
            data_fechamento__year=self.data.year,
            data_fechamento__month=self.data.month,
            data_fechamento__isnull=False,  # Garante que o ticket está fechado
        ).order_by("fila")  # Agrupa por fila

    def _sortear_tickets(self, tickets_por_fila):
        """
        Realiza o sorteio dos tickets por fila conforme quantidade definida.
        """
        tickets_sorteados = []
        for tickets in tickets_por_fila:
            if tickets.count() > TICKETS_POR_TECNICO:
                tickets_sorteados.extend(
                    random.sample(list(tickets), TICKETS_POR_TECNICO)
                )
            else:
                tickets_sorteados.extend(tickets)
        return tickets_sorteados

    def _salvar_tickets_sorteados(self, tickets, analista):
        """
        Salva os tickets sorteados no banco de dados.
        """
        mes_ano_fmt = self.data.strftime("%Y-%m")
        for ticket in tickets:
            DSortedTicket.objects.create(
                ticket=ticket,
                analista=analista,
                mes_ano=mes_ano_fmt,
            )

    def executar(self):
        """
        Executa o processo de sorteio para todos os analistas.
        """
        analistas = DAnalista.objects.all()

        for analista in analistas:
            tickets = self._get_tickets_analista(analista)
            # Agrupa tickets por fila
            tickets_por_fila = []
            for fila in set(tickets.values_list("fila", flat=True)):
                tickets_fila = tickets.filter(fila=fila)
                tickets_por_fila.append(tickets_fila)

            tickets_sorteados = self._sortear_tickets(tickets_por_fila)
            self._salvar_tickets_sorteados(tickets_sorteados, analista)

        return (
            f"Sorteio realizado com sucesso para {self.data.strftime('%Y-%m')}"
        )


@shared_task(
    name="receita.load_consolidacao_pandas",
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=5,
    retry_kwargs={"max_retries": 3},
)
def sortear_tickets_async(self, filtros: dict) -> dict:
    with SorteioTicketsTask(**filtros) as task:
        log = task.run()
    return log
