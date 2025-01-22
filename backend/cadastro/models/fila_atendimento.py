from django.db import models

from .empresa import Empresa


class FilaAtendimento(models.Model):
    nome = models.CharField(max_length=255)
    status = models.BooleanField(default=True)
    empresa = models.ForeignKey(
        Empresa, on_delete=models.CASCADE, related_name="filas"
    )

    def __str__(self):
        return self.nome

    class Meta:
        db_table = "cadastro_fila_atendimento"
