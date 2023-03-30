import { IMetaEvent, MetaEventType } from './meta-events';
import { IMidiEvent, EventType } from './IMidiEvent';
import { IRegularEvent } from './midi-event';
import { IMidiStream } from './IMidiStream';

import {
    numberTo8bitArray,
    numberTo8bitArrayVariableLength,
    stringTo8BitArray,
} from '../toEightBit';

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

    const event = {
        eventName: EventType[type],
        deltaTime,
        type,
        channel,
        runningStatus,
    };

    switch (type) {
        case EventType.SYSTEM_EXCLUSIVE_EVENT: {
            throw new Error('System exclusive event not implemented.');
        }
        case EventType.NOTE_AFTERTOUCH:
            throw new Error('Note aftertouch not implemented.');
        case EventType.CONTROLLER_CHANGE:
        case EventType.PITCH_BEND:
        case EventType.NOTE_OFF:
        case EventType.NOTE_ON:
            return {
                ...event,
                length: 2,
                data: [dataStream.readInt(1), dataStream.readInt(1)],
            };
        case EventType.PROGRAM_CHANGE:
            return {
                ...event,
                length: 1,
                data: [dataStream.readInt(1)],
            };
        case EventType.CHANNEL_AFTERTOUCH:
            throw new Error('Channel aftertouch not implemented.');
        default:
            throw new Error('Unknown midi event detected.');
    }
};

const decodeMetaEvent = (
    dataStream: IMidiStream,
    deltaTime: number
): IMetaEvent => {
    const metaType = dataStream.readInt(1);
    const length = dataStream.readIntVariableLengthValue();

    const metaEvent = {
        eventName: MetaEventType[metaType],
        type: EventType.META_EVENT_TYPE,
        deltaTime,
        metaType,
        length,
    };

    switch (metaType) {
        case MetaEventType.END_OF_TRACK:
            return metaEvent;
        case MetaEventType.TEXT_EVENT:
        case MetaEventType.COPYRIGHT_NOTICE:
        case MetaEventType.TRACK_NAME:
        case MetaEventType.INSTRUMENT_NAME:
        case MetaEventType.LYRICS:
        case MetaEventType.MARKER:
        case MetaEventType.CUE_POINT:
            return {
                ...metaEvent,
                data: dataStream.readStr(length),
            };
        case MetaEventType.MIDI_CHANNEL_PREFIX:
        case MetaEventType.MIDI_PORT:
        case MetaEventType.KEY_SIGNATURE:
        case MetaEventType.SET_TEMPO:
            return {
                ...metaEvent,
                data: dataStream.readInt(length),
            };
        case MetaEventType.SMPTE_OFFSET:
            const offset: number[] = [];
            offset[0] = dataStream.readInt(1);
            offset[1] = dataStream.readInt(1);
            offset[2] = dataStream.readInt(1);
            offset[3] = dataStream.readInt(1);
            offset[4] = dataStream.readInt(1);
            return {
                ...metaEvent,
                data: offset,
            };
        case MetaEventType.TIME_SIGNATURE:
            const timeSignature: number[] = [];
            timeSignature[0] = dataStream.readInt(1);
            timeSignature[1] = dataStream.readInt(1);
            timeSignature[2] = dataStream.readInt(1);
            timeSignature[3] = dataStream.readInt(1);
            return {
                ...metaEvent,
                data: timeSignature,
            };
        default:
            return {
                ...metaEvent,
                data: dataStream.readInt(length),
            };
    }
};

export const encodeEvent = (event: IMidiEvent): number[] => {
    if (event.type === EventType.META_EVENT_TYPE)
        return encodeMetaEvent(event as IMetaEvent);

    return encodeRegularEvent(event as IRegularEvent);
};

const encodeRegularEvent = (event: IRegularEvent): number[] => {
    const encoded = numberTo8bitArrayVariableLength(event.deltaTime);

    if (!event.runningStatus) {
        encoded.push(
            ...numberTo8bitArray((event.type << 4) + event.channel, 1)
        );
    }

    encoded.push(...encodeRegularEventData(event));
    return encoded;
};

const encodeRegularEventData = (event: IRegularEvent): number[] => {
    switch (event.type) {
        case EventType.SYSTEM_EXCLUSIVE_EVENT: {
            throw new Error('System exclusive event not implemented.');
        }
        case EventType.NOTE_AFTERTOUCH:
            throw new Error('Note aftertouch not implemented.');
        case EventType.CONTROLLER_CHANGE:
        case EventType.PITCH_BEND:
        case EventType.NOTE_OFF:
        case EventType.NOTE_ON:
            return [
                ...numberTo8bitArray(event.data[0], 1),
                ...numberTo8bitArray(event.data[1], 1),
            ];
        case EventType.PROGRAM_CHANGE:
            return numberTo8bitArray(event.data[0], 1);
        case EventType.CHANNEL_AFTERTOUCH:
            throw new Error('Channel aftertouch not implemented.');
        default:
            throw new Error('Unknown midi event detected.');
    }
};

const encodeMetaEvent = (event: IMetaEvent): number[] => {
    return [
        ...numberTo8bitArrayVariableLength(event.deltaTime),
        ...numberTo8bitArray(event.type, 1),
        ...numberTo8bitArray(event.metaType, 1),
        ...numberTo8bitArrayVariableLength(event.length),
        ...encodeMetaEventData(event),
    ];
};

const encodeMetaEventData = (event: IMetaEvent): number[] => {
    switch (event.metaType) {
        case MetaEventType.END_OF_TRACK:
            return [];
        case MetaEventType.TEXT_EVENT:
        case MetaEventType.COPYRIGHT_NOTICE:
        case MetaEventType.TRACK_NAME:
        case MetaEventType.INSTRUMENT_NAME:
        case MetaEventType.LYRICS:
        case MetaEventType.MARKER:
        case MetaEventType.CUE_POINT:
            return stringTo8BitArray(event.data as string);
        case MetaEventType.MIDI_CHANNEL_PREFIX:
        case MetaEventType.MIDI_PORT:
        case MetaEventType.KEY_SIGNATURE:
        case MetaEventType.SET_TEMPO:
            return numberTo8bitArray(event.data as number, event.length);
        case MetaEventType.SMPTE_OFFSET:
            const offsetData = event.data as number[];
            return [
                ...numberTo8bitArray(offsetData[0], 1),
                ...numberTo8bitArray(offsetData[1], 1),
                ...numberTo8bitArray(offsetData[2], 1),
                ...numberTo8bitArray(offsetData[3], 1),
                ...numberTo8bitArray(offsetData[4], 1),
            ];
        case MetaEventType.TIME_SIGNATURE:
            const timeSigData = event.data as number[];
            return [
                ...numberTo8bitArray(timeSigData[0], 1),
                ...numberTo8bitArray(timeSigData[1], 1),
                ...numberTo8bitArray(timeSigData[2], 1),
                ...numberTo8bitArray(timeSigData[3], 1),
            ];
        default:
            throw Error(`Cannot encode unknown event ${event.metaType}`);
    }
};
