import { create } from 'zustand';

export interface SimulationParams {
  speed: number;
  rotationSpeed?: number;
  axialTilt?: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  windSpeed?: number;
  elevation?: number;
}

export interface SimulationState {
  isPlaying: boolean;
  isFullscreen: boolean;
  params: SimulationParams;
  layers: Record<string, boolean>;
  
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  toggleFullscreen: () => void;
  setParam: (key: keyof SimulationParams, value: number) => void;
  toggleLayer: (layerName: string) => void;
  reset: () => void;
}

const defaultParams: SimulationParams = {
  speed: 1,
  rotationSpeed: 1,
  axialTilt: 23.5,
  temperature: 25,
  humidity: 60,
  pressure: 1013,
  windSpeed: 10,
  elevation: 0,
};

export const useSimulationStore = create<SimulationState>((set) => ({
  isPlaying: true,
  isFullscreen: false,
  params: { ...defaultParams },
  layers: {
    latLong: true,
    lightShadow: true,
    vectors: true,
    labels: true,
    clouds: false,
    rain: false,
    wind: true,
    highLowPressure: true,
  },
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaying: (playing) => set({ isPlaying: playing }),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
  setParam: (key, value) =>
    set((state) => ({ params: { ...state.params, [key]: value } })),
  toggleLayer: (layerName) =>
    set((state) => ({
      layers: { ...state.layers, [layerName]: !state.layers[layerName] },
    })),
  reset: () => set({ params: { ...defaultParams }, isPlaying: true }),
}));
