from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token

from .views import (
    ChangePasswordView,
    CheckUsernameView,
    LoginView,
    LogoutView,
    ProfileView,
    UserCreateView,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="api_login"),
    path("logout/", LogoutView.as_view(), name="api_logout"),
    path("signup/", UserCreateView.as_view(), name="signup"),
    path(
        "check-username/<str:username>/",
        CheckUsernameView.as_view(),
        name="check-username",
    ),
    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="change-password",
    ),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("api-token-auth/", obtain_auth_token, name="api_token_auth"),
]
