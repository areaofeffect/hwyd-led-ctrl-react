If you have not installed Node or Meteor, follow the steps in [Setting up your development environment](https://github.com/areaofeffect/hello-world/blob/master/week8/README.md#setting-up-your-development-environment) before running this application.

# How to run LEDCtrl
## 1 
Download these files to your computer

## 2

Connect your Arduino to your computer via USB and run this [Arduino sketch](https://create.arduino.cc/editor/kandizzy/fbbf4417-436c-4f52-9d7a-d335af095458/preview)

How to find the path to your serial port

	ls -al /dev/cu*


## 3
Edit the `server/main.js` files on [line 20](https://github.com/areaofeffect/hwyd-led-ctrl-react/blob/master/server/main.js#L83) with your serial port from step 2

## 4
In Terminal, `cd` into this directory (serial-mqtt-app) and then run the following commands:

	meteor npm install 
	meteor add react-meteor-data
	
## 5

In Finder, navigation to `hwyd-led-ctrl-react/node_modules/p5/lib/addons` and put `p5.gif.js` , `p5.gif.min.js` and `supergif.js` in that folder. These files can be found here: [https://github.com/kandizzy/p5.gif.js](https://github.com/kandizzy/p5.gif.js)
	
## 6
In Terminal run

	meteor
View the application in your browser at `http://localhost:3000`

## 7
View MQTT messages in Terminal by running this command

	mosquitto_sub -h 127.0.0.1 -t {your-topic-here}
	



