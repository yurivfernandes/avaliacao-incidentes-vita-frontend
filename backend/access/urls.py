from django.contrib.auth import views as auth_views
from django.urls import path, re_path
from rest_framework.authtoken.views import obtain_auth_token

from . import views

urlpatterns = [
    path("login/", views.api_login, name="api_login"),
    path("logout/", views.api_logout, name="api_logout"),
    path("signup/", views.signup, name="signup"),
    path(
        "check-username/<str:username>/",
        views.check_username,
        name="check-username",
    ),
    path("change-password/", views.change_password, name="change-password"),
    path("profile/", views.profile_view, name="profile"),
    path("profile/update/", views.profile_update, name="profile-update"),
    path("api-token-auth/", obtain_auth_token, name="api_token_auth"),
    # Adicionar rota para proxy da documentação
    re_path(r"^docs/(?P<path>.*)$", views.docs_proxy, name="docs-proxy"),
]
