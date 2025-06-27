const express = require('express');
const router = express.Router();
const { getUsuarioById, getProfesionales } = require('../controllers/usuariosController');

// Ruta pública para obtener todos los profesionales
router.get('/profesionales', getProfesionales);

// Ruta para obtener un usuario por ID (requiere login)
const authMiddleware = require('../middlewares/authMiddleware');
router.get('/:id', authMiddleware([]), getUsuarioById);

module.exports = router;
