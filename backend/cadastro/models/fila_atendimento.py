from django.db import models


class FilaAtendimento(models.Model):
    nome = models.CharField(max_length=255)
    codigo = models.CharField(max_length=50)
    status = models.BooleanField(default=True)

    def __str__(self):
        return self.nome

    class Meta:
        db_table = "cadastro_fila_atendimento"
