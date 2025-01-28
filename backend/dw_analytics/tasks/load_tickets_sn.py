from datetime import datetime, timedelta
from typing import Dict

import polars as pl
from celery import shared_task
from django.db import transaction
from django.db.models import Case, Max, Q, Value, When
from django.utils import timezone
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
        self._incidents_dataset = None

    def run(self) -> Dict:
        """Executa o processo completo de sincronização"""
        self.extract_and_transform_dataset()
        self.load()
        return self.log

    def _handle_duplicates(self, df: pl.DataFrame) -> pl.DataFrame:
        """
        Trata incidentes duplicados mantendo os encerrados ou o primeiro encontrado.
        """
        # Criando coluna para priorização (1 para encerrados, 0 para outros)
        df_with_priority = df.with_columns(
            pl.when(pl.col("state").is_in([6, 7]))
            .then(1)
            .otherwise(0)
            .alias("priority")
        )

        # Ordenando por number e priority (descendente) e pegando o primeiro de cada grupo
        return (
            df_with_priority.sort(
                ["number", "priority"], descending=[False, True]
            )
            .groupby("number", maintain_order=True)
            .first()
        )

    def extract_and_transform_dataset(self) -> None:
        """Extrai e transforma os dados do ServiceNow usando Polars"""
        self.dataset = (
            self.incidents_dataset.with_columns(
                pl.when(pl.col("state").is_in([6, 7]))
                .then(1)
                .otherwise(0)
                .alias("priority")
            )
            .sort(["number", "priority"], descending=[False, True])
            .groupby("number", maintain_order=True)
            .first()
            .join(
                self.sla_dataset,
                on="sys_id",
                how="left",
            )
            .select(
                [
                    "number",
                    "resolved_by",
                    "assignment_group",
                    "opened_at",
                    "closed_at",
                    "contract",
                    "company",
                    "u_origem",
                    "dv_u_categoria_da_falha",
                    "dv_u_sub_categoria_da_falha",
                    "dv_u_detalhe_sub_categoria_da_falha",
                    "sla_atendimento",
                    "sla_resolucao",
                ]
            )
        )

    @property
    def incidents_dataset(self) -> pl.DataFrame:
        """Retorna o DataFrame de incidentes, carregando-o se necessário."""
        schema = {
            "sys_id": pl.Utf8,
            "number": pl.Utf8,
            "resolved_by": pl.Utf8,
            "assignment_group": pl.Utf8,
            "opened_at": pl.Datetime,
            "closed_at": pl.Datetime,
            "contract": pl.Utf8,
            "company": pl.Utf8,
            "u_origem": pl.Utf8,
            "dv_u_categoria_da_falha": pl.Utf8,
            "dv_u_sub_categoria_da_falha": pl.Utf8,
            "dv_u_detalhe_sub_categoria_da_falha": pl.Utf8,
            "state": pl.Int64,
        }

        query = self._get_servicenow_query()
        incidents = ServiceNowIncident.objects.filter(query).values(
            *schema.keys()
        )
        self.log["n_incidents_processed"] = len(incidents)

        return pl.DataFrame(
            data=list(incidents),
            schema=schema,
        )

    @property
    def sla_dataset(self) -> pl.DataFrame:
        """Retorna o DataFrame de SLAs, carregando-o se necessário."""
        schema = {
            "task": pl.Utf8,
            "sla_atendimento": pl.Boolean,
            "sla_resolucao": pl.Boolean,
        }

        slas = (
            IncidentSLA.objects.filter(
                task__in=self.incidents_dataset["sys_id"].unique(),
                dv_sla__in=["[VITA] FIRST", "[VITA] RESOLVED"],
            )
            .values("task")
            .annotate(
                sla_atendimento=Case(
                    When(
                        dv_sla="[VITA] FIRST",
                        then=Case(
                            When(has_breached=True, then=Value(False)),
                            default=Value(True),
                        ),
                    ),
                    default=Value(None),
                ),
                sla_resolucao=Case(
                    When(
                        dv_sla="[VITA] RESOLVED",
                        then=Case(
                            When(has_breached=True, then=Value(False)),
                            default=Value(True),
                        ),
                    ),
                    default=Value(None),
                ),
            )
            .values("task")
            .annotate(
                sla_atendimento=Max("sla_atendimento"),
                sla_resolucao=Max("sla_resolucao"),
            )
        )

        return pl.DataFrame(
            data=list(slas),
            schema=schema,
        ).rename({"task": "sys_id"})

    def _get_servicenow_query(self) -> Q:
        """Define o filtro para busca dos incidentes baseado no tipo de sincronização"""
        if self.full_sync:
            return Q()

        ten_days_ago = timezone.now() - timedelta(days=10)
        return Q(closed_at__isnull=True) | Q(closed_at__gte=ten_days_ago)

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
        if self.dataset.is_empty():
            return

        # Convertendo o DataFrame para dicionários de forma segura
        records = [
            {
                "number": row["number"],
                "resolved_by": row["resolved_by"],
                "assignment_group": row["assignment_group"],
                "opened_at": row["opened_at"],
                "closed_at": row["closed_at"],
                "contract": row["contract"],
                "company": row["company"],
                "u_origem": row["u_origem"],
                "dv_u_categoria_da_falha": row["dv_u_categoria_da_falha"],
                "dv_u_sub_categoria_da_falha": row[
                    "dv_u_sub_categoria_da_falha"
                ],
                "dv_u_detalhe_sub_categoria_da_falha": row[
                    "dv_u_detalhe_sub_categoria_da_falha"
                ],
                "sla_atendimento": row["sla_atendimento"],
                "sla_resolucao": row["sla_resolucao"],
            }
            for row in self.dataset.iter_rows(named=True)
        ]

        objs = [DWIncident(**record) for record in records]
        created = DWIncident.objects.bulk_create(objs=objs, batch_size=5000)
        self.log["n_inserted"] = len(created)


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
