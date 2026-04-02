import { useState, useEffect } from 'react';
import { parseShareLink, clearShareHash } from '../services/sharingService';
import type { ExamMatrix } from '../types';

interface SharedExamState {
  matrix: ExamMatrix | null;
  exam: string | null;
  isSharedView: boolean;
}

export const useSharedExam = () => {
  const [sharedState, setSharedState] = useState<SharedExamState>({
    matrix: null,
    exam: null,
    isSharedView: false
  });

  useEffect(() => {
    // Check for shared data in URL
    const sharedData = parseShareLink();
    if (sharedData) {
      setSharedState({
        matrix: sharedData.matrix,
        exam: sharedData.exam || null,
        isSharedView: true
      });
      clearShareHash(); // Clear URL once processed
    }
  }, []);

  // Return a function to dismiss the shared view mode
  const dismissSharedView = () => setSharedState(prev => ({ ...prev, isSharedView: false }));

  return { ...sharedState, dismissSharedView };
};
