const express = require('express');
const fs = require('fs');

const router = express.Router();
const filePath = './data/products.json';

// Helper to read/write JSON
const readFile = () => JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const writeFile = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// GET: List all products (optionally with a limit)
router.get('/', (req, res) => {

    const { limit } = req.query;
    const products = readFile();
    res.json(limit ? products.slice(0, limit) : products);
});

// GET: Get a product by ID
router.get('/:pid', (req, res) => {
    const products = readFile();
    
    // Comparar ambos ID como números
    const product = products.find(p => p.id === parseInt(req.params.pid));

    if (product) {
        return res.json(product);  // Usar return para evitar que el flujo continúe
    } else {
        return res.status(404).json({ error: 'Product not found' });
    }
});

// POST: Add a new product
router.post('/', (req, res) => {
    const { title, description, code, price } = req.body;

    if (!title || !description || !code || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const products = readFile(); // Leer productos existentes

    // Generar un nuevo ID como número entero
    const newId = products.length > 0
        ? Math.max(...products.map(p => parseInt(p.id, 10))) + 1
        : 1;

    // Crear el nuevo producto
    const newProduct = {
        id: newId, // Aquí dejamos el `id` como un número
        title,
        description,
        code,
        price
    };

    products.push(newProduct); // Añadir el producto al array
    writeFile(products); // Guardar el array actualizado
    req.io.emit('productAdded', newProduct);


    res.status(201).json(newProduct); // Responder con el producto creado
});

// PUT: Update a product by ID
router.put('/:pid', (req, res) => {
    const { pid } = req.params;
    const updates = req.body;
    const products = readFile();

    const productIndex = products.findIndex(p => p.id === parseInt(pid));

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[productIndex];
    Object.assign(product, updates, { id: pid }); // Prevent ID modification
    writeFile(products);
    res.json(product);
});

// DELETE: Delete a product by ID
router.delete('/:pid', (req, res) => {
    const { pid } = req.params;
    let products = readFile();
    products = products.filter(p => p.id !== pid);
    writeFile(products);
    res.status(204).send();
});

module.exports = router;
