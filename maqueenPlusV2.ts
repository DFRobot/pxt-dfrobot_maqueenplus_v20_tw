
const enum PatrolSpeed {
    //% block="1"
    Speed1 = 1,
    //% block="2"
    Speed2 = 2,
    //% block="3"
    Speed3 = 3,
    //% block="4"maqueenPlusV2.readLightIntensity(DirectionType.Left)
    Speed4 = 4,
    //% block="5"
    Speed5 = 5,
}

/**
 * Custom graphic block
 */
//% weight=100 color=#0fbc11 icon="\uf067" block="maqueenPlusV2"
//% groups="['V3']"
namespace maqueenPlusV2 {

    //Motor selection enumeration
    export enum MyEnumMotor {
        //% block="left motor"
        LeftMotor,
        //% block="right motor"
        RightMotor,
        //% block="all motor"
        AllMotor,
    };

    //Motor direction enumeration selection
    export enum MyEnumDir {
        //% block="rotate forward"
        Forward,
        //% block="backward"
        Backward,
    };

    //LED light selection enumeration
    export enum MyEnumLed {
        //% block="left led light"
        LeftLed,
        //% block="right led light"
        RightLed,
        //% block="all led light"
        AllLed,
    };

    //LED light switch enumeration selection
    export enum MyEnumSwitch {
        //% block="close"
        Close,
        //% block="open"
        Open,
    };

    //Line sensor selection
    export enum MyEnumLineSensor {
        //% block="L1"
        SensorL1,
        //% block="M"
        SensorM,
        //% block="R1"
        SensorR1,
        //% block="L2"
        SensorL2,
        //% block="R2"
        SensorR2,
    };
    /**
     * Well known colors for a NeoPixel strip
     */
    export enum NeoPixelColors {
        //% block=red
        Red = 0xFF0000,
        //% block=orange
        Orange = 0xFFA500,
        //% block=yellow
        Yellow = 0xFFFF00,
        //% block=green
        Green = 0x00FF00,
        //% block=blue
        Blue = 0x0000FF,
        //% block=purple
        Purple = 0xFF00FF,
        //% block=white
        White = 0xFFFFFF,
        //% block=black
        Black = 0x000000
    }

    const I2CADDR = 0x10;
    const ADC0_REGISTER = 0X1E;
    const ADC1_REGISTER = 0X20;
    const ADC2_REGISTER = 0X22;
    const ADC3_REGISTER = 0X24;
    const ADC4_REGISTER = 0X26;
    const LEFT_LED_REGISTER = 0X0B;
    const RIGHT_LED_REGISTER = 0X0C;
    const LEFT_MOTOR_REGISTER = 0X00;
    const RIGHT_MOTOR_REGISTER = 0X02;
    const LINE_STATE_REGISTER = 0X1D;
    const VERSION_CNT_REGISTER = 0X32;
    const VERSION_DATA_REGISTER = 0X33;
    
    let irstate: number;
    let neopixel_buf = pins.createBuffer(16 * 3);
    for (let i = 0; i < 16 * 3; i++) {
        neopixel_buf[i] = 0
    }
    let _brightness = 255
    let state: number;

    /**
     *  Init I2C until success
     */

    //% weight=100
    //%block="initialize via I2C until success"
    export function I2CInit(): void {
        let Version_v = 0;
        pins.i2cWriteNumber(I2CADDR, 0x32, NumberFormat.Int8LE);
        Version_v = pins.i2cReadNumber(I2CADDR, NumberFormat.Int8LE);
        while (Version_v == 0) {
            basic.showLeds(`
                # . . . #
                . # . # .
                . . # . .
                . # . # .
                # . . . #
                `, 10)
            basic.pause(500)
            basic.clearScreen()
            pins.i2cWriteNumber(0x10, 0x32, NumberFormat.Int8LE);
            Version_v = pins.i2cReadNumber(I2CADDR, NumberFormat.Int8LE);
        }
        basic.showLeds(`
                . . . . .
                . . . . #
                . . . # .
                # . # . .
                . # . . .
                `, 10)
        basic.pause(500)
        basic.clearScreen()
        //V3 systemInit
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = 73;
        allBuffer[1] = 1;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }

    /**
     * Control motor module running
     * @param emotor Motor selection enumeration
     * @param edir   Motor direction selection enumeration
     * @param speed  Motor speed control, eg:100
     */

