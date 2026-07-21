import { AppSettings } from './types';

// ==========================================
// Sistemas de Nomenclatura de Notas
// ==========================================

// Define as 12 notas cromáticas usando a convenção em inglês/anglicana (letras)
export const ANGLICAN_NOTE_NAMES: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Define as 7 notas naturais (diatônicas) usando a convenção em inglês/anglicana
export const ANGLICAN_NATURAL_NOTE_NAMES: string[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Define as 12 notas cromáticas usando a convenção latina (sílabas de solfejo)
export const LATIN_NOTE_NAMES: string[] = ['Dó', 'Dó#', 'Ré', 'Ré#', 'Mi', 'Fá', 'Fá#', 'Sol', 'Sol#', 'Lá', 'Lá#', 'Si'];

// Define as 7 notas naturais (diatônicas) usando a convenção latina
export const LATIN_NATURAL_NOTE_NAMES: string[] = ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'];

// Associa os identificadores de sistema às respectivas matrizes de notas cromáticas e naturais para facilitar a alternância
export const NOTE_NAME_SYSTEMS = {
    anglican: { all: ANGLICAN_NOTE_NAMES, natural: ANGLICAN_NATURAL_NOTE_NAMES },
    latin: { all: LATIN_NOTE_NAMES, natural: LATIN_NATURAL_NOTE_NAMES },
};


// ==========================================
// Opções de Estilização e Personalização da Interface (UI)
// ==========================================

// Famílias de fontes disponíveis e suas declarações CSS correspondentes para a interface do aplicativo
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

// Paleta de cores mapeando cada nota musical individual para uma cor de destaque específica (formato HEX)
export const NOTE_HIGHLIGHT_COLORS: { [key: string]: string } = {
    'C': "#87F50B", 'D': "#0031F5", 'E': "#07C9F5",
    'F': "#F6CE0C", 'G': "#FA21FA", 'A': "#F94302",
    'B': "#FF66FF", 'C#': "#FF507A", 'D#': "#FFAA50",
    'F#': "#50FFB0", 'G#': "#50DFFF", 'A#': "#B085FF",
};

// Configurações padrão aplicadas quando o aplicativo é inicializado ou redefinido
export const DEFAULT_SETTINGS: AppSettings = {
    fontFamily: "'Roboto Mono', monospace",
    textColor: '#404040', // Cor clara para notas inativas
    backgroundColor: '#111827',
    noteColors: NOTE_HIGHLIGHT_COLORS,
    noteSystem: 'anglican',
    noteDensity: 0.3, // Densidade padrão (0 a 1)
    noteRandomness: 80, // Aleatoriedade padrão (valores mais altos ficam mais espalhados)
};


// ==========================================
// Configuração do Controlador MIDI
// ==========================================

// Mapeia os knobs (botões giratórios físicos K1 a K8) de um teclado Akai MPK Mini para seus respectivos números de CC (Control Change) MIDI
export const AKAI_MPK_MINI_KNOBS: { [key: string]: number } = {
    'K1': 70, 'K2': 71, 'K3': 72, 'K4': 73,
    'K5': 74, 'K6': 75, 'K7': 76, 'K8': 77,
};


// ==========================================
// Configurações de Animação
// ==========================================

// Configurações de animação inspiradas no script original em Python
export const INITIAL_MAX_SCALE_AMOUNT = 1.8; // Fator máximo de escala aplicado com velocidade máxima da nota
export const RELEASE_FADE_SECONDS = 0.5; // Duração em segundos para o efeito de desaparecimento (fade-out) ao soltar a nota
