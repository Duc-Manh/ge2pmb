const db = require('../config/db');

exports.getAdministrativeData = async (req, res) => {
  try {
    // 1. Lấy toàn bộ Tỉnh/Thành phố
    const [provinces] = await db.query(`
      SELECT 
        code as Code, 
        name as Name, 
        name_en as NameEn, 
        full_name as FullName, 
        full_name_en as FullNameEn, 
        code_name as CodeName 
      FROM provinces
    `);
    
    // 2. Lấy toàn bộ Phường/Xã
    const [wards] = await db.query(`
      SELECT 
        code as Code, 
        name as Name, 
        name_en as NameEn, 
        full_name as FullName, 
        full_name_en as FullNameEn, 
        code_name as CodeName, 
        province_code as ProvinceCode 
      FROM wards
    `);
    
    // 3. Xây dựng cấu trúc cây (Nhóm Phường/Xã vào Tỉnh/Thành phố)
    const provinceMap = {};
    
    provinces.forEach(p => {
      p.Wards = [];
      provinceMap[p.Code] = p;
    });

    wards.forEach(w => {
      const province = provinceMap[w.ProvinceCode];
      if (province) {
        province.Wards.push(w);
      }
    });

    // 4. Trả về mảng JSON giống định dạng static JSON
    res.status(200).json(provinces);
  } catch (error) {
    console.error('Error fetching administrative data:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};
