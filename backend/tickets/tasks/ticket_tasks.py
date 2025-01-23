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

    def __init__(self, data_sorteio: str, analista_id: int = None):
        self.data = datetime.strptime(data_sorteio, "%Y-%m")
        self.analista_id = analista_id

    def _get_tickets_analista(self, analista: DAnalista):
        """
        Obtém os tickets de um analista para o mês especificado,
        excluindo tickets já sorteados.
        """
        mes_ano_fmt = self.data.strftime("%Y-%m")
        return (
            FTicket.objects.filter(
                analista=analista,
                data_fechamento__year=self.data.year,
                data_fechamento__month=self.data.month,
                data_fechamento__isnull=False,
            )
            .exclude(sorted_tickets__mes_ano=mes_ano_fmt)
            .order_by("fila")
        )

    def _sortear_tickets_por_fila(self, tickets_query, fila):
        """
        Sorteia tickets específicos para uma fila.
        """
        tickets_fila = tickets_query.filter(fila=fila)
        quantidade = min(tickets_fila.count(), TICKETS_POR_TECNICO)
        if quantidade > 0:
            return random.sample(list(tickets_fila), quantidade)
        return []

    def _salvar_tickets_sorteados(self, tickets):
        """
        Salva os tickets sorteados no banco de dados.
        """
        mes_ano_fmt = self.data.strftime("%Y-%m")
        for ticket in tickets:
            DSortedTicket.objects.create(
                ticket=ticket,
                mes_ano=mes_ano_fmt,
            )

    def executar(self):
        """
        Executa o processo de sorteio para todos os analistas ou um específico.
        """
        if self.analista_id:
            analistas = DAnalista.objects.filter(id=self.analista_id)
        else:
            analistas = DAnalista.objects.all()

        resumo_sorteio = []

        for analista in analistas:
            tickets_disponiveis = self._get_tickets_analista(analista)
            tickets_sorteados = []

            # Processa cada fila do analista
            for fila in analista.filas.all():
                tickets_fila = self._sortear_tickets_por_fila(
                    tickets_disponiveis, fila
                )
                if tickets_fila:
                    tickets_sorteados.extend(tickets_fila)
                    resumo_sorteio.append(
                        f"Analista {analista.nome} - Fila {fila.nome}: "
                        f"{len(tickets_fila)} tickets sorteados"
                    )

            if tickets_sorteados:
                self._salvar_tickets_sorteados(tickets_sorteados)

        if not resumo_sorteio:
            return "Nenhum ticket encontrado para sorteio"

        return "\n".join(
            [
                f"Sorteio realizado com sucesso para {self.data.strftime('%Y-%m')}",
                "Resumo do sorteio:",
                *resumo_sorteio,
            ]
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
