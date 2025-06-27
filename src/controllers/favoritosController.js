const pool = require('../config/db');

const obtenerFavoritos = async (req, res) => {
  const clienteId = req.user.id;

  try {
    const result = await pool.query(`
      SELECT u.id, u.nombre, u.categoria, u.comuna, u.rating_promedio, u.fotos_perfil
      FROM favoritos f
      JOIN usuarios u ON f.profesional_id = u.id
      WHERE f.cliente_id = $1
    `, [clienteId]);

    const favoritos = result.rows.map(pro => ({
      id: pro.id,
      nombre: pro.nombre,
      categoria: pro.categoria,
      comuna: pro.comuna,
      rating: pro.rating_promedio,
      foto: pro.fotos_perfil?.[0] || null
    }));

    res.json({ favoritos });
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
};

module.exports = { obtenerFavoritos };
