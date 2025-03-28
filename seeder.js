import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import users from './data/users.js';
import products from './data/products.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Order from './models/orderModel.js';
import connectDB from './config/database.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Limpiar todas las colecciones
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Bases de datos limpiadas...'.yellow);

    // Insertar usuarios
    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} usuarios creados`.cyan);
    
    const adminUser = createdUsers[0]._id;

    // Añadir usuario admin a cada producto
    const sampleProducts = products.map(product => {
      return { ...product, user: adminUser };
    });

    // Insertar productos
    await Product.insertMany(sampleProducts);
    console.log(`${sampleProducts.length} productos creados`.cyan);

    console.log('¡Datos importados correctamente!'.green.inverse.bold);
    process.exit();
  } catch (error) {
    console.error(`${error.message}`.red.inverse.bold);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    // Limpiar todas las colecciones
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('¡Datos eliminados correctamente!'.red.inverse.bold);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse.bold);
    process.exit(1);
  }
};

// Si se pasa el argumento -d, eliminar datos, de lo contrario importar
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}