from django.db import models


class Company(models.Model):
    dv_company = models.CharField(max_length=50, help_text="Nome do Cliente")
    u_cnpj = models.CharField(
        max_length=14, null=True, blank=True, help_text="CNPJ do Cliente"
    )

    class Meta:
        db_table = "d_company"
