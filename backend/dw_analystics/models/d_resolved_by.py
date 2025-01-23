from django.db import models

from .d_assignment_group import AssignmentGroup


class ResolvedBy(models.Model):
    dv_resolved_by = models.CharField(
        max_length=80, help_text="Nome do Analista"
    )
    assignment_group = models.ManyToManyField(
        AssignmentGroup,
        related_name="resolved_by",
        verbose_name="Assignment Group",
        help_text="Filas que o analista atende",
    )

    def __str__(self):
        filas = ", ".join(
            [fila.dv_assignment_group for fila in self.assignment_group.all()]
        )
        return f"{self.dv_resolved_by} - [{filas}]"

    class Meta:
        db_table = "d_resolved_by"
        verbose_name = "Resolved BY"
        verbose_name_plural = "Resolved BY"
