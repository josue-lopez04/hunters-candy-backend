import Product from '../models/productModel.js';
import asyncHandler from 'express-async-handler';

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 12; // Productos por página
  const page = Number(req.query.page) || 1;
  
  // Construir query de acuerdo a los filtros
  const query = {};
  
  // Filtrar por categoría
  if (req.query.category && req.query.category !== 'all') {
    query.category = req.query.category;
  }
  
  // Filtrar por rango de precio
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) {
      query.price.$gte = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      query.price.$lte = Number(req.query.maxPrice);
    }
  }
  
  // Búsqueda por palabra clave
  if (req.query.keyword) {
    query.$or = [
      { name: { $regex: req.query.keyword, $options: 'i' } },
      { description: { $regex: req.query.keyword, $options: 'i' } }
    ];
  }
  
  // Contar total de productos que coinciden con la consulta
  const count = await Product.countDocuments(query);
  
  // Obtener productos paginados
  let products = await Product.find(query)
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  
  // Ordenar resultados si se solicita
  if (req.query.sortBy) {
    let sortProducts;
    
    switch (req.query.sortBy) {
      case 'price-asc':
        sortProducts = products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortProducts = products.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        sortProducts = products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sortProducts = products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        sortProducts = products;
    }
    
    products = sortProducts;
  }
  
  // Calcular precio final con descuento para cada producto
  products = products.map(product => {
    const finalPrice = product.price * (1 - product.discount / 100);
    return {
      ...product.toObject(),
      finalPrice: Number(finalPrice.toFixed(2))
    };
  });
  
  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    totalProducts: count
  });
});

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (product) {
    // Calcular precio final con descuento
    const finalPrice = product.price * (1 - product.discount / 100);
    
    // Obtener productos relacionados (misma categoría)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id } // excluir el producto actual
    }).limit(4);
    
    // Transformar productos relacionados
    const formattedRelatedProducts = relatedProducts.map(relProd => {
      const relFinalPrice = relProd.price * (1 - relProd.discount / 100);
      return {
        id: relProd._id,
        name: relProd.name,
        price: relProd.price,
        image: relProd.images[0],
        finalPrice: Number(relFinalPrice.toFixed(2))
      };
    });
    
    // Crear objeto de respuesta con el producto y sus detalles
    const productResponse = {
      ...product.toObject(),
      finalPrice: Number(finalPrice.toFixed(2)),
      relatedProducts: formattedRelatedProducts
    };
    
    // Si el stock es bajo, emitir una alerta
    if (product.stock > 0 && product.stock <= 5) {
      const io = req.app.get('io');
      if (io) {
        io.emit('stockAlert', {
          productId: product._id,
          productName: product.name,
          stock: product.stock
        });
      }
    }
    
    res.json(productResponse);
  } else {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
});

// @desc    Obtener productos destacados
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 4;
  
  let featuredProducts = await Product.find({ featured: true }).limit(limit);
  
  // Calcular precio final con descuento para cada producto
  featuredProducts = featuredProducts.map(product => {
    const finalPrice = product.price * (1 - product.discount / 100);
    return {
      ...product.toObject(),
      finalPrice: Number(finalPrice.toFixed(2))
    };
  });
  
  res.json(featuredProducts);
});

// @desc    Añadir una reseña a un producto
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  
  if (!rating || !comment) {
    res.status(400);
    throw new Error('Por favor ingrese una calificación y un comentario');
  }
  
  const product = await Product.findById(req.params.id);
  
  if (product) {
    // Verificar si el usuario ya ha escrito una reseña
    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );
    
    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Ya has escrito una reseña para este producto');
    }
    
    // Crear la nueva reseña
    const review = {
      rating: Number(rating),
      comment,
      user: req.user._id,
      userName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.username
    };
    
    // Añadir la reseña al producto
    product.reviews.push(review);
    
    // Recalcular la calificación promedio del producto
    await product.calculateRating();
    
    res.status(201).json({ message: 'Reseña añadida correctamente' });
  } else {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
});

// @desc    Obtener productos por categoría
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const category = req.params.category;
  const limit = Number(req.query.limit) || 8;
  
  let products = await Product.find({ category }).limit(limit);
  
  // Calcular precio final con descuento para cada producto
  products = products.map(product => {
    const finalPrice = product.price * (1 - product.discount / 100);
    return {
      ...product.toObject(),
      finalPrice: Number(finalPrice.toFixed(2))
    };
  });
  
  res.json(products);
});

// @desc    Actualizar stock de un producto
// @route   PUT /api/products/:id/stock
// @access  Private
const updateProductStock = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  
  if (quantity === undefined) {
    res.status(400);
    throw new Error('Por favor especifique la cantidad');
  }
  
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
  
  // Verificar que haya suficiente stock
  if (product.stock < quantity) {
    res.status(400);
    throw new Error('No hay suficiente stock disponible');
  }
  
  // Actualizar stock
  product.stock = Math.max(0, product.stock - quantity);
  await product.save();
  
  // Si el stock es bajo (menos de 5 unidades), emitir un evento
  if (product.stock > 0 && product.stock <= 5) {
    // Emitir evento de stock bajo a través de Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('stockAlert', {
        productId: product._id,
        productName: product.name,
        stock: product.stock
      });
    }
  }
  
  res.json({
    success: true,
    stock: product.stock,
    message: `Stock actualizado. Quedan ${product.stock} unidades.`
  });
});

// @desc    Crear un nuevo producto (solo admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    discount,
    stock,
    category,
    images,
    specifications,
    featured
  } = req.body;
  
  const productExists = await Product.findOne({ name });
  
  if (productExists) {
    res.status(400);
    throw new Error('Ya existe un producto con ese nombre');
  }
  
  const product = new Product({
    name,
    description,
    price,
    discount: discount || 0,
    stock,
    category,
    images: images || [],
    specifications: specifications || {},
    featured: featured || false,
    user: req.user._id
  });
  
  const createdProduct = await product.save();
  
  res.status(201).json(createdProduct);
});

// @desc    Actualizar un producto (solo admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    discount,
    stock,
    category,
    images,
    specifications,
    featured
  } = req.body;
  
  const product = await Product.findById(req.params.id);
  
  if (product) {
    const oldStock = product.stock;
    
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.discount = discount !== undefined ? discount : product.discount;
    product.stock = stock !== undefined ? stock : product.stock;
    product.category = category || product.category;
    product.images = images || product.images;
    product.specifications = specifications || product.specifications;
    product.featured = featured !== undefined ? featured : product.featured;
    
    const updatedProduct = await product.save();
    
    // Si el stock ha cambiado y ahora es bajo, emitir alerta
    if (updatedProduct.stock !== oldStock && updatedProduct.stock > 0 && updatedProduct.stock <= 5) {
      const io = req.app.get('io');
      if (io) {
        io.emit('stockAlert', {
          productId: updatedProduct._id,
          productName: updatedProduct.name,
          stock: updatedProduct.stock
        });
      }
    }
    
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
});

// @desc    Eliminar un producto (solo admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (product) {
    await product.remove();
    res.json({ message: 'Producto eliminado' });
  } else {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
});

export {
  getProducts,
  getProductById,
  getFeaturedProducts,
  createProductReview,
  getProductsByCategory,
  updateProductStock,
  createProduct,
  updateProduct,
  deleteProduct
};