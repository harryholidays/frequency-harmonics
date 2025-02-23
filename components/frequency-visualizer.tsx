import React, { useState, useEffect, useRef } from 'react';

type FrequencyCombination = {
  name: string;
  frequencies: number[];
};

type FrequencyCombinations = {
  [key: string]: FrequencyCombination;
};

type OscillatorWithGain = {
  oscillator: OscillatorNode;
  gainNode: GainNode;
};

const FrequencyVisualizer: React.FC = () => {
  const [selectedCombination, setSelectedCombination] = useState('396_528');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorWithGain[]>([]);

  const frequencyCombinations: FrequencyCombinations = {
    '396_528': {
      name: 'Liberation & Love',
      frequencies: [396, 528]
    },
    '417_639': {
      name: 'Change & Connection',
      frequencies: [417, 639]
    },
    '528_741': {
      name: 'Healing & Intuition',
      frequencies: [528, 741]
    },
    '852_963': {
      name: 'Intuition & Consciousness',
      frequencies: [852, 963]
    },
    '396_417_528': {
      name: 'Complete Healing',
      frequencies: [396, 417, 528]
    },
    '174_741': {
      name: 'Ground & Awaken',
      frequencies: [174, 741]
    },
    '285_963': {
      name: 'Energy & Spirit',
      frequencies: [285, 963]
    }
  };

  useEffect(() => {
    // Only create AudioContext in the browser
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 96000
      });
      
      return () => {
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };
    }
  }, []);

  const frequencyToColor = (freq: number): string => {
    const hue = ((freq - 174) / (963 - 174)) * 360;
    return `hsl(${hue}, 100%, 50%)`;
  };

  const startFrequencies = (frequencies: number[], fadeTime = 2): OscillatorWithGain[] => {
    if (!audioContextRef.current) return [];
    
    return frequencies.map(freq => {
      const oscillator = audioContextRef.current!.createOscillator();
      const gainNode = audioContextRef.current!.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioContextRef.current!.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioContextRef.current!.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContextRef.current!.currentTime + fadeTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current!.destination);
      
      oscillator.start();
      return { oscillator, gainNode };
    });
  };

  const stopFrequencies = (oscillators: OscillatorWithGain[], fadeTime = 2): void => {
    if (!audioContextRef.current) return;
    
    oscillators.forEach(({ oscillator, gainNode }) => {
      gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current!.currentTime + fadeTime);
      setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
      }, fadeTime * 1000);
    });
  };

  const toggleSound = (): void => {
    if (!audioContextRef.current) return;
    
    if (!isPlaying) {
      const frequencies = frequencyCombinations[selectedCombination].frequencies;
      oscillatorsRef.current = startFrequencies(frequencies);
    } else {
      stopFrequencies(oscillatorsRef.current);
      oscillatorsRef.current = [];
    }
    setIsPlaying(!isPlaying);
  };

  const getBlendedColor = (frequencies: number[]): string => {
    const colors = frequencies.map(f => frequencyToColor(f));
    return `linear-gradient(45deg, ${colors.join(', ')})`;
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Frequency Harmonics</h1>
      
      <div className="space-y-6">
        <div 
          className="w-full h-64 rounded-lg transition-all duration-700"
          style={{ 
            background: getBlendedColor(frequencyCombinations[selectedCombination].frequencies),
            boxShadow: `0 0 50px ${frequencyToColor(frequencyCombinations[selectedCombination].frequencies[0])}`
          }}
        />
        
        <div className="space-y-4">
          {Object.entries(frequencyCombinations).map(([key, { name, frequencies }]) => (
            <label 
              key={key}
              className={`
                block relative p-4 rounded-lg border-2 cursor-pointer
                transition-all duration-300
                ${selectedCombination === key 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-200'
                }
              `}
            >
              <input
                type="radio"
                name="frequency-combination"
                value={key}
                checked={selectedCombination === key}
                onChange={(e) => {
                  const newCombination = e.target.value;
                  if (isPlaying && audioContextRef.current) {
                    const newFrequencies = frequencyCombinations[newCombination].frequencies;
                    const newOscillators = startFrequencies(newFrequencies);
                    stopFrequencies(oscillatorsRef.current);
                    setTimeout(() => {
                      oscillatorsRef.current = newOscillators;
                    }, 2000);
                  }
                  setSelectedCombination(newCombination);
                }}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{name}</h3>
                  <p className="text-sm text-gray-500">
                    {frequencies.join(' Hz + ')} Hz
                  </p>
                </div>
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{
                    background: getBlendedColor(frequencies)
                  }}
                />
              </div>
            </label>
          ))}
        </div>
        
        <button 
          onClick={toggleSound}
          className="w-full h-12 text-lg rounded-lg font-medium transition-all duration-300"
          style={{
            background: getBlendedColor(frequencyCombinations[selectedCombination].frequencies),
            border: '1px solid rgba(0,0,0,0.1)',
            color: 'black'
          }}
        >
          {isPlaying ? 'Stop' : 'Play'} Harmonics
        </button>

        <div className="text-sm text-gray-500 space-y-1">
          <p>Using high-precision frequency generation (96kHz sample rate)</p>
          <p>For best experience, use quality headphones in a quiet space</p>
          <p>Frequencies automatically crossfade when switching (2 second transition)</p>
        </div>
      </div>
    </div>
  );
};

export { FrequencyVisualizer };