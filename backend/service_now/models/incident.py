from django.db import models


class Incident(models.Model):
    sys_id = models.CharField(
        max_length=255,
        primary_key=True,
        help_text="ID único do incidente no ServiceNow",
    )
    number = models.CharField(
        max_length=255, null=True, help_text="Número do incidente"
    )
    sys_created_on = models.DateTimeField(
        null=True, help_text="Data e hora de criação do registro"
    )
    sys_updated_on = models.DateTimeField(
        null=True, help_text="Data e hora da última atualização"
    )
    opened_at = models.DateTimeField(
        null=True, help_text="Data e hora de abertura do incidente"
    )
    closed_at = models.DateTimeField(
        null=True, help_text="Data e hora de fechamento do incidente"
    )
    resolved_at = models.DateTimeField(
        null=True, help_text="Data e hora de resolução do incidente"
    )
    state = models.IntegerField(
        null=True, help_text="Status numérico do incidente"
    )
    dv_state = models.CharField(
        max_length=255, null=True, help_text="Descrição do status do incidente"
    )
    priority = models.IntegerField(
        null=True, help_text="Nível de prioridade numérico"
    )
    dv_priority = models.CharField(
        max_length=255, null=True, help_text="Descrição do nível de prioridade"
    )
    impact = models.IntegerField(
        null=True, help_text="Nível de impacto numérico"
    )
    dv_impact = models.CharField(
        max_length=255, null=True, help_text="Descrição do nível de impacto"
    )
    urgency = models.IntegerField(
        null=True, help_text="Nível de urgência numérico"
    )
    dv_urgency = models.CharField(
        max_length=255, null=True, help_text="Descrição do nível de urgência"
    )
    incident_state = models.IntegerField(
        null=True, help_text="Estado do incidente numérico"
    )
    dv_incident_state = models.CharField(
        max_length=255, null=True, help_text="Descrição do estado do incidente"
    )
    short_description = models.TextField(
        null=True, help_text="Descrição curta do incidente"
    )
    description = models.TextField(
        null=True, help_text="Descrição completa do incidente"
    )
    close_notes = models.TextField(
        null=True, help_text="Notas de fechamento do incidente"
    )
    assigned_to = models.CharField(
        max_length=255, null=True, help_text="ID do usuário designado"
    )
    dv_assigned_to = models.CharField(
        max_length=255, null=True, help_text="Nome do usuário designado"
    )
    assignment_group = models.CharField(
        max_length=255, null=True, help_text="ID do grupo designado"
    )
    dv_assignment_group = models.CharField(
        max_length=255, null=True, help_text="Nome do grupo designado"
    )
    u_tipo_incidente = models.CharField(
        max_length=255, null=True, help_text="Tipo de incidente"
    )
    u_tempo_indisponivel = models.DateTimeField(
        null=True, help_text="Tempo total de indisponibilidade"
    )
    u_tempo_expurgo = models.DateTimeField(
        null=True, help_text="Tempo de expurgo do incidente"
    )
    u_fim_indisponibilidade = models.DateTimeField(
        null=True, help_text="Data e hora do fim da indisponibilidade"
    )
    contract = models.CharField(
        max_length=255, null=True, help_text="ID do contrato"
    )
    dv_contract = models.CharField(
        max_length=255, null=True, help_text="Nome do contrato"
    )
    company = models.CharField(
        max_length=255, null=True, help_text="ID da empresa"
    )
    dv_company = models.CharField(
        max_length=255, null=True, help_text="Nome da empresa"
    )
    u_tipo_indisponibilidade = models.CharField(
        max_length=255, null=True, help_text="Tipo de indisponibilidade"
    )
    u_justificativa_isolamento = models.CharField(
        max_length=255, null=True, help_text="Justificativa de isolamento"
    )
    dv_u_categoria_falha = models.CharField(
        max_length=255, null=True, help_text="Descrição da categoria de falha"
    )
    dv_u_sub_categoria_da_falha = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição da subcategoria de falha",
    )
    dv_u_detalhe_sub_categoria_da_falha = models.CharField(
        max_length=255, null=True, help_text="Detalhe da subcategoria de falha"
    )
    u_origem = models.CharField(
        max_length=255, null=True, help_text="Origem do incidente"
    )
    dv_u_origem = models.CharField(
        max_length=255, null=True, help_text="Descrição da origem"
    )
    action_status = models.IntegerField(null=True, help_text="Status da ação")
    dv_action_status = models.CharField(
        max_length=255, null=True, help_text="Descrição do status da ação"
    )
    actions_taken = models.CharField(
        max_length=255, null=True, help_text="Ações tomadas"
    )
    active = models.BooleanField(
        null=True, help_text="Se o registro está ativo"
    )
    activity_due = models.DateTimeField(
        null=True, help_text="Data prevista para atividade"
    )
    additional_assignee_list = models.CharField(
        max_length=255, null=True, help_text="Lista de designados adicionais"
    )
    agile_story = models.CharField(
        max_length=255, null=True, help_text="História ágil relacionada"
    )
    dv_agile_story = models.CharField(
        max_length=255, null=True, help_text="Descrição da história ágil"
    )
    approval = models.CharField(
        max_length=255, null=True, help_text="Status de aprovação"
    )
    dv_approval = models.CharField(
        max_length=255, null=True, help_text="Descrição do status de aprovação"
    )
    approval_history = models.CharField(
        max_length=255, null=True, help_text="Histórico de aprovações"
    )
    approval_set = models.DateTimeField(
        null=True, help_text="Data de definição da aprovação"
    )

    class Meta:
        db_table = "incident"
