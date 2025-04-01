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
import { WebSocketServer } from 'ws';

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();
const allowedOrigins = [
  'https://dwp-hunters-candy.vercel.app',
  'http://localhost:3000'
];

// Configuración CORS
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Configurar middleware para todas las rutas
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Middleware
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ message: 'API de Hunter\'s Candy está funcionando correctamente' });
});

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

// Crear servidor HTTP
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Crear WebSocket Server
const wss = new WebSocketServer({ 
  server,
  path: '/ws'
});

const clients = new Map();

wss.on('connection', (ws) => {
  const id = Math.random().toString(36).substring(2, 10);
  console.log(`Cliente WebSocket conectado: ${id}`);
  clients.set(id, { ws, userId: null });

  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Conectado al servidor de Hunter\'s Candy',
    clientId: id
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('Mensaje WebSocket recibido:', message);
      
      switch (message.type) {
        case 'join':
          if (message.userId) {
            const client = clients.get(id);
            if (client) {
              client.userId = message.userId;
              console.log(`Usuario ${message.userId} asociado a la conexión ${id}`);
              ws.send(JSON.stringify({
                type: 'joined',
                message: `Unido como usuario ${message.userId}`
              }));
            }
          }
          break;
        case 'lowStock':
          broadcastMessage({
            type: 'stockAlert',
            productId: message.productId,
            productName: message.productName,
            stock: message.stock
          });
          break;
        default:
          console.log(`Tipo de mensaje desconocido: ${message.type}`);
      }
    } catch (error) {
      console.error('Error al procesar mensaje WebSocket:', error);
    }
  });

  ws.on('close', () => {
    console.log(`Cliente WebSocket desconectado: ${id}`);
    clients.delete(id);
  });

  ws.on('error', (error) => {
    console.error(`Error de WebSocket para cliente ${id}:`, error);
    clients.delete(id);
  });
});

const broadcastMessage = (message) => {
  const messageStr = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.ws.readyState === 1) {
      client.ws.send(messageStr);
    }
  });
};

const sendToUser = (userId, message) => {
  const messageStr = JSON.stringify(message);
  let sent = false;
  clients.forEach((client) => {
    if (client.userId === userId && client.ws.readyState === 1) {
      client.ws.send(messageStr);
      sent = true;
    }
  });
  return sent;
};

app.set('broadcastMessage', broadcastMessage);
app.set('sendToUser', sendToUser);

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

export default app;
