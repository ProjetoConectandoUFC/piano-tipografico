
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { AppSettings, MidiDevice, KnobValues, VisualNote, ActiveNoteInfo } from './types';
import { DEFAULT_SETTINGS, NOTE_NAME_SYSTEMS, AKAI_MPK_MINI_KNOBS, INITIAL_MAX_SCALE_AMOUNT } from './constants';
import { listenToMidiDevice, requestMidiAccess } from './services/midiService';
import { ControlPanel } from './components/ControlPanel';
import { ProjectionScreen } from './components/ProjectionScreen';
import { SettingsIcon, CloseIcon } from './components/Icons';

/**
 * Generates non-overlapping points using a Poisson-disc sampling algorithm.
 * @param width The width of the area to generate points in.
 * @param height The height of the area to generate points in.
 * @param minRadius The minimum distance between any two points.
 * @param k The number of attempts to find a valid point around an active sample.
 * @returns An array of {x, y} coordinates.
 */
const poissonDiscSampling = (width: number, height: number, minRadius: number, k = 30): { x: number; y: number }[] => {
    const cellSize = minRadius / Math.sqrt(2);
    const gridWidth = Math.ceil(width / cellSize);
    const gridHeight = Math.ceil(height / cellSize);
    const grid: number[][] = Array.from({ length: gridWidth }, () => Array(gridHeight).fill(-1));
    const points: { x: number; y: number }[] = [];
    const activeList: number[] = [];

    const toGridCoords = (p: { x: number; y: number }): [number, number] => {
        return [Math.floor(p.x / cellSize), Math.floor(p.y / cellSize)];
    };

    if (width <= 0 || height <= 0) return [];
    
    // Add first point
    const initialPos = { x: Math.random() * width, y: Math.random() * height };
    const initialGridCoords = toGridCoords(initialPos);
    
    points.push(initialPos);
    activeList.push(0);
    grid[initialGridCoords[0]][initialGridCoords[1]] = 0;

    while (activeList.length > 0) {
        const randomIndex = Math.floor(Math.random() * activeList.length);
        const activeIndex = activeList[randomIndex];
        const activePoint = points[activeIndex];
        let foundPoint = false;

        for (let i = 0; i < k; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.random() * minRadius + minRadius; // sample in annulus [r, 2r]
            const candidate = {
                x: activePoint.x + radius * Math.cos(angle),
                y: activePoint.y + radius * Math.sin(angle),
            };

            if (candidate.x >= 0 && candidate.x < width && candidate.y >= 0 && candidate.y < height) {
                const candidateGridCoords = toGridCoords(candidate);
                let isValid = true;
                
                const startX = Math.max(0, candidateGridCoords[0] - 2);
                const endX = Math.min(gridWidth, candidateGridCoords[0] + 3);
                const startY = Math.max(0, candidateGridCoords[1] - 2);
                const endY = Math.min(gridHeight, candidateGridCoords[1] + 3);

                for (let x = startX; x < endX; x++) {
                    for (let y = startY; y < endY; y++) {
                        const neighborIndex = grid[x][y];
                        if (neighborIndex !== -1) {
                            const neighborPoint = points[neighborIndex];
                            const dist = Math.hypot(neighborPoint.x - candidate.x, neighborPoint.y - candidate.y);
                            if (dist < minRadius) {
                                isValid = false;
                                break;
                            }
                        }
                    }
                    if (!isValid) break;
                }

                if (isValid) {
                    const newIndex = points.length;
                    points.push(candidate);
                    activeList.push(newIndex);
                    grid[candidateGridCoords[0]][candidateGridCoords[1]] = newIndex;
                    foundPoint = true;
                    break;
                }
            }
        }

        if (!foundPoint) {
            activeList.splice(randomIndex, 1);
        }
    }
    return points;
};


