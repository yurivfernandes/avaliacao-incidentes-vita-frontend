from django.core.validators import RegexValidator
from django.db import models

from .f_incident import Incident


class SortedTicket(models.Model):
    incident = models.ForeignKey(
        Incident,
        on_delete=models.CASCADE,
        related_name="sorted_tickets",
        help_text="ID Do incidente",
    )
    mes_ano = models.CharField(
        max_length=7,
        validators=[
            RegexValidator(
                regex=r"^\d{4}-(?:0[1-9]|1[0-2])$",
                message="O formato deve ser YYYY-MM",
            )
        ],
        help_text="Data do sorteio do ticket para controle. Relacionada à data do fechamento do incidente. Formato: YYYY-MM",
    )

    class Meta:
        db_table = "d_sorted_ticket"
        verbose_name = "Ticket Sorteado"
        verbose_name_plural = "Tickets Sorteados"

    def __str__(self):
        return f"{self.incident.pk} - {self.mes_ano}"
