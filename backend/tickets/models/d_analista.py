from django.db import models

from .d_fila import DFila


class DAnalista(models.Model):
    nome = models.CharField(max_length=80)
    fila = models.ForeignKey(DFila, on_delete=models.PROTECT)

    def __str__(self):
        return f"{self.nome} - {self.fila}"

    class Meta:
        db_table = "d_analista"
        verbose_name = "Analista"
        verbose_name_plural = "Analistas"
