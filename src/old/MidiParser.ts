import { IFileBuffer, FileBuffer } from "../DataBuffer";

export const parse = (input: Uint8Array | string) => {

    if (input instanceof Uint8Array) return Uint8ToMidi(input);
    else if(typeof input === 'string') return base64ToMidi(input);
    else throw new Error('MidiParser.parse() : Invalid input provided');
}

interface MIDI {
    headerSize: number;
    formatType: number;
    tracks: number;
    track: Track[];
    timeDivision: number[] | number;
}

interface Track {
    events: MidiEvent[];
}

interface MidiEvent {
    data: number[] | number | string
    deltaTime: number;
    type: number;
}

interface MetaEvent extends MidiEvent {
    metaType: number;
}

interface RegularEvent extends MidiEvent {
    channel: number;
}

const Uint8ToMidi = (FileAsUint8Array: Uint8Array) => {

    const data = new DataView(FileAsUint8Array.buffer, FileAsUint8Array.byteOffset, FileAsUint8Array.byteLength); // 8 bits bytes file data array
    const file: IFileBuffer = new FileBuffer(data);

    //  ** read FILE HEADER
    if (file.readInt(4) !== 0x4D546864) {
        console.warn('Header validation failed (not MIDI standard or file corrupt.)');
        return false;                                                       // Header validation failed (not MIDI standard or file corrupt.)
    }
                       
    const MIDI : MIDI = {
        headerSize: file.readInt(4),                                        // header size (unused var), getted just for read pointer movement
        formatType : file.readInt(2),                                       // get MIDI Format Type
        tracks : file.readInt(2),                                           // get ammount of track chunks
        track : [],                                                         // create array key for track data storing
        timeDivision: getTimeDivision(file)
    };

    //  ** read TRACK CHUNK
    for (let t=1; t <= MIDI.tracks; t++) {

        MIDI.track[t-1] = { events: [] };                                  // create new Track entry in Array
        let headerValidation = file.readInt(4);

        if (headerValidation === -1) break;                                 // EOF
        if (headerValidation !== 0x4D54726B) return false;                  // Track chunk header validation failed.
        
        file.readInt(4);                                                    // move pointer. get chunk size (bytes length)

        let eventIndex = 0;                                                 // init event counter
        let endOfTrack = false;                                             // FLAG for track reading secuence breaking
        
        // ** read EVENT CHUNK
        let statusByte: number;
        let laststatusByte: number = 0;
        
        while (!endOfTrack) {

            eventIndex++;                                                   // increase by 1 event counter

            const deltaTime = file.readIntVariableLengthValue();            // get DELTA TIME OF MIDI event (Variable Length Value)                          

            statusByte = file.readInt(1);                                   // read EVENT TYPE (STATUS BYTE)
            if (statusByte === -1) 
                break;                                                      // EOF
            else if (statusByte >= 128) 
                laststatusByte = statusByte;                                // NEW STATUS BYTE DETECTED
            else {                                                          // 'RUNNING STATUS' situation detected
                statusByte = laststatusByte;                                // apply last loop, Status Byte
                file.movePointer(-1);                                       // move back the pointer (cause read byte is not a status byte)
            }

            const META_EVENT_TYPE = 0xFF;
            const midiEvent: MidiEvent = statusByte === META_EVENT_TYPE
                ? getMetaEvent(file, deltaTime)
                : getRegularEvent(file, deltaTime, statusByte);

            MIDI.track[t-1].events[eventIndex-1] = midiEvent;

            if (midiEvent.type === -1 ||
                (midiEvent as MetaEvent)?.metaType === -1)
                endOfTrack = true;
        }
    }

    return MIDI;
}

const getTimeDivision = (file: IFileBuffer) => {
    let timeDivisionByte1 = file.readInt(1);                            // get Time Division first byte
    let timeDivisionByte2 = file.readInt(1);                            // get Time Division second byte
    
    if(timeDivisionByte1 >= 128) {                                      // discover Time Division mode (fps or tpf)
        let timeDivision    = [];
        timeDivision[0] = timeDivisionByte1 - 128;                      // frames per second MODE  (1st byte)
        timeDivision[1] = timeDivisionByte2;                            // ticks in each frame     (2nd byte)
        return timeDivision;
    } else
        return (timeDivisionByte1 * 256) + timeDivisionByte2;           // else... ticks per beat MODE  (2 bytes value)
}

const END_OF_TRACK = 0x2F;
const TEXT_EVENT = 0x01;
const COPYRIGHT_NOTICE = 0x02;

const INSTRUMENT_NAME = 0x04;
const LYRICS = 0x05;
const MARKER = 0x06;
const CUE_POINT = 0x07;

const MIDI_PORT = 0x21;
const KEY_SIGNATURE = 0x59;
const SET_TEMPO = 0x51;

const SMPTE_OFFSET = 0x54;
const TIME_SIGNATURE = 0x58;

