import { IMidiFile } from "./domain/MidiFile";
import { IMidiTrack, TRACK_HEADER_SIGNATURE } from "./domain/MidiTrack";
import { IMidiEvent, EventType } from "./domain/IMidiEvent";
import { NoteOn, NoteOff } from "./domain/midi-event";
import { Pitch, Velocity } from "./domain/midi-event/midi-component";
import { IMetaEvent, MetaEventType } from "./domain/meta-events/IMetaEvent";

export const joinMidi = (file1: IMidiFile, file2: IMidiFile): IMidiFile => {
    const tracks: IMidiTrack[] = [];

    const file1Duration = fileDuration(file1);

    for (let i = 0; i < file1.tracks.length; i++) {
        const file1track = file1.tracks[i];
        const file2track = file2.tracks[i];
        const trackOffset = file1Duration - trackDuration(file1track);
        tracks[i] = joinTracks(file1track, file2track, trackOffset);
    }

    return {
        header: file1.header,
        tracks,
    };
};

const joinTracks = (
    track1: IMidiTrack,
    track2: IMidiTrack,
    trackOffset: number
): IMidiTrack => {
    const track1Events = track1.events.slice(0, -1);
    const track2Events = removeRedundantEvents(track2);

    const track1EventsClosed = closeNotes(track1Events);
    track2Events[0].deltaTime += trackOffset;

    const events = [...track1EventsClosed, ...track2Events];
    return {
        header: TRACK_HEADER_SIGNATURE.toString(16),
        lengthBytes: track1.lengthBytes + track2.lengthBytes,
        events,
    };
};

const removeRedundantEvents = (track: IMidiTrack): IMidiEvent[] => {
    return track.events.filter(
        (event) =>
            (event as IMetaEvent)?.metaType !== MetaEventType.TRACK_NAME &&
            (event as IMetaEvent)?.metaType !== MetaEventType.SET_TEMPO &&
            event.type !== EventType.PROGRAM_CHANGE &&
            event.type !== EventType.CONTROLLER_CHANGE
    );
};

const fileDuration = (file: IMidiFile) => {
    return file.tracks
        .map((track) => trackDuration(track))
        .reduce((result, current) => (current > result ? current : result), 0);
};

const trackDuration = (track: IMidiTrack) => {
    return track.events
        .map((event) => event.deltaTime)
        .reduce((result, current) => result + current, 0);
};

const closeNotes = (events: IMidiEvent[]): IMidiEvent[] => {
    const openNotes = new Map<number, NoteOn>();
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

    const RELEASE_VELOCITY = 64;
    let runningStatus = false;
    const closed = [...openNotes.values()].flatMap((noteOn) => {
        const noteOff = new NoteOff(
            0,
            noteOn.channel,
            new Pitch(noteOn.pitch.Value()),
            new Velocity(RELEASE_VELOCITY),
            runningStatus
        );

        if (!runningStatus) runningStatus = true;

        return noteOff;
    });

    return [...events, ...closed];
};
