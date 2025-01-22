from cadastro.models import FilaAtendimento
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from django.db import models

from .d_analista import DAnalista

User = get_user_model()


class FTicket(models.Model):
    ticket = models.CharField(
        max_length=50, unique=True, help_text="Número/identificador do ticket"
    )
    analista = models.ForeignKey(
        DAnalista, on_delete=models.PROTECT, related_name="tickets"
    )
    data_abertura = models.DateTimeField()
    data_fechamento = models.DateTimeField(null=True, blank=True)
    horas_lancadas = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Total de horas trabalhadas no ticket",
    )
    contrato = models.CharField(max_length=50, help_text="Nome do contrato")
    sla = models.DurationField(help_text="Tempo até o primeiro atendimento")
    has_branched = models.DurationField(help_text="Tempo até a resolução")

    def __str__(self):
        return f"Ticket {self.ticket}"

    class Meta:
        db_table = "f_tickets"
        verbose_name = "Ticket"
        verbose_name_plural = "Tickets"