    //% block="set %emotor direction %edir speed %speed"
    //% speed.min=0 speed.max=255
    //% weight=99
    export function controlMotor(emotor:MyEnumMotor, edir:MyEnumDir, speed:number):void{
        switch(emotor){
            case MyEnumMotor.LeftMotor:
                let leftBuffer = pins.createBuffer(3);
                leftBuffer[0] = LEFT_MOTOR_REGISTER;
                leftBuffer[1] = edir;
                leftBuffer[2] = speed;
                pins.i2cWriteBuffer(I2CADDR, leftBuffer);
            break;
            case MyEnumMotor.RightMotor:
                let rightBuffer = pins.createBuffer(3);
                rightBuffer[0] = RIGHT_MOTOR_REGISTER;
                rightBuffer[1] = edir;
                rightBuffer[2] = speed;
                pins.i2cWriteBuffer(I2CADDR, rightBuffer);
            break;
            default:
                let allBuffer = pins.createBuffer(5);
                allBuffer[0] = LEFT_MOTOR_REGISTER;
                allBuffer[1] = edir;
                allBuffer[2] = speed;
                allBuffer[3] = edir;
                allBuffer[4] = speed;
                pins.i2cWriteBuffer(I2CADDR, allBuffer)
            break;   
        }
    }

    /**
     * Control the motor module to stop running
     * @param emotor Motor selection enumeration
     */

    //% block="set %emotor stop"
    //% weight=98
    export function controlMotorStop(emotor:MyEnumMotor):void{
        switch (emotor) {
            case MyEnumMotor.LeftMotor:
                let leftBuffer = pins.createBuffer(3);
                leftBuffer[0] = LEFT_MOTOR_REGISTER;
                leftBuffer[1] = 0;
                leftBuffer[2] = 0;
                pins.i2cWriteBuffer(I2CADDR, leftBuffer);
                break;
            case MyEnumMotor.RightMotor:
                let rightBuffer = pins.createBuffer(3);
                rightBuffer[0] = RIGHT_MOTOR_REGISTER;
                rightBuffer[1] = 0;
                rightBuffer[2] = 0;
                pins.i2cWriteBuffer(I2CADDR, rightBuffer);
                break;
            default:
                let allBuffer = pins.createBuffer(5);
                allBuffer[0] = LEFT_MOTOR_REGISTER;
                allBuffer[1] = 0;
                allBuffer[2] = 0;
                allBuffer[3] = 0;
                allBuffer[4] = 0;
                pins.i2cWriteBuffer(I2CADDR, allBuffer)
                break;
        }
    }

    /**
     * Control left and right LED light switch module
     * @param eled LED lamp selection
     * @param eSwitch Control LED light on or off
     */

    //% block="control %eled %eSwitch"
    //% weight=97
    export function controlLED(eled:MyEnumLed, eSwitch:MyEnumSwitch):void{
        switch(eled){
            case MyEnumLed.LeftLed:
                let leftLedControlBuffer = pins.createBuffer(2);
                leftLedControlBuffer[0] = LEFT_LED_REGISTER;
                leftLedControlBuffer[1] = eSwitch;
                pins.i2cWriteBuffer(I2CADDR, leftLedControlBuffer);
            break;
            case MyEnumLed.RightLed:
                let rightLedControlBuffer = pins.createBuffer(2);
                rightLedControlBuffer[0] = RIGHT_LED_REGISTER;
                rightLedControlBuffer[1] = eSwitch;
                pins.i2cWriteBuffer(I2CADDR, rightLedControlBuffer);
            break;
            default:
                let allLedControlBuffer = pins.createBuffer(3);
                allLedControlBuffer[0] = LEFT_LED_REGISTER;
                allLedControlBuffer[1] = eSwitch;
                allLedControlBuffer[2] = eSwitch;
                pins.i2cWriteBuffer(I2CADDR, allLedControlBuffer);
            break;
        }
    }

    /**
     * Get the state of the patrol sensor
     * @param eline Select the inspection sensor enumeration
     */

    //% block="read line sensor %eline state"
    //% weight=96
    export function readLineSensorState(eline:MyEnumLineSensor):number{
        pins.i2cWriteNumber(I2CADDR, LINE_STATE_REGISTER, NumberFormat.Int8LE);
        let data = pins.i2cReadNumber(I2CADDR, NumberFormat.Int8LE)
        let state;
        switch(eline){
            case MyEnumLineSensor.SensorL1: 
                state = (data & 0x08) == 0x08 ? 1 : 0; 
            break;
            case MyEnumLineSensor.SensorM: 
                state = (data & 0x04) == 0x04 ? 1 : 0; 
            break;
            case MyEnumLineSensor.SensorR1: 
                state = (data & 0x02) == 0x02 ? 1 : 0; 
            break;
            case MyEnumLineSensor.SensorL2: 
                state = (data & 0x10) == 0X10 ? 1 : 0; 
            break;
            default:
                state = (data & 0x01) == 0x01 ? 1 : 0;
            break;
        }
        return state;
    }
    
