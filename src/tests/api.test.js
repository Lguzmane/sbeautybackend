const request = require('supertest');
const express = require('express');
const app = express();

require('dotenv').config();
const authRoutes = require('../routes/authRoutes');
const serviciosRoutes = require('../routes/serviciosRoutes');

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/servicios', serviciosRoutes);

describe('Pruebas API SBeauty', () => {
  it('GET /api/servicios debe retornar 200 y un array', async () => {
    const res = await request(app).get('/api/servicios');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/auth/register debe crear usuario (201)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Test',
        apellido_paterno: 'Usuario',
        apellido_materno: 'Ejemplo',
        rut: `9${Math.floor(Math.random() * 1000000)}-9`,
        email: `test${Math.floor(Math.random() * 10000)}@mail.com`,
        password: '123456',
        telefono: '123456789',
        region: 'RM',
        comuna: 'Maipú',
        rol: 'Cliente'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
  });

  it('POST /api/auth/login debe fallar con credenciales incorrectas (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'correo@inexistente.cl',
        password: 'contrasena'
      });

    expect(res.statusCode).toBe(401);
  });

  it('GET /api/servicios/:id debe retornar 404 si no existe', async () => {
    const res = await request(app).get('/api/servicios/9999');
    expect(res.statusCode).toBe(404);
  });
});
