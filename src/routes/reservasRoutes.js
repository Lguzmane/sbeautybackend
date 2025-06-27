const express = require('express');
const router = express.Router();

const {
  crearReserva,
  reservasCliente,
  reservasProfesional,
  reservasPorProfesionalId,
  actualizarEstado,
  obtenerHistorialCliente,
  obtenerHistorialProfesional
} = require('../controllers/reservasController');

const authJWT = require('../middlewares/authMiddleware');

// 🔒 Crear una nueva reserva (cliente agenda)
router.post('/', authJWT(['Cliente', 'Profesional']), crearReserva);

// 🔒 Profesional bloquea horarios propios (tipo_reserva = 'bloqueo')
router.post('/profesional/bloquear', authJWT(['Profesional']), async (req, res) => {
  try {
    const profesional_id = req.user.id;
    const { bloques } = req.body; // bloques = [{ fecha: '2025-07-06', hora: '11:00' }, ...]

    console.log('🧪 Bloques recibidos para bloqueo:', bloques);

    for (const bloque of bloques) {
      const { fecha, hora } = bloque;

      // Combinar fecha y hora en un solo timestamp
      const fechaHora = new Date(`${fecha}T${hora}:00`);

      // Verificar si ya existe una reserva o bloqueo en ese timestamp
      const yaExiste = await req.pool.query(
        'SELECT 1 FROM reservas WHERE profesional_id = $1 AND fecha = $2',
        [profesional_id, fechaHora]
      );

      if (yaExiste.rows.length === 0) {
        await req.pool.query(
          `INSERT INTO reservas (profesional_id, fecha, tipo_reserva, estado)
           VALUES ($1, $2, 'bloqueo', 'reservado')`,
          [profesional_id, fechaHora]
        );
      }
    }

    res.status(201).json({ mensaje: 'Horarios bloqueados correctamente' });
  } catch (error) {
    console.error('❌ Error al bloquear horarios COMPLETO:', error);
    res.status(500).json({ error: 'Error al bloquear horarios' });
  }
});

// 🔒 Ver reservas activas o futuras del cliente
router.get('/cliente', authJWT(['Cliente', 'Profesional']), reservasCliente);

// 🔒 Ver historial de reservas del cliente
router.get('/cliente/historial', authJWT(['Cliente', 'Profesional']), obtenerHistorialCliente);

// 🔒 Ver reservas activas del profesional autenticado
router.get('/profesional', authJWT(['Cliente', 'Profesional']), reservasProfesional);

// 🔒 Ver historial del profesional autenticado
router.get('/profesional/historial', authJWT(['Cliente', 'Profesional']), obtenerHistorialProfesional);

// ✅ Ver reservas por ID de profesional (usado en Booking.jsx)
router.get('/profesional/:id', authJWT(['Cliente', 'Profesional']), reservasPorProfesionalId);

// 🔒 Profesional actualiza estado de una reserva
router.put('/:id', authJWT(['Profesional']), actualizarEstado);

module.exports = router;
