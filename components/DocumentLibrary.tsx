import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getSavedExams, SavedExam } from '../services/libraryService';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';

interface Props {
  onViewExam: (exam: SavedExam) => void;
}

const DocumentLibrary: React.FC<Props> = ({ onViewExam }) => {
  const [exams, setExams] = useState<SavedExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await getSavedExams();
        setExams(data);
      } catch (err) {
        setError('Không thể tải dữ liệu Thư viện. Vui lòng kiểm tra thông tin cấu hình Firebase trong .env.local.');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl text-center border border-red-100">
        {error}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          Thư viện Đề thi
        </h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
          {exams.length} Đề thi
        </span>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-2">Thư viện hiện đang trống.</p>
          <p className="text-sm text-gray-400">Hãy tạo đề thi ở mục "Tạo Đề thi" và lưu lên đây nhé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onViewExam(item)}
            >
              <div className="mb-4 flex-1">
                <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2">
                  {item.matrix?.header?.examName || "Đề thi chung"}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Môn: <span className="font-medium text-gray-900">{item.matrix?.header?.subject || "Không rõ"}</span></p>
                  <p>Khối lớp: <span className="font-medium text-gray-900">{item.matrix?.header?.grade || "Không rõ"}</span></p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                <div className="flex items-center text-xs text-gray-400 gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : "---"}
                </div>
                <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-semibold transition-colors">
                  Xem ngay <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default DocumentLibrary;
