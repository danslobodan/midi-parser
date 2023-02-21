import { IDataStream } from "../DataStream";
import { EndOfTrack } from "./meta-events/EndOfTrack";
import { IntMetaEvent } from "./meta-events/IntMetaEvent";
import { SMPTEOffset } from "./meta-events/SMPTEOffset";
import { StringMetaEvent } from "./meta-events/StringMetaEvent";
import { TimeSignature } from "./meta-events/TimeSignature";
import { SetTempo } from "./meta-events/SetTempo";
import { IMidiEvent, EventType } from "./IMidiEvent";
import { IMetaEvent, MetaEventType } from "./meta-events/IMetaEvent";
import {
    NoteOff,
    NoteOn,
    IRegularEvent,
    ControllerChange,
    ProgramChange,
} from "./midi-event";
import {
    Pitch,
    Velocity,
    ControllerNumber,
    ControllerValue,
    Channel,
    Instrument,
} from "./midi-event/midi-component";

export const decodeEvent = (
    deltaTime: number,
    statusByte: number,
    dataStream: IDataStream,
    runningStatus: boolean
): IMidiEvent => {
    if (statusByte === EventType.META_EVENT_TYPE)
        return decodeMetaEvent(dataStream, deltaTime);

    return decodeRegularEvent(dataStream, deltaTime, statusByte, runningStatus);
};

const decodeRegularEvent = (
    dataStream: IDataStream,
    deltaTime: number,
    statusByte: number,
    runningStatus: boolean
): IRegularEvent => {
    const type = (statusByte & 0b11110000) >> 4;
    const channel = new Channel(statusByte & 0b00001111);
    const name = EventType[type] || "Unknown";

    const regularEvent: IRegularEvent = {
        name,
        type,
        channel,
        deltaTime,
        runningStatus,
        encode: () => [],
    };

    switch (regularEvent.type) {
        case EventType.SYSTEM_EXCLUSIVE_EVENT: {
            // const eventLength = dataStream.readIntVariableLengthValue();
            // regularEvent.data = dataStream.readInt(eventLength);
            break;
        }
        case EventType.NOTE_AFTERTOUCH:
            break;
        case EventType.CONTROLLER_CHANGE:
            return new ControllerChange(
                deltaTime,
                channel,
                new ControllerNumber(dataStream.readInt(1)),
                new ControllerValue(dataStream.readInt(1)),
                runningStatus
            );
        case EventType.PITCH_BEND_EVENT:
            break;
        case EventType.NOTE_OFF:
            return new NoteOff(
                deltaTime,
                channel,
                new Pitch(dataStream.readInt(1)),
                new Velocity(dataStream.readInt(1)),
                runningStatus
            );
        case EventType.NOTE_ON:
            return new NoteOn(
                deltaTime,
                channel,
                new Pitch(dataStream.readInt(1)),
                new Velocity(dataStream.readInt(1)),
                runningStatus
            );
        case EventType.PROGRAM_CHANGE:
            return new ProgramChange(
                deltaTime,
                channel,
                new Instrument(dataStream.readInt(1)),
                runningStatus
            );
        case EventType.CHANNEL_AFTERTOUCH:
            // regularEvent.data = dataStream.readInt(1);
            break;
        default:
            throw new Error("Unknown midi event detected.");
    }

    return regularEvent;
};

const decodeMetaEvent = (
    dataStream: IDataStream,
    deltaTime: number
): IMetaEvent => {
    const metaType = dataStream.readInt(1);
    const length = dataStream.readIntVariableLengthValue();

    switch (metaType) {
        case MetaEventType.END_OF_TRACK:
            return new EndOfTrack(deltaTime, length);
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
