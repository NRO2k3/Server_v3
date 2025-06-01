from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):

    role = models.IntegerField(default = 0, null = False, db_column = "role",)

class Room(models.Model):
    
    id = models.BigAutoField(primary_key = True, db_column = "id",)
    room_id = models.IntegerField(null = False, unique = True, db_column = "room_id",)
    construction_name = models.TextField(null = False, db_column = "construction_name",)
    x_length = models.IntegerField(null = True, db_column = "x_length",)
    y_length = models.IntegerField(null = True, db_column = "y_length",)
    information = models.TextField(null = True, db_column = "information",)
    image = models.ImageField(upload_to='images/room',null = True, blank = True)

class RegistrationNode(models.Model):

    id = models.BigAutoField(primary_key = True, db_column="id",)
    room_id = models.ForeignKey(Room,
                                to_field = 'room_id',
                                verbose_name = ("Refering to id of room where this node is implemented"),
                                on_delete = models.CASCADE,
                                null = False,
                                db_column = "room_id",
                                )
    node_id = models.BigIntegerField(null = True, unique = True, db_column = "node_id",)
    x_axis = models.FloatField(default = 1, db_column = "x_axis",)
    y_axis = models.FloatField(default = 1, db_column = "y_axis",)
    z_axis = models.FloatField(default = 1, db_column = "z_axis",)
    function = models.TextField(default = "None", db_column = "function",)
    mac = models.TextField(null = True, db_column = "mac",)
    uuid = models.TextField(null = True, unique = True, db_column = "uuid",)
    device_name = models.TextField(null = True, db_column = "device_name",)
    address_type = models.IntegerField(null = True, db_column = "address_type",)
    oob_info = models.IntegerField(null = True, db_column="oob_info",)
    adv_type = models.IntegerField(null = True, db_column="adv_type",)
    bearer_type = models.TextField(null = True, db_column="bearer_type",)
    rssi = models.IntegerField(null = True, db_column="rssi",)
    status = models.TextField(null = True, db_column = "status",)
    unicast = models.IntegerField(null = True, db_column="unicast",)
    time = models.BigIntegerField(null = True, db_column = "time",)
    remote_enable = models.IntegerField(null = True, db_column="remote_enable",)
    remote_unicast =models.IntegerField(null = True, db_column="remote_unicast",)

    def save(self, *args, **kwargs):

        if self.node_id is None:
            last_node = RegistrationNode.objects.order_by('-node_id').first()
            self.node_id = (last_node.node_id + 1) if last_node != None else 1
        super().save(*args, **kwargs)

class EmployeePermission(models.Model):

    id = models.BigAutoField(primary_key = True, db_column = "id",)
    user_id = models.ForeignKey(User,
                                    to_field='id',
                                    on_delete = models.CASCADE,
                                    null = False,
                                    db_column = "user_id",)
    node_id = models.OneToOneField(RegistrationNode,
                                    to_field='node_id',
                                    on_delete = models.CASCADE,
                                    null = False,
                                    db_column = "node_id",)

class NodeConfigurationBuffer(models.Model):

    id = models.BigAutoField(primary_key = True, db_column = "id",)
    action = models.IntegerField(null = False, db_column = "action",)
    mac = models.TextField(null = False, unique = True, db_column = "mac",)
    room_id = models.IntegerField(null = False, db_column = "room_id",)
    time = models.BigIntegerField(null = False, db_column = "time",)

class AqiRef(models.Model):

    id = models.BigAutoField(primary_key = True, db_column = "id")
    aqi = models.IntegerField(null = True, db_column = "aqi")
    pm25 = models.IntegerField(null = True, db_column = "pm25")
    pm10 = models.IntegerField(null = True, db_column = "pm10")
    o3 = models.IntegerField(null = True, db_column = "o3")
    no2 = models.IntegerField(null = True, db_column = "no2")
    so2 = models.IntegerField(null = True, db_column = "so2")
    co = models.IntegerField(null = True, db_column = "co")
    t = models.IntegerField(null = True, db_column = "t")
    p = models.IntegerField(null = True, db_column = "p")
    h = models.IntegerField(null = True, db_column = "h")
    w = models.IntegerField(null = True, db_column = "w")
    time = models.BigIntegerField(null = True, db_column = "time")
    dew = models.IntegerField(null = True, db_column = "dew")
    wg = models.IntegerField(null = True, db_column = "wg")

