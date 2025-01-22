from django.db import models

from .fila_atendimento import FilaAtendimento


class TipoCriterio(models.TextChoices):
    BOOLEAN = "B", "Booleano (Verdadeiro/Falso)"
    RANGE = "R", "Faixa de Valores"
    CALC = "C", "Calculado"


class OrigemDado(models.TextChoices):
    SISTEMA = "S", "Sistema"
    MANUAL = "M", "Manual"


class Criterio(models.Model):
    fila_atendimento = models.ForeignKey(
        FilaAtendimento, on_delete=models.CASCADE, related_name="criterios"
    )
    nome = models.CharField(max_length=100)
    tipo = models.CharField(
        max_length=1,
        choices=TipoCriterio.choices,
        default=TipoCriterio.BOOLEAN,
    )
    valor_minimo = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    valor_maximo = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    origem_dado = models.CharField(
        max_length=1,
        choices=OrigemDado.choices,
        default=OrigemDado.MANUAL,
        help_text="Define se o critério será avaliado automaticamente ou manualmente",
    )
    campo_referencia = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Campo do sistema usado para cálculo automático",
    )
    formula_calculo = models.TextField(
        null=True,
        blank=True,
        help_text="Fórmula para cálculo do critério (quando aplicável)",
    )
    peso = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=1.0,
        help_text="Peso do critério na avaliação final",
    )

    def __str__(self):
        return f"{self.nome} - {self.get_tipo_display()}"

    class Meta:
        db_table = "cadastro_criterios"
        verbose_name = "Critério"
        verbose_name_plural = "Critérios"
