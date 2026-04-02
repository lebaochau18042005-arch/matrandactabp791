import LZString from 'lz-string';
import { ExamMatrix } from '../types';

export interface SharedData {
  matrix: ExamMatrix;
  exam?: string;
  version: string;
}

const CURRENT_VERSION = '1.0';

export const generateShareLink = (matrix: ExamMatrix, exam?: string): string => {
  const data: SharedData = {
    matrix,
    exam,
    version: CURRENT_VERSION,
  };
  
  const jsonString = JSON.stringify(data);
  const compressed = LZString.compressToEncodedURIComponent(jsonString);
  
  const url = new URL(window.location.href);
  url.hash = `share=${compressed}`;
  return url.toString();
};

export const parseShareLink = (): SharedData | null => {
  const hash = window.location.hash;
  if (!hash.startsWith('#share=')) return null;
  
  try {
    const compressed = hash.substring(7);
    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    if (!decompressed) return null;
    
    return JSON.parse(decompressed) as SharedData;
  } catch (error) {
    console.error('Failed to parse share link:', error);
    return null;
  }
};

export const clearShareHash = () => {
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
};
