import random
from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone
from dw_analytics.models import AssignmentGroup, ResolvedBy
from faker import Faker
from service_now.models import Incident, IncidentSLA

fake = Faker("pt_BR")


class Command(BaseCommand):
    help = "Cria dados fake para as tabelas Incident e IncidentSLA"

    def add_arguments(self, parser):
        parser.add_argument(
            "quantidade",
            type=int,
            help="Quantidade de tickets a serem criados",
        )

    def _generate_datetime(
        self, base_date: datetime, seconds_to_add: int
    ) -> datetime:
        """Gera uma data com timezone a partir de uma data base e segundos a adicionar"""
        new_date = base_date + timedelta(seconds=seconds_to_add)
        if not timezone.is_aware(new_date):
            new_date = timezone.make_aware(new_date)
        return new_date

    def handle(self, *args, **options):
        quantidade = options["quantidade"]

        # Obtendo IDs existentes de ResolvedBy e AssignmentGroup
        resolved_by_ids = list(
            ResolvedBy.objects.values_list("id", "dv_resolved_by")
        )
        assignment_group_ids = list(
            AssignmentGroup.objects.values_list("id", "dv_assignment_group")
        )

        if not resolved_by_ids or not assignment_group_ids:
            self.stdout.write(
                self.style.ERROR(
                    "É necessário ter registros nas tabelas ResolvedBy e AssignmentGroup!"
                )
            )
            return

        # Limpando registros existentes
        self.stdout.write("Removendo registros existentes...")
        IncidentSLA.objects.all().delete()
        Incident.objects.all().delete()
        self.stdout.write(
            self.style.SUCCESS("Registros existentes removidos com sucesso!")
        )

        self.stdout.write(f"Criando {quantidade} tickets...")

        # Definindo período específico
        start_date = datetime(
            2024, 2, 1, tzinfo=timezone.get_current_timezone()
        )
        end_date = timezone.now()

        # Lista para armazenar os sys_ids criados
        incident_sys_ids = []

        # Gerando números únicos de tickets
        existing_numbers = set(
            Incident.objects.values_list("number", flat=True)
        )
        ticket_numbers = set()
        while len(ticket_numbers) < quantidade:
            new_number = f"INC{fake.random_number(digits=7, fix_len=True)}"
            if (
                new_number not in existing_numbers
                and new_number not in ticket_numbers
            ):
                ticket_numbers.add(new_number)

        # Categorias de falha para manter consistência
        categorias_falha = [
            "Hardware",
            "Software",
            "Rede",
            "Banco de Dados",
            "Aplicação",
        ]
        sub_categorias = {
            "Hardware": ["Servidor", "Storage", "Desktop", "Notebook"],
            "Software": ["Sistema Operacional", "Aplicativo", "Driver"],
            "Rede": ["Switch", "Roteador", "Firewall", "Link"],
            "Banco de Dados": [
                "Oracle",
                "SQL Server",
                "PostgreSQL",
                "MongoDB",
            ],
            "Aplicação": ["Web", "Desktop", "Mobile", "Integração"],
        }
        detalhes_sub = {
            "Servidor": ["CPU", "Memória", "Disco", "Placa Mãe"],
            "Sistema Operacional": ["Windows", "Linux", "MacOS"],
            "Switch": ["Porta", "Configuração", "Firmware"],
            "Oracle": ["Tablespace", "Performance", "Backup", "Índice"],
            "Web": ["Frontend", "Backend", "API", "Cache"],
        }

        # Calculando intervalo total em segundos
        total_seconds = int((end_date - start_date).total_seconds())

        # Criando incidentes
        for number in ticket_numbers:
            sys_id = fake.uuid4()
            incident_sys_ids.append(sys_id)

            # Selecionando um resolved_by e assignment_group aleatório
            resolved_by_id, dv_resolved_by = random.choice(resolved_by_ids)
            assignment_group_id, dv_assignment_group = random.choice(
                assignment_group_ids
            )

            # Gerando data de abertura aleatória dentro do período
            random_seconds = random.randint(0, total_seconds)
            opened_at = self._generate_datetime(start_date, random_seconds)

            # Gerando data de fechamento (70% de chance de estar fechado)
            closed_at = None
            if random.random() < 0.7:  # 70% de chance de ter closed_at
                # Fechamento entre 1 hora e 7 dias após abertura
                max_close_seconds = min(
                    random.randint(3600, 604800),  # Entre 1h e 7 dias
                    int((end_date - opened_at).total_seconds()),
                )
                closed_at = self._generate_datetime(
                    opened_at, max_close_seconds
                )

            # Selecionando categorias de forma consistente
            categoria = random.choice(categorias_falha)
            sub_categoria = random.choice(sub_categorias[categoria])
            detalhe = random.choice(
                detalhes_sub.get(sub_categoria, ["Outros"])
            )

            incident = Incident.objects.create(
                sys_id=sys_id,
                number=number,
                opened_at=opened_at,
                closed_at=closed_at,
                resolved_by=resolved_by_id,
                dv_resolved_by=dv_resolved_by,
                assignment_group=assignment_group_id,
                dv_assignment_group=dv_assignment_group,
                contract=fake.uuid4(),
                dv_contract=f"CONTRATO {fake.random_number(digits=4)}",
                company=fake.uuid4(),
                dv_company=fake.company(),
                u_origem=random.choice(
                    ["NOC", "SOC", "MONITORACAO", "SUPORTE"]
                ),
                dv_u_origem=random.choice(
                    ["NOC", "SOC", "MONITORACAO", "SUPORTE"]
                ),
                dv_u_categoria_da_falha=categoria,
                dv_u_sub_categoria_da_falha=sub_categoria,
                dv_u_detalhe_sub_categoria_da_falha=detalhe,
                # Campos adicionais do modelo Incident
                sys_created_on=opened_at,
                sys_updated_on=closed_at or opened_at,
                state=7 if closed_at else random.randint(1, 6),
                priority=random.randint(1, 5),
                impact=random.randint(1, 3),
                urgency=random.randint(1, 3),
                short_description=fake.sentence(),
                description=fake.text(),
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Criados {len(ticket_numbers)} incidentes com sucesso!"
            )
        )

        # Criando SLAs para cada incidente
        sla_types = ["[VITA] RESOLVED", "[VITA] FIRST"]
        total_slas = 0

        for sys_id in incident_sys_ids:
            incident = Incident.objects.get(sys_id=sys_id)

            for sla_type in sla_types:
                start_time = incident.opened_at
                # SLA de atendimento: entre 30min e 4h
                # SLA de resolução: entre 4h e 48h
                if sla_type == "[VITA] FIRST":
                    hours_range = (0.5, 4)
                else:
                    hours_range = (4, 48)

                random_hours = random.uniform(*hours_range)
                seconds_to_add = int(random_hours * 3600)
                end_time = self._generate_datetime(start_time, seconds_to_add)

                # Ajusta end_time se o ticket estiver fechado
                if incident.closed_at and end_time > incident.closed_at:
                    end_time = incident.closed_at

                has_breached = end_time > self._generate_datetime(
                    start_time, int(hours_range[0] * 3600)
                )

                IncidentSLA.objects.create(
                    sys_id=fake.uuid4(),
                    task=sys_id,
                    sla=fake.uuid4(),
                    dv_sla=sla_type,
                    stage="complete",
                    start_time=start_time,
                    end_time=end_time,
                    has_breached=has_breached,
                    active=False,
                    business_percentage=random.randint(0, 100),
                    percentage=random.randint(0, 100),
                    sys_created_on=start_time,
                    sys_updated_on=end_time,
                )
                total_slas += 1

                # Atualizando o incidente com o status do SLA
                if sla_type == "[VITA] FIRST":
                    incident.sla_atendimento = not has_breached
                else:  # [VITA] RESOLVED
                    incident.sla_resolucao = not has_breached

            incident.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"Criados {total_slas} registros de SLA com sucesso!"
            )
        )
