from cadastro.models.empresa import Empresa
from cadastro.models.fila_atendimento import FilaAtendimento
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    username = models.CharField(
        max_length=150,
        unique=True,
        error_messages={
            "unique": "Este nome de usuário já está em uso.",
        },
    )
    full_name = models.CharField(max_length=255)
    is_gestor = models.BooleanField(default=False)
    is_tecnico = models.BooleanField(default=False)
    first_access = models.BooleanField(default=True)
    groups = models.ManyToManyField(
        "auth.Group",
        related_name="access_user_set",
        related_query_name="access_user",
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="access_user_set",
        related_query_name="access_user",
        blank=True,
    )
    empresa = models.ForeignKey(
        Empresa,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )
    fila = models.ForeignKey(
        FilaAtendimento,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )

    def save(self, *args, **kwargs):
        if self.full_name:
            self.full_name = " ".join(
                word.capitalize() for word in self.full_name.split()
            )
        self.username = self.username.lower()
        super().save(*args, **kwargs)
