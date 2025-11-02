from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import mixins
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import MultiPartParser, FormParser
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
                            AqiRefSerializer, RawSensorMonitorSerializer, EnergyDataSerializer, RawActuatorMonitorSerializer,
                            ScanDeviceSerializer, ResultAlgorithmSerializer)
from .models import (EmployeePermission, RegistrationNode, Room, AqiRef, RawSensorMonitor, EnergyData, RawActuatorMonitor,
                    ScanDevice, NodeConfigurationBuffer, ResultAlgorithm)
from threading import Thread
from .mqtt_server_to_gateway import SendNodeToGatewayWifi, SendSetUpActuatorToGateway, ScanDeviceToGateWay, CheckScanDeviceToGateWay, SendAddNodeToGatewayBleMesh, SendDeleteNodeToGatewayBleMesh, client
from .coverage_algorithm import CoverageOptimizationNOAlgorithm, CoverageOptimizationFOAAlgorithm
import os, csv
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
            return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)
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
        return Response({"message":"New password is sent in email"}, status = status.HTTP_200_OK)

    return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)

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
            return Response({"message":"Password old not match"}, status= status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message":"Password change successful"}, status= status.HTTP_200_OK)

    return Response({"message":"Error, please fill in full ?"}, status= status.HTTP_400_BAD_REQUEST)

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
def ConfigurationNodeWifi(request, *args, **kwargs):

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
                t = Thread(target = SendNodeToGatewayWifi, args = (client, "add"))
                t.start()
                return Response({"Response": "Processing......."}, status = status.HTTP_200_OK)
            else:
                return Response({"Errors": serializer_data_buffer.errors}, status = status.HTTP_400_BAD_REQUEST)
        else:
                return Response({"Errors": serializer_data.errors}, status = status.HTTP_400_BAD_REQUEST)
    
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
            t = Thread(target = SendNodeToGatewayWifi, args = (client, "delete"))
            t.start()
            return Response({"Response": "Processing......."}, status = status.HTTP_200_OK)
        else:
            return Response({"Errors": serializer_data_buffer.errors}, status = status.HTTP_400_BAD_REQUEST)
        
    if request.method == "GET":
        room_id = request.GET["room_id"]
        all_node_in_room = RegistrationNode.objects.filter(room_id = room_id)
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
    serializer = ControlSetpointSerializer(data = data_save["info"])

    if serializer.is_valid():
        serializer.save()
        return  Response({"Save ControlSetpoint Successfully"}, status = status.HTTP_200_OK)
    else:
        return Response({"Errors": serializer.errors}, status = status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def GetAqiRef(request, *args, **kwargs):

    try:
        if AqiRef.objects.count() == 0:
            return Response({"Response": "No data"}, status = status.HTTP_200_OK)
        latest_data_aqiref = AqiRefSerializer(AqiRef.objects.order_by("-time"), many = True).data[0]
        return Response({"Response": latest_data_aqiref}, status = status.HTTP_200_OK)
    except:
        return Response(
            {"Response": "Error on server!"},
            status = status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

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
                return Response(average_data_to_return, status = status.HTTP_200_OK)
            
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
                    if data[para] != -1 and data[para]:
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
            return Response(average_data_to_return, status = status.HTTP_200_OK)
        else:
            return Response(
                {"Response": "No content!"}, status = status.HTTP_204_NO_CONTENT
            )
    except:
        return Response(
            {"Response": "Error on server!"},
            status = status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["GET"])
def GetEnergyData(request, *args, **kwargs):

    try:
        room_id = request.GET["room_id"]
        data_energy = EnergyData.objects.filter(room_id = room_id).order_by("-time").first()

        if data_energy is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        data_energy_serializer = EnergyDataSerializer(data_energy)
        data_energy_array = [
            value
            for key, value in data_energy_serializer.data.items()
            if key != "id" and key != "room_id"
        ]
        return Response(data_energy_array, status = status.HTTP_200_OK,)
    except:
        return Response(
            {"Response": "Error on server!"},
            status = status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["GET"])
def GetEnergyDataChart(request, *args, **kwargs):

    try:
        room_id = request.GET["room_id"]
        year = datetime.datetime.now().year
        offset_energy = 17.02

        def end_of_month_unixtimestamp(year, month):
            if month == 12:
                next_month = 1
                next_year = year + 1
            else:
                next_month = month + 1
                next_year = year
            first_day_of_next_month = datetime.datetime(next_year, next_month, 1)
            end_of_month = first_day_of_next_month - datetime.timedelta(seconds=1)
            return int(end_of_month.timestamp() - 7 * 60 * 60)
        
        dataFirstObj = EnergyDataSerializer(EnergyData.objects.filter(room_id = room_id).first(), many = False)
        month_start = datetime.datetime.fromtimestamp(dataFirstObj.data["time"]).month
        dataLastObj = EnergyDataSerializer(EnergyData.objects.filter(room_id = room_id).last(), many = False)
        month_end = datetime.datetime.fromtimestamp(dataLastObj.data["time"]).month
    
        data_return = []
        for month in range(month_start, month_end + 1):

            obj = (
                EnergyData.objects.filter(
                    time__lte = end_of_month_unixtimestamp(year, month),
                    room_id = room_id).order_by("-time").first()
            )
            data_return.append(obj)
        data_return_serializer = EnergyDataSerializer(data_return, many = True)
    
        month_year_list = []
        active_power_list = []
        time_activeEnergy_List = []
        
        for item in data_return_serializer.data:
            month_year_list.append(
                f"{datetime.datetime.fromtimestamp(item['time']).month}_{datetime.datetime.fromtimestamp(item['time']).year}"
            )
            active_power_list.append(item["active_energy"])

        active_power_list[0] -= offset_energy
        energy_consumption_in_month = [active_power_list[0]]
        
        for i in range(1, len(active_power_list)):
            if i == 1:
                adjusted_value = active_power_list[i] - active_power_list[i - 1]
            else:
                adjusted_value = active_power_list[i] - (
                    active_power_list[i - 1] - active_power_list[i - 2]
                )
            energy_consumption_in_month.append(adjusted_value)
        time_activeEnergy_List.append(month_year_list)
        time_activeEnergy_List.append(energy_consumption_in_month)
        
        return Response(time_activeEnergy_List, status = status.HTTP_200_OK)
    except:
        return Response(
            {"Response": "Error on server!"},
            status = status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["GET"])
def HeatMapData(request, *args, **kwargs):

    try:
        room_id = request.GET["room_id"]
        node_id = RegistrationNode.objects.filter(room_id = room_id, status = "sync")
        node_id_serializer = RegistrationNodeSerializer(node_id, many = True)
        room_obj = RoomSerializer(Room.objects.filter(room_id = room_id).first(), many = False)
        HeatMapData = []
        area = [room_obj.data["x_length"], room_obj.data["y_length"]]
        node_id = []
        node_type = []
        x_axis = []
        y_axis = []
        temp = []

        for node in node_id_serializer.data:
            lastest_node = (
                RawSensorMonitor.objects.all()
                .filter(room_id = room_id, node_id = node["node_id"])
                .order_by("-time").first()
            )
            lastest_node_data = RawSensorMonitorSerializer(lastest_node, many = False)

            node_id.append(node["node_id"])
            node_type.append(node["function"])
            x_axis.append(node["x_axis"])
            y_axis.append(node["y_axis"])
            temp.append(lastest_node_data.data["temp"])

        HeatMapData.append(area)
        HeatMapData.append(node_id)
        HeatMapData.append(node_type)
        HeatMapData.append(x_axis)
        HeatMapData.append(y_axis)
        HeatMapData.append(temp)
        return Response(HeatMapData)


    except:
        return Response(
            {"Response": "Error on server!"},
            status = status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["GET"])
def GetEnviromentData(request, *args, **kwargs):
    try:

        room_id = request.GET["room_id"]
        filter = int(request.GET["filter"])
        node_id = int(request.GET["node_id"])
        ctime = int((datetime.datetime.now()).timestamp()) + (
            7 * 60 * 60
        )

        filter_time = 0

        if filter == 1:
            filter_time = ctime - ctime % (24 * 60 * 60)  # 24 hours
        elif filter == 2:
            filter_time = ctime - ctime % (24 * 60 * 60) - 24 * 60 * 60 * 7  # 1 Week
        elif filter == 3:
            filter_time = ctime - ctime % (24 * 60 * 60) - 24 * 60 * 60 * 31  # 1 Month
        elif filter == 4:
            filter_time = (ctime - ctime % (24 * 60 * 60) - 24 * 60 * 60 * 31 * 6)  # 6 Month
        elif filter == 5:
            filter_time = (ctime - ctime % (24 * 60 * 60) - 24 * 60 * 60 * 31 * 12)  # 1 Year
        else:
            filter_time = ctime - ctime % (24 * 60 * 60)  # default 24 hour

        parameter_key_list = [
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
            "time",
        ]
        sensor_node_id_list = [
            i["node_id"]
            for i in RegistrationNodeSerializer(RegistrationNode.objects.filter(room_id = room_id, function="sensor"),many=True,).data
        ]
        total_list = []
        if node_id == 0:
            for each_node_id in sensor_node_id_list:
                data_query = RawSensorMonitor.objects.filter(
                        time__gt = filter_time, room_id = room_id, node_id = each_node_id
                        # time__gt=1746082800, time__lt=1748710800, room_id = room_id, node_id = each_node_id
                    ).order_by('time').distinct('time')
                if data_query.exists():
                    data = RawSensorMonitorSerializer(data_query.order_by("time"),many=True,).data
                    total_list.append(data)
        else:
            print("oke")
            data_query = RawSensorMonitor.objects.filter(
                    time__gt = filter_time, room_id = room_id, node_id = node_id
                    # time__gt=1746082800, time__lt=1748710800, room_id = room_id, node_id = node_id
                ).order_by('time').distinct('time')
            if data_query.exists():
                data = RawSensorMonitorSerializer(data_query.order_by("time"),many=True,).data
                total_list.append(data)
        if len(total_list) == 0:
            return_data = {}
            for i in parameter_key_list:
                return_data[i] = []
            return Response(return_data, status = status.HTTP_204_NO_CONTENT)

        max_len_of_array_in_total_list = max([len(i) for i in total_list])

        for i in total_list:
            if len(i) < max_len_of_array_in_total_list:
                for j in range(0, max_len_of_array_in_total_list - len(i)):
                    i.insert(0, {k: -1 for k in parameter_key_list})

        return_data = {}
        buffer = {}

        for i in parameter_key_list:
            return_data[i] = []
            if i != "time":
                buffer[i] = {"value": 0, "number": 0}
            else:
                buffer[i] = []

        for i in range(len(total_list[0])):

            for each_element_in_total_list in total_list:
                for j in parameter_key_list:
                    if j != "time" and each_element_in_total_list[i][j] is not None:
                        if( each_element_in_total_list[i][j] >= 0):
                            buffer[j]["value"] = (
                                buffer[j]["value"] + each_element_in_total_list[i][j]
                            )
                            buffer[j]["number"] = buffer[j]["number"] + 1
                        else:
                            continue
                    elif j == "time" and each_element_in_total_list[i][j] >= 0:
                        buffer[j].append(each_element_in_total_list[i][j])
                    else:
                        continue
            for j in parameter_key_list:
                if j == "time":
                    return_data[j].append(max(buffer[j]))
                    buffer[j] = []
                else:
                    if buffer[j]["number"] != 0:
                        return_data[j].append(
                            round(buffer[j]["value"] / (buffer[j]["number"]), 2)
                        )
                    else:
                        return_data[j].append(0)
                    buffer[j]["value"] = 0
                    buffer[j]["number"] = 0

        csv_filename = f'{room_id}_node_{node_id}.csv'
        csv_filepath = os.path.join(settings.BASE_DIR, "exported_csv", csv_filename)
        os.makedirs(os.path.dirname(csv_filepath), exist_ok=True)
        parameter_key_list = [
            "co2",
            "temp",
            "hum",
            "time"
        ]
        with open(csv_filepath, mode='w', newline='', encoding='utf-8') as csv_file:
            writer = csv.writer(csv_file)
            writer.writerow(parameter_key_list)
            for i in range(len(return_data["time"])):
                row = [return_data[key][i] for key in parameter_key_list]
                writer.writerow(row)
        return Response(return_data, status = status.HTTP_200_OK)
    except:
        return Response(
            {"Response": "Error on server!"},
            status = status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    
@api_view(["GET"])
def AQIdustpm2_5(request, *args, **kwargs):

    try:
        room_id = request.GET["room_id"]
        pm2_5_table = [
            {
                "conclo": 0.0,
                "conchi": 12.0,
                "aqilo": 0,
                "aqihi": 50,
            },
            {
                "conclo": 12.1,
                "conchi": 35.4,
                "aqilo": 51,
                "aqihi": 100,
            },
            {
                "conclo": 35.5,
                "conchi": 55.4,
                "aqilo": 101,
                "aqihi": 150,
            },
            {
                "conclo": 55.5,
                "conchi": 150.4,
                "aqilo": 151,
                "aqihi": 200,
            },
            {
                "conclo": 150.5,
                "conchi": 250.4,
                "aqilo": 201,
                "aqihi": 300,
            },
            {
                "conclo": 250.5,
                "conclo": 500.4,
                "aqilo": 301,
                "aqihi": 500,
            },
        ]

        latest_time = int(RawSensorMonitor.objects.order_by("-time")[0].time)
        filter_time = latest_time - 12 * 60 * 60
        hourly_dust_data = RawSensorMonitorSerializer(
            RawSensorMonitor.objects.filter(
                room_id = room_id, time__gt = filter_time, dust__gt = 0.01
            ),
            many=True,
        ).data
    
        if len(hourly_dust_data) != 0:
    
            extracted_data = [
                {"time": data["time"], "dust": data["dust"]}
                for data in hourly_dust_data
            ]

            extracted_data.sort(key=lambda x: x["time"])

            power_index = 0
            pre_row = None
            l = []
            first_record_flag = True

            for data in extracted_data:
                data_time = datetime.datetime.fromtimestamp(data["time"])
                data_hour = data_time.hour
                if first_record_flag:
                    pre_row = data_hour
                    l.append({"value": data["dust"], "pow": power_index})
                    first_record_flag = False
                else:
                    dif = pre_row - data_hour
                    pre_row = data_hour
                    power_index = int(power_index + dif)
                    l.append({"value": data["dust"], "pow": power_index})

            temp_list = [i["value"] for i in l]
            range_value = round(max(temp_list) - min(temp_list), 1)
            scaled_rate_of_change = range_value / max(temp_list)
            weight_factor = 1 - scaled_rate_of_change
            weight_factor = 0.5 if weight_factor < 0.5 else round(weight_factor, 1)

            sum_value = 0
            sum_of_power = 0

            for i in l:
                sum_value += i["value"] * (weight_factor ** i["pow"])
                sum_of_power += weight_factor ** i["pow"]

            hourly_dust = round(sum_value / sum_of_power, 1)

            for i in pm2_5_table:
                if round(hourly_dust) > 500:
                    hourly_dust = 500
                    break
                if (
                    round(hourly_dust) <= i["conchi"]
                    and round(hourly_dust) >= i["conclo"]
                ):
                    conclo = i["conclo"]
                    conchi = i["conchi"]
                    aqilo = i["aqilo"]
                    aqihi = i["aqihi"]
                    hourly_dust = round(
                        (aqihi - aqilo) * (hourly_dust - conclo) / (conchi - conclo)
                        + aqilo
                    )
                    break

            return Response(
                {
                    "hourly": hourly_dust,
                    "daily": 0,
                    "time": hourly_dust_data[-1]["time"],
                },
                status = 200,
            )
        else:
            return Response(
                {"Response": "No data available!"},
                status = status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    except:
        return Response(
            {"Response": "Error on server!"},
            status = status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["GET"])
def GetActuatorStatus(request, *args, **kwargs):

    try:
        room_id = request.GET["room_id"]
        node_id = request.GET["node_id"]

        if (RegistrationNode.objects.filter(room_id = room_id, node_id = node_id, status = "sync").count() == 0):
            return Response(
                {"Response": "Actuator not available"},
                status = status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if (RawActuatorMonitor.objects.filter(node_id = node_id, room_id = room_id).count()== 0):
            return Response(
                {"Response": "No actutor status data"},
                status = status.HTTP_400_BAD_REQUEST,
            )

        status_record = RawActuatorMonitorSerializer(
            RawActuatorMonitor.objects.filter(node_id = node_id, room_id = room_id).order_by("-time").first()
        ).data

        return Response(status_record, status = status.HTTP_200_OK)
    except:
        return Response(
            {"Response": "Error on server!"},
            status = status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["POST"])
@authentication_classes([jwtauthentication.JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def ScanDeviceGateWay(request, *args, **kwargs):

    try:
        data = json.loads(request.body)
        response = CheckScanDeviceToGateWay(client, data)

        if response == False:
            return Response(
            {"Response": response},
            status = status.HTTP_400_BAD_REQUEST,
        )

        t = Thread(target = ScanDeviceToGateWay, args = (client,))
        t.start()
        return Response({"Response": "Processing......."}, status = status.HTTP_200_OK)

    except:
        return Response(
            {"Response": "Error on server!"},
            status = status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["GET"])
@authentication_classes([jwtauthentication.JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def GetAllScanDevice(request, *args, **kwargs):
    try:
        room_id = request.GET["room_id"]

        if (ScanDevice.objects.filter(room_id = room_id).count() == 0):
            return Response(
                {"Response": "No data"},
                status = status.HTTP_204_NO_CONTENT,
            )
        
        data = ScanDeviceSerializer(ScanDevice.objects.filter(room_id = room_id), many = True).data
        return Response(
                data,
                status = status.HTTP_200_OK,
            )
    except:
        return Response(
            {"Response": "Error on server!"},
            status = status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["DELETE"])
@authentication_classes([jwtauthentication.JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def DeleteScanDevice(request, *args, **kwargs):
    try:
        node_id = request.GET["node_id"]
        if (ScanDevice.objects.filter(id = node_id).count() == 0):
            return Response(
                {"Response": "No data"},
                status = status.HTTP_400_BAD_REQUEST,
            )
        
        data = ScanDevice.objects.filter(id = node_id)
        data.delete()
        return Response(
                {"Response": "Delete Sucessfully"},
                status = status.HTTP_200_OK,
            )
    except Exception as e:
        return Response(
            {"Response": f"Error on server: {str(e)}"},
            status = status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["POST", "DELETE"])
@authentication_classes([jwtauthentication.JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def ConfigurationNodeBleMesh(request, *args, **kwargs):

    if request.method == "POST":

        try:
            data = json.loads(request.body)
            data_save_database = data["info"]["dev_info"]
            data_save_database["remote_unicast"] = data["info"]["remote_prov"]["unicast"]
            data_save_database["remote_enable"] = data["info"]["remote_prov"]["enable"]
            data_buffer = {
                    "action": 1,
                    "mac": data_save_database["mac"],
                    "room_id": data["info"]["room_id"],
                    "time": int((datetime.datetime.now()).timestamp()) + 7 * 60 * 60,
            }
            data_save_database["room_id"] = data["info"]["room_id"]
            data_save_database["time"] = data_buffer["time"]
            data_save_database["status"] = "wait"
            serializer_data = RegistrationNodeSerializer(data = data_save_database)
            serializer_data_buffer = NodeConfigurationBufferSerializer(data = data_buffer)

            if serializer_data.is_valid():
                serializer_data.save()
                check_buffer = NodeConfigurationBuffer.objects.filter(action = 1).exists()
                if check_buffer:
                    if serializer_data_buffer.is_valid():
                        serializer_data_buffer.save()
                else:
                    if serializer_data_buffer.is_valid():
                        serializer_data_buffer.save()
                    t = Thread(target = SendAddNodeToGatewayBleMesh, args = (client, "add"))
                    t.start()
                return Response({"Response": "Processing......."}, status = status.HTTP_200_OK)
            else:
                return Response({"Errors": serializer_data_buffer.errors}, status = status.HTTP_400_BAD_REQUEST)
        except:
            return Response(
                {"Response": "Error on server!"},
                status = status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
    if request.method == "DELETE":

        try:
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
            check_buffer = NodeConfigurationBuffer.objects.filter(action = 0).exists()

            if check_buffer:
                if serializer_data_buffer.is_valid():
                    serializer_data_buffer.save()
            else:
                if serializer_data_buffer.is_valid():
                    serializer_data_buffer.save()
                t = Thread(target = SendDeleteNodeToGatewayBleMesh, args = (client, "delete"))
                t.start()

            return Response({"Response": "Processing......."}, status = status.HTTP_200_OK)
        except:
            return Response(
                {"Response": "Error on server!"},
                status = status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

@api_view(["GET"])
@authentication_classes([jwtauthentication.JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def GetRawDataAllSensor(request, *args, **kwargs):

    try:
        room_id = request.GET["room_id"]
        all_sensor_node = RegistrationNode.objects.filter(room_id = room_id, function = "sensor")
        raw_data_all = []
        for node in all_sensor_node:
            raw_data_node = RawSensorMonitor.objects.filter(room_id = room_id, node_id = node.node_id).order_by("-time").first()
            if raw_data_node:
                raw_data_node_serializer = RawSensorMonitorSerializer(raw_data_node)
                raw_data_all.append(raw_data_node_serializer.data)
            else:
                raw_data_all.append(
                    {
                        "room_id": int(room_id),
                        "node_id": node.node_id,
                        "co2": 0,
                        "temp": 0,
                        "hum": 0,
                        "light": 0,
                        "dust": 0,
                        "sound": 0,
                        "red": 0,
                        "green": 0,
                        "blue": 0,
                        "tvoc": 0,
                        "motion": 0,
                        "time": 0
                    }
                )

        return Response(
            raw_data_all,
            status = status.HTTP_200_OK,
        )
    except:
            return Response(
                {"Response": "Error on server!"},
                status = status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

@api_view(["GET"])
@authentication_classes([jwtauthentication.JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def EmployeeNode(request, *args, **kwargs):
    try:
        user_id = request.user.id
        data = EmployeePermission.objects.filter(user_id = user_id)
        data_response = []
        if data.exists():
            data_serializer = EmployeePermissionSerializer(data, many=True).data
            for i in data_serializer:
                data_response.append(i["node_id"])
        return Response(
            data_response, status = status.HTTP_200_OK)

    except:
        return Response(
            {"Response": "Error on server!"},
            status = status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["PATCH"])
@authentication_classes([jwtauthentication.JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def RoomImage(request, *args, **kwargs):
    try:
        room_id = request.GET["room_id"]
        image_file = request.FILES.get("image")
        if not image_file:
            return Response({"error": "Error"}, status=status.HTTP_400_BAD_REQUEST)
        room = Room.objects.get(room_id = room_id)
        room.image = image_file
        room.save()
        return Response({"message": "Image updated successfully"}, status=status.HTTP_200_OK)
    except:
        return Response(
            {"Response": "Error on server!"},
            status = status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["POST"])
@authentication_classes([jwtauthentication.JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def CoverageAlgorithm(request, *args, **kwargs):
    try:
        data = json.loads(request.body)
        if data:
            if data["algorithm"] == "NOA":
                t = Thread(target = CoverageOptimizationNOAlgorithm, args = (data,))
                t.start()
                return Response("OK", status=status.HTTP_200_OK)
            if data["algorithm"] == "FOA":
                t = Thread(target = CoverageOptimizationFOAAlgorithm, args = (data,))
                t.start()
                return Response("OK", status=status.HTTP_200_OK)
        return Response(
            {"Response": "Error!"},
            status = status.HTTP_400_BAD_REQUEST,
        )
    except:
        return Response(
            {"Response": "Error on server!"},
            status = status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["GET"])
@authentication_classes([jwtauthentication.JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def ResultCoverageAlgorithm(request, *args, **kwargs):
    try:
        room_id = request.GET["room_id"]
        algorithm = request.GET["algorithm"]
        data = ResultAlgorithm.objects.filter(room_id=room_id, algorithm = algorithm).order_by('-id').first()
        data_serializer = ResultAlgorithmSerializer(data).data
        return Response(
            data_serializer,
            status = status.HTTP_200_OK,
        )
    except:
        return Response(
            {"Response": "Error on server!"},
            status = status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    
@api_view(["GET"])
def DataAllNodeInRoom(request, *args, **kwargs):

    try:
        room_id = request.GET["room_id"]
        raw_data =RawSensorMonitorSerializer(RawSensorMonitor.objects.filter(room_id=room_id).order_by('-time')[:10000], many = True)
        return Response(
            raw_data.data,
            status=status.HTTP_200_OK,
        )
    except:
        return Response(
            {"Response": "Error on server!"},
            status = status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
