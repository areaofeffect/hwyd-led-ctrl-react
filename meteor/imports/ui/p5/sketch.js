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
  p5.updateWithProps = (props) => {
    if (!localProps.renderDisplay) {
      localProps.renderDisplay = props.renderDisplay;
    }
  };
};

// // pass in p5.js as function argument p5
// export default function sketch(p5) {
//   // set the intial ascii variable
//   let ascii = { text: "" };
//   // set variables for a grid of 100 possible values
//   let gridIndex = 0;
//   let gridMax = 99;
//   let gridPos = [];
//   // set the initial random text color
//   let r = p5.random(255);
//   let g = p5.random(255);
//   let b = p5.random(255);

//   p5.setup = function () {
//     // standard p5 setup code, note p5. because we passed it in above
//     p5.createCanvas(600, 400);
//     p5.background(255);
//     p5.textSize(30);

//     // make a grid of x,y positions based on our canvas size
//     for (var a = 0; a < p5.width; a += 60) {
//       for (var b = 0; b < p5.height; b += 40) {
//         gridPos.push({ x: a, y: b });
//       }
//     }
//   };

//   p5.draw = function () {
//     // fill the background of each square with white before drawing ascii chars
//     p5.fill(255);
//     p5.noStroke();
//     p5.rect(gridPos[gridIndex].x, gridPos[gridIndex].y, 60, 40);
//     // draw the incoming ascii from serial
//     p5.fill(r, g, b);
//     p5.text(ascii.text, gridPos[gridIndex].x + 20, gridPos[gridIndex].y + 30);
//   };

//   // this special function receives data from App.jsx withTracker
//   p5.updateWithProps = (props) => {
//     if (props.ascii) {
//       // get the new ascii object
//       ascii = props.ascii;
//       // increment the grid position
//       if (gridIndex < gridMax) {
//         gridIndex++;
//       } else {
//         gridIndex = 0;
//       }
//       // get a new random color
//       r = p5.random(255);
//       g = p5.random(255);
//       b = p5.random(255);
//     }
//   };
// }
