const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg'); // Importar directamente pg

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración explícita de CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión directa a PostgreSQL con SSL habilitado
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

// Verificar conexión a la base de datos al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error al conectar a PostgreSQL:', err);
    process.exit(1);
  }
  console.log('✅ Conexión a PostgreSQL establecida');
  release();
});

// Rutas
const authRoutes = require('./routes/authRoutes');
const serviciosRoutes = require('./routes/serviciosRoutes');
const reservasRoutes = require('./routes/reservasRoutes');
const reseñasRoutes = require('./routes/resenasRoutes');
const favoritosRoutes = require('./routes/favoritosRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const bloqueosRoutes = require('./routes/bloqueosRoutes'); // Nueva ruta para bloqueos

app.use('/api/auth', authRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/resenas', reseñasRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/bloqueos', bloqueosRoutes);

// Ruta de verificación de salud
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString()
  });
});

// Manejo centralizado de errores
app.use((err, req, res, next) => {
  console.error('⚠️ Error global:', err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});

// Exportar para testing
module.exports = app;
