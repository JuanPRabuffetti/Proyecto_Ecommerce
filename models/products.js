// models/products.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Counter = require('./counter');  // Asegúrate de importar el modelo Counter

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
});
productSchema.plugin(mongoosePaginate);

productSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      // Aquí incrementamos el contador para obtener un ID único y secuencial
      const counter = await Counter.findOneAndUpdate(
        { collectionName: 'products' },
        { $inc: { counter: 1 } },
        { new: true, upsert: true } // Si no existe, crea un nuevo documento
      );
      console.log('Nuevo contador:', counter.counter);  // Esto debería mostrar el contador incrementado

      this.id = counter.counter;  // Asignamos el valor del contador al id del producto
    } catch (error) {
        console.error('Error al actualizar el contador:', error);
        return next(error);
      

    }
  }
  next();
});


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
