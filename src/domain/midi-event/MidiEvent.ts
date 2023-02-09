import { IDataStream } from "../../DataStream";
import { EventType, MetaEventType } from "./constants";

interface MidiEvent {
    name: string;
    data: number[] | number | string;
    deltaTime: number;
    type: EventType;
}

interface MetaEvent extends MidiEvent {
    metaType: MetaEventType;
}

interface RegularEvent extends MidiEvent {
    channel: number;
}

export const getMidiEvent = (
    deltaTime: number,
    statusByte: number,
    dataStream: IDataStream
): MidiEvent => {
    if (statusByte === EventType.META_EVENT_TYPE)
        return getMetaEvent(dataStream, deltaTime);

    return getRegularEvent(dataStream, deltaTime, statusByte);
};

const getRegularEvent = (
    dataStream: IDataStream,
    deltaTime: number,
    statusByte: number
): RegularEvent => {
    // split the status byte HEX representation, to obtain 4 bits values
    const hexByte = statusByte.toString(16).split("");
    // force 2 digits
    if (!hexByte[1]) hexByte.unshift("0");

    const type = parseInt(hexByte[0], 16);
    const channel = parseInt(hexByte[1], 16);

    const regularEvent: RegularEvent = {
        name: getName(type),
        type,
        channel,
        data: [],
        deltaTime,
    };

    switch (regularEvent.type) {
        case EventType.SYSTEM_EXCLUSIVE_EVENT: {
            const eventLength = dataStream.readIntVariableLengthValue();
            regularEvent.data = dataStream.readInt(eventLength);
            break;
        }
        case EventType.NOTE_AFTERTOUCH:
        case EventType.CONTROLLER:
        case EventType.PITCH_BEND_EVENT:
        case EventType.NOTE_OFF:
        case EventType.NOTE_ON:
            const note: number[] = [];
            note[0] = dataStream.readInt(1);
            note[1] = dataStream.readInt(1);
            regularEvent.data = note;
            break;
        case EventType.PROGRAM_CHANGE:
        case EventType.CHANNEL_AFTERTOUCH:
            regularEvent.data = dataStream.readInt(1);
            break;
        case EventType.END_OF_FILE:
            break;
        default:
            throw new Error("Unknown EVENT detected. Reading cancelled!");
    }

    return regularEvent;
};

const getName = (type: number) => {
    switch (type) {
        case EventType.NOTE_ON:
            return "Note On";
        case EventType.NOTE_OFF:
            return "Note Off";
        case EventType.NOTE_AFTERTOUCH:
            return "Note Aftertouch";
        case EventType.CONTROLLER:
            return "Controller";
        case EventType.PROGRAM_CHANGE:
            return "Program Change";
        case EventType.CHANNEL_AFTERTOUCH:
            return "Channel Aftertouch";
        default:
            return "Unknown";
    }
};

const getMetaEvent = (
    dataStream: IDataStream,
    deltaTime: number
): MetaEvent => {
    const metaType = dataStream.readInt(1);

    const metaEvent: MetaEvent = {
        name: getMetaName(metaType),
        type: EventType.META_EVENT_TYPE,
        metaType,
        data: [],
        deltaTime,
    };

    const metaEventLength = dataStream.readIntVariableLengthValue();

    switch (metaEvent.metaType) {
        case MetaEventType.END_OF_TRACK:
        case MetaEventType.END_OF_FILE:
            break;
        case MetaEventType.TEXT_EVENT:
        case MetaEventType.COPYRIGHT_NOTICE:
        case MetaEventType.TRACK_NAME:
        case MetaEventType.INSTRUMENT_NAME:
        case MetaEventType.LYRICS:
        case MetaEventType.MARKER:
        case MetaEventType.CUE_POINT:
            metaEvent.data = dataStream.readStr(metaEventLength);
            break;
        case MetaEventType.MIDI_CHANNEL_PREFIX:
        case MetaEventType.MIDI_PORT:
        case MetaEventType.KEY_SIGNATURE:
        case MetaEventType.SET_TEMPO:
            metaEvent.data = dataStream.readInt(metaEventLength);
            break;
        case MetaEventType.SMPTE_OFFSET:
            const offset: number[] = [];
            offset[0] = dataStream.readInt(1);
            offset[1] = dataStream.readInt(1);
            offset[2] = dataStream.readInt(1);
            offset[3] = dataStream.readInt(1);
            offset[4] = dataStream.readInt(1);

            metaEvent.data = offset;
            break;
        case MetaEventType.TIME_SIGNATURE:
            const timeSignature: number[] = [];
            timeSignature[0] = dataStream.readInt(1);
            timeSignature[1] = dataStream.readInt(1);
            timeSignature[2] = dataStream.readInt(1);
            timeSignature[3] = dataStream.readInt(1);

            metaEvent.data = timeSignature;
            break;
        default:
            dataStream.readInt(metaEventLength);
            metaEvent.data = dataStream.readInt(metaEventLength);
    }

    return metaEvent;
};

const getMetaName = (metaType: number): string => {
    switch (metaType) {
        case MetaEventType.END_OF_TRACK:
            return "End Of Track";
        case MetaEventType.END_OF_FILE:
            return "End Of File";
        case MetaEventType.TEXT_EVENT:
            return "Text";
        case MetaEventType.COPYRIGHT_NOTICE:
            return "Copyright";
        case MetaEventType.TRACK_NAME:
            return "Track Name";
        case MetaEventType.INSTRUMENT_NAME:
            return "Instrument Name";
        case MetaEventType.LYRICS:
            return "Lyrics";
        case MetaEventType.MARKER:
            return "Marker";
        case MetaEventType.CUE_POINT:
            return "Cue Point";
        case MetaEventType.MIDI_CHANNEL_PREFIX:
            return "Midi Channel Prefix";
        case MetaEventType.MIDI_PORT:
            return "Midi Port";
        case MetaEventType.KEY_SIGNATURE:
            return "Key Signature";
        case MetaEventType.SET_TEMPO:
            return "Set tempo";
        case MetaEventType.SMPTE_OFFSET:
            return "Smpte Offset";
        case MetaEventType.TIME_SIGNATURE:
            return "Time Signature";
        default:
            return "Unknown";
    }
};

export type { MidiEvent, MetaEvent, RegularEvent };
