from django.db import models

from .d_fila import DFila


class DAnalista(models.Model):
    nome = models.CharField(max_length=80)
    filas = models.ManyToManyField(
        DFila, related_name="analistas", verbose_name="Filas"
    )

    def __str__(self):
        filas = ", ".join([fila.nome for fila in self.filas.all()])
        return f"{self.nome} - [{filas}]"

    class Meta:
        db_table = "d_analista"
        verbose_name = "Analista"
        verbose_name_plural = "Analistas"
