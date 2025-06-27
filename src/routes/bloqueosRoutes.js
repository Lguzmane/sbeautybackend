const express = require('express'); 
const router = express.Router();
const db = require('../config/db');
const authJWT = require('../middlewares/authMiddleware');

// ■■■ BLOQUEAR HORARIOS ■■■
router.post('/bloquear', authJWT(['Profesional']), async (req, res) => {
  const { horarios } = req.body;
  const profesionalId = req.user.id;

  if (!Array.isArray(horarios)) {
    return res.status(400).json({ error: "Formato inválido: se requiere un array de horarios" });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const resultados = [];

    for (const horario of horarios) {
      try {
        const fecha = new Date(horario.fecha);
        if (isNaN(fecha.getTime())) throw new Error("Fecha inválida");

        console.log("⏱️ Verificando:", fecha.toISOString());

        const existe = await client.query(
          `SELECT id, estado, tipo_reserva FROM reservas 
           WHERE profesional_id = $1 AND fecha = $2 
           AND estado IN ('pendiente', 'confirmada')`,
          [profesionalId, fecha]
        );

        console.log("¿Ya existe reserva en ese horario?", existe.rows);

        if (existe.rows.length === 0) {
          const result = await client.query(
            `INSERT INTO reservas (
              profesional_id, fecha, duracion, monto, tipo_reserva, estado
            ) VALUES ($1, $2, $3, $4, 'bloqueo', 'pendiente')
            RETURNING id, fecha`,
            [profesionalId, fecha, 30, 0] // duración = 30 min, monto = 0
          );
          resultados.push(result.rows[0]);
        } else {
          console.log("⛔ Ya hay una reserva activa en ese horario, se omite");
        }
      } catch (error) {
        console.error(`❌ Error procesando horario ${horario.fecha}:`, error.message);
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ bloqueos_creados: resultados });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("🔥 Error en transacción:", error);
    res.status(500).json({ error: "Error al bloquear horarios" });
  } finally {
    client.release();
  }
});

module.exports = router;
