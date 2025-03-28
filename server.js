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

// Crear servidor HTTP
const server = http.createServer(app);

// Configurar Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.set('io', io);


// Obtener el directorio actual con ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas API
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Ruta para cargar imágenes
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Lógica de WebSockets
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);
  
  // Unir a usuario a sala basada en su ID
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`Usuario ${userId} unido a su sala personal`);
  });
  
  // Escuchar eventos de actualización de órdenes
  socket.on('orderUpdated', (data) => {
    console.log('Orden actualizada:', data);
    io.to(data.userId).emit('orderStatusChanged', data);
  });
  
  // Notificación de stock bajo
  socket.on('lowStock', (data) => {
    io.emit('stockAlert', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Middleware para manejar errores
app.use(notFound);
app.use(errorHandler);

// Puerto y arranque del servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});