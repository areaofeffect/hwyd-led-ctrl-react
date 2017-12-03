import { Meteor } from 'meteor/meteor';
import Led from '../imports/api/led.js'
import Coders from '../imports/api/coders.js'
import { connect } from 'mqtt/lib/connect';
import SerialPort from 'serialport';
const rgbHex = require('rgb-hex');

let rainbowLoop = [];
let rainbowInterval;
let count = 0;

function sendRainbow() {
  var col = rainbowLoop[count] + "\n";
  port.write(col);
  count ++;

  if (count == rainbowLoop.length) {
    count = 0;
  }

}

var port = new SerialPort('/dev/cu.usbmodem1411', {
  baudRate: 9600
});
const Ready = SerialPort.parsers.Ready;
const parser = port.pipe(new Ready({ delimiter: 'READY' }));

// setup the callbacks for the parser
// our callback function must be wrapped in Meteor.bindEnvironment to avoid Fiber errors
parser.on('ready', Meteor.bindEnvironment(onReady));
parser.on('data', Meteor.bindEnvironment(onData)); // all data after READY is received

// setup the callback for the port
// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
})

// hand shaking
function onReady() {
  console.log('the ready byte sequence has been received');
  port.write("0");
  port.drain(getRainbowLoop);
}

// parse the data from serial into meaningful objects
function onData(data) {
  console.log("meteor onData: " + data);
}

// serial event
function writeSerialData(data) {
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
    // get RGB from hex data
    var hexValue = rgbHex(pixels[0], pixels[1], pixels[2]) + "\n";
    writeSerialData(hexValue); // write data to the port
    client.publish("ledgrid", hexValue); // publish via mqtt
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
    Meteor.call('coders.upsert',message.toString());
  }
}

// client on message callback
client.on('message', Meteor.bindEnvironment(onMessage));

client.on("connect", function() {
  console.log("---- mqtt client connected ----");
  client.subscribe("ledgrid"); // subscribe to the ledgrid topic
  client.subscribe("name");
})

// colors
function makeColorGradient(frequency1, frequency2, frequency3,
                             phase1, phase2, phase3,
                             center, width, len)
{
  if (center == undefined)   center = 128;
  if (width == undefined)    width = 127;
  if (len == undefined)      len = 50;

  var values = [];
  for (var i = 0; i < len; ++i)
  {
     var r = Math.sin(frequency1*i + phase1) * width + center;
     var g = Math.sin(frequency2*i + phase2) * width + center;
     var b = Math.sin(frequency3*i + phase3) * width + center;
     values.push(rgbHex(r,g,b));
  }
  return values;
}

function getRainbowLoop() {
  var center = 128;
  var width = 127;  
  var steps = 36;
  var frequency = 2*Math.PI/steps;
  rainbowLoop = makeColorGradient(frequency,frequency,frequency,0,2,4,center,width,36);
  rainbowInterval = Meteor.setInterval(function () {
    sendRainbow();
  }, 50);
}

Meteor.startup(() => {
  // code to run on server at startup
});
