const db = require('../config/db');

// Crear una reserva
const crearReserva = async (req, res) => {
  const { servicio_id, fecha, duracion, monto, metodo_pago } = req.body;
  const cliente_id = req.user.id;

  try {
    const resultServicio = await db.query(`SELECT * FROM servicios WHERE id = $1`, [servicio_id]);

    if (resultServicio.rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    const profesional_id = resultServicio.rows[0].profesional_id;

    const result = await db.query(`
      INSERT INTO reservas (
        cliente_id, servicio_id, profesional_id,
        fecha, duracion, estado, monto,
        metodo_pago, estado_pago
      ) VALUES ($1,$2,$3,$4,$5,'pendiente',$6,$7,'pendiente')
      RETURNING *
    `, [
      cliente_id, servicio_id, profesional_id,
      fecha, duracion, monto,
      metodo_pago
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
};

// Listar reservas del cliente
const reservasCliente = async (req, res) => {
  const cliente_id = req.user.id;

  try {
    const result = await db.query(`
      SELECT * FROM reservas WHERE cliente_id = $1 ORDER BY fecha DESC
    `, [cliente_id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al listar reservas cliente:', error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

// Listar reservas del profesional
const reservasProfesional = async (req, res) => {
  const profesional_id = req.user.id;

  try {
    const result = await db.query(`
      SELECT * FROM reservas WHERE profesional_id = $1 ORDER BY fecha DESC
    `, [profesional_id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al listar reservas profesional:', error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

// Confirmar o cancelar reserva
const actualizarEstado = async (req, res) => {
  const { id } = req.params;
  const { estado, estado_pago } = req.body;

  try {
    const result = await db.query(`
      UPDATE reservas
      SET estado = $1, estado_pago = $2
      WHERE id = $3
      RETURNING *
    `, [estado, estado_pago, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ error: 'Error al actualizar estado de reserva' });
  }
};

// Historial del cliente
const obtenerHistorialCliente = async (req, res) => {
  const clienteId = req.user.id;

  try {
    const result = await db.query(`
      SELECT r.*, s.nombre AS nombre_servicio, u.nombre AS nombre_profesional
      FROM reservas r
      JOIN servicios s ON r.servicio_id = s.id
      JOIN usuarios u ON r.profesional_id = u.id
      WHERE r.cliente_id = $1
      ORDER BY r.fecha DESC
    `, [clienteId]);

    const historial = result.rows.map(reserva => ({
      nombreServicio: reserva.nombre_servicio,
      contraparte: reserva.nombre_profesional,
      rol: 'cliente',
      fecha: reserva.fecha.toISOString().split('T')[0],
      hora: reserva.fecha.toISOString().split('T')[1].slice(0, 5),
      estado: reserva.estado,
      monto: reserva.monto
    }));

    res.json({ historial });
  } catch (error) {
    console.error('Error al obtener historial cliente:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

// Historial del profesional (✅ corregido)
const obtenerHistorialProfesional = async (req, res) => {
  const profesionalId = req.user.id;

  try {
    const result = await db.query(`
      SELECT r.*, s.nombre AS nombre_servicio, u.nombre AS nombre_cliente
      FROM reservas r
      JOIN servicios s ON r.servicio_id = s.id
      JOIN usuarios u ON r.cliente_id = u.id
      WHERE r.profesional_id = $1
      ORDER BY r.fecha DESC
    `, [profesionalId]);

    const historial = result.rows.map(reserva => ({
      nombreServicio: reserva.nombre_servicio,
      contraparte: reserva.nombre_cliente,
      rol: 'profesional',
      fecha: reserva.fecha.toISOString().split('T')[0],
      hora: reserva.fecha.toISOString().split('T')[1].slice(0, 5),
      estado: reserva.estado,
      monto: reserva.monto
    }));

    res.json({ historial });
  } catch (error) {
    console.error('Error al obtener historial profesional:', error);
    res.status(500).json({ error: 'Error al obtener historial profesional' });
  }
};

// Ver reservas por ID de profesional (usado en Booking.jsx)
const reservasPorProfesionalId = async (req, res) => {
  const profesional_id = req.params.id;

  try {
    const result = await db.query(`
      SELECT * FROM reservas WHERE profesional_id = $1 ORDER BY fecha DESC
    `, [profesional_id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al listar reservas por ID de profesional:', error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

module.exports = {
  crearReserva,
  reservasCliente,
  reservasProfesional,
  reservasPorProfesionalId,
  actualizarEstado,
  obtenerHistorialCliente,
  obtenerHistorialProfesional
};
