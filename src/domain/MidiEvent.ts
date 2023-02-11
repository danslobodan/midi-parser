import { IDataStream } from "../DataStream";
import { EventType } from "./EventType";
import { MetaEventType } from "./MetaEventType";
import { EndOfTrack } from "./meta-events/EndOfTrack";
import { IntMetaEvent } from "./meta-events/IntMetaEvent";
import { NoteOff } from "./midi-event/NoteOff";
import { NoteOn } from "./midi-event/NoteOn";
import { SMPTEOffset } from "./meta-events/SMPTEOffset";
import { StringMetaEvent } from "./meta-events/StringMetaEvent";
import { TimeSignature } from "./meta-events/TimeSignature";

interface MidiEvent {
    name: string;
    deltaTime: number;
    type: EventType;
    data: number[] | number | string;
}

interface MetaEvent extends MidiEvent {
    metaType: MetaEventType;
    encode: () => number[];
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
    const name = EventType[type] || "Unknown";

    const regularEvent: RegularEvent = {
        name,
        type,
        channel,
        deltaTime,
        data: [],
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

    const metaEventLength = dataStream.readIntVariableLengthValue();

    switch (metaType) {
        case MetaEventType.END_OF_TRACK:
            return new EndOfTrack(deltaTime);
        case MetaEventType.END_OF_FILE:
            return {
                name: "End Of File",
                type: EventType.META_EVENT_TYPE,
                metaType,
                deltaTime,
                data: [],
                encode: () => {
                    return [-1];
                },
            };
        case MetaEventType.TEXT_EVENT:
        case MetaEventType.COPYRIGHT_NOTICE:
        case MetaEventType.TRACK_NAME:
        case MetaEventType.INSTRUMENT_NAME:
        case MetaEventType.LYRICS:
        case MetaEventType.MARKER:
        case MetaEventType.CUE_POINT:
            return new StringMetaEvent(
                metaType,
                dataStream.readStr(metaEventLength),
                deltaTime
            );
        case MetaEventType.MIDI_CHANNEL_PREFIX:
        case MetaEventType.MIDI_PORT:
        case MetaEventType.KEY_SIGNATURE:
        case MetaEventType.SET_TEMPO:
            return new IntMetaEvent(
                metaType,
                dataStream.readInt(metaEventLength),
                deltaTime
            );
        case MetaEventType.SMPTE_OFFSET:
            const offset: number[] = [];
            offset[0] = dataStream.readInt(1);
            offset[1] = dataStream.readInt(1);
            offset[2] = dataStream.readInt(1);
            offset[3] = dataStream.readInt(1);
            offset[4] = dataStream.readInt(1);
            return new SMPTEOffset(offset, deltaTime);
        case MetaEventType.TIME_SIGNATURE:
            const timeSignature: number[] = [];
            timeSignature[0] = dataStream.readInt(1);
            timeSignature[1] = dataStream.readInt(1);
            timeSignature[2] = dataStream.readInt(1);
            timeSignature[3] = dataStream.readInt(1);
            return new TimeSignature(timeSignature, deltaTime);
        default:
            return new IntMetaEvent(
                metaType,
                dataStream.readInt(metaEventLength),
                deltaTime
            );
    }
};

export type { MidiEvent, MetaEvent, RegularEvent };
