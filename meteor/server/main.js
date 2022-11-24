import { Meteor } from "meteor/meteor";
const { SerialPort } = require("serialport");
import { ReadlineParser } from "@serialport/parser-readline";
import { ReadyParser } from "@serialport/parser-ready";
import rgbHex from "rgb-hex";

let rainbowLoop = [];
let rainbowInterval;
let count = 0;

function printData(data) {
  console.log("the arduino sent: ", data);
}

const port = new SerialPort({ path: "/dev/cu.usbmodem1101", baudRate: 115200 });
const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));
// const readyParser = port.pipe(
//   new ReadyParser({ delimiter: "<Arduino is ready>" })
// );

parser.on("data", Meteor.bindEnvironment(printData));
// readyParser.on("ready", Meteor.bindEnvironment(onReady));

function sendRainbow() {
  var col = "<" + rainbowLoop[count] + ">";
  port.write(col);
  count++;

  if (count == rainbowLoop.length) {
    count = 0;
  }
}

// colors
function makeColorGradient(
  frequency1,
  frequency2,
  frequency3,
  phase1,
  phase2,
  phase3,
  center,
  width,
  len
) {
  if (center == undefined) center = 128;
  if (width == undefined) width = 127;
  if (len == undefined) len = 50;

  var values = [];
  for (var i = 0; i < len; ++i) {
    var r = Math.sin(frequency1 * i + phase1) * width + center;
    var g = Math.sin(frequency2 * i + phase2) * width + center;
    var b = Math.sin(frequency3 * i + phase3) * width + center;
    values.push(rgbHex(r, g, b));
  }
  return values;
}

function getRainbowLoop() {
  console.log("getRainbowLoop()");
  var center = 128;
  var width = 127;
  var steps = 72;
  var frequency = (2 * Math.PI) / steps;
  rainbowLoop = makeColorGradient(
    frequency,
    frequency,
    frequency,
    0,
    2,
    4,
    center,
    width,
    72
  );
  rainbowInterval = Meteor.setInterval(function () {
    sendRainbow();
  }, 200);
}

// hand shaking
function onReady() {
  console.log("the ready byte sequence has been received");
  port.write("0");
  // port.drain(() => {
  //   getRainbowLoop();
  // });
}

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
  "serial.write": function (data) {
    // get RGB from hex data
    var hexValue = "<" + rgbHex(data[0], data[1], data[2]) + ">";
    console.log("meteor will send a hex value: " + hexValue);
    port.write(hexValue, function (err) {
      if (err) {
        return console.log("error on serial write: ", err.message);
      }
    });
  },
});
