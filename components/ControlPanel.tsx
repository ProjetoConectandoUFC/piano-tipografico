
import React from 'react';
import { AppSettings, MidiDevice, KnobValues } from '../types';
import { FONT_OPTIONS, AKAI_MPK_MINI_KNOBS } from '../constants';
import { CloseIcon, ExternalLinkIcon } from './Icons';

interface ControlPanelProps {
    inputs: MidiDevice[];
    selectedInputId: string | null;
    onDeviceChange: (id: string) => void;
    settings: AppSettings;
    onSettingsChange: (newSettings: Partial<AppSettings>) => void;
    isAkaiConnected: boolean;
    knobValues: KnobValues;
    onClose: () => void;
    isSimulationMode: boolean;
    onToggleSimulationMode: (enabled: boolean) => void;
    onOpenProjection: () => void;
    isProjectionOpen: boolean;
    fontSizeMultiplier: number;
    onFontSizeMultiplierChange: (value: number) => void;
}

const ControlSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="py-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const KnobIndicator: React.FC<{ name: string; value: number | undefined }> = ({ name, value = 0 }) => {
    const percentage = (value / 127) * 100;
    return (
        <div>
            <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-medium text-gray-300">{name}</span>
                <span className="text-gray-400">{value}</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
}

const ToggleSwitch: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; }> = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between">
        <label htmlFor="toggle-switch" className="text-sm font-medium text-gray-300">{label}</label>
        <button
            id="toggle-switch"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${checked ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({
    inputs,
    selectedInputId,
    onDeviceChange,
    settings,
    onSettingsChange,
    isAkaiConnected,
    knobValues,
    onClose,
    isSimulationMode,
    onToggleSimulationMode,
    onOpenProjection,
    isProjectionOpen,
    fontSizeMultiplier,
    onFontSizeMultiplierChange,
}) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-10 animate-fade-in" onClick={onClose}>
            <div
                className="absolute top-0 right-0 h-full w-full max-w-sm bg-gray-800 text-white shadow-2xl p-6 overflow-y-auto animate-slide-in-right"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold">Controls</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                        <CloseIcon />
                    </button>
                </div>

                <div className="divide-y divide-gray-700">
                    <ControlSection title="Projection">
                         <button 
                            onClick={onOpenProjection}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                         >
                            <ExternalLinkIcon />
                            {isProjectionOpen ? 'Focus Projection Window' : 'Open Projection in New Window'}
                        </button>
                    </ControlSection>

                    <ControlSection title="MIDI Setup">
                        <ToggleSwitch 
                           label="Demonstration Mode"
                           checked={isSimulationMode}
                           onChange={onToggleSimulationMode}
                        />

                        {inputs.length > 0 && !isSimulationMode ? (
                            <div>
                                <label htmlFor="midi-device" className="block text-sm font-medium text-gray-300 mb-2">
                                    Connected Device
                                </label>
                                <select
                                    id="midi-device"
                                    value={selectedInputId || ''}
                                    onChange={(e) => onDeviceChange(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    {inputs.map((input) => (
                                        <option key={input.id} value={input.id}>
                                            {input.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="bg-gray-900/50 p-3 rounded-md text-sm text-gray-400">
                                {isSimulationMode ? (
                                    <p>Demonstration mode is active. Turn it off to use a connected MIDI device.</p>
                                ) : (
                                    <p>No MIDI device detected. Please connect a device and refresh. You can enable demonstration mode to see the visuals.</p>
                                )}
                            </div>
                         )}
                    </ControlSection>

                    <ControlSection title="Appearance">
                        <div>
                             <label htmlFor="note-system" className="block text-sm font-medium text-gray-300 mb-2">Note System</label>
                             <select
                                id="note-system"
                                value={settings.noteSystem}
                                onChange={(e) => onSettingsChange({ noteSystem: e.target.value as 'anglican' | 'latin' })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="anglican">Anglican (C, D, E...)</option>
                                <option value="latin">Latin (Dó, Ré, Mi...)</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="font-family" className="block text-sm font-medium text-gray-300 mb-2">Font</label>
                            <select
                                id="font-family"
                                value={settings.fontFamily}
                                onChange={(e) => onSettingsChange({ fontFamily: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                {FONT_OPTIONS.map((font) => (
                                    <option key={font.value} value={font.value}>
                                        {font.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="font-size" className="block text-sm font-medium text-gray-300 mb-2">Base Font Size</label>
                            <input
                                id="font-size"
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.01"
                                value={fontSizeMultiplier}
                                onChange={(e) => onFontSizeMultiplierChange(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="text-color" className="text-sm font-medium text-gray-300">Inactive Note Color</label>
                            <input
                                id="text-color"
                                type="color"
                                value={settings.textColor}
                                onChange={(e) => onSettingsChange({ textColor: e.target.value })}
                                className="p-1 h-8 w-14 block bg-gray-700 border border-gray-600 cursor-pointer rounded-lg"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="bg-color" className="text-sm font-medium text-gray-300">Background Color</label>
                             <input
                                id="bg-color"
                                type="color"
                                value={settings.backgroundColor}
                                onChange={(e) => onSettingsChange({ backgroundColor: e.target.value })}
                                className="p-1 h-8 w-14 block bg-gray-700 border border-gray-600 cursor-pointer rounded-lg"
                            />
                        </div>
                        <div>
                            <label htmlFor="note-density" className="block text-sm font-medium text-gray-300 mb-2">Note Quantity</label>
                            <input
                                id="note-density"
                                type="range"
                                min="0.05"
                                max="1"
                                step="0.05"
                                value={settings.noteDensity}
                                onChange={(e) => onSettingsChange({ noteDensity: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                         <div>
                            <label htmlFor="note-randomness" className="block text-sm font-medium text-gray-300 mb-2">Position Randomness</label>
                            <input
                                id="note-randomness"
                                type="range"
                                min="10"
                                max="100"
                                step="1"
                                value={settings.noteRandomness}
                                onChange={(e) => onSettingsChange({ noteRandomness: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </ControlSection>

                    {isAkaiConnected && !isSimulationMode && (
                         <ControlSection title="Akai MPK Mini">
                            {/* Live value indicators */}
                            {Object.entries(AKAI_MPK_MINI_KNOBS).map(([name, cc]) => (
                                <KnobIndicator key={name} name={name} value={knobValues[cc]} />
                            ))}

                            {/* Mappings Section */}
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <h4 className="text-sm font-semibold text-gray-400 mb-3">Controller Mappings</h4>
                                <div className="space-y-1 text-sm text-gray-300">
                                    {Object.keys(AKAI_MPK_MINI_KNOBS).map(knobName => {
                                        let mapping = 'Unassigned';
                                        if (knobName === 'K1') mapping = 'Max Note Scale';
                                        if (knobName === 'K6') mapping = 'Base Font Size';

                                        return (
                                            <div key={knobName} className="flex justify-between">
                                                <span>{knobName}</span>
                                                <span className={`font-mono ${mapping === 'Unassigned' ? 'text-gray-500' : ''}`}>{mapping}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </ControlSection>
                    )}
                </div>

                <style>{`
                    @keyframes fade-in {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }

                    @keyframes slide-in-right {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                    .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
                `}</style>
            </div>
        </div>
    );
};
