from django.contrib.auth import get_user_model
from django.db import models

from .d_assignment_group import AssignmentGroup
from .d_contract import Contract
from .d_resolved_by import ResolvedBy


class Incident(models.Model):
    number = models.CharField(
        unique=True,
        max_length=255,
        help_text="Número do chamado no ServiceNow",
    )
    resolved_by_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="ID Do analista",
    )
    assignment_group_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Grupo de atendimento",
    )
    opened_at = models.DateTimeField(
        help_text="Data da Abertura do Ticket",
    )
    closed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Data do fechamento do ticket",
    )
    contract_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="ID Do Contrato",
    )
    sla_atendimento = models.BooleanField(
        null=True,
        blank=True,
        help_text="Identifica se o SLA de atendimento foi atendido.",
    )
    sla_resolucao = models.BooleanField(
        null=True,
        blank=True,
        help_text="Identifica se o SLA de resolução foi atendido.",
    )
    company = models.CharField(
        null=True,
        blank=True,
        max_length=255,
        help_text="ID Do Cliente",
    )
    u_origem = models.CharField(
        null=True,
        blank=True,
        max_length=255,
        help_text="Torre de atendimento",
    )
    dv_u_categoria_da_falha = models.CharField(
        null=True,
        blank=True,
        max_length=255,
        help_text="Categoria da falha",
    )
    dv_u_sub_categoria_da_falha = models.CharField(
        null=True,
        blank=True,
        max_length=255,
        help_text="Sub Categoria da falha",
    )
    dv_u_detalhe_sub_categoria_da_falha = models.CharField(
        null=True,
        blank=True,
        max_length=255,
        help_text="Detalhe da SubCategoria da falha",
    )

    def __str__(self):
        return f"Incident {self.pk}"

    class Meta:
        db_table = "f_incident"
        verbose_name = "Incident"
        verbose_name_plural = "Incidents"
