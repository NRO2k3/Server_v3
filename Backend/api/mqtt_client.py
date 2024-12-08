from .mqtt_class import ClientMQTT
import datetime
import json, time
from .models import RegistrationNode, NodeConfigurationBuffer

backend_topic_dictionary = {
                        "node_sync_backend_gateway": "farm/sync_node",
                        "set_actuator": "farm/set_actuator",
                        }

client = ClientMQTT([backend_topic_dictionary["node_sync_backend_gateway"], backend_topic_dictionary["set_actuator"]])
mqtt_broker = "127.0.0.1"
mqtt_port = 1883
client.connect(mqtt_broker, mqtt_port)
client.loop_start()

def SendNodeToGateway(client : ClientMQTT, command: str):

    action = 1 if command == "add" else 0
    result = 0
    topic = backend_topic_dictionary["node_sync_backend_gateway"]

    while NodeConfigurationBuffer.objects.filter(action = action).exists():

        latest_data_in_buffer = NodeConfigurationBuffer.objects.filter(action = action).order_by("id").first()
        latest_data_in_node_registration = RegistrationNode.objects.filter(room_id = latest_data_in_buffer.room_id,
                                                                            mac = latest_data_in_buffer.mac,
                                                                            ).first()
        new_data = None

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

            if int((datetime.datetime.now()).timestamp()) - current_time > 30:

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

            client.subscribe(topic)
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

def SendSetUpActuatorToGateway(client : ClientMQTT, data: dict):
    
    data_query = RegistrationNode.objects.get(node_id = data["node_id"])

    if "temp" not in data:
        data["temp"] = -1
    if "start_time" not in data:
        data["start_time"] = -1
    if "end_time" not in data:
        data["end_time"] = -1

    new_data = {
        "operator": "server_control",
        "status": 1,
        "info": {
            "room_id": data_query.room_id.room_id,
            "node_id": data["node_id"],
            "function": data_query.function,
            "setpoint": data["setpoint"],
            "mode": data["mode"],
            "temp": data["temp"],
            "start_time": data["start_time"],
            "end_time": data["end_time"],
            "time": int((datetime.datetime.now()).timestamp()) + 7*60*60
            }
        }
    message_send = json.dumps(new_data)
    result = client.publish(backend_topic_dictionary["set_actuator"], message_send)
    status = result[0]

    if status == 0:
        print("Successfully send message")
        pass
    else:
        raise Exception("Can't publish data to mqtt")
    
    new_data["info"]["status"] = 0
    curent_time = int((datetime.datetime.now()).timestamp())

    while True:

        if int((datetime.datetime.now()).timestamp()) - curent_time > 20:
            break

        message_receive = client.message_arrive()

        if message_receive != None:
            data_receive = json.loads(message_receive)

            if data_receive["operator"] == "server_control_ack":

                if data_receive["status"] == 1:
                    new_data["info"]["status"] = 1
                    break

    return new_data