    /**
     * The ADC data of the patrol sensor is obtained
     * @param eline Select the inspection sensor enumeration
     */

    //% block="read line sensor %eline  ADC data"
    //% weight=95
    export function readLineSensorData(eline:MyEnumLineSensor):number{
        let data;
        switch(eline){
            case MyEnumLineSensor.SensorR2:
                pins.i2cWriteNumber(I2CADDR, ADC0_REGISTER, NumberFormat.Int8LE);
                let adc0Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc0Buffer[1] << 8 | adc0Buffer[0]
            break;
            case MyEnumLineSensor.SensorR1:
                pins.i2cWriteNumber(I2CADDR, ADC1_REGISTER, NumberFormat.Int8LE);
                let adc1Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc1Buffer[1] << 8 | adc1Buffer[0];
            break;
            case MyEnumLineSensor.SensorM:
                pins.i2cWriteNumber(I2CADDR, ADC2_REGISTER, NumberFormat.Int8LE);
                let adc2Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc2Buffer[1] << 8 | adc2Buffer[0];
            break;
            case MyEnumLineSensor.SensorL1:
                pins.i2cWriteNumber(I2CADDR, ADC3_REGISTER, NumberFormat.Int8LE);
                let adc3Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc3Buffer[1] << 1 | adc3Buffer[0];
            break;
            default:
                pins.i2cWriteNumber(I2CADDR, ADC4_REGISTER, NumberFormat.Int8LE);
                let adc4Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc4Buffer[1] << 8 | adc4Buffer[0];
            break;

        }
        return data;
    }

    /**
     * Acquiring ultrasonic data
     * @param trig trig pin selection enumeration, eg:DigitalPin.P13
     * @param echo echo pin selection enumeration, eg:DigitalPin.P14
     */

    //% block="set ultrasonic sensor TRIG pin %trig ECHO pin %echo read data unit:cm"
    //% weight=94
    export function readUltrasonic(trig:DigitalPin, echo:DigitalPin):number{
        let data;
        pins.digitalWritePin(trig, 1);
        basic.pause(1);
        pins.digitalWritePin(trig, 0)
        if(pins.digitalReadPin(echo) == 0){
            pins.digitalWritePin(trig, 0);
            pins.digitalWritePin(trig, 1);
            basic.pause(20);
            pins.digitalWritePin(trig, 0);
            data = pins.pulseIn(echo, PulseValue.High,500*58);
        }else{
            pins.digitalWritePin(trig, 1);
            pins.digitalWritePin(trig, 0);
            basic.pause(20);
            pins.digitalWritePin(trig, 0);
            data = pins.pulseIn(echo, PulseValue.High,500*58)
        }
        data = data / 59;
        if(data <= 0)
            return 0;
        if(data > 500)
            return 500;
        return Math.round(data);
    }

    /**
     * Getting the version number
     */
    
    //% block="read version"
    //% weight=30
    //% advanced=true
    export function readVersion():string{
        let version;
        pins.i2cWriteNumber(I2CADDR, VERSION_CNT_REGISTER, NumberFormat.Int8LE);
        version = pins.i2cReadNumber(I2CADDR, NumberFormat.Int8LE);
        pins.i2cWriteNumber(I2CADDR, VERSION_DATA_REGISTER, NumberFormat.Int8LE);
         version= pins.i2cReadBuffer(I2CADDR, version);
        let versionString = version.toString();
        return versionString
    }
    
   




    export enum HueInterpolationDirection {
        Clockwise,
        CounterClockwise,
        Shortest
    }

