"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.urls import path

from . import views

urlpatterns = [
    path(
        "fila-atendimento/",
        views.FilaAtendimentoListCreateView.as_view(),
        name="fila-atendimento-list-create",
    ),
    path(
        "fila-atendimento/<int:pk>/",
        views.FilaAtendimentoDetailView.as_view(),
        name="fila-atendimento-detail",
    ),
    path(
        "empresa/",
        views.EmpresaListCreateView.as_view(),
        name="empresa-list-create",
    ),
    path(
        "empresa/<int:pk>/",
        views.EmpresaDetailView.as_view(),
        name="empresa-detail",
    ),
]
