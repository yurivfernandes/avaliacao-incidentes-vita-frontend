from django.contrib.auth import get_user_model
from django.db import models
from dw_analytics.models import Incident


class Avaliacao(models.Model):
    incident = models.ForeignKey(
        Incident,
        on_delete=models.PROTECT,
        related_name="avaliacoes",
        help_text="Incidente avaliado",
    )
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.PROTECT,
        related_name="avaliacoes",
        help_text="Usuário que realizou a avaliação",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Data de criação do registro",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Data da última atualização",
    )
    is_contrato_lancado = models.BooleanField(
        default=False,
        help_text="Contrato foi lançado corretamente",
    )
    is_horas_lancadas = models.BooleanField(
        default=False,
        help_text="Horas foram lançadas corretamente",
    )
    is_has_met_first_response_target = models.BooleanField(
        default=False,
        help_text="Meta do primeiro atendimento foi atingida",
    )
    is_resolution_target = models.BooleanField(
        default=False,
        help_text="Meta de resolução foi atingida",
    )
    is_atualizaca_logs_correto = models.BooleanField(
        default=False,
        help_text="Logs foram atualizados corretamente",
    )
    is_ticket_encerrado_corretamente = models.BooleanField(
        default=False,
        help_text="Ticket foi encerrado corretamente",
    )
    is_descricao_troubleshooting = models.BooleanField(
        default=False,
        help_text="Descrição do troubleshooting está adequada",
    )
    is_cliente_notificado = models.BooleanField(
        default=False,
        help_text="Cliente foi notificado adequadamente",
    )
    is_category_correto = models.BooleanField(
        default=False,
        help_text="Categorização está correta",
    )

    @property
    def nota_total(self):
        campos_avaliados = [
            self.is_contrato_lancado,
            self.is_horas_lancadas,
            self.is_has_met_first_response_target,
            self.is_resolution_target,
            self.is_atualizaca_logs_correto,
            self.is_ticket_encerrado_corretamente,
            self.is_descricao_troubleshooting,
            self.is_cliente_notificado,
            self.is_category_correto,
        ]
        return sum(1 for campo in campos_avaliados if campo)

    def __str__(self):
        return f"Avaliação {self.incident.number}"

    class Meta:
        db_table = "f_avaliacao"
        verbose_name = "Avaliação"
        verbose_name_plural = "Avaliações"