    function writeBuff(index: number, rgb: number) {
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);
        neopixel_buf[index * 3 + 0] = Math.round(g)
        neopixel_buf[index * 3 + 1] = Math.round(r)
        neopixel_buf[index * 3 + 2] = Math.round(b)
    }

    function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);

        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;

        return (r << 16) + (g << 8) + b;
    }

    /* maqueen PlusV3 */

    export enum MotorType {
        //% block="Motor133"
        Motor133 = 1,
        //% block="Motor266"
        Motor266 = 2,
    }

    export enum Intersection {
        //% block="Straight"
        Straight = 3,
        //% block="Left"
        Left = 1,
        //% block="Right"
        Right = 2,
        //% block="Stop"
        Stop = 4,
    }

    export enum Trord {
        //% block="Left"
        Left = 1,
        //% block="Right"
        Right = 2,
        //% block="Stop"
        Stop = 4,
    }

    export enum LeftOrStraight {
        //% block="Straight"
        Straight = 3,
        //% block="Left"
        Left = 1,
        //% block="Stop"
        Stop = 4,
    }

    export enum RightOrStraight {
        //% block="Straight"
        Straight = 3,
        //% block="Right"
        Right = 2,
        //% block="Stop"
        Stop = 4,
    }

    export enum Patrolling {
        //% block="ON"
        ON = 1,
        //% block="OFF"
        OFF = 2,
    }

    export enum DirectionType {
        //% block="Left"
        Left = 1,
        //% block="Right"
        Right = 2,
        //% block="All"
        All = 3,
    }
    export enum DirectionType2 {
        //% block="Left"
        Left = 1,
        //% block="Right"
        Right = 2,
    }

    export enum SpeedDirection {
        //% block="CW"
        SpeedCW = 1,
        //% block="CCW"
        SpeedCCW = 2,
    }


    /**
     * return the corresponding PatrolSpeed number
     */
    //% blockId="PatrolSpeed_conv" block="%item"
    //% weight=2 blockHidden=true
    export function getPatrolSpeed(item: PatrolSpeed): number {
        return item as number;
    }


    /**
     * ...
     * @param speed to speed ,eg: PatrolSpeed.Speed1
     */

    //% block="Line Following Settings Speed %speed=PatrolSpeed_conv"
    //% weight=24
    //% group="V3"
    //% advanced=true
    export function setPatrolSpeed(speed: number) {
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = 63;
        allBuffer[1] = speed;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }

    /**
     * ...
     * @param type to type ,eg: MotorType.Motor133
     */

    //% block="set up motor type %type"
    //% weight=23
    //% group="V3"
    //% advanced=true
    //% deprecated=true
    export function setMotorType(type: MotorType) {

    }

    /**
     * ...
     * @param mode to mode ,eg: Intersection.Straight
     */
    maqueenPlusV2.setRightOrStraightRunMode(RightOrStraight.Straight)
    //% block="At Crossroads %mode"
    //% weight=22
    //% group="V3"
    //% advanced=true
    export function setIntersectionRunMode(mode: Intersection) {
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = 69;
        allBuffer[1] = mode;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }

    /**
     * ...
     * @param mode to mode ,eg: Trord.Left
     */

    //% block="At T-junction %mode"
    //% weight=21
    //% group="V3"
    //% advanced=true
    export function setTRordRunMode(mode: Trord) {
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = 70;
        allBuffer[1] = mode;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }

    /**
     * ...
     * @param mode to mode ,eg: LeftOrStraight.Straight
     */

    //% block="At Left Turn and Straight Intersection %mode"
    //% weight=20
    //% group="V3"
    //% advanced=true
    export function setLeftOrStraightRunMode(mode: LeftOrStraight) {
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = 71;
        allBuffer[1] = mode;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }

    /**
     * ...
     * @param mode to mode ,eg: RightOrStraight.Straight
     */

    //% block="At Right Turn and Straight Intersection %mode"
    //% weight=19
    //% group="V3"
    //% advanced=true
    export function setRightOrStraightRunMode(mode: RightOrStraight) {
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = 72;
        allBuffer[1] = mode;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }

    /**
     * ...
     * @param patrol to patrol ,eg: Patrolling.ON
     */

    //% block="Line patrolling %patrol"
    //% weight=18
    //% group="V3"
    //% advanced=true
    export function patrolling(patrol: Patrolling) {
        let allBuffer = pins.createBuffer(2);
        if (patrol == Patrolling.ON)
            allBuffer[1] = 0x04|0x01;
        else
            allBuffer[1] = 0x08;
        allBuffer[0] = 60;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }

    /**
     * ...
     */

    //% block="Intersection Detection"
    //% weight=17
    //% group="V3"
    //% advanced=true
    export function intersectionDetecting(): number {
        pins.i2cWriteNumber(I2CADDR, 61, NumberFormat.Int8LE);
        let data = pins.i2cReadNumber(I2CADDR, 1);
        return data;
    }

    /**
     * ...
     * @param type to type ,eg: DirectionType.Left
     */

    //% block="Read Light Values %type"
    //% weight=16
    //% group="V3"
    //% advanced=true
    export function readLightIntensity(type: DirectionType2): number {
        let allBuffer = pins.createBuffer(4);
        pins.i2cWriteNumber(I2CADDR, 78, NumberFormat.Int8LE);
        allBuffer = pins.i2cReadBuffer(I2CADDR, 4);
        if(type==DirectionType2.Left)
            return allBuffer[0] << 8 | allBuffer[1];
        else
            return allBuffer[2] << 8 | allBuffer[3];
    }

    /**
     * ...
     * @param dir to dir ,eg: SpeedDirection.SpeedCW
     * @param speed to speed ,eg: PatrolSpeed.Speed1
     * @param distance to distance ,eg: 50
     */

    //% block="PID Distance Control %dir speed %speed=PatrolSpeed_conv distance %distance cm"
    //% weight=15
    //% group="V3"
    //% advanced=true
    export function pidControlDistance(dir: SpeedDirection, speed: number, distance: number) {
        let allBuffer = pins.createBuffer(2);
        if (distance >= 6000)
            distance = 60000;
        allBuffer[0]=64; allBuffer[1] =dir;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
        allBuffer[0] = 85; allBuffer[1] = speed;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
        allBuffer[0] = 65; allBuffer[1] = distance>>8;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
        allBuffer[0] = 66; allBuffer[1] = distance ;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
        allBuffer[0] = 60; allBuffer[1] = 0x04 | 0x02;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }

    /**
     * ...
     * @param speed to speed ,eg: PatrolSpeed.Speed1
     * @param angle to angle ,eg: 90
     */

    //% block="PID Angle Control speed %speed=PatrolSpeed_conv angle %angle"
    //% angle.min=-180 angle.max=180 angle.defl=90
    //% weight=14
    //% group="V3"
    //% advanced=true
    export function pidControlAngle(speed: number, angle: number) {
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = 67;
        if (angle>=0)allBuffer[1] = 1;
        else allBuffer[1] = 2;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
        allBuffer[0] = 86; allBuffer[1] = speed;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
        allBuffer[0] = 68; allBuffer[1] = angle;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
        allBuffer[0] = 60; allBuffer[1] = 0x04 | 0x02;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }
    /**
     * ...
     */

    //% block="PID Control Stop"
    //% weight=13
    //% group="V3"
    //% advanced=true
    export function pidControlStop() {
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = 60;
        allBuffer[1] = 0x10;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }

    /**
     * ...
     * @param type to type ,eg: DirectionType.Left
     */

    //% block="Read Real-time Speed %type wheel"
    //% weight=12
    //% group="V3"
    //% advanced=true
    export function readRealTimeSpeed(type: DirectionType): number {
        let allBuffer = pins.createBuffer(2);
        pins.i2cWriteNumber(I2CADDR, 76, 1);
        allBuffer = pins.i2cReadBuffer(I2CADDR, 2);
        if (type == DirectionType.Left)
            return allBuffer[0] / 5;
        else
            return allBuffer[1] / 5;
    }

    /**
     * ...
     * @param type to type ,eg: DirectionType.Left
     * @param rgb to rgb ,eg: NeoPixelColors.Red
     */

    //% block="RGB Car Lights %type color %rgb"
    //% weight=11
    //% group="V3"
    //% advanced=true
    export function setRgblLed(type: DirectionType, rgb: NeoPixelColors) {

        let allBuffer = pins.createBuffer(2);
        let buf = 0;
    
        switch (rgb) {
            case 0xFF0000: buf = 1; break;
            case 0x00FF00: buf = 2; break;
            case 0xFFFF00: buf = 3; break;
            case 0x0000FF: buf = 4; break;
            case 0xFF00FF: buf = 5; break;
            case 0x00FFFF: buf = 6; break;
            case 0xFFFFFF: buf = 7; break;
            case 0x000000: buf = 0; break;
            default: buf = 0; break;
        }
        allBuffer[1] = buf;
        if (type == DirectionType.Left){
            allBuffer[0] = 11;
            pins.i2cWriteBuffer(I2CADDR, allBuffer)
        }else if (type == DirectionType.Right){
            allBuffer[0] = 12;
            pins.i2cWriteBuffer(I2CADDR, allBuffer)
        } else if (type == DirectionType.All){
            allBuffer[0] = 11;
            pins.i2cWriteBuffer(I2CADDR, allBuffer)
            allBuffer[0] = 12;
            pins.i2cWriteBuffer(I2CADDR, allBuffer)
        }
    }
}



