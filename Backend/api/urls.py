from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView, TokenVerifyView

urlpatterns=[
    path('token', views.CustomTokenObtainPairView.as_view(), name = 'token_obtain_pair'),
    path('token/refresh', TokenRefreshView.as_view(), name = 'token_refresh'),
    path("token/verify", TokenVerifyView.as_view(), name = 'token_verify'),
    path('token/blacklist', TokenBlacklistView.as_view(), name = 'token_blacklist'),
    path('logout', views.LogOut, name = 'log_out' ),
    path('signup', views.SignUp, name = 'sign_up'),
    path('reset_password', views.ResetPassword, name = 'reset_password'),
    path('change_password', views.ChangePassword, name = 'change_password'),

    path('employee_permission/<int:pk>', views.EmployeePermissionAPIView.as_view(), name = 'delete_update_employee'),
    path('employee_permission', views.EmployeePermissionAPIView.as_view(), name = 'list_post_employee'),
    path('configuration_room', views.RoomAPIView.as_view(), name = 'list_post_room'),
    path('configuration_room/<int:pk>', views.RoomAPIView.as_view(), name = 'delete_update_room'),
    path('configuration_node', views.ConfigurationNode, name = 'configuration_node'),
    path('set_actuator', views.SetActuator, name = 'set_actuator'),
    path('aqi_ref', views.GetAqiRef, name = 'aqi_ref'),
    path('room/information_tag', views.GetRoomInformation, name= 'information_room'),
    path('energy_data', views.GetEnergyData, name = 'energy_data'),
    path('energy_data_chart', views.GetEnergyDataChart, name = 'energy_data_chart'),
    path('heatmap', views.HeatMapData, name = 'heat_map'),
    path('enviroment_chart', views.GetEnviromentData, name = 'enviroment-chart'),
    path('room/AQIdustpm2_5', views.AQIdustpm2_5, name = 'AQI_dust_pm2_5'),
    path('actuator_status', views.GetActuatorStatus, name = 'actuator_status'),
]