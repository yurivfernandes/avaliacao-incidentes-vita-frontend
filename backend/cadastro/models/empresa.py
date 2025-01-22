from django.db import models


class Empresa(models.Model):
    nome = models.CharField(max_length=255)
    status = models.BooleanField(default=True)

    def __str__(self):
        return self.nome

    class Meta:
        db_table = "cadastro_empresa"
