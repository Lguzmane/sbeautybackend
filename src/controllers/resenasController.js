const db = require('../config/db');

// Crear reseña
const crearReseña = async (req, res) => {
  const { profesional_id, servicio_id, rating, comentario } = req.body;
  const cliente_id = req.user.id;

  try {
    const result = await db.query(`
      INSERT INTO reseñas (
        cliente_id, profesional_id, servicio_id, rating, comentario
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [cliente_id, profesional_id, servicio_id, rating, comentario]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json({ error: 'Error al crear reseña' });
  }
};

// Obtener reseñas de un profesional
const obtenerReseñas = async (req, res) => {
  const { profesionalId } = req.params;

  try {
    const result = await db.query(`
      SELECT * FROM reseñas WHERE profesional_id = $1 ORDER BY created_at DESC
    `, [profesionalId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
};

module.exports = {
  crearReseña,
  obtenerReseñas
};
