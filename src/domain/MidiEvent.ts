import { IDataStream } from "../DataStream";
import { EventType } from "./EventType";
import { MetaEventType } from "./MetaEventType";
import { NoteOff } from "./midi-event/NoteOff";
import { NoteOn } from "./midi-event/NoteOn";

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
    const type = (statusByte & 0b11110000) >> 4;
    const channel = statusByte & 0b00001111;

    console.log(statusByte);
    console.log(type, channel);
    console.log((statusByte & 11110000) << 4, statusByte & 11110000);

    const name = EventType[type] || "Unknown";

    const regularEvent: RegularEvent = {
        name,
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
            break;
        case EventType.NOTE_OFF:
            return new NoteOff(
                statusByte,
                dataStream.readInt(1),
                dataStream.readInt(1),
                deltaTime
            );
        case EventType.NOTE_ON:
            return new NoteOn(
                statusByte,
                dataStream.readInt(1),
                dataStream.readInt(1),
                deltaTime
            );
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

const getMetaEvent = (
    dataStream: IDataStream,
    deltaTime: number
): MetaEvent => {
    const metaType = dataStream.readInt(1);
    const name = MetaEventType[metaType] || "Unkown Sytem Message";

    const metaEvent: MetaEvent = {
        name,
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

export type { MidiEvent, MetaEvent, RegularEvent };
