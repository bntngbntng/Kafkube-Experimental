const express = require('express');
const mahasiswaController = require('../controllers/mahasiswaController');
const router = express.Router();

router.post('/mahasiswa', mahasiswaController.tambahMahasiswa);
router.get('/mahasiswa', mahasiswaController.getMahasiswa);

module.exports = router;