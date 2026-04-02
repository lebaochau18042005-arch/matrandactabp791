import { useState, useEffect, useCallback } from 'react';
import type { ExamMatrix } from '../types';
import { initialMatrix } from '../constants';

const LOCAL_STORAGE_KEY = 'geography_ai_matrix';

export const useMatrixStorage = (initialSharedMatrix: ExamMatrix | null, isSharedView: boolean) => {
  const [matrixData, setMatrixData] = useState<ExamMatrix>(initialMatrix);
  
  useEffect(() => {
    // If there is shared data, it takes precedence initially, do not overwrite with LocalStorage.
    if (initialSharedMatrix) {
      setMatrixData(initialSharedMatrix);
      return;
    }

    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        setMatrixData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Lỗi khi đọc dữ liệu từ localStorage:", error);
    }
  }, [initialSharedMatrix]);

  useEffect(() => {
    if (!isSharedView) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(matrixData));
      } catch (error) {
        console.error("Lỗi khi lưu dữ liệu vào localStorage:", error);
      }
    }
  }, [matrixData, isSharedView]);

  const updateMatrixData = useCallback((newMatrix: ExamMatrix) => {
    setMatrixData(newMatrix);
  }, []);

  return { matrixData, updateMatrixData };
};
