#include <NS_Rainbow.h>

#define PIN 9
#define N_CELL (8*5)

// Parameter 1 = number of cells (max: 512)
// Parameter 2 = Arduino pin number (default pin: 9)
//NS_Rainbow ns_strip = NS_Rainbow(N_CELL);
NS_Rainbow ns_strip = NS_Rainbow(N_CELL,PIN);

int inByte = 0;         // incoming serial byte

const byte numChars = 32;
char receivedChars[numChars];
boolean newData = false;

void setup() {
  Serial.begin(115200);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  delay(100);
  ns_strip.begin();
  ns_strip.clear();
  ns_strip.setBrightness(128);  // range: 0 ~ 255
  establishContact();  // send a byte to establish contact until receiver responds
}

void setColors(String hexValue) {
  Serial.println("<setColors>");
  
  unsigned int   t = 100;   // t: delay time
  int red;
  int green;
  int blue;
  uint32_t rgb;
  if (1 == sscanf (hexValue.c_str(), "%lx", &rgb) ) {
    red = rgb >> 16 ;
    green = (rgb & 0x00ff00) >> 8;
    blue = (rgb & 0x0000ff);
    
  }  
  for(uint16_t i=0; i<ns_strip.numCells(); i++) {
    ns_strip.setColor(i, red,  green, blue);
  }

  ns_strip.show();
  Serial.println("<show>");
  delay(t); 
  Serial.println("<after delay>");
  
}

void loop() {
  recvWithStartEndMarkers();
  showNewData();
}

void recvWithStartEndMarkers() {
    static boolean recvInProgress = false;
    static byte ndx = 0;
    char startMarker = '<';
    char endMarker = '>';
    char rc;
 
    while (Serial.available() > 0 && newData == false) {
        rc = Serial.read();

        if (recvInProgress == true) {
            if (rc != endMarker) {
                receivedChars[ndx] = rc;
                ndx++;
                if (ndx >= numChars) {
                    ndx = numChars - 1;
                }
            }
            else {
                receivedChars[ndx] = '\0'; // terminate the string
                recvInProgress = false;
                ndx = 0;
                newData = true;
            }
        }

        else if (rc == startMarker) {
            recvInProgress = true;
        }
    }
}

void showNewData() {
    if (newData == true) {
        Serial.print("This just in ... ");
        Serial.println(receivedChars);
        newData = false;
        setColors(receivedChars);
    }
}

/*
  SerialEvent occurs whenever a new data comes in the hardware serial RX. This
  routine is run between each time loop() runs, so using delay inside loop can
  delay response. Multiple bytes of data may be available.
*/
// void serialEvent() {
//   Serial.println("serialEvent");
//   while (Serial.available()) {
//     // get the new byte:
//     char inChar = (char)Serial.read();
//     // add it to the inputString:
//     inputString += inChar;
//     Serial.println("construct input String");
//     // if the incoming character is a newline, set a flag so the main loop can
//     // do something about it:
//     if (inChar == '\n') {
//       stringComplete = true;
//     }
//   }
// }

void establishContact() {
  while (Serial.available() <= 0) {
    Serial.println("<Arduino is ready>");   // send an initial string
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
// #include <NS_Rainbow.h>

// #define PIN 9
// #define N_CELL (8*5)

// // Parameter 1 = number of cells (max: 512)
// // Parameter 2 = Arduino pin number (default pin: 9)
// //NS_Rainbow ns_strip = NS_Rainbow(N_CELL);
// NS_Rainbow ns_strip = NS_Rainbow(N_CELL,PIN);

// int inByte = 0;         // incoming serial byte

// void setup() {
  
//   Serial.begin(9600);
//   while (!Serial) {
//     ; // wait for serial port to connect. Needed for native USB port only
//   }
  
//   delay(100);
//   ns_strip.begin();
//   ns_strip.clear();
//   ns_strip.setBrightness(128);  // range: 0 ~ 255
  
//   establishContact();  // send a byte to establish contact until receiver responds
// }

// void loop() {
//   unsigned int   t = 100;   // t: delay time
//   if (Serial.available() > 0) {
    
//     String s=Serial.readStringUntil('#');
//     //Serial.print('revcd ');
//     Serial.println(s);
    
//     for(byte i=0; i<ns_strip.numCells(); i++) {
    
//       String hexValue = getValue(s, '|', i);
//       Serial.print('hexValue');
//       Serial.print(" ");
//       Serial.print(i);
//       Serial.print(" : ");
//       Serial.println(hexValue);
      
//       uint32_t rgb;
//       if (1 == sscanf (hexValue.c_str(), "%lx", &rgb) ) {
//         int red = rgb >> 16 ;
//         int green = (rgb & 0x00ff00) >> 8;
//         int blue = (rgb & 0x0000ff);
//         ns_strip.setColor(i, red,  green, blue);
//       }
//     }
    
//     Serial.flush();
    
//   }
  
//   ns_strip.show();
//   delay(t); 
// }

// void establishContact() {
//   while (Serial.available() <= 0) {
//     Serial.println("0,0,0");   // send an initial string
//     delay(300);
//   }
// }

// String getValue(String data, char separator, int index)
// {
//   int found = 0;
//   int strIndex[] = {0, -1};
//   int maxIndex = data.length() - 1;

//   for (int i = 0; i <= maxIndex && found <= index; i++) {
//     if (data.charAt(i) == separator || i == maxIndex) {
//       found++;
//       strIndex[0] = strIndex[1] + 1;
//       strIndex[1] = (i == maxIndex) ? i + 1 : i;
//     }
//   }

//   return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
// }

// void rainbow(uint16_t interval) {
//   uint16_t n = ns_strip.numCells();

//   for(uint16_t j=0; j<255; j++) {  // one cycle 
//     for(uint16_t i=0; i<n; i++) {
//       byte r_pos = (((i<<8) -  i) / n + j) % 0xFF;
//       byte sect = (r_pos / 0x55) % 0x03, pos = (r_pos % 0x55) * 0x03;
  
//       switch(sect) {
//       case 0: 
//         ns_strip.setColor(i,ns_strip.RGBtoColor(0xFF - pos, pos, 0x00)); break;
//       case 1: 
//         ns_strip.setColor(i,ns_strip.RGBtoColor(0x00, 0xFF - pos, pos)); break;
//       case 2:
//         ns_strip.setColor(i,ns_strip.RGBtoColor(pos, 0x00, 0xFF - pos)); break;
//       }  
//     }
//     ns_strip.show();
//     delay(interval);
//   }
// }
