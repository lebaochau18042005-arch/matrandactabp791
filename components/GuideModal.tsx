
import React from 'react';

interface GuideModalProps {
  onClose: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      aria-labelledby="guide-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl p-6 max-w-3xl w-full max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
          <h2 id="guide-title" className="text-2xl font-bold text-gray-800 flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V5a1 1 0 00-1.447-.894l-4 2A1 1 0 0011 7v10zM4 17a1 1 0 001.447.894l4-2A1 1 0 0010 15V5a1 1 0 00-1.447-.894l-4 2A1 1 0 004 7v10z" /></svg>
            Hướng dẫn sử dụng
          </h2>
          <button 
            onClick={onClose} 
            className="p-1 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-700 transition"
            aria-label="Đóng"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto space-y-6 text-gray-700 pr-2">
            <section>
                <h3 className="text-xl font-semibold text-blue-700 mb-2">Bước 1: Xây dựng Ma trận đề thi</h3>
                <p className="mb-4">Đây là bước quan trọng nhất để định hình cấu trúc và nội dung của đề thi. Hãy làm theo các bước sau:</p>
                <ol className="list-decimal list-inside space-y-3 pl-2">
                    <li>
                        <strong>Thiết lập thông tin chung:</strong> Điền đầy đủ thông tin như Sở GD&ĐT, Tên trường, Môn học, Khối lớp, v.v. Các thông tin này sẽ được tự động đưa vào đề thi được tạo ra.
                    </li>
                    <li>
                        <strong>Cấu hình thang điểm:</strong> Mở rộng mục "Cấu hình thang điểm chi tiết" để gán điểm cho từng loại câu hỏi ở mỗi mức độ nhận thức. Ví dụ: câu trắc nghiệm mức độ "Biết" được 0.25 điểm. Điều này giúp ma trận tự động tính tổng điểm và tỉ lệ điểm chính xác.
                    </li>
                    <li>
                        <strong>Thêm nội dung kiến thức:</strong>
                        <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                            <li><strong>Chọn từ danh sách:</strong> Cách nhanh nhất là chọn các chủ đề và nội dung có sẵn được biên soạn theo chương trình học. Chỉ cần chọn khối lớp và bấm vào nội dung bạn muốn thêm.</li>
                            <li><strong>Nhập tùy chỉnh:</strong> Nếu cần nội dung không có trong danh sách, bạn có thể tự nhập tên Chương và tên Nội dung rồi bấm "Thêm".</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Nhập số lượng câu hỏi:</strong> Tại bảng ma trận chính, điền số lượng câu hỏi cho từng nội dung, tương ứng với từng loại câu hỏi và mức độ nhận thức.
                        <ul className="list-disc list-inside pl-4 mt-2">
                            <li>Với câu hỏi <strong>Tự luận</strong>, bạn nên nhập mã câu hỏi (ví dụ: `1(a)`, `2(b)`) thay vì số lượng.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Xem và hoàn thiện Bản Đặc tả:</strong>
                        <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                             <li>Nhấn nút "Xem Bản Đặc tả" để mở bảng chi tiết theo mẫu của Bộ GD&ĐT.</li>
                            <li>Tại cột "Yêu cầu cần đạt", bạn có thể tự nhập hoặc nhấn vào icon lấp lánh ✨ để AI tự động tạo gợi ý.</li>
                        </ul>
                    </li>
                     <li>
                        <strong>Lưu và Tải xuống:</strong> Sử dụng các nút xuất file (Word, PDF, Excel) để lưu ma trận hoặc bản đặc tả về máy tính.
                    </li>
                </ol>
            </section>
            
             <section>
                <h3 className="text-xl font-semibold text-green-700 mb-2">Bước 2: Tạo Đề thi tự động</h3>
                <p className="mb-4">Sau khi ma trận đã hoàn chỉnh, bạn có thể sử dụng sức mạnh của AI để tạo ra đề thi hoàn chỉnh.</p>
                 <ol className="list-decimal list-inside space-y-3 pl-2">
                    <li>
                        <strong>Chuyển sang Tab "Tạo Đề thi":</strong> Nhấn vào nút "2. Tạo Đề thi" ở thanh điều hướng trên cùng.
                    </li>
                     <li>
                        <strong>Kiểm tra lại ma trận:</strong> Bạn có thể xem lại cấu trúc ma trận dưới dạng JSON để đảm bảo mọi thứ đã chính xác.
                    </li>
                    <li>
                        <strong>Bắt đầu tạo đề:</strong> Nhấn nút lớn màu xanh lá "Tạo Đề thi với Gemini AI". Quá trình này có thể mất một vài phút tùy thuộc vào độ phức tạp của ma trận.
                    </li>
                    <li>
                        <strong>Xem và chỉnh sửa kết quả:</strong>
                        <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                            <li>Đề thi, đáp án và lời giải chi tiết sẽ xuất hiện trong khung xem trước.</li>
                            <li>Nếu cần thay đổi, nhấn nút "Chỉnh sửa". Một trình soạn thảo văn bản sẽ hiện ra cho phép bạn sửa đổi nội dung. Sau khi xong, nhấn "Lưu Thay đổi".</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Xuất đề thi:</strong> Sử dụng các nút "Word", "Excel", "PDF" để tải đề thi đã hoàn thiện về máy.
                    </li>
                </ol>
            </section>
        </div>
        <div className="border-t border-gray-200 pt-3 mt-4 text-right">
             <button 
                onClick={onClose} 
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
            >
                Đã hiểu
             </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-scale {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default GuideModal;
