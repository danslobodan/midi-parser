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

const TRACK_HEADER_SIGNATURE = 0x4d54726b;

export const getTrack = (dataStream: IDataStream): MidiTrack => {
    const lengthBytes = dataStream.readInt(4);
    const events = getEvents(dataStream);

    return {
        header: TRACK_HEADER_SIGNATURE.toString(16),
        lengthBytes,
        events,
        encode: () => {
            let encodedTrack: number[] = [
                ...numberTo8bitArrayFixedSize(TRACK_HEADER_SIGNATURE, 4),
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
        let runningStatus = false;
        // New status
        if (statusByte >= 128) lastStatusByte = statusByte;
        // Running status
        else {
            runningStatus = true;
            statusByte = lastStatusByte;
            dataStream.movePointer(-1);
        }

        const event = getMidiEvent(
            deltaTime,
            statusByte,
            dataStream,
            runningStatus
        );
        events.push(event);

        if ((event as MetaEvent)?.metaType === MetaEventType.END_OF_TRACK)
            return events;

        deltaTime = dataStream.readIntVariableLengthValue();
        statusByte = dataStream.readInt(1);
    }

    return events;
};

export type { MidiTrack };
