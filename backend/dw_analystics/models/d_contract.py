from django.db import models


class Contract(models.Model):
    dv_contract = models.CharField(
        max_length=150, help_text="Nome do Contrato"
    )

    class Meta:
        db_table = "d_contract"
