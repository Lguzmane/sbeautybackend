const jwt = require('jsonwebtoken');
require('dotenv').config();

const authJWT = (rolesPermitidos = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Nueva lógica para que 'Profesional' pueda acceder a rutas de 'Cliente'
      const rolUsuario = decoded.rol;
      const puedeAcceder = rolesPermitidos.length === 0 ||
        rolesPermitidos.includes(rolUsuario) ||
        (rolUsuario === 'Profesional' && rolesPermitidos.includes('Cliente'));

      if (!puedeAcceder) {
        return res.status(403).json({ error: 'Acceso denegado por rol' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  };
};

module.exports = authJWT;
