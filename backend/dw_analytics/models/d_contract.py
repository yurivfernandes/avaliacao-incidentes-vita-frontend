from django.db import models


class Contract(models.Model):
    id = models.CharField(
        max_length=255, primary_key=True, help_text="ID do Contrato"
    )
    dv_contract = models.CharField(
        max_length=150, help_text="Nome do Contrato"
    )

    class Meta:
        db_table = "d_contract"
