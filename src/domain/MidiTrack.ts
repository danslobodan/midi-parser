import { decodeEvent } from "./MidiEvent";
import { IMidiEvent } from "./IMidiEvent";
import { IMetaEvent, MetaEventType } from "./meta-events/IMetaEvent";
import { IMidiStream } from "./IMidiStream";
import { numberTo8bitArray } from "../toEightBit";

export interface IMidiTrack {
    header: string;
    lengthBytes: number;
    events: IMidiEvent[];
}

export const TRACK_HEADER_SIGNATURE = 0x4d54726b;

export const decodeTrack = (dataStream: IMidiStream): IMidiTrack => {
    const lengthBytes = dataStream.readInt(4);
    const events = decodeEvents(dataStream);

    return {
        header: TRACK_HEADER_SIGNATURE.toString(16),
        lengthBytes,
        events,
    };
};

const encodeEvents = (events: IMidiEvent[]): number[] => {
    const encoded: number[] = [];
    for (let i = 0; i < events.length; i++) {
        const encodedEvent = events[i].encode();
        encoded.push(...encodedEvent);
    }

    return encoded;
};

export const encodeTrack = (midiTrack: IMidiTrack) => {
    const encodedEvents = encodeEvents(midiTrack.events);

    const encodedTrack: number[] = [
        ...numberTo8bitArray(TRACK_HEADER_SIGNATURE, 4),
        ...numberTo8bitArray(encodedEvents.length, 4),
        ...encodedEvents,
    ];

    return encodedTrack;
};

const END_OF_FILE = -1;

const decodeEvents = (dataStream: IMidiStream): IMidiEvent[] => {
    const events: IMidiEvent[] = [];

    let deltaTime = dataStream.readIntVariableLengthValue();
    let statusByte = dataStream.readInt(1);
    let lastStatusByte = statusByte;

    while (statusByte !== END_OF_FILE) {
        let runningStatus = false;
        // New status
        if (statusByte >= 128) lastStatusByte = statusByte;
        // Running status
        else {
            runningStatus = true;
            statusByte = lastStatusByte;
            dataStream.movePointer(-1);
        }

        const event = decodeEvent(
            deltaTime,
            statusByte,
            dataStream,
            runningStatus
        );
        events.push(event);

        if ((event as IMetaEvent)?.metaType === MetaEventType.END_OF_TRACK)
            return events;

        deltaTime = dataStream.readIntVariableLengthValue();
        statusByte = dataStream.readInt(1);
    }

    return events;
};
