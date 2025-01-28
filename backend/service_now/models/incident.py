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
    dv_u_categoria_da_falha = models.CharField(
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
    business_duration = models.DateTimeField(
        null=True, help_text="Duração em horário comercial"
    )
    dv_business_duration = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição da duração em horário comercial",
    )
    business_impact = models.CharField(
        max_length=255, null=True, help_text="Impacto comercial"
    )
    business_service = models.CharField(
        max_length=255, null=True, help_text="Serviço comercial"
    )
    dv_business_service = models.CharField(
        max_length=255, null=True, help_text="Descrição do serviço comercial"
    )
    business_stc = models.IntegerField(null=True, help_text="STC comercial")
    calendar_duration = models.DateTimeField(
        null=True, help_text="Duração do calendário"
    )
    dv_calendar_duration = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição da duração do calendário",
    )
    calendar_stc = models.IntegerField(
        null=True, help_text="STC do calendário"
    )
    caller_id = models.CharField(
        max_length=255, null=True, help_text="ID do chamador"
    )
    dv_caller_id = models.CharField(
        max_length=255, null=True, help_text="Descrição do chamador"
    )
    category = models.CharField(
        max_length=255, null=True, help_text="Categoria"
    )
    dv_category = models.CharField(
        max_length=255, null=True, help_text="Descrição da categoria"
    )
    cause = models.CharField(max_length=255, null=True, help_text="Causa")
    caused_by = models.CharField(
        max_length=255, null=True, help_text="Causado por"
    )
    dv_caused_by = models.CharField(
        max_length=255, null=True, help_text="Descrição do causador"
    )
    child_incidents = models.IntegerField(
        null=True, help_text="Incidentes filhos"
    )
    close_code = models.CharField(
        max_length=255, null=True, help_text="Código de fechamento"
    )
    dv_close_code = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do código de fechamento",
    )
    closed_by = models.CharField(
        max_length=255, null=True, help_text="Fechado por"
    )
    dv_closed_by = models.CharField(
        max_length=255, null=True, help_text="Descrição de quem fechou"
    )
    cmdb_ci = models.CharField(
        max_length=255, null=True, help_text="CI do CMDB"
    )
    dv_cmdb_ci = models.CharField(
        max_length=255, null=True, help_text="Descrição do CI do CMDB"
    )
    comments = models.CharField(
        max_length=255, null=True, help_text="Comentários"
    )
    comments_and_work_notes = models.CharField(
        max_length=255, null=True, help_text="Comentários e notas de trabalho"
    )
    contact_type = models.CharField(
        max_length=255, null=True, help_text="Tipo de contato"
    )
    dv_contact_type = models.CharField(
        max_length=255, null=True, help_text="Descrição do tipo de contato"
    )
    correlation_display = models.CharField(
        max_length=255, null=True, help_text="Exibição de correlação"
    )
    correlation_id = models.CharField(
        max_length=255, null=True, help_text="ID de correlação"
    )
    delivery_plan = models.CharField(
        max_length=255, null=True, help_text="Plano de entrega"
    )
    dv_delivery_plan = models.CharField(
        max_length=255, null=True, help_text="Descrição do plano de entrega"
    )
    delivery_task = models.CharField(
        max_length=255, null=True, help_text="Tarefa de entrega"
    )
    dv_delivery_task = models.CharField(
        max_length=255, null=True, help_text="Descrição da tarefa de entrega"
    )
    due_date = models.DateTimeField(null=True, help_text="Data de vencimento")
    escalation = models.IntegerField(null=True, help_text="Escalação")
    dv_escalation = models.CharField(
        max_length=255, null=True, help_text="Descrição da escalação"
    )
    expected_start = models.DateTimeField(
        null=True, help_text="Início esperado"
    )
    follow_up = models.DateTimeField(null=True, help_text="Acompanhamento")
    group_list = models.CharField(
        max_length=255, null=True, help_text="Lista de grupos"
    )
    hold_reason = models.IntegerField(null=True, help_text="Motivo de espera")
    dv_hold_reason = models.CharField(
        max_length=255, null=True, help_text="Descrição do motivo de espera"
    )
    knowledge = models.BooleanField(null=True, help_text="Conhecimento")
    lessons_learned = models.TextField(
        null=True, help_text="Lições aprendidas"
    )
    location = models.CharField(
        max_length=255, null=True, help_text="Localização"
    )
    dv_location = models.CharField(
        max_length=255, null=True, help_text="Descrição da localização"
    )
    made_sla = models.BooleanField(null=True, help_text="SLA cumprido")
    major_incident_state = models.CharField(
        max_length=255, null=True, help_text="Estado de incidente maior"
    )
    dv_major_incident_state = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do estado de incidente maior",
    )
    needs_attention = models.BooleanField(
        null=True, help_text="Precisa de atenção"
    )
    notify = models.IntegerField(null=True, help_text="Notificar")
    dv_notify = models.CharField(
        max_length=255, null=True, help_text="Descrição da notificação"
    )
    origin_id = models.CharField(
        max_length=255, null=True, help_text="ID de origem"
    )
    origin_table = models.CharField(
        max_length=255, null=True, help_text="Tabela de origem"
    )
    overview = models.TextField(null=True, help_text="Visão geral")
    parent = models.CharField(max_length=255, null=True, help_text="Pai")
    dv_parent = models.CharField(
        max_length=255, null=True, help_text="Descrição do pai"
    )
    parent_incident = models.CharField(
        max_length=255, null=True, help_text="Incidente pai"
    )
    dv_parent_incident = models.CharField(
        max_length=255, null=True, help_text="Descrição do incidente pai"
    )
    problem_id = models.CharField(
        max_length=255, null=True, help_text="ID do problema"
    )
    dv_problem_id = models.CharField(
        max_length=255, null=True, help_text="Descrição do ID do problema"
    )
    promoted_by = models.CharField(
        max_length=255, null=True, help_text="Promovido por"
    )
    dv_promoted_by = models.CharField(
        max_length=255, null=True, help_text="Descrição de quem promoveu"
    )
    promoted_on = models.DateTimeField(null=True, help_text="Promovido em")
    proposed_by = models.CharField(
        max_length=255, null=True, help_text="Proposto por"
    )
    dv_proposed_by = models.CharField(
        max_length=255, null=True, help_text="Descrição de quem propôs"
    )
    proposed_on = models.DateTimeField(null=True, help_text="Proposto em")
    reassignment_count = models.IntegerField(
        null=True, help_text="Contagem de reatribuições"
    )
    reopen_count = models.IntegerField(
        null=True, help_text="Contagem de reaberturas"
    )
    reopened_by = models.CharField(
        max_length=255, null=True, help_text="Reaberto por"
    )
    dv_reopened_by = models.CharField(
        max_length=255, null=True, help_text="Descrição de quem reabriu"
    )
    reopened_time = models.DateTimeField(
        null=True, help_text="Hora de reabertura"
    )
    rfc = models.CharField(max_length=255, null=True, help_text="RFC")
    dv_rfc = models.CharField(
        max_length=255, null=True, help_text="Descrição do RFC"
    )
    route_reason = models.IntegerField(null=True, help_text="Motivo da rota")
    dv_route_reason = models.CharField(
        max_length=255, null=True, help_text="Descrição do motivo da rota"
    )
    scr_vendor = models.CharField(
        max_length=255, null=True, help_text="Fornecedor SCR"
    )
    dv_scr_vendor = models.CharField(
        max_length=255, null=True, help_text="Descrição do fornecedor SCR"
    )
    scr_vendor_closed_at = models.DateTimeField(
        null=True, help_text="Fechado pelo fornecedor SCR em"
    )
    scr_vendor_opened_at = models.DateTimeField(
        null=True, help_text="Aberto pelo fornecedor SCR em"
    )
    scr_vendor_point_of_contact = models.CharField(
        max_length=255,
        null=True,
        help_text="Ponto de contato do fornecedor SCR",
    )
    scr_vendor_resolved_at = models.DateTimeField(
        null=True, help_text="Resolvido pelo fornecedor SCR em"
    )
    scr_vendor_ticket = models.CharField(
        max_length=255, null=True, help_text="Ticket do fornecedor SCR"
    )
    service_offering = models.CharField(
        max_length=255, null=True, help_text="Oferta de serviço"
    )
    dv_service_offering = models.CharField(
        max_length=255, null=True, help_text="Descrição da oferta de serviço"
    )
    severity = models.IntegerField(null=True, help_text="Severidade")
    dv_severity = models.CharField(
        max_length=255, null=True, help_text="Descrição da severidade"
    )
    skills = models.CharField(
        max_length=255, null=True, help_text="Habilidades"
    )
    sla_due = models.DateTimeField(null=True, help_text="Vencimento do SLA")
    sn_ind_tsm_core_incident = models.BooleanField(
        null=True, help_text="Incidente principal TSM"
    )
    sn_ind_tsm_core_stage = models.CharField(
        max_length=255, null=True, help_text="Estágio principal TSM"
    )
    dv_sn_ind_tsm_core_stage = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do estágio principal TSM",
    )
    subcategory = models.CharField(
        max_length=255, null=True, help_text="Subcategoria"
    )
    dv_subcategory = models.CharField(
        max_length=255, null=True, help_text="Descrição da subcategoria"
    )
    sys_class_name = models.CharField(
        max_length=255, null=True, help_text="Nome da classe do sistema"
    )
    dv_sys_class_name = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do nome da classe do sistema",
    )
    sys_domain = models.CharField(
        max_length=255, null=True, help_text="Domínio do sistema"
    )
    sys_domain_path = models.CharField(
        max_length=255, null=True, help_text="Caminho do domínio do sistema"
    )
    task_effective_number = models.CharField(
        max_length=255, null=True, help_text="Número efetivo da tarefa"
    )
    time_worked = models.DateTimeField(null=True, help_text="Tempo trabalhado")
    dv_time_worked = models.CharField(
        max_length=255, null=True, help_text="Descrição do tempo trabalhado"
    )
    timeline = models.TextField(null=True, help_text="Linha do tempo")
    trigger_rule = models.CharField(
        max_length=255, null=True, help_text="Regra de gatilho"
    )
    dv_trigger_rule = models.CharField(
        max_length=255, null=True, help_text="Descrição da regra de gatilho"
    )
    u_alert_ingest = models.DateTimeField(
        null=True, help_text="Ingestão de alerta"
    )
    u_alert_name = models.TextField(null=True, help_text="Nome do alerta")
    u_anexo = models.CharField(max_length=255, null=True, help_text="Anexo")
    u_b2b_downtime = models.DateTimeField(
        null=True, help_text="Tempo de inatividade B2B"
    )
    dv_u_b2b_downtime = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do tempo de inatividade B2B",
    )
    u_b2b_purge_report = models.BooleanField(
        null=True, help_text="Relatório de purga B2B"
    )
    u_bloquear_ticket = models.CharField(
        max_length=255, null=True, help_text="Bloquear ticket"
    )
    dv_u_bloquear_ticket = models.CharField(
        max_length=255, null=True, help_text="Descrição do bloqueio de ticket"
    )
    u_c_digo_da_falha = models.CharField(
        max_length=255, null=True, help_text="Código da falha"
    )
    u_case_ticket_vivo = models.CharField(
        max_length=255, null=True, help_text="Ticket Vivo do caso"
    )
    dv_u_case_ticket_vivo = models.CharField(
        max_length=255, null=True, help_text="Descrição do ticket Vivo do caso"
    )
    u_case_vivo_ticket_number = models.CharField(
        max_length=255, null=True, help_text="Número do ticket Vivo do caso"
    )
    u_categoria_da_falha = models.CharField(
        max_length=255, null=True, help_text="Categoria da falha"
    )
    dv_u_categoria_da_falha = models.CharField(
        max_length=255, null=True, help_text="Descrição da categoria da falha"
    )
    u_categorizacao_n1 = models.CharField(
        max_length=255, null=True, help_text="Categorização N1"
    )
    u_categorizacao_n2 = models.CharField(
        max_length=255, null=True, help_text="Categorização N2"
    )
    u_categorizacao_n3 = models.CharField(
        max_length=255, null=True, help_text="Categorização N3"
    )
    u_cep = models.CharField(max_length=255, null=True, help_text="CEP")
    u_chamado_tratado_por_analista = models.CharField(
        max_length=255, null=True, help_text="Chamado tratado por analista"
    )
    dv_u_chamado_tratado_por_analista = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do chamado tratado por analista",
    )
    u_cidade = models.CharField(max_length=255, null=True, help_text="Cidade")
    u_classificacao_da_unidade = models.CharField(
        max_length=255, null=True, help_text="Classificação da unidade"
    )
    u_cloud_provider = models.CharField(
        max_length=255, null=True, help_text="Provedor de nuvem"
    )
    u_cmdb_ci = models.CharField(
        max_length=255, null=True, help_text="CI do CMDB"
    )
    dv_u_cmdb_ci = models.CharField(
        max_length=255, null=True, help_text="Descrição do CI do CMDB"
    )
    u_cnpj = models.CharField(max_length=255, null=True, help_text="CNPJ")
    u_comentarios_adicionais = models.CharField(
        max_length=255, null=True, help_text="Comentários adicionais"
    )
    u_comment_inserted = models.BooleanField(
        null=True, help_text="Comentário inserido"
    )
    u_company_name = models.CharField(
        max_length=255, null=True, help_text="Nome da empresa"
    )
    u_complaint = models.CharField(
        max_length=255, null=True, help_text="Reclamação"
    )
    u_complaint_sub = models.CharField(
        max_length=255, null=True, help_text="Sub-reclamação"
    )
    u_contato_autorizado_lca = models.CharField(
        max_length=255, null=True, help_text="Contato autorizado LCA"
    )
    dv_u_contato_autorizado_lca = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do contato autorizado LCA",
    )
    u_contato_email = models.CharField(
        max_length=255, null=True, help_text="Email do contato"
    )
    u_contato_nome = models.CharField(
        max_length=255, null=True, help_text="Nome do contato"
    )
    u_contato_telefone = models.CharField(
        max_length=255, null=True, help_text="Telefone do contato"
    )
    u_contatos_adicionais = models.CharField(
        max_length=255, null=True, help_text="Contatos adicionais"
    )
    u_customer_pending_time = models.DateTimeField(
        null=True, help_text="Tempo pendente do cliente"
    )
    dv_u_customer_pending_time = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do tempo pendente do cliente",
    )
    u_data_demisto = models.DateTimeField(null=True, help_text="Data Demisto")
    u_data_normalizacao_servico = models.DateTimeField(
        null=True, help_text="Data de normalização do serviço"
    )
    u_data_prevista_para_atendimento = models.CharField(
        max_length=255, null=True, help_text="Data prevista para atendimento"
    )
    u_descri_o_do_problema = models.CharField(
        max_length=255, null=True, help_text="Descrição do problema"
    )
    u_designador = models.CharField(
        max_length=255, null=True, help_text="Designador"
    )
    u_designador_do_circuito = models.CharField(
        max_length=255, null=True, help_text="Designador do circuito"
    )
    u_detail_subcategory = models.CharField(
        max_length=255, null=True, help_text="Subcategoria de detalhes"
    )
    dv_u_detail_subcategory = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição da subcategoria de detalhes",
    )
    u_detalhe_23 = models.CharField(
        max_length=255, null=True, help_text="Detalhe 23"
    )
    u_detalhe_solucoes = models.CharField(
        max_length=255, null=True, help_text="Detalhe das soluções"
    )
    u_detalhe_sub_categoria_da_falha = models.CharField(
        max_length=255, null=True, help_text="Detalhe da subcategoria da falha"
    )
    dv_u_detalhe_sub_categoria_da_falha = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do detalhe da subcategoria da falha",
    )
    u_detalhes_adicionais = models.CharField(
        max_length=255, null=True, help_text="Detalhes adicionais"
    )
    u_duration = models.DateTimeField(null=True, help_text="Duração")
    dv_u_duration = models.CharField(
        max_length=255, null=True, help_text="Descrição da duração"
    )
    u_endereco_da_localidade = models.CharField(
        max_length=255, null=True, help_text="Endereço da localidade"
    )
    u_endereco_da_unidade = models.CharField(
        max_length=255, null=True, help_text="Endereço da unidade"
    )
    u_endereco_do_ponto = models.CharField(
        max_length=255, null=True, help_text="Endereço do ponto"
    )
    u_event_action = models.CharField(
        max_length=255, null=True, help_text="Ação do evento"
    )
    u_event_ingest = models.DateTimeField(
        null=True, help_text="Ingestão do evento"
    )
    u_expected_resolution_time = models.DateTimeField(
        null=True, help_text="Tempo esperado de resolução"
    )
    dv_u_expected_resolution_time = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do tempo esperado de resolução",
    )
    u_expected_response_time = models.DateTimeField(
        null=True, help_text="Tempo esperado de resposta"
    )
    dv_u_expected_response_time = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do tempo esperado de resposta",
    )
    u_expected_service_time = models.DateTimeField(
        null=True, help_text="Tempo esperado de serviço"
    )
    dv_u_expected_service_time = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do tempo esperado de serviço",
    )
    u_grupo = models.CharField(max_length=255, null=True, help_text="Grupo")
    dv_u_grupo = models.CharField(
        max_length=255, null=True, help_text="Descrição do grupo"
    )
    u_hostname = models.CharField(
        max_length=255, null=True, help_text="Nome do host"
    )
    u_id_da_unidade = models.CharField(
        max_length=255, null=True, help_text="ID da unidade"
    )
    u_id_demisto = models.CharField(
        max_length=255, null=True, help_text="ID Demisto"
    )
    u_id_do_ponto = models.CharField(
        max_length=255, null=True, help_text="ID do ponto"
    )
    u_id_do_ponto_ii = models.CharField(
        max_length=255, null=True, help_text="ID do ponto II"
    )
    u_id_do_solicitante = models.CharField(
        max_length=255, null=True, help_text="ID do solicitante"
    )
    u_id_sigla_da_unidade = models.CharField(
        max_length=255, null=True, help_text="Sigla da unidade"
    )
    u_id_vantive = models.CharField(
        max_length=255, null=True, help_text="ID Vantive"
    )
    u_id_vgr = models.CharField(max_length=255, null=True, help_text="ID VGR")
    u_identificacao_do_hardware = models.CharField(
        max_length=255, null=True, help_text="Identificação do hardware"
    )
    u_identificacao_do_ponto = models.CharField(
        max_length=255, null=True, help_text="Identificação do ponto"
    )
    u_impact_do_ticket = models.CharField(
        max_length=255, null=True, help_text="Impacto do ticket"
    )
    u_inicio_sprint = models.DateField(null=True, help_text="Início do sprint")
    u_integration = models.BooleanField(null=True, help_text="Integração")
    u_ip_destination = models.CharField(
        max_length=255, null=True, help_text="IP de destino"
    )
    u_ip_origin = models.CharField(
        max_length=255, null=True, help_text="IP de origem"
    )
    u_line = models.CharField(max_length=255, null=True, help_text="Linha")
    u_link_type = models.CharField(
        max_length=255, null=True, help_text="Tipo de link"
    )
    u_lp = models.CharField(max_length=255, null=True, help_text="LP")
    u_nome_da_unidade = models.CharField(
        max_length=255, null=True, help_text="Nome da unidade"
    )
    u_nome_do_ponto = models.CharField(
        max_length=255, null=True, help_text="Nome do ponto"
    )
    u_nome_do_respons_vel_pela_abertura_do_chamado = models.CharField(
        max_length=255,
        null=True,
        help_text="Nome do responsável pela abertura do chamado",
    )
    u_number_mass = models.CharField(
        max_length=255, null=True, help_text="Número MASS"
    )
    u_number_sigitm = models.CharField(
        max_length=255, null=True, help_text="Número SIGITM"
    )
    u_numero_do_contrato_dados = models.CharField(
        max_length=255, null=True, help_text="Número do contrato de dados"
    )
    u_numero_do_contrato_voz = models.CharField(
        max_length=255, null=True, help_text="Número do contrato de voz"
    )
    u_observacao_da_perda_do_sla = models.CharField(
        max_length=255, null=True, help_text="Observação da perda do SLA"
    )
    u_opened_month = models.CharField(
        max_length=255, null=True, help_text="Mês de abertura"
    )
    u_opening_reason = models.CharField(
        max_length=255, null=True, help_text="Motivo de abertura"
    )
    u_operational_system = models.CharField(
        max_length=255, null=True, help_text="Sistema operacional"
    )
    u_port_destination = models.CharField(
        max_length=255, null=True, help_text="Porta de destino"
    )
    u_port_origin = models.CharField(
        max_length=255, null=True, help_text="Porta de origem"
    )
    u_portal_solicitacoes = models.BooleanField(
        null=True, help_text="Portal de solicitações"
    )
    u_procedencia = models.CharField(
        max_length=255, null=True, help_text="Procedência"
    )
    dv_u_procedencia = models.CharField(
        max_length=255, null=True, help_text="Descrição da procedência"
    )
    u_product_category = models.CharField(
        max_length=255, null=True, help_text="Categoria do produto"
    )
    dv_u_product_category = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição da categoria do produto",
    )
    u_product_subcategory = models.CharField(
        max_length=255, null=True, help_text="Subcategoria do produto"
    )
    dv_u_product_subcategory = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição da subcategoria do produto",
    )
    u_product_subcategory_detail = models.CharField(
        max_length=255,
        null=True,
        help_text="Detalhe da subcategoria do produto",
    )
    dv_u_product_subcategory_detail = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do detalhe da subcategoria do produto",
    )
    u_product_vivo = models.CharField(
        max_length=255, null=True, help_text="Produto Vivo"
    )
    dv_u_product_vivo = models.CharField(
        max_length=255, null=True, help_text="Descrição do produto Vivo"
    )
    u_produto_n1 = models.CharField(
        max_length=255, null=True, help_text="Produto N1"
    )
    u_produto_n2 = models.CharField(
        max_length=255, null=True, help_text="Produto N2"
    )
    u_produto_n3 = models.CharField(
        max_length=255, null=True, help_text="Produto N3"
    )
    u_rede = models.CharField(max_length=255, null=True, help_text="Rede")
    dv_u_rede = models.CharField(
        max_length=255, null=True, help_text="Descrição da rede"
    )
    u_reincidencia = models.CharField(
        max_length=255, null=True, help_text="Reincidência"
    )
    dv_u_reincidencia = models.CharField(
        max_length=255, null=True, help_text="Descrição da reincidência"
    )
    u_resent_remedy = models.IntegerField(
        null=True, help_text="Remédio reenviado"
    )
    u_resolution_time = models.DateTimeField(
        null=True, help_text="Tempo de resolução"
    )
    dv_u_resolution_time = models.CharField(
        max_length=255, null=True, help_text="Descrição do tempo de resolução"
    )
    u_response_time = models.DateTimeField(
        null=True, help_text="Tempo de resposta"
    )
    dv_u_response_time = models.CharField(
        max_length=255, null=True, help_text="Descrição do tempo de resposta"
    )
    u_rpt_deteccao_inc_ate_ticket = models.DateTimeField(
        null=True, help_text="Detecção do incidente até o ticket"
    )
    dv_u_rpt_deteccao_inc_ate_ticket = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição da detecção do incidente até o ticket",
    )
    u_rpt_tempo_de_abertura_encerramento = models.DateTimeField(
        null=True, help_text="Tempo de abertura até encerramento"
    )
    dv_u_rpt_tempo_de_abertura_encerramento = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do tempo de abertura até encerramento",
    )
    u_rpt_tempo_de_deteccao_do_inc_ate_a_abertura_do_ticket = models.DateTimeField(
        null=True,
        help_text="Tempo de detecção do incidente até a abertura do ticket",
    )
    dv_u_rpt_tempo_de_deteccao_do_inc_ate_a_abertura_do_ticket = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do tempo de detecção do incidente até a abertura do ticket",
    )
    u_rpt_tempo_de_processamento_da_automacao = models.DateTimeField(
        null=True, help_text="Tempo de processamento da automação"
    )
    dv_u_rpt_tempo_de_processamento_da_automacao = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do tempo de processamento da automação",
    )
    u_rpt_tempo_de_processamento_da_automacao_ate_abertura_do_ticket = models.DateTimeField(
        null=True,
        help_text="Tempo de processamento da automação até a abertura do ticket",
    )
    dv_u_rpt_tempo_de_processamento_da_automacao_ate_abertura_do_ticket = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do tempo de processamento da automação até a abertura do ticket",
    )
    u_rpt_tempo_detecao_hora = models.DateTimeField(
        null=True, help_text="Tempo de detecção em horas"
    )
    dv_u_rpt_tempo_detecao_hora = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do tempo de detecção em horas",
    )
    u_serial_do_equipamento = models.CharField(
        max_length=255, null=True, help_text="Serial do equipamento"
    )
    u_serial_number = models.CharField(
        max_length=255, null=True, help_text="Número de série"
    )
    u_service_time = models.DateTimeField(
        null=True, help_text="Tempo de serviço"
    )
    dv_u_service_time = models.CharField(
        max_length=255, null=True, help_text="Descrição do tempo de serviço"
    )
    u_service_type = models.CharField(
        max_length=255, null=True, help_text="Tipo de serviço"
    )
    u_severidade_do_chamado = models.CharField(
        max_length=255, null=True, help_text="Severidade do chamado"
    )
    u_sigla_da_unidade = models.CharField(
        max_length=255, null=True, help_text="Sigla da unidade"
    )
    u_signal_rule_description = models.TextField(
        null=True, help_text="Descrição da regra de sinal"
    )
    u_sla_tratativa = models.CharField(
        max_length=255, null=True, help_text="SLA de tratativa"
    )
    dv_u_sla_tratativa = models.CharField(
        max_length=255, null=True, help_text="Descrição do SLA de tratativa"
    )
    u_source_instance = models.CharField(
        max_length=255, null=True, help_text="Instância de origem"
    )
    u_sub_categoria_da_falha = models.CharField(
        max_length=255, null=True, help_text="Subcategoria da falha"
    )
    dv_u_sub_categoria_da_falha = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição da subcategoria da falha",
    )
    u_suport_group_name = models.CharField(
        max_length=255, null=True, help_text="Nome do grupo de suporte"
    )
    dv_u_suport_group_name = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição do nome do grupo de suporte",
    )
    u_telefone_do_responsavel = models.CharField(
        max_length=255, null=True, help_text="Telefone do responsável"
    )
    u_tempo_total_da_tratativa = models.CharField(
        max_length=255, null=True, help_text="Tempo total da tratativa"
    )
    u_ticket_infinity = models.CharField(
        max_length=255, null=True, help_text="Ticket Infinity"
    )
    u_ticket_infinity_number = models.CharField(
        max_length=255, null=True, help_text="Número do Ticket Infinity"
    )
    u_ticket_remedy_number = models.CharField(
        max_length=255, null=True, help_text="Número do Ticket Remedy"
    )
    u_ticket_sigtm_number = models.CharField(
        max_length=255, null=True, help_text="Número do Ticket SIGTM"
    )
    u_tipo_de_procedencia = models.CharField(
        max_length=255, null=True, help_text="Tipo de procedência"
    )
    dv_u_tipo_de_procedencia = models.CharField(
        max_length=255, null=True, help_text="Descrição do tipo de procedência"
    )
    u_tipo_de_servico = models.CharField(
        max_length=255, null=True, help_text="Tipo de serviço"
    )
    u_torre_de_atendimento = models.CharField(
        max_length=255, null=True, help_text="Torre de atendimento"
    )
    u_type_ritm_or_incident = models.CharField(
        max_length=255, null=True, help_text="Tipo de RITM ou incidente"
    )
    u_uf = models.CharField(max_length=255, null=True, help_text="UF")
    u_unidade_caixa = models.CharField(
        max_length=255, null=True, help_text="Unidade Caixa"
    )
    dv_u_unidade_caixa = models.CharField(
        max_length=255, null=True, help_text="Descrição da Unidade Caixa"
    )
    u_user_agent = models.CharField(
        max_length=255, null=True, help_text="Agente do usuário"
    )
    u_vendor_ticket = models.CharField(
        max_length=255, null=True, help_text="Ticket do fornecedor"
    )
    u_vita_it = models.BooleanField(null=True, help_text="VITA IT")
    universal_request = models.CharField(
        max_length=255, null=True, help_text="Solicitação universal"
    )
    dv_universal_request = models.CharField(
        max_length=255,
        null=True,
        help_text="Descrição da solicitação universal",
    )
    upon_approval = models.CharField(
        max_length=255, null=True, help_text="Após aprovação"
    )
    dv_upon_approval = models.CharField(
        max_length=255, null=True, help_text="Descrição após aprovação"
    )
    upon_reject = models.CharField(
        max_length=255, null=True, help_text="Após rejeição"
    )
    dv_upon_reject = models.CharField(
        max_length=255, null=True, help_text="Descrição após rejeição"
    )
    user_input = models.CharField(
        max_length=255, null=True, help_text="Entrada do usuário"
    )
    watch_list = models.CharField(
        max_length=255, null=True, help_text="Lista de observação"
    )
    work_end = models.DateTimeField(null=True, help_text="Fim do trabalho")
    work_notes = models.CharField(
        max_length=255, null=True, help_text="Notas de trabalho"
    )
    work_notes_list = models.CharField(
        max_length=255, null=True, help_text="Lista de notas de trabalho"
    )
    work_start = models.DateTimeField(
        null=True, help_text="Início do trabalho"
    )
    u_tipo_indisponibilidade = models.CharField(
        max_length=255, null=True, help_text="Tipo de indisponibilidade"
    )
    u_justificativa_isolamento = models.CharField(
        max_length=255, null=True, help_text="Justificativa de isolamento"
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
    resolved_by = models.CharField(
        max_length=255,
        null=True,
        help_text="ID do usuário que resolveu o incidente",
    )
    dv_resolved_by = models.CharField(
        max_length=255,
        null=True,
        help_text="Nome do usuário que resolveu o incidente",
    )

    class Meta:
        db_table = "incident"
