const express = require('express');
const router = express.Router();
const authJWT = require('../middlewares/authMiddleware');
const { obtenerFavoritos } = require('../controllers/favoritosController');

router.get('/', authJWT(['Cliente']), obtenerFavoritos);

module.exports = router;
