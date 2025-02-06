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
    resolved_by = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="ID Do analista",
    )
    assignment_group = models.CharField(
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
    contract = models.CharField(
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

    @property
    def resolved_by_name(self):
        try:
            resolved_by = ResolvedBy.objects.get(id=self.resolved_by)
            return resolved_by.dv_resolved_by
        except ResolvedBy.DoesNotExist:
            return self.resolved_by

    @property
    def assignment_group_name(self):
        try:
            group = AssignmentGroup.objects.get(id=self.assignment_group)
            return group.dv_assignment_group
        except AssignmentGroup.DoesNotExist:
            return self.assignment_group

    @property
    def contract_name(self):
        try:
            contract = Contract.objects.get(id=self.contract)
            return contract.dv_contract
        except Contract.DoesNotExist:
            return self.contract

    def __str__(self):
        return f"Incident {self.pk}"

    class Meta:
        db_table = "f_incident"
        verbose_name = "Incident"
        verbose_name_plural = "Incidents"
