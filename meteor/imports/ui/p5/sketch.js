// pass in p5.js as function argument p5
export default function sketch (p5) {

  // sliders
  let rSlider, gSlider, bSlider, fSlider; // control sliders
  let h, s, b;  // hue saturation brightness (this is really rgb for testing but should be changed to HSB)
  let faderVal; // fader Channel 1 and Channel 2

  // dropdowns
  let imageSelect;
  let gifSelect;

  // preview images
  let testImg;
  let testGif;
  let imageMask;

  // buffers
  let ouputBuffer; // fbo to mix frames and images

  // display size
  let gridWidth = 8;
  let gridHeight = 5;

  // scale
  let vScale = 20; // the downsampled pixels

  // display array -> can be sent to hardware
  let ledPixels = [];

  // checkboxes
  let enableGif;
  let enableDrawable;
  let gifBool = false; // is enabled or not
  let drawBool = false; // is enabled or not

  // button
  let sendButton;

  //
  let localProps = {};

  p5.setup = function() {
    p5.createCanvas(800,600);

    // create the UI
    initUI();

    // default images
    testImg = p5.loadImage("/img/gradient.png"); // Load the image 
    testGif = p5.loadGif('/gif/material_gradient.gif');

    // buffers
    ouputBuffer = p5.createGraphics(160,100);
    ouputBuffer.pixelDensity(1); // to support retina display
    //ouputBuffer.scale(1/4);

    // create the pixel objects
    for (var y = 0; y < 5; y++) {
      for (var x = 0; x < 8; x++) {
        ledPixels.push(new LedPixel(x,y));
      }
    }
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
    h = rSlider.value();
    s = gSlider.value();
    b = bSlider.value();
    faderVal = fSlider.value();
    
    // this is the frame buffer, the point of it is to preview the output
    // kinda like an FBO. It is a tad slow though.
    // this is important because we can apply blendings and such here
    ouputBuffer.background(0);
    ouputBuffer.noStroke();
    ouputBuffer.tint(h,s,b, faderVal); // does this make sense?
    ouputBuffer.rect(0,0,160,100);
    ouputBuffer.image(testImg,0,0, 160, 100);
    ouputBuffer.fill(h,s,b, 255-faderVal);
    ouputBuffer.rect(0,0,160,100);

    // if gif is enabled draw that to the output buffer too
    if(gifBool){
      if (testGif.loaded()) {
        ouputBuffer.image(testGif,0,0, 160, 100);
      }
    }

    calculateDownsample();

    drawUI();

  }

  //
  // initUI
  //
  function initUI() {
    rSlider = p5.createSlider(0, 255, 255);
    gSlider = p5.createSlider(0, 255, 255);
    bSlider = p5.createSlider(0, 255, 255);
    fSlider = p5.createSlider(0, 255, 127);

    rSlider.position(10, 230);
    gSlider.position(10, 250);
    bSlider.position(10, 270);
    fSlider.position(225, 230);

    rSlider.style('width', '80px');
    gSlider.style('width', '80px');
    bSlider.style('width', '80px');
    fSlider.style('width', '80px');

    // checkboxes
    enableGif = p5.createCheckbox('enable gif layer');
    enableGif.position(580, 225)
    enableGif.checked(false); // passing in an arg sets its state?
    enableGif.style('color', '#FFF');
    enableGif.changed(enableGifEvent); // even for when the user does something

    // checkboxes
    enableGif = p5.createCheckbox('enable interactive layer');
    enableGif.position(200, 530)
    enableGif.checked(false); // passing in an arg sets its state?
    enableGif.style('color', '#FFF');
    enableGif.changed(enableDrawableEvent); // even for when the user does something

    // dropdown
    imageSelect = p5.createSelect();
    imageSelect.position(390, 250);
    imageSelect.option('gradient.png');
    imageSelect.option('gradient2.png');
    imageSelect.option('cat.jpg');
    imageSelect.option('tiger.jpg');
    imageSelect.option('tanook.jpg');
    imageSelect.option('half.png');
    imageSelect.changed(imageEvent);

    // dropdown
    gifSelect = p5.createSelect();
    gifSelect.position(580, 250);
    gifSelect.option('colors1.gif');
    gifSelect.option('colors2.gif');
    gifSelect.option('material_gradient.gif');
    gifSelect.option('radial-gradient.gif');
    gifSelect.option('hypnotize10.gif');
    gifSelect.option('larson.gif');
    gifSelect.option('night1.gif');
    gifSelect.option('night2.gif');
    gifSelect.option('stars.gif');
    gifSelect.option('psyc.gif');
    gifSelect.changed(gifEvent);

    button = p5.createButton('send to display');
    button.position(400, 540);
    button.mousePressed(sendToDisplay);
  }

  function sendToDisplay() {
    // this is what gets sent
    console.log(localProps, ledPixels);
    localProps.renderDisplay(ledPixels);
  }


  //
  // Draw UI
  //
  function drawUI() {

    // temporary UI and text controls
    // channel 1 controls
    p5.fill(255);
    p5.text("red (" + p5.str(h) + ")", 100, 245);
    p5.text("green (" + p5.str(s) + ")", 100, 265);
    p5.text("blue (" + p5.str(b) + ")", 100, 285);
    p5.text("Pick a color", 10, 220);

    p5.fill(h,s,b);
    p5.rect(10,100,160,100);

    // channel 2 controls
    p5.fill(255);
    p5.text("Pick an image", 390, 220);
    p5.text("Enable or disable gif layer", 580, 220);
    p5.fill(127,127,127);
    p5.rect(390,100,160,100);
    p5.image(testImg,390,100,160,100)

    // output controls
    p5.fill(255);
    p5.text("Crossfade IMAGE / COLOR", 200, 220);
    p5.fill(127,127,127);
    p5.rect(200,100,160,100);
    p5.image(testImg,200,100,160,100);

    p5.fill(h,s,b, 255-faderVal); // this could be better
    p5.rect(200,100,160,100);

    p5.fill(255,255,0); // yellow
    p5.text("1. COLOR", 10, 80);
    p5.text("2. IMAGE PICKER", 390, 80);
    p5.text("3. GIF ANIMATION", 580, 80);
    p5.text("OUTPUT PREVIEW (1+2+3)", 10, 380);
    p5.text("4. INTERACTIVE", 200, 380);
    p5.text("5. FINAL LED RESULT", 400, 380);

    p5.fill(255); // white
    p5.text("click to toggle pixels", 200, 520);
    p5.text("combined layers buffer", 10, 520);
    p5.text("This is mapped to display.", 400, 520);

    p5.image(testGif, 580, 100, 160,100);
    p5.image(ouputBuffer, 10, 400);

    if(gifBool){
      if (!testGif.loaded()) {
        p5.text("loading gif",60, 460);
      }
    }

    p5.fill(255);
    p5.text("ch2", 315, 245);
    p5.text("ch1", 200, 245);
    p5.text("fader", 250, 260);

    // ui frames
    p5.noFill();
    p5.strokeWeight(1);
    p5.stroke(255);
    p5.rect(0,60,180,260);

    p5.rect(380,60,180,260);
    p5.rect(570,60,180,260);
  }

  //
  // UI EVENTS - these are triggered from the UI
  //
  function imageEvent() { 
    // triggered when that dropdown changes
    var item = imageSelect.value();
    testImg = p5.loadImage("/img/" + item); // Load the image
    testImg.resize(160,100);
  }

  function gifEvent() {
    // triggered when that dropdown changes
    var gifItem = gifSelect.value();
    testGif = p5.loadGif("/gif/" + gifItem);
  }

  function enableGifEvent() {
    // triggered when the checkbox changes
    testGif.pause();
    gifBool = !gifBool;

    if (gifBool) {
      testGif.play();
    } else {
      testGif.pause();
    }
  }

  function enableDrawableEvent() {
    // triggered when the checkbox changes
    drawBool = !drawBool;
  }

  function calculateDownsample() {
    // takes the pixels from the output buffer
    // and downsamples them to be displayed on our LED matrix

    ouputBuffer.loadPixels(); // load the pixels

    // loop through
    for (var x = 0; x < 8; x++) {
      for (var y = 0; y < 5; y++) {
        var index = (x*vScale + 1 + (y*vScale * 160))*4;
        var r = ouputBuffer.pixels[index+0];
        var g = ouputBuffer.pixels[index+1];
        var b = ouputBuffer.pixels[index+2];

        // this value is the 1 demensional index in the 8 * 5 loop
        // they should calculate sequentially 1,2,3 etc...
        var value = x + y * 8;
        
        // this is our array
        ledPixels[value].r = r;
        ledPixels[value].g = g;
        ledPixels[value].b = b;
        ledPixels[value].index = value; // -> this to the display
        ledPixels[value].x = 200 + x*vScale; // vScale is the size of the blocks (20px)
        ledPixels[value].y = 400 + y*vScale;
        ledPixels[value].display(); // display renders downsampled pixels at their x,y location

        // TODO: add send to display method
        // this is not written yet but should basically accept
        // an array of values and map them to the pixels on the arduino

        // - might have to be an index,r,g,b for each pixel to have color
        // display.render(ledPixels);
        
        p5.noStroke();
        
        // INTERACTIVE
        // loop throught he pixels and calculate which ones are to be masked
        if (ledPixels[value].toggle) { // if that particular pixel is toggeled
          if (drawBool) { // is drawing mask enabled?
            p5.fill(255,255,255,255)
          } else {
            p5.fill(r,g,b);
          }
        } else {
          p5.fill(r,g,b);
        }

        // this is the final value of the pixel (final result)
        p5.rect(400 + x*vScale, 400 + y*vScale, 20, 20);
      }
    }
  }

  function mousePressed() {
    // for the interactive panel. this sets drawable pixels on and off
    for (var x = 0; x < ledPixels.length; x++) {
      ledPixels[x].clicked();
    }
  }

  function LedPixel(x, y) {
    this.state = "off";
    this.toggle = false; // have we clicked it or not
    this.isHover = false; // the the mouse over it
    this.x = x; // the xpositon to draw
    this.y = y; // the yposition to draw
    this.index = 0; // the index of the pixel

    this.r = 0;
    this.g = 0;
    this.b = 0;

    this.display = function() {
      this.checkHover();

      if (this.toggle) {
        p5.fill(255);
      } 

      p5.stroke(1);
      p5.rect(this.x,this.y,20,20);

      // show the pixel number over the tile
      p5.fill(0,255,0)
      p5.text(String(this.index),this.x + 5,this.y + 15);
    }

    this.checkHover = function() {
      if (p5.mouseX > this.x && p5.mouseX <= this.x + 20) {
        if (p5.mouseY > this.y && p5.mouseY <= this.y + 20) {
          this.isHover = true;
          p5.fill(200);
        }
        else {
          this.isHover = false;
          p5.fill(120);
        }
      } 
      else {
        this.isHover = false;
        p5.fill(120);
      }
    }

    this.clicked = function() {
      // are we inside?
      if (p5.mouseX > this.x && p5.mouseX <= this.x + 20) {
        if (p5.mouseY > this.y && p5.mouseY <= this.y + 20) {
          console.log("clicked!" + String(this.index));
          this.toggle = !this.toggle;
        }
      }
    }
  };

  // this special function receives data from App.jsx withTracker
  p5.myCustomRedrawAccordingToNewPropsHandler = function (props) {
    console.log("myCustomRedrawAccordingToNewPropsHandler", props, localProps);
    localProps = props;

  };
};