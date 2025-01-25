from django.db import models


class IncidentSLA(models.Model):
    sys_id = models.CharField(
        max_length=255,
        primary_key=True,
        help_text="ID único do registro SLA no ServiceNow",
    )
    task = models.CharField(
        max_length=255, null=True, help_text="ID da tarefa relacionada"
    )
    dv_task = models.CharField(
        max_length=255, null=True, help_text="Descrição da tarefa relacionada"
    )
    sla = models.CharField(
        max_length=255, null=True, help_text="ID do acordo SLA"
    )
    dv_sla = models.CharField(
        max_length=255, null=True, help_text="Descrição do acordo SLA"
    )
    stage = models.CharField(
        max_length=255, null=True, help_text="Estágio atual do SLA"
    )
    dv_stage = models.CharField(
        max_length=255, null=True, help_text="Descrição do estágio do SLA"
    )
    business_duration = models.DateTimeField(
        null=True, help_text="Duração em horário comercial"
    )
    dv_business_duration = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição da duração em horário comercial",
    )
    start_time = models.DateTimeField(
        null=True, help_text="Data e hora de início"
    )
    end_time = models.DateTimeField(null=True, help_text="Hora de término")
    business_percentage = models.DecimalField(
        max_digits=18,
        decimal_places=0,
        null=True,
        help_text="Percentual de conclusão em horário comercial",
    )
    has_breached = models.BooleanField(
        null=True, help_text="Se o SLA foi violado"
    )
    active = models.BooleanField(null=True, help_text="Se o SLA está ativo")
    sys_created_on = models.DateTimeField(
        null=True, help_text="Data e hora de criação do registro"
    )
    sys_updated_on = models.DateTimeField(
        null=True, help_text="Data e hora da última atualização"
    )

    business_pause_duration = models.DateTimeField(
        null=True, help_text="Duração da pausa em horário comercial"
    )
    dv_business_pause_duration = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição da duração da pausa comercial",
    )
    business_time_left = models.DateTimeField(
        null=True, help_text="Tempo restante em horário comercial"
    )
    dv_business_time_left = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do tempo restante comercial",
    )
    duration = models.DateTimeField(null=True, help_text="Duração total")
    dv_duration = models.CharField(
        max_length=255, null=True, help_text="Descrição da duração total"
    )
    original_breach_time = models.DateTimeField(
        null=True, help_text="Tempo original de violação"
    )
    pause_duration = models.DateTimeField(
        null=True, help_text="Duração da pausa"
    )
    dv_pause_duration = models.CharField(
        max_length=255, null=True, help_text="Descrição da duração da pausa"
    )
    pause_time = models.DateTimeField(null=True, help_text="Momento da pausa")
    planned_end_time = models.DateTimeField(
        null=True, help_text="Tempo planejado para término"
    )
    timezone = models.CharField(
        max_length=255, null=True, help_text="Fuso horário"
    )
    dv_timezone = models.CharField(
        max_length=255, null=True, help_text="Descrição do fuso horário"
    )
    percentage = models.DecimalField(
        max_digits=18,
        decimal_places=0,
        null=True,
        help_text="Percentual de conclusão",
    )
    schedule = models.CharField(
        max_length=255, null=True, help_text="Horário agendado"
    )
    dv_schedule = models.CharField(
        max_length=255, null=True, help_text="Descrição do horário agendado"
    )
    sys_created_by = models.CharField(
        max_length=255, null=True, help_text="Criado por"
    )
    sys_mod_count = models.IntegerField(
        null=True, help_text="Contagem de modificações"
    )
    sys_tags = models.CharField(
        max_length=255, null=True, help_text="Tags do sistema"
    )
    sys_updated_by = models.CharField(
        max_length=255, null=True, help_text="Atualizado por"
    )
    time_left = models.DateTimeField(null=True, help_text="Tempo restante")
    dv_time_left = models.CharField(
        max_length=255, null=True, help_text="Descrição do tempo restante"
    )

    class Meta:
        db_table = "incident_sla"
