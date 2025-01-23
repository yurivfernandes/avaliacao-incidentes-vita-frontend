from django.contrib.auth import get_user_model
from django.db import models

from .d_contract import Contract
from .d_resolved_by import ResolvedBy

User = get_user_model()


class Incident(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=50,
        help_text="Número do chamado no ServiceNow",
    )
    resolved_by = models.ForeignKey(
        ResolvedBy,
        on_delete=models.PROTECT,
        related_name="incidents",
        help_text="ID Do analista",
    )
    opened_at = models.DateTimeField(
        help_text="Data da Abertura do Ticket",
    )
    closed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Data do fechamento do ticket",
    )
    contract = models.ForeignKey(
        Contract,
        on_delete=models.PROTECT,
        related_name="incidents",
        help_text="ID Do Contrato",
    )
    sla_atendimento = models.BooleanField(
        help_text="Identifica se o SLA de atendimento foi atendido."
    )
    sla_resolucao = models.BooleanField(
        help_text="Identifica se o SLA de resolução foi atendido."
    )
    company = models.CharField(
        max_length=150,
        help_text="ID Do Cliente",
    )
    u_origem = models.CharField(
        max_length=150,
        help_text="Torre de atendimento",
    )
    dv_u_categoria_falha = models.CharField(
        max_length=150,
        help_text="Categoria da falha",
    )
    dv_u_sub_categoria_da_falha = models.CharField(
        max_length=150,
        help_text="Sub Categoria da falha",
    )
    dv_u_detalhe_sub_categoria_da_falha = models.CharField(
        max_length=150,
        help_text="Detalhe da SubCategoria da flaha.",
    )

    def __str__(self):
        return f"Incident {self.pk}"

    class Meta:
        db_table = "f_incident"
        verbose_name = "Incident"
        verbose_name_plural = "Incidents"
