const express = require('express');
const router = express.Router();
const adminController = require('../controllers/administrative.controller');

// Lấy dữ liệu địa giới hành chính (Tỉnh -> Xã/Phường)
router.get('/administrative-data', adminController.getAdministrativeData);

module.exports = router;