const express = require('express');
const router = express.Router();
const { register, login, updateProfile, getProfile } = require('../controllers/authController');
const authJWT = require('../middlewares/authMiddleware');

// Registro e inicio de sesión
router.post('/register', register);
router.post('/login', login);

// 🔒 Obtener perfil del usuario logueado
router.get('/profile', authJWT(['Cliente', 'Profesional']), getProfile);

// 🔁 Actualizar perfil
router.put('/usuarios/:id', authJWT(['Cliente', 'Profesional']), updateProfile);

// Ruta protegida de prueba (opcional)
router.get('/protegida', authJWT(['Cliente', 'Profesional']), (req, res) => {
  res.json({ mensaje: 'Accediste a una ruta protegida', usuario: req.user });
});

module.exports = router;

