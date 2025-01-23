from django.db import models


class AssignmentGroup(models.Model):
    dv_assignment_group = models.CharField(
        max_length=50,
        help_text="Nome da fila de atendimento",
    )

    def __str__(self):
        return self.dv_assignment_group

    class Meta:
        db_table = "d_assignment_group"
        verbose_name = "Assignment Group"
        verbose_name_plural = "Assignments Groups"
