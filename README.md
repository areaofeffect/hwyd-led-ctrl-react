If you have not installed Node or Meteor, follow the steps in [Setting up your development environment](https://github.com/areaofeffect/hello-world/tree/master/week9#setting-up-your-development-environment) before running this application.

# How to run LEDCtrl
## 1 
Download these files to your computer

## 2

Connect your Arduino to your computer via USB and run this [Arduino sketch](https://create.arduino.cc/editor/kandizzy/fbbf4417-436c-4f52-9d7a-d335af095458/preview)

How to find the path to your serial port

	ls -al /dev/cu*


## 3
Edit the `server/main.js` files on [line 23](https://github.com/areaofeffect/hwyd-led-ctrl-react/blob/v1_branch/meteor/server/main.js#L15) with your serial port from step 2

## 4
In Terminal, `cd` into this directory (hwyd-led-ctrl-react/meteor) and then run the following commands:

	meteor npm install 
	
	
## 5
In Terminal run

	meteor
View the application in your browser at `http://localhost:3000`

## 6
View MQTT messages MQTTx
	



