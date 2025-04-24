from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (EmployeePermission, Room, RegistrationNode, NodeConfigurationBuffer, ControlSetpoint,
                    AqiRef, RawSensorMonitor, EnergyData, RawActuatorMonitor, ScanDevice, ResultAlgorithm)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):

        data = super(MyTokenObtainPairSerializer, self).validate(attrs)

        if self.user.role == 2:
            data["role"] = 2
        elif self.user.role == 1:
            data["role"] = 1
        else:
            data["role"] = 0

        return data

class UserSerializer(serializers.ModelSerializer):

    class Meta:

        model = User
        fields = ['username', 'password', 'email']

    def validate_username(self, value):

        if User.objects.filter(username = value).exists():
            raise serializers.ValidationError("Username've already existed!")

        return value
    
    def create(self, validated_data):

        return User.objects.create_user(**validated_data)

class EmployeePermissionSerializer(serializers.ModelSerializer):

    class Meta:

        model = EmployeePermission
        fields = ['user_id', 'node_id']

class ResetPassWordSerializer(serializers.Serializer):
    
    email = serializers.EmailField(required = True)

    def validate(self, data):

        email = data.get('email')

        if not User.objects.filter(email = email).exists():
            raise serializers.ValidationError("This email does not exist.")
        
        return data

class ChangePassWordSerializer(serializers.Serializer):

    old_password = serializers.CharField(required = True)
    new_password = serializers.CharField(required = True)

class RoomSerializer(serializers.ModelSerializer):

    class Meta:

        model = Room
        fields = "__all__"

class RegistrationNodeSerializer(serializers.ModelSerializer):

    class Meta:

        model = RegistrationNode
        fields = "__all__"

class NodeConfigurationBufferSerializer(serializers.ModelSerializer):

    class Meta:

        model = NodeConfigurationBuffer
        fields = "__all__"

class ControlSetpointSerializer(serializers.ModelSerializer):

    class Meta:

        model = ControlSetpoint
        fields = "__all__"

class AqiRefSerializer(serializers.ModelSerializer):

    class Meta:

        model = AqiRef
        fields = "__all__"

class RawSensorMonitorSerializer(serializers.ModelSerializer):

    class Meta:

        model = RawSensorMonitor
        fields = "__all__"

class EnergyDataSerializer(serializers.ModelSerializer):

    class Meta:

        model = EnergyData
        fields = "__all__"

class RawActuatorMonitorSerializer(serializers.ModelSerializer):

    class Meta:

        model = RawActuatorMonitor
        fields = "__all__"

class ScanDeviceSerializer(serializers.ModelSerializer):

    class Meta:

        model = ScanDevice
        fields = "__all__"

class ResultAlgorithmSerializer(serializers.ModelSerializer):

    class Meta:

        model = ResultAlgorithm
        fields = "__all__"