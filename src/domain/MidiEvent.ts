import {
    EndOfTrack,
    IntMetaEvent,
    SMPTEOffset,
    StringMetaEvent,
    TimeSignature,
    SetTempo,
    IMetaEvent,
    MetaEventType,
} from "./meta-events";
import { IMidiEvent, EventType } from "./IMidiEvent";
import {
    NoteOff,
    NoteOn,
    IRegularEvent,
    ControllerChange,
    ProgramChange,
    PitchBend,
} from "./midi-event";
import { IMidiStream } from "./IMidiStream";

export const decodeEvent = (
    deltaTime: number,
    statusByte: number,
    dataStream: IMidiStream,
    runningStatus: boolean
): IMidiEvent => {
    if (statusByte === EventType.META_EVENT_TYPE)
        return decodeMetaEvent(dataStream, deltaTime);

    return decodeRegularEvent(dataStream, deltaTime, statusByte, runningStatus);
};

const decodeRegularEvent = (
    dataStream: IMidiStream,
    deltaTime: number,
    statusByte: number,
    runningStatus: boolean
): IRegularEvent => {
    const type = (statusByte & 0b11110000) >> 4;
    const channel = statusByte & 0b00001111;

    switch (type) {
        case EventType.SYSTEM_EXCLUSIVE_EVENT: {
            throw new Error("System exclusive event not implemented.");
        }
        case EventType.NOTE_AFTERTOUCH:
            throw new Error("Note aftertouch not implemented.");
        case EventType.CONTROLLER_CHANGE:
            return new ControllerChange(
                deltaTime,
                channel,
                dataStream.readInt(1),
                dataStream.readInt(1),
                runningStatus
            );
        case EventType.PITCH_BEND:
            return new PitchBend(
                deltaTime,
                channel,
                dataStream.readInt(2),
                runningStatus
            );
        case EventType.NOTE_OFF:
            return new NoteOff(
                deltaTime,
                channel,
                dataStream.readInt(1),
                dataStream.readInt(1),
                runningStatus
            );
        case EventType.NOTE_ON:
            return new NoteOn(
                deltaTime,
                channel,
                dataStream.readInt(1),
                dataStream.readInt(1),
                runningStatus
            );
        case EventType.PROGRAM_CHANGE:
            return new ProgramChange(
                deltaTime,
                channel,
                dataStream.readInt(1),
                runningStatus
            );
        case EventType.CHANNEL_AFTERTOUCH:
            throw new Error("Channel aftertouch not implemented.");
        default:
            throw new Error("Unknown midi event detected.");
    }
};

const decodeMetaEvent = (
    dataStream: IMidiStream,
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
