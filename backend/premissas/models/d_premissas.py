from django.db import models
from dw_analytics.models import AssignmentGroup


class Premissas(models.Model):
    assignment = models.OneToOneField(
        AssignmentGroup,
        on_delete=models.PROTECT,
        related_name="premissas",
        help_text="Assignment Group relacionado",
    )
    qtd_incidents = models.IntegerField(
        help_text="Quantidade de incidentes a serem sorteados"
    )
    is_contrato_lancado = models.BooleanField(
        default=True, null=False, blank=False
    )
    is_horas_lancadas = models.BooleanField(
        default=True, null=False, blank=False
    )
    is_has_met_first_response_target = models.BooleanField(
        default=True, null=False, blank=False
    )
    is_resolution_target = models.BooleanField(
        default=True, null=False, blank=False
    )
    is_atualizaca_logs_correto = models.BooleanField(
        default=True, null=False, blank=False
    )
    is_ticket_encerrado_corretamente = models.BooleanField(
        default=True, null=False, blank=False
    )
    is_descricao_troubleshooting = models.BooleanField(
        default=True, null=False, blank=False
    )
    is_cliente_notificado = models.BooleanField(
        default=True, null=False, blank=False
    )
    is_category_correto = models.BooleanField(
        default=True, null=False, blank=False
    )

    def __str__(self):
        return f"{self.assignment.dv_assignment_group} - {self.qtd_incidents} incidentes"

    class Meta:
        db_table = "d_premissas"
        verbose_name = "Premissa"
        verbose_name_plural = "Premissas"
