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
import { SetTempo } from "./meta-events/SetTempo";

interface MidiEvent {
    name: string;
    deltaTime: number;
    type: EventType;
    encode: () => number[];
}

interface MetaEvent extends MidiEvent {
    metaType: MetaEventType;
    length: number;
}

interface RegularEvent extends MidiEvent {
    channel: number;
}

export const getMidiEvent = (
    deltaTime: number,
    statusByte: number,
    dataStream: IDataStream,
    runningStatus: boolean
): MidiEvent => {
    if (statusByte === EventType.META_EVENT_TYPE)
        return getMetaEvent(dataStream, deltaTime);

    return getRegularEvent(dataStream, deltaTime, statusByte, runningStatus);
};

const getRegularEvent = (
    dataStream: IDataStream,
    deltaTime: number,
    statusByte: number,
    runningStatus: boolean
): RegularEvent => {
    const type = (statusByte & 0b11110000) >> 4;
    const channel = statusByte & 0b00001111;
    const name = EventType[type] || "Unknown";

    const regularEvent: RegularEvent = {
        name,
        type,
        channel,
        deltaTime,
        encode: () => [],
    };

    switch (regularEvent.type) {
        case EventType.SYSTEM_EXCLUSIVE_EVENT: {
            // const eventLength = dataStream.readIntVariableLengthValue();
            // regularEvent.data = dataStream.readInt(eventLength);
            break;
        }
        case EventType.NOTE_AFTERTOUCH:
        case EventType.CONTROLLER:
        case EventType.PITCH_BEND_EVENT:
            break;
        case EventType.NOTE_OFF:
            return new NoteOff(
                deltaTime,
                statusByte,
                dataStream.readInt(1),
                dataStream.readInt(1),
                runningStatus
            );
        case EventType.NOTE_ON:
            return new NoteOn(
                deltaTime,
                statusByte,
                dataStream.readInt(1),
                dataStream.readInt(1),
                runningStatus
            );
        case EventType.PROGRAM_CHANGE:
        case EventType.CHANNEL_AFTERTOUCH:
            // regularEvent.data = dataStream.readInt(1);
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
    const length = dataStream.readIntVariableLengthValue();

    switch (metaType) {
        case MetaEventType.END_OF_TRACK:
            return new EndOfTrack(deltaTime, length);
        case MetaEventType.END_OF_FILE:
            return {
                name: "End Of File",
                type: EventType.META_EVENT_TYPE,
                metaType,
                length,
                deltaTime,
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
                deltaTime,
                metaType,
                length,
                dataStream.readStr(length)
            );
        case MetaEventType.MIDI_CHANNEL_PREFIX:
        case MetaEventType.MIDI_PORT:
        case MetaEventType.KEY_SIGNATURE:
            return new IntMetaEvent(
                deltaTime,
                metaType,
                length,
                dataStream.readInt(length)
            );
        case MetaEventType.SET_TEMPO:
            return new SetTempo(deltaTime, length, dataStream.readInt(length));
        case MetaEventType.SMPTE_OFFSET:
            const offset: number[] = [];
            offset[0] = dataStream.readInt(1);
            offset[1] = dataStream.readInt(1);
            offset[2] = dataStream.readInt(1);
            offset[3] = dataStream.readInt(1);
            offset[4] = dataStream.readInt(1);
            return new SMPTEOffset(deltaTime, length, offset);
        case MetaEventType.TIME_SIGNATURE:
            const timeSignature: number[] = [];
            timeSignature[0] = dataStream.readInt(1);
            timeSignature[1] = dataStream.readInt(1);
            timeSignature[2] = dataStream.readInt(1);
            timeSignature[3] = dataStream.readInt(1);
            return new TimeSignature(deltaTime, length, timeSignature);
        default:
            return new IntMetaEvent(
                metaType,
                length,
                dataStream.readInt(length),
                deltaTime
            );
    }
};

export type { MidiEvent, MetaEvent, RegularEvent };
