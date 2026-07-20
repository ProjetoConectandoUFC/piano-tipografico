export interface MidiDevice {
    id: string;
    name: string;
}

export interface AppSettings {
    fontFamily: string;
    textColor: string; // Inactive note color
    backgroundColor: string;
    noteColors: { [note: string]: string };
    noteSystem: 'anglican' | 'latin';
    noteDensity: number; // 0 to 1
    noteRandomness: number; // positional variance
}

export interface KnobValues {
    [controllerNumber: number]: number;
}

export interface VisualNote {
    id: number;
    text: string; // 'C', 'D', 'Dó', 'Ré', etc. The text to display.
    position: { top: string; left: string };
    rotation: number;
    fontSize: number; // in vw units
}

export interface ActiveNoteInfo {
    velocity: number;
    color: string;
}