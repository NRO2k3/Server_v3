from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView

urlpatterns=[
    path('token/', views.CustomTokenObtainPairView.as_view(), name = 'token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name = 'token_refresh'),
    path('token/blacklist/', TokenBlacklistView.as_view(), name = 'token_blacklist'),
    path('logout/',views.LogOut, name = 'log_out' ),
    path('signup/',views.SignUp, name = 'sign_up'),
    path('reset_password/', views.ResetPassword, name="reset_password"),
    path('change_password/', views.ChangePassword, name = 'change_password'),
    path('employee_permission/<int:pk>/', views.EmployeePermissionAPIView.as_view(), name = 'delete_update_employee'),
    path('employee_permission/', views.EmployeePermissionAPIView.as_view(), name = 'list_post_employee'),
    path('configuration_room/', views.RoomAPIView.as_view(), name = "list_post_room"),
    path('configuration_room/<int:pk>/', views.RoomAPIView.as_view(), name = "delete_update_room"),
    path('configuration_node/', views.ConfigurationNode, name = 'configuration_node'),
    path('set_actuator/', views.SetActuator, name = 'set_actuator'),
    path("aqi_ref/", views.GetAqiRef, name = 'aqi_ref'),
]