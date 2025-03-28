import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 't4sk_m4n4g3r_s3cr3t_k3y_2025';

// @desc    Autenticar usuario
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validación simple
    if (!username || !password) {
      return res.status(400).json({ message: 'Por favor proporcione usuario y contraseña' });
    }

    // Buscar usuario por nombre de usuario
    const user = await User.findOne({ username });

    // Si no se encuentra el usuario o la contraseña no coincide
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar contraseña
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Actualizar fecha de último inicio de sesión
    user.last_login = new Date();
    await user.save();

    // Generar token (10 minutos)
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: '10m',
    });

    // Enviar respuesta de éxito
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// @desc    Registrar usuario nuevo
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validación
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario o correo electrónico ya está registrado' });
    }

    // Crear usuario
    const user = await User.create({
      username,
      email,
      password,
      last_login: new Date()
    });

    // Enviar respuesta de éxito
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '10m' })
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};