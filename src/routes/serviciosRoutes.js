const express = require('express');
const router = express.Router();
const { crearServicio, listarServicios, detalleServicio } = require('../controllers/serviciosController');
const authJWT = require('../middlewares/authMiddleware');

// Crear servicio (solo profesionales)
router.post('/', authJWT(['Profesional']), crearServicio);

// Listar servicios (público)
router.get('/', listarServicios);

// Detalle de un servicio (público)
router.get('/:id', detalleServicio);

module.exports = router;
