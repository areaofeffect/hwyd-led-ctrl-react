import { Meteor } from 'meteor/meteor';
import Led from '../imports/api/led.js'
import Coders from '../imports/api/coders.js'
import { connect } from 'mqtt/lib/connect';
import SerialPort from 'serialport';
const rgbHex = require('rgb-hex');
 
const Readline = SerialPort.parsers.Readline;
const parser = new Readline();
var port = new SerialPort('/dev/cu.usbmodem1421', {
  baudRate: 9600
});
port.pipe(parser);


// parse the data from serial into meaningful objects
function onData(data) {
  console.log("meteor onData: " + data);
  
  // send the character over mqtt
  // client.publish("led", text);
}

// setup the callback for the parser
// our callback function must be wrapped in Meteor.bindEnvironment to avoid Fiber errors
parser.on('data', Meteor.bindEnvironment(onData));

// setup the callback for the port
// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
})

// heres wehre you type in your name


// serial event
function writeSerialData(data) {
  var buffer = Buffer.from(data);

  port.write(data, function(err) {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('meteor wrote', data);
  });

}

function saveCoderInDataBase(name) {
  Meteor.call('coders.upsert', name);
}

// meteor
Meteor.methods({
  'serial.write'(pixels) {

    // global ok?
    var message = "";

    // get RGB from hex data
    var hexValue = rgbHex(pixels[0], pixels[1], pixels[2]);

    message = hexValue;

    writeSerialData(message + '|'); // write data to the port
    client.publish("ledgrid", message); // publish via mqtt
    
  },
  'send.name'(name) {

    console.log("Meteor send.name", name);
    client.publish("name", name); // publish via mqtt

  }
})

 
// MQTT
export const config = {
  mqttHost: "mqtt://127.0.0.1",
  mqttPort: 1883
};

export const client = connect(config.mqttHost);

function onMessage(topic, message) {
  if (topic === "name") {
    console.log("message", message.toString());
    Meteor.call('coders.upsert',name);
  }
}

// client callback
client.on('message', Meteor.bindEnvironment(onMessage));

client.on("connect", function() {
  console.log("---- mqtt client connected ----");
  client.subscribe("ledgrid"); // subscribe to the ledgrid topic
  client.subscribe("name");
})

Meteor.startup(() => {
  // code to run on server at startup
});
