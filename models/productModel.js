import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    userName: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor ingrese un nombre para el producto'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Por favor ingrese una descripción para el producto']
    },
    price: {
      type: Number,
      required: [true, 'Por favor ingrese un precio para el producto'],
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    stock: {
      type: Number,
      required: [true, 'Por favor ingrese la cantidad en stock'],
      min: 0,
      default: 0
    },
    category: {
      type: String,
      required: [true, 'Por favor seleccione una categoría'],
      enum: ['armas', 'ropa', 'carnada', 'accesorios']
    },
    images: [
      {
        type: String,
        required: true
      }
    ],
    specifications: {
      type: Map,
      of: String
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Método para calcular la calificación promedio
productSchema.methods.calculateRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating = sum / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
  
  return this.save();
};

const Product = mongoose.model('Product', productSchema);

export default Product;