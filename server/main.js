import { Meteor } from 'meteor/meteor';
import Led from '../imports/api/led.js'
import { connect } from 'mqtt/lib/connect';
import SerialPort from 'serialport';
 


const Readline = SerialPort.parsers.Readline;
const parser = new Readline();
var port = new SerialPort('/dev/cu.usbmodem1421', {
  baudRate: 9600
});
port.pipe(parser);

// parse the data from serial into meaningful objects
function onData(data) {
  console.log(data);
  // send the character over mqtt
  // client.publish("led", text);
}

// our callback function must be wrapped in Meteor.bindEnvironment to avoid Fiber errors
parser.on('data', Meteor.bindEnvironment(onData));


export const config = {
  mqttHost: "mqtt://127.0.0.1",
  mqttPort: 1883
};

export const client = connect(config.mqttHost);

client.on("connect", function() {
  console.log("---- mqtt client connected ----");
})

Meteor.startup(() => {
  // code to run on server at startup
});
