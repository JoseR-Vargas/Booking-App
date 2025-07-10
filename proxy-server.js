const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 8000;

// Servir archivos estáticos
app.use(express.static('.'));

// Proxy para las rutas de la API
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''
  }
}));

// Proxy para config
app.use('/config', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true
}));

// Proxy para bookings
app.use('/bookings', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true
}));

app.listen(PORT, () => {
  console.log(`🚀 Servidor proxy corriendo en http://localhost:${PORT}`);
  console.log(`📡 Proxy configurado para backend en http://localhost:3000`);
}); 