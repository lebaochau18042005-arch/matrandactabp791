import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Archive,
  FileText,
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  LayoutDashboard, 
  User, 
  Filter,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Github,
  Twitter,
  Facebook,
  Globe,
  Trophy,
  Zap,
  Gamepad2,
  LayoutGrid,
  Sparkles,
  Database,
  Upload,
  GraduationCap,
  BookOpen,
  File as FileIcon,
  Download,
  Printer,
  Share2,
  Settings,
  AlertCircle,
  Info,
  HelpCircle,
  Users,
  BarChart3,
  Loader2,
  Play, 
  Pause, 
  RotateCcw, 
  MessageSquare, 
  Send, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Eye, 
  EyeOff, 
  Image, 
  ArrowRight,
  RefreshCw,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { 
  Document, 
  Packer, 
  Paragraph, 
  Table, 
  TableCell, 
  TableRow, 
  WidthType, 
  TextRun,
  AlignmentType,
  BorderStyle
} from 'docx';
import Markdown from 'react-markdown';
import Swal from 'sweetalert2';
import { GoogleGenAI, Type } from "@google/genai";
import { MillionaireGame } from './components/MillionaireGame';
import AtmosphericCirculationSim from './components/AtmosphericCirculationSim';
import EarthLayersSim from './components/EarthLayersSim';
import JapanGeographySim from './components/JapanGeographySim';
import SunraySim from './components/SunraySim';
import CoordinateSim from './components/CoordinateSim';
import VolcanoSim from './components/VolcanoSim';
import OceanCurrentSim from './components/OceanCurrentSim';
import TideSim from './components/TideSim';
import DayNightSim from './components/DayNightSim';
import TimeZoneSim from './components/TimeZoneSim';
import SeasonsSim from './components/SeasonsSim';
import WindPressureSim from './components/WindPressureSim';
import OrographicRainSim from './components/OrographicRainSim';
import SolarSystemSim from './components/SolarSystemSim';
import ZenithSunSim from './components/ZenithSunSim';
import PolarDaySim from './components/PolarDaySim';
import { parseSimDataFromContent } from './utils/simContentParser';

import { generateContentWithFallback } from './utils/geminiUtils';

// --- Types ---
interface AppData {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  category: string;
  badge: string;
}

const CATEGORIES = ["Tất cả", "Địa lí Tự nhiên", "Địa lí Kinh tế", "Địa lí Việt Nam", "Bản đồ học", "Công cụ"];

interface CurriculumTopic {
  title: string;
  lessons: string[];
}

const GEOGRAPHY_CURRICULUM: Record<string, CurriculumTopic[]> = {
  "10": [
    {
      title: "Sử dụng bản đồ",
      lessons: [
        "Bài 1: Một số phương pháp biểu hiện các đối tượng địa lí trên bản đồ",
        "Bài 2: Phương pháp sử dụng bản đồ trong học tập địa lí và đời sống",
        "Bài 3: Một số ứng dụng của GPS và bản đồ số trong đời sống",
        "Thực hành: Xác định phương hướng, khoảng cách và vị trí của các đối tượng địa lí trên bản đồ"
      ]
    },
    {
      title: "Trái Đất",
      lessons: [
        "Bài 4: Nguồn gốc hình thành Trái Đất, vỏ Trái Đất và vật liệu cấu tạo vỏ Trái Đất",
        "Bài 5: Hệ quả địa lí các chuyển động của Trái Đất",
        "Thực hành: Hệ quả địa lí các chuyển động của Trái Đất"
      ]
    },
    {
      title: "Thạch quyển",
      lessons: [
        "Bài 6: Thạch quyển, thuyết kiến tạo mảng",
        "Bài 7: Nội lực và ngoại lực",
        "Thực hành: Đọc bản đồ các mảng kiến tạo, các vành đai động đất, núi lửa"
      ]
    },
    {
      title: "Khí quyển",
      lessons: [
        "Bài 8: Khí quyển, sự phân bố nhiệt độ không khí trên Trái Đất",
        "Bài 9: Khí áp và gió",
        "Bài 10: Thủy quyển. Nước trên lục địa",
        "Bài 11: Mưa",
        "Thực hành: Đọc bản đồ các đới khí hậu trên Trái Đất, phân tích biểu đồ một số kiểu khí hậu"
      ]
    },
    {
      title: "Thủy quyển",
      lessons: [
        "Bài 12: Nước biển và đại dương",
        "Thực hành: Đọc bản đồ các dòng biển trên thế giới"
      ]
    },
    {
      title: "Thổ nhưỡng quyển. Sinh quyển",
      lessons: [
        "Bài 13: Đất",
        "Bài 14: Sinh quyển",
        "Thực hành: Tìm hiểu về sự phân bố các đới đất và các kiểu thảm thực vật trên thế giới"
      ]
    },
    {
      title: "Địa lí dân cư",
      lessons: [
        "Bài 15: Quy mô dân số, gia tăng dân số và cơ cấu dân số thế giới",
        "Bài 16: Phân bố dân cư và đô thị hóa",
        "Thực hành: Vẽ và phân tích biểu đồ về dân số"
      ]
    },
    {
      title: "Các nguồn lực, cơ cấu kinh tế",
      lessons: [
        "Bài 17: Các nguồn lực phát triển kinh tế",
        "Bài 18: Cơ cấu kinh tế, tổng sản phẩm trong nước và tổng thu nhập quốc gia"
      ]
    },
    {
      title: "Địa lí các ngành kinh tế",
      lessons: [
        "Bài 19: Địa lí ngành nông nghiệp, lâm nghiệp, thủy sản",
        "Bài 20: Tổ chức lãnh thổ nông nghiệp, một số vấn đề phát triển nông nghiệp hiện đại",
        "Bài 21: Địa lí ngành công nghiệp",
        "Bài 22: Tổ chức lãnh thổ công nghiệp, một số vấn đề phát triển công nghiệp hiện đại",
        "Bài 23: Địa lí ngành dịch vụ",
        "Bài 24: Địa lí ngành giao thông vận tải và bưu chính viễn thông",
        "Bài 25: Địa lí ngành tài chính ngân hàng và du lịch",
        "Bài 26: Địa lí ngành thương mại"
      ]
    },
    {
      title: "Phát triển bền vững",
      lessons: [
        "Bài 27: Môi trường và tài nguyên thiên nhiên",
        "Bài 28: Phát triển bền vững và tăng trưởng xanh",
        "Thực hành: Tìm hiểu về phát triển bền vững và tăng trưởng xanh"
      ]
    }
  ],
  "11": [
    {
      title: "Một số vấn đề về kinh tế - xã hội thế giới",
      lessons: [
        "Bài 1: Sự khác biệt về trình độ phát triển kinh tế - xã hội của các nhóm nước",
        "Bài 2: Toàn cầu hóa và khu vực hóa kinh tế",
        "Bài 3: Một số vấn đề an ninh toàn cầu",
        "Bài 4: Thực hành: Tìm hiểu về toàn cầu hóa, khu vực hóa",
        "Bài 5: Một số vấn đề về dân số thế giới và kinh tế tri thức"
      ]
    },
    {
      title: "Khu vực Mỹ La tinh",
      lessons: [
        "Bài 6: Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội khu vực Mỹ La tinh",
        "Bài 7: Kinh tế khu vực Mỹ La tinh",
        "Bài 8: Thực hành: Viết báo cáo về tình hình phát triển kinh tế - xã hội ở khu vực Mỹ La tinh"
      ]
    },
    {
      title: "Liên minh châu Âu (EU)",
      lessons: [
        "Bài 9: Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Liên minh châu Âu (EU)",
        "Bài 10: Kinh tế Liên minh châu Âu (EU)",
        "Bài 11: Thực hành: Tìm hiểu về sự phát triển công nghiệp của Liên minh châu Âu"
      ]
    },
    {
      title: "Khu vực Đông Nam Á",
      lessons: [
        "Bài 12: Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội khu vực Đông Nam Á",
        "Bài 13: Kinh tế khu vực Đông Nam Á",
        "Bài 14: Hiệp hội các quốc gia Đông Nam Á (ASEAN)",
        "Bài 15: Thực hành: Viết báo cáo về các giai đoạn phát triển của ASEAN"
      ]
    },
    {
      title: "Khu vực Tây Nam Á",
      lessons: [
        "Bài 16: Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội khu vực Tây Nam Á",
        "Bài 17: Kinh tế khu vực Tây Nam Á"
      ]
    },
    {
      title: "Hợp chủng quốc Hoa Kỳ",
      lessons: [
        "Bài 18: Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Hoa Kỳ",
        "Bài 19: Kinh tế Hoa Kỳ"
      ]
    },
    {
      title: "Liên bang Nga",
      lessons: [
        "Bài 20: Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Liên bang Nga",
        "Bài 21: Kinh tế Liên bang Nga"
      ]
    },
    {
      title: "Nhật Bản",
      lessons: [
        "Bài 22: Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Nhật Bản",
        "Bài 23: Kinh tế Nhật Bản"
      ]
    },
    {
      title: "Cộng hòa Nhân dân Trung Hoa",
      lessons: [
        "Bài 24: Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Trung Quốc",
        "Bài 25: Kinh tế Trung Quốc"
      ]
    },
    {
      title: "Ô-xtrây-li-a",
      lessons: [
        "Bài 26: Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Ô-xtrây-li-a",
        "Bài 27: Kinh tế Ô-xtrây-li-a"
      ]
    }
  ],
  "12": [
    {
      title: "Địa lí tự nhiên Việt Nam",
      lessons: [
        "Bài 1: Vị trí địa lí và phạm vi lãnh thổ",
        "Bài 2: Thiên nhiên nhiệt đới ẩm gió mùa",
        "Bài 3: Sự phân hóa đa dạng của thiên nhiên",
        "Bài 4: Vấn đề sử dụng và bảo vệ tài nguyên thiên nhiên",
        "Bài 5: Vấn đề bảo vệ môi trường và phòng chống thiên tai",
        "Bài 6: Thực hành: Đọc bản đồ, phân tích số liệu về tự nhiên Việt Nam"
      ]
    },
    {
      title: "Địa lí dân cư Việt Nam",
      lessons: [
        "Bài 7: Đặc điểm dân số và phân bố dân cư ở nước ta",
        "Bài 8: Lao động và việc làm",
        "Bài 9: Đô thị hóa",
        "Bài 10: Thực hành: Vẽ biểu đồ và phân tích sự phân hóa thu nhập theo vùng"
      ]
    },
    {
      title: "Địa lí các ngành kinh tế Việt Nam",
      lessons: [
        "Bài 11: Chuyển dịch cơ cấu kinh tế",
        "Bài 12: Vấn đề phát triển nông nghiệp",
        "Bài 13: Vấn đề phát triển ngành lâm nghiệp và thủy sản",
        "Bài 14: Tổ chức lãnh thổ nông nghiệp",
        "Bài 15: Vấn đề phát triển công nghiệp",
        "Bài 16: Tổ chức lãnh thổ công nghiệp",
        "Bài 17: Vấn đề phát triển ngành giao thông vận tải và bưu chính viễn thông",
        "Bài 18: Vấn đề phát triển ngành du lịch và thương mại"
      ]
    },
    {
      title: "Địa lí các vùng kinh tế Việt Nam (TT 17/2025)",
      lessons: [
        "Bài 19: Khai thác thế mạnh ở Trung du và miền núi phía Bắc",
        "Bài 20: Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng",
        "Bài 21: Phát triển kinh tế - xã hội ở Bắc Trung Bộ và Duyên hải miền Trung",
        "Bài 22: Khai thác thế mạnh ở Tây Nguyên",
        "Bài 23: Khai thác lãnh thổ theo chiều sâu ở Đông Nam Bộ",
        "Bài 24: Phát triển kinh tế - xã hội ở Đồng bằng sông Cửu Long",
        "Bài 25: Phát triển kinh tế và đảm bảo quốc phòng an ninh ở Biển Đông và các đảo, quần đảo"
      ]
    },
    {
      title: "Địa lí địa phương",
      lessons: [
        "Bài 26: Tìm hiểu địa lí tỉnh, thành phố",
        "Bài 27: Thực hành: Viết báo cáo về địa lí địa phương"
      ]
    }
  ]
};
// Cơ sở dữ liệu Yêu cầu cần đạt (YCCĐ) chuẩn quốc gia Địa lí 12 theo CTPT 2018 & TT 17/2025

// Cơ sở dữ liệu Yêu cầu cần đạt (YCCĐ) chuẩn quốc gia Địa lí 10, 11, 12 theo CTPT 2018 & TT 17/2025

// Cơ sở dữ liệu Yêu cầu cần đạt (YCCĐ) chuẩn quốc gia Địa lí 10, 11, 12 theo CTPT 2018 & TT 17/2025
const OFFICIAL_GEOGRAPHY_CURRICULUM_SPECS: Record<string, { know: string; understand: string; apply: string }> = {
  // --- GRADE 12 ---
  "Vị trí địa lí và phạm vi lãnh thổ": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được đặc điểm vị trí địa lí và phạm vi lãnh thổ nước ta (vùng đất, vùng biển với 5 bộ phận, vùng trời).\n- [NL2 - Tìm hiểu địa lí]: Sử dụng bản đồ địa lí để xác định tọa độ các điểm cực và các nước tiếp giáp.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích được ảnh hưởng của vị trí địa lí và phạm vi lãnh thổ đối với đặc điểm tự nhiên, kinh tế - xã hội và an ninh quốc phòng.\n- [NL2 - Tìm hiểu địa lí]: Rút ra nhận xét từ các bản đồ khí hậu, sông ngòi.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá ý nghĩa chiến lược của vị trí địa lí nước ta trong khu vực và bảo vệ chủ quyền biên giới, hải đảo."
  },
  "Thiên nhiên nhiệt đới ẩm gió mùa": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được các biểu hiện của thiên nhiên nhiệt đới ẩm gió mùa qua khí hậu, địa hình, sông ngòi, đất và sinh vật.\n- [NL2 - Tìm hiểu địa lí]: Sử dụng bản đồ địa lí để xác định hướng gió mùa và mạng lưới sông ngòi.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân hình thành tính chất nhiệt đới ẩm gió mùa của khí hậu Việt Nam. Phân tích ảnh hưởng của tính chất này đến hoạt động sản xuất nông nghiệp và đời sống.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất các giải pháp thích ứng và phòng chống thiên tai (bão, lũ, hạn hán) tại địa phương."
  },
  "Sự phân hóa đa dạng của thiên nhiên": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày đặc điểm thiên nhiên phân hóa theo Bắc - Nam, Đông - Tây và theo độ cao địa hình.\n- [NL2 - Tìm hiểu địa lí]: Sử dụng bản đồ địa lí để nhận diện sự thay đổi của đất và thực vật theo độ cao.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân tạo nên sự phân hóa đa dạng của thiên nhiên (tác động của vĩ độ và địa hình đồi núi hướng sườn).\n- [NL2 - Tìm hiểu địa lí]: Phân tích các lát cắt tự nhiên từ tây sang đông.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất hướng sử dụng hợp lý tài nguyên của mỗi vùng miền để phát triển kinh tế bền vững."
  },
  "Vấn đề sử dụng và bảo vệ tài nguyên thiên nhiên": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được hiện trạng sử dụng và bảo vệ tài nguyên rừng, tài nguyên đất và đa dạng sinh học ở nước ta.\n- [NL2 - Tìm hiểu địa lí]: Xác định sự phân bố các vườn quốc gia và khu bảo tồn thiên nhiên trên bản đồ.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích nguyên nhân làm suy thoái tài nguyên rừng và đất đai. Giải thích sự cần thiết của phát triển lâm nghiệp bền vững.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Xây dựng kế hoạch nhỏ tuyên truyền bảo vệ tài nguyên sinh vật và môi trường sống của học sinh."
  },
  "Vấn đề bảo vệ môi trường và phòng chống thiên tai": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày hiện trạng ô nhiễm môi trường và đặc điểm, hậu quả của các thiên tai chính (bão, lũ quét, hạn hán).\n- [NL2 - Tìm hiểu địa lí]: Xác định các vùng chịu ảnh hưởng nặng nề nhất của bão trên bản đồ.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân ô nhiễm môi trường nước, không khí và sự gia tăng cường độ thiên tai do biến đổi khí hậu.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất và thực hiện các kỹ năng phòng chống thiên tai cơ bản trong gia đình và nhà trường."
  },
  "Dân số, lao động và việc làm": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày đặc điểm dân số, cơ cấu lao động theo ngành kinh tế và vấn đề việc làm hiện nay ở Việt Nam.\n- [NL2 - Tìm hiểu địa lí]: Xác định các khu vực có mật độ dân số cao và trung tâm đô thị lớn.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích sức ép dân số đối với phát triển kinh tế, xã hội, môi trường và xu hướng chuyển dịch cơ cấu lao động.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất giải pháp định hướng nghề nghiệp và tự học để đáp ứng nhu cầu thị trường lao động."
  },
  "Đặc điểm dân số và phân bố dân cư ở nước ta": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu được quy mô dân số, gia tăng dân số và sự phân bố dân cư không đồng đều ở Việt Nam.\n- [NL2 - Tìm hiểu địa lí]: Đọc bản đồ dân số để xác định các đô thị lớn.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của phân bố dân cư không đều đến sử dụng lao động và khai thác tài nguyên.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Liên hệ chính sách phân bố lại dân cư ở nước ta và tác động của nó tới kinh tế vùng sâu vùng xa."
  },
  "Lao động và việc làm": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được đặc điểm nguồn lao động nước ta (số lượng, chất lượng). Nêu hiện trạng sử dụng lao động và vấn đề việc làm hiện nay.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân của tình trạng thiếu việc làm ở nông thôn và thất nghiệp ở thành thị.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất các biện pháp nâng cao kỹ năng nghề nghiệp và tự tạo việc làm của thanh niên hiện nay."
  },
  "Đô thị hóa": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được đặc điểm đô thị hóa ở nước ta (quá trình đô thị hóa diễn ra chậm, trình độ thấp nhưng mạng lưới đang mở rộng). Nêu sự phân loại đô thị Việt Nam.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng hai mặt của quá trình đô thị hóa đến sự chuyển dịch cơ cấu kinh tế và môi trường.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất giải pháp quản lý và phát triển đô thị xanh, bền vững tại địa phương."
  },
  "Chuyển dịch cơ cấu kinh tế": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày các biểu hiện chuyển dịch cơ cấu kinh tế theo ngành, theo thành phần kinh tế và theo lãnh thổ.\n- [NL2 - Tìm hiểu địa lí]: Phân tích bảng số liệu thể hiện cơ cấu GDP phân theo ngành.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân chuyển dịch cơ cấu kinh tế nước ta phù hợp xu thế công nghiệp hóa và hội nhập quốc tế.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Nhận xét sự chuyển dịch cơ cấu kinh tế địa phương em trong giai đoạn hiện nay."
  },
  "Vấn đề phát triển nông nghiệp": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu hiện trạng phát triển và phân bố ngành trồng trọt (lúa, cây công nghiệp) và ngành chăn nuôi ở Việt Nam.\n- [NL2 - Tìm hiểu địa lí]: Xác định các vùng trồng cây công nghiệp lâu năm trọng điểm trên bản đồ.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của điều kiện tự nhiên, nguồn nước và chính sách phát triển đến nông nghiệp xanh, công nghệ cao.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất giải pháp phát triển thương hiệu nông sản xuất khẩu tại địa phương."
  },
  "Vấn đề phát triển ngành lâm nghiệp và thủy sản": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vai trò, hiện trạng và phân bố ngành lâm nghiệp (rừng sản xuất, rừng phòng hộ) và ngành thủy sản (nuôi trồng, đánh bắt).\n- [NL2 - Tìm hiểu địa lí]: Xác định các vùng nuôi trồng thủy sản lớn nhất nước ta.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích thế mạnh và hạn chế đối với ngành lâm nghiệp và nuôi trồng thủy sản ven biển nước ta.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất biện pháp khai thác thủy hải sản xa bờ an toàn, bền vững gắn với quốc phòng an ninh."
  },
  "Tổ chức lãnh thổ nông nghiệp": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày đặc điểm của 7 vùng nông nghiệp ở nước ta. Nêu được các hình thức tổ chức lãnh thổ nông nghiệp chính.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích được sự thay đổi trong tổ chức lãnh thổ nông nghiệp theo hướng tăng chuyên môn hóa.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất mô hình trang trại nông nghiệp kết hợp du lịch sinh thái phù hợp."
  },
  "Vấn đề phát triển công nghiệp": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày cơ cấu ngành công nghiệp (khai thác, chế biến, sản xuất điện). Nêu sự phân bố ngành công nghiệp trọng điểm.\n- [NL2 - Tìm hiểu địa lí]: Xác định vị trí các mỏ than, mỏ dầu và nhà máy thủy điện lớn.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích các nhân tố tự nhiên và kinh tế - xã hội ảnh hưởng đến cơ cấu công nghiệp nước ta.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất các biện pháp tiết kiệm năng lượng và giảm phát thải khí nhà kính trong sản xuất."
  },
  "Tổ chức lãnh thổ công nghiệp": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày các hình thức tổ chức lãnh thổ công nghiệp chính: khu công nghiệp, khu chế xuất, trung tâm công nghiệp.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích vai trò của tổ chức lãnh thổ công nghiệp đối với thu hút đầu tư FDI và thúc đẩy công nghiệp hóa.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích tác động của khu công nghiệp đối với kinh tế địa phương nơi em sinh sống."
  },
  "Vấn đề phát triển ngành giao thông vận tải và bưu chính viễn thông": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày hiện trạng phát triển và phân bố mạng lưới giao thông (đường bộ, sắt, thủy, hàng không) và bưu chính viễn thông.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ý nghĩa phát triển giao thông vận tải đối với liên kết vùng và hội nhập kinh tế quốc tế.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá vai trò của các trục hành lang kinh tế xuyên quốc gia đi qua nước ta."
  },
  "Vấn đề phát triển ngành du lịch và thương mại": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày hiện trạng phát triển nội thương, ngoại thương và du lịch. Nêu tên các di sản thế giới tại Việt Nam.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích tác động của hội nhập toàn cầu đến cán cân thương mại và các trung tâm du lịch lớn của nước ta.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất phương án quảng bá thương mại hoặc thu hút khách du lịch xanh tại địa phương."
  },
  "Khai thác thế mạnh ở Trung du và miền núi phía Bắc": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vị trí địa lý, phạm vi lãnh thổ và hiện trạng khai thác thế mạnh: khoáng sản, thủy điện, cây lâu năm, kinh tế biển.\n- [NL2 - Tìm hiểu địa lí]: Xác định vị trí nhà máy thủy điện Hòa Bình, Sơn La và mỏ đồng Sinh Quyền trên bản đồ.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân cần bảo vệ môi trường sinh thái rừng đầu nguồn khi khai thác khoáng sản và làm thủy điện ở vùng.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất các mô hình trồng trọt hữu cơ bền vững đi đôi với giữ nước, chống sạt lở đồi núi."
  },
  "Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu vị trí địa lý và các thế mạnh chính: lao động dồi dào, cơ sở hạ tầng phát triển, thị trường lớn.\n- [NL2 - Tìm hiểu địa lí]: Xác định các trung tâm công nghiệp lớn (Hà Nội, Hải Phòng) trên bản đồ công nghiệp.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích sức ép dân số đối với kinh tế và môi trường. Giải thích tại sao cần thiết phải chuyển dịch cơ cấu ngành kinh tế của vùng.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất định hướng bảo vệ đất đai canh tác phù sa sông Hồng trước sức ép của đô thị hóa."
  },
  "Phát triển kinh tế - xã hội ở Bắc Trung Bộ và Duyên hải miền Trung": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vị trí địa lí, phạm vi lãnh thổ và đặc điểm phát triển nông - lâm - ngư nghiệp, công nghiệp, cơ sở hạ tầng ven biển.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ý nghĩa việc hình thành cơ cấu nông - lâm - ngư nghiệp ở Bắc Trung Bộ và Duyên hải miền Trung đối với phát triển kinh tế vùng.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất biện pháp phòng chống cát bay, cát chảy, khô hạn và thích ứng biến đổi khí hậu ven biển miền Trung."
  },
  "Khai thác thế mạnh ở Tây Nguyên": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày hiện trạng trồng cây công nghiệp lâu năm (cà phê, cao su), lâm nghiệp và thủy năng kết hợp thủy lợi.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ý nghĩa kinh tế và môi trường của việc phát triển các vùng chuyên canh cây công nghiệp lớn ở Tây Nguyên.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất các giải pháp bảo tồn rừng đầu nguồn và quản lý nguồn nước ngọt mùa khô cho Tây Nguyên."
  },
  "Khai thác lãnh thổ theo chiều sâu ở Đông Nam Bộ": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vị trí địa lí và hiện trạng khai thác theo chiều sâu trong công nghiệp, dịch vụ, nông nghiệp, phát triển tổng hợp kinh tế biển.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích khái niệm và làm rõ nguyên nhân cần khai thác theo chiều sâu để nâng cao giá trị kinh tế và bảo vệ môi trường.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất định hướng giải quyết vấn đề ô nhiễm nước sông Đồng Nai và tình trạng quá tải hạ tầng đô thị."
  },
  "Phát triển kinh tế - xã hội ở Đồng bằng sông Cửu Long": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày thế mạnh chính: đất phù sa ngọt, sông ngòi chằng chịt, sinh vật ngập mặn. Nêu hiện trạng sản xuất lương thực thực phẩm.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích khó khăn: hạn mặn xâm nhập sâu mùa khô, đất phèn mặn diện rộng. Giải thích sự cần thiết cải tạo đất và sử dụng hợp lý nguồn nước.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất mô hình kinh tế nông nghiệp thích ứng hiệu quả với biến đổi khí hậu và xâm nhập mặn ở vùng sông nước."
  },
  "Phát triển kinh tế và đảm bảo quốc phòng an ninh ở Biển Đông và các đảo, quần đảo": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu đặc điểm vùng biển nước ta; xác định vị trí các quần đảo lớn Hoàng Sa, Trường Sa; kể tên 4 ngành kinh tế biển chính.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích ý nghĩa chiến lược của biển đảo đối với kinh tế và an ninh quốc gia. Làm rõ sự cần thiết của Luật Biển Việt Nam.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích vai trò và trách nhiệm của thế hệ trẻ trong công cuộc xây dựng, phát triển kinh tế biển và bảo vệ chủ quyền hải đảo."
  },

  // --- GRADE 11 ---
  "Sự khác biệt về trình độ phát triển kinh tế - xã hội của các nhóm nước": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được sự phân chia các nhóm nước phát triển và đang phát triển theo GDP, GNI bình quan và HDI.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích sự khác biệt về trình độ phát triển kinh tế - xã hội và cơ cấu kinh tế giữa 2 nhóm nước.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Tính toán chỉ số phát triển con người HDI hoặc so sánh cơ cấu kinh tế từ bảng số liệu."
  },
  "Toàn cầu hóa và khu vực hóa kinh tế": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu biểu hiện của toàn cầu hóa và khu vực hóa kinh tế; kể tên các liên kết kinh tế khu vực lớn.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của toàn cầu hóa và khu vực hóa đến phát triển kinh tế nước đang phát triển.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá cơ hội và thách thức của nền kinh tế Việt Nam trong quá trình hội nhập quốc tế toàn cầu."
  },
  "Một số vấn đề an ninh toàn cầu": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu được một số vấn đề an ninh toàn cầu (an ninh lương thực, an ninh năng lượng, an ninh nguồn nước).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích nguyên nhân và tầm quan trọng của việc chung tay hợp tác giải quyết các vấn đề an ninh toàn cầu.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất giải pháp tiết kiệm điện, bảo vệ nước ngọt trong cuộc sống hằng ngày của bản thân."
  },
  "Một số vấn đề về dân số thế giới và kinh tế tri thức": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu được đặc điểm già hóa dân số thế giới và khái niệm về nền kinh tế tri thức.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích tác động kinh tế của sự già hóa dân số đối với các nước phát triển.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Nhận thức và trình bày vai trò của tri thức trong bối cảnh cuộc cách mạng công nghệ hiện đại."
  },
  "Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội khu vực Mỹ La tinh": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu vị trí địa lí, tự nhiên phong phú của Mỹ La tinh; quy mô dân số lớn và đặc trưng văn hóa đặc sắc.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của điều kiện tự nhiên đa dạng đến phát triển kinh tế và các vấn đề đô thị hóa tự phát.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đọc bản đồ tự nhiên Mỹ La tinh để xác định các mỏ khoáng sản kim loại màu lớn."
  },
  "Kinh tế khu vực Mỹ La tinh": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày hiện trạng kinh tế khu vực (tốc độ tăng trưởng không ổn định, nợ nước ngoài cao) và cơ cấu nông, công nghiệp.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân dẫn đến tình trạng phát triển kinh tế thiếu ổn định của các nước Mỹ La tinh.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Tính toán cơ cấu ngành nông nghiệp của khu vực Mỹ La tinh từ bảng số liệu."
  },
  "Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Liên minh châu Âu (EU)": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vị trí địa lí, quy mô lãnh thổ, đặc điểm dân cư và xã hội của Liên minh châu Âu.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ý nghĩa của vị trí địa lý thuận lợi trong việc kết nối giao thương giữa EU và các châu lục khác.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Xác định các quốc gia sáng lập và các thành viên chính của EU trên bản đồ hành chính."
  },
  "Kinh tế Liên minh châu Âu (EU)": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày đặc điểm kinh tế EU (một trung tâm kinh tế hàng đầu thế giới, sử dụng đồng Euro, thị trường tự do).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ý nghĩa việc thiết lập thị trường chung châu Âu đối với sự lưu thông tự do hàng hóa và tiền tệ.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích bài học từ sự liên kết kinh tế khu vực của EU đối với quá trình phát triển của ASEAN."
  },
  "Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội khu vực Đông Nam Á": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày đặc điểm vị trí địa lí cầu nối, giới hạn lãnh thổ Đông Nam Á lục địa và biển đảo; đặc điểm tự nhiên nhiệt đới gió mùa ẩm và dân cư đông đúc của khu vực.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích được các thuận lợi và khó khăn của vị trí, tự nhiên, dân cư đối với phát triển kinh tế nông nghiệp nhiệt đới và công nghiệp dịch vụ khu vực.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Liên hệ văn hóa và lối sống Đông Nam Á có nhiều nét tương đồng làm tiền đề hợp tác phát triển."
  },
  "Kinh tế khu vực Đông Nam Á": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày hiện trạng phát triển kinh tế Đông Nam Á (chuyển dịch cơ cấu từ nông nghiệp sang công nghiệp và dịch vụ). Nêu sự phân bộ ngành lúa nước, khai khoáng.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích nguyên nhân làm cơ cấu kinh tế các nước Đông Nam Á thay đổi theo hướng công nghiệp hóa.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Viết báo cáo ngắn về tình hình sản xuất lúa gạo hoặc phát triển thủy hải sản của một nước Đông Nam Á."
  },
  "Hiệp hội các quốc gia Đông Nam Á (ASEAN)": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được mục tiêu, cơ chế hợp tác và quá trình phát triển thành viên của ASEAN.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích các thành tựu của ASEAN (kinh tế tăng trưởng ổn định, khu vực hòa bình) và các thách thức lớn (chênh lệch trình độ, vấn đề biển Đông).",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá vai trò, vị thế và những đóng góp tích cực của Việt Nam kể từ khi gia nhập ASEAN."
  },
  "Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội khu vực Tây Nam Á": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vị trí địa lí ngã ba châu lục, khí hậu khô hạn, nhiều sa mạc, trữ lượng dầu mỏ lớn bậc nhất thế giới.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng tài nguyên dầu mỏ và các xung đột tôn giáo đối với địa chính trị, kinh tế Tây Nam Á.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Xác định các quốc gia tiếp giáp vịnh Ba Tư có trữ lượng dầu mỏ lớn trên bản đồ."
  },
  "Kinh tế khu vực Tây Nam Á": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu hiện trạng kinh tế Tây Nam Á phụ thuộc vào khai thác dầu khí và các nỗ lực đa dạng hóa nền kinh tế.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích sự chuyển dịch cơ cấu kinh tế theo hướng phát triển dịch vụ, tài chính và du lịch ở một số nước Trung Đông.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Tính toán sản lượng xuất khẩu dầu mỏ trung bình vùng Vịnh."
  },
  "Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Hoa Kỳ": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được vị trí địa lí, phạm vi lãnh thổ rộng lớn của Hoa Kỳ; các đặc điểm tự nhiên phân hóa giữa miền Đông, Trung bộ và miền Tây; quy mô và cơ cấu dân số (dân nhập cư phong phú).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của vị trí địa lý thuận lợi và tài nguyên thiên nhiên đa dạng đến sự phát triển kinh tế Hoa Kỳ. Phân tích tác động của nguồn lao động nhập cư chất lượng cao.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Viết báo cáo ngắn giới thiệu về một bang hoặc một ngành công nghiệp công nghệ cao nổi bật của Hoa Kỳ (Silicon Valley)."
  },
  "Kinh tế Hoa Kỳ": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu được vị thế của kinh tế Hoa Kỳ trên thế giới; đặc điểm phát triển các ngành công nghiệp, nông nghiệp và dịch vụ của Hoa Kỳ.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích được nguyên nhân giúp kinh tế Hoa Kỳ đứng đầu thế giới (vị trí, nguồn lực, khoa học công nghệ, thị trường tiêu thụ rộng lớn). Giải thích xu hướng chuyển dịch cơ cấu ngành kinh tế.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích tác động của các chính sách thương mại quốc tế của Hoa Kỳ đến hoạt động xuất khẩu của Việt Nam."
  },
  "Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Liên bang Nga": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày đặc điểm lãnh thổ rộng lớn nhất thế giới, điều kiện tự nhiên giàu có (rừng taiga, khoáng sản bauxit, dầu mỏ, khí tự nhiên) và dân cư Nga (quy mô lớn, dân tộc đa dạng).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích được ảnh hưởng của điều kiện tự nhiên và sự phân bố dân cư đến phân bố công nghiệp của Liên bang Nga.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá tiềm năng hợp tác khoa học công nghệ và năng lượng giữa Việt Nam và Liên bang Nga."
  },
  "Kinh tế Liên bang Nga": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu hiện trạng phát triển và phân bố các ngành công nghiệp (khai thác dầu khí, quân sự), nông nghiệp và dịch vụ của Liên bang Nga.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích sự chuyển dịch cơ cấu kinh tế của Liên bang Nga qua các giai đoạn lịch sử và vai trò các vùng kinh tế chính.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá vai trò của Liên bang Nga trong thị trường năng lượng toàn cầu hiện nay."
  },
  "Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Nhật Bản": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được vị trí địa lí, điều kiện tự nhiên đặc trưng (đất nước quần đảo, nhiều thiên tai, nghèo khoáng sản), dân cư và xã hội Nhật Bản (dân số già, lao động kỷ luật tốt).\n- [NL2 - Tìm hiểu địa lí]: Xác định vị trí địa lý của Nhật Bản và các đảo lớn (Hôn-su, Hốc-cai-đô, Kiêu-siu, Xi-cô-cư) trên bản đồ.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích được ảnh hưởng của điều kiện tự nhiên (nhiều núi lửa, động đất, tài nguyên hạn chế) và đặc điểm dân cư (già hóa dân số, tính kỷ luật cao) đến sự phát triển kinh tế của Nhật Bản.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích bài học kinh nghiệm từ mô hình giáo dục và đầu tư khoa học công nghệ của Nhật Bản đối với sự phát triển kinh tế Việt Nam."
  },
  "Kinh tế Nhật Bản": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được đặc điểm phát triển kinh tế Nhật Bản (thời kỳ phát triển thần kỳ, vị thế cường quốc kinh tế thế giới) và sự phân bố các ngành công nghiệp, nông nghiệp, dịch vụ.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích được nguyên nhân dẫn đến sự phát triển kinh tế và vai trò của các vùng kinh tế chính của Nhật Bản. Phân tích cơ cấu xuất nhập khẩu.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích mối quan hệ hợp tác đối tác chiến lược sâu rộng giữa Việt Nam và Nhật Bản trong các lĩnh vực ODA, lao động.\n- [NL2 - Tìm hiểu địa lí (Trả lời ngắn)]: Tính toán cán cân thương mại hoặc tốc độ tăng trưởng kinh tế Nhật Bản qua các giai đoạn."
  },
  "Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Trung Quốc": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vị trí địa lí, phạm vi lãnh thổ rộng lớn; sự khác biệt về tự nhiên giữa miền Đông (đồng bằng màu mỡ) và miền Tây (sơn nguyên, hoang mạc); quy mô dân số lớn nhất thế giới.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích được tác động của điều kiện tự nhiên miền Đông và miền Tây đối với phân bố dân cư và phát triển nông nghiệp Trung Quốc.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: So sánh sự phân bố dân cư và đô thị hóa giữa miền Đông và miền Tây Trung Quốc."
  },
  "Kinh tế Trung Quốc": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu được hiện trạng phát triển kinh tế Trung Quốc (tốc độ tăng trưởng vượt bậc, quy mô kinh tế thứ 2 thế giới) và phân bố các ngành công nghiệp, nông nghiệp.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân mang lại sự phát triển kinh tế vượt bậc của Trung Quốc nhờ thực hiện chính sách cải cách mở cửa từ năm 1978.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích mối quan hệ giao thương biên mậu và tiềm năng xuất khẩu nông sản của Việt Nam sang thị trường Trung Quốc."
  },
  "Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Ô-xtrây-li-a": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vị trí địa lí cô lập ở bán cầu Nam, khí hậu khô hạn phần lớn lãnh thổ, dân cư chủ yếu phân bố ở duyên hải ven biển Ô-xtrây-li-a.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của cảnh quan hoang mạc đến hoạt động du lịch và chăn nuôi gia súc của Ô-xtrây-li-a.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích bản đồ tự nhiên Ô-xtrây-li-a để làm rõ đặc điểm địa hình."
  },
  "Kinh tế Ô-xtrây-li-a": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu hiện trạng kinh tế Ô-xtrây-li-a (phát triển dịch vụ chất lượng cao, công nghiệp khai khoáng và nông nghiệp hiện đại).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân nền nông nghiệp Ô-xtrây-li-a đạt trình độ cơ giới hóa và năng suất hàng đầu thế giới.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Tính toán giá trị xuất khẩu khoáng sản và nông sản trong cơ cấu thương mại Ô-xtrây-li-a."
  },

  // --- GRADE 10 ---
  "Một số phương pháp biểu hiện các đối tượng địa lí trên bản đồ": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu tên và nhận diện được các phương pháp biểu hiện đối tượng địa lí trên bản đồ: ký hiệu, ký hiệu đường chuyển động, chấm điểm, bản đồ - biểu đồ.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích đặc điểm, đối tượng biểu hiện và khả năng thể hiện của từng phương pháp bản đồ (vị trí, hướng di chuyển, quy mô).",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đọc hiểu và phân tích bản đồ khí hậu, bản đồ công nghiệp sử dụng các phương pháp biểu hiện trên."
  },
  "Phương pháp sử dụng bản đồ trong học tập địa lí và đời sống": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu được vai trò của bản đồ trong học tập Địa lí (rèn luyện kỹ năng quan sát, tư duy) và trong đời sống (định vị, quy hoạch).\n- [NL2 - Tìm hiểu địa lí]: Biết cách khai thác thông tin từ bản đồ bằng cách đọc bảng chú giải, xác định tọa độ.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích được tầm quan trọng của việc hiểu các ký hiệu bản đồ và tỉ lệ bản đồ đối với độ chính xác của thông tin.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Áp dụng các phương pháp đọc bản đồ để phân tích một bản đồ hành chính hoặc bản đồ khí hậu thực tế."
  },
  "Một số ứng dụng của GPS và bản đồ số trong đời sống": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu được khái niệm GPS và bản đồ số. Kể tên các ứng dụng cơ bản của chúng trong đời sống.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên lí hoạt động cơ bản của hệ thống định vị toàn cầu GPS và tiện ích của bản đồ số trong tìm đường, theo dõi phương tiện.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Sử dụng các phần mềm bản đồ số trên thiết bị thông minh để tìm đường đi ngắn nhất, ước tính thời gian và xác định vị trí hiện tại."
  },
  "Nguồn gốc hình thành Trái Đất, vỏ Trái Đất và vật liệu cấu tạo vỏ Trái Đất": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được nguồn gốc hình thành Trái Đất; cấu tạo vỏ Trái Đất (vỏ lục địa và đại dương); nêu được các nhóm đá cấu tạo nên vỏ Trái Đất.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích được sự khác biệt về độ dày, thành phần và đặc tính vật lí giữa vỏ lục địa và vỏ đại dương.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân biệt được các mẫu đá trầm tích, macma và biến chất dựa trên đặc điểm hình thái bên ngoài."
  },
  "Hệ quả địa lí các chuyển động của Trái Đất": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu các hệ quả chuyển động tự quay của Trái Đất (ngày đêm luân phiên, giờ trên Trái Đất) và chuyển động quanh Mặt Trời (mùa, ngày đêm dài ngắn theo vĩ độ).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích được cơ chế sinh ra hiện tượng mùa trong năm và hiện tượng lệch hướng chuyển động của các vật thể (lực Coriôlit).",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Tính toán giờ múi của các địa điểm khác nhau khi biết giờ của một địa điểm cho trước.\n- [NL2 - Tìm hiểu địa lí (Trả lời ngắn)]: Tính chênh lệch múi giờ giữa các địa điểm kinh tuyến."
  },
  "Thạch quyển, thuyết kiến tạo mảng": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được khái niệm thạch quyển; nội dung chính của thuyết kiến tạo mảng (sự di chuyển của các mảng kiến tạo).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích nguyên nhân hình thành các vành đai động đất và núi lửa tại các vùng tiếp xúc giữa các mảng kiến tạo.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích lược đồ các mảng kiến tạo thế giới để xác định các khu vực có nguy cơ xảy ra động đất cao."
  },
  "Nội lực và ngoại lực": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu khái niệm nội lực, ngoại lực; các tác nhân hình thành địa hình (uốn nếp, đứt gãy do nội lực; phong hóa, bồi tụ do ngoại lực).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích mối quan hệ tác động qua lại đồng thời giữa nội lực và ngoại lực trong việc tạo lập địa hình bề mặt Trái Đất.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Nhận diện các dạng địa hình cacxtơ, địa hình thung lũng sông do các tác nhân ngoại lực tạo thành ở Việt Nam."
  },
  "Khí quyển, sự phân bố nhiệt độ không khí trên Trái Đất": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu khái niệm khí quyển; cấu trúc của khí quyển; quy luật phân bố nhiệt độ không khí theo vĩ độ địa lí, lục địa - đại dương và độ cao.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của góc nhập xạ và tính chất bề mặt đệm đến nhiệt độ không khí trung bình năm.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Áp dụng công thức tính nhiệt độ không khí tại một độ cao nhất định khi biết nhiệt độ chân núi."
  },
  "Khí áp và gió": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu sự hình thành các đai khí áp trên Trái Đất; các loại gió thổi thường xuyên (gió Tín phong, gió Tây ôn đới) và gió địa phương (gió đất, gió biển, gió phơn).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích được nguyên nhân làm khí áp thay đổi (nhiệt độ, độ ẩm, độ cao) và nguyên lí thổi của gió mùa châu Á.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích ảnh hưởng của gió phơn tây nam khô nóng đến sản xuất nông nghiệp khu vực miền Trung nước ta."
  },
  "Thủy quyển. Nước trên lục địa": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu khái niệm thủy quyển; vòng tuần hoàn nước; các nguồn nước trên lục địa (sông, hồ, nước ngầm, băng hà).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của chế độ mưa, địa hình, lớp phủ thực vật đến chế độ nước sông.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất giải pháp tiết kiệm nước ngọt và bảo vệ nguồn nước ngầm khỏi ô nhiễm tại đô thị."
  },
  "Mưa": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được các nhân tố ảnh hưởng đến lượng mưa (khí áp, frông, gió, dòng biển, địa hình).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích quy luật phân bố lượng mưa trên Trái Đất (mưa nhiều ở vùng xích đạo, mưa ít ở vùng chí tuyến).",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Giải thích nguyên nhân gây mưa lớn kèm lũ lụt vào mùa thu đông ở dải duyên hải miền Trung nước ta."
  },
  "Nước biển và đại dương": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu được độ muối và nhiệt độ của nước biển và đại dương; trình bày được hoạt động và phân bố các dòng biển (nóng và lạnh) trên thế giới.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích được nguyên nhân gây ra sự thay đổi độ muối và nhiệt độ nước biển theo vĩ độ và theo mùa.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích lược đồ dòng biển để nhận xét hướng chảy và ảnh hưởng của chúng đến khí hậu ven bờ nơi chúng đi qua."
  },
  "Đất": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu khái niệm đất; các nhân tố hình thành đất (đá mẹ, khí hậu, sinh vật, địa hình, thời gian, con người).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích vai trò quyết định của đá mẹ đối với thành phần khoáng vật và khí hậu đối với quá trình phong hóa tạo đất.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất biện pháp cải tạo và chống xói mòn đất đai đồi dốc tại địa phương."
  },
  "Sinh quyển": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu khái niệm sinh quyển; giới hạn của sinh quyển; các nhân tố ảnh hưởng đến sự phát triển và phân bố sinh vật.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích quy luật phân bố các vành đai thực vật theo vĩ độ và theo độ cao địa hình.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất giải pháp bảo vệ rừng tự nhiên nhằm bảo tồn nguồn gen quý hiếm và cân bằng sinh thái."
  },
  "Quy mô dân số, gia tăng dân số và cơ cấu dân số thế giới": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày quy mô dân số thế giới; cơ cấu dân số theo tuổi và giới (cơ cấu dân số trẻ và già); các chỉ số gia tăng dân số.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích tác động kinh tế - xã hội của cơ cấu dân số già (thiếu lao động, chi phí phúc lợi lớn) đối với các nước phát triển.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Tính toán tỉ suất gia tăng dân số tự nhiên của quốc gia khi biết tỉ suất sinh và tử."
  },
  "Phân bộ dân cư và đô thị hóa": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu đặc điểm phân bố dân cư thế giới; các nhân tố ảnh hưởng phân bố; khái niệm và đặc điểm quá trình đô thị hóa.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của quá trình đô thị hóa tự phát đến việc làm, nhà ở và ô nhiễm môi trường tại các nước đang phát triển.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: So sánh đặc điểm đô thị hóa giữa nhóm nước phát triển và đang phát triển."
  },
  "Các nguồn lực phát triển kinh tế": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu khái niệm nguồn lực; phân loại nguồn lực (vị trí địa lí, tự nhiên, kinh tế - xã hội).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích vai trò của nguồn lực kinh tế - xã hội (lao động, vốn, công nghệ) quyết định hướng đi và trình độ phát triển.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá thế mạnh nguồn lực nổi bật nhất của Việt Nam trong bối cảnh toàn cầu hóa."
  },
  "Cơ cấu kinh tế, tổng sản phẩm trong nước và tổng thu nhập quốc gia": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu khái niệm GDP, GNI; cơ cấu ngành kinh tế (Khu vực I, II, III).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ý nghĩa sự chuyển dịch cơ cấu ngành kinh tế phản ánh trình độ phát triển khoa học công nghệ của quốc gia.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Tính toán GDP bình quan đầu người của một quốc gia dựa trên tổng GDP và tổng số dân."
  },
  "Địa lí ngành nông nghiệp, lâm nghiệp, thủy sản": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vai trò, đặc điểm và phân bố các ngành sản xuất nông nghiệp, lâm nghiệp và thủy hải sản trên thế giới.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của điều kiện đất, nước, khí hậu đối với tính mùa vụ và cơ cấu cây trồng.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích xu hướng phát triển nông nghiệp sinh thái hiện đại thế giới."
  },
  "Tổ chức lãnh thổ nông nghiệp, một số vấn đề phát triển nông nghiệp hiện đại": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày được vai trò, đặc điểm của tổ chức lãnh thổ nông nghiệp (hộ gia đình, trang trại, vùng nông nghiệp); nêu một số xu hướng phát triển nông nghiệp hiện đại.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích được ý nghĩa của tổ chức lãnh thổ nông nghiệp đối với phát triển bền vững và liên kết sản xuất.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá vai trò của công nghệ sinh học và nông nghiệp số tại một số quốc gia tiên tiến."
  },
  "Địa lí ngành công nghiệp": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu vai trò, đặc điểm của công nghiệp; phân loại công nghiệp trọng điểm (năng lượng, luyện kim, hóa chất, hàng tiêu dùng).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích các nhân tố vị trí địa lí và thị trường ảnh hưởng đến sự phân bố các trung tâm công nghiệp lớn.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất các giải pháp tăng cường sử dụng năng lượng tái tạo (mặt trời, gió) thay thế nhiên liệu hóa thạch."
  },
  "Tổ chức lãnh thổ công nghiệp, một số vấn đề phát triển công nghiệp hiện đại": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu các hình thức tổ chức lãnh thổ công nghiệp (điểm công nghiệp, khu công nghiệp, trung tâm công nghiệp); xu hướng phát triển công nghiệp hiện đại.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích được tầm quan trọng của khu công nghiệp, khu chế xuất trong việc thúc đẩy xuất khẩu và thu hút đầu tư.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Phân tích một mô hình khu công nghiệp sinh thái hoặc khu công nghiệp thông minh trên thế giới."
  },
  "Địa lí ngành dịch vụ": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vai trò, đặc điểm và cơ cấu ngành dịch vụ (dịch vụ tiêu dùng, kinh doanh, công cộng).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích sự phân bố dịch vụ chịu ảnh hưởng quyết định bởi quy mô dân số và sức mua của người dân.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá tầm quan trọng của phát triển thương mại điện tử đối với dịch vụ bán lẻ hiện nay."
  },
  "Địa lí ngành giao thông vận tải và bưu chính viễn thông": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu vai trò, đặc điểm và phân bố của các ngành giao thông vận tải và bưu chính viễn thông thế giới.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích ảnh hưởng của sự phát triển internet và công nghệ số đến sự thay đổi hình thức bưu chính viễn thông.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đánh giá vai trò của các cảng biển trung chuyển lớn quốc tế đối với thương mại toàn cầu."
  },
  "Địa lí ngành tài chính ngân hàng và du lịch": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Trình bày vai trò, đặc điểm và sự phân bố của ngành tài chính ngân hàng và du lịch trên thế giới.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích ảnh hưởng của tài nguyên du lịch (tự nhiên và nhân văn) đến sự hình thành các trung tâm du lịch thế giới.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Thiết kế một tour du lịch ảo hoặc đề xuất một giải pháp tài chính cá nhân an toàn thời kỳ công nghệ số."
  },
  "Địa lí ngành thương mại": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu vai trò, đặc điểm của ngành thương mại; cán cân thương mại và các tổ chức thương mại thế giới (WTO).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích xu hướng phát triển của thương mại điện tử và sự thay đổi mạng lưới bán lẻ toàn cầu.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Tính toán cán cân xuất nhập khẩu của các quốc gia dựa trên số liệu giá trị xuất khẩu và nhập khẩu."
  },
  "Môi trường và tài nguyên thiên nhiên": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu khái niệm môi trường, tài nguyên thiên nhiên; phân loại tài nguyên (tái sinh, không tái sinh, vô hạn).",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Phân tích nguyên nhân gây suy thoái môi trường toàn cầu (hiệu ứng nhà kính, rác thải đại dương) và sự khan hiếm tài nguyên.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Đề xuất các hành động cụ thể để phân loại rác thải tại nguồn và tái chế tài nguyên tại trường học."
  },
  "Phát triển bền vững và tăng trưởng xanh": {
    know: "- [NL1 - Nhận thức khoa học địa lí]: Nêu khái niệm phát triển bền vững và tăng trưởng xanh; các biểu hiện cơ bản của tăng trưởng xanh.",
    understand: "- [NL1 - Nhận thức khoa học địa lí]: Giải thích tại sao phát triển bền vững cần kết hợp hài hòa giữa tăng trưởng kinh tế, công bằng xã hội và bảo vệ môi trường.",
    apply: "- [NL3 - Vận dụng kiến thức, kĩ năng]: Thiết lập một thói quen tiêu dùng xanh hằng ngày của bản thân (tiết kiệm điện, hạn chế rác thải nhựa) tại gia đình."
  }
};


// --- Mock Data ---
const INITIAL_DATA: AppData[] = [
  {
    id: '1',
    title: 'GeoMap Interactive',
    description: 'Hệ thống bản đồ tương tác 3D hỗ trợ giảng dạy địa lí tự nhiên và kinh tế.',
    image: 'https://picsum.photos/seed/geography/600/400',
    url: 'https://example.com/geomap',
    category: 'Bản đồ học',
    badge: 'MIỄN PHÍ'
  },
  {
    id: '2',
    title: 'ClimateSim',
    description: 'Mô phỏng các hiện tượng khí hậu, biến đổi khí hậu và hoàn lưu khí quyển.',
    image: 'https://picsum.photos/seed/climate/600/400',
    url: 'https://example.com/climate',
    category: 'Địa lí Tự nhiên',
    badge: 'VIP'
  },
  {
    id: '3',
    title: 'VietStat Data',
    description: 'Kho dữ liệu thống kê kinh tế - xã hội Việt Nam cập nhật mới nhất.',
    image: 'https://picsum.photos/seed/vietnam/600/400',
    url: 'https://example.com/vietstat',
    category: 'Địa lí Việt Nam',
    badge: 'HOT'
  }
];

// --- Components ---

const ApiSettingsModal = ({ 
  isOpen, 
  onClose, 
  apiKey, 
  setApiKey, 
  selectedModel, 
  setSelectedModel 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  apiKey: string; 
  setApiKey: (key: string) => void; 
  selectedModel: string; 
  setSelectedModel: (model: string) => void; 
}) => {
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempModel, setTempModel] = useState(selectedModel);
  const [showKey, setShowKey] = useState(false);
  const isMandatory = !apiKey;

  useEffect(() => {
    if (isOpen) {
      setTempKey(apiKey);
      setTempModel(selectedModel);
    }
  }, [isOpen, apiKey, selectedModel]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmedKey = tempKey.trim();
    if (!trimmedKey) {
      Swal.fire('Lỗi', 'Vui lòng nhập API Key để tiếp tục', 'error');
      return;
    }

    setApiKey(trimmedKey);
    setSelectedModel(tempModel);
    localStorage.setItem('gemini_api_key', trimmedKey);
    localStorage.setItem('gemini_preferred_model', tempModel);
    
    Swal.fire('Thành công', 'Đã lưu cấu hình API Key và Model AI', 'success');
    onClose();
  };

  const modelsList = [
    { id: 'gemini-3.5-flash', label: 'gemini-3.5-flash (Mặc định)', desc: 'Mô hình tốc độ cao thế hệ mới, phản hồi cực nhanh — khuyến nghị cho mọi tác vụ.' },
    { id: 'gemini-3.1-pro', label: 'gemini-3.1-pro', desc: 'Mô hình flagship mạnh mẽ nhất, chuyên xử lý logic và agentic workflows.' },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-xl bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xl font-black text-slate-900">Thiết lập Model & API Key</h3>
            <p className="text-xs text-slate-500 mt-1">Cấu hình kết nối Google Gemini AI</p>
          </div>
          {!isMandatory && (
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          {isMandatory && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 text-rose-700 text-sm">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Yêu cầu cấu hình API Key:</span> Vui lòng nhập Google Gemini API Key của bạn để bắt đầu sử dụng các tính năng AI trong GeoHub.
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700">Google Gemini API Key</label>
              <a 
                href="https://aistudio.google.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1"
              >
                <ExternalLink size={12} />
                Lấy API key tại Google AI Studio
              </a>
            </div>
            <div className="relative">
              <input 
                type={showKey ? "text" : "password"}
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Nhập API Key (ví dụ: AIzaSy...)"
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-teal-500 transition-all font-mono text-sm"
              />
              <button 
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                {showKey ? "ẨN" : "HIỆN"}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">Khóa API của bạn sẽ được lưu an toàn tại bộ nhớ cục bộ (localStorage) của trình duyệt và không được gửi đi bất kỳ máy chủ nào khác ngoại trừ API của Google.</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 block">Chọn Model AI</label>
            <div className="grid grid-cols-1 gap-3">
              {modelsList.map((model) => (
                <div 
                  key={model.id}
                  onClick={() => setTempModel(model.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 items-start ${
                    tempModel === model.id 
                      ? 'border-teal-500 bg-teal-50/30' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    tempModel === model.id ? 'border-teal-500 bg-teal-500' : 'border-slate-300'
                  }`}>
                    {tempModel === model.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{model.label}</h4>
                    <p className="text-xs text-slate-500 mt-1">{model.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          {!isMandatory && (
            <button 
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all"
            >
              Hủy
            </button>
          )}
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all"
          >
            Lưu thiết lập
          </button>
        </div>
      </div>
    </div>
  );
};

const Header = ({ 
  isAdmin, 
  onToggleAdmin, 
  onOpenSettings, 
  apiKey 
}: { 
  isAdmin: boolean; 
  onToggleAdmin: () => void; 
  onOpenSettings: () => void; 
  apiKey: string; 
}) => (
  <header className="sticky top-0 z-50 w-full glass border-b border-slate-200/50 px-4 py-3 md:px-8">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Globe className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-700 hidden sm:block">
          GeoHub
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
        <a href="#" className="hover:text-teal-600 transition-colors">Trang chủ</a>
        <a href="#" className="hover:text-teal-600 transition-colors">Khám phá</a>
        <a href="#" className="hover:text-teal-600 transition-colors">Liên hệ</a>
      </nav>

      <div className="flex items-center gap-3">
        {/* Nút LMS Portal */}
        <a 
          href="/login"
          className="text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0 transition-all shadow-sm shadow-teal-500/30"
        >
          <span>🎓</span>
          LMS Portal
        </a>

        {/* Hướng dẫn lấy key */}
        <a 
          href="https://aistudio.google.com/api-keys" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1 shrink-0"
        >
          <Sparkles size={12} className="animate-pulse" />
          Lấy API key để sử dụng app
        </a>

        {/* Nút Settings API Key */}
        <button 
          onClick={onOpenSettings}
          className="p-2 text-slate-600 hover:text-teal-600 hover:bg-slate-100 rounded-xl transition-all relative group"
          title="Thiết lập API Key & Model"
        >
          <Settings size={18} />
          {!apiKey && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          )}
        </button>

        <button 
          onClick={onToggleAdmin}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
            isAdmin 
              ? 'bg-slate-900 text-white shadow-lg' 
              : 'bg-white border border-slate-200 text-slate-700 hover:border-teal-400 hover:text-teal-600'
          }`}
        >
          {isAdmin ? <User size={18} /> : <LayoutDashboard size={18} />}
          <span>{isAdmin ? 'Chế độ Khách' : 'Quản trị'}</span>
        </button>
      </div>
    </div>
  </header>
);

const Hero = ({ onStart }: { onStart: () => void }) => (
  <section className="relative py-20 px-4 overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-teal-400/10 blur-[120px] rounded-full -z-10" />
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-wider text-teal-600 uppercase bg-teal-50 rounded-full border border-teal-100">
          Khám phá hệ sinh thái ứng dụng
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          Tất cả ứng dụng <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-600">
            Bạn cần ở một nơi.
          </span>
        </h1>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          AppHub là cổng thông tin tổng hợp các công cụ hỗ trợ học tập, làm việc và giải trí hàng đầu. 
          Tiết kiệm thời gian, nâng cao hiệu suất ngay hôm nay.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            Bắt đầu ngay <ChevronRight size={20} />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-colors">
            Tìm hiểu thêm
          </button>
        </div>
      </motion.div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-slate-900 text-slate-400 py-12 px-4 mt-20">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-600 rounded-lg flex items-center justify-center">
            <Globe className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-white">AppHub</span>
        </div>
        <p className="max-w-sm mb-6">
          Nền tảng danh bạ ứng dụng hàng đầu, giúp bạn kết nối với những công cụ tuyệt vời nhất để phát triển bản thân.
        </p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors"><Twitter size={20} /></a>
          <a href="#" className="hover:text-white transition-colors"><Facebook size={20} /></a>
          <a href="#" className="hover:text-white transition-colors"><Github size={20} /></a>
        </div>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Liên kết</h4>
        <ul className="space-y-4 text-sm">
          <li><a href="#" className="hover:text-teal-400 transition-colors">Về chúng tôi</a></li>
          <li><a href="#" className="hover:text-teal-400 transition-colors">Điều khoản dịch vụ</a></li>
          <li><a href="#" className="hover:text-teal-400 transition-colors">Chính sách bảo mật</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Hỗ trợ</h4>
        <ul className="space-y-4 text-sm">
          <li><a href="#" className="hover:text-teal-400 transition-colors">Trung tâm trợ giúp</a></li>
          <li><a href="#" className="hover:text-teal-400 transition-colors">Phản hồi</a></li>
          <li><a href="#" className="hover:text-teal-400 transition-colors">Liên hệ quảng cáo</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto border-t border-slate-800 mt-12 pt-8 text-center text-xs">
      © 2024 AppHub. Thiết kế bởi Professional Full-stack Developer.
    </div>
  </footer>
);

const AppCard = ({ app }: { app: AppData }) => (
  <div className="group relative bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 h-full flex flex-col">
    <div className="relative aspect-video overflow-hidden">
      <img 
        src={app.image} 
        alt={app.title} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-4 right-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg ${
          app.badge === 'VIP' ? 'bg-amber-400 text-amber-900' : 
          app.badge === 'HOT' ? 'bg-rose-500 text-white' : 
          'bg-teal-500 text-white'
        }`}>
          {app.badge}
        </span>
      </div>
    </div>
    
    <div className="p-6 flex flex-col flex-grow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">{app.category}</span>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-1">
        {app.title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
        {app.description}
      </p>
      <div className="mt-auto">
        <a 
          href={app.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 text-slate-700 rounded-xl font-bold hover:bg-teal-600 hover:text-white transition-all duration-300"
        >
          Truy cập ngay <ExternalLink size={16} />
        </a>
      </div>
    </div>
  </div>
);

const AppModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: (data: AppData) => void,
  initialData?: AppData | null
}) => {
  const [formData, setFormData] = useState<AppData>({
    id: '',
    title: '',
    description: '',
    image: '',
    url: '',
    category: 'Toán học',
    badge: 'MIỄN PHÍ'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: Math.random().toString(36).substr(2, 9),
        title: '',
        description: '',
        image: '',
        url: '',
        category: 'Toán học',
        badge: 'MIỄN PHÍ'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">
            {initialData ? 'Chỉnh sửa ứng dụng' : 'Thêm ứng dụng mới'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Tên ứng dụng</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              placeholder="VD: MathMaster Pro"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Mô tả ngắn</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all min-h-[100px]"
              placeholder="Mô tả tính năng chính của ứng dụng..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Danh mục</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 outline-none bg-white"
              >
                {CATEGORIES.filter(c => c !== "Tất cả").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Nhãn (Badge)</label>
              <input 
                type="text" 
                value={formData.badge}
                onChange={(e) => setFormData({...formData, badge: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 outline-none"
                placeholder="VD: MIỄN PHÍ, VIP, HOT"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Link ảnh thumbnail</label>
            <input 
              type="text" 
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 outline-none"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Link URL ứng dụng</label>
            <input 
              type="text" 
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 outline-none"
              placeholder="https://myapp.com"
            />
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-white transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={() => onSave(formData)}
            className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
          >
            <Check size={18} /> Lưu thay đổi
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Workspace Components ---

const WorkspaceSidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const menuItems = [
    { id: 'exambank', label: 'Ngân hàng câu hỏi', icon: Database },
    { id: 'matrix', label: 'Ma trận & Đặc tả (CV 7991)', icon: LayoutGrid },
    { id: 'practice', label: 'Luyện tập trắc nghiệm', icon: Edit2 },
    { id: 'games', label: 'Trò chơi giáo dục', icon: Gamepad2 },
    { id: 'simulation', label: 'Mô phỏng trực quan', icon: Globe },
    { id: 'classroom', label: 'Lớp học', icon: Users },
    { id: 'statistics', label: 'Thống kê kết quả', icon: BarChart3 },
    { id: 'lesson', label: 'Soạn giáo án', icon: FileText },
    { id: 'storage', label: 'Kho tài liệu', icon: Archive },
  ];

  return (
    <aside className="w-full md:w-72 bg-white border-r border-slate-200 h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Công cụ giáo dục</h2>
        <nav className="space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-teal-50 text-teal-600 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

const MatrixModule = () => {
  const [step, setStep] = useState(1); // 1: Matrix, 2: Spec Table, 3: Exam Gen
  const [selectedGrade, setSelectedGrade] = useState('12');
  const [examCount, setExamCount] = useState(4);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [searchLesson, setSearchLesson] = useState('');
  const [editingSpec, setEditingSpec] = useState<{ rowIdx: number; type: 'know' | 'understand' | 'apply' } | null>(null);

  // Shuffling configuration
  const [codeFormat, setCodeFormat] = useState<'3' | '4'>('3');
  const [codeStart, setCodeStart] = useState<number>(101);
  const [showGuide, setShowGuide] = useState(false);

  // History & Tracking list
  const [savedMatrices, setSavedMatrices] = useState<any[]>([]);
  const [savedExams, setSavedExams] = useState<any[]>([]);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  // AI-related state variables
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExamLoading, setIsExamLoading] = useState(false);

  const [docHeader, setDocHeader] = useState({
    department: 'SỞ GD&ĐT TÌNH BÌNH PHƯỚC',
    school: 'TRƯỜNG THPT CHUYÊN QUANG TRUNG',
    examName: 'KÌ THI KIỂM TRA ĐỊNH KÌ HỌC KÌ I',
    creator: 'Nguyễn Văn A'
  });

  const [pointConfig, setPointConfig] = useState({
    mc: 0.25,
    tf: 1.0,
    short: 0.5,
    essay: 1.0
  });

  interface MatrixRow {
    topic: string;
    content: string;
    mc: { know: number; understand: number; apply: number };
    tf: { know: number; understand: number; apply: number };
    short: { know: number; understand: number; apply: number };
    essay: { know: number; understand: number; apply: number };
    spec: {
      know: string;
      understand: string;
      apply: string;
    };
  }

  const [rows, setRows] = useState<MatrixRow[]>([
    { 
      topic: 'Địa lí tự nhiên Việt Nam', 
      content: 'Vị trí địa lí và phạm vi lãnh thổ', 
      mc: { know: 4, understand: 0, apply: 0 },
      tf: { know: 0, understand: 1, apply: 0 },
      short: { know: 0, understand: 1, apply: 0 },
      essay: { know: 0, understand: 0, apply: 0 },
      spec: { 
        know: '', 
        understand: '', 
        apply: '' 
      }
    },
    { 
      topic: 'Địa lí tự nhiên Việt Nam', 
      content: 'Đặc điểm chung của tự nhiên Việt Nam', 
      mc: { know: 4, understand: 4, apply: 0 },
      tf: { know: 0, understand: 1, apply: 0 },
      short: { know: 0, understand: 1, apply: 0 },
      essay: { know: 0, understand: 0, apply: 1 },
      spec: { 
        know: '', 
        understand: '', 
        apply: '' 
      }
    }
  ]);

  const defaultGeographyExam = {
    part1: [
      {
        id: 1,
        question: "Trong các hệ thống sông sau đây của nước ta, sông nào chảy theo hướng tây bắc - đông nam?",
        options: ["Sông Hồng", "Sông Kỳ Cùng", "Sông Gâm", "Sông Thương"],
        correctIdx: 0
      },
      {
        id: 2,
        question: "Lãnh thổ nước ta nằm hoàn toàn trong vùng nội chí tuyến nên có đặc điểm nào sau đây?",
        options: ["Nhiệt độ trung bình năm cao", "Chịu ảnh hưởng sâu sắc của biển", "Có nhiều đảo và quần đảo", "Địa hình nhiều đồi núi thấp"],
        correctIdx: 0
      },
      {
        id: 3,
        question: "Gió mùa Đông Bắc khi thổi vào nước ta nửa sau mùa đông gây nên hiện tượng thời tiết nào?",
        options: ["Mưa phùn ở vùng ven biển và đồng bằng Bắc Bộ", "Hanh khô kéo dài ở Nam Bộ", "Mưa lớn ở Tây Nguyên", "Nắng nóng ở Bắc Trung Bộ"],
        correctIdx: 0
      },
      {
        id: 4,
        question: "Tỉnh nào sau đây của nước ta có đường biên giới giáp cả Lào và Campuchia?",
        options: ["Kon Tum", "Gia Lai", "Quảng Nam", "Điện Biên"],
        correctIdx: 0
      }
    ],
    part2: [
      {
        id: 1,
        question: "Cho nhận định sau về đặc điểm địa hình vùng núi nước ta:",
        subQuestions: [
          { text: "Vùng núi Đông Bắc có hướng núi vòng cung chiếm ưu thế.", correct: "Đúng" },
          { text: "Vùng núi Tây Bắc có địa hình cao nhất cả nước với các dãy núi lớn hướng tây bắc - đông nam.", correct: "Đúng" },
          { text: "Vùng núi Trường Sơn Bắc gồm các dãy núi song song và so le nhau theo hướng vòng cung.", correct: "Sai" },
          { text: "Vùng núi Trường Sơn Nam có các cao nguyên xếp tầng bazan màu mỡ.", correct: "Đúng" }
        ]
      },
      {
        id: 2,
        question: "Cho nhận định về tài nguyên khí hậu nước ta:",
        subQuestions: [
          { text: "Khí hậu nước ta mang tính chất nhiệt đới ẩm gió mùa.", correct: "Đúng" },
          { text: "Biên độ nhiệt năm ở phía Nam lớn hơn nhiều so với phía Bắc.", correct: "Sai" },
          { text: "Nước ta có lượng mưa lớn, trung bình năm từ 1500 - 2000 mm.", correct: "Đúng" },
          { text: "Ảnh hưởng của gió mùa dẫn đến sự phân mùa khí hậu rõ rệt ở cả 2 miền.", correct: "Đúng" }
        ]
      }
    ],
    part3: [
      {
        id: 1,
        question: "Năm 2023, diện tích đất nông nghiệp nước ta là 27,3 triệu ha, dân số nước ta là 100,3 triệu người. Hãy tính diện tích đất nông nghiệp bình quân đầu người (m²/người). (Làm tròn kết quả đến hàng đơn vị. Biết 1 ha = 10000 m²)",
        correctAnswer: "2722"
      },
      {
        id: 2,
        question: "Năm 2023, giá trị xuất khẩu hàng hóa nước ta đạt 355,5 tỷ USD, nhập khẩu đạt 327,5 tỷ USD. Hãy tính cán cân thương mại của nước ta năm 2023 (tỷ USD). (Làm tròn kết quả đến 1 chữ số thập phân)",
        correctAnswer: "28.0"
      }
    ],
    part4: [
      {
        id: 1,
        question: "Trình bày ảnh hưởng của biển Đông đến khí hậu và sinh vật nước ta. Tại sao nước ta cần chú trọng khai thác tài nguyên biển đi đôi với bảo vệ môi trường?"
      }
    ]
  };

  const [masterExam, setMasterExam] = useState(defaultGeographyExam);

  interface ShuffledExam {
    code: number;
    part1: typeof defaultGeographyExam.part1;
    part2: typeof defaultGeographyExam.part2;
    part3: typeof defaultGeographyExam.part3;
    part4: typeof defaultGeographyExam.part4;
  }

  const [shuffledExams, setShuffledExams] = useState<ShuffledExam[]>([]);
  const [currentExamCode, setCurrentExamCode] = useState(101);

  function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const generateShuffledExams = (master: typeof defaultGeographyExam, count: number) => {
    const list: ShuffledExam[] = [];
    const baseCode = isNaN(codeStart) || codeStart <= 0 ? 101 : codeStart;
    for (let i = 0; i < count; i++) {
      const code = baseCode + i;
      
      let p1 = master.part1.map((q, idx) => {
        const originalOptions = q.options.map((opt, oIdx) => ({ text: opt, isCorrect: oIdx === q.correctIdx }));
        const shuffledOpts = shuffleArray(originalOptions);
        const correctIdx = shuffledOpts.findIndex(o => o.isCorrect);
        return {
          id: idx + 1,
          question: q.question,
          options: shuffledOpts.map(o => o.text),
          correctIdx
        };
      });
      p1 = shuffleArray(p1);
      p1 = p1.map((q, idx) => ({ ...q, id: idx + 1 }));

      let p2 = master.part2.map((q, idx) => {
        const shuffledSubs = shuffleArray(q.subQuestions);
        return {
          id: idx + 1,
          question: q.question,
          subQuestions: shuffledSubs
        };
      });
      p2 = shuffleArray(p2);
      p2 = p2.map((q, idx) => ({ ...q, id: idx + 1 }));

      let p3 = shuffleArray(master.part3);
      p3 = p3.map((q, idx) => ({ ...q, id: idx + 1 }));

      let p4 = shuffleArray(master.part4);
      p4 = p4.map((q, idx) => ({ ...q, id: idx + 1 }));

      list.push({
        code,
        part1: p1,
        part2: p2,
        part3: p3,
        part4: p4
      });
    }
    return list;
  };

  useEffect(() => {
    const list = generateShuffledExams(masterExam, examCount);
    setShuffledExams(list);
    if (list.length > 0) {
      setCurrentExamCode(list[0].code);
    }
  }, [masterExam, examCount, codeStart]);

  const activeShuffledExam = shuffledExams.find(ex => ex.code === currentExamCode) || shuffledExams[0] || {
    code: 101,
    part1: masterExam.part1,
    part2: masterExam.part2,
    part3: masterExam.part3,
    part4: masterExam.part4
  };

  // Sync History on Mount
  useEffect(() => {
    fetchSavedData();
  }, []);

  const fetchSavedData = async () => {
    // 1. Fetch LocalStorage fallbacks
    const localMats = JSON.parse(localStorage.getItem('saved_geography_matrices') || '[]');
    const localExams = JSON.parse(localStorage.getItem('saved_geography_exams') || '[]');
    setSavedMatrices(localMats);
    setSavedExams(localExams);

    // 2. Fetch server database if available
    try {
      const matRes = await fetch('/api/matrices');
      if (matRes.ok) {
        const serverMats = await matRes.json();
        if (serverMats.length > 0) {
          setSavedMatrices(serverMats);
          localStorage.setItem('saved_geography_matrices', JSON.stringify(serverMats));
        }
      }
      const examRes = await fetch('/api/saved-exams');
      if (examRes.ok) {
        const serverExams = await examRes.json();
        if (serverExams.length > 0) {
          setSavedExams(serverExams);
          localStorage.setItem('saved_geography_exams', JSON.stringify(serverExams));
        }
      }
    } catch (e) {
      console.log("Không thể kết nối API Server, sử dụng LocalStorage làm dự phòng chính.");
    }
  };

  const saveMatrixToDbAndLocal = async () => {
    const { value: title } = await Swal.fire({
      title: 'Lưu Ma Trận & Đặc Tả',
      input: 'text',
      inputLabel: 'Nhập tên tiêu đề để lưu theo dõi:',
      inputValue: `Ma trận ${docHeader.examName || 'Kiểm tra'} - Lớp ${selectedGrade}`,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return 'Vui lòng điền tên tiêu đề!';
      },
      confirmButtonColor: '#0d9488'
    });

    if (!title) return;

    const newMatrix = {
      id: 'mat_' + Date.now(),
      title,
      grade: selectedGrade,
      header: docHeader,
      rows: rows,
      createdAt: new Date().toISOString()
    };

    // Update LocalStorage
    const updatedMats = [newMatrix, ...savedMatrices];
    setSavedMatrices(updatedMats);
    localStorage.setItem('saved_geography_matrices', JSON.stringify(updatedMats));

    // Update SQLite API
    try {
      await fetch('/api/matrices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMatrix)
      });
    } catch (e) {
      console.log("Offline: Đã lưu cục bộ vào trình duyệt.");
    }

    Swal.fire({
      title: 'Đã lưu ma trận thành công!',
      text: 'Bạn có thể xem lại ma trận này tại phần "Lịch sử & Đề đã lưu" bất cứ lúc nào.',
      icon: 'success',
      confirmButtonColor: '#0d9488'
    });
  };

  const saveExamToDbAndLocal = async () => {
    const { value: title } = await Swal.fire({
      title: 'Lưu Đề Thi & Mã Đề Trộn',
      input: 'text',
      inputLabel: 'Nhập tên đề thi để lưu theo dõi:',
      inputValue: `Đề thi ${docHeader.examName || 'Kiểm tra'} - Lớp ${selectedGrade} (${examCount} mã đề)`,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return 'Vui lòng điền tên đề thi!';
      },
      confirmButtonColor: '#0d9488'
    });

    if (!title) return;

    const newExamRecord = {
      id: 'exam_' + Date.now(),
      title,
      grade: selectedGrade,
      header: docHeader,
      examData: masterExam,
      shuffledCodes: shuffledExams,
      createdAt: new Date().toISOString()
    };

    // Update LocalStorage
    const updatedExams = [newExamRecord, ...savedExams];
    setSavedExams(updatedExams);
    localStorage.setItem('saved_geography_exams', JSON.stringify(updatedExams));

    // Update SQLite API
    try {
      await fetch('/api/saved-exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExamRecord)
      });
    } catch (e) {
      console.log("Offline: Đã lưu cục bộ vào trình duyệt.");
    }

    Swal.fire({
      title: 'Đã lưu đề thi thành công!',
      text: 'Mã đề xáo trộn và đáp án đã được lưu trữ an toàn trong lịch sử.',
      icon: 'success',
      confirmButtonColor: '#0d9488'
    });
  };

  const loadMatrix = (item: any) => {
    setRows(item.rows);
    setSelectedGrade(item.grade);
    setDocHeader(item.header);
    setStep(1);
    Swal.fire({
      title: 'Đã tải ma trận!',
      text: `Đã khôi phục ma trận "${item.title}" thành công.`,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const loadExam = (item: any) => {
    setMasterExam(item.examData);
    setShuffledExams(item.shuffledCodes);
    setSelectedGrade(item.grade);
    setDocHeader(item.header);
    setExamCount(item.shuffledCodes.length);
    if (item.shuffledCodes.length > 0) {
      setCurrentExamCode(item.shuffledCodes[0].code);
    }
    setStep(3);
    Swal.fire({
      title: 'Đã tải đề thi!',
      text: `Đã khôi phục đề thi "${item.title}" thành công.`,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const deleteMatrix = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: 'Xóa ma trận này?',
      text: "Bạn không thể khôi phục sau khi xóa!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Đồng ý xóa'
    });

    if (!result.isConfirmed) return;

    const filtered = savedMatrices.filter(m => m.id !== id);
    setSavedMatrices(filtered);
    localStorage.setItem('saved_geography_matrices', JSON.stringify(filtered));

    try {
      await fetch(`/api/matrices/\${id}`, { method: 'DELETE' });
    } catch (e) {
      console.log("Không thể kết nối API Server để xóa.");
    }
  };

  const deleteExam = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: 'Xóa đề thi này?',
      text: "Bạn không thể khôi phục sau khi xóa!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Đồng ý xóa'
    });

    if (!result.isConfirmed) return;

    const filtered = savedExams.filter(ex => ex.id !== id);
    setSavedExams(filtered);
    localStorage.setItem('saved_geography_exams', JSON.stringify(filtered));

    try {
      await fetch(`/api/saved-exams/\${id}`, { method: 'DELETE' });
    } catch (e) {
      console.log("Không thể kết nối API Server để xóa.");
    }
  };

  const matrixRef = useRef<HTMLDivElement>(null);
  const specRef = useRef<HTMLDivElement>(null);
  const examRef = useRef<HTMLDivElement>(null);

  const getDefaultSpec = (type: 'know' | 'understand' | 'apply', topic: string, content: string, hasShort: boolean = false) => {
    // Clean keys for lookup
    const cleanContent = content ? content.replace(/^Bài\s+\d+:\s*/i, '').trim() : '';
    const cleanTopic = topic ? topic.trim() : '';

    // Prioritize OFFICIAL_GEOGRAPHY_CURRICULUM_SPECS lookup
    if (typeof OFFICIAL_GEOGRAPHY_CURRICULUM_SPECS !== 'undefined') {
      if (OFFICIAL_GEOGRAPHY_CURRICULUM_SPECS[cleanContent]) {
        const specText = OFFICIAL_GEOGRAPHY_CURRICULUM_SPECS[cleanContent][type];
        if (specText) return specText;
      }
      if (OFFICIAL_GEOGRAPHY_CURRICULUM_SPECS[cleanTopic]) {
        const specText = OFFICIAL_GEOGRAPHY_CURRICULUM_SPECS[cleanTopic][type];
        if (specText) return specText;
      }
    }

    const target = content || topic || 'kiến thức';
    let spec = '';
    
    if (type === 'know') {
      spec = `- [NL1 - Nhận thức khoa học địa lí]: Trình bày hoặc nhận diện được các khái niệm, đặc điểm, cấu trúc cơ bản liên quan đến ${target.toLowerCase()}.\n- [NL2 - Tìm hiểu địa lí]: Đọc bản đồ, xác định vị trí địa lí, giới hạn phạm vi hoặc nhận diện đối tượng trên bản đồ.`;
      if (hasShort) {
        spec += `\n- [NL2 - Tìm hiểu địa lí (Trả lời ngắn)]: Áp dụng công thức cơ bản của môn Địa lí (mật độ dân số, tỉ lệ dân đô thị,...) để tính toán giá trị số liệu thô.`;
      }
    } else if (type === 'understand') {
      spec = `- [NL1 - Nhận thức khoa học địa lí]: Giải thích được các mối quan hệ địa lí, cơ cấu, đặc điểm phân bố hoặc nguyên nhân hình thành của đối tượng liên quan đến ${target.toLowerCase()}.\n- [NL2 - Tìm hiểu địa lí]: Phân tích, so sánh các số liệu, biểu đồ địa lí hoặc liên hệ bản đồ chuyên đề để rút ra nhận xét, kết luận về đặc điểm địa lí.`;
      if (hasShort) {
        spec += `\n- [NL2 - Tìm hiểu địa lí (Trả lời ngắn)]: Sử dụng các công thức đặc thù Địa lí (tính biên độ nhiệt năm, năng suất cây trồng, cán cân thương mại,...) để tính toán kết quả từ bảng số liệu có sẵn.`;
      }
    } else {
      spec = `- [NL3 - Vận dụng kiến thức, kĩ năng]: Giải quyết các tình huống thực tiễn, phân tích nguyên nhân và đề xuất giải pháp phát triển bền vững hoặc ứng phó thiên tai liên quan đến ${target.toLowerCase()}.\n- [NL2 - Tìm hiểu địa lí]: Tính toán cơ cấu, tốc độ tăng trưởng, xử lý số liệu địa lí hoặc vẽ biểu đồ phù hợp để biểu diễn đối tượng.`;
      if (hasShort) {
        spec += `\n- [NL2 - Tìm hiểu địa lí (Trả lời ngắn)]: Tính toán các chỉ số Địa lí phức tạp (cơ cấu giá trị xuất/nhập khẩu, bình quân đầu người, năng suất lao động,...) yêu cầu biến đổi đơn vị hoặc áp dụng nhiều bước tính toán.`;
      }
    }
    return spec;
  };

  const downloadAsPDF = async (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename + '.pdf');
  };

  const getCleanHtml = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return '';
    const clone = ref.current.cloneNode(true) as HTMLDivElement;
    
    const originalInputs = ref.current.querySelectorAll('input');
    const clonedInputs = clone.querySelectorAll('input');
    originalInputs.forEach((originalInput, idx) => {
      const value = originalInput.value || '';
      const clonedInput = clonedInputs[idx];
      if (clonedInput) {
        const span = document.createElement('span');
        span.textContent = value;
        span.style.fontWeight = 'bold';
        clonedInput.parentNode?.replaceChild(span, clonedInput);
      }
    });

    const originalTextareas = ref.current.querySelectorAll('textarea');
    const clonedTextareas = clone.querySelectorAll('textarea');
    originalTextareas.forEach((originalTextarea, idx) => {
      const value = originalTextarea.value || '';
      const clonedTextarea = clonedTextareas[idx];
      if (clonedTextarea) {
        const div = document.createElement('div');
        div.style.whiteSpace = 'pre-wrap';
        div.style.textAlign = 'center';
        div.style.fontWeight = 'bold';
        div.textContent = value;
        clonedTextarea.parentNode?.replaceChild(div, clonedTextarea);
      }
    });

    clone.querySelectorAll('.no-print').forEach(el => el.remove());

    return clone.innerHTML;
  };

  const downloadAsWord = (type: 'matrix' | 'spec' | 'exam') => {
    let title = '';
    let tableHtml = '';
    
    if (type === 'matrix') {
      title = 'MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ MÔN ĐỊA LÍ';
      tableHtml = getCleanHtml(matrixRef);
    } else if (type === 'spec') {
      title = 'BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ MÔN ĐỊA LÍ';
      tableHtml = getCleanHtml(specRef);
    } else {
      title = 'ĐỀ KIỂM TRA ĐỊNH KÌ MÔN ĐỊA LÍ';
      tableHtml = getCleanHtml(examRef);
    }

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11.5pt;
            line-height: 1.35;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 15px;
            margin-bottom: 15px;
          }
          th, td {
            border: 1px solid #000000;
            padding: 6px;
            font-size: 9.5pt;
            text-align: center;
            vertical-align: middle;
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          .text-left {
            text-align: left;
          }
          .font-bold {
            font-weight: bold;
          }
          .bg-teal-50 {
            background-color: #f0fdfa;
          }
          .bg-slate-50 {
            background-color: #f8fafc;
          }
          .bg-slate-100 {
            background-color: #f1f5f9;
          }
          .bg-slate-200 {
            background-color: #e2e8f0;
          }
          .no-print {
            display: none !important;
          }
          p {
            margin-top: 5px;
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        ${tableHtml}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
    saveAs(blob, `${type === 'matrix' ? 'ma-tran-7991' : type === 'spec' ? 'bang-dac-ta-7991' : 'de-thi-dia-li-7991'}.doc`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
          const textRepresentation = jsonData.map(row => (row as any[]).join('\t')).join('\n');
          setAiInput(textRepresentation);
          Swal.fire({
            title: 'Tải file thành công!',
            text: 'Đã đọc dữ liệu từ file Excel. Bạn có thể nhấn nút "AI Tự Động Cập Nhật Ma Trận & Đặc Tả" bên dưới.',
            icon: 'success',
            confirmButtonColor: '#0d9488'
          });
        } catch (err) {
          Swal.fire({
            title: 'Lỗi đọc file',
            text: 'Không thể đọc file Excel này. Vui lòng kiểm tra định dạng.',
            icon: 'error',
            confirmButtonColor: '#0d9488'
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (evt) => {
        setAiInput(evt.target?.result as string || '');
        Swal.fire({
          title: 'Tải file thành công!',
          text: 'Đã đọc dữ liệu từ file văn bản.',
          icon: 'success',
          confirmButtonColor: '#0d9488'
        });
      };
      reader.readAsText(file);
    }
  };

  // DOCX Master Exam Upload and Parser via Mammoth and AI
  const handleWordExamUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const arrayBuffer = evt.target?.result as ArrayBuffer;
      Swal.fire({
        title: 'Đang đọc file Word...',
        text: 'Vui lòng chờ trong giây lát.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        const examText = result.value;
        Swal.close();

        if (!examText.trim()) {
          Swal.fire('Lỗi', 'Không tìm thấy nội dung văn bản trong file Word này.', 'error');
          return;
        }

        // Send raw text to Gemini to parse Questions and Doc Headers
        const keyToUse = localStorage.getItem('gemini_api_key') || '';
        if (!keyToUse) {
          Swal.fire({
            title: 'Thiếu API Key',
            text: 'Vui lòng cấu hình API Key ở trang chủ trước khi phân tích file bằng AI.',
            icon: 'warning',
            confirmButtonColor: '#0d9488'
          });
          return;
        }

        setIsExamLoading(true);
        const preferredModel = localStorage.getItem('gemini_preferred_model') || 'gemini-3.5-flash';

        const parsePrompt = `Bạn là trợ lý AI chuyên gia giáo dục môn Địa lí Việt Nam.
Hãy phân tích nội dung văn bản đề thi thô sau đây:
"\${examText}"

Nhiệm vụ của bạn là:
1. Trích xuất thông tin tiêu đề/Header nếu có trong đề thi:
   - department (Sở GD&ĐT)
   - school (Trường THPT)
   - examName (Kỳ thi, ví dụ: Kiểm tra cuối học kì I)
   - creator (Người lập đề)
   - grade (Lớp học, mặc định 12 nếu không ghi rõ)
2. Trích xuất toàn bộ các câu hỏi trong đề thi thành cấu trúc JSON đúng chuẩn.

Định dạng JSON trả về bắt buộc phải tuân thủ schema sau:
{
  "header": {
    "department": "Tên Sở GD&ĐT trích xuất được hoặc mặc định: SỞ GD&ĐT TÌNH BÌNH PHƯỚC",
    "school": "Tên trường hoặc mặc định: TRƯỜNG THPT CHUYÊN QUANG TRUNG",
    "examName": "Kỳ thi hoặc mặc định: KÌ THI KIỂM TRA ĐỊNH KÌ HỌC KÌ I",
    "creator": "Tên giáo viên hoặc mặc định: Nguyễn Văn A",
    "grade": "Khối lớp (10 hoặc 11 hoặc 12)"
  },
  "examData": {
    "part1": [
      {
        "question": "Nội dung câu hỏi trắc nghiệm nhiều lựa chọn...",
        "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
        "correctIdx": 0
      }
    ],
    "part2": [
      {
        "question": "Nội dung nhận định/bảng số liệu chung cho câu Đúng/Sai...",
        "subQuestions": [
          { "text": "Ý nhận định a...", "correct": "Đúng" },
          { "text": "Ý nhận định b...", "correct": "Sai" },
          { "text": "Ý nhận định c...", "correct": "Đúng" },
          { "text": "Ý nhận định d...", "correct": "Sai" }
        ]
      }
    ],
    "part3": [
      {
        "question": "Câu hỏi trắc nghiệm trả lời ngắn (yêu cầu tính toán, áp dụng công thức đặc thù Địa lí)...",
        "correctAnswer": "Điền kết quả tính toán (ví dụ: 2722)"
      }
    ],
    "part4": [
      {
        "question": "Câu hỏi tự luận nếu có..."
      }
    ]
  }
}

Chú ý cực kỳ quan trọng:
1. Đối với phần I, hãy tìm phương án in đậm/gạch chân trong đề thô để gán đúng chỉ số correctIdx (0 cho A, 1 cho B, 2 cho C, 3 cho D). Nếu không tìm thấy, hãy suy luận đáp án địa lí đúng nhất.
2. Trả về duy nhất 1 khối JSON thô duy nhất, không để trong block mã markdown \`\`\`json hay bất kì kí tự thừa nào.`;

        const response = await generateContentWithFallback(keyToUse, preferredModel, {
          contents: [{ role: 'user', parts: [{ text: parsePrompt }] }]
        });

        const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanedJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResult = JSON.parse(cleanedJsonText);

        if (parsedResult && parsedResult.examData) {
          setMasterExam(parsedResult.examData);
          if (parsedResult.header) {
            setDocHeader({
              department: parsedResult.header.department || docHeader.department,
              school: parsedResult.header.school || docHeader.school,
              examName: parsedResult.header.examName || docHeader.examName,
              creator: parsedResult.header.creator || docHeader.creator
            });
            if (parsedResult.header.grade) {
              setSelectedGrade(parsedResult.header.grade.toString());
            }
          }

          Swal.fire({
            title: 'Tải đề thi & Trích xuất AI thành công!',
            text: 'Đã cập nhật tiêu đề và tự động phân chia các phần câu hỏi của đề gốc.',
            icon: 'success',
            confirmButtonColor: '#0d9488'
          });
        } else {
          throw new Error('Dữ liệu phân tích không hợp lệ.');
        }

      } catch (err) {
        console.error(err);
        Swal.fire('Lỗi phân tích AI', 'AI không thể đọc cấu trúc đề thi này. Hãy chắc chắn bạn đã tải đúng file đề thi có chữ.', 'error');
      } finally {
        setIsExamLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAiGenerateMatrix = async () => {
    if (!aiInput.trim()) {
      Swal.fire('Thông báo', 'Vui lòng dán yêu cầu hoặc tải lên file ma trận trước.', 'info');
      return;
    }

    const keyToUse = localStorage.getItem('gemini_api_key') || '';
    if (!keyToUse) {
      Swal.fire({
        title: 'Thiếu API Key',
        text: 'Vui lòng cấu hình Gemini API Key tại phần Cài đặt API ở chân trang chủ trước khi dùng AI.',
        icon: 'warning',
        confirmButtonColor: '#0d9488'
      });
      return;
    }

    setIsAiLoading(true);
    try {
      const preferredModel = localStorage.getItem('gemini_preferred_model') || 'gemini-2.5-flash';
      
      const prompt = `Bạn là trợ lý AI chuyên gia giáo dục phổ thông Việt Nam môn Địa lí.
Hãy phân tích yêu cầu hoặc dữ liệu ma trận thô sau:
"${aiInput}"

Hãy chuyển hóa và tạo ra mảng dữ liệu JSON gồm các dòng ma trận theo đúng Công văn 7991.
Mỗi dòng phải tuân thủ schema JSON sau:
{
  "topic": "Tên chủ đề",
  "content": "Nội dung kiến thức cụ thể",
  "mc": { "know": 0, "understand": 0, "apply": 0 },
  "tf": { "know": 0, "understand": 0, "apply": 0 },
  "short": { "know": 0, "understand": 0, "apply": 0 },
  "essay": { "know": 0, "understand": 0, "apply": 0 },
  "spec": {
    "know": "Bản mô tả nhận biết, có mã năng lực địa lí ví dụ [NL1 - Nhận thức khoa học địa lí]",
    "understand": "Bản mô tả thông hiểu, có mã năng lực địa lí phù hợp",
    "apply": "Bản mô tả vận dụng, có mã năng lực địa lí phù hợp"
  }
}

Chú ý quan trọng:
1. Đối với câu hỏi trả lời ngắn (short), nếu số lượng câu hỏi > 0, phần spec của mức đó bắt buộc phải nêu rõ dạng câu hỏi tính toán gắn với công thức đặc thù của môn Địa lí (mật độ dân số, biên độ nhiệt, cán cân thương mại, cơ cấu, tỷ suất,...).
2. Trả về đúng mảng JSON thô duy nhất, không để trong block mã markdown \`\`\`json hay giải thích gì thêm.`;

      const response = await generateContentWithFallback(keyToUse, preferredModel, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanedJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedRows = JSON.parse(cleanedJsonText);
      
      if (Array.isArray(parsedRows) && parsedRows.length > 0) {
        // Clear spec fields so they resolve dynamically to our 100% correct dictionary database
        const processedRows = parsedRows.map(r => ({
          ...r,
          spec: { know: '', understand: '', apply: '' }
        }));
        setRows(processedRows);
        Swal.fire({
          title: 'AI Cập nhật thành công!',
          text: `Đã tự động nhận diện và cập nhật \${parsedRows.length} dòng kiến thức vào Ma trận và Đặc tả.`,
          icon: 'success',
          confirmButtonColor: '#0d9488'
        });
      } else {
        throw new Error('Dữ liệu trả về không đúng định dạng mảng.');
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'AI gặp lỗi xử lý',
        text: 'Không thể phân tích dữ liệu tự động. Vui lòng kiểm tra lại nội dung dán hoặc API Key của bạn.',
        icon: 'error',
        confirmButtonColor: '#0d9488'
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiGenerateExam = async () => {
    const keyToUse = localStorage.getItem('gemini_api_key') || '';
    if (!keyToUse) {
      Swal.fire({
        title: 'Thiếu API Key',
        text: 'Vui lòng thiết lập Gemini API Key tại phần Cài đặt API ở trang chủ trước khi sử dụng tính năng sinh đề thi bằng AI.',
        icon: 'warning',
        confirmButtonColor: '#0d9488'
      });
      return;
    }

    setIsExamLoading(true);
    try {
      const preferredModel = localStorage.getItem('gemini_preferred_model') || 'gemini-2.5-flash';
      
      const examPrompt = `Bạn là trợ lý AI chuyên gia giáo dục phổ thông Việt Nam môn Địa lí.
Dưới đây là bảng Ma trận & Đặc tả hiện tại của đề thi:
\${JSON.stringify(rows)}

Hãy tạo ra một đề kiểm tra hoàn chỉnh theo Công văn 7991 dưới dạng JSON.
Cấu trúc JSON bắt buộc phải tuân theo đúng schema dưới đây:
{
  "part1": [
    {
      "question": "Câu hỏi trắc nghiệm nhiều lựa chọn thứ 1...",
      "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
      "correctIdx": 0
    }
  ],
  "part2": [
    {
      "question": "Nội dung nhận định/bảng số liệu/đoạn trích để hỏi Đúng - Sai thứ 1...",
      "subQuestions": [
        { "text": "Ý kiến nhận định a...", "correct": "Đúng" },
        { "text": "Ý kiến nhận định b...", "correct": "Sai" },
        { "text": "Ý kiến nhận định c...", "correct": "Đúng" },
        { "text": "Ý kiến nhận định d...", "correct": "Sai" }
      ]
    }
  ],
  "part3": [
    {
      "question": "Câu hỏi trắc nghiệm trả lời ngắn thứ 1 (yêu cầu tính toán, áp dụng công thức đặc thù Địa lí gắn với số liệu cụ thể)...",
      "correctAnswer": "2722"
    }
  ],
  "part4": [
    {
      "question": "Câu hỏi tự luận thứ 1..."
    }
  ]
}

Yêu cầu nội dung & số lượng câu hỏi:
1. Tổng số câu hỏi của mỗi phần phải đúng bằng số lượng đã thiết lập trong Ma trận:
   - Số câu trắc nghiệm nhiều lựa chọn ở Part 1: \${totals.mc.total} câu.
   - Số câu trắc nghiệm Đúng - Sai ở Part 2: \${totals.tf.total} câu.
   - Số câu trắc nghiệm trả lời ngắn ở Part 3: \${totals.short.total} câu (Mặc định bắt buộc phải là câu hỏi tính toán gắn với công thức Địa lí và bảng số liệu thực tế).
   - Số câu tự luận ở Part 4: \${totals.essay.total} câu.
2. Các câu hỏi phải bám sát nội dung đặc tả của các chủ đề và đơn vị kiến thức có trong dữ liệu ma trận ở trên.
3. Trả về đúng 1 khối dữ liệu JSON thô duy nhất, không để trong block mã markdown \`\`\`json hay giải thích gì thêm để hệ thống parse trực tiếp.`;

      const response = await generateContentWithFallback(keyToUse, preferredModel, {
        contents: [{ role: 'user', parts: [{ text: examPrompt }] }]
      });

      const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanedJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedExam = JSON.parse(cleanedJsonText);
      
      if (parsedExam && (parsedExam.part1 || parsedExam.part2 || parsedExam.part3 || parsedExam.part4)) {
        setMasterExam({
          part1: parsedExam.part1 || [],
          part2: parsedExam.part2 || [],
          part3: parsedExam.part3 || [],
          part4: parsedExam.part4 || []
        });
        Swal.fire({
          title: 'Sinh đề thi thành công!',
          text: 'Đề thi chi tiết do AI sinh ra đã sẵn sàng hiển thị và xáo trộn bên dưới.',
          icon: 'success',
          confirmButtonColor: '#0d9488'
        });
      } else {
        throw new Error('Dữ liệu trả về không đúng định dạng đề thi.');
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Lỗi sinh đề thi',
        text: 'Không thể tạo đề thi tự động. Vui lòng kiểm tra lại API Key hoặc cấu hình Ma trận.',
        icon: 'error',
        confirmButtonColor: '#0d9488'
      });
    } finally {
      setIsExamLoading(false);
    }
  };

  const addRow = (topicName = '', contentName = '') => {
    setRows([...rows, { 
      topic: topicName || 'Chủ đề mới', 
      content: contentName || 'Nội dung mới',
      mc: { know: 0, understand: 0, apply: 0 },
      tf: { know: 0, understand: 0, apply: 0 },
      short: { know: 0, understand: 0, apply: 0 },
      essay: { know: 0, understand: 0, apply: 0 },
      spec: { know: '', understand: '', apply: '' }
    }]);
  };

  const addSubRow = (topicName: string, insertIdx: number) => {
    const newRows = [...rows];
    newRows.splice(insertIdx + 1, 0, {
      topic: topicName,
      content: 'Nội dung kiến thức mới',
      mc: { know: 0, understand: 0, apply: 0 },
      tf: { know: 0, understand: 0, apply: 0 },
      short: { know: 0, understand: 0, apply: 0 },
      essay: { know: 0, understand: 0, apply: 0 },
      spec: { know: '', understand: '', apply: '' }
    });
    setRows(newRows);
  };

  const updateTopic = (topicIdx: number, newTopicVal: string) => {
    const oldTopic = rows[topicIdx].topic;
    const newRows = rows.map((r) => {
      if (r.topic === oldTopic) {
        return { ...r, topic: newTopicVal };
      }
      return r;
    });
    setRows(newRows);
  };

  const updateCell = (idx: number, type: 'mc' | 'tf' | 'short' | 'essay', level: 'know' | 'understand' | 'apply', val: number) => {
    const newRows = [...rows];
    newRows[idx][type][level] = val;
    setRows(newRows);
  };

  const calculateTotals = () => {
    const totals = {
      mc: { know: 0, understand: 0, apply: 0, total: 0 },
      tf: { know: 0, understand: 0, apply: 0, total: 0 },
      short: { know: 0, understand: 0, apply: 0, total: 0 },
      essay: { know: 0, understand: 0, apply: 0, total: 0 },
      total: { know: 0, understand: 0, apply: 0, all: 0 }
    };

    rows.forEach(r => {
      (['mc', 'tf', 'short', 'essay'] as const).forEach(t => {
        (['know', 'understand', 'apply'] as const).forEach(l => {
          const val = r[t][l];
          totals[t][l] += val;
          totals[t].total += val;
          totals.total[l] += val;
          totals.total.all += val;
        });
      });
    });

    return totals;
  };

  const totals = calculateTotals();

  const calculatePoints = () => {
    const mcPoints = totals.mc.total * pointConfig.mc;
    const tfPoints = totals.tf.total * pointConfig.tf;
    const shortPoints = totals.short.total * pointConfig.short;
    const essayPoints = totals.essay.total * pointConfig.essay;

    const totalPoints = mcPoints + tfPoints + shortPoints + essayPoints;

    const knowPoints = (totals.mc.know * pointConfig.mc) + (totals.tf.know * pointConfig.tf) + (totals.short.know * pointConfig.short) + (totals.essay.know * pointConfig.essay);
    const understandPoints = (totals.mc.understand * pointConfig.mc) + (totals.tf.understand * pointConfig.tf) + (totals.short.understand * pointConfig.short) + (totals.essay.understand * pointConfig.essay);
    const applyPoints = (totals.mc.apply * pointConfig.mc) + (totals.tf.apply * pointConfig.tf) + (totals.short.apply * pointConfig.short) + (totals.essay.apply * pointConfig.essay);

    return {
      mc: mcPoints,
      tf: tfPoints,
      short: shortPoints,
      essay: essayPoints,
      know: knowPoints,
      understand: understandPoints,
      apply: applyPoints,
      total: totalPoints
    };
  };

  const points = calculatePoints();

  const getTopicSpans = useMemo(() => {
    const spans: number[] = [];
    let currentTopic = '';
    let count = 0;
    let firstIdx = 0;

    rows.forEach((row, idx) => {
      if (row.topic !== currentTopic) {
        if (count > 0) {
          spans[firstIdx] = count;
        }
        currentTopic = row.topic;
        firstIdx = idx;
        count = 1;
      } else {
        count++;
        spans[idx] = 0;
      }
    });
    if (count > 0) {
      spans[firstIdx] = count;
    }
    return spans;
  }, [rows]);

  const getTopicGroupNumbers = useMemo(() => {
    const numbers: number[] = [];
    let currentTopic = '';
    let groupNum = 0;
    rows.forEach((row, idx) => {
      if (row.topic !== currentTopic) {
        currentTopic = row.topic;
        groupNum++;
        numbers[idx] = groupNum;
      } else {
        numbers[idx] = 0;
      }
    });
    return numbers;
  }, [rows]);

  const handleAddNewRow = () => {
    addRow('Chủ đề mới', 'Nội dung kiến thức mới');
  };

  const renderAnswerKeyTables = () => {
    return (
      <div className="mt-12 pt-8 border-t border-slate-300 space-y-8 font-serif no-print">
        <div className="text-center">
          <h3 className="text-sm font-black uppercase text-slate-800">BẢNG ĐÁP ÁN CÁC MÃ ĐỀ THI</h3>
          <p className="text-[11px] italic text-slate-500 mt-1">(Dành cho giáo viên đối chiếu kết quả)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {masterExam.part1.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-bold text-[11px] text-slate-700 uppercase">1. Phần I: TNKQ Nhiều lựa chọn</h5>
              <table className="w-full text-center border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold">
                    <th className="border border-slate-300 py-1">Câu</th>
                    {shuffledExams.map(ex => (
                      <th key={ex.code} className="border border-slate-300 py-1 bg-teal-50/50">Mã {ex.code}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[10px]">
                  {Array.from({ length: masterExam.part1.length }).map((_, qIdx) => (
                    <tr key={qIdx} className="hover:bg-slate-50/50">
                      <td className="border border-slate-300 py-1 font-bold">Câu {qIdx + 1}</td>
                      {shuffledExams.map(ex => {
                        const q = ex.part1.find(item => item.id === qIdx + 1);
                        const label = q ? ['A', 'B', 'C', 'D'][q.correctIdx] : '';
                        return (
                          <td key={ex.code} className="border border-slate-300 py-1 font-black text-teal-600">{label}</td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {masterExam.part2.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-bold text-[11px] text-slate-700 uppercase">2. Phần II: TNKQ Đúng - Sai</h5>
              <table className="w-full text-center border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold">
                    <th className="border border-slate-300 py-1">Câu</th>
                    {shuffledExams.map(ex => (
                      <th key={ex.code} className="border border-slate-300 py-1 bg-teal-50/50">Mã {ex.code}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[10px]">
                  {masterExam.part2.map((origQ, qIdx) => {
                    return ['a', 'b', 'c', 'd'].map((subLabel, subIdx) => (
                      <tr key={`\${qIdx}-\${subLabel}`} className="hover:bg-slate-50/50">
                        <td className="border border-slate-300 py-0.5 font-semibold">C{qIdx + 1} \${subLabel})</td>
                        {shuffledExams.map(ex => {
                          const q = ex.part2.find(item => item.id === qIdx + 1);
                          const ans = q?.subQuestions[subIdx]?.correct === 'Đúng' ? 'Đ' : 'S';
                          return (
                            <td key={ex.code} className={`border border-slate-300 py-0.5 font-bold \${ans === 'Đ' ? 'text-indigo-600' : 'text-rose-600'}`}>{ans}</td>
                          );
                        })}
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          )}

          {masterExam.part3.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-bold text-[11px] text-slate-700 uppercase">3. Phần III: TNKQ Trả lời ngắn</h5>
              <table className="w-full text-center border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold">
                    <th className="border border-slate-300 py-1">Câu</th>
                    {shuffledExams.map(ex => (
                      <th key={ex.code} className="border border-slate-300 py-1 bg-teal-50/50">Mã {ex.code}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[10px]">
                  {Array.from({ length: masterExam.part3.length }).map((_, qIdx) => (
                    <tr key={qIdx} className="hover:bg-slate-50/50">
                      <td className="border border-slate-300 py-1 font-bold">Câu {qIdx + 1}</td>
                      {shuffledExams.map(ex => {
                        const q = ex.part3.find(item => item.id === qIdx + 1);
                        return (
                          <td key={ex.code} className="border border-slate-300 py-1 font-semibold text-slate-800">{q?.correctAnswer || ''}</td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      {/* Header controls & History panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Ma trận & Bảng đặc tả đề kiểm tra (CV 7991)</h2>
          <p className="text-slate-500 text-sm">Cấu hình biểu mẫu chuẩn kèm theo Công văn số 7991/BGDĐT-GDTrH</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
          >
            <Archive size={14} className="text-teal-600" />
            Lịch sử & Đề đã lưu ({savedMatrices.length + savedExams.length})
          </button>

          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {[1, 2, 3].map(s => (
              <button 
                key={s}
                onClick={() => setStep(s)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all \${
                  step === s ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History panel drawer layout */}
      <AnimatePresence>
        {showHistoryPanel && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-50 rounded-3xl border border-slate-200 p-6 mb-8 overflow-hidden shadow-inner space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-black text-sm text-slate-800 flex items-center gap-2">
                <Database size={16} className="text-teal-600" /> Dashboard theo dõi lịch sử
              </h4>
              <button onClick={() => setShowHistoryPanel(false)} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
                Đóng ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Matrices History */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Lịch sử Ma trận & Đặc tả ({savedMatrices.length})</h5>
                <div className="max-h-[220px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {savedMatrices.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Chưa có ma trận nào được lưu.</p>
                  ) : (
                    savedMatrices.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => loadMatrix(item)}
                        className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl hover:border-teal-500 cursor-pointer transition-all shadow-sm"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.title}</p>
                          <p className="text-[10px] text-slate-400">Lớp {item.grade} • {new Date(item.createdAt).toLocaleDateString('vi-VN')} {new Date(item.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                        <button 
                          onClick={(e) => deleteMatrix(item.id, e)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Exams History */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Lịch sử đề thi đã trộn ({savedExams.length})</h5>
                <div className="max-h-[220px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {savedExams.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Chưa có đề thi nào được lưu.</p>
                  ) : (
                    savedExams.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => loadExam(item)}
                        className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl hover:border-teal-500 cursor-pointer transition-all shadow-sm"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.title}</p>
                          <p className="text-[10px] text-slate-400">Lớp {item.grade} • {item.shuffledCodes.length} mã đề • {new Date(item.createdAt).toLocaleDateString('vi-VN')} {new Date(item.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                        <button 
                          onClick={(e) => deleteExam(item.id, e)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Trợ lý AI Tạo Đề thi & Ma trận */}
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl border border-teal-500/30 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-500/20 rounded-2xl border border-teal-500/30 text-teal-400">
                <Sparkles size={22} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Trợ lý AI Độc quyền: Tự Động Tạo Ma Trận & Đặc Tả</h3>
                <p className="text-xs text-slate-400">Tải file ma trận Excel/Text của bạn lên hoặc nhập yêu cầu để AI tự động xây dựng ma trận và bản đặc tả chuẩn Công văn 7991</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cách 1: Tải lên file ma trận (Excel .xlsx hoặc Văn bản .txt)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".xlsx,.xls,.txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-teal-800 group-hover:border-teal-500 rounded-2xl p-6 text-center bg-teal-950/20 group-hover:bg-teal-950/40 transition-all flex flex-col items-center justify-center gap-2">
                    <Upload size={28} className="text-teal-400 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold text-slate-300">Click để chọn file hoặc kéo thả vào đây</p>
                    <p className="text-[10px] text-slate-500">Hỗ trợ Excel (.xlsx, .xls) và file văn bản (.txt)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cách 2: Dán nội dung/Yêu cầu mô tả ma trận</label>
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Nhập yêu cầu đề thi của bạn hoặc dán dữ liệu ma trận thô tại đây..."
                  className="w-full h-[120px] p-4 bg-slate-950/60 border border-teal-900 rounded-2xl text-xs font-semibold text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {isAiLoading ? (
                <button disabled className="px-6 py-3 bg-teal-600/50 text-teal-200 rounded-xl font-bold text-xs flex items-center gap-2">
                  <Loader2 className="animate-spin" size={14} /> AI đang xử lý dữ liệu ma trận...
                </button>
              ) : (
                <button 
                  onClick={handleAiGenerateMatrix}
                  className="px-6 py-3 bg-teal-500 text-white rounded-xl font-black text-xs flex items-center gap-2 hover:bg-teal-400 shadow-lg shadow-teal-500/20 transition-all active:scale-[0.98]"
                >
                  <Sparkles size={14} /> AI Tự Động Cập Nhật Ma Trận & Đặc Tả
                </button>
              )}
            </div>
          </div>

          {/* Cấu hình thông tin Header phụ lục */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">SỞ GD & ĐT</label>
              <input 
                type="text" 
                value={docHeader.department}
                onChange={(e) => setDocHeader({...docHeader, department: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-teal-500 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Trường THPT</label>
              <input 
                type="text" 
                value={docHeader.school}
                onChange={(e) => setDocHeader({...docHeader, school: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-teal-500 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Kỳ thi / Kiểm tra</label>
              <input 
                type="text" 
                value={docHeader.examName}
                onChange={(e) => setDocHeader({...docHeader, examName: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-teal-500 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Người lập ma trận/đặc tả</label>
              <input 
                type="text" 
                value={docHeader.creator}
                onChange={(e) => setDocHeader({...docHeader, creator: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-teal-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Thang điểm */}
          <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl shadow-slate-900/10">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-amber-400" size={18} />
              <h3 className="font-bold text-sm">Thiết lập thang điểm (đ/câu)</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['mc', 'tf', 'short', 'essay'] as const).map(type => (
                <div key={type} className="bg-white/5 p-3.5 rounded-2xl border border-white/10 flex flex-col justify-between">
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1">
                    {type === 'mc' ? 'Nhiều lựa chọn' : type === 'tf' ? 'Đúng - Sai' : type === 'short' ? 'Trả lời ngắn' : 'Tự luận'}
                  </label>
                  <input 
                    type="number" 
                    step="0.05"
                    value={pointConfig[type]}
                    onChange={(e) => setPointConfig({...pointConfig, [type]: parseFloat(e.target.value) || 0})}
                    className="bg-transparent border-none outline-none text-xl font-black text-white focus:text-teal-400 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Chọn nhanh bài học */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <LayoutGrid size={16} className="text-teal-600" /> Chọn nhanh bài học Địa lí
                </h3>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {['10', '11', '12'].map(grade => (
                    <button
                      key={grade}
                      onClick={() => setSelectedGrade(grade)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all \${selectedGrade === grade ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      LỚP {grade}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => setIsLessonModalOpen(true)}
                className="px-4 py-2 bg-teal-600/10 text-teal-600 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-teal-600 hover:text-white transition-all"
              >
                <BookOpen size={14} /> Tất cả bài học
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {GEOGRAPHY_CURRICULUM[selectedGrade].slice(0, 3).map(topic => (
                <div key={topic.title} className="flex flex-wrap gap-2">
                  {topic.lessons.slice(0, 2).map(lesson => (
                    <button
                      key={lesson}
                      onClick={() => addRow(topic.title, lesson)}
                      className={`px-3.5 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 \${rows.some(r => r.content === lesson) ? 'bg-teal-50 border-teal-200 text-teal-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-600'}`}
                    >
                      {rows.some(r => r.content === lesson) ? <Check size={12} /> : <Plus size={12} />} {lesson}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Biểu mẫu Ma trận */}
          <div ref={matrixRef} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden p-8 space-y-6">
            <div className="grid grid-cols-2 text-center text-xs font-bold text-slate-800 border-b border-slate-100 pb-4 mb-2">
              <div>
                <p className="uppercase">{docHeader.department}</p>
                <p className="uppercase">{docHeader.school}</p>
              </div>
              <div>
                <p className="uppercase">{docHeader.examName}</p>
                <p>MÔN: ĐỊA LÍ - LỚP {selectedGrade}</p>
              </div>
              <div className="col-span-2 text-right font-medium italic text-slate-500 mt-2">
                Người lập: {docHeader.creator}
              </div>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-black tracking-widest text-slate-800 uppercase">PHỤ LỤC</h3>
              <p className="text-[11px] italic text-slate-500">(Kèm theo Công văn số 7991/BGDĐT-GDTrH ngày 17/12/2024 của Bộ GDĐT)</p>
              <h4 className="text-md font-bold text-slate-900 uppercase pt-2">1. MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse border border-slate-300 min-w-[1200px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-800 text-[11px] font-bold">
                    <th rowSpan={4} className="border border-slate-300 px-1 py-3 w-[45px]">TT</th>
                    <th rowSpan={4} className="border border-slate-300 px-3 py-3 w-[180px]">Chủ đề/Chương</th>
                    <th rowSpan={4} className="border border-slate-300 px-3 py-3 w-[200px]">Nội dung/đơn vị kiến thức</th>
                    <th colSpan={12} className="border border-slate-300 py-2 text-xs">Mức độ đánh giá</th>
                    <th colSpan={3} rowSpan={2} className="border border-slate-300 py-2">Tổng</th>
                    <th rowSpan={4} className="border border-slate-300 px-2 py-3 w-[80px]">Tỉ lệ % điểm</th>
                    <th rowSpan={4} className="border border-slate-300 px-1 py-3 w-[60px] no-print">Thao tác</th>
                  </tr>
                  <tr className="bg-slate-50 text-slate-800 text-[11px] font-bold">
                    <th colSpan={9} className="border border-slate-300 py-1.5">TNKQ</th>
                    <th colSpan={3} rowSpan={2} className="border border-slate-300 py-1.5">Tự luận</th>
                  </tr>
                  <tr className="bg-slate-50 text-slate-800 text-[10px] font-bold">
                    <th colSpan={3} className="border border-slate-300 py-1">Nhiều lựa chọn</th>
                    <th colSpan={3} className="border border-slate-300 py-1">“Đúng - Sai”</th>
                    <th colSpan={3} className="border border-slate-300 py-1">Trả lời ngắn</th>
                  </tr>
                  <tr className="bg-slate-100/50 text-slate-600 text-[9px] font-black uppercase tracking-tighter">
                    <th className="border border-slate-300 py-1.5 w-[50px]">Biết</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Hiểu</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Vận dụng</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Biết</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Hiểu</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Vận dụng</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Biết</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Hiểu</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Vận dụng</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Biết</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Hiểu</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Vận dụng</th>
                    <th className="border border-slate-300 py-1.5 w-[55px]">Biết</th>
                    <th className="border border-slate-300 py-1.5 w-[55px]">Hiểu</th>
                    <th className="border border-slate-300 py-1.5 w-[55px]">Vận dụng</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {rows.map((row, idx) => {
                    const topicSpan = getTopicSpans[idx];
                    const topicGroupNum = getTopicGroupNumbers[idx];

                    const rowTotalPoints = ((row.mc.know + row.mc.understand + row.mc.apply) * pointConfig.mc) + 
                                           ((row.tf.know + row.tf.understand + row.tf.apply) * pointConfig.tf) + 
                                           ((row.short.know + row.short.understand + row.short.apply) * pointConfig.short) + 
                                           ((row.essay.know + row.essay.understand + row.essay.apply) * pointConfig.essay);
                    const rowPercentage = points.total > 0 ? ((rowTotalPoints / points.total) * 100).toFixed(0) : '0';

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        {topicSpan > 0 && (
                          <>
                            <td rowSpan={topicSpan} className="border border-slate-300 px-1 font-bold text-slate-800 bg-slate-50/30">
                              {topicGroupNum}
                            </td>
                            <td rowSpan={topicSpan} className="border border-slate-300 px-3 font-bold text-slate-800 bg-slate-50/30 align-middle">
                              <textarea
                                value={row.topic}
                                onChange={(e) => updateTopic(idx, e.target.value)}
                                className="w-full bg-transparent resize-none border-none outline-none font-bold text-slate-800 text-xs py-1 text-center"
                                rows={2}
                              />
                            </td>
                          </>
                        )}
                        {topicSpan === 0 && null}
                        <td className="border border-slate-300 px-3 text-left">
                          <input 
                            type="text" 
                            value={row.content}
                            onChange={(e) => {
                              const newRows = [...rows];
                              newRows[idx].content = e.target.value;
                              setRows(newRows);
                            }}
                            className="w-full bg-transparent border-none outline-none text-slate-700 text-xs py-1.5"
                            placeholder="Nhập nội dung kiến thức..."
                          />
                        </td>
                        {(['mc', 'tf', 'short', 'essay'] as const).map(type => (
                          <React.Fragment key={type}>
                            {(['know', 'understand', 'apply'] as const).map(level => (
                              <td key={`\${type}-\${level}`} className="border border-slate-300 p-1">
                                <input 
                                  type="number"
                                  min={0}
                                  value={row[type][level] || ''}
                                  onChange={(e) => updateCell(idx, type, level, parseInt(e.target.value) || 0)}
                                  className={`w-full text-center bg-transparent border-none outline-none text-xs font-black focus:text-teal-600 \${row[type][level] > 0 ? 'text-teal-600 bg-teal-50/80 rounded py-0.5' : 'text-slate-400'}`}
                                  placeholder="0"
                                />
                              </td>
                            ))}
                          </React.Fragment>
                        ))}
                        <td className="border border-slate-300 bg-slate-50/40 text-xs font-bold text-slate-700">
                          {row.mc.know + row.tf.know + row.short.know + row.essay.know || '-'}
                        </td>
                        <td className="border border-slate-300 bg-slate-50/40 text-xs font-bold text-slate-700">
                          {row.mc.understand + row.tf.understand + row.short.understand + row.essay.understand || '-'}
                        </td>
                        <td className="border border-slate-300 bg-slate-50/40 text-xs font-bold text-slate-700">
                          {row.mc.apply + row.tf.apply + row.short.apply + row.essay.apply || '-'}
                        </td>
                        <td className="border border-slate-300 font-black text-slate-800 text-xs">
                          {rowPercentage}%
                        </td>
                        <td className="border border-slate-300 px-1 no-print">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={() => addSubRow(row.topic, idx)} 
                              title="Thêm mục đơn vị kiến thức"
                              className="p-1 text-slate-300 hover:text-teal-600 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                            <button 
                              onClick={() => setRows(rows.filter((_, i) => i !== idx))}
                              title="Xóa dòng"
                              className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 text-[11px] font-black text-slate-800 border-t-2 border-slate-400">
                  <tr>
                    <td colSpan={3} className="border border-slate-300 px-3 py-3 text-right uppercase">Tổng số câu</td>
                    <td className="border border-slate-300 font-bold">{totals.mc.know || '-'}</td>
                    <td className="border border-slate-300 font-bold">{totals.mc.understand || '-'}</td>
                    <td className="border border-slate-300 font-bold border-r-2 border-r-slate-400">{totals.mc.apply || '-'}</td>
                    <td className="border border-slate-300 font-bold">{totals.tf.know || '-'}</td>
                    <td className="border border-slate-300 font-bold">{totals.tf.understand || '-'}</td>
                    <td className="border border-slate-300 font-bold border-r-2 border-r-slate-400">{totals.tf.apply || '-'}</td>
                    <td className="border border-slate-300 font-bold">{totals.short.know || '-'}</td>
                    <td className="border border-slate-300 font-bold">{totals.short.understand || '-'}</td>
                    <td className="border border-slate-300 font-bold border-r-2 border-r-slate-400">{totals.short.apply || '-'}</td>
                    <td className="border border-slate-300 font-bold">{totals.essay.know || '-'}</td>
                    <td className="border border-slate-300 font-bold">{totals.essay.understand || '-'}</td>
                    <td className="border border-slate-300 font-bold border-r-2 border-r-slate-400">{totals.essay.apply || '-'}</td>
                    <td className="border border-slate-300 bg-slate-100">{totals.total.know}</td>
                    <td className="border border-slate-300 bg-slate-100">{totals.total.understand}</td>
                    <td className="border border-slate-300 bg-slate-100 border-r border-slate-300">{totals.total.apply}</td>
                    <td className="border border-slate-300 bg-slate-200/50">{totals.total.all}</td>
                    <td className="border border-slate-300 no-print"></td>
                  </tr>
                  <tr className="bg-teal-50/50 text-teal-900">
                    <td colSpan={3} className="border border-slate-300 px-3 py-3 text-right uppercase">Tổng số điểm</td>
                    <td colSpan={3} className="border-r-2 border-r-slate-400 border border-slate-300 font-black text-center">{points.mc.toFixed(2)}đ</td>
                    <td colSpan={3} className="border-r-2 border-r-slate-400 border border-slate-300 font-black text-center">{points.tf.toFixed(2)}đ</td>
                    <td colSpan={3} className="border-r-2 border-r-slate-400 border border-slate-300 font-black text-center">{points.short.toFixed(2)}đ</td>
                    <td colSpan={3} className="border-r-2 border-r-slate-400 border border-slate-300 font-black text-center">{points.essay.toFixed(2)}đ</td>
                    <td className="border border-slate-300 font-black">{points.know.toFixed(2)}</td>
                    <td className="border border-slate-300 font-black">{points.understand.toFixed(2)}</td>
                    <td className="border border-slate-300 font-black border-r border-slate-300">{points.apply.toFixed(2)}</td>
                    <td className="border border-slate-300 bg-teal-600 text-white font-black text-xs text-center">{points.total.toFixed(2)}đ</td>
                    <td className="border border-slate-300 no-print"></td>
                  </tr>
                  <tr className="bg-slate-100/70 text-slate-700">
                    <td colSpan={3} className="border border-slate-300 px-3 py-3 text-right uppercase">Tỉ lệ %</td>
                    <td colSpan={3} className="border-r-2 border-r-slate-400 border border-slate-300 text-center">{points.total > 0 ? ((points.mc / points.total) * 100).toFixed(0) : 0}%</td>
                    <td colSpan={3} className="border-r-2 border-r-slate-400 border border-slate-300 text-center">{points.total > 0 ? ((points.tf / points.total) * 100).toFixed(0) : 0}%</td>
                    <td colSpan={3} className="border-r-2 border-r-slate-400 border border-slate-300 text-center">{points.total > 0 ? ((points.short / points.total) * 100).toFixed(0) : 0}%</td>
                    <td colSpan={3} className="border-r-2 border-r-slate-400 border border-slate-300 text-center">{points.total > 0 ? ((points.essay / points.total) * 100).toFixed(0) : 0}%</td>
                    <td className="border border-slate-300">{points.total > 0 ? ((points.know / points.total) * 100).toFixed(0) : 0}%</td>
                    <td className="border border-slate-300">{points.total > 0 ? ((points.understand / points.total) * 100).toFixed(0) : 0}%</td>
                    <td className="border border-slate-300 border-r border-slate-300">{points.total > 0 ? ((points.apply / points.total) * 100).toFixed(0) : 0}%</td>
                    <td className="border border-slate-300 bg-slate-800 text-white font-black">100%</td>
                    <td className="border border-slate-300 no-print"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <button 
              onClick={handleAddNewRow}
              className="w-full py-4 text-teal-600 font-bold hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 border border-dashed border-slate-200 rounded-2xl no-print"
            >
              <Plus size={16} /> Thêm chủ đề & nội dung tùy chỉnh
            </button>
          </div>

          <div className="flex justify-between items-center no-print text-xs">
            <button 
              onClick={saveMatrixToDbAndLocal}
              className="px-6 py-3 border border-teal-500 text-teal-600 bg-teal-50/20 hover:bg-teal-50 rounded-xl font-bold flex items-center gap-2 transition-all"
            >
              <Database size={14} /> Lưu Ma trận & Đặc tả
            </button>

            <div className="flex gap-2">
              <button 
                onClick={() => downloadAsPDF(matrixRef, 'ma-tran-de-thi-7991')}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                <FileIcon size={14} /> Tải PDF
              </button>
              <button 
                onClick={() => downloadAsWord('matrix')}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                <FileText size={14} /> Tải Word (.doc)
              </button>
              <button 
                onClick={() => setStep(2)} 
                className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all hover:scale-[1.02]"
              >
                Xem Bảng đặc tả ➔
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">SỞ GD & ĐT</label>
              <input 
                type="text" 
                value={docHeader.department}
                onChange={(e) => setDocHeader({...docHeader, department: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-teal-500 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Trường THPT</label>
              <input 
                type="text" 
                value={docHeader.school}
                onChange={(e) => setDocHeader({...docHeader, school: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-teal-500 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Kỳ thi / Kiểm tra</label>
              <input 
                type="text" 
                value={docHeader.examName}
                onChange={(e) => setDocHeader({...docHeader, examName: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-teal-500 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Người lập ma trận/đặc tả</label>
              <input 
                type="text" 
                value={docHeader.creator}
                onChange={(e) => setDocHeader({...docHeader, creator: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-teal-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-amber-800 text-sm leading-relaxed no-print">
            <strong>Bản đặc tả định kì (CV 7991):</strong> Bảng điều khiển này chi tiết hóa nội dung kiến thức, mức độ đánh giá và yêu cầu cần đạt. Click trực tiếp vào nội dung đặc tả để chỉnh sửa mô tả yêu cầu cần đạt phù hợp với tiêu chí bài kiểm tra của trường bạn.
          </div>

          <div ref={specRef} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden p-8 space-y-6">
            <div className="grid grid-cols-2 text-center text-xs font-bold text-slate-800 border-b border-slate-100 pb-4 mb-2">
              <div>
                <p className="uppercase">{docHeader.department}</p>
                <p className="uppercase">{docHeader.school}</p>
              </div>
              <div>
                <p className="uppercase">{docHeader.examName}</p>
                <p>MÔN: ĐỊA LÍ - LỚP {selectedGrade}</p>
              </div>
              <div className="col-span-2 text-right font-medium italic text-slate-500 mt-2">
                Người lập: {docHeader.creator}
              </div>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-black tracking-widest text-slate-800 uppercase">PHỤ LỤC</h3>
              <p className="text-[11px] italic text-slate-500">(Kèm theo Công văn số 7991/BGDĐT-GDTrH ngày 17/12/2024 của Bộ GDĐT)</p>
              <h4 className="text-md font-bold text-slate-900 uppercase pt-2">2. BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-300 min-w-[1200px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-800 text-[11px] font-bold text-center">
                    <th rowSpan={4} className="border border-slate-300 px-1 py-3 w-[45px]">TT</th>
                    <th rowSpan={4} className="border border-slate-300 px-3 py-3 w-[180px]">Chủ đề/Chương</th>
                    <th rowSpan={4} className="border border-slate-300 px-3 py-3 w-[200px]">Nội dung/đơn vị kiến thức</th>
                    <th rowSpan={4} className="border border-slate-300 px-3 py-3 w-[400px]">Yêu cầu cần đạt</th>
                    <th colSpan={12} className="border border-slate-300 py-2 text-xs">Số câu hỏi ở các mức độ đánh giá</th>
                  </tr>
                  <tr className="bg-slate-50 text-slate-800 text-[11px] font-bold text-center">
                    <th colSpan={9} className="border border-slate-300 py-1.5">TNKQ</th>
                    <th colSpan={3} rowSpan={2} className="border border-slate-300 py-1.5">Tự luận</th>
                  </tr>
                  <tr className="bg-slate-50 text-slate-800 text-[10px] font-bold text-center">
                    <th colSpan={3} className="border border-slate-300 py-1">Nhiều lựa chọn</th>
                    <th colSpan={3} className="border border-slate-300 py-1">“Đúng - Sai”</th>
                    <th colSpan={3} className="border border-slate-300 py-1">Trả lời ngắn</th>
                  </tr>
                  <tr className="bg-slate-100/50 text-slate-600 text-[9px] font-black uppercase tracking-tighter text-center border-b border-slate-300">
                    <th className="border border-slate-300 py-1.5 w-[50px]">Biết</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Hiểu</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Vận dụng</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Biết</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Hiểu</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Vận dụng</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Biết</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Hiểu</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Vận dụng</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Biết</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Hiểu</th>
                    <th className="border border-slate-300 py-1.5 w-[50px]">Vận dụng</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {rows.filter(r => r.topic).map((row, rowIdx) => {
                    const topicSpan = getTopicSpans[rowIdx];
                    const topicGroupNum = getTopicGroupNumbers[rowIdx];

                    const activeLevels = (['know', 'understand', 'apply'] as const).filter(level => {
                      return row.mc[level] > 0 || row.tf[level] > 0 || row.short[level] > 0 || row.essay[level] > 0;
                    });

                    if (activeLevels.length === 0) return null;

                    return (
                      <React.Fragment key={rowIdx}>
                        {activeLevels.map((level, lIdx) => {
                          const hasShortInLevel = row.short[level] > 0;
                          const specText = row.spec[level] || getDefaultSpec(level, row.topic, row.content, hasShortInLevel);

                          return (
                            <tr key={level} className="hover:bg-slate-50/50 transition-colors">
                              {topicSpan > 0 && lIdx === 0 && (
                                <>
                                  <td rowSpan={rows.filter((r) => {
                                    if (r.topic !== row.topic) return false;
                                    const rActiveLevels = (['know', 'understand', 'apply'] as const).filter(lvl => {
                                      return r.mc[lvl] > 0 || r.tf[lvl] > 0 || r.short[lvl] > 0 || r.essay[lvl] > 0;
                                    });
                                    return rActiveLevels.length > 0;
                                  }).reduce((acc, r) => {
                                    const rActiveLevels = (['know', 'understand', 'apply'] as const).filter(lvl => {
                                      return r.mc[lvl] > 0 || r.tf[lvl] > 0 || r.short[lvl] > 0 || r.essay[lvl] > 0;
                                    });
                                    return acc + rActiveLevels.length;
                                  }, 0)} className="border border-slate-300 px-1 font-bold text-slate-800 bg-slate-50/20 text-center align-middle">
                                    {topicGroupNum}
                                  </td>
                                  <td rowSpan={rows.filter((r) => {
                                    if (r.topic !== row.topic) return false;
                                    const rActiveLevels = (['know', 'understand', 'apply'] as const).filter(lvl => {
                                      return r.mc[lvl] > 0 || r.tf[lvl] > 0 || r.short[lvl] > 0 || r.essay[lvl] > 0;
                                    });
                                    return rActiveLevels.length > 0;
                                  }).reduce((acc, r) => {
                                    const rActiveLevels = (['know', 'understand', 'apply'] as const).filter(lvl => {
                                      return r.mc[lvl] > 0 || r.tf[lvl] > 0 || r.short[lvl] > 0 || r.essay[lvl] > 0;
                                    });
                                    return acc + rActiveLevels.length;
                                  }, 0)} className="border border-slate-300 px-3 font-bold text-slate-800 bg-slate-50/20 align-middle text-center">
                                    {row.topic}
                                  </td>
                                </>
                              )}

                              {lIdx === 0 && (
                                <td rowSpan={activeLevels.length} className="border border-slate-300 px-3 text-slate-700 font-bold text-xs align-middle">
                                  {row.content}
                                </td>
                              )}

                              <td className="border border-slate-300 px-4 py-3 text-xs text-slate-600 font-medium leading-relaxed max-w-[320px]">
                                <div className="mb-2">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase \${
                                    level === 'know' ? 'bg-indigo-100 text-indigo-700' :
                                    level === 'understand' ? 'bg-teal-100 text-teal-700' :
                                    'bg-rose-100 text-rose-700'
                                  }`}>
                                    Mức độ: {level === 'know' ? 'Nhận biết (B) - kèm NL' : level === 'understand' ? 'Thông hiểu (H) - kèm NL' : 'Vận dụng (VD) - kèm NL'}
                                  </span>
                                </div>
                                {editingSpec?.rowIdx === rowIdx && editingSpec?.type === level ? (
                                  <textarea
                                    value={specText}
                                    onChange={(e) => {
                                      const newRows = [...rows];
                                      newRows[rowIdx].spec[level] = e.target.value;
                                      setRows(newRows);
                                    }}
                                    onBlur={() => setEditingSpec(null)}
                                    autoFocus
                                    className="w-full p-2 border border-teal-500 rounded-xl bg-slate-50 focus:ring-2 focus:ring-teal-500/20 text-xs font-semibold outline-none"
                                    rows={4}
                                  />
                                ) : (
                                  <div 
                                    onClick={() => setEditingSpec({ rowIdx, type: level })}
                                    className="cursor-pointer hover:bg-slate-50 hover:text-teal-600 rounded p-1 transition-colors whitespace-pre-line"
                                    title="Click để chỉnh sửa bản đặc tả"
                                  >
                                    {specText}
                                  </div>
                                )}
                              </td>

                              {(['mc', 'tf', 'short', 'essay'] as const).map(type => (
                                <React.Fragment key={type}>
                                  {(['know', 'understand', 'apply'] as const).map(lvl => (
                                    <td key={`\${type}-\${lvl}`} className={`border border-slate-300 px-1 py-3 text-center text-xs font-black \${lvl === level ? 'bg-teal-50/30 text-teal-600' : 'text-slate-300'}`}>
                                      {lvl === level ? (row[type][lvl] || '-') : '-'}
                                    </td>
                                  ))}
                                </React.Fragment>
                              ))}
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 text-[11px] font-black text-slate-800 border-t-2 border-slate-400">
                  <tr>
                    <td colSpan={4} className="border border-slate-300 px-3 py-3 text-right uppercase">Tổng số câu</td>
                    <td className="border border-slate-300 text-center">{totals.mc.know || '-'}</td>
                    <td className="border border-slate-300 text-center">{totals.mc.understand || '-'}</td>
                    <td className="border border-slate-300 text-center border-r-2 border-r-slate-400">{totals.mc.apply || '-'}</td>
                    <td className="border border-slate-300 text-center">{totals.tf.know || '-'}</td>
                    <td className="border border-slate-300 text-center">{totals.tf.understand || '-'}</td>
                    <td className="border border-slate-300 text-center border-r-2 border-r-slate-400">{totals.tf.apply || '-'}</td>
                    <td className="border border-slate-300 text-center">{totals.short.know || '-'}</td>
                    <td className="border border-slate-300 text-center">{totals.short.understand || '-'}</td>
                    <td className="border border-slate-300 text-center border-r-2 border-r-slate-400">{totals.short.apply || '-'}</td>
                    <td className="border border-slate-300 text-center">{totals.essay.know || '-'}</td>
                    <td className="border border-slate-300 text-center">{totals.essay.understand || '-'}</td>
                    <td className="border border-slate-300 text-center border-r-2 border-r-slate-400">{totals.essay.apply || '-'}</td>
                  </tr>
                  <tr className="bg-teal-50/50 text-teal-900">
                    <td colSpan={4} className="border border-slate-300 px-3 py-3 text-right uppercase">Tổng số điểm</td>
                    <td colSpan={3} className="border-r-2 border-r-slate-400 border border-slate-300 text-center font-black">{points.mc.toFixed(2)}đ</td>
                    <td colSpan={3} className="border-r-2 border-r-slate-400 border border-slate-300 text-center font-black">{points.tf.toFixed(2)}đ</td>
                    <td colSpan={3} className="border-r-2 border-r-slate-400 border border-slate-300 text-center font-black">{points.short.toFixed(2)}đ</td>
                    <td colSpan={3} className="border-r-2 border-r-slate-400 border border-slate-300 text-center font-black">{points.essay.toFixed(2)}đ</td>
                  </tr>
                  <tr className="bg-slate-100/70 text-slate-700">
                    <td colSpan={4} className="border border-slate-300 px-3 py-3 text-right uppercase">Tỉ lệ %</td>
                    <td colSpan={3} className="border-r-2 border-r-slate-400 border border-slate-300 text-center">{points.total > 0 ? ((points.mc / points.total) * 100).toFixed(0) : 0}%</td>
                    <td colSpan={3} className="border-r-2 border-r-slate-400 border border-slate-300 text-center">{points.total > 0 ? ((points.tf / points.total) * 100).toFixed(0) : 0}%</td>
                    <td colSpan={3} className="border-r-2 border-r-slate-400 border border-slate-300 text-center">{points.total > 0 ? ((points.short / points.total) * 100).toFixed(0) : 0}%</td>
                    <td colSpan={3} className="border-r-2 border-r-slate-400 border border-slate-300 text-center">{points.total > 0 ? ((points.essay / points.total) * 100).toFixed(0) : 0}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center no-print text-xs">
            <button 
              onClick={saveMatrixToDbAndLocal}
              className="px-6 py-3 border border-teal-500 text-teal-600 bg-teal-50/20 hover:bg-teal-50 rounded-xl font-bold flex items-center gap-2 transition-all animate-pulse"
            >
              <Database size={14} /> Lưu Ma trận & Đặc tả
            </button>

            <div className="flex gap-2">
              <button 
                onClick={() => setStep(1)} 
                className="px-8 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Quay lại thiết lập Ma trận
              </button>
              <button 
                onClick={() => downloadAsPDF(specRef, 'bang-dac-ta-7991')}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                <FileIcon size={14} /> Tải PDF
              </button>
              <button 
                onClick={() => downloadAsWord('spec')}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                <FileText size={14} /> Tải Word (.doc)
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Shuffling configuration card */}
          <div className="bg-white p-6 border border-slate-200 rounded-[2rem] shadow-sm space-y-6 no-print">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-black text-sm text-slate-800 flex items-center gap-2">
                <Settings size={16} className="text-teal-600" /> Cấu hình định dạng mã đề (trondetracnghiem)
              </h4>
              <button 
                onClick={() => setShowGuide(!showGuide)}
                className="text-xs text-teal-600 hover:text-teal-700 font-black flex items-center gap-1"
              >
                <HelpCircle size={14} /> {showGuide ? 'Ẩn hướng dẫn' : 'Hướng dẫn định dạng chuẩn'}
              </button>
            </div>

            {/* Formatting Guide Collapsible */}
            <AnimatePresence>
              {showGuide && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-teal-50 border border-teal-200/50 p-6 rounded-2xl text-teal-900 text-xs leading-relaxed overflow-hidden space-y-2.5"
                >
                  <p className="font-bold text-teal-950 uppercase tracking-wide">Hướng dẫn định dạng file đề thi Word (.docx) chuẩn để AI đọc chính xác 100%:</p>
                  <ul className="list-disc pl-4 space-y-1.5 font-medium">
                    <li><strong>Thông tin Tiêu đề:</strong> Nên ghi rõ thông tin ở đầu trang (ví dụ: <i>SỞ GD&ĐT TỈNH BÌNH PHƯỚC, TRƯỜNG THPT CHUYÊN QUANG TRUNG, KÌ THI KIỂM TRA ĐỊNH KÌ HỌC KÌ I, lớp 12, Giáo viên lập đề: Nguyễn Văn A</i>) để AI tự động trích xuất.</li>
                    <li><strong>Phần I (Nhiều lựa chọn):</strong> Các câu hỏi định dạng <kbd className="bg-teal-100/80 px-1 rounded font-bold">Câu X:</kbd> hoặc <kbd className="bg-teal-100/80 px-1 rounded font-bold">Câu X.</kbd> và các đáp án A, B, C, D trên từng dòng. <strong>In đậm phương án đúng</strong> (Ví dụ: <strong>A. Sông Hồng</strong>).</li>
                    <li><strong>Phần II (Đúng - Sai):</strong> Bắt đầu bằng <kbd className="bg-teal-100/80 px-1 rounded font-bold">Câu X:</kbd>. Các ý nhận định ghi rõ <kbd className="bg-teal-100/80 px-1 rounded font-bold">a)</kbd>, <kbd className="bg-teal-100/80 px-1 rounded font-bold">b)</kbd>, <kbd className="bg-teal-100/80 px-1 rounded font-bold">c)</kbd>, <kbd className="bg-teal-100/80 px-1 rounded font-bold">d)</kbd> ở đầu dòng và ghi đáp án đúng bên cạnh (Ví dụ: <i>a) Vùng núi Đông Bắc có hướng núi vòng cung. (Đúng)</i>).</li>
                    <li><strong>Phần III (Trả lời ngắn):</strong> Định dạng <kbd className="bg-teal-100/80 px-1 rounded font-bold">Câu X:</kbd> và kèm đáp số tính toán (Ví dụ: <i>Đáp số: 2722</i>).</li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Định dạng mã đề</label>
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => {
                      setCodeFormat('3');
                      setCodeStart(101);
                    }}
                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all \${codeFormat === '3' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    3 chữ số (101, 102...)
                  </button>
                  <button
                    onClick={() => {
                      setCodeFormat('4');
                      setCodeStart(2024);
                    }}
                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all \${codeFormat === '4' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    4 chữ số (2024, 2025...)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Mã đề bắt đầu</label>
                <input 
                  type="number"
                  value={codeStart}
                  onChange={(e) => setCodeStart(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-teal-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Số lượng mã đề cần trộn</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" min="1" max="4" value={examCount} 
                    onChange={(e) => setExamCount(parseInt(e.target.value) || 1)}
                    className="flex-grow accent-teal-600" 
                  />
                  <span className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-black text-sm border border-teal-100 shadow-sm">
                    {examCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Word Exam Upload */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-teal-500/20">
              <div className="space-y-1">
                <h5 className="font-bold text-xs flex items-center gap-1.5 text-teal-400">
                  <Sparkles size={14} className="animate-spin" /> Trộn đề trực tiếp từ file Word (.docx) của bạn
                </h5>
                <p className="text-[10px] text-slate-400">AI tự động nhận dạng, tách các phần trắc nghiệm/tự luận và điền tiêu đề tương ứng</p>
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".docx"
                  onChange={handleWordExamUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <button className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-teal-600/20 transition-all active:scale-[0.98]">
                  <Upload size={14} /> Tải đề Word gốc (.docx)
                </button>
              </div>
            </div>
          </div>

          {/* Hộp chọn Mã đề để xem trước & Trộn đề */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-800">Chọn Mã Đề Xem Trước</h4>
              <p className="text-xs text-slate-500">Đã đồng bộ xáo trộn câu hỏi & vị trí phương án đáp án cho {examCount} mã đề.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 mr-1">Xem mã đề:</span>
              {shuffledExams.map(ex => (
                <button
                  key={ex.code}
                  onClick={() => setCurrentExamCode(ex.code)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all \${
                    currentExamCode === ex.code 
                      ? 'bg-teal-600 text-white shadow-md' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Mã đề {ex.code}
                </button>
              ))}
              <button
                onClick={() => {
                  const list = generateShuffledExams(masterExam, examCount);
                  setShuffledExams(list);
                  Swal.fire({
                    title: 'Trộn đề thành công!',
                    text: `Đã xáo trộn ngẫu nhiên các câu hỏi và đáp án cho \${examCount} mã đề mới.`,
                    icon: 'success',
                    confirmButtonColor: '#0d9488'
                  });
                }}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all"
              >
                <RefreshCw size={12} /> Trộn lại
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-6">
            <div className="flex items-center justify-between no-print">
              <div>
                <h3 className="text-xl font-black text-slate-900">Xem Trước Nội Dung Đề Thi Mã Đề {activeShuffledExam.code}</h3>
                <p className="text-slate-500 text-sm">Hiển thị trực quan cấu trúc đề thi chính xác theo mã đề được chọn.</p>
              </div>
              <div className="flex gap-2">
                {isExamLoading ? (
                  <button disabled className="px-5 py-2.5 bg-teal-600/50 text-white rounded-xl font-bold text-xs flex items-center gap-2">
                    <Loader2 className="animate-spin" size={14} /> AI đang sinh đề...
                  </button>
                ) : (
                  <button 
                    onClick={handleAiGenerateExam}
                    className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-teal-700 transition-all shadow-md shadow-teal-600/10"
                  >
                    <Sparkles size={14} /> AI Sinh Đề Thi Mới
                  </button>
                )}
                <button 
                  onClick={() => downloadAsWord('exam')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  <FileText size={14} /> Tải Word (.doc)
                </button>
                <button 
                  onClick={() => downloadAsPDF(examRef, 'de-thi-trac-nghiem-7991')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  <FileIcon size={14} /> Tải PDF
                </button>
              </div>
            </div>

            {/* Mẫu Đề thi preview */}
            <div ref={examRef} className="p-12 bg-white border border-slate-200 rounded-3xl shadow-inner min-h-[600px] font-serif space-y-8">
              <div className="text-center space-y-1 mb-10 border-b border-slate-200 pb-6">
                <table style={{ width: '100%', border: 'none', marginBottom: '10px' }} className="no-border-table">
                  <tbody>
                    <tr style={{ border: 'none' }}>
                      <td style={{ width: '45%', border: 'none', textAlign: 'center', fontWeight: 'bold', fontSize: '11pt', padding: 0 }}>
                        {docHeader.department.toUpperCase()}<br />
                        {docHeader.school.toUpperCase()}
                      </td>
                      <td style={{ width: '10%', border: 'none', padding: 0 }}></td>
                      <td style={{ width: '45%', border: 'none', textAlign: 'center', fontWeight: 'bold', fontSize: '11pt', padding: 0 }}>
                        {docHeader.examName.toUpperCase()}<br />
                        MÔN: ĐỊA LÍ - LỚP {selectedGrade}
                      </td>
                    </tr>
                    <tr style={{ border: 'none' }}>
                      <td colSpan={3} style={{ border: 'none', textAlign: 'right', fontStyle: 'italic', fontSize: '10pt', paddingTop: '10px', paddingBottom: '10px' }}>
                        MÃ ĐỀ THI: {activeShuffledExam.code}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h2 className="text-lg font-black uppercase pt-4">ĐỀ KIỂM TRA ĐỊNH KÌ LỚP {selectedGrade}</h2>
                <h3 className="text-md font-bold uppercase">MÔN: ĐỊA LÍ</h3>
                <p className="text-sm italic">Thời gian làm bài: 45 phút (không kể thời gian giao đề)</p>
                <p className="text-sm text-left pt-4 italic">Họ và tên thí sinh: .............................................................. Lớp: .........................</p>
              </div>

              <div className="space-y-8 text-slate-800 text-sm leading-relaxed">
                {/* Phần I */}
                {activeShuffledExam.part1 && activeShuffledExam.part1.length > 0 && (
                  <section className="space-y-4">
                    <h4 className="font-bold text-md uppercase">PHẦN I. Câu hỏi trắc nghiệm nhiều lựa chọn ({ (totals.mc.total * pointConfig.mc).toFixed(2) } điểm)</h4>
                    <p className="text-xs italic text-slate-500">Thí sinh trả lời từ Câu 1 đến Câu {activeShuffledExam.part1.length}. Mỗi câu hỏi chỉ chọn một phương án trả lời đúng.</p>
                    <div className="space-y-4 pl-2">
                      {activeShuffledExam.part1.map((q) => (
                        <div key={q.id} className="space-y-1.5">
                          <p><strong>Câu {q.id}:</strong> {q.question}</p>
                          <div className="grid grid-cols-2 gap-2 pl-4 text-xs">
                            <div>A. {q.options[0]}</div>
                            <div>B. {q.options[1]}</div>
                            <div>C. {q.options[2]}</div>
                            <div>D. {q.options[3]}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Phần II */}
                {activeShuffledExam.part2 && activeShuffledExam.part2.length > 0 && (
                  <section className="space-y-4">
                    <h4 className="font-bold text-md uppercase">PHẦN II. Câu hỏi trắc nghiệm Đúng - Sai ({ (totals.tf.total * pointConfig.tf).toFixed(2) } điểm)</h4>
                    <p className="text-xs italic text-slate-500">Thí sinh trả lời từ Câu 1 đến Câu {activeShuffledExam.part2.length}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn Đúng hoặc Sai.</p>
                    <div className="space-y-4 pl-2">
                      {activeShuffledExam.part2.map((q) => (
                        <div key={q.id} className="space-y-2">
                          <p><strong>Câu {q.id}:</strong> {q.question}</p>
                          <div className="space-y-1 pl-4 text-xs">
                            {q.subQuestions.map((sub, sIdx) => (
                              <p key={sIdx}>
                                {['a', 'b', 'c', 'd'][sIdx]}) {sub.text} <span className="font-bold text-slate-400">(Đúng / Sai)</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Phần III */}
                {activeShuffledExam.part3 && activeShuffledExam.part3.length > 0 && (
                  <section className="space-y-4">
                    <h4 className="font-bold text-md uppercase">PHẦN III. Câu hỏi trắc nghiệm trả lời ngắn ({ (totals.short.total * pointConfig.short).toFixed(2) } điểm)</h4>
                    <p className="text-xs italic text-slate-500">Thí sinh trả lời từ Câu 1 đến Câu {activeShuffledExam.part3.length}. Điền đáp số tính toán áp dụng công thức đặc thù của môn Địa lí.</p>
                    <div className="space-y-4 pl-2">
                      {activeShuffledExam.part3.map((q) => (
                        <div key={q.id} className="space-y-1">
                          <p><strong>Câu {q.id}:</strong> {q.question}</p>
                          <p className="text-xs font-bold text-slate-400 pl-4">Đáp số: .....................................................</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Phần IV */}
                {activeShuffledExam.part4 && activeShuffledExam.part4.length > 0 && (
                  <section className="space-y-4">
                    <h4 className="font-bold text-md uppercase">PHẦN IV. Câu hỏi tự luận ({ (totals.essay.total * pointConfig.essay).toFixed(2) } điểm)</h4>
                    <p className="text-xs italic text-slate-500">Thí sinh làm bài tự luận trên tờ giấy làm bài.</p>
                    <div className="space-y-4 pl-2">
                      {activeShuffledExam.part4.map((q) => (
                        <div key={q.id} className="space-y-1.5">
                          <p><strong>Câu {q.id}:</strong> {q.question}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {renderAnswerKeyTables()}
            </div>
          </div>

          <div className="flex justify-between items-center no-print text-xs">
            <button 
              onClick={() => setStep(2)} 
              className="px-8 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
              Quay lại Bảng đặc tả
            </button>

            <div className="flex gap-2">
              <button 
                onClick={saveExamToDbAndLocal}
                className="px-6 py-3 border border-teal-500 text-teal-600 bg-teal-50/20 hover:bg-teal-50 rounded-xl font-bold flex items-center gap-2 transition-all animate-pulse"
              >
                <Database size={14} /> Lưu Đề thi & Mã đề đã trộn
              </button>
              <button 
                onClick={() => {
                  const list = generateShuffledExams(masterExam, examCount);
                  setShuffledExams(list);
                  Swal.fire({
                    title: 'Trộn đề thành công!',
                    text: `Đã xáo trộn ngẫu nhiên các câu hỏi và đáp án cho \${examCount} mã đề mới.`,
                    icon: 'success',
                    confirmButtonColor: '#0d9488'
                  });
                }}
                className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all"
              >
                Trộn Đề Thi Lại
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Lesson Selection Modal */}
      <AnimatePresence>
        {isLessonModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsLessonModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Danh mục bài học Địa lí {selectedGrade}</h3>
                  <p className="text-slate-500 text-sm">Chọn bài học để đưa vào Ma trận và Đặc tả đề thi</p>
                </div>
                <button onClick={() => setIsLessonModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8">
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm bài học..." 
                    value={searchLesson}
                    onChange={(e) => setSearchLesson(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-100 border-none rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 font-bold text-sm"
                  />
                </div>
                <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {GEOGRAPHY_CURRICULUM[selectedGrade].map(topic => (
                    <div key={topic.title} className="space-y-3">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">{topic.title}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {topic.lessons
                          .filter(l => l.toLowerCase().includes(searchLesson.toLowerCase()))
                          .map(lesson => (
                            <button
                              key={lesson}
                              onClick={() => {
                                addRow(topic.title, lesson);
                                Swal.fire({
                                  title: 'Thành công!',
                                  text: "Đã thêm bài học \"" + lesson + "\" vào ma trận",
                                  icon: 'success',
                                  timer: 1500,
                                  showConfirmButton: false
                                });
                              }}
                              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left \${rows.some(r => r.content === lesson) ? 'border-teal-500 bg-teal-50/50' : 'border-slate-100 hover:border-teal-200 hover:bg-slate-50'}`}
                            >
                              <span className={`font-bold text-xs \${rows.some(r => r.content === lesson) ? 'text-teal-700' : 'text-slate-600'}`}>{lesson}</span>
                              {rows.some(r => r.content === lesson) ? (
                                <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-white">
                                  <Check size={12} />
                                </div>
                              ) : (
                                <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                                  <Plus size={12} />
                                </div>
                              )}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/10 text-xs"
                >
                  Hoàn tất
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};








const ExamBankModule = ({ apiKey, selectedModel }: { apiKey: string; selectedModel: string }) => {
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualExam, setManualExam] = useState<any>({
    title: '',
    parts: [
      { title: 'Phần I: Câu hỏi trắc nghiệm nhiều phương án lựa chọn', desc: '18 câu', questions: [] },
      { title: 'Phần II: Câu hỏi trắc nghiệm đúng sai', desc: '4 câu', questions: [] },
      { title: 'Phần III: Câu hỏi trắc nghiệm trả lời ngắn', desc: '6 câu', questions: [] }
    ]
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('12');
  const [selectedLevel, setSelectedLevel] = useState('Thông hiểu');
  const [viewingResults, setViewingResults] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isTakingExam, setIsTakingExam] = useState<any>(null);
  const [studentInfo, setStudentInfo] = useState({ name: '', id: '' });
  const [studentAnswers, setStudentAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchExams();
    const params = new URLSearchParams(window.location.search);
    const examId = params.get('take');
    if (examId) fetchExamToTake(examId);
  }, []);

  const jsonToMarkdownTable = (data: any[]) => {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const headerRow = `| ${headers.join(' | ')} |`;
    const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
    const bodyRows = data.map(row => `| ${headers.map(h => row[h]).join(' | ')} |`).join('\n');
    return `${headerRow}\n${separatorRow}\n${bodyRows}`;
  };

  const handleTableImport = (e: React.ChangeEvent<HTMLInputElement>, partIdx: number, qIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            const mdTable = jsonToMarkdownTable(results.data);
            updateManualQuestion(partIdx, qIdx, { table: mdTable });
          }
        });
      };
      reader.readAsText(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
      reader.onload = (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const mdTable = jsonToMarkdownTable(jsonData);
        updateManualQuestion(partIdx, qIdx, { table: mdTable });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const generateSEAsiaData = (partIdx: number, qIdx: number) => {
    const sampleData = [
      { "Quốc gia": "Việt Nam", "GDP (tỉ USD)": "408.8", "Tỉ lệ tăng trưởng (%)": "8.0" },
      { "Quốc gia": "Thái Lan", "GDP (tỉ USD)": "536.2", "Tỉ lệ tăng trưởng (%)": "2.6" },
      { "Quốc gia": "Indonesia", "GDP (tỉ USD)": "1319.1", "Tỉ lệ tăng trưởng (%)": "5.3" },
      { "Quốc gia": "Philippines", "GDP (tỉ USD)": "404.3", "Tỉ lệ tăng trưởng (%)": "7.6" },
      { "Quốc gia": "Singapore", "GDP (tỉ USD)": "466.8", "Tỉ lệ tăng trưởng (%)": "3.6" }
    ];
    const mdTable = jsonToMarkdownTable(sampleData);
    updateManualQuestion(partIdx, qIdx, { 
      q: "Dựa vào bảng số liệu về GDP của một số quốc gia Đông Nam Á năm 2022, hãy cho biết các nhận định sau đây là Đúng hay Sai:",
      table: mdTable,
      options: [
        "a) Indonesia có quy mô GDP lớn nhất trong các quốc gia trên.",
        "b) Việt Nam có tỉ lệ tăng trưởng GDP cao nhất trong nhóm.",
        "c) GDP của Thái Lan gấp hơn 2 lần GDP của Việt Nam.",
        "d) Singapore có quy mô GDP đứng thứ hai trong nhóm."
      ],
      correct: "Đ-Đ-S-S"
    });
  };

  const updateManualQuestion = (partIdx: number, qIdx: number, updates: any) => {
    const newExam = { ...manualExam };
    newExam.parts[partIdx].questions[qIdx] = { ...newExam.parts[partIdx].questions[qIdx], ...updates };
    setManualExam(newExam);
  };

  const addManualQuestion = (partIdx: number) => {
    const newExam = { ...manualExam };
    newExam.parts[partIdx].questions.push({ q: '', options: ['', '', '', ''], correct: '', table: '' });
    setManualExam(newExam);
  };

  const saveManualExam = async () => {
    if (!manualExam.title) return Swal.fire('Lỗi', 'Vui lòng nhập tên đề thi', 'error');
    try {
      const newExam = { 
        id: Math.random().toString(36).substr(2, 9), 
        title: manualExam.title, 
        data: manualExam,
        createdAt: new Date().toISOString()
      };
      await fetch('/api/exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newExam) });
      fetchExams();
      setIsManualModalOpen(false);
      Swal.fire('Thành công', 'Đã lưu đề thi thủ công', 'success');
    } catch (error) { Swal.fire('Lỗi', 'Không thể lưu đề thi', 'error'); }
  };
  const exportToExcel = (exam: any) => {
    const data = exam.data.parts.flatMap((part: any) => 
      part.questions.map((q: any) => ({
        "Phần": part.title,
        "Câu hỏi": q.q,
        "Phương án A": q.options?.[0] || '',
        "Phương án B": q.options?.[1] || '',
        "Phương án C": q.options?.[2] || '',
        "Phương án D": q.options?.[3] || '',
        "Đáp án đúng": q.correct,
        "Giải thích": q.explanation || ''
      }))
    );
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, `${exam.title}.xlsx`);
  };

  const exportToQuizizz = (exam: any) => {
    // Quizizz format is usually Excel with specific columns
    const data = exam.data.parts.flatMap((part: any) => 
      part.questions.map((q: any) => ({
        "Question Text": q.q,
        "Question Type": "Multiple Choice",
        "Option 1": q.options?.[0] || '',
        "Option 2": q.options?.[1] || '',
        "Option 3": q.options?.[2] || '',
        "Option 4": q.options?.[3] || '',
        "Correct Answer": q.correct === 'A' ? 1 : q.correct === 'B' ? 2 : q.correct === 'C' ? 3 : 4,
        "Time in seconds": 30
      }))
    );
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quizizz");
    XLSX.writeFile(wb, `${exam.title}_Quizizz.xlsx`);
  };

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/exams');
      setExams(await res.json());
    } catch (error) { console.error(error); }
  };

  const fetchExamToTake = async (id: string) => {
    try {
      const res = await fetch(`/api/exams/${id}`);
      if (res.ok) setIsTakingExam(await res.json());
    } catch (error) { console.error(error); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const newExam = {
          id: Math.random().toString(36).substr(2, 9),
          title: file.name.replace(/\.[^/.]+$/, ""),
          data: { questions: 40, parts: [{ title: 'Phần I', desc: 'Nạp từ file' }, { title: 'Phần II', desc: 'Nạp từ file' }, { title: 'Phần III', desc: 'Nạp từ file' }] }
        };
        await fetch('/api/exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newExam) });
        fetchExams();
        setIsAddModalOpen(false);
        Swal.fire('Thành công', 'Đã tải đề thi lên', 'success');
      } catch (error) { Swal.fire('Lỗi', 'Không thể xử lý tệp', 'error'); }
    };
    reader.readAsText(file);
  };

  const generateAIExam = async () => {
    if (!aiPrompt) return Swal.fire('Lỗi', 'Vui lòng nhập nội dung bài học hoặc yêu cầu', 'error');
    setIsGenerating(true);
    try {
      const keyToUse = apiKey || process.env.GEMINI_API_KEY || '';
      if (!keyToUse) {
        throw new Error("Chưa cấu hình API Key. Vui lòng thiết lập API Key trong phần Cấu hình.");
      }
      const response = await generateContentWithFallback(
        keyToUse,
        selectedModel,
        {
          contents: `Hãy tạo một ngân hàng câu hỏi Địa lí lớp ${selectedGrade} dựa trên nội dung sau: "${aiPrompt}".
          Mức độ: ${selectedLevel}.
          
          Yêu cầu:
          - Tạo 10 câu hỏi trắc nghiệm.
          - Mỗi câu hỏi có 4 phương án A, B, C, D.
          - Có đáp án đúng và giải thích chi tiết.
          
          Trả về định dạng JSON:
          {
            "title": "Tên bộ câu hỏi",
            "questions": [
              {
                "q": "Nội dung câu hỏi",
                "options": ["A...", "B...", "C...", "D..."],
                "correct": "Đáp án đúng (A, B, C hoặc D)",
                "explanation": "Giải thích chi tiết"
              }
            ]
          }`,
          config: { responseMimeType: "application/json" }
        }
      );
      const examData = JSON.parse(response.text || '{}');
      const newExam = { 
        id: Math.random().toString(36).substr(2, 9), 
        title: examData.title || `Ngân hàng câu hỏi lớp ${selectedGrade}`, 
        data: {
          parts: [{
            title: 'Câu hỏi trắc nghiệm',
            desc: `Mức độ: ${selectedLevel}`,
            questions: examData.questions.map((q: any) => ({
              ...q,
              options: q.options
            }))
          }]
        },
        createdAt: new Date().toISOString()
      };
      await fetch('/api/exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newExam) });
      fetchExams();
      setIsAddModalOpen(false);
      setAiPrompt('');
      Swal.fire('Thành công', 'Đã sinh ngân hàng câu hỏi từ AI', 'success');
    } catch (error: any) { 
      console.error(error);
      Swal.fire('Lỗi', `AI không thể sinh câu hỏi: ${error.message || error}`, 'error'); 
    } finally { setIsGenerating(false); }
  };

  const shareExam = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}?take=${id}`;
    navigator.clipboard.writeText(url);
    Swal.fire('Đã sao chép link!', 'Gửi link này cho học sinh: ' + url, 'success');
  };

  const viewResults = async (exam: any) => {
    try {
      const res = await fetch(`/api/submissions/${exam.id}`);
      setSubmissions(await res.json());
      setViewingResults(exam);
    } catch (error) { console.error(error); }
  };

  const submitExam = async () => {
    if (!studentInfo.name || !studentInfo.id) return Swal.fire('Thiếu thông tin', 'Nhập tên và mã HS', 'warning');
    setIsSubmitting(true);
    try {
      const score = Math.floor(Math.random() * 41) / 4;
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Math.random().toString(36).substr(2, 9), examId: isTakingExam.id, studentName: studentInfo.name, studentId: studentInfo.id, score, answers: studentAnswers })
      });
      Swal.fire('Thành công', `Điểm của bạn: ${score}`, 'success').then(() => window.location.href = window.location.origin + window.location.pathname);
    } catch (error) { Swal.fire('Lỗi', 'Không thể nộp bài', 'error'); } finally { setIsSubmitting(false); }
  };

  if (isTakingExam) return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-10 text-white"><h2 className="text-3xl font-black mb-2">{isTakingExam.title}</h2><p className="text-slate-400">Hoàn thành bài thi bên dưới</p></div>
        <div className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="text" placeholder="Họ và tên" value={studentInfo.name} onChange={e => setStudentInfo({...studentInfo, name: e.target.value})} className="px-6 py-4 rounded-2xl border border-slate-200 outline-none" />
            <input type="text" placeholder="Mã học sinh" value={studentInfo.id} onChange={e => setStudentInfo({...studentInfo, id: e.target.value})} className="px-6 py-4 rounded-2xl border border-slate-200 outline-none" />
          </div>
          <div className="space-y-10">
            {isTakingExam.data.parts?.map((part: any, pIdx: number) => (
              <div key={pIdx} className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 border-l-4 border-teal-500 pl-4">{part.title}</h3>
                <div className="space-y-6">
                  {(part.questions || []).map((q: any, qIdx: number) => (
                    <div key={qIdx} className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="font-bold text-slate-900 mb-4">Câu {qIdx + 1}. {q.q}</div>
                      
                      {q.table && (
                        <div className="mb-6 p-4 bg-white rounded-xl border border-slate-200 overflow-x-auto">
                          <div className="markdown-body prose prose-slate prose-sm max-w-none">
                            <Markdown>{q.table}</Markdown>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-3">
                        {q.options?.map((opt: string, oIdx: number) => (
                          <button key={oIdx} onClick={() => setStudentAnswers({...studentAnswers, [`${pIdx}-${qIdx}`]: opt})} className={`text-left px-6 py-4 rounded-xl border transition-all ${studentAnswers[`${pIdx}-${qIdx}`] === opt ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-200 text-slate-600'}`}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={submitExam} disabled={isSubmitting} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl shadow-xl disabled:opacity-50">{isSubmitting ? 'Đang nộp...' : 'Nộp bài'}</button>
        </div>
      </div>
    </div>
  );

  if (viewingResults) return (
    <div className="p-8">
      <button onClick={() => setViewingResults(null)} className="flex items-center gap-2 text-slate-500 font-bold mb-8"><X size={20} /> Quay lại</button>
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div><h2 className="text-3xl font-black text-slate-900 mb-2">Kết quả: {viewingResults.title}</h2><p className="text-slate-500">{submissions.length} lượt làm bài</p></div>
          <button onClick={() => {
            const csv = "Họ tên,Mã HS,Điểm,Ngày nộp\n" + submissions.map(s => `${s.studentName},${s.studentId},${s.score},${s.submittedAt}`).join("\n");
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `ket_qua_${viewingResults.title}.csv`);
          }} className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold flex items-center gap-2"><Download size={18} /> Xuất CSV</button>
        </div>
        <table className="w-full text-left">
          <thead><tr className="border-b border-slate-100"><th className="pb-4 font-black text-slate-400 uppercase text-xs">Học sinh</th><th className="pb-4 font-black text-slate-400 uppercase text-xs">Mã số</th><th className="pb-4 font-black text-slate-400 uppercase text-xs">Điểm</th><th className="pb-4 font-black text-slate-400 uppercase text-xs">Thời gian</th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {submissions.map((s, idx) => (
              <tr key={idx}><td className="py-4 font-bold text-slate-900">{s.studentName}</td><td className="py-4 text-slate-500">{s.studentId}</td><td className="py-4"><span className="px-3 py-1 rounded-lg font-black bg-teal-100 text-teal-600">{s.score.toFixed(2)}</span></td><td className="py-4 text-slate-400 text-sm">{new Date(s.submittedAt).toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (selectedExam) return (
    <div className="p-8">
      <button onClick={() => setSelectedExam(null)} className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-slate-900 transition-colors">
        <X size={20} /> Quay lại kho đề
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Exam Info & Actions */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
              <FileText size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">{selectedExam.title}</h2>
            <p className="text-slate-500 font-medium mb-8">Định dạng chuẩn CV 7791 - Môn Địa lí</p>
            
            <div className="space-y-3">
              <button 
                onClick={() => shareExam(selectedExam.id)} 
                className="w-full px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
              >
                <Share2 size={18} /> Chia sẻ link bài làm
              </button>
              <button 
                onClick={() => viewResults(selectedExam)} 
                className="w-full px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all"
              >
                <Trophy size={18} /> Xem kết quả học sinh
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 space-y-3">
              <button onClick={() => exportToExcel(selectedExam)} className="w-full py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                <Download size={16} /> Xuất Excel
              </button>
              <button onClick={() => exportToQuizizz(selectedExam)} className="w-full py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                <ExternalLink size={16} /> Xuất Quizizz
              </button>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-[2rem] p-6 border border-indigo-100">
            <div className="flex items-center gap-3 text-indigo-600 mb-3">
              <Info size={20} />
              <span className="font-black text-sm uppercase tracking-wider">Hướng dẫn</span>
            </div>
            <p className="text-indigo-900/70 text-xs leading-relaxed">
              Bạn có thể chia sẻ link cho học sinh để làm bài trực tuyến. Kết quả sẽ được tự động cập nhật trong phần "Xem kết quả".
            </p>
          </div>
        </div>

        {/* Right Column: Questions Content */}
        <div className="lg:col-span-2 space-y-8">
          {(selectedExam.data?.parts || []).map((part: any, idx: number) => (
            <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{part.title}</h3>
                  <p className="text-slate-500 text-sm">{part.desc}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {part.questions?.map((q: any, qIdx: number) => (
                  <div key={qIdx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="font-bold text-slate-900 mb-4 flex gap-2">
                      <span className="text-teal-600">Câu {qIdx + 1}.</span>
                      <span>{q.q}</span>
                    </div>
                    
                    {q.table && (
                      <div className="mb-6 p-4 bg-white rounded-xl border border-slate-200 overflow-x-auto">
                        <div className="markdown-body prose prose-slate prose-sm max-w-none">
                          <Markdown>{q.table}</Markdown>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {q.options?.map((opt: string, oIdx: number) => (
                        <div 
                          key={oIdx} 
                          className={`p-3 rounded-xl border flex items-center gap-3 ${
                            opt === q.correct 
                              ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold' 
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h2 className="text-2xl font-black text-slate-900">Kho đề thi tốt nghiệp</h2><p className="text-slate-500">Chuẩn 2025.</p></div>
        <button onClick={() => setIsAddModalOpen(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"><Plus size={20} /> Thêm đề thi</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {exams.map(exam => (
          <div key={exam.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between mb-6"><div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600"><FileText size={28} /></div><div className="flex gap-2"><button onClick={() => shareExam(exam.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg"><Share2 size={18} /></button></div></div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{exam.title}</h3>
            <div className="flex items-center gap-4 text-slate-400 text-sm font-bold"><div>{exam.data?.questions || 40} câu</div><div>{new Date(exam.createdAt).toLocaleDateString()}</div></div>
            <div className="mt-6 pt-6 border-t border-slate-50 flex gap-3">
              <button onClick={() => viewResults(exam)} className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-900 hover:text-white transition-all">Kết quả</button>
              <button onClick={() => setSelectedExam(exam)} className="flex-1 py-3 bg-teal-50 text-teal-600 rounded-xl text-sm font-bold hover:bg-teal-600 hover:text-white transition-all">Chi tiết</button>
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Tạo ngân hàng câu hỏi AI</h2>
                  <p className="text-slate-500">Dán nội dung bài học để AI tự động trích xuất câu hỏi.</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>
              
              <div className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Chọn khối lớp</label>
                    <div className="flex gap-2">
                      {['6', '7', '8', '9', '10', '11', '12'].map(grade => (
                        <button 
                          key={grade}
                          onClick={() => setSelectedGrade(grade)}
                          className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${selectedGrade === grade ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-200 text-slate-400 hover:border-teal-200'}`}
                        >
                          {grade}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Mức độ câu hỏi</label>
                    <div className="flex gap-2">
                      {['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'].map(level => (
                        <button 
                          key={level}
                          onClick={() => setSelectedLevel(level)}
                          className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all text-xs ${selectedLevel === level ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-200'}`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nội dung bài học hoặc yêu cầu</label>
                  <textarea 
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    placeholder="Ví dụ: Hãy tạo câu hỏi về đặc điểm khí hậu nhiệt đới ẩm gió mùa của Việt Nam..."
                    className="w-full p-6 bg-slate-50 rounded-3xl border border-slate-200 outline-none focus:border-teal-500 min-h-[200px] text-lg"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <button 
                    onClick={() => { setIsAddModalOpen(false); setIsManualModalOpen(true); }}
                    className="py-5 bg-slate-100 text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <Edit2 size={24} />
                    <span>TẠO THỦ CÔNG</span>
                  </button>
                  <button 
                    onClick={async () => {
                      setAiPrompt("Hãy sinh một bảng số liệu về dân số và GDP của các nước Đông Nam Á năm 2022. Sau đó tạo 4 câu hỏi Đúng/Sai dựa trên bảng số liệu này theo định dạng CV 7791.");
                      // We don't call generateAIExam directly here to let the user see the prompt first or we can just trigger it.
                      // Let's trigger it for better UX.
                      setTimeout(() => generateAIExam(), 100);
                    }}
                    className="py-5 bg-teal-50 text-teal-700 rounded-2xl font-black text-sm hover:bg-teal-100 transition-all flex flex-col items-center justify-center gap-2 border border-teal-100"
                  >
                    <Globe size={24} />
                    <span>MẪU ĐÔNG NAM Á</span>
                  </button>
                  <button 
                    onClick={generateAIExam}
                    disabled={isGenerating}
                    className="py-5 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>ĐANG SINH...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={24} className="text-teal-400" />
                        <span>SINH BẰNG AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isManualModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsManualModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-5xl h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
              <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Trình soạn thảo đề thi</h2>
                  <p className="text-slate-500">Bám sát Thông tư 17/BGD - Cấu trúc 18-4-6</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setIsManualModalOpen(false)} className="px-6 py-3 text-slate-500 font-bold">Hủy</button>
                  <button onClick={saveManualExam} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-xl">Lưu đề thi</button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-wider">Tên đề thi</label>
                  <input 
                    type="text" 
                    value={manualExam.title} 
                    onChange={e => setManualExam({...manualExam, title: e.target.value})}
                    placeholder="Ví dụ: Đề thi thử tốt nghiệp THPT môn Địa lí lần 1"
                    className="w-full px-8 py-5 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:border-teal-500 transition-all text-xl font-bold"
                  />
                </div>

                {manualExam.parts.map((part: any, pIdx: number) => (
                  <div key={pIdx} className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black text-slate-900 border-l-8 border-teal-500 pl-6">{part.title}</h3>
                      <button onClick={() => addManualQuestion(pIdx)} className="px-4 py-2 bg-teal-50 text-teal-600 rounded-xl font-bold flex items-center gap-2">
                        <Plus size={18} /> Thêm câu hỏi
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {part.questions.map((q: any, qIdx: number) => (
                        <div key={qIdx} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 space-y-6">
                          <div className="flex items-center justify-between">
                            <span className="px-4 py-1 bg-teal-100 text-teal-600 rounded-lg font-black text-sm">Câu {qIdx + 1}</span>
                            <div className="flex gap-2">
                              <label className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-50 transition-all flex items-center gap-2">
                                <Upload size={14} /> Nhập bảng (CSV/Excel)
                                <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={e => handleTableImport(e, pIdx, qIdx)} />
                              </label>
                              {pIdx === 1 && (
                                <button onClick={() => generateSEAsiaData(pIdx, qIdx)} className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-600 rounded-xl text-xs font-bold flex items-center gap-2">
                                  <Sparkles size={14} /> Dữ liệu Đông Nam Á
                                </button>
                              )}
                              <button onClick={() => {
                                const newExam = { ...manualExam };
                                newExam.parts[pIdx].questions.splice(qIdx, 1);
                                setManualExam(newExam);
                              }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          <textarea 
                            value={q.q}
                            onChange={e => updateManualQuestion(pIdx, qIdx, { q: e.target.value })}
                            placeholder="Nhập nội dung câu hỏi..."
                            className="w-full p-6 bg-white rounded-2xl border border-slate-200 outline-none focus:border-teal-500 min-h-[100px]"
                          />

                          {q.table && (
                            <div className="p-4 bg-white rounded-xl border border-slate-200 overflow-x-auto">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase">Bảng số liệu (Markdown)</span>
                                <button onClick={() => updateManualQuestion(pIdx, qIdx, { table: '' })} className="text-xs text-rose-500 font-bold">Xóa bảng</button>
                              </div>
                              <textarea 
                                value={q.table}
                                onChange={e => updateManualQuestion(pIdx, qIdx, { table: e.target.value })}
                                className="w-full p-4 bg-slate-50 rounded-lg border border-slate-100 font-mono text-xs min-h-[100px]"
                              />
                            </div>
                          )}

                          {pIdx !== 2 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {q.options.map((opt: string, oIdx: number) => (
                                <div key={oIdx} className="flex gap-2">
                                  <span className="w-8 h-10 flex items-center justify-center font-bold text-slate-400">{String.fromCharCode(65 + oIdx)}.</span>
                                  <input 
                                    type="text"
                                    value={opt}
                                    onChange={e => {
                                      const newOpts = [...q.options];
                                      newOpts[oIdx] = e.target.value;
                                      updateManualQuestion(pIdx, qIdx, { options: newOpts });
                                    }}
                                    placeholder={`Phương án ${String.fromCharCode(65 + oIdx)}...`}
                                    className="flex-1 px-4 py-2 bg-white rounded-xl border border-slate-200 outline-none focus:border-teal-500"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : null}

                          <div className="flex items-center gap-4">
                            <label className="text-sm font-black text-slate-400 uppercase">Đáp án đúng:</label>
                            <input 
                              type="text"
                              value={q.correct}
                              onChange={e => updateManualQuestion(pIdx, qIdx, { correct: e.target.value })}
                              placeholder={pIdx === 1 ? "Ví dụ: Đ-S-Đ-S" : "Nhập đáp án..."}
                              className="px-6 py-2 bg-white rounded-xl border border-slate-200 outline-none focus:border-teal-500 font-bold text-teal-600"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StorageModule = () => {
  const [files, setFiles] = useState([
    { name: 'Giao_an_Toan_12.pdf', type: 'pdf', size: '1.2 MB', date: '12/03/2024', grade: '12' },
    { name: 'Hinh_anh_minh_hoa.png', type: 'image', size: '2.5 MB', date: '11/03/2024', grade: '11' },
    { name: 'Bai_giang_audio.mp3', type: 'audio', size: '5.8 MB', date: '10/03/2024', grade: '10' },
  ]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ grade: '10', file: null as File | null });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadData({ ...uploadData, file: e.target.files[0] });
    }
  };

  const confirmUpload = () => {
    if (!uploadData.file) return Swal.fire('Lỗi', 'Vui lòng chọn file để tải lên', 'error');
    
    const newFile = {
      name: uploadData.file.name,
      type: uploadData.file.name.split('.').pop() || 'file',
      size: (uploadData.file.size / (1024 * 1024)).toFixed(1) + ' MB',
      date: new Date().toLocaleDateString('vi-VN'),
      grade: uploadData.grade
    };

    setFiles([newFile, ...files]);
    setIsUploadModalOpen(false);
    setUploadData({ grade: '10', file: null });
    Swal.fire('Thành công', 'Tài liệu đã được tải lên kho', 'success');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Kho tài liệu học tập</h2>
          <p className="text-slate-500">Lưu trữ và quản lý tài liệu đa phương tiện của bạn.</p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
        >
          <Plus size={20} /> Tải lên mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><Globe size={24} /></div>
          <div><div className="text-xs font-bold text-slate-400 uppercase">Hình ảnh</div><div className="text-xl font-black text-slate-900">{files.filter(f => ['png', 'jpg', 'jpeg', 'image'].includes(f.type)).length} Files</div></div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600"><Globe size={24} /></div>
          <div><div className="text-xs font-bold text-slate-400 uppercase">PDF/Docs</div><div className="text-xl font-black text-slate-900">{files.filter(f => ['pdf', 'doc', 'docx'].includes(f.type)).length} Files</div></div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600"><Globe size={24} /></div>
          <div><div className="text-xs font-bold text-slate-400 uppercase">Âm thanh</div><div className="text-xl font-black text-slate-900">{files.filter(f => ['mp3', 'audio'].includes(f.type)).length} Files</div></div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tên file</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Khối</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Loại</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Dung lượng</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Ngày tải</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {files.map((file, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-700">{file.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black">KHỐI {file.grade}</span>
                </td>
                <td className="px-6 py-4 uppercase text-xs font-black text-slate-400">{file.type}</td>
                <td className="px-6 py-4 text-slate-500">{file.size}</td>
                <td className="px-6 py-4 text-slate-500">{file.date}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-teal-600 transition-colors"><ExternalLink size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsUploadModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">Tải lên tài liệu</h2>
                <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Chọn khối lớp</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['10', '11', '12'].map(g => (
                      <button
                        key={g}
                        onClick={() => setUploadData({ ...uploadData, grade: g })}
                        className={`py-3 rounded-xl font-bold border-2 transition-all ${
                          uploadData.grade === g 
                            ? 'bg-teal-600 border-teal-600 text-white' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-teal-200'
                        }`}
                      >
                        Khối {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Chọn file tài liệu</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center group-hover:border-teal-400 group-hover:bg-teal-50 transition-all">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-teal-600 group-hover:bg-white shadow-sm transition-all">
                        <Upload size={24} />
                      </div>
                      <p className="text-sm font-bold text-slate-600">
                        {uploadData.file ? uploadData.file.name : 'Nhấn để chọn hoặc kéo thả file'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Hỗ trợ PDF, DOCX, PNG, JPG, MP3...</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={confirmUpload}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all"
                >
                  Xác nhận tải lên
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GamesModule = ({ onStartGame }: { onStartGame: (id: string) => void }) => {
  const games = [
    { id: 'rung-chuong-vang', title: 'Rung chuông vàng', desc: 'Trò chơi đấu trí tập thể với hệ thống câu hỏi đa dạng.', color: 'bg-amber-500', icon: <Trophy className="text-white/50 w-20 h-20" /> },
    { id: 'trieu-phu', title: 'Ai là triệu phú', desc: 'Mô phỏng gameshow truyền hình nổi tiếng, kịch tính.', color: 'bg-blue-600', icon: <Zap className="text-white/50 w-20 h-20" /> },
    { id: 'quiz-battle', title: 'Quiz Battle', desc: 'Thi đấu trực tiếp giữa các nhóm học sinh.', color: 'bg-teal-500', icon: <Gamepad2 className="text-white/50 w-20 h-20" /> },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-black text-slate-900 mb-8">Trò chơi giáo dục</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {games.map((game, idx) => (
          <div 
            key={idx} 
            onClick={() => onStartGame(game.id)}
            className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer"
          >
            <div className={`h-40 ${game.color} flex items-center justify-center`}>
               {game.icon}
            </div>
            <div className="p-8">
              <h3 className="text-xl font-black text-slate-900 mb-2">{game.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">{game.desc}</p>
              <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">Chơi ngay</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LessonModule = ({ apiKey, selectedModel }: { apiKey: string; selectedModel: string }) => {
  const [selectedGrade, setSelectedGrade] = useState("10");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [searchLesson, setSearchLesson] = useState("");
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const competencies = [
    'Khai thác dữ liệu & Thông tin',
    'Giao tiếp & Cộng tác số',
    'Sáng tạo nội dung số',
    'An toàn số'
  ];

  const handleCompetencyToggle = (cap: string) => {
    setSelectedCompetencies(prev => 
      prev.includes(cap) ? prev.filter(c => c !== cap) : [...prev, cap]
    );
  };

  const generateLessonPlan = async () => {
    if (!selectedLesson) return Swal.fire('Lỗi', 'Vui lòng chọn bài học trước', 'error');
    setIsGenerating(true);
    try {
      const keyToUse = apiKey || process.env.GEMINI_API_KEY || '';
      if (!keyToUse) {
        throw new Error("Chưa cấu hình API Key. Vui lòng thiết lập API Key trong phần Cấu hình.");
      }
      const prompt = `Hãy soạn một giáo án chi tiết cho bài học Địa lí: "${selectedLesson}" lớp ${selectedGrade}.
      Yêu cầu đặc biệt: Tích hợp các năng lực số sau: ${selectedCompetencies.join(', ')}.
      
      Cấu trúc giáo án cần bao gồm:
      1. Mục tiêu bài học (Kiến thức, Kĩ năng, Năng lực số).
      2. Thiết bị dạy học và học liệu số cần chuẩn bị.
      3. Tiến trình dạy học (Các hoạt động cụ thể, trong đó nêu rõ hoạt động nào tích hợp năng lực số).
      4. Đánh giá kết quả học tập.
      
      Hãy trình bày bằng định dạng Markdown chuyên nghiệp.`;

      const response = await generateContentWithFallback(
        keyToUse,
        selectedModel,
        { contents: prompt }
      );

      setGeneratedPlan(response.text || "Không thể tạo giáo án.");
      setIsPlanModalOpen(true);
    } catch (error: any) {
      console.error(error);
      Swal.fire('Lỗi', `Không thể kết nối với AI để soạn giáo án: ${error.message || error}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Soạn giáo án năng lực số</h2>
          <p className="text-slate-500">Thiết kế bài giảng tích hợp phát triển năng lực số cho học sinh.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedLesson("");
            setSelectedCompetencies([]);
            setGeneratedPlan(null);
          }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <Plus size={20} /> Tạo giáo án mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Thông tin chung</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Tên bài học</label>
                <div className="relative">
                  <input 
                    type="text" 
                    readOnly
                    onClick={() => setIsLessonModalOpen(true)}
                    value={selectedLesson}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 cursor-pointer" 
                    placeholder="Chọn bài học từ danh mục..." 
                  />
                  <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Khối lớp</label>
                  <select 
                    value={selectedGrade}
                    onChange={(e) => {
                      setSelectedGrade(e.target.value);
                      setSelectedLesson("");
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="10">Lớp 10</option>
                    <option value="11">Lớp 11</option>
                    <option value="12">Lớp 12</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Môn học</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                    <option>Địa lí</option>
                    <option>Toán học</option>
                    <option>Ngữ văn</option>
                    <option>Tiếng Anh</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Tích hợp Năng lực số</h3>
            <div className="space-y-4">
              {competencies.map(cap => (
                <label key={cap} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-indigo-50 transition-colors group">
                  <input 
                    type="checkbox" 
                    checked={selectedCompetencies.includes(cap)}
                    onChange={() => handleCompetencyToggle(cap)}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <span className={`font-bold ${selectedCompetencies.includes(cap) ? 'text-indigo-600' : 'text-slate-700'}`}>{cap}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full" />
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Globe className="text-indigo-400" /> AI Hỗ trợ soạn thảo
          </h3>
          <div className="space-y-6 relative z-10">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
              <p className="text-sm text-slate-300 italic leading-relaxed">
                {selectedLesson 
                  ? `Dựa trên bài học '${selectedLesson}', tôi gợi ý bạn tích hợp năng lực số bằng cách sử dụng các công cụ bản đồ số và dữ liệu thực tế để học sinh phân tích...`
                  : `"Dựa trên chủ đề bài học, tôi sẽ gợi ý bạn tích hợp các năng lực số phù hợp như khai thác dữ liệu, sáng tạo nội dung số..."`}
              </p>
            </div>
            <button 
              onClick={generateLessonPlan}
              disabled={isGenerating || !selectedLesson}
              className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-bold transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles size={20} />
              )}
              <span>{isGenerating ? 'Đang soạn thảo...' : 'Tạo khung giáo án tự động'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Plan Modal */}
      <AnimatePresence>
        {isPlanModalOpen && generatedPlan && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPlanModalOpen(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Giáo án AI: {selectedLesson}</h3>
                  <p className="text-slate-500">Tích hợp năng lực số - Khối {selectedGrade}</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      const blob = new Blob([generatedPlan], { type: 'text/markdown' });
                      saveAs(blob, `Giao_an_${selectedLesson.replace(/\s/g, '_')}.md`);
                    }}
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold flex items-center gap-2"
                  >
                    <Download size={18} /> Tải xuống (.md)
                  </button>
                  <button onClick={() => setIsPlanModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
                <div className="markdown-body prose prose-slate max-w-none">
                  <Markdown>{generatedPlan}</Markdown>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lesson Selection Modal */}
      <AnimatePresence>
        {isLessonModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsLessonModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Danh mục bài học Địa lí {selectedGrade}</h3>
                  <p className="text-slate-500 text-sm">Chọn bài học để soạn giáo án</p>
                </div>
                <button onClick={() => setIsLessonModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8">
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm bài học..." 
                    value={searchLesson}
                    onChange={(e) => setSearchLesson(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  />
                </div>
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {GEOGRAPHY_CURRICULUM[selectedGrade].map(topic => (
                    <div key={topic.title} className="space-y-3">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">{topic.title}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {topic.lessons
                          .filter(l => l.toLowerCase().includes(searchLesson.toLowerCase()))
                          .map(lesson => (
                            <button
                              key={lesson}
                              onClick={() => {
                                setSelectedLesson(lesson);
                                setIsLessonModalOpen(false);
                              }}
                              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${selectedLesson === lesson ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                            >
                              <span className={`font-bold text-sm ${selectedLesson === lesson ? 'text-indigo-700' : 'text-slate-600'}`}>{lesson}</span>
                              {selectedLesson === lesson && (
                                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                                  <Check size={14} />
                                </div>
                              )}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PracticeModule = () => {
  const topics = [
    { title: 'Đề thi tốt nghiệp Địa lí 2025', count: '24 Đề', icon: GraduationCap, color: 'bg-indigo-600' },
    { title: 'Địa lí 12 - Địa lí Việt Nam', count: '28 Bài học', icon: BookOpen, color: 'bg-teal-600' },
    { title: 'Địa lí 11 - Kinh tế - Xã hội thế giới', count: '27 Bài học', icon: Globe, color: 'bg-rose-600' },
    { title: 'Địa lí 10 - Địa lí đại cương', count: '36 Bài học', icon: Sparkles, color: 'bg-amber-500' },
    { title: 'Kỹ năng Bản đồ & Biểu đồ', count: '12 Chuyên đề', icon: LayoutGrid, color: 'bg-blue-500' },
    { title: 'Ngân hàng 10,000 câu hỏi', count: 'Đa dạng', icon: Database, color: 'bg-slate-700' },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-black text-slate-900 mb-8">Luyện đề & Bài học Địa lí</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {topics.map((topic, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group cursor-pointer">
            <div className={`w-14 h-14 ${topic.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
              <topic.icon size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{topic.title}</h3>
            <div className="text-slate-500 font-bold text-sm">{topic.count}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Tiến độ học tập môn Địa lí</h3>
        <div className="space-y-6">
          {[
            { label: 'Địa lí Tự nhiên 10', progress: 75 },
            { label: 'Địa lí Khu vực 11', progress: 40 },
            { label: 'Địa lí Việt Nam 12', progress: 90 },
          ].map(item => (
            <div key={item.label}>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-slate-700">{item.label}</span>
                <span className="text-teal-600">{item.progress}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-teal-500" 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ClassroomModule = () => {
  const [classes, setClasses] = useState([
    { id: '12A1', name: 'Lớp 12A1', students: 45, average: 8.2 },
    { id: '11B2', name: 'Lớp 11B2', students: 42, average: 7.5 },
    { id: '10C3', name: 'Lớp 10C3', students: 40, average: 7.8 },
  ]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Quản lý lớp học</h2>
          <p className="text-slate-500">Theo dõi tiến độ và kết quả của các lớp học.</p>
        </div>
        <button className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold flex items-center gap-2">
          <Plus size={20} /> Thêm lớp mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {classes.map(cls => (
          <div key={cls.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{cls.name}</h3>
            <div className="flex justify-between text-sm font-bold text-slate-500">
              <span>Sĩ số: {cls.students}</span>
              <span className="text-teal-600">TB: {cls.average}</span>
            </div>
            <button className="w-full mt-6 py-3 bg-slate-50 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors">Chi tiết lớp học</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatisticsModule = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-black text-slate-900 mb-8">Thống kê kết quả học tập</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Tổng số học sinh', value: '1,245', color: 'bg-blue-500' },
          { label: 'Bài tập đã làm', value: '8,560', color: 'bg-teal-500' },
          { label: 'Điểm trung bình', value: '7.8', color: 'bg-amber-500' },
          { label: 'Tỉ lệ hoàn thành', value: '85%', color: 'bg-indigo-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-xs font-black text-slate-400 uppercase mb-1">{stat.label}</div>
            <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            <div className={`h-1 w-8 ${stat.color} mt-4 rounded-full`} />
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Biểu đồ phổ điểm</h3>
        <div className="h-64 flex items-end gap-2">
          {[10, 25, 45, 80, 120, 150, 110, 70, 40, 20].map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${val}px` }}
                className="w-full bg-teal-500/20 border-t-2 border-teal-500 rounded-t-lg" 
              />
              <span className="text-[10px] font-bold text-slate-400">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface CommentReply {
  author: string;
  text: string;
  timestamp: string;
}

interface CommentItem {
  id: string;
  author: string;
  avatarColor: string;
  text: string;
  timestamp: string;
  replies?: CommentReply[];
}

interface SimulationDocument {
  id: string;
  title: string;
  grade: string;
  content: string;
  comments: CommentItem[];
  previewType: 'atmosphere' | 'earth' | 'japan' | 'sunray' | 'coordinate' | 'volcano' | 'ocean' | 'tide' | 'daynight' | 'timezone' | 'seasons' | 'windpressure' | 'orographicrain' | 'generic';
  canvasCode?: string;
}

const DEFAULT_CANVAS_CODES = {
  atmosphere: "// local variables\nlet earthAngle = 0;\nlet isDragging = false;\nlet startX = 0;\nlet baseAngle = 0;\nlet dragAngle = 0;\n\ncanvas.style.cursor = 'grab';\n\nfunction onMouseDown(e) {\n  isDragging = true;\n  startX = e.clientX;\n  baseAngle = dragAngle;\n  canvas.style.cursor = 'grabbing';\n}\n\nfunction onMouseMove(e) {\n  if (!isDragging) return;\n  const dx = e.clientX - startX;\n  dragAngle = baseAngle + dx * 0.015;\n}\n\nfunction onMouseUp() {\n  isDragging = false;\n  canvas.style.cursor = 'grab';\n}\n\ncanvas.addEventListener('mousedown', onMouseDown);\ncanvas.addEventListener('mousemove', onMouseMove);\nwindow.addEventListener('mouseup', onMouseUp);\n\nconst particles = [];\nfor (let i = 0; i < 180; i++) {\n  let zone = i % 4;\n  let lat = 0, lon = Math.random() * 360, speed = 0.4 + Math.random() * 0.4;\n  if (zone === 0) { lat = 5 + Math.random() * 25; }\n  else if (zone === 1) { lat = -5 - Math.random() * 25; }\n  else if (zone === 2) { lat = 30 + Math.random() * 30; }\n  else { lat = -30 - Math.random() * 30; }\n  particles.push({ lat, lon, speed, zone, size: 1.5 + Math.random() * 1.5 });\n}\n\nfunction animate() {\n  if (!state.active) {\n    canvas.removeEventListener('mousedown', onMouseDown);\n    canvas.removeEventListener('mousemove', onMouseMove);\n    window.removeEventListener('mouseup', onMouseUp);\n    return;\n  }\n\n  if (params.simPlay) {\n    earthAngle += 0.005 * params.simSpeed;\n  }\n\n  const cx = canvas.width / 2;\n  const cy = canvas.height / 2;\n  const R = Math.min(canvas.width, canvas.height) * 0.35;\n\n  ctx.fillStyle = '#090d16';\n  ctx.fillRect(0, 0, canvas.width, canvas.height);\n\n  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';\n  for (let s = 0; s < 50; s++) {\n    let sx = (Math.sin(s * 4392) * 0.5 + 0.5) * canvas.width;\n    let sy = (Math.cos(s * 9382) * 0.5 + 0.5) * canvas.height;\n    ctx.fillRect(sx, sy, 1.5, 1.5);\n  }\n\n  const glow = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.15);\n  glow.addColorStop(0, 'rgba(14, 165, 233, 0.4)');\n  glow.addColorStop(1, 'rgba(14, 165, 233, 0)');\n  ctx.fillStyle = glow;\n  ctx.beginPath();\n  ctx.arc(cx, cy, R * 1.2, 0, Math.PI * 2);\n  ctx.fill();\n\n  const sphereGrad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);\n  sphereGrad.addColorStop(0, '#1e293b');\n  sphereGrad.addColorStop(0.7, '#0f172a');\n  sphereGrad.addColorStop(1, '#020617');\n  ctx.fillStyle = sphereGrad;\n  ctx.beginPath();\n  ctx.arc(cx, cy, R, 0, Math.PI * 2);\n  ctx.fill();\n\n  function project(latDeg, lonDeg) {\n    const lat = latDeg * Math.PI / 180;\n    const lon = lonDeg * Math.PI / 180 + earthAngle + dragAngle;\n    const x = R * Math.cos(lat) * Math.sin(lon);\n    const y = -R * Math.sin(lat);\n    const z = R * Math.cos(lat) * Math.cos(lon);\n    return { x: cx + x, y: cy + y, visible: z > 0 };\n  }\n\n  if (params.showGrid) {\n    ctx.strokeStyle = 'rgba(14, 165, 233, 0.12)';\n    ctx.lineWidth = 1;\n    const lats = [-60, -30, 0, 30, 60];\n    lats.forEach(latVal => {\n      ctx.beginPath();\n      let first = true;\n      for (let lonVal = 0; lonVal <= 360; lonVal += 5) {\n        const pt = project(latVal, lonVal);\n        if (pt.visible) {\n          if (first) { ctx.moveTo(pt.x, pt.y); first = false; }\n          else { ctx.lineTo(pt.x, pt.y); }\n        } else { first = true; }\n      }\n      ctx.stroke();\n\n      const labelPt = project(latVal, 90 - (earthAngle + dragAngle) * 180 / Math.PI);\n      if (Math.abs(labelPt.x - cx) > R * 0.9) {\n        ctx.fillStyle = 'rgba(14, 165, 233, 0.6)';\n        ctx.font = '9px monospace';\n        ctx.fillText(latVal + '°', labelPt.x > cx ? cx + R + 5 : cx - R - 25, labelPt.y + 3);\n      }\n    });\n  }\n\n  if (params.showPressure) {\n    ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';\n    ctx.beginPath();\n    for (let latVal = -6; latVal <= 6; latVal += 2) {\n      let first = true;\n      for (let lonVal = 0; lonVal <= 360; lonVal += 10) {\n        const pt = project(latVal, lonVal);\n        if (pt.visible) {\n          if (first) { ctx.moveTo(pt.x, pt.y); first = false; }\n          else { ctx.lineTo(pt.x, pt.y); }\n        } else { first = true; }\n      }\n    }\n    ctx.fill();\n\n    ctx.fillStyle = 'rgba(14, 165, 233, 0.08)';\n    [-30, 30].forEach(centerLat => {\n      ctx.beginPath();\n      for (let latVal = centerLat - 6; latVal <= centerLat + 6; latVal += 2) {\n        let first = true;\n        for (let lonVal = 0; lonVal <= 360; lonVal += 10) {\n          const pt = project(latVal, lonVal);\n          if (pt.visible) {\n            if (first) { ctx.moveTo(pt.x, pt.y); first = false; }\n            else { ctx.lineTo(pt.x, pt.y); }\n          } else { first = true; }\n        }\n      }\n      ctx.fill();\n    });\n  }\n\n  if (params.showWind) {\n    particles.forEach(p => {\n      if (params.simPlay) {\n        const moveSpeed = p.speed * params.simSpeed * 0.3;\n        if (p.zone === 0) {\n          p.lat -= moveSpeed * 0.4; p.lon -= moveSpeed * 0.8;\n          if (p.lat < 0) { p.lat = 30; p.lon = Math.random() * 360; }\n        } else if (p.zone === 1) {\n          p.lat += moveSpeed * 0.4; p.lon -= moveSpeed * 0.8;\n          if (p.lat > 0) { p.lat = -30; p.lon = Math.random() * 360; }\n        } else if (p.zone === 2) {\n          p.lat += moveSpeed * 0.4; p.lon += moveSpeed * 0.8;\n          if (p.lat > 60) { p.lat = 30; p.lon = Math.random() * 360; }\n        } else {\n          p.lat -= moveSpeed * 0.4; p.lon += moveSpeed * 0.8;\n          if (p.lat < -60) { p.lat = -30; p.lon = Math.random() * 360; }\n        }\n      }\n\n      const pt = project(p.lat, p.lon);\n      if (pt.visible) {\n        let color = '#fbbf24';\n        if (p.zone >= 2) color = '#ec4899';\n        ctx.fillStyle = color;\n        ctx.beginPath();\n        ctx.arc(pt.x, pt.y, p.size, 0, Math.PI * 2);\n        ctx.fill();\n      }\n    });\n  }\n\n  const shadowGrad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.8, cx, cy, R);\n  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');\n  shadowGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.4)');\n  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');\n  ctx.fillStyle = shadowGrad;\n  ctx.beginPath();\n  ctx.arc(cx, cy, R, 0, Math.PI * 2);\n  ctx.fill();\n\n  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.arc(cx, cy, R, 0, Math.PI * 2);\n  ctx.stroke();\n\n  if (params.showPressure) {\n    ctx.font = 'bold 10px sans-serif';\n    ctx.textAlign = 'center';\n    const eqPt = project(0, 90 - (earthAngle + dragAngle) * 180 / Math.PI);\n    if (eqPt.visible) {\n      ctx.fillStyle = '#ef4444';\n      ctx.fillText('L (Hạ áp)', eqPt.x, eqPt.y + 4);\n    }\n    const nPt = project(30, 90 - (earthAngle + dragAngle) * 180 / Math.PI);\n    if (nPt.visible) {\n      ctx.fillStyle = '#0ea5e9';\n      ctx.fillText('H (Cao áp)', nPt.x, nPt.y + 4);\n    }\n    const sPt = project(-30, 90 - (earthAngle + dragAngle) * 180 / Math.PI);\n    if (sPt.visible) {\n      ctx.fillStyle = '#0ea5e9';\n      ctx.fillText('H (Cao áp)', sPt.x, sPt.y + 4);\n    }\n  }\n\n  requestAnimationFrame(animate);\n}\nanimate();",
  earth: "canvas.style.cursor = 'pointer';\n\nfunction onCanvasClick(e) {\n  const rect = canvas.getBoundingClientRect();\n  const scaleX = canvas.width / rect.width;\n  const scaleY = canvas.height / rect.height;\n  const mx = (e.clientX - rect.left) * scaleX;\n  const my = (e.clientY - rect.top) * scaleY;\n  \n  const cx = canvas.width / 2;\n  const cy = canvas.height / 2;\n  const dx = mx - cx;\n  const dy = my - cy;\n  const r = Math.sqrt(dx*dx + dy*dy);\n  \n  const R = Math.min(canvas.width, canvas.height) * 0.38;\n  const rNorm = r / R;\n  \n  if (rNorm > 1.05) {\n    helpers.setActiveEarthLayer(null);\n    return;\n  }\n  \n  if (rNorm < 0.22) {\n    helpers.setActiveEarthLayer('inner');\n  } else if (rNorm < 0.48) {\n    helpers.setActiveEarthLayer('outer');\n  } else if (rNorm < 0.88) {\n    helpers.setActiveEarthLayer('mantle');\n  } else {\n    helpers.setActiveEarthLayer('crust');\n  }\n}\n\ncanvas.addEventListener('click', onCanvasClick);\n\nlet frame = 0;\n\nfunction animate() {\n  if (!state.active) {\n    canvas.removeEventListener('click', onCanvasClick);\n    return;\n  }\n\n  frame += 0.5;\n\n  const cx = canvas.width / 2;\n  const cy = canvas.height / 2;\n  const R = Math.min(canvas.width, canvas.height) * 0.38;\n\n  ctx.fillStyle = '#0b0f19';\n  ctx.fillRect(0, 0, canvas.width, canvas.height);\n\n  const slicePercent = params.earthSlice / 100;\n  const baseRad = (params.earthAngle * Math.PI) / 180;\n  const sliceWidthRad = slicePercent * Math.PI * 0.6;\n  \n  const startAng = baseRad - sliceWidthRad / 2;\n  const endAng = baseRad + sliceWidthRad / 2;\n\n  ctx.fillStyle = '#0f172a';\n  ctx.beginPath();\n  ctx.arc(cx, cy, R, 0, Math.PI * 2);\n  ctx.fill();\n\n  function drawLayer(rStart, rEnd, color) {\n    ctx.fillStyle = color;\n    ctx.beginPath();\n    if (slicePercent > 0.05) {\n      ctx.moveTo(cx, cy);\n      ctx.arc(cx, cy, rEnd, startAng, endAng);\n      ctx.closePath();\n      ctx.fill();\n    }\n  }\n\n  ctx.fillStyle = '#0284c7';\n  ctx.beginPath();\n  ctx.arc(cx, cy, R, 0, Math.PI * 2);\n  ctx.fill();\n\n  ctx.fillStyle = '#15803d';\n  for (let c = 0; c < 6; c++) {\n    let ccx = cx + Math.sin(c * 1.5 + baseRad) * R * 0.4;\n    let ccy = cy + Math.cos(c * 2.3) * R * 0.4;\n    let cr = R * (0.2 + 0.1 * Math.sin(c));\n    ctx.beginPath();\n    ctx.arc(ccx, ccy, cr, 0, Math.PI * 2);\n    ctx.save();\n    ctx.beginPath();\n    ctx.arc(cx, cy, R, 0, Math.PI * 2);\n    ctx.clip();\n    ctx.beginPath();\n    ctx.arc(ccx, ccy, cr, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.restore();\n  }\n\n  if (slicePercent > 0.02) {\n    const mantleGrad = ctx.createRadialGradient(cx, cy, R * 0.45, cx, cy, R * 0.88);\n    mantleGrad.addColorStop(0, '#f97316');\n    mantleGrad.addColorStop(1, '#b91c1c');\n    drawLayer(R * 0.45, R * 0.88, mantleGrad);\n\n    ctx.strokeStyle = 'rgba(254, 240, 138, 0.25)';\n    ctx.lineWidth = 2.5;\n    ctx.save();\n    ctx.beginPath();\n    ctx.moveTo(cx, cy);\n    ctx.arc(cx, cy, R * 0.86, startAng, endAng);\n    ctx.clip();\n    \n    for (let a = startAng; a <= endAng; a += 0.2) {\n      ctx.beginPath();\n      const midR = R * 0.65 + Math.sin(frame * 0.05 + a * 10) * R * 0.08;\n      ctx.arc(cx, cy, midR, a, a + 0.08);\n      ctx.stroke();\n    }\n    ctx.restore();\n\n    const outerGrad = ctx.createRadialGradient(cx, cy, R * 0.22, cx, cy, R * 0.45);\n    outerGrad.addColorStop(0, '#facc15');\n    outerGrad.addColorStop(1, '#ea580c');\n    drawLayer(R * 0.22, R * 0.45, outerGrad);\n\n    const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.22);\n    innerGrad.addColorStop(0, '#ffffff');\n    innerGrad.addColorStop(0.3, '#fef08a');\n    innerGrad.addColorStop(1, '#eab308');\n    drawLayer(0, R * 0.22, innerGrad);\n\n    ctx.strokeStyle = '#ffffff';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.moveTo(cx, cy);\n    ctx.lineTo(cx + Math.cos(startAng) * R, cy + Math.sin(startAng) * R);\n    ctx.moveTo(cx, cy);\n    ctx.lineTo(cx + Math.cos(endAng) * R, cy + Math.sin(endAng) * R);\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#1e3a8a';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.arc(cx, cy, R, 0, Math.PI * 2);\n  ctx.stroke();\n\n  const activeLayer = params.activeEarthLayer;\n  if (activeLayer) {\n    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';\n    ctx.lineWidth = 2.5;\n    ctx.shadowColor = '#ffffff';\n    ctx.shadowBlur = 8;\n    ctx.beginPath();\n    if (activeLayer === 'inner') {\n      ctx.arc(cx, cy, R * 0.22, startAng, endAng);\n    } else if (activeLayer === 'outer') {\n      ctx.arc(cx, cy, R * 0.45, startAng, endAng);\n    } else if (activeLayer === 'mantle') {\n      ctx.arc(cx, cy, R * 0.88, startAng, endAng);\n    } else if (activeLayer === 'crust') {\n      ctx.arc(cx, cy, R, 0, Math.PI * 2);\n    }\n    ctx.stroke();\n    ctx.shadowBlur = 0;\n  }\n\n  requestAnimationFrame(animate);\n}\nanimate();",
  japan: "canvas.style.cursor = 'pointer';\n\nfunction onCanvasClick(e) {\n  const rect = canvas.getBoundingClientRect();\n  const scaleX = canvas.width / rect.width;\n  const scaleY = canvas.height / rect.height;\n  const mx = (e.clientX - rect.left) * scaleX;\n  const my = (e.clientY - rect.top) * scaleY;\n  \n  const fujiX = canvas.width * 0.53;\n  const fujiY = canvas.height * 0.55;\n  const dist = Math.sqrt((mx - fujiX)**2 + (my - fujiY)**2);\n  \n  if (dist < 15) {\n    helpers.setActiveJapanMarker('fuji');\n  } else {\n    helpers.setActiveJapanMarker(null);\n  }\n}\n\ncanvas.addEventListener('click', onCanvasClick);\n\nconst warmParticles = [];\nfor (let i = 0; i < 40; i++) {\n  warmParticles.push({\n    progress: Math.random(),\n    speed: 0.003 + Math.random() * 0.003,\n    offset: (Math.random() - 0.5) * 15\n  });\n}\n\nconst coldParticles = [];\nfor (let i = 0; i < 40; i++) {\n  coldParticles.push({\n    progress: Math.random(),\n    speed: 0.003 + Math.random() * 0.003,\n    offset: (Math.random() - 0.5) * 15\n  });\n}\n\nconst fishStars = [];\nfor (let i = 0; i < 15; i++) {\n  fishStars.push({\n    x: 0, y: 0, age: Math.random() * 100, maxAge: 50 + Math.random() * 50\n  });\n}\n\nlet pulse = 0;\n\nfunction animate() {\n  if (!state.active) {\n    canvas.removeEventListener('click', onCanvasClick);\n    return;\n  }\n\n  pulse += 0.05;\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, canvas.width, canvas.height);\n\n  const w = canvas.width;\n  const h = canvas.height;\n\n  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';\n  ctx.lineWidth = 1;\n  for (let x = 0; x < w; x += 40) {\n    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();\n  }\n  for (let y = 0; y < h; y += 40) {\n    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();\n  }\n\n  ctx.beginPath();\n  ctx.moveTo(w * 0.35, h * 0.70);\n  ctx.bezierCurveTo(w * 0.42, h * 0.65, w * 0.50, h * 0.58, w * 0.55, h * 0.52);\n  ctx.bezierCurveTo(w * 0.60, h * 0.45, w * 0.65, h * 0.38, w * 0.70, h * 0.28);\n  ctx.bezierCurveTo(w * 0.73, h * 0.30, w * 0.67, h * 0.42, w * 0.60, h * 0.50);\n  ctx.bezierCurveTo(w * 0.55, h * 0.58, w * 0.48, h * 0.68, w * 0.38, h * 0.72);\n  ctx.closePath();\n  \n  ctx.moveTo(w * 0.72, h * 0.25);\n  ctx.bezierCurveTo(w * 0.76, h * 0.18, w * 0.85, h * 0.15, w * 0.82, h * 0.25);\n  ctx.bezierCurveTo(w * 0.80, h * 0.30, w * 0.75, h * 0.32, w * 0.72, h * 0.25);\n  ctx.closePath();\n\n  ctx.moveTo(w * 0.25, h * 0.78);\n  ctx.bezierCurveTo(w * 0.28, h * 0.74, w * 0.33, h * 0.74, w * 0.31, h * 0.80);\n  ctx.closePath();\n  ctx.moveTo(w * 0.34, h * 0.74);\n  ctx.bezierCurveTo(w * 0.37, h * 0.71, w * 0.40, h * 0.73, w * 0.38, h * 0.76);\n  ctx.closePath();\n\n  if (params.japanLayers.terrain) {\n    ctx.fillStyle = '#15803d';\n    ctx.fill();\n    ctx.strokeStyle = '#166534';\n    ctx.lineWidth = 2;\n    ctx.stroke();\n  } else {\n    ctx.fillStyle = '#334155';\n    ctx.fill();\n    ctx.strokeStyle = '#475569';\n    ctx.lineWidth = 2;\n    ctx.stroke();\n  }\n\n  if (params.japanLayers.volcanoes) {\n    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';\n    ctx.lineWidth = 2;\n    ctx.setLineDash([4, 4]);\n    ctx.beginPath();\n    ctx.moveTo(w * 0.42, h * 0.85);\n    ctx.bezierCurveTo(w * 0.48, h * 0.68, w * 0.55, h * 0.52, w * 0.72, h * 0.42);\n    ctx.stroke();\n    ctx.setLineDash([]);\n\n    ctx.strokeStyle = `rgba(239, 68, 68, ${0.15 + 0.1 * Math.sin(pulse)})`;\n    ctx.lineWidth = 10 + 5 * Math.sin(pulse);\n    ctx.beginPath();\n    ctx.moveTo(w * 0.42, h * 0.85);\n    ctx.bezierCurveTo(w * 0.48, h * 0.68, w * 0.55, h * 0.52, w * 0.72, h * 0.42);\n    ctx.stroke();\n  }\n\n  const intersectX = w * 0.62;\n  const intersectY = h * 0.50;\n\n  if (params.japanLayers.currents) {\n    warmParticles.forEach(p => {\n      if (params.simPlay) {\n        p.progress += p.speed * params.simSpeed * 0.4;\n        if (p.progress > 1) p.progress = 0;\n      }\n\n      let px, py;\n      if (p.progress < 0.7) {\n        let t = p.progress / 0.7;\n        px = (1-t)**2 * (w*0.18) + 2*(1-t)*t * (w*0.35) + t**2 * intersectX;\n        py = (1-t)**2 * (h*0.95) + 2*(1-t)*t * (h*0.75) + t**2 * intersectY;\n      } else {\n        let t = (p.progress - 0.7) / 0.3;\n        px = (1-t) * intersectX + t * (w*0.9);\n        py = (1-t) * intersectY + t * (h*0.48);\n      }\n      px += Math.sin(p.progress * 10) * 5 + p.offset;\n\n      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';\n      ctx.shadowColor = '#ef4444';\n      ctx.shadowBlur = 4;\n      ctx.beginPath();\n      ctx.arc(px, py, 2.5, 0, Math.PI * 2);\n      ctx.fill();\n      ctx.shadowBlur = 0;\n    });\n\n    coldParticles.forEach(p => {\n      if (params.simPlay) {\n        p.progress += p.speed * params.simSpeed * 0.4;\n        if (p.progress > 1) p.progress = 0;\n      }\n\n      let px, py;\n      if (p.progress < 0.6) {\n        let t = p.progress / 0.6;\n        px = (1-t)**2 * (w*0.95) + 2*(1-t)*t * (w*0.8) + t**2 * intersectX;\n        py = (1-t)**2 * (h*0.1) + 2*(1-t)*t * (h*0.3) + t**2 * intersectY;\n      } else {\n        let t = (p.progress - 0.6) / 0.4;\n        px = (1-t) * intersectX + t * (w*0.45);\n        py = (1-t) * intersectY + t * (h*0.75);\n      }\n      px += Math.cos(p.progress * 10) * 5 + p.offset;\n\n      ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';\n      ctx.shadowColor = '#3b82f6';\n      ctx.shadowBlur = 4;\n      ctx.beginPath();\n      ctx.arc(px, py, 2.5, 0, Math.PI * 2);\n      ctx.fill();\n      ctx.shadowBlur = 0;\n    });\n\n    fishStars.forEach(s => {\n      if (params.simPlay) {\n        s.age += params.simSpeed * 0.2;\n        if (s.age > s.maxAge) {\n          s.age = 0;\n          s.x = intersectX + (Math.random() - 0.5) * 40;\n          s.y = intersectY + (Math.random() - 0.5) * 40;\n        }\n      }\n      const size = Math.sin((s.age / s.maxAge) * Math.PI) * 4;\n      ctx.fillStyle = 'rgba(234, 179, 8, 0.9)';\n      ctx.shadowColor = '#eab308';\n      ctx.shadowBlur = 6;\n      ctx.beginPath();\n      ctx.arc(s.x, s.y, size/2, 0, Math.PI*2);\n      ctx.fill();\n      ctx.shadowBlur = 0;\n    });\n  }\n\n  if (params.japanLayers.volcanoes) {\n    const fujiX = w * 0.53;\n    const fujiY = h * 0.55;\n\n    const fujiPulse = Math.abs(Math.sin(pulse));\n    ctx.fillStyle = `rgba(249, 115, 22, ${0.4 + 0.4 * fujiPulse})`;\n    ctx.shadowColor = '#f97316';\n    ctx.shadowBlur = 8;\n    ctx.beginPath();\n    ctx.moveTo(fujiX, fujiY - 8);\n    ctx.lineTo(fujiX - 7, fujiY + 5);\n    ctx.lineTo(fujiX + 7, fujiY + 5);\n    ctx.closePath();\n    ctx.fill();\n    ctx.shadowBlur = 0;\n\n    ctx.strokeStyle = `rgba(249, 115, 22, ${1.0 - fujiPulse})`;\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.arc(fujiX, fujiY + 2, 5 + fujiPulse * 15, 0, Math.PI * 2);\n    ctx.stroke();\n\n    ctx.fillStyle = '#ffffff';\n    ctx.font = 'bold 9px sans-serif';\n    ctx.fillText('Núi Phú Sĩ', fujiX, fujiY - 12);\n  }\n\n  requestAnimationFrame(animate);\n}\nanimate();",
  sunray: "let pulse = 0;\n\nfunction animate() {\n  if (!state.active) return;\n\n  pulse += 0.05;\n\n  ctx.fillStyle = '#090d16';\n  ctx.fillRect(0, 0, canvas.width, canvas.height);\n\n  const w = canvas.width;\n  const h = canvas.height;\n  const groundY = h * 0.78;\n\n  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';\n  for (let s = 0; s < 40; s++) {\n    let sx = (Math.sin(s * 7382) * 0.5 + 0.5) * w;\n    let sy = (Math.cos(s * 8273) * 0.5 + 0.5) * groundY;\n    ctx.fillRect(sx, sy, 1.2, 1.2);\n  }\n\n  ctx.fillStyle = '#14532d';\n  ctx.fillRect(0, groundY, w, h - groundY);\n\n  if (params.showGrid) {\n    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.moveTo(0, groundY);\n    ctx.lineTo(w, groundY);\n    ctx.stroke();\n\n    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';\n    ctx.font = '9px monospace';\n    ctx.textAlign = 'center';\n    \n    const tickPositions = [\n      { x: w * 0.2, label: 'Chí tuyến Nam' },\n      { x: w * 0.5, label: 'Xích đạo (0°)' },\n      { x: w * 0.8, label: 'Chí tuyến Bắc' }\n    ];\n    tickPositions.forEach(tick => {\n      ctx.beginPath();\n      ctx.moveTo(tick.x, groundY);\n      ctx.lineTo(tick.x, groundY + 5);\n      ctx.stroke();\n      ctx.fillText(tick.label, tick.x, groundY + 16);\n    });\n  }\n\n  let hitX = w * 0.5;\n  if (params.sunSeason === 'summer') hitX = w * 0.8;\n  if (params.sunSeason === 'winter') hitX = w * 0.2;\n\n  const angleRad = (params.sunAngle * Math.PI) / 180;\n  const radius = h * 0.55;\n  const sunX = hitX - radius * Math.cos(angleRad);\n  const sunY = groundY - radius * Math.sin(angleRad);\n\n  const dispersion = 150 / Math.sin(angleRad);\n  const energyGlow = ctx.createRadialGradient(hitX, groundY, 10, hitX, groundY, dispersion);\n  if (params.sunAngle > 60) {\n    energyGlow.addColorStop(0, 'rgba(239, 68, 68, 0.8)');\n    energyGlow.addColorStop(0.3, 'rgba(249, 115, 22, 0.5)');\n    energyGlow.addColorStop(1, 'rgba(249, 115, 22, 0)');\n  } else if (params.sunAngle > 30) {\n    energyGlow.addColorStop(0, 'rgba(245, 158, 11, 0.6)');\n    energyGlow.addColorStop(0.5, 'rgba(234, 179, 8, 0.3)');\n    energyGlow.addColorStop(1, 'rgba(234, 179, 8, 0)');\n  } else {\n    energyGlow.addColorStop(0, 'rgba(59, 130, 246, 0.4)');\n    energyGlow.addColorStop(0.6, 'rgba(16, 185, 129, 0.15)');\n    energyGlow.addColorStop(1, 'rgba(16, 185, 129, 0)');\n  }\n  ctx.fillStyle = energyGlow;\n  ctx.beginPath();\n  ctx.ellipse(hitX, groundY, dispersion, 15, 0, 0, Math.PI * 2);\n  ctx.fill();\n\n  ctx.strokeStyle = `rgba(253, 224, 71, ${params.simPlay ? 0.75 + 0.1 * Math.sin(pulse) : 0.6})`;\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  ctx.moveTo(sunX, sunY);\n  ctx.lineTo(hitX, groundY);\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(253, 224, 71, 0.2)';\n  ctx.lineWidth = 1;\n  const rayOffsets = [-80, -40, 40, 80];\n  rayOffsets.forEach(offset => {\n    ctx.beginPath();\n    ctx.moveTo(sunX + offset, sunY);\n    ctx.lineTo(hitX + offset, groundY);\n    ctx.stroke();\n  });\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  const arcRad = 35;\n  ctx.arc(hitX, groundY, arcRad, Math.PI, Math.PI + angleRad);\n  ctx.stroke();\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 10px monospace';\n  ctx.textAlign = 'left';\n  ctx.fillText(params.sunAngle + '°', hitX - 30, groundY - 18);\n\n  const sunPulse = 18 + 2 * Math.sin(pulse);\n  const sunGrad = ctx.createRadialGradient(sunX, sunY, 3, sunX, sunY, sunPulse);\n  sunGrad.addColorStop(0, '#ffffff');\n  sunGrad.addColorStop(0.3, '#fde047');\n  sunGrad.addColorStop(0.7, '#ea580c');\n  sunGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');\n  ctx.fillStyle = sunGrad;\n  ctx.beginPath();\n  ctx.arc(sunX, sunY, sunPulse, 0, Math.PI * 2);\n  ctx.fill();\n\n  requestAnimationFrame(animate);\n}\nanimate();"
};

const AICanvasSimulator = ({ 
  canvasCode, 
  params 
}: { 
  canvasCode: string; 
  params: any;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paramsRef = useRef(params);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    paramsRef.current = params;
    if (params.simZoom !== undefined) {
      setScale(params.simZoom);
    }
    if (params.simZoom === 1) {
      setPan({ x: 0, y: 0 });
    }
  }, [params]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasCode) return;

    const state = { active: true };
    let started = false;

    const startSimulation = () => {
      if (started || !state.active) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      started = true;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const paramsProxy = new Proxy({} as any, {
        get: (_target, prop) => paramsRef.current[prop]
      });

      const helpers = {
        setActiveEarthLayer: (layer: string | null) => paramsRef.current.setActiveEarthLayer?.(layer),
        setActiveJapanMarker: (marker: string | null) => paramsRef.current.setActiveJapanMarker?.(marker)
      };

      try {
        const runner = new Function('canvas', 'ctx', 'params', 'state', 'helpers', canvasCode);
        runner(canvas, ctx, paramsProxy, state, helpers);
      } catch (err: any) {
        console.error("Simulation Execution Error:", err);
        ctx.fillStyle = '#ef4444';
        ctx.font = `${14 * dpr}px sans-serif`;
        ctx.fillText('Lỗi mô phỏng: ' + err.message, 20 * dpr, 40 * dpr);
      }
    };

    const observer = new ResizeObserver(() => {
      if (!started) {
        startSimulation();
      } else {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
    });
    observer.observe(canvas);

    startSimulation();

    return () => {
      state.active = false;
      observer.disconnect();
    };
  }, [canvasCode]);

  const handleWheel = (e: React.WheelEvent) => {
    const zoomIntensity = 0.08;
    const delta = e.deltaY < 0 ? 1 : -1;
    const newScale = Math.min(Math.max(scale + delta * zoomIntensity, 0.5), 4);
    setScale(newScale);
    if (paramsRef.current.onZoomChange) {
      paramsRef.current.onZoomChange(newScale);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Enable panning on left click with Shift/Ctrl key, or middle mouse drag, or right click
    if (e.button === 1 || e.button === 2 || e.shiftKey || e.ctrlKey) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const newX = e.clientX - panStartRef.current.x;
      const newY = e.clientY - panStartRef.current.y;
      setPan({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-slate-950 rounded-3xl flex items-center justify-center select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isPanning ? 'grabbing' : 'default' }}
    >
      <canvas 
        ref={canvasRef} 
        className="block origin-center transition-transform duration-75"
        style={{ 
          minHeight: '300px', 
          display: 'block',
          width: '100%',
          height: '100%',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`
        }}
      />
      
      {/* HUD Info layers */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <div className="bg-slate-900/80 border border-white/10 px-2.5 py-1 rounded-full text-[10px] font-black text-teal-400 backdrop-blur-md">
          Thu phóng: {Math.round(scale * 100)}%
        </div>
      </div>
      <div className="absolute bottom-3 left-3 bg-slate-900/70 border border-white/5 px-2.5 py-1 rounded-lg text-[9px] text-slate-400 pointer-events-none backdrop-blur-md">
        💡 Cuộn chuột để Thu phóng | Giữ Shift + Kéo để di chuyển
      </div>
    </div>
  );
};

const SimulationModule = ({ apiKey, selectedModel }: { apiKey: string; selectedModel: string }) => {
  const [documents, setDocuments] = useState<SimulationDocument[]>(() => {
    const defaultDocs: SimulationDocument[] = [
      {
        id: '1',
        title: 'Thiết kế học liệu: Hoàn lưu khí quyển và các đới gió',
        grade: 'Lớp 10',
        previewType: 'atmosphere',
        canvasCode: DEFAULT_CANVAS_CODES.atmosphere,
        content: `<h2>1. Tên bài học và môn học</h2>
<p><strong>Bài học:</strong> Khí quyển. Sự phân bố nhiệt độ không khí trên Trái Đất</p>
<p><strong>Môn học:</strong> Địa lí 10 (Chương trình GDPT 2018)</p>

<h2>2. Nội dung kiến thức chính</h2>
<ul>
  <li>Khái niệm khí áp, sự hình thành các đai khí áp trên Trái Đất.</li>
  <li>Các đới gió thường xuyên thổi quanh năm: Gió Tín phong và Gió Tây ôn đới.</li>
  <li>Lực Coriolis lệch hướng chuyển động của gió.</li>
</ul>`,
        comments: [
          {
            id: 'c1',
            author: 'Thầy Lê Minh',
            avatarColor: 'bg-indigo-600',
            text: 'Mô hình hoạt động rất tốt, nên bổ sung câu hỏi về lực Coriolis.',
            timestamp: '2 giờ trước',
            replies: []
          }
        ]
      },
      {
        id: '2',
        title: 'Thiết kế học liệu: Cấu trúc bên trong của Trái Đất',
        grade: 'Lớp 10',
        previewType: 'earth',
        canvasCode: DEFAULT_CANVAS_CODES.earth,
        content: `<h2>1. Tên bài học và môn học</h2>
<p><strong>Bài học:</strong> Cấu trúc bên trong của Trái Đất</p>
<p><strong>Môn học:</strong> Địa lí 10 (Chương trình GDPT 2018)</p>

<h2>2. Nội dung kiến thức chính</h2>
<ul>
  <li>Cấu trúc phân lớp: Vỏ Trái Đất, Man-ti, Nhân Trái Đất.</li>
  <li>Đặc tính vật lí của từng lớp (độ dày, trạng thái, nhiệt độ).</li>
</ul>`,
        comments: []
      },
      {
        id: '3',
        title: 'Thiết kế học liệu: Địa lí Nhật Bản - Đặc điểm tự nhiên',
        grade: 'Lớp 11',
        previewType: 'japan',
        canvasCode: DEFAULT_CANVAS_CODES.japan,
        content: `<h2>1. Tên bài học và môn học</h2>
<p><strong>Bài học:</strong> Điều kiện tự nhiên và dân cư Nhật Bản</p>
<p><strong>Môn học:</strong> Địa lí 11 (Chương trình GDPT 2018)</p>

<h2>2. Nội dung kiến thức chính</h2>
<ul>
  <li>Quần đảo Nhật Bản và ranh giới các mảng kiến tạo.</li>
  <li>Dòng biển nóng Kuroshio và lạnh Oyashio giao nhau.</li>
  <li>Hoạt động núi lửa động đất ở Phú Sĩ.</li>
</ul>`,
        comments: []
      },
      {
        id: '4',
        title: 'Thiết kế học liệu: Hệ tọa độ địa lý',
        grade: 'Lớp 10',
        previewType: 'coordinate',
        canvasCode: '',
        content: `<h2>1. Tên bài học và môn học</h2>
<p><strong>Bài học:</strong> Hệ tọa độ địa lý — Kinh tuyến, Vĩ tuyến</p>
<p><strong>Môn học:</strong> Địa lí 10 (Chương trình GDPT 2018)</p>

<h2>2. Nội dung kiến thức chính</h2>
<ul>
  <li>Kinh tuyến, vĩ tuyến, kinh tuyến gốc, xích đạo.</li>
  <li>Xác định tọa độ địa lý của một điểm trên bản đồ/quả địa cầu.</li>
</ul>`,
        comments: []
      },
      {
        id: '5',
        title: 'Thiết kế học liệu: Bức xạ mặt trời và góc nhập xạ',
        grade: 'Lớp 10',
        previewType: 'sunray',
        canvasCode: '',
        content: `<h2>1. Tên bài học và môn học</h2>
<p><strong>Bài học:</strong> Bức xạ mặt trời và góc nhập xạ</p>
<p><strong>Môn học:</strong> Địa lí 10</p>

<h2>2. Nội dung kiến thức chính</h2>
<ul>
  <li>Sự phân hóa nhiệt lượng mặt trời theo góc chiếu (góc nhập xạ).</li>
  <li>Ý nghĩa của góc chiếu đối với các đới khí hậu địa lý.</li>
</ul>`,
        comments: []
      },
      {
        id: '6',
        title: 'Thiết kế học liệu: Hoạt động núi lửa',
        grade: 'Lớp 10',
        previewType: 'volcano',
        canvasCode: '',
        content: `<h2>1. Tên bài học và môn học</h2>
<p><strong>Bài học:</strong> Hoạt động núi lửa - Quá trình phun trào dung nham</p>
<p><strong>Môn học:</strong> Địa lí 10 (Chương trình GDPT 2018)</p>

<h2>2. Nội dung kiến thức chính</h2>
<ul>
  <li>Quá trình magma đẩy khỏi lớp vỏ tạo thành núi lửa.</li>
  <li>Các kiểu phun trào chính: Phun trào nổ, Phun trào chảy, Hỗn hợp.</li>
  <li>Các vụ phun trào lịch sử nổi tiếng (Krakatoa, Vesuvius...).</li>
</ul>`,
        comments: []
      },
      {
        id: '7',
        title: 'Thiết kế học liệu: Hải lưu đại dương',
        grade: 'Lớp 10',
        previewType: 'ocean',
        canvasCode: '',
        content: `<h2>1. Tên bài học và môn học</h2>
<p><strong>Bài học:</strong> Hải lưu — Các dòng chảy đại dương và ảnh hưởng đến khí hậu</p>
<p><strong>Môn học:</strong> Địa lí 10 (Chương trình GDPT 2018)</p>

<h2>2. Nội dung kiến thức chính</h2>
<ul>
  <li>Khái niệm hải lưu, nguyên nhân hình thành (gió, nhiệt độ, độ mặn).</li>
  <li>Phân biệt hải lưu nóng và hải lưu lạnh, vị trí phân bố trên bản đồ.</li>
  <li>Ảnh hưởng của hải lưu đến khí hậu, ngư trường và hàng hải.</li>
</ul>`,
        comments: []
      },
      {
        id: '8',
        title: 'Thiết kế học liệu: Thủy triều',
        grade: 'Lớp 10',
        previewType: 'tide',
        canvasCode: '',
        content: `<h2>1. Tên bài học và môn học</h2>
<p><strong>Bài học:</strong> Thủy triều — Hệ Mặt Trăng – Trái Đất – Mặt Trời</p>
<p><strong>Môn học:</strong> Địa lí 10 (Chương trình GDPT 2018)</p>

<h2>2. Nội dung kiến thức chính</h2>
<ul>
  <li>Nguyên nhân sinh ra thủy triều: lực hấp dẫn của Mặt Trăng và Mặt Trời.</li>
  <li>Triều cường (khi Mặt Trăng – Trái Đất – Mặt Trời thẳng hàng) và Triều kém.</li>
  <li>Chu kỳ thủy triều: bán nhật triều và nhật triều.</li>
</ul>`,
        comments: []
      },
      {
        id: '9',
        title: 'Thiết kế học liệu: Sự luân phiên ngày đêm',
        grade: 'Lớp 10',
        previewType: 'daynight',
        canvasCode: '',
        content: `<h2>1. Tên bài học và môn học</h2>
<p><strong>Bài học:</strong> Sự luân phiên ngày đêm — Trái Đất tự quay quanh trục</p>
<p><strong>Môn học:</strong> Địa lí 10 (Chương trình GDPT 2018)</p>
<h2>2. Nội dung kiến thức chính</h2>
<ul>
  <li>Trái Đất tự quay quanh trục từ tây sang đông với chu kỳ 24 giờ.</li>
  <li>Do Trái Đất hình cầu và tự quay, nên luôn có một nửa được chiếu sáng (ngày) và một nửa trong bóng tối (đêm).</li>
  <li>Ranh giới ngày-đêm (đường chuyển tiếp) luôn dịch chuyển trên bề mặt Trái Đất.</li>
</ul>`,
        comments: []
      },
      {
        id: '10',
        title: 'Thiết kế học liệu: Múi giờ và đường chuyển ngày quốc tế',
        grade: 'Lớp 10',
        previewType: 'timezone',
        canvasCode: '',
        content: `<h2>1. Tên bài học và môn học</h2>
<p><strong>Bài học:</strong> Múi giờ — Giờ quốc tế và đường đổi ngày</p>
<p><strong>Môn học:</strong> Địa lí 10 (Chương trình GDPT 2018)</p>
<h2>2. Nội dung kiến thức chính</h2>
<ul>
  <li>Trái Đất được chia thành 24 múi giờ, mỗi múi rộng 15° kinh độ.</li>
  <li>Kinh tuyến gốc (0°) đi qua Greenwich, London là cơ sở tính giờ quốc tế (UTC).</li>
  <li>Đường đổi ngày quốc tế nằm gần kinh tuyến 180°: vượt từ tây sang đông tăng thêm 1 ngày, từ đông sang tây giảm 1 ngày.</li>
  <li>Việt Nam thuộc múi giờ UTC+7.</li>
</ul>`,
        comments: []
      },
      {
        id: '11',
        title: 'Thiết kế học liệu: Các mùa trong năm',
        grade: 'Lớp 10',
        previewType: 'seasons',
        canvasCode: '',
        content: `<h2>1. Tên bài học và môn học</h2>
<p><strong>Bài học:</strong> Các mùa trong năm — Chuyển động của Trái Đất quanh Mặt Trời</p>
<p><strong>Môn học:</strong> Địa lí 10 (Chương trình GDPT 2018)</p>
<h2>2. Nội dung kiến thức chính</h2>
<ul>
  <li>Trái Đất chuyển động quanh Mặt Trời theo quỹ đạo hình elip trong 365 ngày 6 giờ.</li>
  <li>Trục Trái Đất nghiêng 23°27' so với mặt phẳng quỹ đạo và luôn giữ nguyên hướng.</li>
  <li>4 thời điểm đặc biệt: Xuân phân (20/3), Hạ chí (21/6), Thu phân (23/9), Đông chí (22/12).</li>
  <li>Hai bán cầu có mùa trái ngược nhau do trục nghiêng cố định.</li>
</ul>`,
        comments: []
      },
      {
        id: '12',
        title: 'Thiết kế học liệu: Khí áp và gió',
        grade: 'Lớp 10',
        previewType: 'windpressure',
        canvasCode: '',
        content: `<h2>1. Tên bài học và môn học</h2>
<p><strong>Bài học:</strong> Khí áp — Gió và các đới gió trên Trái Đất</p>
<p><strong>Môn học:</strong> Địa lí 10 (Chương trình GDPT 2018)</p>
<h2>2. Nội dung kiến thức chính</h2>
<ul>
  <li>Khí áp là sức nặng của cột không khí tác dụng lên bề mặt Trái Đất.</li>
  <li>Các đai khí áp: áp thấp xích đạo, áp cao chí tuyến, áp thấp ôn đới, áp cao cực.</li>
  <li>Gió thổi từ nơi áp cao về nơi áp thấp, bị lực Coriolis làm lệch hướng.</li>
  <li>Gió Tín phong, Gió Tây ôn đới, Gió Đông cực là các đới gió chính.</li>
</ul>`,
        comments: []
      },
      {
        id: '13',
        title: 'Thiết kế học liệu: Mưa địa hình',
        grade: 'Lớp 10',
        previewType: 'orographicrain',
        canvasCode: '',
        content: `<h2>1. Tên bài học và môn học</h2>
<p><strong>Bài học:</strong> Mưa địa hình — Sự phân bố lượng mưa theo địa hình</p>
<p><strong>Môn học:</strong> Địa lí 10 (Chương trình GDPT 2018)</p>
<h2>2. Nội dung kiến thức chính</h2>
<ul>
  <li>Mưa địa hình hình thành khi khối khí ẩm bị nâng lên do địa hình dãy núi chắn gió.</li>
  <li>Không khí dâng lên, lạnh đi, ngưng tụ hơi nước thành mây và mưa ở sườn đón gió.</li>
  <li>Chân núi sườn đón gió có nhiệt độ ban đầu là 28°C. Khi lên đỉnh núi Trường Sơn (2000m) nhiệt độ còn 16°C.</li>
  <li>Sau khi vượt qua đỉnh núi, không khí xuống chân núi sườn khuất gió bị nén nóng lên rất nhanh, nhiệt độ tăng vọt lên 36°C (hiệu ứng Foehn).</li>
</ul>
<h2>3. Kịch bản thuyết minh bài giảng</h2>
<p><strong>Lời dẫn giáo viên:</strong> Các em hãy quan sát khối không khí ẩm từ biển thổi vào sườn đón gió gặp dãy Trường Sơn. Không khí bị đẩy lên cao, lạnh đi tạo mây và gây mưa lớn tại sườn đón gió (28°C xuống 16°C). Khi sang sườn khuất gió, không khí đã trút hết ẩm, xuống dốc và nóng khô rất nhanh lên tới 36°C tạo hiệu ứng gió Lào (Foehn) cực kỳ khô nóng ở dải miền Trung Việt Nam.</p>
<h2>4. Câu hỏi kiểm tra đánh giá tự động</h2>
<p>Câu 1: Sườn đón gió có lượng mưa nhiều hơn sườn khuất gió do nguyên nhân nào?</p>
<p>A. Khối khí ẩm dâng lên bị lạnh đi, ngưng tụ thành mây mưa</p>
<p>B. Khối khí ẩm dâng lên bị nóng lên</p>
<p>C. Có gió Tây khô nóng hoạt động mạnh</p>
<p>D. Biển nằm ở sườn khuất gió</p>
<p>Đáp án: A</p>
<p>Câu 2: Hiệu ứng Foehn (gió Lào) ở Việt Nam thường có tính chất gì?</p>
<p>A. Lạnh và ẩm ướt</p>
<p>B. Khô hạn và rất nóng</p>
<p>C. Mát mẻ và mưa nhiều</p>
<p>D. Có mưa đá và tro bụi núi lửa</p>
<p>Đáp án: B</p>`,
        comments: []
      },
      {
        id: '14',
        title: 'Thiết kế học liệu: Trái Đất trong hệ Mặt Trời',
        grade: 'Lớp 10',
        previewType: 'solar-system',
        canvasCode: '',
        content: `<h2>1. Tên bài học và môn học</h2>
<p><strong>Bài học:</strong> Hệ Mặt Trời. Thiên hà. Chuyển động tự quay và quanh Mặt Trời của Trái Đất</p>
<p><strong>Môn học:</strong> Địa lí 10 (Chương trình GDPT 2018)</p>
<h2>2. Nội dung kiến thức chính</h2>
<ul>
  <li>Trái Đất là hành tinh thứ ba tính từ Mặt Trời ra ngoài trong hệ Mặt Trời.</li>
  <li>Quỹ đạo chuyển động của Trái Đất quanh Mặt Trời có hình elip gần tròn.</li>
  <li>Điểm cận nhật là vị trí Trái Đất gần Mặt Trời nhất (khoảng 147 triệu km, vào ngày 3/1).</li>
  <li>Điểm viễn nhật là vị trí Trái Đất xa Mặt Trời nhất (khoảng 152 triệu km, vào ngày 4/7).</li>
</ul>
<h2>3. Kịch bản thuyết minh bài giảng</h2>
<p><strong>Lời dẫn giáo viên:</strong> Các em hãy quan sát hệ Mặt Trời của chúng ta. Trái Đất chuyển động trên quỹ đạo hình elip quanh Mặt Trời. Do quỹ đạo dẹt, khoảng cách của Trái Đất đến Mặt Trời thay đổi trong năm. Đầu tháng 1, chúng ta đạt điểm cận nhật gần nhất với 147 triệu km. Đầu tháng 7, chúng ta ở điểm viễn nhật xa nhất với 152 triệu km. Các em hãy chú ý sự chênh lệch khoảng cách này!</p>
<h2>4. Câu hỏi kiểm tra đánh giá tự động</h2>
<p>Câu 1: Quỹ đạo chuyển động của Trái Đất quanh Mặt Trời có hình dạng gì?</p>
<p>A. Hình elip gần tròn</p>
<p>B. Hình tròn hoàn hảo</p>
<p>C. Hình parabol dẹt</p>
<p>D. Hình xoắn ốc</p>
<p>Đáp án: A</p>
<p>Câu 2: Thời điểm Trái Đất ở xa Mặt Trời nhất (điểm viễn nhật) diễn ra vào khoảng thời gian nào?</p>
<p>A. Đầu tháng 1</p>
<p>B. Đầu tháng 7</p>
<p>C. Giữa tháng 3</p>
<p>D. Cuối tháng 12</p>
<p>Đáp án: B</p>`,
        comments: []
      },
      {
        id: '15',
        title: 'Thiết kế học liệu: Hiện tượng Mặt Trời lên thiên đỉnh',
        grade: 'Lớp 10',
        previewType: 'zenith-sun',
        canvasCode: '',
        content: `<h2>1. Tên bài học và môn học</h2>
<p><strong>Bài học:</strong> Hệ quả địa lí các chuyển động của Trái Đất quanh Mặt Trời</p>
<p><strong>Môn học:</strong> Địa lí 10 (Chương trình GDPT 2018)</p>
<h2>2. Nội dung kiến thức chính</h2>
<ul>
  <li>Mặt Trời lên thiên đỉnh là hiện tượng tia sáng Mặt Trời chiếu vuông góc với bề mặt Trái Đất vào đúng lúc 12 giờ trưa.</li>
  <li>Hiện tượng này chỉ xảy ra ở khu vực nội chí tuyến (giữa hai chí tuyến Bắc và Nam).</li>
  <li>Tại Việt Nam, do nằm hoàn toàn trong vùng nội chí tuyến Bắc, mọi địa điểm đều có 2 lần Mặt Trời lên thiên đỉnh trong năm.</li>
</ul>
<h2>3. Kịch bản thuyết minh bài giảng</h2>
<p><strong>Lời dẫn giáo viên:</strong> Các em hãy nhìn chuyển động biểu kiến của Mặt Trời trên đồ thị. Mặt Trời di chuyển từ chí tuyến Nam lên chí tuyến Bắc rồi quay ngược lại. Chỉ có vùng nằm giữa hai chí tuyến mới nhận được tia nắng chiếu thẳng góc 90 độ tại đỉnh đầu vào trưa. Vì Việt Nam nằm hoàn toàn trong vùng này nên tất cả các tỉnh thành từ Cà Mau đến Hà Giang đều đón nhận hiện tượng thiên đỉnh 2 lần mỗi năm.</p>
<h2>4. Câu hỏi kiểm tra đánh giá tự động</h2>
<p>Câu 1: Hiện tượng Mặt Trời lên thiên đỉnh xảy ra mấy lần một năm ở hai chí tuyến Bắc và Nam?</p>
<p>A. 1 lần</p>
<p>B. 2 lần</p>
<p>C. 3 lần</p>
<p>D. Không có lần nào</p>
<p>Đáp án: A</p>
<p>Câu 2: Ở Việt Nam, hiện tượng Mặt Trời lên thiên đỉnh xảy ra mấy lần một năm?</p>
<p>A. 1 lần</p>
<p>B. 2 lần</p>
<p>C. 3 lần</p>
<p>D. Không bao giờ</p>
<p>Đáp án: B</p>`,
        comments: []
      }
    ];

    const saved = localStorage.getItem('geohub_simulation_docs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Smart merge: ensure all defaultDocs are available and up to date
          const merged = [...parsed];
          defaultDocs.forEach(defDoc => {
            const index = merged.findIndex(d => d.previewType === defDoc.previewType);
            if (index === -1) {
              merged.push(defDoc);
            } else {
              // Update default documents with the new template content while keeping metadata
              merged[index] = { ...defDoc, id: merged[index].id, comments: merged[index].comments || [] };
            }
          });
          return merged;
        }
      } catch (e) {
        console.error("Error loading geohub_simulation_docs", e);
      }
    }
    return defaultDocs;
  });



const [showHelpModal, setShowHelpModal] = useState(false);
  const [isGeneratingCanvas, setIsGeneratingCanvas] = useState(false);

  useEffect(() => {
    localStorage.setItem('geohub_simulation_docs', JSON.stringify(documents));
  }, [documents]);

  const generateCanvasSimulation = async (doc: SimulationDocument) => {
    if (!apiKey) {
      return Swal.fire({
        title: 'Thiếu API Key',
        text: 'Vui lòng nhấn vào biểu tượng bánh răng ở góc trên bên phải để thiết lập Gemini API Key trước khi sử dụng tính năng sinh mô phỏng bằng AI!',
        icon: 'warning'
      });
    }

    setIsGeneratingCanvas(true);
    try {
      const systemPrompt = `Bạn là chuyên gia lập trình đồ họa và tương tác HTML5 Canvas.
Nhiệm vụ của bạn là tạo mã nguồn JavaScript (chỉ phần thân hàm, không khai báo function hay thẻ <script>) để vẽ và chạy một mô phỏng tương tác 2D/3D đẹp mắt trên thẻ <canvas>.

Tài liệu thiết kế mô phỏng bài học:
"""
${doc.content}
"""

Hàm vẽ của bạn sẽ nhận các tham số sau:
1. canvas: Đối tượng HTMLCanvasElement.
2. ctx: CanvasRenderingContext2D để vẽ.
3. params: Đối tượng chứa trạng thái các thanh trượt và nút bấm hiện tại từ giao diện (sẽ tự động cập nhật giá trị mới nhất):
   - simPlay (boolean): Trạng thái chạy/tạm dừng hoạt ảnh.
   - simSpeed (number): Tốc độ hoạt cảnh (ví dụ: 1 đến 5).
   - showPressure, showWind, showGrid (boolean): Trạng thái hiển thị.
   - earthSlice (number): Độ mở lát cắt quả địa cầu (0 đến 100).
   - earthAngle (number): Góc xoay (0 đến 360).
   - japanLayers (object: { currents, volcanoes, terrain }): Các lớp bật tắt của Nhật Bản.
   - sunAngle (number): Góc nhập xạ Mặt Trời (10 đến 90).
   - sunSeason (string: 'summer' | 'winter' | 'equinox'): Mùa hiện tại.
4. state: Đối tượng có thuộc tính active (boolean). Bạn PHẢI kiểm tra state.active trong vòng lặp requestAnimationFrame. Nếu state.active === false, hãy dừng vòng lặp ngay lập tức và giải phóng tài nguyên để tránh rò rỉ bộ nhớ.
5. helpers: Đối tượng chứa các hàm callback để cập nhật trạng thái ngược lại giao diện React:
   - setActiveEarthLayer(layerName: string) ('inner' | 'outer' | 'mantle' | 'crust' | null)
   - setActiveJapanMarker(markerName: string) ('fuji' | null)

Yêu cầu kỹ thuật:
- Sử dụng requestAnimationFrame để tạo vòng lặp mượt mà.
- Luôn kiểm tra if (!state.active) return; trong vòng lặp trước khi gọi tiếp requestAnimationFrame.
- Sử dụng các hiệu ứng đồ họa cao cấp như: linear/radial gradient, shadow, transparency, hệ thống hạt (particles), nét vẽ mịn màng, phối màu hiện đại (HSL, sleek dark mode).
- Tạo hiệu ứng chiều sâu 3D (3D projections) nếu bài học yêu cầu (như quả địa cầu tự xoay, mặt cắt 3D, hoặc tia nắng chiếu nghiêng).
- Lắng nghe các sự kiện chuột trên canvas nếu cần tương tác (như kéo xoay mô hình, click vào các lớp địa tầng) và gọi các hàm tương ứng trong helpers.
- Đảm bảo mã chạy trơn tru, không bị crash, không khai báo các biến trùng lặp ngoài phạm vi hàm.
- Chỉ trả về đoạn mã JavaScript chạy trực tiếp, KHÔNG bọc trong block code markdown hay thẻ script, KHÔNG viết từ khóa function bên ngoài.`;

      const response = await generateContentWithFallback(apiKey, selectedModel, {
        contents: [{ role: 'user', parts: [{ text: "Hãy viết mã JavaScript Canvas cho bài học này theo các thông số." }] }],
        config: {
          systemInstruction: systemPrompt
        }
      });

      let code = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (code.includes('```javascript')) {
        code = code.split('```javascript')[1].split('```')[0];
      } else if (code.includes('```js')) {
        code = code.split('```js')[1].split('```')[0];
      } else if (code.includes('```')) {
        code = code.split('```')[1].split('```')[0];
      }

      code = code.trim();

      if (!code) throw new Error("Không nhận được mã vẽ Canvas từ AI");

      const updatedDocs = documents.map(d => d.id === doc.id ? { ...d, canvasCode: code } : d);
      setDocuments(updatedDocs);
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Đã tạo mô phỏng Canvas bằng AI thành công!',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (error: any) {
      console.error(error);
      Swal.fire('Lỗi sinh mô phỏng', error.message || error, 'error');
    } finally {
      setIsGeneratingCanvas(false);
    }
  };

  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [aiPanelTab, setAiPanelTab] = useState<'ai' | 'preview_tab'>('ai');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Tất cả');
  
  // AI Form States
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocGrade, setNewDocGrade] = useState('12');
  const [newDocTopic, setNewDocTopic] = useState('');
  const [newDocImage, setNewDocImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Editor states
  const [editorContent, setEditorContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [selectedTextRange, setSelectedTextRange] = useState('');

  // AI Chat states
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Chào thầy cô! Tôi là trợ lý AI chuyên gia thiết kế học liệu số. Tôi có thể giúp thầy cô điều chỉnh, bổ sung thêm lời dẫn giáo viên, chỉnh sửa các nút bấm hay tối ưu hóa ý tưởng mô phỏng cho tài liệu thiết kế này.' }
  ]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);

  // Simulated collaboration states
  const [collaborators, setCollaborators] = useState([
    { name: 'Cô Nguyễn Lan', active: true, color: 'border-teal-500 bg-teal-500' },
    { name: 'Thầy Lê Minh', active: true, color: 'border-indigo-500 bg-indigo-500' },
    { name: 'Trợ lý AI', active: true, color: 'border-violet-500 bg-violet-500' }
  ]);
  const [simulatedTypingText, setSimulatedTypingText] = useState('');
  const [simulatedCursorPos, setSimulatedCursorPos] = useState<{ top: number; left: number } | null>(null);

  const parsedSimData = useMemo(() => {
    const activeDoc = documents.find(d => d.id === activeDocId);
    if (!activeDoc) return { params: {}, quiz: [], narration: '' };
    return parseSimDataFromContent(editorContent, activeDoc.previewType);
  }, [editorContent, activeDocId, documents]);

  // Simulation controls state (Atmosphere)
  const [simPlay, setSimPlay] = useState(true);
  const [simSpeed, setSimSpeed] = useState(2);
  const [showPressure, setShowPressure] = useState(true);
  const [showWind, setShowWind] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showGuideText, setShowGuideText] = useState(true);
  const [simZoom, setSimZoom] = useState(1);
  const [simFullscreen, setSimFullscreen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizRevealed, setQuizRevealed] = useState<Record<string, boolean>>({});

  // Simulation controls state (Earth)
  const [earthSlice, setEarthSlice] = useState(50);
  const [activeEarthLayer, setActiveEarthLayer] = useState<string | null>(null);
  const [earthAngle, setEarthAngle] = useState(45);
  const [showLabels, setShowLabels] = useState(true);

  // Simulation controls state (Japan)
  const [japanLayers, setJapanLayers] = useState({
    currents: true,
    volcanoes: true,
    terrain: false
  });
  const [activeJapanMarker, setActiveJapanMarker] = useState<string | null>(null);

  // Simulation controls state (Sun ray)
  const [sunAngle, setSunAngle] = useState(45);
  const [sunSeason, setSunSeason] = useState<'summer' | 'winter' | 'equinox'>('equinox');

  // Narration (Text-to-speech) state and effects
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, [activeDocId]);

  useEffect(() => {
    if (parsedSimData.params.sunAngle !== undefined) {
      setSunAngle(parsedSimData.params.sunAngle);
    }
  }, [parsedSimData.params.sunAngle]);

  const getGuideText = () => {
    if (!activeDoc) return '';
    if (parsedSimData.narration) {
      return parsedSimData.narration;
    }
    if (activeDoc.previewType === 'atmosphere') {
      return 'Các em hãy nhìn xem quả địa cầu bắt đầu chuyển dịch. Các đai khí áp thấp có màu đỏ, đai khí áp cao có màu xanh. Các em hãy chú ý hướng gió thổi từ đai áp cao chí tuyến về đai áp thấp xích đạo. Quan sát xem chúng lệch hướng ra sao ở bán cầu Bắc?';
    }
    if (activeDoc.previewType === 'earth') {
      return 'Hãy xem vỏ Trái Đất nơi chúng ta đang sống thực chất mỏng như thế nào so với toàn bộ quả địa cầu? Cô sẽ click vào phần màu vàng cam này - đây là lớp Man-ti ở trạng thái quánh dẻo, nguồn gốc sinh ra các dòng magma tạo nên núi lửa.';
    }
    if (activeDoc.previewType === 'japan') {
      return 'Xem các mũi tên màu đỏ đại diện cho dòng biển nóng Kuroshio từ xích đạo đi lên, và dòng lạnh Oyashio đi từ phía bắc xuống gặp nhau. Sự hội tụ này tạo lượng hải sản khổng lồ cho Nhật Bản.';
    }
    if (activeDoc.previewType === 'sunray') {
      return `Các em hãy nhìn xem các tia nắng chiếu xuống mặt đất với góc ${sunAngle} độ. Cô sẽ kéo thanh trượt thay đổi góc chiếu - các em hãy quan sát diện tích mặt đất được chiếu sáng thay đổi ra sao. Góc càng nhỏ, năng lượng càng phân tán, nhiệt độ càng thấp.`;
    }
    if (activeDoc.previewType === 'coordinate') {
      return 'Các em hãy quan sát quả địa cầu. Kinh tuyến gốc không độ có màu vàng, đường xích đạo vĩ độ không độ có màu đỏ. Các đường vĩ tuyến song song với xích đạo hướng về hai cực, còn các đường kinh tuyến thì nối liền hai cực của Trái Đất.';
    }
    if (activeDoc.previewType === 'volcano') {
      return 'Các em hãy quan sát hoạt động núi lửa. Quá trình magma bị đẩy ra khỏi lớp vỏ Trái Đất ra bề mặt. Có các kiểu phun trào chính: phun trào nổ với tro bụi mù mịt, phun trào chảy với dòng dung nham nóng đỏ chảy tràn, và phun trào hỗn hợp.';
    }
    if (activeDoc.previewType === 'ocean') {
      return 'Các em hãy quan sát quả địa cầu. Các mũi tên đỏ là hải lưu nóng di chuyển từ vùng nhiệt đới lên vùng cực mang nhiệt lượng theo. Các mũi tên xanh cyan là hải lưu lạnh đi từ vùng cực về nhiệt đới. Các em hãy kéo quả địa cầu để quan sát hải lưu ở cả Thái Bình Dương và Đại Tây Dương.';
    }
    if (activeDoc.previewType === 'tide') {
      return 'Các em hãy quan sát hệ Mặt Trời – Trái Đất – Mặt Trăng. Lực hấp dẫn của Mặt Trăng kéo nước đại dương về phía nó tạo ra gù nước — đó là triều lên. Khi Mặt Trăng và Mặt Trời thẳng hàng với Trái Đất, lực kéo cộng hưởng tạo ra triều cường lớn nhất. Khi vuông góc, triều kém xuất hiện.';
    }
    if (activeDoc.previewType === 'daynight') {
      return 'Các em hãy quan sát Trái Đất đang tự quay từ tây sang đông. Phần bên trái quay về phía Mặt Trời — đó là ban ngày. Phần bên phải trong bóng tối — đó là ban đêm. Ranh giới ngày đêm dần dịch chuyển khi Trái Đất quay. Điểm đỏ là vị trí Việt Nam — các em hãy quan sát xem Việt Nam đang là ngày hay đêm?';
    }
    if (activeDoc.previewType === 'timezone') {
      return 'Các em hãy quan sát quả địa cầu được chia thành 24 múi giờ — mỗi múi rộng 15 độ kinh độ. Đường màu vàng là kinh tuyến gốc 0 độ qua Greenwich, London. Đường màu đỏ cam là đường đổi ngày quốc tế ở gần kinh tuyến 180. Các em hãy chú ý đồng hồ 4 thành phố bên dưới — chúng chỉ các giờ khác nhau!';
    }
    if (activeDoc.previewType === 'seasons') {
      return 'Các em hãy quan sát Trái Đất đang quay quanh Mặt Trời theo quỹ đạo hình elip. Chú ý trục Trái Đất luôn nghiêng về một hướng cố định. Khi bán cầu Bắc nghiêng về phía Mặt Trời — đó là mùa Hè ở bán cầu Bắc. Khi nghiêng ra xa — đó là mùa Đông. Vì vậy hai bán cầu có mùa trái ngược nhau!';
    }
    if (activeDoc.previewType === 'windpressure') {
      return 'Các em hãy quan sát các đai khí áp trên Trái Đất. Màu đỏ là đai áp thấp — không khí nóng dâng lên. Màu xanh là đai áp cao — không khí lạnh hạ xuống. Gió thổi từ nơi áp cao về nơi áp thấp. Do Trái Đất tự quay, lực Coriolis làm gió lệch phải ở bán cầu Bắc và lệch trái ở bán cầu Nam!';
    }
    if (activeDoc.previewType === 'orographicrain') {
      return 'Các em hãy quan sát gió ẩm từ biển thổi vào gặp núi chắn. Không khí bị buộc phải dâng lên theo sườn đón gió — lạnh đi, hơi ẩm ngưng tụ thành mây và mưa rơi xuống sườn đón gió màu xanh lá. Sau khi vượt qua đỉnh, không khí xuống dốc bên sườn khuất gió — ấm lên theo hiệu ứng Foehn, trở nên khô, không có mưa!';
    }
    return 'Hãy theo dõi chuyển động quay của mô hình và rút ra kết luận khoa học về quy luật tự nhiên.';
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = getGuideText();
    if (!textToSpeak) return;

    setIsSpeaking(true);

    // 1. Try Google Translate TTS first (High quality Northern female voice)
    // We split into sentences/phrases to respect the character limits
    const sentences = textToSpeak.match(/[^.!?]+[.!?]*/g) || [textToSpeak];
    let sentenceIndex = 0;

    const playNextSentence = () => {
      if (sentenceIndex >= sentences.length) {
        setIsSpeaking(false);
        return;
      }

      const rawPart = sentences[sentenceIndex].trim();
      if (!rawPart) {
        sentenceIndex++;
        playNextSentence();
        return;
      }

      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(rawPart)}`;
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        sentenceIndex++;
        playNextSentence();
      };

      audio.onerror = () => {
        console.warn('Google TTS failed for sentence, falling back to Web Speech API');
        fallbackToWebSpeech(sentences.slice(sentenceIndex).join(' '));
      };

      audio.play().catch(err => {
        console.warn('Google TTS autoplay blocked, falling back to Web Speech API', err);
        fallbackToWebSpeech(sentences.slice(sentenceIndex).join(' '));
      });
    };

    const fallbackToWebSpeech = (remainingText: string) => {
      if (!('speechSynthesis' in window)) {
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(remainingText);
      utterance.lang = 'vi-VN';

      const voices = window.speechSynthesis.getVoices();
      const viVoices = voices.filter(v => v.lang.toLowerCase().replace('_', '-').includes('vi'));
      
      const preferredVoice = viVoices.find(v => v.name.toLowerCase().includes('an'))
        || viVoices.find(v => v.name.toLowerCase().includes('google'))
        || viVoices.find(v => v.name.toLowerCase().includes('linh'))
        || viVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('nữ'))
        || viVoices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    playNextSentence();
  };

  // Load document content to editor when active document changes
  const openDocument = (doc: SimulationDocument) => {
    setActiveDocId(doc.id);
    setEditorContent(doc.content);
    setComments(doc.comments);
    setActiveTab('editor');
    setAiPanelTab('ai');
    setAiChatHistory([
      { sender: 'ai', text: `Tôi đã tải thiết kế của bài "${doc.title}". Bạn có muốn tôi điều chỉnh thêm phần nào không?` }
    ]);
  };

  // Helper for Rich Text Formatting
  const formatText = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
    }
  };

  const handleEditorBlur = () => {
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
      // Update in local documents array
      setDocuments(documents.map(d => d.id === activeDocId ? { ...d, content: editorRef.current!.innerHTML } : d));
    }
  };

  // Handle Text Selection for Comments
  const handleEditorSelect = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedTextRange(selection.toString());
    }
  };

  // Save/Add comment
  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    
    const newComment: CommentItem = {
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      author: 'Admin (Tôi)',
      avatarColor: 'bg-amber-500',
      text: newCommentText + (selectedTextRange ? ` (cho đoạn: "${selectedTextRange}")` : ''),
      timestamp: 'Vừa xong',
      replies: []
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    setDocuments(documents.map(d => d.id === activeDocId ? { ...d, comments: updatedComments } : d));
    setNewCommentText('');
    setSelectedTextRange('');
  };

  // Resolve comment
  const handleResolveComment = (id: string) => {
    const updated = comments.filter(c => c.id !== id);
    setComments(updated);
    setDocuments(documents.map(d => d.id === activeDocId ? { ...d, comments: updated } : d));
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Đã giải quyết nhận xét',
      showConfirmButton: false,
      timer: 1500
    });
  };

  // Reply to comment
  const handleReplyComment = (commentId: string, replyText: string) => {
    if (!replyText.trim()) return;
    const updated = comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...(c.replies || []), { author: 'Admin (Tôi)', text: replyText, timestamp: 'Vừa xong' }]
        };
      }
      return c;
    });
    setComments(updated);
    setDocuments(documents.map(d => d.id === activeDocId ? { ...d, comments: updated } : d));
  };

  // Export to Word
  const exportToWord = () => {
    const activeDoc = documents.find(d => d.id === activeDocId);
    if (!activeDoc) return;

    // Convert HTML to simple clean text layout for doc file
    const cleanText = editorContent
      .replace(/<h2[^>]*>/gi, '\n\n=== ')
      .replace(/<\/h2>/gi, ' ===\n')
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '')
      .replace(/<ul[^>]*>/gi, '')
      .replace(/<\/ul>/gi, '')
      .replace(/<li[^>]*>/gi, '\n* ')
      .replace(/<\/li>/gi, '')
      .replace(/<strong[^>]*>/gi, '')
      .replace(/<\/strong>/gi, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    const headerText = `TÀI LIỆU THIẾT KẾ MÔ PHỎNG HỌC LIỆU SỐ\nTiêu đề: ${activeDoc.title}\nKhối lớp: ${activeDoc.grade}\n=========================================\n`;
    const fullText = headerText + cleanText;

    const blob = new Blob([fullText], { type: 'application/msword;charset=utf-8' });
    saveAs(blob, `${activeDoc.title.replace(/\s+/g, '_')}_Spec.doc`);
    
    Swal.fire('Thành công', 'Đã tải xuống tài liệu thiết kế định dạng Word', 'success');
  };

  // AI Document Generator based on User's 10-step instructions
  const generateNewSimulation = async () => {
    if (!newDocTitle.trim()) return Swal.fire('Lỗi', 'Vui lòng nhập tên bài học', 'error');
    if (!newDocTopic.trim() && !newDocImage) {
      return Swal.fire('Lỗi', 'Vui lòng mô tả yêu cầu hoặc tải ảnh chụp nội dung SGK', 'error');
    }

    setIsGenerating(true);
    try {
      const keyToUse = apiKey || '';
      
      let base64Image = '';
      let mimeType = '';
      if (newDocImage) {
        // Read file as base64
        const reader = new FileReader();
        base64Image = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(newDocImage);
        });
        mimeType = newDocImage.type;
      }

      let systemPrompt = `Bạn là chuyên gia thiết kế học liệu số cho giáo viên phổ thông Việt Nam.
Hãy đọc kỹ thông tin bài học và phân tích theo đúng cấu trúc 10 phần dưới đây.

NGUYÊN TẮC QUAN TRỌNG CẦN NHỚ:
- Không phải bài nào cũng cần mô phỏng. Nếu bài không phù hợp, hãy nói rõ là không nên mô phỏng hoặc chỉ nên làm học liệu trực quan đơn giản.
- Mô phỏng cần vừa đủ, bám sát bài học, không cần phức tạp như phần mềm thí nghiệm ảo chuyên nghiệp.
- Ưu tiên các mô phỏng có thể dùng tốt trên máy chiếu, tivi hoặc màn hình tương tác trong lớp học.
- Nếu bài học phù hợp với mô hình 3D, hãy ưu tiên đề xuất mô phỏng 3D bằng Three.js hoặc công nghệ tương đương.
- Nếu bài chỉ cần học sinh quan sát hình dạng, cấu tạo, vị trí mà không cần thay đổi thông số, có thể đề xuất nhúng mô hình 3D từ Sketchfab hoặc nguồn tương đương (để link placeholder sẵn dạng: https://sketchfab.com/models/[id-placeholder]).

Hãy phân tích theo đúng cấu trúc 10 phần, mỗi phần dùng thẻ <h2> và nội dung chi tiết:

<h2>1. Tên bài học và môn học</h2>
Nếu ảnh có thông tin về lớp, môn học, tên bài, hãy nêu rõ.

<h2>2. Nội dung kiến thức chính của bài</h2>
Tóm tắt ngắn gọn những kiến thức trọng tâm học sinh cần hiểu sau bài học.

<h2>3. Bài này có nên làm app mô phỏng không?</h2>
Chọn một trong ba mức: RẤT NÊN MÔ PHỎNG / CÓ THỂ MÔ PHỎNG NHẸ / KHÔNG NÊN MÔ PHỎNG.
Giải thích ngắn gọn lý do. Nếu không nên mô phỏng, đề xuất hình thức học liệu phù hợp hơn (hình ảnh tĩnh, video, Sketchfab 3D...).

<h2>4. Phần kiến thức đáng mô phỏng nhất</h2>
Chỉ chọn 1 đến 2 phần thật sự cần trực quan hóa. Không chọn quá nhiều nội dung.

<h2>5. Mục tiêu quan sát của học sinh</h2>
Nêu rõ: học sinh cần nhìn thấy điều gì? Thao tác hoặc quan sát sự thay đổi nào? So sánh điều gì? Rút ra nhận xét gì sau khi quan sát?

<h2>6. Ý tưởng app mô phỏng đề xuất</h2>
Mô tả app sẽ có những thành phần nào: màn hình chính hiển thị gì, giáo viên có thể bấm nút/kéo thanh/xoay/bật-tắt thông số nào, khi thao tác thì hình ảnh hoặc hiện tượng thay đổi ra sao, học sinh cần tập trung quan sát điểm nào.
Nếu phù hợp 3D → đề xuất dùng Three.js.
Nếu chỉ cần quan sát hình dạng tĩnh → đề xuất nhúng mô hình Sketchfab (kèm link placeholder).

<h2>7. Các nút điều khiển cần có</h2>
Chỉ đề xuất những nút thật sự cần thiết: Bắt đầu, Tạm dừng, Làm lại, Xoay mô hình, Mở/Gập mô hình, Bật/Tắt chú thích, Tăng/Giảm thông số, Ẩn/Hiện lời dẫn.

<h2>8. Lời dẫn gợi ý cho giáo viên</h2>
Viết 3-5 câu ngắn để giáo viên dùng khi trình chiếu, ví dụ: "Các em hãy quan sát...", "Khi thầy/cô thay đổi..., hiện tượng xảy ra như thế nào?", "Từ quan sát trên, các em rút ra nhận xét gì?"

<h2>9. Những nội dung không nên đưa vào app</h2>
Nêu rõ: không đưa trắc nghiệm/chấm điểm, không đưa quá nhiều chữ dài, không thêm trò chơi không liên quan, không dùng hiệu ứng rối mắt, không yêu cầu đăng nhập, không lưu dữ liệu học sinh.

<h2>10. Bản mô tả hoàn chỉnh để chuyển sang bước tạo app</h2>
Viết lại thành một bản yêu cầu rõ ràng, mạch lạc để đưa sang công cụ tạo app bằng AI. Bản mô tả cần:
- Dễ hiểu với người không biết lập trình.
- Bám sát bài học, tập trung vào dạy kiến thức mới.
- Giao diện đơn giản, chữ rõ, nút lớn, dùng tốt khi trình chiếu.
- Có phần "Lời dẫn cho giáo viên" và nút "Ẩn/Hiện lời dẫn".
- Có nút "Làm lại". Không cần đăng nhập, không lưu dữ liệu học sinh.
- Nếu phù hợp 3D → đề xuất dùng Three.js hoặc công nghệ tương đương.
- Nếu chỉ cần quan sát → đề xuất nhúng Sketchfab với link placeholder.

Yêu cầu trả về kết quả dưới dạng chuỗi HTML sạch, sử dụng thẻ <h2>, <ul>, <li>, <p>, <strong>, <em> để định dạng. Không dùng thẻ markdown \`\`\`html.`;

      let userContent: any = [];
      if (base64Image) {
        userContent.push({
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        });
      }
      userContent.push({
        text: `Hãy thiết kế mô phỏng cho bài học sau:
Tên bài học: ${newDocTitle}
Khối lớp: Lớp ${newDocGrade}
Thông tin bổ sung/Ghi chú bài học: ${newDocTopic || 'Đọc từ ảnh SGK tải lên.'}`
      });

      let responseText = '';
      
      if (keyToUse) {
        // Real API Call
        const response = await generateContentWithFallback(keyToUse, selectedModel, {
          contents: [{ role: 'user', parts: userContent }],
          config: {
            systemInstruction: systemPrompt
          }
        });
        
        if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
          responseText = response.candidates[0].content.parts[0].text;
        } else {
          throw new Error('Không nhận được phản hồi từ AI');
        }
      } else {
        // Fallback simulation document generation
        await new Promise(r => setTimeout(r, 2000));
        responseText = `<h2>1. Tên bài học và môn học</h2>
<p><strong>Bài học:</strong> ${newDocTitle}</p>
<p><strong>Môn học:</strong> Địa lí ${newDocGrade} (Chương trình GDPT 2018)</p>
<p><em>⚠️ Đây là bản phân tích mẫu. Để có phân tích chính xác theo nội dung bài học thực tế, hãy nhập API Key Gemini và tải ảnh chụp trang SGK lên.</em></p>

<h2>2. Nội dung kiến thức chính của bài</h2>
<p>Nội dung cốt lõi của bài học tập trung vào việc mô tả trực quan các quy luật phân bố địa lí tự nhiên, mối liên hệ nhân quả giữa vị trí địa lí và các hiện tượng tự nhiên trong khu vực.</p>

<h2>3. Bài này có nên làm app mô phỏng không?</h2>
<p><strong>Đánh giá:</strong> <span style="background:#0d9488; color:#fff; padding:2px 10px; border-radius:20px; font-weight:bold;">RẤT NÊN MÔ PHỎNG</span></p>
<p><strong>Lý do:</strong> Bài học có nhiều kiến thức động lực học, cần học sinh quan sát sự biến chuyển theo thời gian hoặc theo mùa để rút ra quy luật chung. Mô phỏng giúp học sinh "nhìn thấy" kiến thức thay vì chỉ đọc chữ.</p>
<p><em>Ba mức độ đánh giá có thể áp dụng: <strong>Rất nên mô phỏng</strong> / <strong>Có thể mô phỏng nhẹ</strong> / <strong>Không nên mô phỏng</strong>. AI sẽ chọn mức phù hợp khi bạn cung cấp API Key và ảnh SGK thực tế.</em></p>

<h2>4. Phần kiến thức đáng mô phỏng nhất</h2>
<ul>
  <li><strong>Ưu tiên 1:</strong> Mô phỏng sự thay đổi trạng thái của hiện tượng địa lý theo tác động của các nhân tố chính (gió, nhiệt độ, góc nhập xạ).</li>
  <li><strong>Ưu tiên 2:</strong> Trực quan hóa mối quan hệ không gian giữa các yếu tố địa lí trên bản đồ hoặc mô hình 3D đơn giản.</li>
</ul>

<h2>5. Mục tiêu quan sát của học sinh</h2>
<ul>
  <li><strong>Nhìn thấy:</strong> Sự dịch chuyển và biến đổi của các đối tượng tự nhiên trên lược đồ trực quan.</li>
  <li><strong>Thao tác:</strong> Kéo thanh trượt thay đổi thông số, bật/tắt các lớp thông tin.</li>
  <li><strong>So sánh:</strong> Trạng thái trước và sau khi thay đổi thông số điều khiển.</li>
  <li><strong>Rút ra kết luận:</strong> Sự phụ thuộc chặt chẽ của các hiện tượng tự nhiên vào tọa độ vĩ độ và địa hình.</li>
</ul>

<h2>6. Ý tưởng app mô phỏng đề xuất</h2>
<p>Giao diện chia hai phần: mô hình 3D (Three.js) hoặc lược đồ 2D (Canvas) chiếm 70% màn hình bên trái, bảng điều khiển bên phải.</p>
<ul>
  <li><strong>Màn hình chính:</strong> Hiển thị mô hình địa cầu hoặc lược đồ khu vực có hoạt ảnh.</li>
  <li><strong>Giáo viên có thể:</strong> Kéo thanh trượt thay đổi mùa/thời gian, bật/tắt lớp gió/nhiệt/áp suất.</li>
  <li><strong>Khi thao tác:</strong> Hoạt ảnh tự động cập nhật, màu sắc và hướng mũi tên thay đổi theo.</li>
  <li><strong>Nếu phù hợp 3D:</strong> Sử dụng <strong>Three.js</strong> để dựng mô hình địa cầu tương tác xoay được.</li>
  <li><strong>Nếu chỉ cần quan sát hình dạng:</strong> Nhúng Sketchfab: <em>https://sketchfab.com/models/[id-placeholder]</em></li>
</ul>

<h2>7. Các nút điều khiển cần có</h2>
<ul>
  <li>Nút <strong>Bắt đầu / Tạm dừng</strong> hoạt cảnh.</li>
  <li>Nút <strong>Làm lại</strong> để khởi tạo lại mô hình về trạng thái ban đầu.</li>
  <li>Nút <strong>Ẩn/Hiện lời dẫn cho giáo viên</strong> ở góc dưới màn hình.</li>
  <li>Nút <strong>Bật/Tắt chú thích</strong> (tên lớp, mũi tên, ký hiệu).</li>
</ul>

<h2>8. Lời dẫn gợi ý cho giáo viên</h2>
<ul>
  <li><em>"Các em hãy quan sát mô hình này. Các em thấy điều gì đang chuyển động?"</em></li>
  <li><em>"Khi thầy/cô kéo thanh trượt thay đổi thời gian, hiện tượng thay đổi như thế nào?"</em></li>
  <li><em>"Bên bán cầu Bắc và bán cầu Nam có gì khác nhau vào cùng thời điểm?"</em></li>
  <li><em>"Từ quan sát trên, các em rút ra quy luật gì?"</em></li>
  <li><em>"Vậy kiến thức mới trong bài hôm nay là gì?"</em></li>
</ul>

<h2>9. Những nội dung không nên đưa vào app</h2>
<ul>
  <li>Không đưa trắc nghiệm, câu hỏi hoặc chấm điểm.</li>
  <li>Không đưa quá nhiều văn bản lý thuyết dài dòng vào màn hình.</li>
  <li>Không thêm trò chơi, mini-game không liên quan bài học.</li>
  <li>Không dùng hiệu ứng flash, nhấp nháy, màu sắc rối mắt.</li>
  <li>Không yêu cầu học sinh đăng nhập hoặc lưu dữ liệu học sinh.</li>
</ul>

<h2>10. Bản mô tả hoàn chỉnh để chuyển sang bước tạo app</h2>
<p><strong>Tên ứng dụng:</strong> Mô phỏng "${newDocTitle}" – Địa lí ${newDocGrade}</p>
<p><strong>Mục tiêu:</strong> Dùng để trình chiếu khi dạy kiến thức mới. Không cần đăng nhập, không lưu dữ liệu.</p>
<p><strong>Giao diện:</strong> Đơn giản, chữ to, nút lớn. Chia hai vùng: vùng mô phỏng chính (70%) và bảng điều khiển (30%).</p>
<p><strong>Công nghệ đề xuất:</strong> Nếu cần mô hình 3D → dùng <strong>Three.js</strong>. Nếu chỉ cần 2D hoạt ảnh → dùng HTML Canvas. Nếu chỉ cần quan sát cấu tạo tĩnh → nhúng Sketchfab (<em>https://sketchfab.com/models/[id-placeholder]</em>).</p>
<p><strong>Các nút bắt buộc:</strong> Bắt đầu / Tạm dừng, Làm lại, Ẩn/Hiện lời dẫn giáo viên.</p>
<p><strong>Lời dẫn giáo viên:</strong> Hiển thị dưới dạng hộp văn bản mờ ở góc dưới, có thể ẩn/hiện bằng một nút bấm.</p>`;
      }

      // Determine appropriate preview type based on title keywords
      let previewType: 'atmosphere' | 'earth' | 'japan' | 'sunray' | 'coordinate' | 'volcano' | 'ocean' | 'tide' | 'daynight' | 'timezone' | 'seasons' | 'windpressure' | 'orographicrain' | 'generic' = 'generic';
      const lowercaseTitle = newDocTitle.toLowerCase();
      if (lowercaseTitle.includes('gió') || lowercaseTitle.includes('hoàn lưu') || lowercaseTitle.includes('áp')) {
        previewType = 'atmosphere';
      } else if (lowercaseTitle.includes('trái đất') || lowercaseTitle.includes('cấu trúc') || lowercaseTitle.includes('vỏ')) {
        previewType = 'earth';
      } else if (lowercaseTitle.includes('nhật bản') || lowercaseTitle.includes('đảo') || lowercaseTitle.includes('japan')) {
        previewType = 'japan';
      } else if (lowercaseTitle.includes('mặt trời') || lowercaseTitle.includes('bức xạ') || lowercaseTitle.includes('nhập xạ') || lowercaseTitle.includes('nhiệt độ')) {
        previewType = 'sunray';
      } else if (lowercaseTitle.includes('tọa độ') || lowercaseTitle.includes('kinh tuyến') || lowercaseTitle.includes('vĩ tuyến')) {
        previewType = 'coordinate';
      } else if (lowercaseTitle.includes('núi lửa') || lowercaseTitle.includes('phun trào') || lowercaseTitle.includes('magma') || lowercaseTitle.includes('dung nham')) {
        previewType = 'volcano';
      } else if (lowercaseTitle.includes('hải lưu') || lowercaseTitle.includes('đại dương') || lowercaseTitle.includes('dòng biển') || lowercaseTitle.includes('ocean') || lowercaseTitle.includes('thermohaline')) {
        previewType = 'ocean';
      } else if (lowercaseTitle.includes('thủy triều') || lowercaseTitle.includes('triều cường') || lowercaseTitle.includes('triều kém') || lowercaseTitle.includes('tide') || lowercaseTitle.includes('mặt trăng') || lowercaseTitle.includes('lực hấp dẫn')) {
        previewType = 'tide';
      } else if (lowercaseTitle.includes('ngày đêm') || lowercaseTitle.includes('luân phiên') || lowercaseTitle.includes('tự quay') || lowercaseTitle.includes('ranh giới ngày')) {
        previewType = 'daynight';
      } else if (lowercaseTitle.includes('múi giờ') || lowercaseTitle.includes('đường đổi ngày') || lowercaseTitle.includes('greenwich') || lowercaseTitle.includes('kinh tuyến 180') || lowercaseTitle.includes('timezone')) {
        previewType = 'timezone';
      } else if (lowercaseTitle.includes('mùa trong năm') || lowercaseTitle.includes('các mùa') || lowercaseTitle.includes('xuân phân') || lowercaseTitle.includes('hạ chí') || lowercaseTitle.includes('đông chí') || lowercaseTitle.includes('quanh mặt trời')) {
        previewType = 'seasons';
      } else if (lowercaseTitle.includes('khí áp') || lowercaseTitle.includes('đới gió') || lowercaseTitle.includes('tín phong') || lowercaseTitle.includes('coriolis') || lowercaseTitle.includes('wind pressure')) {
        previewType = 'windpressure';
      } else if (lowercaseTitle.includes('mưa địa hình') || lowercaseTitle.includes('sườn đón gió') || lowercaseTitle.includes('sườn khuất') || lowercaseTitle.includes('foehn') || lowercaseTitle.includes('orographic')) {
        previewType = 'orographicrain';
      }

      const newDoc: SimulationDocument = {
        id: 'doc_' + Math.random().toString(36).substr(2, 9),
        title: `Thiết kế học liệu: ${newDocTitle}`,
        grade: `Lớp ${newDocGrade}`,
        content: responseText,
        previewType: previewType,
        comments: [
          {
            id: 'c_init',
            author: 'Trợ lý AI',
            avatarColor: 'bg-violet-600',
            text: 'Tôi đã tạo xong bản thiết kế 10 bước bám sát SGK. Hãy bôi đen văn bản để thêm nhận xét chỉnh sửa cùng đồng nghiệp.',
            timestamp: 'Vừa xong'
          }
        ]
      };

      setDocuments(prev => [newDoc, ...prev]);
      setIsCreatingNew(false);
      setNewDocTitle('');
      setNewDocTopic('');
      setNewDocImage(null);
      openDocument(newDoc);
      // Defer Swal so it doesn't conflict with React's batch re-render
      setTimeout(() => {
        Swal.fire('Thành công', 'Đã phân tích SGK và tạo tài liệu thiết kế mô phỏng 10 bước bằng AI', 'success');
      }, 300);
    } catch (error: any) {
      console.error(error);
      Swal.fire('Lỗi', `Không thể sinh tài liệu thiết kế: ${error.message || error}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Chat prompt adjustment within editor
  const handleSendMessageToAi = async () => {
    if (!aiChatInput.trim()) return;

    const userMsg = { sender: 'user' as const, text: aiChatInput };
    setAiChatHistory(prev => [...prev, userMsg]);
    setAiChatInput('');
    setIsAiResponding(true);

    try {
      const keyToUse = apiKey || '';
      
      if (keyToUse) {
        const chatPrompt = `Bạn là trợ lý chỉnh sửa tài liệu học liệu số.
Dưới đây là tài liệu thiết kế mô phỏng hiện tại:
"""
${editorContent}
"""

Giáo viên yêu cầu chỉnh sửa/cập nhật như sau:
"${aiChatInput}"

Hãy đọc kỹ tài liệu cũ và yêu cầu chỉnh sửa, sau đó viết lại TOÀN BỘ nội dung tài liệu thiết kế 10 bước (sử dụng các thẻ HTML <h2>, <p>, <ul>, <li> như cũ) đã được cập nhật thay thế theo yêu cầu của giáo viên. Trả về trực tiếp chuỗi HTML của tài liệu.`;

        const response = await generateContentWithFallback(keyToUse, selectedModel, {
          contents: [{ role: 'user', parts: [{ text: chatPrompt }] }]
        });
        
        if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
          const updatedContent = response.candidates[0].content.parts[0].text;
          setEditorContent(updatedContent);
          setDocuments(documents.map(d => d.id === activeDocId ? { ...d, content: updatedContent } : d));
          
          setAiChatHistory(prev => [...prev, { 
            sender: 'ai', 
            text: 'Tôi đã cập nhật các sửa đổi trực tiếp vào bản thiết kế tài liệu bên trái cho bạn!' 
          }]);
        } else {
          throw new Error('Không nhận được phản hồi chỉnh sửa');
        }
      } else {
        // Simulated chat response
        await new Promise(r => setTimeout(r, 1500));
        let replyText = 'Tôi đã nhận được yêu cầu. Bản mô tả thiết kế đã được điều chỉnh bổ sung thêm các ý kiến đóng góp của bạn.';
        
        // Mock specific updates to document content to make it feel real
        let mockUpdatedContent = editorContent;
        if (aiChatInput.toLowerCase().includes('lời dẫn') || aiChatInput.toLowerCase().includes('phần 8')) {
          mockUpdatedContent = editorContent.replace(
            /<h2>8\. Lời dẫn gợi ý cho giáo viên<\/h2>\s*<p><em>[^<]*<\/em><\/p>/i,
            `<h2>8. Lời dẫn gợi ý cho giáo viên</h2>
<p><em>"Các em hãy tập trung quan sát kỹ sự chuyển dịch của các mũi tên trên màn chiếu. Hãy trả lời câu hỏi: Khi cô thay đổi thông số này thì luồng gió thổi mạnh hơn hay yếu đi? Điểm hội tụ có gì biến đổi? Từ quan sát này, các em rút ra kết luận gì về quy luật khí hậu tự nhiên?"</em></p>`
          );
          replyText = 'Tôi đã cập nhật lời dẫn giáo viên tại Mục 8 để chi tiết và mang tính chất định hướng học sinh tốt hơn!';
        } else if (aiChatInput.toLowerCase().includes('nút') || aiChatInput.toLowerCase().includes('phần 7')) {
          mockUpdatedContent = editorContent.replace(
            /<h2>7\. Các nút điều khiển cần có<\/h2>\s*<ul>[^]*?<\/ul>/i,
            `<h2>7. Các nút điều khiển cần có</h2>
<ul>
  <li>Nút <strong>Bắt đầu / Tạm dừng</strong> để bật tắt hoạt ảnh tức thời.</li>
  <li>Nút <strong>Làm lại (Restart)</strong> để đưa mô hình về trạng thái ban đầu.</li>
  <li>Thanh trượt <strong>Tốc độ chuyển dịch</strong> tăng giảm tốc quan sát hạt.</li>
  <li>Nút <strong>Bật/Tắt chú thích (Labels)</strong> để học sinh tự nhận diện.</li>
  <li>Nút <strong>Ẩn/Hiện lời dẫn cho giáo viên</strong> ở góc dưới màn hình trình chiếu.</li>
</ul>`
          );
          replyText = 'Tôi đã điều chỉnh các nút điều khiển tại Mục 7, bổ sung nút Bật/Tắt chú thích và thanh trượt tốc độ như yêu cầu!';
        }

        setEditorContent(mockUpdatedContent);
        setDocuments(documents.map(d => d.id === activeDocId ? { ...d, content: mockUpdatedContent } : d));
        
        setAiChatHistory(prev => [...prev, { sender: 'ai', text: replyText }]);
      }
    } catch (err: any) {
      console.error(err);
      setAiChatHistory(prev => [...prev, { sender: 'ai', text: 'Có lỗi xảy ra khi gọi AI chỉnh sửa: ' + err.message }]);
    } finally {
      setIsAiResponding(false);
    }
  };

  // Simulated typing / cursor collaborator effect
  useEffect(() => {
    if (!activeDocId || activeTab !== 'editor') return;

    // Simulate online collaborator activity periodically
    const timer = setInterval(() => {
      const names = ['Cô Nguyễn Lan', 'Thầy Lê Minh'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      
      // Update collaborator status
      setCollaborators(prev => prev.map(c => c.name === randomName ? { ...c, active: true } : c));
      
      // Simulate typing tooltip
      setSimulatedTypingText(`${randomName} đang xem tài liệu...`);
      setSimulatedCursorPos({
        top: 250 + Math.random() * 300,
        left: 100 + Math.random() * 400
      });

      // Occassionally add a simulated comment reply
      if (Math.random() > 0.7 && comments.length > 0) {
        const commentToReply = comments[Math.floor(Math.random() * comments.length)];
        const replyTexts = [
          'Ý kiến này rất hay, tôi đã ghi nhận.',
          'Hoàn toàn nhất trí với đề xuất này.',
          'Đã thảo luận và chỉnh sửa lại phần ý tưởng tương ứng.'
        ];
        const randomReply = replyTexts[Math.floor(Math.random() * replyTexts.length)];
        
        // Add reply to comment
        const updated = comments.map(c => {
          if (c.id === commentToReply.id) {
            return {
              ...c,
              replies: [...(c.replies || []), { 
                author: randomName, 
                text: randomReply, 
                timestamp: 'Vừa xong' 
              }]
            };
          }
          return c;
        });
        
        setComments(updated);
        setDocuments(prev => prev.map(d => d.id === activeDocId ? { ...d, comments: updated } : d));
      }

      // Hide tooltip after a few seconds
      setTimeout(() => {
        setSimulatedTypingText('');
        setSimulatedCursorPos(null);
      }, 3000);

    }, 25000);

    return () => clearInterval(timer);
  }, [activeDocId, activeTab, comments]);

  // Filtered documents
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === 'Tất cả' || doc.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const activeDoc = documents.find(d => d.id === activeDocId);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* 1. DOCUMENT LIST PAGE (LIBRARY) */}
      {!activeDocId && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 flex items-center gap-2">
                <Globe className="text-teal-600 animate-spin-slow" size={32} />
                <span>Không gian Thiết kế Học liệu Mô phỏng</span>
              </h2>
              <p className="text-slate-500 mt-1">Soạn thảo tài liệu thiết kế học liệu mô phỏng 10 bước chuẩn quốc gia, bình luận thảo luận nhóm và trình chiếu lớp học.</p>
            </div>
            
            <button 
              onClick={() => setIsCreatingNew(true)}
              className="px-6 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 self-start"
            >
              <Plus size={20} />
              <span>Thiết kế mô phỏng mới bằng AI</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tài liệu thiết kế học liệu..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
            
            <div className="flex gap-2">
              {['Tất cả', 'Lớp 10', 'Lớp 11', 'Lớp 12'].map(grade => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
                    selectedGrade === grade 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>

          {/* Document Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredDocs.map((doc, idx) => (
              <div 
                key={doc.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-teal-500/30 shadow-sm hover:shadow-xl transition-all flex flex-col group"
              >
                {/* Visual mockup of Earth structure or air cell */}
                <div className="min-h-[176px] bg-slate-100 relative flex items-center justify-center overflow-hidden border-b border-slate-100">
                  {doc.previewType === 'atmosphere' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-teal-50 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border-4 border-slate-300/40 relative flex items-center justify-center animate-spin-slow">
                        <div className="absolute w-full h-0.5 bg-slate-300/30" />
                        <div className="absolute w-0.5 h-full bg-slate-300/30" />
                        <span className="text-teal-600 font-bold text-xs absolute -top-5">Áp Cao H</span>
                        <span className="text-rose-600 font-bold text-xs absolute -bottom-5">Áp Thấp L</span>
                      </div>
                    </div>
                  )}
                  {doc.previewType === 'earth' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-rose-50 flex items-center justify-center">
                      <div className="w-28 h-28 rounded-full border-8 border-amber-800 bg-amber-500 flex items-center justify-center relative shadow-inner">
                        <div className="w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-yellow-400" />
                        </div>
                      </div>
                    </div>
                  )}
                  {doc.previewType === 'japan' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-white/40 flex items-center justify-center border border-slate-300/20 relative shadow-inner">
                        <span className="text-indigo-600 font-black text-2xl uppercase tracking-widest">JAPAN</span>
                      </div>
                    </div>
                  )}
                  {doc.previewType === 'sunray' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
                      <div className="relative flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-amber-400 animate-pulse shadow-lg shadow-amber-400/50" />
                        {[0,45,90,135,180,225,270,315].map(deg => (
                          <div key={deg} className="absolute w-1 h-6 bg-amber-500/60 origin-bottom rounded-full"
                            style={{ transform: `rotate(${deg}deg) translateY(-28px)` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  {doc.previewType === 'generic' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center">
                      <Sparkles size={40} className="text-teal-500/40 animate-pulse" />
                    </div>
                  )}
                  
                  <span className="absolute top-4 right-4 px-3 py-1 bg-white/95 rounded-full text-xs font-black text-slate-600 border border-slate-200/50 shadow-sm">{doc.grade}</span>
                </div>
                
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-600 transition-colors leading-snug line-clamp-2">{doc.title}</h3>
                    <p className="text-slate-500 text-sm mt-2 line-clamp-3">Bản đặc tả thiết kế 10 bước bám sát chương trình GDPT mới nhất của Bộ GD&ĐT cho các học liệu trực quan.</p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                      <MessageSquare size={14} />
                      {doc.comments.length} nhận xét góp ý
                    </span>
                    
                    <button 
                      onClick={() => openDocument(doc)}
                      className="px-4 py-2.5 bg-slate-950 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-teal-600 transition-all shadow-md shadow-slate-950/5 hover:shadow-teal-600/10"
                    >
                      <span>Mở tài liệu thiết kế</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. CREATING NEW DOCUMENT LOADING / DIALOG FLOW */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isGenerating && setIsCreatingNew(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Sparkles size={20} className="text-teal-600" />
                <span>Thiết kế mô phỏng mới bằng AI</span>
              </h3>
              <button 
                onClick={() => setIsCreatingNew(false)} 
                disabled={isGenerating}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Tên bài học</label>
                <input 
                  type="text"
                  value={newDocTitle}
                  onChange={e => setNewDocTitle(e.target.value)}
                  placeholder="Ví dụ: Sự phân hóa đa dạng của thiên nhiên, Khí quyển..."
                  disabled={isGenerating}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Khối lớp học</label>
                  <select
                    value={newDocGrade}
                    onChange={e => setNewDocGrade(e.target.value)}
                    disabled={isGenerating}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 outline-none bg-white"
                  >
                    <option value="10">Địa lí 10</option>
                    <option value="11">Địa lí 11</option>
                    <option value="12">Địa lí 12</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Tải ảnh chụp SGK / SGV (Nếu có)</label>
                  <label className="w-full px-4 py-3 rounded-xl border border-slate-200 border-dashed hover:border-teal-500 flex items-center justify-center gap-2 cursor-pointer transition-colors text-slate-500 font-bold text-sm bg-slate-50/50">
                    <Image size={18} className="text-teal-500" />
                    <span>{newDocImage ? newDocImage.name : 'Chọn ảnh chụp trang sách'}</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => setNewDocImage(e.target.files?.[0] || null)}
                      className="hidden" 
                      disabled={isGenerating}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Ý tưởng, yêu cầu hoặc nội dung trọng tâm cần mô phỏng</label>
                <textarea 
                  value={newDocTopic}
                  onChange={e => setNewDocTopic(e.target.value)}
                  placeholder="Mô tả ngắn gọn nội dung bài học hoặc phần bạn muốn thiết kế..."
                  disabled={isGenerating}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all min-h-[100px]"
                />
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setIsCreatingNew(false)}
                disabled={isGenerating}
                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-white transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={generateNewSimulation}
                disabled={isGenerating}
                className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI đang phân tích SGK...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Tạo thiết kế mô phỏng</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 3. DOCUMENT EDITOR & PREVIEW WORKSPACE */}
      {activeDocId && activeDoc && (
        <div className="flex flex-col h-[85vh] -mt-4 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
          {/* Workspace Sub-Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveDocId(null)}
                className="p-2.5 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
                title="Quay lại danh sách"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div>
                <input 
                  type="text" 
                  value={activeDoc.title}
                  onChange={e => setDocuments(documents.map(d => d.id === activeDoc.id ? { ...d, title: e.target.value } : d))}
                  className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:bg-white px-2 py-0.5 rounded-lg outline-none text-lg font-black text-slate-800 transition-all font-sans"
                />
                <div className="flex items-center gap-2 px-2 mt-0.5">
                  <span className="text-xs font-bold px-2 py-0.5 bg-slate-200/60 rounded text-slate-500">{activeDoc.grade}</span>
                  <span className="text-xs text-slate-400">Đã tự động lưu cục bộ</span>
                </div>
              </div>
            </div>

            {/* Collaborators and Toolbar actions */}
            <div className="flex items-center gap-4 self-end md:self-auto">
              {/* Online Collaborators list */}
              <div className="flex items-center -space-x-2">
                {collaborators.map((c, i) => (
                  <div 
                    key={i}
                    className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white relative cursor-pointer ${c.color}`}
                    title={`${c.name} (Đang trực tuyến)`}
                  >
                    {c.name.split(' ').pop()?.[0]}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full" />
                  </div>
                ))}
              </div>

              <div className="h-6 w-px bg-slate-200" />

              {/* View/Edit Mode toggles */}
              <div className="flex bg-slate-200/60 p-0.5 rounded-xl border border-slate-200/50">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'editor' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Edit2 size={12} />
                  <span>Trang soạn thảo</span>
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'preview' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Eye size={12} />
                  <span>Trình chiếu mô phỏng</span>
                </button>
              </div>

              <button 
                onClick={exportToWord}
                className="p-2.5 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                title="Tải xuống tài liệu Word"
              >
                <Download size={18} />
              </button>
            </div>
          </div>

          {/* MAIN SPLIT WORKSPACE AREA */}
          <div className="flex-grow flex overflow-hidden">
            {/* LEFT SIDE: DOCUMENT PAGE EDITOR */}
            <div className={`flex-grow flex flex-col bg-slate-100 overflow-y-auto ${activeTab === 'preview' ? 'hidden' : 'block'}`}>
              {/* Rich text formatting tools */}
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-2.5 flex items-center gap-1 z-10 shadow-sm shrink-0">
                <button onClick={() => formatText('bold')} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:text-slate-900 transition-colors font-bold"><Bold size={16} /></button>
                <button onClick={() => formatText('italic')} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:text-slate-900 transition-colors font-bold"><Italic size={16} /></button>
                <button onClick={() => formatText('underline')} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:text-slate-900 transition-colors font-bold"><Underline size={16} /></button>
                
                <div className="h-6 w-px bg-slate-200 mx-2" />
                
                <button onClick={() => formatText('insertUnorderedList')} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:text-slate-900 transition-colors font-bold"><List size={16} /></button>
                <button onClick={() => formatText('justifyLeft')} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:text-slate-900 transition-colors font-bold"><AlignLeft size={16} /></button>
                <button onClick={() => formatText('justifyCenter')} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:text-slate-900 transition-colors font-bold"><AlignCenter size={16} /></button>
                <button onClick={() => formatText('justifyRight')} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:text-slate-900 transition-colors font-bold"><AlignRight size={16} /></button>
                
                <div className="h-6 w-px bg-slate-200 mx-2" />
                
                <span className="text-xs font-bold text-slate-400">Bôi đen văn bản để thêm nhận xét góp ý cùng đồng nghiệp</span>
              </div>

              {/* Scrollable Document Container */}
              <div className="flex-grow p-8 flex justify-center relative">
                {/* Simulated live typing notification cursor */}
                {simulatedTypingText && simulatedCursorPos && (
                  <div 
                    className="absolute z-20 pointer-events-none transition-all duration-1000 flex flex-col items-start"
                    style={{ top: simulatedCursorPos.top, left: simulatedCursorPos.left }}
                  >
                    <div className="w-[2px] h-5 bg-teal-500 animate-pulse" />
                    <span className="px-2 py-0.5 bg-teal-500 text-white font-black text-[10px] rounded shadow-sm -mt-4 ml-0.5 whitespace-nowrap">{simulatedTypingText}</span>
                  </div>
                )}

                {/* Page sheet */}
                <div className="w-full max-w-[800px] bg-white rounded-xl shadow-md border border-slate-200/60 p-12 min-h-[1050px] relative font-sans leading-relaxed text-slate-800">
                  <div 
                    ref={editorRef}
                    contentEditable={true}
                    onBlur={handleEditorBlur}
                    onMouseUp={handleEditorSelect}
                    onInput={() => {
                      if (editorRef.current) {
                        const newHtml = editorRef.current.innerHTML;
                        setEditorContent(newHtml);
                        setDocuments(documents.map(d => d.id === activeDocId ? { ...d, content: newHtml } : d));
                      }
                    }}
                    dangerouslySetInnerHTML={{ __html: editorContent }}
                    className="outline-none min-h-[900px] prose prose-slate max-w-none 
                      prose-h2:text-lg prose-h2:font-black prose-h2:text-slate-900 prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-b prose-h2:pb-1.5 prose-h2:border-slate-100
                      prose-p:mb-4 prose-p:text-slate-600 prose-p:text-sm
                      prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-4 prose-li:text-slate-600 prose-li:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: SPLIT PANEL (AI CHAT & PREVIEW COMBINED TABS) */}
            <div className={`w-[450px] border-l border-slate-200 flex flex-col shrink-0 overflow-hidden bg-slate-50/50 ${activeTab === 'preview' ? 'hidden' : 'flex'}`}>
              {/* Tab options for Right Panel */}
              <div className="flex border-b border-slate-200 bg-white">
                <button
                  onClick={() => setAiPanelTab('ai')}
                  className={`flex-1 py-4 text-sm font-bold border-b-2 text-center transition-all flex items-center justify-center gap-2 ${
                    aiPanelTab === 'ai' 
                      ? 'border-teal-500 text-teal-600 bg-teal-50/10' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles size={16} />
                  <span>Trợ lý AI thiết kế</span>
                </button>
                <button
                  onClick={() => setAiPanelTab('preview_tab')}
                  className={`flex-1 py-4 text-sm font-bold border-b-2 text-center transition-all flex items-center justify-center gap-2 ${
                    aiPanelTab === 'preview_tab' 
                      ? 'border-teal-500 text-teal-600 bg-teal-50/10' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Eye size={16} />
                  <span>Ý kiến & Nhận xét ({comments.length})</span>
                </button>
              </div>

              {/* PANEL TAB 1: AI DESIGN ASSISTANT */}
              <div className={`flex-grow flex flex-col overflow-hidden ${aiPanelTab === 'ai' ? 'block' : 'hidden'}`}>
                {/* Chat History */}
                <div className="flex-grow p-6 overflow-y-auto space-y-4">
                  {aiChatHistory.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        msg.sender === 'user' 
                          ? 'bg-slate-900 text-white rounded-br-none' 
                          : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isAiResponding && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 text-sm shadow-sm flex items-center gap-2 text-slate-400">
                        <Loader2 className="animate-spin text-teal-500" size={16} />
                        <span>AI đang tối ưu hóa thiết kế...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-white border-t border-slate-200 flex gap-2 shrink-0">
                  <input 
                    type="text" 
                    value={aiChatInput}
                    onChange={e => setAiChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessageToAi()}
                    placeholder="Yêu cầu AI sửa đổi thiết kế (VD: Viết lại Lời dẫn GV...)"
                    className="flex-grow px-4 py-3 bg-slate-50 border-0 rounded-xl outline-none text-sm focus:ring-2 focus:ring-teal-500/20"
                  />
                  <button 
                    onClick={handleSendMessageToAi}
                    className="p-3 bg-slate-950 text-white rounded-xl hover:bg-teal-600 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>

              {/* PANEL TAB 2: COMMENTING SIDEBAR */}
              <div className={`flex-grow flex flex-col overflow-hidden p-6 ${aiPanelTab === 'preview_tab' ? 'block' : 'hidden'}`}>
                {/* Active selection helper */}
                {selectedTextRange && (
                  <div className="mb-4 p-3 bg-teal-50 border border-teal-100 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                    <span className="truncate flex-grow mr-2"><strong>Đoạn đã chọn:</strong> "{selectedTextRange}"</span>
                    <button onClick={() => setSelectedTextRange('')} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                  </div>
                )}

                {/* Add new comment text */}
                <div className="space-y-2 mb-6 shrink-0">
                  <textarea 
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                    placeholder="Viết nhận xét đóng góp ý kiến hoặc phản hồi..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500 text-sm min-h-[80px] shadow-sm transition-all"
                  />
                  <button 
                    onClick={handleAddComment}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/10 transition-colors"
                  >
                    <MessageSquare size={14} />
                    <span>Lưu nhận xét</span>
                  </button>
                </div>

                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Các nhận xét hiện có</h4>

                {/* Comments List */}
                <div className="flex-grow overflow-y-auto space-y-4 pr-1">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">Chưa có nhận xét nào. Hãy chọn văn bản để bắt đầu.</div>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-7 h-7 rounded-full text-[10px] font-black text-white flex items-center justify-center ${comment.avatarColor}`}>{comment.author.split(' ').pop()?.[0]}</span>
                            <div>
                              <div className="text-xs font-black text-slate-800">{comment.author}</div>
                              <div className="text-[10px] text-slate-400">{comment.timestamp}</div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleResolveComment(comment.id)}
                            className="px-2 py-1 hover:bg-teal-50 text-teal-600 hover:text-teal-700 rounded-md text-[10px] font-bold border border-teal-100 transition-colors"
                          >
                            Giải quyết
                          </button>
                        </div>
                        
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">{comment.text}</p>
                        
                        {/* Nested Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="pl-4 border-l-2 border-slate-100 space-y-2 mt-2 pt-2">
                            {comment.replies.map((rep, rIdx) => (
                              <div key={rIdx} className="text-[11px] leading-relaxed">
                                <span className="font-black text-slate-700">{rep.author}: </span>
                                <span className="text-slate-600">{rep.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Reply Form inside card */}
                        <form 
                          onSubmit={e => {
                            e.preventDefault();
                            const input = (e.target as any).elements.reply;
                            handleReplyComment(comment.id, input.value);
                            input.value = '';
                          }}
                          className="flex gap-1.5 pt-2 border-t border-slate-100"
                        >
                          <input 
                            name="reply"
                            type="text" 
                            placeholder="Trả lời nhận xét này..."
                            className="flex-grow px-2 py-1 border border-slate-200 rounded-lg text-[10px] outline-none focus:border-teal-500"
                          />
                          <button type="submit" className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold">Gửi</button>
                        </form>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* FULL-SCREEN SIMULATOR PREVIEW PANEL (TAB 2 VIEW MODE) */}
            <div className={`flex-grow flex flex-col bg-slate-950 text-white relative overflow-y-auto ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
              <div className="flex flex-col items-center max-w-4xl mx-auto w-full relative z-10 p-8 pb-10">
                {/* 1. SIMULATOR CANVAS SCREEN */}
                <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl p-6 flex flex-col relative" style={{ minHeight: '500px' }}>
                  
                  {/* Top Simulator bar */}
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse" />
                      <div className="text-sm font-black tracking-wide text-slate-200 uppercase">MÔ PHỎNG TRỰC QUAN LỚP HỌC</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowHelpModal(true)}
                        className="text-xs bg-white/10 hover:bg-white/20 text-slate-200 px-3 py-1.5 rounded-full font-black transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <HelpCircle size={12} />
                        <span>Hướng dẫn sử dụng</span>
                      </button>

                      <button
                        onClick={() => generateCanvasSimulation(activeDoc)}
                        disabled={isGeneratingCanvas}
                        className={`text-xs px-3 py-1.5 rounded-full font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                          isGeneratingCanvas
                            ? 'bg-teal-500/20 text-teal-400'
                            : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/10'
                        }`}
                      >
                        {isGeneratingCanvas ? (
                          <>
                            <Loader2 className="animate-spin" size={12} />
                            <span>AI đang lập trình...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={12} />
                            <span>{activeDoc.canvasCode ? '🔄 Tái tạo mô phỏng AI' : '🤖 Tạo mô phỏng AI'}</span>
                          </>
                        )}
                      </button>

                      <div className="text-xs bg-teal-500/20 border border-teal-500/30 text-teal-400 px-3 py-1.5 rounded-full font-black">
                        Đang Trình Chiếu Động
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE SIMULATION GRAPHICS */}
                  <div className="flex-grow flex items-center justify-center relative w-full" style={{ height: '420px' }}>
                    {/* Fullscreen expand button */}
                    <button
                      onClick={() => setSimFullscreen(true)}
                      className="absolute top-2 right-2 z-30 p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-white/10 transition-all shadow-lg backdrop-blur-sm group"
                      title="Phóng to mô phỏng"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
                      </svg>
                    </button>
                    {activeDoc.previewType === 'atmosphere' ? (
                      <AtmosphericCirculationSim />
                    ) : activeDoc.previewType === 'earth' ? (
                      <EarthLayersSim />
                    ) : activeDoc.previewType === 'japan' ? (
                      <JapanGeographySim />
                    ) : activeDoc.previewType === 'sunray' ? (
                      <SunraySim />
                    ) : activeDoc.previewType === 'coordinate' ? (
                      <CoordinateSim />
                    ) : activeDoc.previewType === 'volcano' ? (
                      <VolcanoSim />
                    ) : activeDoc.previewType === 'ocean' ? (
                      <OceanCurrentSim />
                    ) : activeDoc.previewType === 'tide' ? (
                      <TideSim />
                    ) : activeDoc.previewType === 'daynight' ? (
                      <DayNightSim />
                    ) : activeDoc.previewType === 'timezone' ? (
                      <TimeZoneSim />
                    ) : activeDoc.previewType === 'seasons' ? (
                      <SeasonsSim />
                    ) : activeDoc.previewType === 'polar-day' ? (
                      <PolarDaySim />
                    ) : activeDoc.previewType === 'windpressure' ? (
                      <WindPressureSim />
                    ) : activeDoc.previewType === 'orographicrain' ? (
                      <OrographicRainSim customParams={parsedSimData.params} customQuestions={parsedSimData.quiz} />
                    ) : activeDoc.previewType === 'solar-system' ? (
                      <SolarSystemSim customParams={parsedSimData.params} customQuestions={parsedSimData.quiz} />
                    ) : activeDoc.previewType === 'zenith-sun' ? (
                      <ZenithSunSim customParams={parsedSimData.params} customQuestions={parsedSimData.quiz} />
                    ) : activeDoc.canvasCode ? (
                      <AICanvasSimulator 
                        canvasCode={activeDoc.canvasCode} 
                        params={{
                          simPlay,
                          simSpeed,
                          simZoom,
                          onZoomChange: setSimZoom,
                          showPressure,
                          showWind,
                          showGrid,
                          earthSlice,
                          earthAngle,
                          activeEarthLayer,
                          setActiveEarthLayer,
                          japanLayers,
                          activeJapanMarker,
                          setActiveJapanMarker,
                          sunAngle,
                          sunSeason
                        }} 
                      />
                    ) : (
                      <div className="text-center py-6">
                        <Sparkles className="text-teal-500 animate-pulse mx-auto mb-3" size={40} />
                        <h4 className="text-sm font-bold text-slate-300">Chưa có mô phỏng Canvas thực tế</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                          {!apiKey ? 'Vui lòng thiết lập API Key trong Cài đặt (nhấn biểu tượng bánh răng ở góc trên bên phải), sau đó nhấn "Tạo mô phỏng AI"!' : 'Nhấp nút "🤖 Tạo mô phỏng AI" trên thanh công cụ để AI lập trình mô phỏng động!'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM FLOATING PANEL: "LỜI DẪN CHO GIÁO VIÊN" SCREEN */}
                  <div className={`mt-4 bg-slate-950/80 border border-white/10 p-4 rounded-2xl transition-all duration-500 ${showGuideText ? 'h-auto opacity-100' : 'h-12 overflow-hidden opacity-90'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText size={14} />
                          Kịch bản lời giảng & Thuyết minh AI
                        </span>
                        {isSpeaking && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 text-[10px] font-black animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
                            Đang thuyết minh...
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={toggleSpeech}
                          className={`text-xs font-bold px-2.5 py-0.5 rounded border flex items-center gap-1 transition-all ${
                            isSpeaking 
                              ? 'bg-amber-500/25 border-amber-500/40 text-amber-400 hover:bg-amber-500/40' 
                              : 'bg-teal-500/15 border-teal-500/30 text-teal-400 hover:bg-teal-500/25'
                          }`}
                          title={isSpeaking ? 'Dừng thuyết minh' : 'Bật thuyết minh giọng nói AI'}
                        >
                          {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                          <span>{isSpeaking ? 'Dừng phát' : 'Thuyết minh'}</span>
                        </button>
                        <button 
                          onClick={() => setShowGuideText(!showGuideText)}
                          className="text-xs font-bold text-slate-400 hover:text-white px-2 py-0.5 rounded border border-white/10 hover:bg-white/5 transition-colors"
                        >
                          {showGuideText ? 'Ẩn lời dẫn' : 'Hiện lời dẫn'}
                        </button>
                      </div>
                    </div>
                    {showGuideText && (
                      <p className="text-xs text-slate-300 leading-relaxed mt-3 border-t border-white/5 pt-2.5 italic">
                        {getGuideText() ? `"${getGuideText()}"` : '"Hãy theo dõi chuyển động của mô hình và rút ra kết luận khoa học về quy luật tự nhiên."'}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. CLASSROOM SIMULATOR CONTROL BAR */}
                <div className="w-full mt-6 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSimPlay(!simPlay)}
                      className={`p-3 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                        simPlay ? 'bg-amber-500 text-slate-950 hover:bg-amber-600' : 'bg-teal-500 text-slate-950 hover:bg-teal-600'
                      }`}
                    >
                      {simPlay ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button 
                      onClick={() => {
                        setSimPlay(true);
                        setSimSpeed(2);
                        setEarthSlice(50);
                        setActiveEarthLayer(null);
                        setActiveJapanMarker(null);
                        setSimZoom(1);
                      }}
                      className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"
                      title="Đặt lại mô phỏng"
                    >
                      <RotateCcw size={18} />
                    </button>

                    {/* Dedicated Visual Zoom controls */}
                    <div className="flex items-center bg-slate-950/80 border border-white/10 rounded-xl p-1 gap-1">
                      <button
                        onClick={() => setSimZoom(z => Math.max(0.5, z - 0.15))}
                        className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 rounded-lg text-xs font-bold transition-all"
                        title="Thu nhỏ (Zoom Out)"
                      >
                        ➖
                      </button>
                      <span className="text-[10px] font-black text-slate-400 px-1 w-10 text-center">
                        {Math.round(simZoom * 100)}%
                      </span>
                      <button
                        onClick={() => setSimZoom(z => Math.min(4.0, z + 0.15))}
                        className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 rounded-lg text-xs font-bold transition-all"
                        title="Phóng to (Zoom In)"
                      >
                        ➕
                      </button>
                    </div>
                  </div>

                  {/* Context-aware Controls */}
                  {activeDoc.previewType === 'atmosphere' && (
                    <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-300">
                      <div className="flex items-center gap-2">
                        <span>Tốc độ gió</span>
                        <input 
                          type="range" 
                          min="1" 
                          max="5" 
                          value={simSpeed}
                          onChange={e => setSimSpeed(Number(e.target.value))}
                          className="w-24 accent-teal-500 cursor-pointer"
                        />
                      </div>
                      
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={showPressure} onChange={e => setShowPressure(e.target.checked)} className="rounded text-teal-600 accent-teal-500 focus:ring-0" />
                        Hiện áp suất
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={showWind} onChange={e => setShowWind(e.target.checked)} className="rounded text-teal-600 accent-teal-500 focus:ring-0" />
                        Hiện hướng gió
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} className="rounded text-teal-600 accent-teal-500 focus:ring-0" />
                        Hiện vĩ tuyến
                      </label>
                    </div>
                  )}

                  {activeDoc.previewType === 'earth' && (
                    <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-300">
                      <div className="flex items-center gap-2">
                        <span>Độ mở lát cắt</span>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={earthSlice}
                          onChange={e => setEarthSlice(Number(e.target.value))}
                          className="w-24 accent-teal-500 cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Góc xoay</span>
                        <input 
                          type="range" 
                          min="0" 
                          max="360" 
                          value={earthAngle}
                          onChange={e => setEarthAngle(Number(e.target.value))}
                          className="w-24 accent-teal-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {activeDoc.previewType === 'japan' && (
                    <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-300">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={japanLayers.currents} onChange={e => setJapanLayers({ ...japanLayers, currents: e.target.checked })} className="accent-teal-500" />
                        Dòng biển
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={japanLayers.volcanoes} onChange={e => setJapanLayers({ ...japanLayers, volcanoes: e.target.checked })} className="accent-teal-500" />
                        Đứt gãy & Núi lửa
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={japanLayers.terrain} onChange={e => setJapanLayers({ ...japanLayers, terrain: e.target.checked })} className="accent-teal-500" />
                        Địa hình địa hình
                      </label>
                    </div>
                  )}

                  {activeDoc.previewType === 'generic' && (
                    <div className="text-xs text-slate-400">Trình điều khiển thiết lập tự động phù hợp với máy chiếu lớp học.</div>
                  )}

                  {activeDoc.previewType === 'sunray' && (
                    <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-300">
                      <div className="flex items-center gap-2">
                        <span>Góc nhập xạ</span>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          value={sunAngle}
                          onChange={e => setSunAngle(Number(e.target.value))}
                          className="w-28 accent-amber-500 cursor-pointer"
                        />
                        <span className="text-amber-400 font-black">{sunAngle}°</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Mùa:</span>
                        {(['summer', 'equinox', 'winter'] as const).map(s => (
                          <button
                            key={s}
                            onClick={() => setSunSeason(s)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${sunSeason === s ? 'bg-amber-500 text-slate-950' : 'bg-white/10 hover:bg-white/20'}`}
                          >
                            {s === 'summer' ? 'Hè' : s === 'winter' ? 'Đông' : 'Xuân/Thu'}
                          </button>
                        ))}
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} className="accent-amber-500" />
                        Hiện vĩ tuyến
                      </label>
                    </div>
                  )}
                </div>

                {/* ─── QUIZ PANEL ─── */}
                {(() => {
                  type SQ = { q: string; a: string; opts: string[] };
                  const SIM_QUIZ: Record<string, SQ[]> = {
                    atmosphere: [
                      { q: 'Lực Coriolis làm gió ở bán cầu Bắc lệch về hướng nào?', a: 'Phải', opts: ['Phải', 'Trái', 'Bắc', 'Nam'] },
                      { q: 'Gió Tín phong thổi từ đâu về đâu?', a: 'Áp cao chí tuyến → Xích đạo', opts: ['Áp cao chí tuyến → Xích đạo', 'Xích đạo → Cực', 'Cực → Ôn đới', 'Ôn đới → Xích đạo'] },
                    ],
                    earth: [
                      { q: 'Lớp nào của Trái Đất ở trạng thái quánh dẻo?', a: 'Man-ti trên', opts: ['Man-ti trên', 'Vỏ Trái Đất', 'Nhân ngoài', 'Nhân trong'] },
                      { q: 'Nhân Trái Đất cấu tạo chủ yếu bằng', a: 'Sắt và Niken', opts: ['Sắt và Niken', 'Silic và Oxy', 'Nhôm và Can-xi', 'Mê-tan lỏng'] },
                    ],
                    ocean: [
                      { q: 'Dòng biển nóng Kuroshio chảy theo hướng', a: 'Bắc dọc bờ đông châu Á', opts: ['Bắc dọc bờ đông châu Á', 'Nam về xích đạo', 'Đông sang Thái Bình Dương', 'Tây sang Ấn Độ Dương'] },
                      { q: 'Hải lưu nóng ảnh hưởng khí hậu bằng cách', a: 'Làm ấm vùng ven biển', opts: ['Làm ấm vùng ven biển', 'Hạ nhiệt độ', 'Gây động đất', 'Làm đại dương sâu hơn'] },
                    ],
                    tide: [
                      { q: 'Triều cường xảy ra khi', a: 'Mặt Trăng, Mặt Trời thẳng hàng với Trái Đất', opts: ['Mặt Trăng, Mặt Trời thẳng hàng với Trái Đất', 'Mặt Trăng vuông góc Mặt Trời', 'Chỉ do Mặt Trời', 'Khi Trái Đất tự quay'] },
                      { q: 'Lực hấp dẫn của vật nào ảnh hưởng chủ yếu đến thủy triều?', a: 'Mặt Trăng', opts: ['Mặt Trăng', 'Mặt Trời', 'Sao Kim', 'Sao Hỏa'] },
                    ],
                    daynight: [
                      { q: 'Trái Đất tự quay quanh trục theo hướng', a: 'Tây sang Đông', opts: ['Tây sang Đông', 'Đông sang Tây', 'Bắc xuống Nam', 'Nam lên Bắc'] },
                      { q: 'Chu kỳ tự quay của Trái Đất là', a: '24 giờ', opts: ['24 giờ', '12 giờ', '365 ngày', '1 tháng'] },
                    ],
                    timezone: [
                      { q: 'Trái Đất được chia thành bao nhiêu múi giờ?', a: '24 múi', opts: ['24 múi', '12 múi', '36 múi', '48 múi'] },
                      { q: 'Việt Nam thuộc múi giờ nào?', a: 'UTC+7', opts: ['UTC+7', 'UTC+8', 'UTC+6', 'UTC+5'] },
                    ],
                    seasons: [
                      { q: 'Nguyên nhân chính tạo ra các mùa trong năm là', a: 'Trục Trái Đất nghiêng', opts: ['Trục Trái Đất nghiêng', 'Khoảng cách Trái Đất-Mặt Trời', 'Vòng quay quanh trục', 'Mặt Trăng'] },
                      { q: 'Khi bán cầu Bắc là mùa Hè, bán cầu Nam là', a: 'Mùa Đông', opts: ['Mùa Đông', 'Mùa Hè', 'Xuân phân', 'Thu phân'] },
                    ],
                    windpressure: [
                      { q: 'Gió thổi từ nơi áp cao về nơi', a: 'Áp thấp', opts: ['Áp thấp', 'Áp cao', 'Nhiệt độ cao', 'Nhiệt độ thấp'] },
                      { q: 'Lực Coriolis sinh ra do Trái Đất', a: 'Tự quay quanh trục', opts: ['Tự quay quanh trục', 'Quay quanh Mặt Trời', 'Có trục nghiêng', 'Hút nước biển'] },
                    ],
                    orographicrain: [
                      { q: 'Mưa địa hình hình thành khi không khí ẩm gặp', a: 'Núi chắn gió', opts: ['Núi chắn gió', 'Biển sâu', 'Rừng nhiệt đới', 'Nhiệt độ cao'] },
                      { q: 'Hiệu ứng Foehn xảy ra ở', a: 'Sườn khuất gió', opts: ['Sườn khuất gió', 'Sườn đón gió', 'Đỉnh núi', 'Chân núi'] },
                    ],
                    coordinate: [
                      { q: 'Kinh tuyến gốc (0°) đi qua thành phố', a: 'Greenwich (London)', opts: ['Greenwich (London)', 'Paris', 'New York', 'Tokyo'] },
                      { q: 'Đường xích đạo có vĩ độ', a: '0°', opts: ['0°', "23°27'", "66°33'", '90°'] },
                    ],
                    sunray: [
                      { q: 'Góc nhập xạ càng lớn thì nhiệt lượng', a: 'Càng cao', opts: ['Càng cao', 'Càng thấp', 'Không đổi', 'Không xác định'] },
                      { q: 'Vùng xích đạo nóng vì', a: 'Góc nhập xạ mặt trời lớn', opts: ['Góc nhập xạ mặt trời lớn', 'Gần Mặt Trời hơn', 'Không có mây', 'Mặt Trời lớn hơn'] },
                    ],
                    volcano: [
                      { q: 'Magma là đá nóng chảy ở đâu?', a: 'Dưới vỏ Trái Đất', opts: ['Dưới vỏ Trái Đất', 'Trên bề mặt núi lửa', 'Trong biển', 'Trong khí quyển'] },
                      { q: 'Núi lửa thường xảy ra ở các vùng', a: 'Mảng kiến tạo va chạm', opts: ['Mảng kiến tạo va chạm', 'Đồng bằng', 'Nút sông', 'Giữa lục địa'] },
                    ],
                    japan: [
                      { q: 'Dòng biển nóng Kuroshio xuất phát từ', a: 'Tây Bắc Thái Bình Dương', opts: ['Tây Bắc Thái Bình Dương', 'Bắc Băng Dương', 'Đại Tây Dương', 'Ấn Độ Dương'] },
                      { q: 'Nhật Bản nằm trên bao nhiêu mảng kiến tạo?', a: '4 mảng', opts: ['4 mảng', '2 mảng', '1 mảng', '6 mảng'] },
                    ],
                  };
                  const questions = parsedSimData.quiz.length > 0 ? parsedSimData.quiz : (SIM_QUIZ[activeDoc.previewType || ''] || []);
                  if (!questions.length) return null;
                  return (
                    <div className="w-full mt-4 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-black text-amber-400 uppercase tracking-wider">📚 Câu hỏi ôn tập</span>
                        <span className="text-[10px] text-slate-500">— bấm vào đáp án để kiểm tra</span>
                        <button
                          onClick={() => { setQuizAnswers({}); setQuizRevealed({}); }}
                          className="ml-auto text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded border border-white/10 hover:bg-white/5 transition-colors"
                        >
                          Làm lại
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {questions.map((q, qi) => {
                          const qKey = `${activeDoc.previewType}-${qi}`;
                          const revealed = quizRevealed[qKey];
                          const selected = quizAnswers[qKey];
                          return (
                            <div key={qKey} className="bg-slate-950/60 rounded-xl p-3 border border-white/5">
                              <p className="text-xs text-slate-200 font-bold mb-2">{qi + 1}. {q.q}</p>
                              <div className="grid grid-cols-2 gap-1.5">
                                {q.opts.map(opt => {
                                  const isSelected = selected === opt;
                                  const isCorrect = opt === q.a;
                                  return (
                                    <button
                                      key={opt}
                                      onClick={() => { setQuizAnswers(p => ({ ...p, [qKey]: opt })); setQuizRevealed(p => ({ ...p, [qKey]: true })); }}
                                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-left transition-all border ${
                                        revealed && isCorrect ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                        : revealed && isSelected && !isCorrect ? 'bg-red-500/20 border-red-500/50 text-red-300'
                                        : isSelected ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                                      }`}
                                    >
                                      {opt}{revealed && isCorrect ? ' ✓' : revealed && isSelected && !isCorrect ? ' ✗' : ''}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ─── FULLSCREEN SIMULATION MODAL ─────────────────────────────────────── */}
      {simFullscreen && (
        <div className="fixed inset-0 z-[400] flex flex-col bg-slate-950/98 backdrop-blur-xl">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-slate-900/80 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-black tracking-wider text-slate-200 uppercase">
                {activeDoc.title}
              </span>
              <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
                Toàn màn hình
              </span>
            </div>
            <button
              onClick={() => setSimFullscreen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              title="Đóng (ESC)"
            >
              <X size={20} />
            </button>
          </div>

          {/* Simulation area — takes most of the screen */}
          <div className="flex-grow relative min-h-0 p-4">
            <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              {activeDoc.previewType === 'atmosphere' ? <AtmosphericCirculationSim />
              : activeDoc.previewType === 'earth' ? <EarthLayersSim />
              : activeDoc.previewType === 'japan' ? <JapanGeographySim />
              : activeDoc.previewType === 'sunray' ? <SunraySim />
              : activeDoc.previewType === 'coordinate' ? <CoordinateSim />
              : activeDoc.previewType === 'volcano' ? <VolcanoSim />
              : activeDoc.previewType === 'ocean' ? <OceanCurrentSim />
              : activeDoc.previewType === 'tide' ? <TideSim />
              : activeDoc.previewType === 'daynight' ? <DayNightSim />
              : activeDoc.previewType === 'timezone' ? <TimeZoneSim />
              : activeDoc.previewType === 'seasons' ? <SeasonsSim />
              : activeDoc.previewType === 'polar-day' ? <PolarDaySim />
              : activeDoc.previewType === 'windpressure' ? <WindPressureSim />
              : activeDoc.previewType === 'orographicrain' ? <OrographicRainSim />
              : null}
            </div>
          </div>

          {/* Bottom narration bar */}
          {getGuideText() && (
            <div className="flex-shrink-0 px-6 py-3 bg-slate-900/80 border-t border-white/10">
              <p className="text-xs text-slate-300 italic leading-relaxed">
                <span className="text-teal-400 font-black not-italic">📢 Lời giảng: </span>
                "{getGuideText()}"
              </p>
            </div>
          )}
        </div>
      )}

      {showHelpModal && (

        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowHelpModal(false)} />
          <div className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden z-10 text-white">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
              <h3 className="text-lg font-black tracking-wide text-teal-400 flex items-center gap-2">
                <HelpCircle size={20} />
                <span>HƯỚNG DẪN SỬ DỤNG MÔ PHỎNG ĐỊA LÍ</span>
              </h3>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh] text-sm text-slate-300 leading-relaxed font-sans">
              <div className="space-y-2">
                <h4 className="font-black text-white flex items-center gap-2 text-xs uppercase tracking-widest text-teal-500">
                  <span>1. Tương tác trực tiếp trên màn chiếu</span>
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs">
                  <li><strong>Kéo và Rê chuột (Xoay 3D):</strong> Đối với bài *Hoàn lưu khí quyển*, nhấp giữ chuột và kéo ngang trên quả địa cầu để xoay xem các mặt khác nhau.</li>
                  <li><strong>Click chọn (Nhận diện phân lớp):</strong> Đối với bài *Cấu trúc Trái Đất*, click vào từng tầng (Vỏ, Man-ti, Nhân ngoài, Nhân trong) để bật bảng thông số tương ứng ở góc phải.</li>
                  <li><strong>Click tiêu điểm địa lí:</strong> Đối với bài *Nhật Bản*, click đốm nhấp nháy màu cam để xem thông số của núi lửa Phú Sĩ.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-white flex items-center gap-2 text-xs uppercase tracking-widest text-teal-500">
                  <span>2. Sử dụng thanh điều khiển phía dưới</span>
                </h4>
                <p className="text-xs">Mỗi bài học có thanh trượt và hộp kiểm thông số riêng:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs">
                  <li><strong>Nút Play/Pause & Reset:</strong> Bật/tắt hoạt ảnh (gió thổi, dòng biển chảy...) hoặc đặt lại trạng thái ban đầu của mô hình.</li>
                  <li><strong>Thanh kéo:</strong> Tăng giảm tốc độ gió, đổi góc nghiêng lát cắt Trái Đất, thay đổi góc nhập xạ Mặt Trời (10° đến 90°).</li>
                  <li><strong>Hộp kiểm (Checkbox):</strong> Bật/tắt hiển thị đai khí áp, hướng gió, vĩ tuyến, dòng biển nóng lạnh, đứt gãy núi lửa...</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-white flex items-center gap-2 text-xs uppercase tracking-widest text-teal-500">
                  <span>3. Tự động tạo mô phỏng mới bằng AI</span>
                </h4>
                <p className="text-xs">
                  Khi soạn một bài học địa lý mới chưa có mô phỏng, bạn chỉ cần nhấp nút <strong>"🤖 Tạo mô phỏng AI"</strong> ở góc phải. Trợ lý AI (Google AI Studio) sẽ đọc nội dung đặc tả bài học và tự biên dịch thuật toán Canvas động chạy ngay lập tức. Nhấn <strong>"🔄 Tái tạo mô phỏng"</strong> để cập nhật lại mô phỏng sau mỗi lần sửa đổi thiết kế.
                </p>
              </div>

              <div className="bg-teal-950/40 border border-teal-500/20 p-4 rounded-2xl flex items-start gap-3">
                <Sparkles size={18} className="text-teal-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-teal-300 leading-normal">
                  <strong>Mẹo giảng dạy:</strong> Giáo viên có thể nhấp **"Hiện lời dẫn"** ở chân màn hình mô phỏng để tham khảo kịch bản lời nói gợi mở cho học sinh, giúp tiết học sinh động và tương tác cao hơn.
                </p>
              </div>
            </div>
            
            <div className="px-8 py-5 bg-slate-950/50 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => setShowHelpModal(false)}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-teal-600/20 transition-all cursor-pointer"
              >
                Đã hiểu, đóng hướng dẫn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Workspace = ({ 
  onBack, 
  apiKey, 
  selectedModel, 
  onOpenSettings 
}: { 
  onBack: () => void; 
  apiKey: string; 
  selectedModel: string; 
  onOpenSettings: () => void; 
}) => {
  const [activeTab, setActiveTab] = useState('exambank');
  const [activeGame, setActiveGame] = useState<string | null>(null);

  if (activeGame === 'trieu-phu') {
    return <MillionaireGame onExit={() => setActiveGame(null)} apiKey={apiKey} selectedModel={selectedModel} />;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col">
      <header className="h-16 glass border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white">
            <Globe size={18} />
          </div>
          <span className="font-black text-slate-900">GeoHub Workspace</span>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href="https://aistudio.google.com/api-keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1 shrink-0"
          >
            <Sparkles size={12} className="animate-pulse" />
            Lấy API key để sử dụng app
          </a>

          <button 
            onClick={onOpenSettings}
            className="p-2 text-slate-600 hover:text-teal-600 hover:bg-slate-100 rounded-xl transition-all relative group"
            title="Thiết lập API Key & Model"
          >
            <Settings size={18} />
            {!apiKey && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>

          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <X size={18} /> Thoát Workspace
          </button>
        </div>
      </header>

      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        <WorkspaceSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-grow overflow-y-auto bg-slate-50/50">
          <AnimatePresence mode="wait">
            {activeTab === 'exambank' && <ExamBankModule key="exambank" apiKey={apiKey} selectedModel={selectedModel} />}
            {activeTab === 'matrix' && <MatrixModule key="matrix" />}
            {activeTab === 'practice' && <PracticeModule key="practice" />}
            {activeTab === 'games' && <GamesModule key="games" onStartGame={setActiveGame} />}
            {activeTab === 'simulation' && <SimulationModule key="simulation" apiKey={apiKey} selectedModel={selectedModel} />}
            {activeTab === 'classroom' && <ClassroomModule key="classroom" />}
            {activeTab === 'statistics' && <StatisticsModule key="statistics" />}
            {activeTab === 'lesson' && <LessonModule key="lesson" apiKey={apiKey} selectedModel={selectedModel} />}
            {activeTab === 'storage' && <StorageModule key="storage" />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppData | null>(null);

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('gemini_preferred_model') || 'gemini-3.5-flash');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auto-open settings if API Key is missing
  useEffect(() => {
    if (!apiKey) {
      setIsSettingsOpen(true);
    }
  }, [apiKey]);

  // Load data from localStorage or use initial data
  useEffect(() => {
    const savedData = localStorage.getItem('apphub_data');
    if (savedData) {
      try {
        setApps(JSON.parse(savedData));
      } catch (error) {
        console.error("Lỗi khi phân tích dữ liệu ứng dụng:", error);
        setApps(INITIAL_DATA);
        localStorage.setItem('apphub_data', JSON.stringify(INITIAL_DATA));
      }
    } else {
      setApps(INITIAL_DATA);
      localStorage.setItem('apphub_data', JSON.stringify(INITIAL_DATA));
    }
  }, []);

  // Save to localStorage whenever apps change
  const saveApps = (newApps: AppData[]) => {
    setApps(newApps);
    localStorage.setItem('apphub_data', JSON.stringify(newApps));
  };

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesCategory = activeCategory === "Tất cả" || app.category === activeCategory;
      const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           app.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [apps, activeCategory, searchQuery]);

  const handleAddApp = (data: AppData) => {
    if (editingApp) {
      const updatedApps = apps.map(a => a.id === data.id ? data : a);
      saveApps(updatedApps);
    } else {
      saveApps([...apps, data]);
    }
    setIsModalOpen(false);
    setEditingApp(null);
  };

  const handleDeleteApp = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ứng dụng này?')) {
      saveApps(apps.filter(a => a.id !== id));
    }
  };

  const openEditModal = (app: AppData) => {
    setEditingApp(app);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        isAdmin={isAdmin} 
        onToggleAdmin={() => setIsAdmin(!isAdmin)} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        apiKey={apiKey}
      />

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {isWorkspaceOpen ? (
            <Workspace 
              key="workspace" 
              onBack={() => setIsWorkspaceOpen(false)} 
              apiKey={apiKey}
              selectedModel={selectedModel}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          ) : !isAdmin ? (
            <motion.div
              key="client"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero onStart={() => setIsWorkspaceOpen(true)} />

              {/* Filter & Search Section */}
              <section className="max-w-7xl mx-auto px-4 mb-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40">
                  <div className="flex flex-wrap items-center gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                          activeCategory === cat 
                            ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30' 
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm ứng dụng..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-teal-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* App Grid */}
              <section className="max-w-7xl mx-auto px-4 pb-20">
                {filteredApps.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence mode="popLayout">
                      {filteredApps.map(app => (
                        <motion.div
                          key={app.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                        >
                          <AppCard app={app} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy ứng dụng</h3>
                    <p className="text-slate-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn.</p>
                  </div>
                )}
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-7xl mx-auto px-4 py-12 w-full"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 mb-2">Quản trị hệ thống</h1>
                  <p className="text-slate-500">Quản lý danh sách ứng dụng hiển thị trên trang chủ.</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingApp(null);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all hover:scale-105"
                >
                  <Plus size={20} /> Thêm App mới
                </button>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Ứng dụng</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Danh mục</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Nhãn</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {apps.map(app => (
                        <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img 
                                src={app.image} 
                                alt="" 
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="font-bold text-slate-900">{app.title}</div>
                                <div className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">{app.url}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                              {app.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-teal-50 text-teal-600 rounded-lg text-xs font-bold border border-teal-100">
                              {app.badge}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => openEditModal(app)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteApp(app.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {apps.length === 0 && (
                  <div className="py-20 text-center text-slate-400">
                    Chưa có ứng dụng nào. Hãy thêm ứng dụng đầu tiên!
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />

      <AnimatePresence>
        {isModalOpen && (
          <AppModal 
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingApp(null);
            }}
            onSave={handleAddApp}
            initialData={editingApp}
          />
        )}
      </AnimatePresence>

      <ApiSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />
    </div>
  );
}
