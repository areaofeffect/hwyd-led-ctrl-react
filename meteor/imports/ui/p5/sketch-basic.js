// pass in p5.js as function argument p5
export default function sketch (p5) {

  // sliders
  let rSlider, gSlider, bSlider; // control sliders
  let r, g, b;  // hue saturation brightness (this is really rgb for testing but should be changed to HSB)
  let faderVal; // fader Channel 1 and Channel 2

  // display size
  let gridWidth = 8;
  let gridHeight = 5;

  // display array -> can be sent to hardware
  //let ledPixels = []; // updating this to just color for now
  let ledColor = ["255", "255", "255"];

  // button
  let sendButton;

  let localProps = {};

  // send name button
  let nameButton;

  p5.setup = function() {
    p5.createCanvas(300,400);

    // create the UI
    initUI();

  }


  p5.draw = function() {
    p5.background(40);

    p5.noStroke();
    p5.fill(30);
    p5.rect(0,0,p5.width,40);
    p5.textSize(22);
    p5.fill(255);
    p5.text("How was your day?", 10, 30);

    p5.textSize(11);

    // process UI elements and update values
    r = rSlider.value();
    g = gSlider.value();
    b = bSlider.value();

    drawUI();

  }

  //
  // initUI
  //
  function initUI() {
    rSlider = p5.createSlider(0, 255, 255);
    gSlider = p5.createSlider(0, 255, 255);
    bSlider = p5.createSlider(0, 255, 255);

    rSlider.position(10, 230);
    gSlider.position(10, 250);
    bSlider.position(10, 270);

    rSlider.style('width', '80px');
    gSlider.style('width', '80px');
    bSlider.style('width', '80px');

    button = p5.createButton('send to display');
    button.position(25, 300);
    button.mousePressed(sendToDisplay);

    nameButton = p5.createButton('send name');
    nameButton.position(25, 320);
    nameButton.mousePressed(sendName);
  }

  function sendToDisplay() {

    ledColor[0] = r; 
    ledColor[1] = g;
    ledColor[2] = b;

    // this is what gets sent
    console.log(localProps, ledColor);
    localProps.renderDisplay(ledColor);
  }

  function sendName() {
    console.log("just clicked send name!");
    localProps.sendName('carrie');
  }

  function sendPixels() {
    console.log("sendPixels");
  }


  //
  // Draw UI
  //
  function drawUI() {

    // temporary UI and text controls
    // channel 1 controls
    p5.fill(255);
    p5.text("red (" + p5.str(r) + ")", 100, 245);
    p5.text("green (" + p5.str(g) + ")", 100, 265);
    p5.text("blue (" + p5.str(b) + ")", 100, 285);
    p5.text("Pick a color", 10, 220);

    p5.fill(r,g,b);
    p5.rect(10,100,160,100);

    p5.fill(255,255,0); // yellow
    p5.text("1. COLOR", 10, 80);


  }

  // this special function receives data from App.jsx withTracker
  p5.myCustomRedrawAccordingToNewPropsHandler = function (props) {
    console.log("myCustomRedrawAccordingToNewPropsHandler", props, localProps);


    if (!localProps.renderDisplay) {
      localProps.renderDisplay = props.renderDisplay;
    }

    if (!localProps.sendName) {
      localProps.sendName = props.sendName;
    }


  };
};










