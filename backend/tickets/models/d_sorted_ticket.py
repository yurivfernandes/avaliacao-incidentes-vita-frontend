from django.core.validators import RegexValidator
from django.db import models

from .d_analista import DAnalista
from .f_tickets import FTicket


class DSortedTicket(models.Model):
    ticket = models.ForeignKey(
        FTicket, on_delete=models.CASCADE, related_name="sorted_tickets"
    )
    analista = models.ForeignKey(
        DAnalista, on_delete=models.CASCADE, related_name="sorted_tickets"
    )
    mes_ano = models.CharField(
        max_length=7,
        validators=[
            RegexValidator(
                regex=r"^\d{4}-(?:0[1-9]|1[0-2])$",
                message="O formato deve ser YYYY-MM",
            )
        ],
        help_text="Formato: YYYY-MM",
    )

    class Meta:
        db_table = "d_sorted_tickets"
        verbose_name = "Ticket Sorteado"
        verbose_name_plural = "Tickets Sorteados"

    def __str__(self):
        return f"{self.ticket.ticket} - {self.mes_ano}"
