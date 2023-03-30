import { IMidiFile, encodeFile } from './domain/MidiFile';
import { IMidiTrack } from './domain/MidiTrack';
import { IMidiEvent, EventType } from './domain/IMidiEvent';
import { IMetaEvent, MetaEventType } from './domain/meta-events/IMetaEvent';
import { IMidiMap } from './application/midiMap';

export const joinMidiRepeat = (
    keys: string[],
    map: IMidiMap,
    repeatTimes: number
): IMidiFile => {
    const repeatedKeys: string[] = [].concat(...Array(repeatTimes).fill(keys));
    return joinMidiFiles(repeatedKeys, map);
};

export const joinMidiFiles = (keys: string[], map: IMidiMap): IMidiFile => {
    const tracks: IMidiTrack[] = [];
    const firstFile = map[keys[0]];
    let previousOffsets = new Array(firstFile.tracks.length).fill(0);

    keys.forEach((key) => {
        const file = map[key];
        const currentFileDuration = fileDuration(file);

        const currentOffsets: number[] = [];

        file.tracks.forEach((track, j) => {
            currentOffsets[j] = currentFileDuration - trackDuration(track);
            const trackEvents = removeRedundantEvents(track.events);

            if (!tracks[j]) {
                tracks[j] = {
                    header: track.header,
                    events: [...track.events],
                    lengthBytes: track.lengthBytes,
                };
            } else {
                trackEvents[0] = {
                    ...trackEvents[0],
                    deltaTime: trackEvents[0].deltaTime + previousOffsets[j],
                };

                tracks[j].events = [
                    ...tracks[j].events.slice(0, -1),
                    ...trackEvents,
                ];
                tracks[j].lengthBytes += track.lengthBytes;
            }
        });

        previousOffsets = currentOffsets;
    });

    return {
        header: {
            ...firstFile.header,
        },
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
