import { IMidiFile, decode, encode } from "./domain/MidiFile";
import { IMidiTrack } from "./domain/MidiTrack";
import { IMidiEvent, EventType } from "./domain/IMidiEvent";
import { IMetaEvent, MetaEventType } from "./domain/meta-events/IMetaEvent";
import { createStream } from "./createMidiStream";

export const joinMidiData = (data: DataView[]) => {
    const files = data.map((d) => {
        const stream = createStream(d);
        const file = decode(stream);
        return file;
    });

    const joined = joinMidiFiles(files);
    const encoded = encode(joined);

    return new Uint8Array(encoded);
};

export const joinMidiFiles = (files: IMidiFile[]): IMidiFile => {
    const tracks: IMidiTrack[] = [];
    const initialOffsets = new Array(files[0].tracks.length).fill(0);

    files.reduce((previousOffsets: number[], currentFile: IMidiFile) => {
        const currentFileDuration = fileDuration(currentFile);
        const currentOffsets: number[] = [];
        for (let i = 0; i < currentFile.tracks.length; i++) {
            const currentTrack = currentFile.tracks[i];
            currentOffsets[i] =
                currentFileDuration - trackDuration(currentTrack);

            if (!tracks[i])
                tracks[i] = {
                    ...currentTrack,
                };
            else {
                const trackEvents = removeRedundantEvents(currentTrack.events);

                trackEvents[0] = {
                    ...trackEvents[0],
                    deltaTime: trackEvents[0].deltaTime + previousOffsets[i],
                    encode: trackEvents[0].encode,
                };
                tracks[i].events.pop();
                tracks[i].events.push(...trackEvents);
                tracks[i].lengthBytes += currentTrack.lengthBytes;
            }
        }

        return currentOffsets;
    }, initialOffsets);

    return {
        header: files[0].header,
        tracks,
    };
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

const removeRedundantEvents = (events: IMidiEvent[]): IMidiEvent[] => {
    return events.filter(
        (event) =>
            (event as IMetaEvent)?.metaType !== MetaEventType.TRACK_NAME &&
            (event as IMetaEvent)?.metaType !== MetaEventType.SET_TEMPO &&
            event.type !== EventType.PROGRAM_CHANGE &&
            event.type !== EventType.CONTROLLER_CHANGE
    );
};
