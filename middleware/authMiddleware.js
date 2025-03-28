import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// Middleware para proteger rutas
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Verificar si hay un token en los headers y si comienza con 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extraer el token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

      // Buscar el usuario sin incluir la contraseña
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('No autorizado, token inválido');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('No autorizado, no se proporcionó token');
  }
});

// Middleware para verificar rol de administrador
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('No autorizado como administrador');
  }
};

export { protect, admin };