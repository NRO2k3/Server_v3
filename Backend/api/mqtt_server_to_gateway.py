from .mqtt_class import ClientMQTT
import datetime
import json, time
from .models import RegistrationNode, NodeConfigurationBuffer, ScanDevice
import os
import psycopg2

set_actuator = "farm/control"
scan_device = "farm/node/scan"
add_device = "farm/node/add"
delete_device = "farm/node/delete"
new_node_topic = "farm/node/new"
keep_alive = "farm/monitor/alive"
topic_list = [set_actuator, scan_device, add_device, delete_device, new_node_topic, keep_alive]
client = ClientMQTT(topic_list)

broker = os.environ.get('SERVER_BROKER')
port = 1883
# client.connect(broker, port)
# client.loop_start()

def CheckScanDeviceToGateWay(client: ClientMQTT, data: dict):

    client = ClientMQTT([scan_device])
    client.connect(broker, port)
    client.loop_start()

    message_send = json.dumps(data)
    result = client.publish(scan_device, message_send)
    status = result[0]

    if status == 0:
        print("Successfully send message")
    else:
        raise Exception("Can't publish data to mqtt")
    
    current_time = int((datetime.datetime.now()).timestamp())

    while True:
        if int((datetime.datetime.now()).timestamp()) - current_time > 20:
            return False
        
        message_receive = client.message_arrive()

        if message_receive != None:
            data_receive = json.loads(message_receive)

            if data_receive["operator"] == "scan_device_ack":

                if data_receive["status"] == 1:
                    return True
                else:
                    return False

