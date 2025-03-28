import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import nodemailer from 'nodemailer';



// Función para generar el token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', {
    expiresIn: '30d'
  });
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName, phone } = req.body;

  // Validar que todos los campos necesarios estén presentes
  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Por favor complete todos los campos');
  }

  // Verificar si el usuario ya existe
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    res.status(400);
    throw new Error('El usuario ya existe');
  }

  // Crear un nuevo usuario con los campos adicionales
  const user = await User.create({
    username,
    email,
    password,
    firstName: firstName || '',
    lastName: lastName || '',
    phone: phone || ''
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      token: generateToken(user._id)
    });
  } else {
    res.status(400);
    throw new Error('Datos de usuario inválidos');
  }
});

// @desc    Autenticar usuario y obtener token
// @route   POST /api/users/login
// @access  Public
// @desc    Autenticar usuario y obtener token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Verificar que se enviaron username y password
  if (!username || !password) {
    res.status(400);
    throw new Error('Por favor ingrese nombre de usuario y contraseña');
  }

  // Buscar el usuario en la BD
  const user = await User.findOne({ username }).select('+password');

  // Verificar si el usuario existe y la contraseña es correcta
  if (user && (await user.matchPassword(password))) {
    // Verificar si el usuario tiene MFA habilitado
    if (user.mfaEnabled) {
      return res.json({
        requireMFA: true,
        username: user.username,
        message: 'Se requiere verificación MFA'
      });
    }
    
    // Si no tiene MFA, login normal
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Nombre de usuario o contraseña incorrectos');
  }
});

// @desc    Obtener el perfil del usuario
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      addresses: user.addresses || [],
      createdAt: user.createdAt
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

// @desc    Actualizar el perfil del usuario
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    
    // Si se proporciona una nueva contraseña, actualizarla
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.firstName || '',
      lastName: updatedUser.lastName || '',
      phone: updatedUser.phone || '',
      token: generateToken(updatedUser._id)
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

