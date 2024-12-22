const express = require('express');
const Product = require('../models/products'); // Importar el modelo de MongoDB

const router = express.Router();
const filePath = './data/products.json';

const readFile = () => JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const writeFile = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

router.get('/', async (req, res) => {
  try {
      const products = await Product.find(); // Obtiene todos los productos
      res.json(products); // Devuelve los productos en formato JSON
  } catch (error) {
      console.error('Error al obtener los productos:', error);
      res.status(500).json({ message: 'Error al obtener los productos' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params; // Obtiene el ID desde los parámetros de la URL

  try {
      const product = await Product.findById(id); // Busca el producto por ID
      if (!product) {
          return res.status(404).json({ message: 'Producto no encontrado' });
      }
      res.json(product); // Devuelve el producto en formato JSON
  } catch (error) {
      console.error('Error al obtener el producto:', error);
      res.status(500).json({ message: 'Error al obtener el producto' });
  }
});


// POST: agregamos nuevo producto
router.post('/', async (req, res) => {
  const { title, description, price, stock, category } = req.body;

  // Verificar que todos los campos obligatorios estén presentes
  if (!title || !description || !price || !stock || !category) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Crear un nuevo producto con los datos proporcionados
    const newProduct = new Product({ title, description, price, stock, category });
    await newProduct.save();  // Guardar el producto
    res.status(201).json(newProduct);  // Responder con el producto creado
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el producto', details: error.message });
  }
});

  

// PUT: update al producto id
router.put('/:pid', async (req, res) => {
    const { pid } = req.params;
    const updates = req.body;
  
    try {
      const updatedProduct = await Product.findByIdAndUpdate(pid, updates, { new: true });
      if (!updatedProduct) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el producto', details: error.message });
    }
  });

  
  router.delete('/:pid', async (req, res) => {
    const { pid } = req.params;
  
    try {
      const deletedProduct = await Product.findByIdAndDelete(pid);
      if (!deletedProduct) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el producto', details: error.message });
    }
  });
  

module.exports = router;