class RawSensorMonitor(models.Model):

    id = models.BigAutoField(primary_key = True, db_column = "id",)
    room_id = models.ForeignKey(Room,
                                to_field = 'room_id',
                                verbose_name = ("Refering to id of room where this node is implemented"),
                                on_delete = models.CASCADE,
                                null = False,
                                db_column = "room_id",
                                )
    node_id = models.IntegerField(null = False, db_column = "node_id",)
    co2 = models.SmallIntegerField(null = True,db_column = "co2",)
    temp = models.FloatField(null=True, db_column = "temp",)
    hum  = models.FloatField(null=True, db_column = "hum",)
    light = models.FloatField(null=True, db_column = "light",)
    dust = models.FloatField(null=True, db_column = "dust",)
    sound = models.FloatField(null=True, db_column = "sound",)
    red = models.SmallIntegerField(null = True, db_column = "red",)
    green = models.SmallIntegerField(null = True, db_column = "green",)
    blue = models.SmallIntegerField(null = True, db_column = "blue",)
    tvoc = models.SmallIntegerField(null = True, db_column = "tvoc",)
    motion = models.SmallIntegerField(null = True, db_column = "motion",)
    time = models.BigIntegerField(null = False, db_column = "time",)

class RawActuatorMonitor(models.Model):

    id = models.BigAutoField(primary_key = True, db_column = 'id')
    room_id = models.ForeignKey(Room,
                                to_field = 'room_id',
                                verbose_name = ("Refering to id of room where this node is implemented"),
                                on_delete = models.CASCADE,
                                null = False,
                                db_column = 'room_id',
                                )
    node_id = models.IntegerField(null = False, db_column = 'node_id',)
    function = models.TextField(null = False, db_column = 'function')
    current_value = models.TextField(null = False, db_column = 'current_value')
    state = models.IntegerField(null = False, db_column = 'state')
    mode = models.TextField(null = False, db_column = 'mode')
    time = models.BigIntegerField(null = False, db_column = 'time')

class EnergyData(models.Model):

    id = models.AutoField(primary_key = True)
    room_id = models.ForeignKey(Room,
                                to_field = 'room_id',
                                verbose_name = ("Refering to id of room where this node is implemented"),
                                on_delete = models.CASCADE,
                                null = False,
                                db_column = "room_id",
                                )
    node_id = models.IntegerField(null = False, db_column = "node_id",)
    voltage = models.FloatField(null = False, db_column = "voltage",)
    current = models.FloatField(null = False, db_column = "current",)
    active_power = models.FloatField(null = False, db_column = "active_power",)
    power_factor = models.FloatField(null = False, db_column = "power_factor",)
    frequency = models.FloatField(null = False, db_column = "frequency",)
    active_energy = models.FloatField(null = False, db_column = "active_energy",)
    time = models.BigIntegerField(null = False, db_column = "time")

class ControlSetpoint(models.Model):

    id = models.BigAutoField(primary_key = True, db_column = "id")
    room_id = models.ForeignKey(Room,
                                to_field = 'room_id',
                                verbose_name = ("Refering to room that this is trying to set value for"),
                                on_delete = models.CASCADE,
                                null = False,
                                db_column = "room_id",
                                )
    node_id = models.IntegerField(null = False, db_column = "node_id",)
    function = models.TextField(null = True, db_column = "function",)
    setpoint = models.IntegerField(null = True, db_column = "setpoint",)
    mode = models.TextField(null = True, db_column = "mode",)
    start_time = models.BigIntegerField(null=True, db_column = "start_time")
    end_time = models.BigIntegerField(null = True, db_column = "end_time")
    status = models.IntegerField(null = False, db_column = "status")

class ScanDevice(models.Model):

    id = models.BigAutoField(primary_key = True, db_column = "id")
    room_id = models.ForeignKey(Room,
                                to_field = 'room_id',
                                verbose_name = ("Refering to id of room where this node is implemented"),
                                on_delete = models.CASCADE,
                                null = False,
                                db_column = "room_id",
                                )
    uuid = models.TextField(null = False, unique = True, db_column = "uuid")
    device_name = models.TextField(null = False, db_column = "device_name")
    mac = models.TextField(null = False, db_column = "mac")
    address_type = models.IntegerField(null = False, db_column = "address_type")
    oob_info = models.IntegerField(null = False, db_column = "oob_info")
    adv_type = models.IntegerField(null = False, db_column = "adv_type")
    bearer_type = models.TextField(null = False, db_column = "bearer_type")
    rssi = models.IntegerField(null = False, db_column = "rssi")
    remote_enable = models.IntegerField(null = True, db_column="remote_enable",)
    remote_unicast =models.IntegerField(null = True, db_column="remote_unicast",)

class ResultAlgorithm(models.Model):
    id = models.BigAutoField(primary_key = True, db_column = "id")
    room_id = models.ForeignKey(Room,
                                to_field = 'room_id',
                                verbose_name = ("Refering to id of room where this node is implemented"),
                                on_delete = models.CASCADE,
                                null = False,
                                db_column = "room_id",
                                )
    image_decode = models.ImageField(upload_to='images/result/decode',null = True, blank = True, db_column = "image_decode",)
    image_encode = models.ImageField(upload_to='images/result/encode',null = True, blank = True, db_column = "image_encode",)
    algorithm =  models.TextField(null = True, blank = True, db_column = "algorithm",)