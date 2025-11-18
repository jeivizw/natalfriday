require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permitir requisições do frontend
app.use(express.json()); // Parsear JSON no body
app.use(express.urlencoded({ extended: true })); // Parsear form data

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: '🎉 API Back Friday está funcionando!',
    version: '1.0.0',
    database: 'Supabase (PostgreSQL)',
    endpoints: {
      products: '/api/products'
    }
  });
});

// Rotas da API
app.use('/api', productRoutes);

// Middleware de erro 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});