// pass in p5.js as function argument p5
export default function sketch (p5) {

  console.log(p5);

  // display size
  let gridWidth = 8;
  let gridHeight = 5;

  // sliders
  let rSlider, gSlider, bSlider, fSlider; // control sliders
  let h, s, b; // hue saturation brightness
  let faderVal; // fader Channel 1 and Channel 2

  // dropdowns
  let imageSelect;
  let gifSelect;

  // image
  let testImg;
  let imageMask;

  // buffers
  let ouputBuffer;

  // scale
  let vScale = 20;

  // display
  let ledPixels = [];

  // gif
  let testGif;

  // checkbox
  let enableGif;
  let enableDrawable;
  let gifBool = false;
  let drawBool = false;

  // socket
  let socket;

  p5.setup = function() {
    p5.createCanvas(800,600);

    testImg = p5.loadImage("/img/gradient.png"); // Load the image
    //imageMask = loadImage("/img/half.png")
   
    testGif = p5.loadGif('material_gradient.gif');


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
    p5.fill(255);
    enableGif = p5.createCheckbox('enableGif');
    enableGif.position(580, 220)
    enableGif.checked(false); // passing in an arg sets its state?
    enableGif.style('color', '#FFF');
    enableGif.changed(enableGifEvent); // even for when the user does something

    // checkboxes
    p5.fill(255);
    enableGif = p5.createCheckbox('enableDrawable');
    enableGif.position(200, 530)
    enableGif.checked(false); // passing in an arg sets its state?
    enableGif.style('color', '#FFF');
    enableGif.changed(enableDrawableEvent); // even for when the user does something
    

    // buffers
    ouputBuffer = p5.createGraphics(160,100);
    ouputBuffer.pixelDensity(1);
    //ouputBuffer.scale(1/4);

    // dropdown
    imageSelect = p5.createSelect();
    imageSelect.position(390, 250);
    imageSelect.option('gradient.png');
    imageSelect.option('gradient2.png');
    imageSelect.option('cat.jpg');
    imageSelect.option('tiger.jpg');
    imageSelect.option('tanook.jpg');
    imageSelect.option('half.png');
    //imageSelect.option('colors1.gif');
    //imageSelect.option('colors2.gif');
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
    //imageSelect.option('colors1.gif');
    //imageSelect.option('colors2.gif');
    gifSelect.changed(gifEvent);

    updateFromUI();

    for (var y = 0; y < 5; y++) {
      for (var x = 0; x < 8; x++) {
        ledPixels.push(new LedPixel(x,y));
      }
    }
    
  }



  function imageEvent() {
    var item = imageSelect.value();
    testImg = loadImage("/img" + item); // Load the image
    testImg.resize(160,100);
  }

  function gifEvent() {
    var gifItem = gifSelect.value();
    testGif = loadGif("/gif" + gifItem);
  }

  function enableGifEvent() {
    testGif.pause();

    gifBool = !gifBool;

    if (gifBool)
      testGif.play();
    else
      testGif.pause();
  }

  function enableDrawableEvent() {
    drawBool = !drawBool;

  }

  p5.draw = function() {
    p5.background(30);

    p5.textSize(32);
    p5.text("LED CTRL", 10, 40);
    p5.textSize(11);

    //background(h, s, b);
    updateFromUI();

    // channel 1 controls
    p5.fill(255);
    p5.text("red (" + p5.str(h) + ")", 100, 245);
    p5.text("green (" + p5.str(s) + ")", 100, 265);
    p5.text("blue (" + p5.str(b) + ")", 100, 285);
    p5.text("channel 1 (HSB)", 10, 220);

    p5.fill(h,s,b);
    p5.rect(10,100,160,100);

    // channel 2 controls
    p5.fill(255);
    p5.text("channel 2 (image picker)", 390, 220);

    p5.fill(127,127,127);
    p5.rect(390,100,160,100);
    p5.image(testImg,390,100,160,100)

    // output controls
    p5.fill(255);
    p5.text("mix preview (ch1 + ch2)", 200, 220);

    p5.fill(127,127,127);
    p5.rect(200,100,160,100);
    p5.image(testImg,200,100,160,100);

    p5.fill(h,s,b, 255-faderVal); // this could be better
    p5.rect(200,100,160,100);

    p5.fill(255);
    p5.text("ch2", 315, 245);
    p5.text("ch1", 200, 245);
    p5.text("fader", 250, 260);
    
    // draw to buffers
    ouputBuffer.background(0);
    ouputBuffer.noStroke();
    ouputBuffer.tint(h,s,b, faderVal); // does this make sense?

    ouputBuffer.rect(0,0,160,100);
    ouputBuffer.image(testImg,0,0, 160, 100);

    ouputBuffer.fill(h,s,b, 255-faderVal);
    ouputBuffer.rect(0,0,160,100);

    if(gifBool){
      
      if (testGif.loaded()) {
        ouputBuffer.image(testGif,0,0, 160, 100);
      }

    }

    calculateDownsample();

    p5.fill(255);
    p5.text("frame buffer", 10, 520);
    p5.text("LED downsample", 400, 520);

    // labels
    p5.fill(255,255,0);
    p5.text("color mixer", 10, 80);
    
    p5.fill(255,255,0);
    p5.text("image mixer", 390, 80);
    
    // labels
    p5.fill(255,255,0);
    p5.text("gif animation", 580, 80);

    p5.fill(255,255,0);
    p5.text("buffer preview", 10, 380);

    p5.fill(255,255,0);
    p5.text("interactive", 200, 380);

    p5.fill(255,255,0);
    p5.text("final result", 400, 380);

    p5.fill(255);
    p5.text("drawable", 200, 520);

    //testImg.mask(imageMask);
    p5.image(testGif, 580, 100, 160,100);

    p5.image(ouputBuffer, 10, 400);
    //console.log(frameRate());


    if(gifBool){
      
      if (!testGif.loaded()) {
        text("loading gif",60, 460);
      }

    }

  }

  function updateFromUI() {
    // process UI elements and update values
    h = rSlider.value();
    s = gSlider.value();
    b = bSlider.value();
    faderVal = fSlider.value();
  }

  function calculateDownsample() {

    ouputBuffer.loadPixels();
    //loadPixels();
    for (var x = 0; x < 8; x++) {
      for (var y = 0; y < 5; y++) {
        var index = (x*vScale + 1 + (y*vScale * 160))*4;
        var r = ouputBuffer.pixels[index+0];
        var g = ouputBuffer.pixels[index+1];
        var b = ouputBuffer.pixels[index+2];

        var value = x + y * 8;
        
        ledPixels[value].index = value;
        ledPixels[value].x = 200 + x*vScale;
        ledPixels[value].y = 400 + y*vScale;
        ledPixels[value].display();

        // this is the final result
        p5.noStroke();
        
        if (ledPixels[value].toggle) {
          if (drawBool) {
            p5.fill(255,255,255,255)
          }else {
          p5.fill(r,g,b);
        }
        } else {
          p5.fill(r,g,b);
        }
        p5.rect(400 + x*vScale, 400 + y*vScale, 20, 20);

      }
    }


  }

  function mousePressed() {

    for (var x = 0; x < ledPixels.length; x++) {
      ledPixels[x].clicked();
    }

  }

  function LedPixel(x, y) {

    this.state = "off";
    this.toggle = false;
    this.isHover = false;
    this.x = x;
    this.y = y;
    this.index = 0;

    this.display = function() {

      this.checkHover();

      if (this.toggle) {
        p5.fill(255);
      } 
      p5.stroke(1);

      p5.rect(this.x,this.y,20,20);

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

  };
};