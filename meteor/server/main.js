import { Meteor } from 'meteor/meteor';
import Led from '../imports/api/led.js'
import { connect } from 'mqtt/lib/connect';
import SerialPort from 'serialport';
const rgbHex = require('rgb-hex');
 
const Readline = SerialPort.parsers.Readline;
const parser = new Readline();
var port = new SerialPort('/dev/cu.usbmodem145241', {
  baudRate: 115200
});
port.pipe(parser);

// global ok?
var message = "yo";

// parse the data from serial into meaningful objects
function onData(data) {
  console.log("meteor onData: " + data);
  
  if (data.trim() == "RDY") {
    writeSerialData(message + '|'); // write data to the port
  }
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

// meteor
Meteor.methods({
  'serial.write'(pixels) {

    for (var i = 0; i < pixels.length; i++) {
      // get RGB from hex data
      var hexValue = rgbHex(pixels[i].r, pixels[i].g, pixels[i].b);
      if (i < pixels.length-1) {
        hexValue += ",";
      }
      
      message += hexValue;
      
      //writeSerialData("#" + hexValue + ":" + i + ">") // write data to the port
    }


    // Meteor.setTimeout(function() {
    //   writeSerialData(message + '#')
    // }, 100);
    
    client.publish("ledgrid", message);
    writeSerialData("RCV 512\r") // write data to the port
    client.publish("ledgrid", message); // publish via mqtt
    
  }
})

 
// MQTT
export const config = {
  mqttHost: "mqtt://127.0.0.1",
  mqttPort: 1883
};

export const client = connect(config.mqttHost);

// client callback
client.on('message', function (topic, message) {
  // message is Buffer
  // console.log("received_message", message.toString());

  // var splitIntoPixels = message.toString().split("|");

  // for (var i = 0; i < splitIntoPixels.length - 1; i++) {
  //   console.log(splitIntoPixels[i]);
  //   writeSerialData(splitIntoPixels[i]);
  // }
})

client.on("connect", function() {
  console.log("---- mqtt client connected ----");
  client.subscribe("ledgrid"); // subscribe to the ledgrid topic
})

Meteor.startup(() => {
  // code to run on server at startup
});
