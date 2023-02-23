export interface IMidiStream {
    movePointer: (bytes: number) => void;
    readInt: (bytes: number) => number;
    readStr: (bytes: number) => string;
    readIntVariableLengthValue: () => number;
}
