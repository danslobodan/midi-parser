import { DataStream, IMidiStream } from "../createMidiStream";

// export const parse = (input: Uint8Array | string) => {
//     if (input instanceof Uint8Array) return Uint8ToMidi(input);
//     else if (typeof input === "string") return base64ToMidi(input);
//     else throw new Error("MidiParser.parse() : Invalid input provided");
// };

interface MIDI {
    headerSize: number;
    formatType: number;
    numberOfTracks: number;
    track: Track[];
    timeDivision: number[] | number;
}

interface Track {
    lengthBytes: number;
    events: MidiEvent[];
}

interface MidiEvent {
    name: string;
    data: number[] | number | string;
    deltaTime: number;
    type: number;
}

interface MetaEvent extends MidiEvent {
    metaType: number;
}

interface RegularEvent extends MidiEvent {
    channel: number;
}

export const Uint8ToMidi = (data: DataView) => {
    const buffer: IMidiStream = new DataStream(data);

    //  ** read FILE HEADER
    if (buffer.readInt(4) !== 0x4d546864) {
        console.warn(
            "Header validation failed (not MIDI standard or file corrupt.)"
        );
        return false; // Header validation failed (not MIDI standard or file corrupt.)
    }

    const MIDI: MIDI = {
        headerSize: buffer.readInt(4), // header size (unused var), getted just for read pointer movement
        formatType: buffer.readInt(2), // get MIDI Format Type
        numberOfTracks: buffer.readInt(2), // get ammount of track chunks
        timeDivision: getTimeDivision(buffer),
        track: [], // create array key for track data storing
    };

    //  ** read TRACK CHUNK
    for (let t = 1; t <= MIDI.numberOfTracks; t++) {
        // create new Track entry in Array
        let headerValidation = buffer.readInt(4);

        // EOF
        if (headerValidation === END_OF_FILE) break;
        // Track chunk header validation failed.
        if (headerValidation !== 0x4d54726b) return false;

        const length = buffer.readInt(4);
        // move pointer. get chunk size (bytes length)
        MIDI.track[t - 1] = { lengthBytes: length, events: [] };

        // init event counter
        let eventIndex = 0;

        // FLAG for track reading secuence breaking
        let endOfTrack = false;

        // ** read EVENT CHUNK
        let statusByte: number;
        let laststatusByte: number = 0;

        while (!endOfTrack) {
            // increase by 1 event counter
            eventIndex++;

            // get DELTA TIME OF MIDI event (Variable Length Value)
            const deltaTime = buffer.readIntVariableLengthValue();

            // read EVENT TYPE (STATUS BYTE)
            statusByte = buffer.readInt(1);

            // EOF
            if (statusByte === END_OF_FILE) break;
            // NEW STATUS BYTE DETECTED
            else if (statusByte >= 128) laststatusByte = statusByte;
            // 'RUNNING STATUS' situation detected
            else {
                // apply last loop, Status Byte
                statusByte = laststatusByte;
                // move back the pointer (cause read byte is not a status byte)
                buffer.movePointer(-1);
            }

            const META_EVENT_TYPE = 0xff;
            const midiEvent: MidiEvent =
                statusByte === META_EVENT_TYPE
                    ? getMetaEvent(buffer, deltaTime)
                    : getRegularEvent(buffer, deltaTime, statusByte);

            MIDI.track[t - 1].events[eventIndex - 1] = midiEvent;

            if (
                midiEvent.type === END_OF_FILE ||
                (midiEvent as MetaEvent)?.metaType === END_OF_FILE
            )
                endOfTrack = true;
        }
    }

    return MIDI;
};

const getTimeDivision = (file: IMidiStream) => {
    let timeDivisionByte1 = file.readInt(1); // get Time Division first byte
    let timeDivisionByte2 = file.readInt(1); // get Time Division second byte

    if (timeDivisionByte1 >= 128) {
        // discover Time Division mode (fps or tpf)
        let timeDivision = [];
        timeDivision[0] = timeDivisionByte1 - 128; // frames per second MODE  (1st byte)
        timeDivision[1] = timeDivisionByte2; // ticks in each frame     (2nd byte)
        return timeDivision;
    } else return timeDivisionByte1 * 256 + timeDivisionByte2; // else... ticks per beat MODE  (2 bytes value)
};

