from datetime import datetime, timedelta
from typing import Dict, Tuple

from celery import shared_task
from django.db import transaction
from django.db.models import Q
from service_now.models import Incident as ServiceNowIncident
from service_now.models import IncidentSLA

from ..models import Incident as DWIncident


class LoadIncidentsSN:
    def __init__(self, full_sync: bool = False):
        self.full_sync = full_sync
        self.log = {
            "n_deleted": 0,
            "n_inserted": 0,
            "n_incidents_processed": 0,
        }
        self.dataset = []

    def _get_sla_status(self, incident_id: str) -> Tuple[bool, bool]:
        """Obtém o status dos SLAs de atendimento e resolução"""
        sla_first = IncidentSLA.objects.filter(
            task=incident_id, dv_sla__icontains="VITA] FIRST"
        ).first()

        sla_resolved = IncidentSLA.objects.filter(
            task=incident_id, dv_sla__icontains="VITA] RESOLVED"
        ).first()

        sla_atendimento = (
            not sla_first.has_breached
            if sla_first and sla_first.has_breached is not None
            else False
        )
        sla_resolucao = (
            not sla_resolved.has_breached
            if sla_resolved and sla_resolved.has_breached is not None
            else False
        )

        return sla_atendimento, sla_resolucao

    def _get_servicenow_query(self) -> Q:
        """Define o filtro para busca dos incidentes baseado no tipo de sincronização"""
        if self.full_sync:
            return Q()

        ten_days_ago = datetime.now() - timedelta(days=10)
        return Q(closed_at__isnull=True) | Q(closed_at__gte=ten_days_ago)

    def _include_slas(self, incident: ServiceNowIncident) -> Dict:
        """Transforma um incidente do ServiceNow no formato do DW"""
        sla_atendimento, sla_resolucao = self._get_sla_status(incident.sys_id)

        return {
            "id": incident.number,
            "resolved_by": incident.resolved_by,
            "assignment_group": incident.assignment_group,
            "opened_at": incident.opened_at,
            "closed_at": incident.closed_at,
            "contract_id": incident.contract,
            "company": incident.company,
            "u_origem": incident.u_origem,
            "dv_u_categoria_da_falha": incident.dv_u_categoria_da_falha,
            "dv_u_sub_categoria_da_falha": incident.dv_u_sub_categoria_da_falha,
            "dv_u_detalhe_sub_categoria_da_falha": incident.dv_u_detalhe_sub_categoria_da_falha,
            "sla_atendimento": sla_atendimento,
            "sla_resolucao": sla_resolucao,
        }

    def extract_and_transform_dataset(self) -> None:
        """Extrai e transforma os dados do ServiceNow"""
        query = self._get_servicenow_query()
        incidents = ServiceNowIncident.objects.filter(query)
        self.log["n_incidents_processed"] = incidents.count()

        self.dataset = [self._include_slas(incident) for incident in incidents]

    @transaction.atomic
    def load(self) -> None:
        """Carrega os dados transformados no DW"""
        self._delete()
        self._save()

    def _delete(self) -> None:
        """Remove os registros que serão atualizados"""
        query = self._get_servicenow_query()
        n_deleted, _ = DWIncident.objects.filter(query).delete()
        self.log["n_deleted"] = n_deleted

    def _save(self) -> None:
        """Salva os novos registros no DW"""
        if not self.dataset:
            return

        objs = [DWIncident(**data) for data in self.dataset]
        created = DWIncident.objects.bulk_create(objs=objs, batch_size=1000)
        self.log["n_inserted"] = len(created)

    def run(self) -> Dict:
        """Executa o processo completo de sincronização"""
        self.extract_and_transform_dataset()
        self.load()
        return self.log


@shared_task(
    name="dw_analytics.load_incidents_sn",
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=5,
    retry_kwargs={"max_retries": 3},
)
def load_incidents_sn_async(self, full_sync: bool = False) -> Dict:
    sync_task = LoadIncidentsSN(full_sync=full_sync)
    return sync_task.run()
