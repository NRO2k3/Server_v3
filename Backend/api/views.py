from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import mixins
from rest_framework.generics import GenericAPIView
import json, datetime, random
from django.conf import settings
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework import permissions
from rest_framework_simplejwt import authentication as jwtauthentication
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from .serializers import MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (EmployeePermissionSerializer, RegistrationNodeSerializer,
                            UserSerializer, ResetPassWordSerializer, ChangePassWordSerializer,
                            NodeConfigurationBufferSerializer, RoomSerializer, ControlSetpointSerializer,
                            AqiRefSerializer, RawSensorMonitorSerializer, EnergyDataSerializer)
from .models import (EmployeePermission, RegistrationNode, Room, AqiRef, RawSensorMonitor, EnergyData)
from threading import Thread
from .mqtt_server_to_gateway import SendNodeToGateway, SendSetUpActuatorToGateway, client

from django.contrib.auth import get_user_model
User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(["POST"])
def LogOut(request, *args, **kwargs):

    try:
        token = RefreshToken(request.data['refresh'])
        token.blacklist()
        return Response({"Response":"Logout successful"}, status = status.HTTP_200_OK)
    except:
        return Response({"Response":"Try logout again!"}, status = status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def SignUp(request, *args, **kwargs):

    if request.method == "POST":
        serializer = UserSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"Response": "Register successful"}, status = status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status= status.HTTP_400_BAD_REQUEST)
    else:
        return Response(
            {"Response": "Request method not allowed!"}, status = status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(["POST"])
def ResetPassword(request, *args, **kwargs):

    serializer = ResetPassWordSerializer(data = request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        user = User.objects.get(email = email)
        new_pass = get_random_string(length = 8)
        user.set_password(new_pass)
        user.save()
        subject = 'Hello from ADMIN'
        message = f'Hello user this is a new password: {new_pass}'
        email = user.email
        recipient_list = [email]
        send_mail(subject, message,settings.EMAIL_HOST_USER, recipient_list)
        return Response({"message":"New password is sent in email"})

    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@authentication_classes([jwtauthentication.JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def ChangePassword(request, *args, **kwargs):

    serializer = ChangePassWordSerializer(data = request.data)

    if serializer.is_valid():

        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']
        user = request.user

        if not user.check_password(old_password):
            return Response({"message":"Password old not match"},status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message":"Password change successful"},status=status.HTTP_200_OK)

    return Response({"message":"Error, please fill in full ?"},status=status.HTTP_400_BAD_REQUEST)

class EmployeePermissionAPIView(mixins.ListModelMixin, mixins.CreateModelMixin,
                                mixins.UpdateModelMixin, mixins.DestroyModelMixin,
                                GenericAPIView,
                                ):

    queryset = EmployeePermission.objects.all()
    serializer_class = EmployeePermissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [jwtauthentication.JWTAuthentication]

    def create(self, request, *args, **kwargs):
        data = json.loads(request.body)
        user_id = data["user_id"]
        node_id = data["node_id"]
        data = EmployeePermission.objects.filter(user_id = user_id, node_id = node_id)

        if data.exists():
            return Response({"Response":"Data have already exist"}, status = status.HTTP_400_BAD_REQUEST)
        serializer = EmployeePermissionSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"Response":"Sucessfully"}, status = status.HTTP_201_CREATED)
        return Response({"Response":"Error"}, status = status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

class RoomAPIView(mixins.ListModelMixin, mixins.CreateModelMixin,
                mixins.UpdateModelMixin, mixins.DestroyModelMixin,
                GenericAPIView,):
    
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [jwtauthentication.JWTAuthentication]

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

@api_view(["GET", "POST", "DELETE", "PUT"])
@authentication_classes([jwtauthentication.JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def ConfigurationNode(request, *args, **kwargs):

    if request.method == "POST":
        data = json.loads(request.body)
        check = Room.objects.filter(room_id = data["room_id"])

        if not check.exists():
            return Response({"Response":"Room haven't existed, Please singup room firstly"},
                            status = status.HTTP_400_BAD_REQUEST)
        
        while True:
            random_mac = random.randint(100000, 999999)
            check_mac = RegistrationNode.objects.filter(room_id = data["room_id"], mac = random_mac)
            if not check_mac.exists():
                break

        data["mac"] = str(random_mac)
        data_buffer = {
                "action": 1,
                "mac": data["mac"],
                "room_id": data["room_id"],
                "time": int((datetime.datetime.now()).timestamp()) + 7 * 60 * 60,
        }
        data["time"] = data_buffer["time"]
        data["status"] = "sync"
        serializer_data = RegistrationNodeSerializer(data = data)
        serializer_data_buffer = NodeConfigurationBufferSerializer(data = data_buffer)

        if serializer_data.is_valid():
            serializer_data.save()

            if serializer_data_buffer.is_valid():
                serializer_data_buffer.save()
                t = Thread(target = SendNodeToGateway, args = (client, "add"))
                t.start()
                return Response({"Response": "Processing......."}, status = status.HTTP_200_OK)

        else:
                return Response({"Errors": serializer_data_buffer.errors}, status = status.HTTP_400_BAD_REQUEST)
    
    if request.method == "DELETE":
        data = json.loads(request.body)
        check = RegistrationNode.objects.filter(node_id = data["node_id"]).first()

        if check is None:
            return Response({"Response":"This node haven't exist, please singup node fisrtly"},
                            status = status.HTTP_400_BAD_REQUEST)
        
        check.status = "deleted"
        check.save()
        data_buffer = {
                "action": 0,
                "mac": check.mac,
                "room_id": check.room_id.room_id,
                "time": int((datetime.datetime.now()).timestamp()) + 7 * 60 * 60,
        }
        serializer_data_buffer = NodeConfigurationBufferSerializer(data = data_buffer)

        if serializer_data_buffer.is_valid():
            serializer_data_buffer.save()
            t = Thread(target = SendNodeToGateway, args = (client, "delete"))
            t.start()
            return Response({"Response": "Processing......."}, status = status.HTTP_200_OK)
        else:
            return Response({"Errors": serializer_data_buffer.errors}, status = status.HTTP_400_BAD_REQUEST)
        
    if request.method == "GET":
        data = json.loads(request.body)
        all_node_in_room = RegistrationNode.objects.filter(room_id = data["room_id"])
        serializer_data = RegistrationNodeSerializer(all_node_in_room, many = True)
        return Response(serializer_data.data, status = status.HTTP_200_OK)

    if request.method == "PUT":
        data = json.loads(request.body)
        node_update = RegistrationNode.objects.filter(node_id = data["node_id"], room_id = data["room_id"])

        if not node_update.exists():
            return Response({"Response": "This node haven't exist, please singup node fisrtly"},
                            status = status.HTTP_400_BAD_REQUEST)
        
        serializer_data = RegistrationNodeSerializer(node_update.first(), data = data)
        
        if serializer_data.is_valid():
            serializer_data.save()
            return Response({"Update Successfully"}, status = status.HTTP_200_OK)
        return Response({"Errors": serializer_data.errors}, status = status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@authentication_classes([jwtauthentication.JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def SetActuator(request, *args, **kwargs):

    data = json.loads(request.body)
    check_node = RegistrationNode.objects.filter(node_id = data["node_id"])

    if not check_node.exists():
        return Response({"Errors": "Node doesn't exist please singup first"}, status = status.HTTP_400_BAD_REQUEST)

    data_save = SendSetUpActuatorToGateway(client, data)
    print(data_save["info"])
    serializer = ControlSetpointSerializer(data = data_save["info"])

    if serializer.is_valid():
        serializer.save()
        return  Response({"Save ControlSetpoint Successfully"}, status = status.HTTP_200_OK)
    else:
        return Response({"Errors": serializer.errors}, status = status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def GetAqiRef(request, *args, **kwargs):

    if AqiRef.objects.count() == 0:
        return Response({"Response": "No data"}, status = status.HTTP_200_OK)
    latest_data_aqiref = AqiRefSerializer(AqiRef.objects.order_by("-time"), many = True).data[0]
    return Response({"Response": latest_data_aqiref}, status = status.HTTP_200_OK)

@api_view(["GET"])
def GetRoomInformation(request, *args, **kwargs):

    try:
        room_id = request.GET["room_id"]

        if RawSensorMonitor.objects.count() != 0:

            if ( RegistrationNode.objects.filter(room_id = room_id, function = "sensor", status = "sync").count() == 0):
                parameter_key_list = {
                    "co2",
                    "temp",
                    "hum",
                    "light",
                    "dust",
                    "sound",
                    "red",
                    "green",
                    "blue",
                    "tvoc",
                    "motion",
                }
                average_data_to_return = {}
                for i in parameter_key_list:
                    average_data_to_return[i] = -1
                    average_data_to_return["time"] = 0
                return Response(average_data_to_return, status=status.HTTP_200_OK)
            
            all_node_id = RegistrationNode.objects.filter(room_id = room_id, function = "sensor", status = "sync")
            all_node_id_serializer = RegistrationNodeSerializer(all_node_id, many = True)

            all_node_id_list = [
                i["node_id"] for i in all_node_id_serializer.data
            ]

            latest_data_of_each_node_id = []
            for each_node_id in all_node_id_list:
                if RawSensorMonitor.objects.filter(room_id = room_id, node_id = each_node_id).exists():

                    data_of_this_node_id = RawSensorMonitor.objects.filter(
                        room_id = room_id, node_id=each_node_id
                    ).order_by("-time")[0]
                    latest_data_of_each_node_id.append(
                        RawSensorMonitorSerializer(data_of_this_node_id).data
                    )
                else:
                    continue

            parameter_key_list = {
                "co2",
                "temp",
                "hum",
                "light",
                "dust",
                "sound",
                "red",
                "green",
                "blue",
                "tvoc",
                "motion",
            }
            average_data_to_return = {}

            latest_time = max(
                data["time"] for data in latest_data_of_each_node_id
            )
            average_data_to_return["time"] = latest_time

            sum_count = {para: {"sum": 0, "count": 0} for para in parameter_key_list}

            for data in latest_data_of_each_node_id:
                for para in parameter_key_list:
                    if data[para] != -1:
                        sum_count[para]["sum"] += data[para]
                        sum_count[para]["count"] += 1

            for para in parameter_key_list:
                average_data_to_return[para] = []
            for para in parameter_key_list:
                if sum_count[para]["count"] > 0:
                    average_data_to_return[para].append(
                        int(sum_count[para]["sum"] / sum_count[para]["count"])
                    )
                else:
                    average_data_to_return[para] = -1

            sensor_node_information_in_this_room_list = RegistrationNodeSerializer(
                RegistrationNode.objects.filter(
                    room_id = room_id, function = "sensor", status = "sync"
                ),
                many=True,
            ).data

            actuator_node_information_in_this_room_list = RegistrationNodeSerializer(
                RegistrationNode.objects.filter(room_id = room_id, status = "sync"), many=True
            ).data

            real_actuator_node_information_in_this_room_list = []
            for i in actuator_node_information_in_this_room_list:
                if i["function"] != "sensor":
                    real_actuator_node_information_in_this_room_list.append(i)

            average_data_to_return["node_info"] = {
                "sensor": sensor_node_information_in_this_room_list,
                "actuator": real_actuator_node_information_in_this_room_list,
            }

            room_size_data = RoomSerializer(
                Room.objects.filter(room_id=room_id), many=True
            ).data
            average_data_to_return["room_size"] = {
                "x_length": room_size_data[0]["x_length"],
                "y_length": room_size_data[0]["y_length"],
            }
            return Response(average_data_to_return, status=status.HTTP_200_OK)
        else:
            return Response(
                {"Response": "No content!"}, status=status.HTTP_204_NO_CONTENT
            )
    except:
        return Response(
            {"Response": "Error on server!"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["GET"])
def GetEnergyData(request, *args, **kwargs):

    try:
        room_id = request.GET["room_id"]
        data_energy = EnergyData.objects.filter(room_id=room_id).order_by("-time").first()
        data_energy_serializer = EnergyDataSerializer(data_energy)
        data_energy_array = [
            value
            for key, value in data_energy_serializer.data.items()
            if key != "id" and key != "room_id"
        ]
        return Response(data_energy_array,status=status.HTTP_200_OK,)
    except:
        return Response(
            {"Response": "Error on server!"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )