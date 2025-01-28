from django.db import models
from dw_analytics.models import AssignmentGroup


class Premissas(models.Model):
    assignment = models.ForeignKey(
        AssignmentGroup,
        on_delete=models.PROTECT,
        related_name="premissas",
        help_text="Assignment Group relacionado",
        unique=True,
    )
    qtd_incidents = models.IntegerField(
        help_text="Quantidade de incidentes a serem sorteados"
    )

    def __str__(self):
        return f"{self.assignment.dv_assignment_group} - {self.qtd_incidents} incidentes"

    class Meta:
        db_table = "d_premissas"
        verbose_name = "Premissa"
        verbose_name_plural = "Premissas"
