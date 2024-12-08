import paho.mqtt.client as mqtt

class ClientMQTT(mqtt.Client):

    def __init__(self, _topic_array = []):
        super().__init__()
        self.__check = False
        self.__message = None
        self._topic_array = _topic_array

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Successfully connect to server mqtt")
            for i in self._topic_array:
                self.subscribe(i)
                print(f"Succcessfully subscribe to {i}")
        else:
            print("Unsuccessfully connect to server mqtt")

    def on_message(self, client, userdata, message):
        self.__check = True
        self.__message = message.payload.decode("utf-8")

    def message_arrive(self):
        if self.__check  == True:
            self.__check = False
            return self.__message
        return None