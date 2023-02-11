import { IDataStream } from "../DataStream";
import { getMidiEvent, MetaEvent, MidiEvent } from "./MidiEvent";
import { EventType } from "./EventType";
import { MetaEventType } from "./MetaEventType";
import { numberTo8bitArray, numberTo8bitArrayFixedSize } from "../toEightBit";

interface MidiTrack {
    header: string;
    lengthBytes: number;
    events: MidiEvent[];
    encode: () => number[];
}

export const getTrack = (
    header: number,
    dataStream: IDataStream
): MidiTrack => {
    const lengthBytes = dataStream.readInt(4);
    const events = getEvents(dataStream);

    return {
        header: header.toString(16),
        lengthBytes,
        events,
        encode: () => {
            let encodedTrack: number[] = [
                ...numberTo8bitArray(header),
                ...numberTo8bitArrayFixedSize(lengthBytes, 4),
            ];

            for (let i = 0; i < events.length; i++) {
                const encodedEvent = events[i].encode();
                encodedTrack = [...encodedTrack, ...encodedEvent];
            }

            return encodedTrack;
        },
    };
};

export const getEvents = (dataStream: IDataStream): MidiEvent[] => {
    const events: MidiEvent[] = [];

    let deltaTime = dataStream.readIntVariableLengthValue();
    let statusByte = dataStream.readInt(1);
    let lastStatusByte = statusByte;

    while (statusByte !== EventType.END_OF_FILE) {
        // New status
        if (statusByte >= 128) lastStatusByte = statusByte;
        // Running status
        else {
            statusByte = lastStatusByte;
            dataStream.movePointer(-1);
        }

        const event = getMidiEvent(deltaTime, statusByte, dataStream);
        events.push(event);

        if ((event as MetaEvent)?.metaType === MetaEventType.END_OF_TRACK)
            return events;

        deltaTime = dataStream.readIntVariableLengthValue();
        statusByte = dataStream.readInt(1);
    }

    return events;
};

export type { MidiTrack };
