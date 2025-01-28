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
        "sortear-tickets/load/",
        views.SorteioIncidentsView.as_view(),
        name="sortear-tickets",
    ),
    path(
        "assignment-group/",
        views.AssignmentGroupListView.as_view(),
        name="assignment-group-list",
    ),
    path(
        "assignment-group/<int:pk>/",
        views.AssignmentGroupListView.as_view(),
        name="assignment-group-detail",
    ),
    path(
        "incidents-sn/load/",
        views.LoadIncidentsSNView.as_view(),
        name="assignment-group-detail",
    ),
    path(
        "resolved-by/load/",
        views.LoadResolvedByView.as_view(),
        name="load-resolved-by",
    ),
    path(
        "assignment-group/load/",
        views.LoadAssignmentGroupView.as_view(),
        name="load-assignment-group",
    ),
]