def ScanDeviceToGateWay(client: ClientMQTT):

    client = ClientMQTT([scan_device])
    client.connect(broker, port)
    client.loop_start()

    try:
        connect_to_database = psycopg2.connect(
            database = os.environ.get('POSTGRES_DB'),
            user = os.environ.get('POSTGRES_USER'),
            password = os.environ.get('POSTGRES_PASSWORD'),
            host = os.environ.get('HOST_NAME'),
            port = "5432",
        )
        print("Successfully to connect database in function ScanDeviceToGateWay")
    except psycopg2.OperationalError as e:
        connect_to_database = None
        print(e)

    connect_to_database.autocommit = True
    cursor = connect_to_database.cursor()
    cursor.execute("DELETE FROM api_scandevice")
    cursor.close()
    connect_to_database.close()
    current_time = int((datetime.datetime.now()).timestamp())

    while int((datetime.datetime.now()).timestamp()) - current_time <= 300:
        
        message_receive = client.message_arrive()

        if message_receive != None:
            data_receive = json.loads(message_receive)

            if data_receive["operator"] == "scan_result":

                if data_receive["status"] == 1:
                    data_node = ScanDevice.objects.filter(uuid = data_receive["info"]["dev_info"]["uuid"]).first()
                    if(data_node is None):
                        try:
                            connect_to_database = psycopg2.connect(
                                database = os.environ.get('POSTGRES_DB'),
                                user = os.environ.get('POSTGRES_USER'),
                                password = os.environ.get('POSTGRES_PASSWORD'),
                                host = os.environ.get('HOST_NAME'),
                                port = "5432",
                            )
                            print("Successfully to connect database in function ScanDeviceToGateWay")
                        except psycopg2.OperationalError as e:
                            connect_to_database = None
                            print(e)

                        connect_to_database.autocommit = True
                        cursor = connect_to_database.cursor()
                        query = f"""INSERT INTO api_scandevice (room_id, uuid, device_name, mac, address_type, oob_info, adv_type, bearer_type, rssi, remote_enable, remote_unicast)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
                        dict_key = [
                            "uuid",
                            "device_name",
                            "mac",
                            "address_type",
                            "oob_info",
                            "adv_type",
                            "bearer_type",
                            "rssi",
                            "remote_enable",
                            "remote_unicast"
                        ]
                        record = (data_receive["info"]["room_id"],)
                        for i in dict_key:
                            if i in data_receive["info"]["dev_info"]:
                                record = record + (data_receive["info"]["dev_info"][i], )
                            else:
                                record = record + (-1, )
                        print(record)
                        cursor.execute(query, record)
                        print("Successfully insert ScanDevice to PostgreSQL")
                        cursor.close()
                        connect_to_database.close()
                    else:
                        print("Data exist in database!!!")
                else:
                    return False
    print("Time out scan !!!")

def SendAddNodeToGatewayBleMesh(client: ClientMQTT, command: str):

    client = ClientMQTT([add_device, new_node_topic])
    client.connect(broker, port)
    client.loop_start()

    action = 1 if command == "add" else 0
    topic = [add_device, new_node_topic]

    while NodeConfigurationBuffer.objects.filter(action = action).exists():

        latest_data_in_buffer = NodeConfigurationBuffer.objects.filter(action = action).order_by("id").first()
        latest_data_in_node_registration = RegistrationNode.objects.filter(room_id = latest_data_in_buffer.room_id,
                                                                                mac = latest_data_in_buffer.mac,).first()
        if action ==1 :
            data = {
                    "operator": "add_node",
                    "status": 1 ,
                    "info": {
                        "room_id":  latest_data_in_buffer.room_id,
                        "protocol": "ble_mesh",
                        "remote_prov":{
                            "enable": latest_data_in_node_registration.remote_enable,
                            "unicast": latest_data_in_node_registration.remote_unicast,
                        },
                        "dev_info": {
                            "uuid": latest_data_in_node_registration.uuid,
                            "device_name": latest_data_in_node_registration.device_name,
                            "mac": latest_data_in_node_registration.mac,
                            "address_type": latest_data_in_node_registration.address_type,
                            "oob_info": latest_data_in_node_registration.oob_info,
                            "adv_type": latest_data_in_node_registration.adv_type,
                            "bearer_type": latest_data_in_node_registration.bearer_type,
                            "rssi": latest_data_in_node_registration.rssi
                            }
                        }
                    }
        else:
            return None
        message_send = json.dumps(data)
        result = client.publish(topic[0], message_send)
        status = result[0]

        if status == 0:
            print("Successfully send message")
        else:
            raise Exception("Can't publish data to mqtt")
        
        current_time = int((datetime.datetime.now()).timestamp())
        check_status = True
        while True:
            if int((datetime.datetime.now()).timestamp()) - current_time > 20:
                print("Error")
                print("Step 1: Successfully Delete Buffer and Node in Function SendNodeToGatewayBleMesh")
                latest_data_in_buffer.delete()
                latest_data_in_node_registration.delete()
                check_status = False
                break
            
            message_receive = client.message_arrive()
            
            if message_receive != None:
                data_receive = json.loads(message_receive)
                print(data_receive)
                if data_receive["operator"] == "add_node_ack":

                    if data_receive["status"] == 1:
                        break
                    else:
                        print("Step 1: Successfully Delete Buffer and Node in Function SendNodeToGatewayBleMesh")
                        latest_data_in_buffer.delete()
                        latest_data_in_node_registration.delete()
                        check_status = False
                        break
        
        if check_status:

            while True:
                if int((datetime.datetime.now()).timestamp()) - current_time > 60:
                    latest_data_in_buffer.delete()
                    latest_data_in_node_registration.delete()
                    print("Step 2: Successfully Delete Buffer and Node in Function SendNodeToGatewayBleMesh")
                    break

                message_receive = client.message_arrive()
                if message_receive != None:
                    data_receive = json.loads(message_receive)

                    if data_receive["operator"] == "new_node_info":

                        if data_receive["status"] == 1:
                            latest_data_in_node_registration.function = data_receive["info"]["dev_info"]["function"]
                            latest_data_in_node_registration.unicast = data_receive["info"]["dev_info"]["unicast"]
                            latest_data_in_node_registration.status = "sync"
                            latest_data_in_node_registration.save()
                            latest_data_in_buffer.delete()
                            data_scan_device = ScanDevice.objects.filter(mac = latest_data_in_node_registration.mac)
                            data_scan_device.delete()
                            data_response = {
                                "operator": "new_node_info_ack",
                                "status": 1,
                                "info": {
                                    "room_id": latest_data_in_buffer.room_id,
                                    "protocol": "ble_mesh",
                                    "remote_prov":{
                                        "enable": latest_data_in_node_registration.remote_enable,
                                        "unicast": latest_data_in_node_registration.remote_unicast,
                                    },
                                    "dev_info": {
                                        "node_id": latest_data_in_node_registration.node_id,
                                        "function": latest_data_in_node_registration.function,
                                        "uuid": latest_data_in_node_registration.uuid,
                                        "device_name": latest_data_in_node_registration.device_name,
                                        'unicast': latest_data_in_node_registration.unicast,
                                    }
                                }
                            }
                            message_send = json.dumps(data_response)
                            result = client.publish(topic[1], message_send)
                            status = result[0]

                            if status == 0:
                                print("Successfully send message, Finish add node")
                            else:
                                raise Exception("Can't publish data to mqtt")
                            time.sleep(2)
                            message_receive = client.message_arrive() # need because send but not recieve
                            break
                        else:
                            print("Step 2: Successfully Delete Buffer and Node in Function SendNodeToGatewayBleMesh")
                            latest_data_in_buffer.delete()
                            latest_data_in_node_registration.delete()
                            check_status = False
                            break

    return None

def SendDeleteNodeToGatewayBleMesh(client: ClientMQTT, command: str):
    
    client = ClientMQTT([delete_device])
    client.connect(broker, port)
    client.loop_start()

    action = 0 if command == "delete" else 0
    topic = [delete_device]

    while NodeConfigurationBuffer.objects.filter(action = action).exists():

        latest_data_in_buffer = NodeConfigurationBuffer.objects.filter(action = action).order_by("id").first()
        latest_data_in_node_registration = RegistrationNode.objects.filter(room_id = latest_data_in_buffer.room_id,
                                                                                mac = latest_data_in_buffer.mac,).first()
        if action == 0 :
            data = {
                    "operator": "delete_node",
                    "status": 1,
                    "info": {
                        "room_id": latest_data_in_buffer.room_id,
                        "protocol": "ble_mesh",
                        "dev_info": {
                            "node_id": latest_data_in_node_registration.node_id,
                            "uuid": latest_data_in_node_registration.uuid,
                            "unicast": latest_data_in_node_registration.unicast
                        }
                    }
                }
        else:
            return None

        message_send = json.dumps(data)
        result = client.publish(topic[0], message_send)
        status = result[0]

        if status == 0:
            print("Successfully send message")
        else:
            raise Exception("Can't publish data to mqtt")

        current_time = int((datetime.datetime.now()).timestamp())
        while True:
            if int((datetime.datetime.now()).timestamp()) - current_time > 60:
                print("Successfully Delete Buffer and Update node in Function SendNodeToGatewayBleMesh")
                latest_data_in_buffer.delete()
                latest_data_in_node_registration.status = "sync"
                latest_data_in_node_registration.save()
                break

            message_receive = client.message_arrive()
            if message_receive != None:
                data_receive = json.loads(message_receive)

                if data_receive["operator"] == "delete_node_ack":

                    if data_receive["status"] == 1:
                        print("Successfully Delete Node")
                        latest_data_in_buffer.delete()
                        latest_data_in_node_registration.delete()
                        break
                    else:
                        print("Successfully Delete Buffer and Update node in Function SendNodeToGatewayBleMesh")
                        latest_data_in_node_registration.status = "sync"
                        latest_data_in_node_registration.save()
                        break

def SendNodeToGatewayWifi(client: ClientMQTT, command: str):

    client = ClientMQTT([add_device])
    client.connect(broker, port)
    client.loop_start()

    action = 1 if command == "add" else 0
    result = 0
    topic = "farm/sync_node"

    while NodeConfigurationBuffer.objects.filter(action = action).exists():

        latest_data_in_buffer = NodeConfigurationBuffer.objects.filter(action = action).order_by("id").first()
        latest_data_in_node_registration = RegistrationNode.objects.filter(room_id = latest_data_in_buffer.room_id,
                                                                            mac = latest_data_in_buffer.mac,
                                                                            ).first()
        new_data = None
        print(latest_data_in_buffer.mac)
        if command == "add":
            new_data = {
                        "operator": "server_add",
                        "info":
                        {
                            "room_id": int((latest_data_in_node_registration.room_id).room_id),
                            "node_id": int(latest_data_in_node_registration.node_id),
                            "node_function": str(latest_data_in_node_registration.function),
                            "mac_address": str(latest_data_in_node_registration.mac),
                            "time": int((datetime.datetime.now()).timestamp()) + 7*60*60,
                        }
                    }
        else:
            new_data = {
                        "operator": "server_delete",
                        "info":
                        {
                            "room_id": int((latest_data_in_node_registration.room_id).room_id),
                            "node_id": int(latest_data_in_node_registration.node_id),
                            "node_function": str(latest_data_in_node_registration.function),
                            "mac_address": str(latest_data_in_node_registration.mac),
                            "time": int((datetime.datetime.now()).timestamp()) + 7*60*60,
                        }
                    }

        message_send = json.dumps(new_data)
        result = client.publish(topic, message_send)
        status = result[0]

        if status == 0:
            print(f"Succesfully send '{message_send}' to topic '{topic}'")
        else:
            raise Exception("Can't publish data to mqtt")
        
        current_time = int((datetime.datetime.now()).timestamp())

        while True:

            if int((datetime.datetime.now()).timestamp()) - current_time > 60:

                if action == 1:
                    latest_data_in_node_registration.delete()
                    latest_data_in_buffer.delete()
                    print("Gateway does not response, finish deleting add data in registration and buffer")
                else:
                    latest_data_in_buffer.delete()
                    latest_data_in_node_registration.status = "sync"
                    latest_data_in_node_registration.save()
                    print("Gateway does not response, finish deleting add data in buffer")
                break

            time.sleep(2)
            message_receive = client.message_arrive()

            if message_receive != None:
                message_buffer = json.loads(message_receive)

                if action == 1:

                    if message_buffer["operator"] == "server_add_ack":

                        if message_buffer["status"] == 1:

                            if message_buffer["info"]["mac"] == str(latest_data_in_node_registration.mac):
                                print("SUCCESSFULLY")
                                latest_data_in_buffer.delete()
                                latest_data_in_node_registration.uuid = message_buffer["info"]["uuid"]
                                latest_data_in_node_registration.save()
                                data_response = {
                                            "operator": "server_add_ack",
                                            "status": int(1),
                                            "info":
                                                {
                                                    "node_id": int(latest_data_in_node_registration.node_id),
                                                    "token":str(message_buffer["info"]["token"])
                                                }
                                            }
                                result = client.publish(topic, json.dumps(data_response))
                                result = 1
                                current_time_2 = int((datetime.datetime.now()).timestamp())
                                time.sleep(2)

                                while True:

                                    if int((datetime.datetime.now()).timestamp()) - current_time_2 > 30:
                                        latest_data_in_node_registration.delete()
                                        print("Gateway does not response, finish deleting add data in registration")
                                        result = 0
                                        return result
                                    message_receive = client.message_arrive()
                                    if message_receive != None:

                                        message_buffer = json.loads(message_receive)
                                        
                                        if message_buffer["operator"] == "server_add_ack":

                                            if message_buffer["status"] == 2:
                                                print("Finish Processing")
                                                return result
                                            elif message_buffer["status"] == 1:
                                                pass
                                            else:
                                                latest_data_in_node_registration.delete()
                                                print("Gateway does not response, finish deleting add data in registration")
                                        
                                        else:
                                            latest_data_in_node_registration.delete()
                                            print("Gateway response wrong, finish deleting add data in registration")

                            else:
                                print("MAC WRONG, finish deleting add data in registration and buffer")
                                message_buffer["status"] = 0
                                message_buffer["info"]["mac"] = "Not Match"
                                result = client.publish(topic, json.dumps(message_buffer))
                                latest_data_in_node_registration.delete()
                                latest_data_in_buffer.delete()
                                result = 0
                                return result

                        else:
                            print("Gateway denied, finish deleting add data in registration and buffer")
                            result = client.publish(topic, json.dumps(message_buffer))
                            latest_data_in_node_registration.delete()
                            latest_data_in_buffer.delete()
                            result = 0
                            return result
                else:

                    if message_buffer["operator"] == "server_delete_ack":

                        if message_buffer["status"] == 1:
                            print("SUCCESSFULLY")
                            latest_data_in_buffer.delete()
                            result = 1
                            return result
                        else:
                            print("Gateway denied, finish deleting add data in buffer")
                            latest_data_in_buffer.delete()
                            latest_data_in_node_registration.status = "sync"
                            latest_data_in_node_registration.save()
                            result = 0
                            return result
    return result

def SendSetUpActuatorToGateway(client: ClientMQTT, data: dict):
    
    client = ClientMQTT([set_actuator])
    client.connect(broker, port)
    client.loop_start()

    data_query = RegistrationNode.objects.get(node_id = data["node_id"])

    for key in ["start_time", "end_time", "setpoint", "mode", "status"]:
        data.setdefault(key, -1)

    new_data = {
        "operator": "actuator_control",
        "status": 1,
        "info": {
            "room_id": data_query.room_id.room_id,
            "protocol":"ble_mesh",
            "node_id": data["node_id"],
            "function": data["function"],
            "control_state":{
                "setpoint": data["setpoint"],
                "mode": data["mode"],
                "status": data["status"],
                "start_time": data["start_time"],
                "end_time": data["end_time"]
            }
            }
        }

    new_data_save = {
    "operator": "actuator_control",
    "status": 1,
    "info": {
        "room_id": data_query.room_id.room_id,
        "node_id": data["node_id"],
        "function": data["function"],
        "setpoint": data["setpoint"],
        "mode": data["mode"],
        "status": data["status"],
        "start_time": data["start_time"],
        "end_time": data["end_time"]
        }
    }
    message_send = json.dumps(new_data)
    result = client.publish(topic_list[0], message_send)
    status = result[0]

    if status == 0:
        print("Successfully send message")
        pass
    else:
        raise Exception("Can't publish data to mqtt")
    
    curent_time = int((datetime.datetime.now()).timestamp())

    while True:

        if int((datetime.datetime.now()).timestamp()) - curent_time > 30:
            break

        message_receive = client.message_arrive()

        if message_receive != None:
            data_receive = json.loads(message_receive)

            if data_receive["operator"] == "actuator_control_ack":

                if data_receive["status"] == 1:
                    break

    return new_data_save