const generateVisualNotes = (settings: AppSettings, viewportWidth: number, viewportHeight: number, fontSizeMultiplier: number): VisualNote[] => {
    if (viewportWidth === 0 || viewportHeight === 0) return [];

    const { noteDensity, noteRandomness, noteSystem } = settings;

    // 1. Calculate minRadius from noteDensity. Higher density means a smaller radius.
    const maxRadius = 200; // Corresponds to lowest density
    const minRadius = 40;  // Corresponds to highest density
    const radiusRange = maxRadius - minRadius;
    const effectiveDensity = (noteDensity - 0.05) / 0.95; // Normalize density from 0 to 1
    const currentMinRadius = maxRadius - (effectiveDensity * radiusRange);

    // 2. Calculate generation area from noteRandomness
    const generationWidth = viewportWidth * (noteRandomness / 100);
    const generationHeight = viewportHeight * (noteRandomness / 100);
    const offsetX = (viewportWidth - generationWidth) / 2;
    const offsetY = (viewportHeight - generationHeight) / 2;

    // 3. Generate non-overlapping points
    const points = poissonDiscSampling(generationWidth, generationHeight, currentMinRadius);

    // 4. Create VisualNote objects from the generated points
    const notes: VisualNote[] = [];
    const naturalNotes = NOTE_NAME_SYSTEMS[noteSystem].natural;
    let id = 0;

    for (const point of points) {
        const noteText = naturalNotes[id % naturalNotes.length];
        notes.push({
            id: id++,
            text: noteText,
            position: {
                left: `${((point.x + offsetX) / viewportWidth) * 100}%`,
                top: `${((point.y + offsetY) / viewportHeight) * 100}%`,
            },
            rotation: Math.random() * 50 - 25,
            fontSize: (Math.random() * 2 + 2.5) * fontSizeMultiplier, // vw units
        });
    }

    return notes.sort(() => Math.random() - 0.5); // Shuffle for better note distribution
};


