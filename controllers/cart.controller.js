// src/controllers/cart.controller.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Obtener carrito del usuario actual
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.product',
      select: 'name price images stock'
    });
    
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener carrito',
      error: err.message
    });
  }
};

// @desc    Añadir producto al carrito
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    // Verificar stock disponible
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'No hay suficiente stock disponible'
      });
    }
    
    // Obtener o crear carrito
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    
    // Verificar si el producto ya está en el carrito
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    
    if (itemIndex > -1) {
      // Actualizar cantidad si ya existe
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Añadir nuevo producto al carrito
      cart.items.push({
        product: productId,
        quantity
      });
    }
    
    await cart.save();
    
    // Obtener carrito actualizado con detalles de productos
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price images stock'
    });
    
    res.status(200).json({
      success: true,
      message: 'Producto añadido al carrito',
      data: cart
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al añadir producto al carrito',
      error: err.message
    });
  }
};

// @desc    Actualizar cantidad de producto en carrito
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;
    
    // Verificar que la cantidad es válida
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser mayor a 0'
      });
    }
    
    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    // Verificar stock disponible
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'No hay suficiente stock disponible'
      });
    }
    
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }
    
    // Encontrar el producto en el carrito
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en el carrito'
      });
    }
    
    // Actualizar cantidad
    cart.items[itemIndex].quantity = quantity;
    
    await cart.save();
    
    // Obtener carrito actualizado con detalles de productos
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price images stock'
    });
    
    res.status(200).json({
      success: true,
      message: 'Carrito actualizado',
      data: cart
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar carrito',
      error: err.message
    });
  }
};

// @desc    Eliminar producto del carrito
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }
    
    // Filtrar productos para eliminar el seleccionado
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    
    await cart.save();
    
    // Obtener carrito actualizado con detalles de productos
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price images stock'
    });
    
    res.status(200).json({
      success: true,
      message: 'Producto eliminado del carrito',
      data: cart
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto del carrito',
      error: err.message
    });
  }
};

// @desc    Vaciar carrito
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }
    
    cart.items = [];
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Carrito vaciado',
      data: cart
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al vaciar carrito',
      error: err.message
    });
  }
};

// @desc    Aplicar cupón de descuento
// @route   POST /api/cart/apply-coupon
// @access  Private
exports.applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    
    // Aquí normalmente verificarías el cupón en la base de datos
    // Por simplicidad, usamos un código de ejemplo
    if (couponCode !== 'HUNTER20') {
      return res.status(400).json({
        success: false,
        message: 'Cupón inválido o expirado'
      });
    }
    
    // Aplicar descuento del 20%
    const discountPercent = 20;
    
    res.status(200).json({
      success: true,
      message: 'Cupón aplicado correctamente',
      data: {
        code: couponCode,
        discountPercent
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al aplicar cupón',
      error: err.message
    });
  }
};