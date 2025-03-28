// src/controllers/category.controller.js
const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Obtener todas las categorías
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: err.message
    });
  }
};

// @desc    Obtener una categoría por ID
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener categoría',
      error: err.message
    });
  }
};

// @desc    Crear una nueva categoría
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al crear categoría',
      error: err.message
    });
  }
};

// @desc    Actualizar una categoría
// @route   PUT /api/categories/:id
// @access  Private (Admin)
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar categoría',
      error: err.message
    });
  }
};

// @desc    Eliminar una categoría
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    // Verificar si hay productos con esta categoría
    const products = await Product.find({ category: req.params.id });
    if (products.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la categoría porque tiene productos asociados'
      });
    }
    
    await category.remove();
    
    res.status(200).json({
      success: true,
      message: 'Categoría eliminada'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar categoría',
      error: err.message
    });
  }
};

// @desc    Obtener productos por categoría
// @route   GET /api/categories/:id/products
// @access  Public
exports.getCategoryProducts = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.id });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos por categoría',
      error: err.message
    });
  }
};