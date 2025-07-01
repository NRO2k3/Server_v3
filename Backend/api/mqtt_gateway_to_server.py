import multiprocessing
import json
import psycopg2
import time
import requests
import os
from dotenv import load_dotenv
from mqtt_class import ClientMQTT

load_dotenv()

_ONE_SECOND = 1
_ONE_MINUTE = 60 * _ONE_SECOND
_ONE_HOUR = 60 * _ONE_MINUTE

backend_topic_dictionary = {
                        "sensor_data": "farm/monitor/sensor",
                        "actuator_data": "farm/monitor/actuator",
                        "health_check": "farm/monitor/alive"
                        }

broker = os.environ.get('SERVER_BROKER')
port = 1883

def DataForAqiRef():

    url = "https://api.waqi.info/feed/here/?token=08f2de731b94a1ff55e871514aa8f145e12ebafe"
    dict_key = [
        "aqi",
        "pm25",
        "pm10",
        "o3",
        "no2",
        "so2",
        "co",
        "t",
        "p",
        "h",
        "w",
        "dew",
        "wg",
    ]

    while True:

        try:
            data = requests.get(url)

            if data.status_code == 200:

                data_json = data.json()
                time_check = data_json["data"]["time"]["v"]
                data_save_to_database = {}

                try:
                    connect_to_database = psycopg2.connect(
                        database = os.environ.get('POSTGRES_DB'),
                        user = os.environ.get('POSTGRES_USER'),
                        password = os.environ.get('POSTGRES_PASSWORD'),
                        host = os.environ.get('HOST_NAME'),
                        port = "5432",
                    )
                    print("Successfully to connect database in function DataForAqiRef")
                except psycopg2.OperationalError as e:
                    connect_to_database = None
                    print(e)

                connect_to_database.autocommit = True
                cursor = connect_to_database.cursor()
                query = "SELECT time FROM api_aqiref ORDER BY time DESC"
                cursor.execute(query)
                all_data_in_aqiref_desc_time = cursor.fetchall()

                if len( all_data_in_aqiref_desc_time) == 0:
                    print("No data in aqiref. Able to save database")
                else:
                    print(all_data_in_aqiref_desc_time[0][0])
                    if (all_data_in_aqiref_desc_time[0][0] == time_check):
                        print("This time've already in database")
                        cursor.close()
                        connect_to_database.close()
                        time.sleep(_ONE_HOUR)
                        continue

                data_save_to_database["time"] = time_check

                for i in dict_key:

                    if i == "aqi":

                        if i in data_json["data"]:
                            data_save_to_database[i] = data_json["data"]["aqi"]
                        else:
                            data_save_to_database[i] = -1
                    
                    else:
                        print(i)
                        if i in data_json["data"]["iaqi"]:
                            data_save_to_database[i] = data_json["data"]["iaqi"][i]['v']
                        else:
                            data_save_to_database[i] = -1

                print(data_save_to_database)
                query = f"""INSERT INTO api_aqiref (time, aqi, pm25, pm10, o3, no2, so2, co, t, p, h, w, dew, wg) 
                        VALUES (%s, %s, %s, %s ,%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
                record = ( data_save_to_database["time"], )
                for i in dict_key:
                    record = record + (data_save_to_database[i], )
                print(record)
                cursor.execute(query, record)
                print("Successfully insert AQI REF to PostgreSQL")
                cursor.close()
                connect_to_database.close()

        except:
            print("Error to get api aqiref!")
        time.sleep(2*_ONE_HOUR)

def DataFromSensorNode():

    client = ClientMQTT([backend_topic_dictionary["sensor_data"],])
    client.connect(broker, port)
    client.loop_start()

    while True:

        try:
            message_receive = client.message_arrive()

            if message_receive != None:
                print(f"Received `{message_receive}`")
                data_receive = json.loads(message_receive)

                if data_receive["operator"] == "sensor_data":

                    try:
                        connect_to_database = psycopg2.connect(
                            database = os.environ.get('POSTGRES_DB'),
                            user = os.environ.get('POSTGRES_USER'),
                            password = os.environ.get('POSTGRES_PASSWORD'),
                            host = os.environ.get('HOST_NAME'),
                            port = "5432",
                        )
                        print("Successfully to connect database in function DataFromSensorNode")
                    except psycopg2.OperationalError as e:
                        connect_to_database = None
                        print(e)
                
                    connect_to_database.autocommit = True
                    cursor = connect_to_database.cursor()
                    query = f"""INSERT INTO api_rawsensormonitor (room_id, node_id, co2, temp, hum, light,
                                                                dust, sound, red, green, blue, tvoc, motion, time)
                                VALUES (%s, %s, %s, %s ,%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
                    dict_key = [
                        "room_id",
                        "node_id",
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
                    record = ()

                    for i in dict_key:
                        if i in data_receive["info"]:
                            record = record + (data_receive["info"][i], )
                        else:
                            record = record + (-1, )
                    print(record)
                    cursor.execute(query, record)
                    print("Successfully insert RawSensorMonitor to PostgreSQL")
                    cursor.close()
                    connect_to_database.close()
                elif data_receive["operator"] == "energy_data":

                    try:
                        connect_to_database = psycopg2.connect(
                            database = os.environ.get('POSTGRES_DB'),
                            user = os.environ.get('POSTGRES_USER'),
                            password = os.environ.get('POSTGRES_PASSWORD'),
                            host = os.environ.get('HOST_NAME'),
                            port = "5432",
                        )
                        print("Successfully to connect database in function DataFromSensorNode")
                    except psycopg2.OperationalError as e:
                        connect_to_database = None
                        print(e)

                    connect_to_database.autocommit = True
                    cursor = connect_to_database.cursor()
                    query = f"""INSERT INTO api_energydata(room_id, node_id, voltage, current, active_power, power_factor,
                                                            frequency, active_energy, time)
                                VALUES (%s, %s, %s, %s, %s, %s ,%s, %s, %s)"""
                    dict_key = [
                        "room_id",
                        "node_id",
                        "voltage",
                        "current",
                        "active_power",
                        "power_factor",
                        "frequency",
                        "active_energy",
                        "time",
                    ]
                    record = ()
                    for i in dict_key:
                        if i in data_receive["info"]:
                            record = record + (data_receive["info"][i], )
                        else:
                            record = record + (-1, )
                    print(record)
                    cursor.execute(query, record)
                    print("Successfully insert EnergyData to PostgreSQL")
                    cursor.close()
                    connect_to_database.close()
                else:
                    print("Message doesn't belong to this function DataFromSensorNode")
        except:
            print("Something was wrong while inserting to database !!!")

def DataFromActuator():

    client = ClientMQTT([backend_topic_dictionary["actuator_data"]],)
    client.connect(broker, port)
    client.loop_start()

    while True:
        try:
            message_receive = client.message_arrive()

            if message_receive != None:
                print(f"Received `{message_receive}`")
                data_receive = json.loads(message_receive)

                if data_receive["operator"] == "actuator_data":

                    try:
                        connect_to_database = psycopg2.connect(
                            database = os.environ.get('POSTGRES_DB'),
                            user = os.environ.get('POSTGRES_USER'),
                            password = os.environ.get('POSTGRES_PASSWORD'),
                            host = os.environ.get('HOST_NAME'),
                            port = "5432",
                        )
                        print("Successfully to connect database in function DataFromActuator")
                    except psycopg2.OperationalError as e:
                        connect_to_database = None
                        print(e)

                    connect_to_database.autocommit = True
                    cursor = connect_to_database.cursor()
                    query = f"""INSERT INTO api_rawactuatormonitor (room_id, node_id, function, current_value, state, mode, time)
                                VALUES (%s, %s, %s, %s, %s, %s, %s)"""
                    dict_key = [
                        "room_id",
                        "node_id",
                        "function",
                        "current_value",
                        "state",
                        "mode",
                        "time",
                    ]
                    record = ()

                    for i in dict_key:
                        if i in data_receive["info"]:
                            record = record + (data_receive["info"][i], )
                        else:
                            record = record + (-1, )
                    print(record)
                    cursor.execute(query, record)
                    print("Successfully insert RawActuatorMonitor to PostgreSQL")
                    cursor.close()
                    connect_to_database.close()
                else:
                    print("Message doesn't belong to this function DataFromActuator")

        except:
            print("Something was wrong while inserting to database !!!")

def HealthCheckNode():

    client = ClientMQTT([backend_topic_dictionary["health_check"]],)
    client.connect(broker, port)
    client.loop_start()

    while True:
        try:
            message_receive = client.message_arrive()

            if message_receive != None:
                print(f"Received `{message_receive}`")
                data_receive = json.loads(message_receive)

                if data_receive["operator"] == "keepalive_node":
                    try:
                        connect_to_database = psycopg2.connect(
                            database = os.environ.get('POSTGRES_DB'),
                            user = os.environ.get('POSTGRES_USER'),
                            password = os.environ.get('POSTGRES_PASSWORD'),
                            host = os.environ.get('HOST_NAME'),
                            port = "5432",
                        )
                        print("Successfully to connect database in function DataFromActuator")
                    except psycopg2.OperationalError as e:
                        connect_to_database = None
                        print(e)

                    connect_to_database.autocommit = True
                    cursor = connect_to_database.cursor()
                    query = f"""UPDATE api_registrationnode SET status = %s WHERE node_id = %s"""
                    record = (data_receive["info"]["node_status"],data_receive["info"]["node_id"])
                    print(record)
                    cursor.execute(query, record)
                    print("Successfully update api_registrationnode to PostgreSQL")
                    cursor.close()
                    connect_to_database.close()
                else:
                    print("Message doesn't belong to this function HealthCheckNode")

        except:
            print("Something was wrong while inserting to database !!!")

if __name__ == "__main__":
    process_list = []
    process_list.append(multiprocessing.Process(target = DataFromSensorNode))
    process_list.append(multiprocessing.Process(target = DataFromActuator))
    process_list.append(multiprocessing.Process(target = DataForAqiRef))
    process_list.append(multiprocessing.Process(target = HealthCheckNode))

    for i in process_list:
        i.start()
    for i in process_list:
        i.join()