const END_OF_TRACK = 0x2f;
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

const getMetaEvent = (file: IMidiStream, deltaTime: number): MetaEvent => {
    const metaEvent: MetaEvent = {
        name: "Meta Event",
        type: 0xff, // assign metaEvent code to array
        metaType: file.readInt(1), // assign metaEvent subtype
        data: [],
        deltaTime,
    };

    let metaEventLength = file.readIntVariableLengthValue(); // get the metaEvent length
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
};

const NOTE_OFF = 0x8;
const NOTE_ON = 0x9;
const NOTE_AFTERTOUCH = 0xa;
const CONTROLLER = 0xb;
const PROGRAM_CHANGE = 0xc;
const CHANNEL_AFTERTOUCH = 0xd;
const PITCH_BEND_EVENT = 0xe;
const SYSTEM_EXCLUSIVE_EVENT = 0xf;
const END_OF_FILE = -1;

const getRegularEvent = (
    file: IMidiStream,
    deltaTime: number,
    statusByte: number
): RegularEvent => {
    // split the status byte HEX representation, to obtain 4 bits values
    const hexByte = statusByte.toString(16).split("");

    // force 2 digits
    if (!hexByte[1]) hexByte.unshift("0");

    const type = parseInt(hexByte[0], 16);

    const regularEvent: RegularEvent = {
        name: getName(type),
        type, // first byte is EVENT TYPE ID
        channel: parseInt(hexByte[1], 16), // second byte is channel
        data: [],
        deltaTime,
    };

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
            throw new Error("Unknown EVENT detected. Reading cancelled!");
    }

    return regularEvent;
};

const getName = (type: number) => {
    switch (type) {
        case NOTE_ON:
            return "Note On";
        case NOTE_OFF:
            return "Note Off";
        case NOTE_AFTERTOUCH:
            return "Note Aftertouch";
        case CONTROLLER:
            return "Controller";
        case PROGRAM_CHANGE:
            return "Program Change";
        case CHANNEL_AFTERTOUCH:
            return "Channel Aftertouch";
        default:
            return "Unknown";
    }
};

// const base64ToMidi = (base64String: string) => {
//     const raw = atob(base64String);

//     const rawLength = raw.length;
//     const uint8Array = new Uint8Array(new ArrayBuffer(rawLength));

//     for (let i = 0; i < rawLength; i++) uint8Array[i] = raw.charCodeAt(i);

//     console.log(uint8Array);

//     return Uint8ToMidi(uint8Array);
// };

// const atob = (inputString: string) => {
//     // base64 character set, plus padding character (=)
//     const b64 =
//         "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

//     // Regular expression to check formal correctness of base64 encoded strings
//     const b64re =
//         /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;

//     // remove data type signatures at the begining of the string
//     // eg :  "data:audio/mid;base64,"
//     let string = inputString.replace(/^.*?base64,/, "");

//     // atob can work with strings with whitespaces, even inside the encoded part,
//     // but only \t, \n, \f, \r and ' ', which can be stripped.
//     string = String(string).replace(/[\t\n\f\r ]+/g, "");

//     if (!b64re.test(string))
//         throw new TypeError(
//             "Failed to execute _atob() : The string to be decoded is not correctly encoded."
//         );

//     // Adding the padding if missing, for simplicity
//     string += "==".slice(2 - (string.length & 3));

//     let bitmap,
//         result = "";
//     let r1, r2;

//     for (let i = 0; i < string.length; ) {
//         bitmap =
//             (b64.indexOf(string.charAt(i++)) << 18) |
//             (b64.indexOf(string.charAt(i++)) << 12) |
//             ((r1 = b64.indexOf(string.charAt(i++))) << 6) |
//             (r2 = b64.indexOf(string.charAt(i++)));

//         result +=
//             r1 === 64
//                 ? String.fromCharCode((bitmap >> 16) & 255)
//                 : r2 === 64
//                 ? String.fromCharCode((bitmap >> 16) & 255, (bitmap >> 8) & 255)
//                 : String.fromCharCode(
//                       (bitmap >> 16) & 255,
//                       (bitmap >> 8) & 255,
//                       bitmap & 255
//                   );
//     }

//     return result;
// };
