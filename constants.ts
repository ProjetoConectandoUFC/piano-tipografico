import { AppSettings } from './types';

export const ANGLICAN_NOTE_NAMES: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const ANGLICAN_NATURAL_NOTE_NAMES: string[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export const LATIN_NOTE_NAMES: string[] = ['Dó', 'Dó#', 'Ré', 'Ré#', 'Mi', 'Fá', 'Fá#', 'Sol', 'Sol#', 'Lá', 'Lá#', 'Si'];
export const LATIN_NATURAL_NOTE_NAMES: string[] = ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'];

export const NOTE_NAME_SYSTEMS = {
    anglican: { all: ANGLICAN_NOTE_NAMES, natural: ANGLICAN_NATURAL_NOTE_NAMES },
    latin: { all: LATIN_NOTE_NAMES, natural: LATIN_NATURAL_NOTE_NAMES },
};

export const FONT_OPTIONS: { name: string; value: string }[] = [
    { name: 'Roboto Mono', value: "'Roboto Mono', monospace" },
    { name: 'Oswald', value: "'Oswald', sans-serif" },
    { name: 'Playfair Display', value: "'Playfair Display', serif" },
    { name: 'Bebas Neue', value: "'Bebas Neue', cursive" },
    { name: 'Lobster', value: "'Lobster', cursive" },
    { name: 'Permanent Marker', value: "'Permanent Marker', cursive" },
    { name: 'Press Start 2P', value: "'Press Start 2P', cursive" },
    { name: 'Monoton', value: "'Monoton', cursive" },
    { name: 'Pacifico', value: "'Pacifico', cursive" },
    { name: 'Black Ops One', value: "'Black Ops One', cursive" },
];

export const NOTE_HIGHLIGHT_COLORS: { [key: string]: string } = {
    'C': "#87F50B", 'D': "#0031F5", 'E': "#07C9F5",
    'F': "#F6CE0C", 'G': "#FA21FA", 'A': "#F94302",
    'B': "#FF66FF", 'C#': "#FF507A", 'D#': "#FFAA50",
    'F#': "#50FFB0", 'G#': "#50DFFF", 'A#': "#B085FF",
};


export const DEFAULT_SETTINGS: AppSettings = {
    fontFamily: "'Roboto Mono', monospace",
    textColor: '#404040', // Pale color for inactive notes
    backgroundColor: '#111827',
    noteColors: NOTE_HIGHLIGHT_COLORS,
    noteSystem: 'anglican',
    noteDensity: 0.3, // Default density (0 to 1)
    noteRandomness: 80, // Default randomness (higher is more spread out)
};

export const AKAI_MPK_MINI_KNOBS: { [key: string]: number } = {
    'K1': 70, 'K2': 71, 'K3': 72, 'K4': 73,
    'K5': 74, 'K6': 75, 'K7': 76, 'K8': 77,
};

// Animation settings inspired by the python script
export const INITIAL_MAX_SCALE_AMOUNT = 1.8; // Max scale factor on full velocity
export const RELEASE_FADE_SECONDS = 0.5;