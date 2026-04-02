import React, { useState, useCallback, useEffect } from 'react';
import MatrixBuilder from './components/MatrixBuilder';
import ExamGenerator from './components/ExamGenerator';
import GuideModal from './components/GuideModal';
import ApiKeyModal from './components/ApiKeyModal';
import type { ExamMatrix } from './types';
import { useSharedExam } from './hooks/useSharedExam';
import { useMatrixStorage } from './hooks/useMatrixStorage';
import { motion, AnimatePresence } from 'framer-motion';
import DocumentLibrary from './components/DocumentLibrary';
import type { SavedExam } from './services/libraryService';

const STORAGE_KEY = 'gemini_api_key';

interface TabButtonProps {
  tab: 'matrix' | 'generator' | 'library';
  activeTab: 'matrix' | 'generator' | 'library';
  onClick: (tab: 'matrix' | 'generator' | 'library') => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ tab, activeTab, onClick, children }) => (
  <button
    onClick={() => onClick(tab)}
    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
      activeTab === tab
        ? 'bg-blue-600 text-white shadow-md'
        : 'bg-white text-gray-700 hover:bg-gray-100'
    }`}
  >
    {children}
  </button>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'generator' | 'library'>('matrix');
  const [showGuide, setShowGuide] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');

  const { matrix: sharedMatrix, exam: sharedExam, isSharedView, dismissSharedView } = useSharedExam();
  const { matrixData, updateMatrixData } = useMatrixStorage(sharedMatrix, isSharedView);

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEY) || '';
    setApiKey(storedKey);
    if (!storedKey) {
      setShowApiKeyModal(true);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKey(key);
    setShowApiKeyModal(false);
  };

  useEffect(() => {
    if (isSharedView && sharedExam) {
      setActiveTab('generator');
    }
  }, [isSharedView, sharedExam]);

  const handleMatrixUpdate = useCallback((newMatrix: ExamMatrix) => {
    updateMatrixData(newMatrix);
    dismissSharedView();
  }, [updateMatrixData, dismissSharedView]);

  const handleViewExam = (exam: SavedExam) => {
    if (exam.matrix) {
      updateMatrixData(exam.matrix);
    }
    setActiveTab('generator');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'matrix':
        return <MatrixBuilder initialMatrix={matrixData} onMatrixUpdate={handleMatrixUpdate} />;
      case 'generator':
        return <ExamGenerator matrixData={matrixData} initialExam={sharedExam || undefined} />;
      case 'library':
        return <DocumentLibrary onViewExam={handleViewExam} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* API Key Modal */}
      {showApiKeyModal && (
        <ApiKeyModal
          onSave={handleSaveApiKey}
          existingKey={apiKey}
        />
      )}

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}

      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center relative"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
            AI Exam Matrix &amp; Generator
          </h1>
          {isSharedView && (
            <div className="mt-2 inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full uppercase tracking-wider">
              Đang xem nội dung được chia sẻ
            </div>
          )}
          <p className="mt-2 text-md text-gray-600">
            Công cụ tạo ma trận và đề thi môn Địa lí, Lịch sử,... sử dụng Gemini AI
          </p>

          {/* Top-right buttons */}
          <div className="absolute top-0 right-0 flex flex-col items-end gap-1 no-print">
            {/* Settings / API Key button */}
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold"
              aria-label="Cài đặt API Key"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span>Settings (API Key)</span>
            </button>
            <span className="text-xs text-red-500 font-medium">Lấy API key để sử dụng app</span>

            {/* Guide button */}
            <button
              onClick={() => setShowGuide(true)}
              className="mt-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm font-semibold"
              aria-label="Mở hướng dẫn sử dụng"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Hướng dẫn</span>
            </button>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8 no-print"
        >
          <div className="flex p-1 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl space-x-2">
            <TabButton tab="library" activeTab={activeTab} onClick={setActiveTab}>
              Thư viện Đề
            </TabButton>
            <TabButton tab="matrix" activeTab={activeTab} onClick={setActiveTab}>
              1. Xây dựng Ma trận
            </TabButton>
            <TabButton tab="generator" activeTab={activeTab} onClick={setActiveTab}>
              2. Tạo Đề thi
            </TabButton>
          </div>
        </motion.div>

        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;

