const pool = require('../config/db');

// Obtener un usuario por ID
const getUsuarioById = async (req, res) => {
  const { id } = req.params;

  try {
    const usuarioResult = await pool.query(
      `SELECT id, nombre, apellido_paterno, apellido_materno, email, telefono, comuna, region, rol,
              categoria, categoria_personalizada, experiencia, certificaciones, rating_promedio, fotos_perfil,
              direccion, sitio_web, locacion, condiciones
       FROM usuarios
       WHERE id = $1`,
      [id]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const serviciosResult = await pool.query(
      'SELECT id, nombre, descripcion, precio, duracion, categoria FROM servicios WHERE profesional_id = $1',
      [id]
    );

    const usuario = usuarioResult.rows[0];
    usuario.servicios = serviciosResult.rows;

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Obtener todos los profesionales (ahora con sus servicios específicos)
const getProfesionales = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.nombre, u.apellido_paterno, u.comuna, u.region, u.categoria,
             u.experiencia, u.certificaciones, u.rating_promedio, u.fotos_perfil,
             ARRAY_AGG(s.nombre) AS servicios
      FROM usuarios u
      LEFT JOIN servicios s ON u.id = s.profesional_id
      WHERE u.rol = 'Profesional'
      GROUP BY u.id
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener profesionales:', error);
    res.status(500).json({ error: 'Error al obtener profesionales' });
  }
};

module.exports = {
  getUsuarioById,
  getProfesionales
};
