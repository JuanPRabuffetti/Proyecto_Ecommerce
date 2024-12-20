const express = require('express');
const Product = require('../models/products'); // Importar el modelo de MongoDB

const router = express.Router();
const filePath = './data/products.json';

const readFile = () => JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const writeFile = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

router.get('/', async (req, res) => {
    const { limit = 10, page = 1, sort, query } = req.query;
  
    // Filtros de búsqueda
    const filter = query
      ? { $or: [{ title: new RegExp(query, 'i') }, { description: new RegExp(query, 'i') }] }
      : {};
  
    // Opciones de paginación y ordenamiento
    const options = {
      limit: parseInt(limit, 10),
      page: parseInt(page, 10),
      sort: sort ? { price: sort === 'asc' ? 1 : -1 } : undefined,
    };
  
    try {
      const result = await Product.paginate(filter, options);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los productos', details: error.message });
    }
  });
  

module.exports = router;

router.get('/:pid', (req, res) => {
    const products = readFile();
    const productId = parseInt(req.params.pid, 10);

    const product = products.find(p => p.id === productId);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

// POST: agregamos nuevo producto
router.post('/', async (req, res) => {
    const { title, description, price, category } = req.body;
  
    if (!title || !description || !price || !category) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
  
    try {
      const newProduct = await Product.create({ title, description, price, category });
      res.status(201).json(newProduct);
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
