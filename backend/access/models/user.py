from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from dw_analytics.models import AssignmentGroup


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
    assignment_groups = models.ManyToManyField(
        AssignmentGroup,
        related_name="users",
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_users",
    )

    # Sobrescrevendo o método save para usar is_active como is_ativo
    def save(self, *args, **kwargs):
        if self.full_name:
            self.full_name = " ".join(
                word.capitalize() for word in self.full_name.split()
            )
        self.username = self.username.lower()
        # Usamos o is_active padrão do Django
        self.is_active = self.is_active
        super().save(*args, **kwargs)

    @property
    def is_ativo(self):
        return self.is_active

    @is_ativo.setter
    def is_ativo(self, value):
        self.is_active = value
