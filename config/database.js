import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';

dotenv.config();

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hunters_candy';
    
    console.log(`Conectando a MongoDB Atlas...`.cyan.underline);
    
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB conectado: ${conn.connection.host}`.green.underline.bold);
    
    return conn;
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`.red.underline.bold);
    process.exit(1);
  }
};

export default connectDB;