import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();
const allowedOrigins = [
  'https://dwp-hunters-candy.vercel.app/', // Tu dominio de frontend en Vercel
  'http://localhost:3000' // Para desarrollo local
];

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://dwp-hunters-candy.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Manejar las solicitudes OPTIONS para preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La política CORS para este sitio no permite acceso desde el origen especificado.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Obtener el directorio actual con ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta básica para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'API de Hunter\'s Candy está funcionando correctamente' });
});

// Ruta básica para verificar que la API está funcionando
app.get('/api', (req, res) => {
  res.json({ message: 'API de Hunter\'s Candy está funcionando correctamente' });
});


// Rutas API
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Ruta para cargar imágenes
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Middleware para manejar errores
app.use(notFound);
app.use(errorHandler);

// Crear servidor HTTP solo si no está en producción
const PORT = process.env.PORT || 5000;
let server;
if (process.env.NODE_ENV !== 'production') {
  server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });

  // Configurar Socket.io
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  app.set('io', io);

  io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);
    
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`Usuario ${userId} unido a su sala personal`);
    });
    
    socket.on('orderUpdated', (data) => {
      console.log('Orden actualizada:', data);
      io.to(data.userId).emit('orderStatusChanged', data);
    });
    
    socket.on('lowStock', (data) => {
      io.emit('stockAlert', data);
    });
    
    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id);
    });
  });
}


// Exportar la app para Vercel
export default app;
