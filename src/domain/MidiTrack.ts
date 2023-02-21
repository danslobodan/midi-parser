import { IDataStream } from "../DataStream";
import { decodeEvent } from "./MidiEvent";
import { IMidiEvent, EventType } from "./IMidiEvent";
import { IMetaEvent, MetaEventType } from "./meta-events/IMetaEvent";
import { numberTo8bitArray } from "../toEightBit";
import { NoteOn } from "./midi-event/NoteOn";
import { NoteOff } from "./midi-event/NoteOff";
import { Pitch } from "./midi-event/midi-component/Pitch";
import { Velocity } from "./midi-event/midi-component/Velocity";

interface IMidiTrack {
    header: string;
    lengthBytes: number;
    events: IMidiEvent[];
}

const TRACK_HEADER_SIGNATURE = 0x4d54726b;

export const decodeTrack = (dataStream: IDataStream): IMidiTrack => {
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
    // const closedNotes = closeNotes(midiTrack.events);
    // const encodedEvents = encodeEvents(closedNotes);
    const encodedEvents = encodeEvents(midiTrack.events);

    const encodedTrack: number[] = [
        ...numberTo8bitArray(TRACK_HEADER_SIGNATURE, 4),
        ...numberTo8bitArray(encodedEvents.length, 4),
        ...encodedEvents,
    ];

    return encodedTrack;
};

const END_OF_FILE = -1;

const decodeEvents = (dataStream: IDataStream): IMidiEvent[] => {
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

const closeNotes = (events: IMidiEvent[]): IMidiEvent[] => {
    const openNotes: Map<number, NoteOn> = new Map<number, NoteOff>();
    for (let i = 0; i < events.length; i++) {
        if (events[i].type === EventType.NOTE_ON) {
            const noteOn = events[i] as NoteOn;
            openNotes.set(noteOn.pitch.Value(), noteOn);
        }
        if (events[i].type === EventType.NOTE_OFF) {
            const noteOff = events[i] as NoteOff;
            openNotes.delete(noteOff.pitch.Value());
        }
    }

    const endOfTrack = events.pop();
    if (endOfTrack === undefined) return events;

    const RELEASE_VELOCITY = 64;
    const closed = [...openNotes.values()].flatMap((noteOn) => {
        return new NoteOff(
            endOfTrack.deltaTime,
            noteOn.channel,
            new Pitch(noteOn.pitch.Value()),
            new Velocity(RELEASE_VELOCITY),
            false
        );
    });

    return [...events, ...closed, endOfTrack];
};

export type { IMidiTrack };
