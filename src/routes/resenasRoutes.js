const express = require('express');
const router = express.Router();
const { crearReseña, obtenerReseñas } = require('../controllers/resenasController');
const authJWT = require('../middlewares/authMiddleware');

// Cliente deja reseña
router.post('/', authJWT(['Cliente']), crearReseña);

// Público puede ver reseñas por profesional
router.get('/:profesionalId', obtenerReseñas);

module.exports = router;