// @desc    Añadir una dirección al usuario
// @route   POST /api/users/addresses
// @access  Private
const addUserAddress = asyncHandler(async (req, res) => {
  const { type, street, city, state, zipCode, country, isDefault } = req.body;
  
  if (!type || !street || !city || !state || !zipCode || !country) {
    res.status(400);
    throw new Error('Por favor complete todos los campos de la dirección');
  }
  
  const user = await User.findById(req.user._id);
  
  if (user) {
    // Si esta dirección será la predeterminada, actualizar las direcciones existentes
    if (isDefault) {
      user.addresses.forEach(addr => {
        if (addr.type === type) {
          addr.isDefault = false;
        }
      });
    }
    
    // Añadir la nueva dirección
    user.addresses.push({
      type,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || false
    });
    
    await user.save();
    
    res.status(201).json({
      message: 'Dirección añadida correctamente',
      addresses: user.addresses
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

// @desc    Actualizar una dirección del usuario
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateUserAddress = asyncHandler(async (req, res) => {
  const addressId = req.params.id;
  const { type, street, city, state, zipCode, country, isDefault } = req.body;
  
  const user = await User.findById(req.user._id);
  
  if (user) {
    // Encontrar la dirección por ID
    const address = user.addresses.id(addressId);
    
    if (!address) {
      res.status(404);
      throw new Error('Dirección no encontrada');
    }
    
    // Actualizar los campos de la dirección
    address.type = type || address.type;
    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;
    address.country = country || address.country;
    
    // Si esta dirección será la predeterminada, actualizar las direcciones existentes
    if (isDefault) {
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== addressId && addr.type === address.type) {
          addr.isDefault = false;
        }
      });
      address.isDefault = true;
    }
    
    await user.save();
    
    res.json({
      message: 'Dirección actualizada correctamente',
      addresses: user.addresses
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

// @desc    Solicitar recuperación de contraseña
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    res.status(400);
    throw new Error('Por favor proporcione un correo electrónico');
  }
  
  // Buscar usuario por email
  const user = await User.findOne({ email });
  
  if (!user) {
    res.status(404);
    throw new Error('No existe una cuenta con ese correo electrónico');
  }
  
  // Generar token aleatorio
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Guardar token hasheado en la base de datos
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // Establecer expiración (1 hora)
  user.resetPasswordExpire = Date.now() + 3600000; // 1 hora
  
  await user.save();
  
  // Configurar transporte de correo
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'josuelopezhernandez112@gmail.com',
      pass: 'zawh elwn olpv vdoi'
    }
  });
  
  // URL de reseteo (frontend)
  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
  
  // Mensaje de correo
  const message = `
    Has solicitado recuperar tu contraseña.
    
    Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:
    
    ${resetUrl}
    
    Este enlace expirará en 1 hora.
    
    Si no solicitaste este cambio, puedes ignorar este correo electrónico.
  `;
  
  try {
    await transporter.sendMail({
      to: user.email,
      from: 'josuelopezhernandez112@gmail.com',
      subject: 'Recuperación de contraseña - Hunter\'s Candy',
      text: message
    });
    
    res.status(200).json({
      success: true,
      message: 'Correo electrónico enviado correctamente'
    });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    res.status(500);
    throw new Error('Error al enviar el correo electrónico. Por favor, intenta de nuevo más tarde.');
  }
});
// @desc    Resetear contraseña
// @route   PUT /api/users/reset-password/:resetToken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;
  
  if (!password) {
    res.status(400);
    throw new Error('Por favor proporcione una nueva contraseña');
  }
  
  // Hashear token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Buscar usuario por token y verificar que no haya expirado
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });
  
  if (!user) {
    res.status(400);
    throw new Error('Token inválido o expirado');
  }
  
  // Establecer nueva contraseña
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Contraseña restablecida correctamente'
  });
});
// @desc    Eliminar una dirección del usuario
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteUserAddress = asyncHandler(async (req, res) => {
  const addressId = req.params.id;
  
  const user = await User.findById(req.user._id);
  
  if (user) {
    // Encontrar la dirección por ID
    const address = user.addresses.id(addressId);
    
    if (!address) {
      res.status(404);
      throw new Error('Dirección no encontrada');
    }
    
    // Eliminar la dirección
    user.addresses.pull(addressId);
    
    await user.save();
    
    res.json({
      message: 'Dirección eliminada correctamente',
      addresses: user.addresses
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});
const setupMFA = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
  
  // Generar un secreto nuevo
  const secret = speakeasy.generateSecret({
    name: `Hunter's Candy:${user.email}`
  });
  
  // Guardar secreto de forma temporal (no habilitado todavía)
  user.mfaSecret = secret.base32;
  await user.save();
  
  // Generar código QR
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
  
  res.json({
    secret: secret.base32,
    qrCodeUrl
  });
});

// @desc    Verificar y activar MFA
// @route   POST /api/users/mfa/verify
// @access  Private
const verifyAndEnableMFA = asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    res.status(400);
    throw new Error('Se requiere un token');
  }
  
  const user = await User.findById(req.user._id).select('+mfaSecret');
  
  if (!user || !user.mfaSecret) {
    res.status(400);
    throw new Error('MFA no configurado correctamente');
  }
  
  // Verificar token
  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token
  });
  
  if (!verified) {
    res.status(400);
    throw new Error('Código inválido. Inténtalo de nuevo.');
  }
  
  // Activar MFA
  user.mfaEnabled = true;
  await user.save();
  
  res.json({
    success: true,
    message: 'MFA activado correctamente'
  });
});

// @desc    Desactivar MFA
// @route   POST /api/users/mfa/disable
// @access  Private
const disableMFA = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    res.status(400);
    throw new Error('Se requiere token y contraseña');
  }
  
  const user = await User.findById(req.user._id).select('+password +mfaSecret');
  
  // Verificar contraseña
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Contraseña incorrecta');
  }
  
  // Verificar token
  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token
  });
  
  if (!verified) {
    res.status(400);
    throw new Error('Código MFA inválido');
  }
  
  // Desactivar MFA
  user.mfaEnabled = false;
  user.mfaSecret = undefined;
  await user.save();
  
  res.json({
    success: true,
    message: 'MFA desactivado correctamente'
  });
});

// @desc    Verificar MFA durante login
// @route   POST /api/users/mfa/validate
// @access  Public
const validateMFA = asyncHandler(async (req, res) => {
  const { username, token } = req.body;
  
  if (!username || !token) {
    res.status(400);
    throw new Error('Se requiere usuario y token');
  }
  
  const user = await User.findOne({ username }).select('+mfaSecret');
  
  if (!user) {
    res.status(401);
    throw new Error('Credenciales inválidas');
  }
  
  // Verificar token MFA
  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token,
    window: 1 // Permite un token anterior o posterior
  });
  
  if (!verified) {
    res.status(401);
    throw new Error('Código MFA inválido');
  }
  
  // Generar JWT y responder igual que en login
  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    token: generateToken(user._id)
  });
});

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setupMFA,
  verifyAndEnableMFA,
  disableMFA,
  validateMFA,
  forgotPassword,
  resetPassword
};