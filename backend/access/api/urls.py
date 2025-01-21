from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token

from .views import (
    ChangePasswordView,
    CheckUsernameView,
    LoginView,
    LogoutView,
    ProfileView,
    UserCreateView,
    UserListView,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="api_login"),
    path("logout/", LogoutView.as_view(), name="api_logout"),
    path("create/", UserCreateView.as_view(), name="create"),
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
    path("profile/<int:user_id>/", ProfileView.as_view(), name="update-user"),
    path("api-token-auth/", obtain_auth_token, name="api_token_auth"),
    path(
        "users/", UserListView.as_view(), name="user-list"
    ),  # Nova URL    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),]
]
