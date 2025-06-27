const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// ----------- REGISTRO DE USUARIO ---------------- //
const register = async (req, res) => {
  const {
    nombre, apellido_paterno, apellido_materno, rut, email, password,
    telefono, region, comuna, rol,
    categoria, categoria_personalizada, experiencia, certificaciones
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(`
      INSERT INTO usuarios (
        nombre, apellido_paterno, apellido_materno, rut, email, password,
        telefono, region, comuna, rol,
        categoria, categoria_personalizada, experiencia, certificaciones
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING id, nombre, email, rol
    `, [
      nombre, apellido_paterno, apellido_materno, rut, email, hashedPassword,
      telefono, region, comuna, rol,
      categoria, categoria_personalizada, experiencia, certificaciones
    ]);

    const user = result.rows[0];
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.status(201).json({ user, token });

  } catch (error) {
    console.error('Error en registro:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'El correo o RUT ya están registrados' });
    }
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// ----------- INICIO DE SESIÓN ---------------- //
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(`SELECT * FROM usuarios WHERE email = $1`, [email]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const { password: _, ...userData } = user;
    const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.json({ user: userData, token });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// ----------- PERFIL ---------------- //
const getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query('SELECT * FROM usuarios WHERE id = $1', [userId]);
    const usuario = result.rows[0];

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.rol === 'Profesional') {
      const prox = await db.query(`
        SELECT fecha FROM reservas 
        WHERE profesional_id = $1 AND estado = 'confirmada' AND fecha > NOW()
        ORDER BY fecha ASC LIMIT 1
      `, [userId]);
      usuario.proxima_fecha = prox.rows[0]?.fecha || null;

      const servicios = await db.query(`
        SELECT * FROM servicios WHERE profesional_id = $1
      `, [userId]);
      usuario.servicios = servicios.rows;
    }

    return res.json({ user: usuario });
  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    return res.status(500).json({ error: 'Error interno al obtener perfil' });
  }
};


// ----------- ACTUALIZAR PERFIL ---------------- //
const updateProfile = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const {
    nombre, apellido_paterno, apellido_materno,
    telefono, region, comuna,
    categoria, categoria_personalizada, experiencia, certificaciones
  } = req.body;

  try {
    const result = await db.query(`
      UPDATE usuarios
      SET nombre = $1,
          apellido_paterno = $2,
          apellido_materno = $3,
          telefono = $4,
          region = $5,
          comuna = $6,
          categoria = $7,
          categoria_personalizada = $8,
          experiencia = $9,
          certificaciones = $10
      WHERE id = $11
      RETURNING id, nombre, apellido_paterno, apellido_materno, email, telefono, region, comuna, rol,
                categoria, categoria_personalizada, experiencia, certificaciones;
    `, [
      nombre, apellido_paterno, apellido_materno,
      telefono, region, comuna,
      categoria, categoria_personalizada, experiencia, certificaciones,
      userId
    ]);

    const updatedUser = result.rows[0];
    res.json({ user: updatedUser });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

module.exports = { register, login, updateProfile, getProfile };