const getMetaEvent = (file: IFileBuffer, deltaTime: number): MetaEvent => {

    const metaEvent: MetaEvent = {
        data: [],
        deltaTime,
        type: 0xFF, // assign metaEvent code to array
        metaType: file.readInt(1) // assign metaEvent subtype
    };

    let metaEventLength = file.readIntVariableLengthValue();                    // get the metaEvent length
    switch (metaEvent.metaType) {
        case END_OF_TRACK:
        case END_OF_FILE:
            break;
        case TEXT_EVENT:
        case COPYRIGHT_NOTICE:
        case 0x03:
        case INSTRUMENT_NAME:
        case LYRICS:
        case MARKER:
        case CUE_POINT:
            metaEvent.data = file.readStr(metaEventLength);
            break;
        case MIDI_PORT:
        case KEY_SIGNATURE:
        case SET_TEMPO:
            metaEvent.data = file.readInt(metaEventLength);
            break;
        case SMPTE_OFFSET:

            const offset: number[] = [];
            offset[0] = file.readInt(1);
            offset[1] = file.readInt(1);
            offset[2] = file.readInt(1);
            offset[3] = file.readInt(1);
            offset[4] = file.readInt(1);
            
            metaEvent.data = offset;
            break;
        case TIME_SIGNATURE:

            const timeSignature: number[] = [];
            timeSignature[0] = file.readInt(1);
            timeSignature[1] = file.readInt(1);
            timeSignature[2] = file.readInt(1);
            timeSignature[3] = file.readInt(1);

            metaEvent.data = timeSignature;
            break;
        default:
            file.readInt(metaEventLength);
            metaEvent.data = file.readInt(metaEventLength);
    }

    return metaEvent;
}

const SYSTEM_EXCLUSIVE_EVENT = 0xF;
const NOTE_AFTERTOUCH = 0xA;
const CONTROLLER = 0xB;
const PITCH_BEND_EVENT = 0xC;
const NOTE_OFF = 0x8;
const NOTE_ON = 0x9;
const PROGRAM_CHANGE = 0xC;
const CHANNEL_AFTERTOUCH = 0xD;
const END_OF_FILE = -1;


const getRegularEvent = (file: IFileBuffer, deltaTime: number, statusByte: number) : RegularEvent => {    

    // split the status byte HEX representation, to obtain 4 bits values
    const hexByte = statusByte.toString(16).split('');
    
    // force 2 digits
    if (!hexByte[1]) hexByte.unshift('0');

    const regularEvent: RegularEvent = {
        data: [],
        deltaTime,
        type: parseInt(hexByte[0], 16), // first byte is EVENT TYPE ID
        channel: parseInt(hexByte[1], 16) // second byte is channel
    }

    switch (regularEvent.type) {
        case SYSTEM_EXCLUSIVE_EVENT: {
            const eventLength = file.readIntVariableLengthValue();
            regularEvent.data = file.readInt(eventLength);
            break;
        }
        case NOTE_AFTERTOUCH:
        case CONTROLLER:
        case PITCH_BEND_EVENT:
        case NOTE_OFF:
        case NOTE_ON:
            const note: number[] = [];
            note[0] = file.readInt(1);
            note[1] = file.readInt(1);
            regularEvent.data = note;
            break;
        case PROGRAM_CHANGE:
        case CHANNEL_AFTERTOUCH: 
            regularEvent.data = file.readInt(1);
            break;
        case END_OF_FILE:
            break;
        default:
            throw new Error('Unknown EVENT detected. Reading cancelled!');
    }

    return regularEvent;
}

const base64ToMidi = (base64String: string) => {

    const raw = atob(base64String);
    
    
    const rawLength = raw.length;
    const uint8Array = new Uint8Array(new ArrayBuffer(rawLength));
    
    for(let i=0; i < rawLength; i++) uint8Array[i] = raw.charCodeAt(i);
    
    console.log(uint8Array);

    return Uint8ToMidi(uint8Array) ;
}

const atob = (inputString: string) => {

    // base64 character set, plus padding character (=)
    const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    // Regular expression to check formal correctness of base64 encoded strings    
    const b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;

    // remove data type signatures at the begining of the string
    // eg :  "data:audio/mid;base64,"    
    let string = inputString.replace( /^.*?base64,/ , '');

    // atob can work with strings with whitespaces, even inside the encoded part,
    // but only \t, \n, \f, \r and ' ', which can be stripped.    
    string = String(string).replace(/[\t\n\f\r ]+/g, '');

    if (!b64re.test(string))
        throw new TypeError('Failed to execute _atob() : The string to be decoded is not correctly encoded.');

    // Adding the padding if missing, for simplicity
    string += '=='.slice(2 - (string.length & 3));

    let bitmap, result = '';
    let r1, r2;

    for (let i = 0; i < string.length;) {

        bitmap = b64.indexOf(string.charAt(i++)) << 18 | b64.indexOf(string.charAt(i++)) << 12
                | (r1 = b64.indexOf(string.charAt(i++))) << 6 | (r2 = b64.indexOf(string.charAt(i++)));

        result += r1 === 64 ? String.fromCharCode(bitmap >> 16 & 255)
                : r2 === 64 ? String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255)
                : String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255, bitmap & 255);
    }
    
    return result;
};