const db = require('../config/db');

const crearServicio = async (req, res) => {
  const {
    nombre,
    descripcion,
    precio,
    duracion,
    categoria,
    tipoAtencion,
    consideraciones,
    fotos = []
  } = req.body;

  const profesional_id = req.user.id;

  try {
    const result = await db.query(`
      INSERT INTO servicios (
        profesional_id,
        nombre,
        descripcion,
        precio,
        duracion,
        categoria,
        tipo_atencion,
        consideraciones,
        imagenes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      profesional_id,
      nombre,
      descripcion,
      precio,
      duracion,
      categoria,
      tipoAtencion,
      consideraciones,
      fotos
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({ 
      error: 'Error al crear el servicio',
      details: error.message
    });
  }
};

const listarServicios = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM servicios
      WHERE is_active = TRUE
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al listar servicios:', error);
    res.status(500).json({ 
      error: 'Error al obtener servicios',
      details: error.message
    });
  }
};

const detalleServicio = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(`
      SELECT 
        s.*,
        u.nombre AS nombre_proveedor,
        u.fotos_perfil[1] AS foto_proveedor,
        u.rating_promedio AS rating_proveedor
      FROM servicios s
      JOIN usuarios u ON s.profesional_id = u.id
      WHERE s.id = $1 AND s.is_active = TRUE
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener detalle:', {
      message: error.message,
      query: error.query
    });
    res.status(500).json({ 
      error: 'Error al obtener detalle del servicio',
      details: error.message
    });
  }
};

module.exports = {
  crearServicio,
  listarServicios,
  detalleServicio
};
