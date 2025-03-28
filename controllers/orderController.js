import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import asyncHandler from 'express-async-handler';

const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    couponCode,
    discountAmount
  } = req.body;
  
  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No hay items en la orden');
  }
  
  // Verificar stock de los productos y actualizar stock
// Verificar stock de los productos y actualizar stock
for (const item of orderItems) {
  try {
    // Intentar encontrar el producto por su ID
    const product = await Product.findById(item.product);
    
    if (!product) {
      // Si el producto no se encuentra, continuamos sin error
      // para permitir compras de demostración
      console.log(`Producto no encontrado: ${item.name} con ID ${item.product}`);
      continue;
    }
    
    if (product.stock < item.quantity) {
      // En lugar de detener la compra, ajustamos la cantidad al stock disponible
      console.log(`Stock insuficiente para ${product.name}. Reduciendo cantidad.`);
      item.quantity = product.stock || 1;
    }
    
    // Actualizar el stock
    product.stock = Math.max(0, product.stock - item.quantity);
    await product.save();
  } catch (err) {
    console.error(`Error al procesar producto ${item.name}:`, err);
    // Continuamos con el siguiente producto
    continue;
  }
}
  
  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    couponCode,
    discountAmount
  });
  
  const createdOrder = await order.save();
  
  res.status(201).json(createdOrder);
});

// @desc    Obtener las órdenes del usuario actual
// @route   GET /api/orders/myorders
// @access  Private
// @desc    Obtener las órdenes del usuario actual
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  // Buscar las órdenes del usuario y ordenarlas por fecha (más recientes primero)
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: 'orderItems.product',
      select: 'name images category'
    });
  
  res.json(orders);
});

// @desc    Obtener una orden por ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'username email');
  
  if (order && (order.user._id.toString() === req.user._id.toString() || req.user.isAdmin)) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Orden no encontrada');
  }
});

// @desc    Actualizar estado de pago de la orden
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address
    };
    
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Orden no encontrada');
  }
});

// @desc    Actualizar estado de entrega de la orden
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'Entregado';
    
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Orden no encontrada');
  }
});

// @desc    Actualizar estado de la orden
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
// Añadir parámetro io para socket.io
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  
  if (!status) {
    res.status(400);
    throw new Error('Por favor ingrese un estado válido');
  }
  
  if (order) {
    order.status = status;
    
    // Si el estado es "Entregado", actualizar isDelivered también
    if (status === 'Entregado') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    const updatedOrder = await order.save();
    
    // Emitir evento vía Socket.io
    req.app.get('io').to(order.user.toString()).emit('orderStatusChanged', {
      orderId: order._id,
      status: order.status,
      userId: order.user.toString()
    });
    
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Orden no encontrada');
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { couponCode, subtotal } = req.body;
  
  if (!couponCode || !subtotal) {
    res.status(400);
    throw new Error('Por favor proporcione el código del cupón y el subtotal');
  }
  
  // Validar código de cupón
  if (couponCode === 'HUNTER20') {
    const discountAmount = subtotal * 0.2; // 20% de descuento
    
    res.json({
      valid: true,
      discountAmount: Number(discountAmount.toFixed(2)),
      message: 'Cupón aplicado correctamente: 20% de descuento'
    });
  } else if (couponCode === 'WELCOME10') {
    const discountAmount = subtotal * 0.1; // 10% de descuento
    
    res.json({
      valid: true,
      discountAmount: Number(discountAmount.toFixed(2)),
      message: 'Cupón aplicado correctamente: 10% de descuento'
    });
  } else {
    res.status(400);
    throw new Error('Cupón inválido o expirado');
  }
});

export {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  applyCoupon
};