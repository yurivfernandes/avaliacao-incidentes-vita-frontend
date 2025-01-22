from django.db import models


class DFila(models.Model):
    nome = models.CharField(max_length=50)

    def __str__(self):
        return self.nome

    class Meta:
        db_table = "d_fila"
        verbose_name = "Fila"
        verbose_name_plural = "Filas"
