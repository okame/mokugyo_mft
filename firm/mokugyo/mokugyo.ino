#define BAUDRATE 9600
#define PIN_X   2
#define PIN_Y   3
#define PIN_Z   1
#define PIN_MIC 0
#define CNT 10
#define MIC_BASE 517

long gx, gy, gz, mic_tmp, mic_v;

void setup(){
    Serial.begin(BAUDRATE);
}

void loop() {
  
    gx = 0;
    gy = 0;
    gz = 0;
    mic_v = 0;

    for(int i=0; i<CNT; i++) {
        gx += analogRead(PIN_X);
        gy += analogRead(PIN_Y);
        gz += analogRead(PIN_Z);
        mic_tmp = analogRead(PIN_MIC);
        mic_v += abs(MIC_BASE - mic_tmp);
        delay(2.5);
    }

    Serial.print('@');
    Serial.print(gx/CNT, DEC);
    Serial.print('@');
    Serial.print(gy/CNT, DEC);
    //Serial.print('@');
    //Serial.print(gz/CNT, DEC);
    Serial.print('@');
    Serial.print(mic_v/CNT, DEC);
    Serial.println();
}
