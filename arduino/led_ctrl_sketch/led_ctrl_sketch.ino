#include <NS_Rainbow.h>

#define PIN 9
#define N_CELL (8*5)

// Parameter 1 = number of cells (max: 512)
// Parameter 2 = Arduino pin number (default pin: 9)
//NS_Rainbow ns_strip = NS_Rainbow(N_CELL);
NS_Rainbow ns_strip = NS_Rainbow(N_CELL,PIN);

int inByte = 0;         // incoming serial byte
String inputString = "";         // a String to hold incoming data
boolean stringComplete = false;  // whether the string is complete

void setup() {
  
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  
  delay(100);
  ns_strip.begin();
  ns_strip.clear();
  ns_strip.setBrightness(200);  // range: 0 ~ 255
  inputString.reserve(200);
  
  establishContact();  // send a byte to establish contact until receiver responds
}

void setColors(String hexValue) {
  unsigned int   t = 47;   // t: delay time
  
  for(byte i=0; i<ns_strip.numCells(); i++) {

      uint32_t rgb;
      if (1 == sscanf (hexValue.c_str(), "%lx", &rgb) ) {
        int red = rgb >> 16 ;
        int green = (rgb & 0x00ff00) >> 8;
        int blue = (rgb & 0x0000ff);
        ns_strip.setColor(i, red,  green, blue);
      }
    }
    
  ns_strip.show();
  delay(t); 
}

void loop() {
  
  
  if (stringComplete) {
    setColors(inputString);
    inputString = "";
    stringComplete = false;
  }
}

/*
  SerialEvent occurs whenever a new data comes in the hardware serial RX. This
  routine is run between each time loop() runs, so using delay inside loop can
  delay response. Multiple bytes of data may be available.
*/
void serialEvent() {
  while (Serial.available()) {
    // get the new byte:
    char inChar = (char)Serial.read();
    // add it to the inputString:
    inputString += inChar;
    // if the incoming character is a newline, set a flag so the main loop can
    // do something about it:
    if (inChar == '\n') {
      stringComplete = true;
    }
  }
}

void establishContact() {
  while (Serial.available() <= 0) {
    Serial.print("READY");   // send an initial string
    delay(300);
  }
}

String getValue(String data, char separator, int index)
{
  int found = 0;
  int strIndex[] = {0, -1};
  int maxIndex = data.length() - 1;

  for (int i = 0; i <= maxIndex && found <= index; i++) {
    if (data.charAt(i) == separator || i == maxIndex) {
      found++;
      strIndex[0] = strIndex[1] + 1;
      strIndex[1] = (i == maxIndex) ? i + 1 : i;
    }
  }

  return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
}

void rainbow(uint16_t interval) {
  uint16_t n = ns_strip.numCells();

  for(uint16_t j=0; j<255; j++) {  // one cycle 
    for(uint16_t i=0; i<n; i++) {
      byte r_pos = (((i<<8) -  i) / n + j) % 0xFF;
      byte sect = (r_pos / 0x55) % 0x03, pos = (r_pos % 0x55) * 0x03;
  
      switch(sect) {
      case 0: 
        ns_strip.setColor(i,ns_strip.RGBtoColor(0xFF - pos, pos, 0x00)); break;
      case 1: 
        ns_strip.setColor(i,ns_strip.RGBtoColor(0x00, 0xFF - pos, pos)); break;
      case 2:
        ns_strip.setColor(i,ns_strip.RGBtoColor(pos, 0x00, 0xFF - pos)); break;
      }  
    }
    ns_strip.show();
    delay(interval);
  }
}