const App: React.FC = () => {
    const [midiAccess, setMidiAccess] = useState<MIDIAccess | null>(null);
    const [inputs, setInputs] = useState<MidiDevice[]>([]);
    const [selectedInputId, setSelectedInputId] = useState<string | null>(null);
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [isControlPanelVisible, setIsControlPanelVisible] = useState<boolean>(true);
    const [isAkaiConnected, setIsAkaiConnected] = useState<boolean>(false);
    const [knobValues, setKnobValues] = useState<KnobValues>({});
    const [midiSupportError, setMidiSupportError] = useState<string | null>(null);
    const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);
    const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(false);

    const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0);
    const [visualNotes, setVisualNotes] = useState<VisualNote[]>(() => generateVisualNotes(DEFAULT_SETTINGS, window.innerWidth, window.innerHeight, 1.0));
    const [activeNotes, setActiveNotes] = useState<Map<string, ActiveNoteInfo>>(new Map());
    const [maxScale, setMaxScale] = useState(INITIAL_MAX_SCALE_AMOUNT);
    const pressedNaturalNotesRef = useRef<Map<string, number>>(new Map());

    const [projectionContainer, setProjectionContainer] = useState<HTMLElement | null>(null);
    const projectionWindowRef = useRef<Window | null>(null);

    const noteRefs = useRef(new Map<number, HTMLDivElement>());
    const [noteOffsets, setNoteOffsets] = useState<Map<number, { x: number; y: number }>>(new Map());

    useEffect(() => {
        const handleResize = () => {
            const target = projectionWindowRef.current || window;
            setViewportSize({ width: target.innerWidth, height: target.innerHeight });
        };
        const targetWindow = projectionWindowRef.current || window;
        targetWindow.addEventListener('resize', handleResize);
        // Initial size set
        handleResize();
        return () => targetWindow.removeEventListener('resize', handleResize);
    }, [projectionContainer]);


    useEffect(() => {
        // Debounce regeneration to avoid lag during resizing
        const timeoutId = setTimeout(() => {
            const target = projectionWindowRef.current || window;
            setVisualNotes(generateVisualNotes(settings, target.innerWidth, target.innerHeight, fontSizeMultiplier));
        }, 150);
        
        return () => clearTimeout(timeoutId);
    }, [settings.noteDensity, settings.noteRandomness, settings.noteSystem, viewportSize, settings.fontFamily, fontSizeMultiplier, projectionContainer]);


    useEffect(() => {
        const initMidi = async () => {
            try {
                const access = await requestMidiAccess();
                setMidiAccess(access);
                const midiInputs = Array.from(access.inputs.values()).map(input => ({
                    id: input.id,
                    name: input.name || 'Unknown Device',
                }));
                setInputs(midiInputs);
                if (midiInputs.length > 0) {
                    setSelectedInputId(midiInputs[0].id);
                } else {
                    throw new Error("No MIDI input devices found.");
                }
            } catch (error) {
                console.error('MIDI Init Error:', error);
                if (error instanceof Error) {
                    setMidiSupportError(error.message);
                } else {
                    setMidiSupportError('An unknown error occurred while accessing MIDI devices.');
                }
                setIsSimulationMode(true);
                setIsBannerDismissed(false);
            }
        };

        initMidi();
    }, []);

    const handleNoteOn = useCallback((noteNumber: number, velocity: number) => {
        const anglicanNoteName = NOTE_NAME_SYSTEMS.anglican.all[noteNumber % 12];
        const naturalNote = anglicanNoteName.replace('#', '');
        const color = settings.noteColors[anglicanNoteName] || '#FFFFFF';

        const naturalNoteToDisplay = NOTE_NAME_SYSTEMS[settings.noteSystem].natural.find(
             (n, i) => NOTE_NAME_SYSTEMS.anglican.natural[i] === naturalNote
        ) || naturalNote;

        const currentCount = pressedNaturalNotesRef.current.get(naturalNoteToDisplay) || 0;
        pressedNaturalNotesRef.current.set(naturalNoteToDisplay, currentCount + 1);

        setActiveNotes(prev => {
            const newActiveNotes = new Map(prev);
            newActiveNotes.set(naturalNoteToDisplay, { velocity, color });
            return newActiveNotes;
        });
    }, [settings.noteColors, settings.noteSystem]);

    const handleNoteOff = useCallback((noteNumber: number) => {
        const anglicanNoteName = NOTE_NAME_SYSTEMS.anglican.all[noteNumber % 12];
        const naturalNote = anglicanNoteName.replace('#', '');
        const naturalNoteToDisplay = NOTE_NAME_SYSTEMS[settings.noteSystem].natural.find(
             (n, i) => NOTE_NAME_SYSTEMS.anglican.natural[i] === naturalNote
        ) || naturalNote;

        const currentCount = pressedNaturalNotesRef.current.get(naturalNoteToDisplay) || 0;
        if (currentCount <= 1) {
            pressedNaturalNotesRef.current.delete(naturalNoteToDisplay);
            setActiveNotes(prev => {
                const newActiveNotes = new Map(prev);
                newActiveNotes.delete(naturalNoteToDisplay);
                return newActiveNotes;
            });
        } else {
            pressedNaturalNotesRef.current.set(naturalNoteToDisplay, currentCount - 1);
        }
    }, [settings.noteSystem]);

    const handleControlChange = useCallback((controllerNumber: number, value: number) => {
        setKnobValues(prev => ({ ...prev, [controllerNumber]: value }));
        
        if (controllerNumber === AKAI_MPK_MINI_KNOBS['K1']) {
            const minScale = 1.1;
            const maxScaleAmount = 5.0;
            const newScale = minScale + (value / 127) * (maxScaleAmount - minScale);
            setMaxScale(newScale);
        } else if (controllerNumber === AKAI_MPK_MINI_KNOBS['K6']) {
            // Map 0-127 to a multiplier range, e.g., 0.5x to 2.0x
            const minMultiplier = 0.5;
            const maxMultiplier = 2.0;
            const newMultiplier = minMultiplier + (value / 127) * (maxMultiplier - minMultiplier);
            setFontSizeMultiplier(newMultiplier);
        }
    }, []);
    
    useEffect(() => {
        if (!midiAccess || !selectedInputId || isSimulationMode) return;

        const selectedInput = midiAccess.inputs.get(selectedInputId);
        setIsAkaiConnected(selectedInput?.name?.toLowerCase().includes('akai mpk mini') ?? false);
        
        const cleanup = listenToMidiDevice(
            selectedInputId,
            midiAccess,
            handleNoteOn,
            handleNoteOff,
            handleControlChange
        );

        return cleanup;
    }, [midiAccess, selectedInputId, handleNoteOn, handleNoteOff, handleControlChange, isSimulationMode]);
    
    useEffect(() => {
        if (!isSimulationMode) return;
        const simulationInterval = setInterval(() => {
            const randomNoteNumber = Math.floor(Math.random() * 61) + 36;
            const randomVelocity = Math.floor(Math.random() * 88) + 40;
            handleNoteOn(randomNoteNumber, randomVelocity);
            setTimeout(() => handleNoteOff(randomNoteNumber), 500);
        }, 2000);
        return () => clearInterval(simulationInterval);
    }, [isSimulationMode, handleNoteOn, handleNoteOff]);

    // Collision and Push Effect
    useEffect(() => {
        if (activeNotes.size === 0) {
            setNoteOffsets(new Map());
            return;
        }

        const newOffsets = new Map<number, { x: number; y: number }>();
        const activeNoteElements: { id: number; rect: DOMRect }[] = [];

        // Get rects for active notes
        visualNotes.forEach(vNote => {
            if (activeNotes.has(vNote.text)) {
                const el = noteRefs.current.get(vNote.id);
                if (el) {
                    activeNoteElements.push({ id: vNote.id, rect: el.getBoundingClientRect() });
                }
            }
        });

        if (activeNoteElements.length === 0) return;

        visualNotes.forEach(noteB => {
            const elB = noteRefs.current.get(noteB.id);
            if (!elB) return;

            const rectB = elB.getBoundingClientRect();
            const centerB = { x: rectB.left + rectB.width / 2, y: rectB.top + rectB.height / 2 };
            let totalPush = { x: 0, y: 0 };

            activeNoteElements.forEach(noteA => {
                if (noteA.id === noteB.id) return;

                const rectA = noteA.rect;
                const centerA = { x: rectA.left + rectA.width / 2, y: rectA.top + rectA.height / 2 };

                const dx = centerB.x - centerA.x;
                const dy = centerB.y - centerA.y;
                const distance = Math.hypot(dx, dy);

                const radiusA = (rectA.width + rectA.height) / 4;
                const radiusB = (rectB.width + rectB.height) / 4;
                const combinedRadius = radiusA + radiusB;
                
                const overlap = combinedRadius - distance;

                if (overlap > 0) {
                    const pushFactor = overlap * 1.5; // Push away a bit more than just the overlap
                    if (distance > 0) {
                        totalPush.x += (dx / distance) * pushFactor;
                        totalPush.y += (dy / distance) * pushFactor;
                    } else { // Exactly overlapping, push in a random direction
                        const randomAngle = Math.random() * 2 * Math.PI;
                        totalPush.x += Math.cos(randomAngle) * pushFactor;
                        totalPush.y += Math.sin(randomAngle) * pushFactor;
                    }
                }
            });
            
            if (totalPush.x !== 0 || totalPush.y !== 0) {
                 newOffsets.set(noteB.id, totalPush);
            }
        });

        setNoteOffsets(newOffsets);

    }, [activeNotes, visualNotes]);


    const handleDeviceChange = (id: string) => {
        setSelectedInputId(id);
        setActiveNotes(new Map());
        pressedNaturalNotesRef.current.clear();
    };

    const handleSettingsChange = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const handleFontSizeMultiplierChange = (value: number) => {
        setFontSizeMultiplier(value);
    };
    
    const handleToggleSimulationMode = (enabled: boolean) => {
        setIsSimulationMode(enabled);
    };

    const handleOpenProjection = () => {
        if (projectionWindowRef.current && !projectionWindowRef.current.closed) {
            projectionWindowRef.current.focus();
            return;
        }

        const newWindow = window.open('', '_blank', 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no');
        if (newWindow) {
            projectionWindowRef.current = newWindow;
            newWindow.document.title = 'MIDI Visualizer - Projection';
            
            // Copy styles from main window
            Array.from(document.styleSheets).forEach(styleSheet => {
                if (styleSheet.href) {
                    const link = newWindow.document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = styleSheet.href;
                    newWindow.document.head.appendChild(link);
                } else if (styleSheet.cssRules) {
                    const style = newWindow.document.createElement('style');
                    style.textContent = Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
                    newWindow.document.head.appendChild(style);
                }
            });

            const container = newWindow.document.createElement('div');
            container.id = 'projection-root';
            newWindow.document.body.appendChild(container);
            newWindow.document.body.style.margin = '0';
            newWindow.document.body.style.overflow = 'hidden';
            
            setProjectionContainer(container);

            newWindow.addEventListener('beforeunload', () => {
                setProjectionContainer(null);
                projectionWindowRef.current = null;
            });
        }
    };


    return (
        <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: settings.backgroundColor }}>
             {!isBannerDismissed && midiSupportError && (
                <div className="fixed top-0 left-0 right-0 bg-yellow-500/90 text-yellow-900 p-3 text-center z-30 text-sm shadow-lg font-semibold flex items-center justify-center gap-4">
                    <p><strong>Demonstration Mode Active:</strong> No MIDI device detected. For MIDI control, please use a browser like Chrome or Edge.</p>
                    <button onClick={() => setIsBannerDismissed(true)} className="p-1 rounded-full hover:bg-yellow-600/50 transition-colors" aria-label="Dismiss">
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>
            )}
            
            {!projectionContainer && (
                <ProjectionScreen 
                    visualNotes={visualNotes} 
                    activeNotes={activeNotes} 
                    settings={settings}
                    maxScaleAmount={maxScale}
                    noteRefs={noteRefs}
                    noteOffsets={noteOffsets}
                />
            )}

            {projectionContainer && ReactDOM.createPortal(
                 <ProjectionScreen 
                    visualNotes={visualNotes} 
                    activeNotes={activeNotes} 
                    settings={settings}
                    maxScaleAmount={maxScale}
                    noteRefs={noteRefs}
                    noteOffsets={noteOffsets}
                />,
                projectionContainer
            )}
            
            <button
                onClick={() => setIsControlPanelVisible(prev => !prev)}
                className="fixed top-4 right-4 z-20 p-3 bg-gray-700/50 text-white rounded-full hover:bg-gray-600/70 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                aria-label="Toggle settings panel"
            >
                <SettingsIcon />
            </button>

            {isControlPanelVisible && (
                <ControlPanel
                    inputs={inputs}
                    selectedInputId={selectedInputId}
                    onDeviceChange={handleDeviceChange}
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
                    isAkaiConnected={isAkaiConnected}
                    knobValues={knobValues}
                    onClose={() => setIsControlPanelVisible(false)}
                    isSimulationMode={isSimulationMode}
                    onToggleSimulationMode={handleToggleSimulationMode}
                    onOpenProjection={handleOpenProjection}
                    isProjectionOpen={!!projectionContainer}
                    fontSizeMultiplier={fontSizeMultiplier}
                    onFontSizeMultiplierChange={handleFontSizeMultiplierChange}
                />
            )}
        </div>
    );
};

export default App;
