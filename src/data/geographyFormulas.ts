export interface GeoFormula {
  id: string;
  name: string;
  formula: string;
  unit: string;
  description?: string;
}

export const GEOGRAPHY_FORMULAS: GeoFormula[] = [
  { id: 'mat_do_dan_so', name: 'Mật độ dân số', formula: 'Dân số / Diện tích', unit: 'người/km²' },
  { id: 'gia_tang_tu_nhien', name: 'Tỉ suất gia tăng dân số tự nhiên', formula: 'Tỉ suất sinh thô - Tỉ suất tử thô', unit: '%' },
  { id: 'san_luong', name: 'Sản lượng', formula: 'Diện tích × Năng suất', unit: 'tấn' },
  { id: 'nang_suat', name: 'Năng suất', formula: 'Sản lượng / Diện tích', unit: 'tạ/ha' },
  { id: 'binh_quan_luong_thuc', name: 'Bình quân lương thực theo đầu người', formula: 'Sản lượng lương thực / Dân số', unit: 'kg/người' },
  { id: 'gdp_binh_quan', name: 'GDP bình quân đầu người', formula: 'Tổng GDP / Dân số', unit: 'USD/người' },
  { id: 'ti_trong', name: 'Tỉ trọng', formula: 'Giá trị thành phần / Tổng giá trị × 100', unit: '%' },
  { id: 'toc_do_tang_truong', name: 'Tốc độ tăng trưởng', formula: 'Giá trị năm sau / Giá trị năm gốc × 100', unit: '%' },
  { id: 'muc_tang', name: 'Mức tăng', formula: 'Giá trị năm sau - Giá trị năm trước', unit: 'tuỳ bài' },
  { id: 'can_can_xnk', name: 'Cán cân xuất nhập khẩu', formula: 'Xuất khẩu - Nhập khẩu', unit: 'triệu USD' },
  { id: 'tong_kim_ngach', name: 'Tổng kim ngạch xuất nhập khẩu', formula: 'Xuất khẩu + Nhập khẩu', unit: 'triệu USD' },
  { id: 'ti_le_che_phu_rung', name: 'Tỉ lệ che phủ rừng', formula: 'Diện tích rừng / Diện tích tự nhiên × 100', unit: '%' },
  { id: 'bien_do_nhiet', name: 'Biên độ nhiệt năm', formula: 'Nhiệt độ tháng cao nhất - Nhiệt độ tháng thấp nhất', unit: '°C' },
  { id: 'luong_mua_tb', name: 'Lượng mưa trung bình', formula: 'Tổng lượng mưa / Số tháng', unit: 'mm' },
  { id: 'luong_mua_nam', name: 'Lượng mưa năm', formula: 'Tổng lượng mưa 12 tháng', unit: 'mm' },
  { id: 'ti_le_dan_thanh_thi', name: 'Tỉ lệ dân thành thị', formula: 'Dân thành thị / Tổng dân số × 100', unit: '%' },
  { id: 'ti_le_dan_nong_thon', name: 'Tỉ lệ dân nông thôn', formula: 'Dân nông thôn / Tổng dân số × 100', unit: '%' },
  { id: 'co_cau_kinh_te', name: 'Cơ cấu ngành kinh tế', formula: 'Giá trị ngành / Tổng giá trị × 100', unit: '%' },
  { id: 'cu_li_van_chuyen', name: 'Cự li vận chuyển trung bình', formula: 'Khối lượng luân chuyển / Khối lượng vận chuyển', unit: 'km' },
  { id: 'toc_do_tang_dan_so', name: 'Tốc độ tăng dân số', formula: 'Dân số năm sau / Dân số năm gốc × 100', unit: '%' },
];
