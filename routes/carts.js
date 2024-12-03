const express = require('express');
const fs = require('fs');
const router = express.Router();

const cartsPath = './data/carts.json'; // Ruta del archivo donde se almacenan los carritos

// Helper functions
const readFile = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const writeFile = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// POST / - Crear un nuevo carrito
router.post('/', (req, res) => {
    const carts = readFile(cartsPath);
    const newId = carts.length > 0 
        ? Math.max(...carts.map(cart => parseInt(cart.id, 10))) + 1 
        : 1; // Generar ID único

    const newCart = {
        id: newId.toString(), // Convertir ID a string para consistencia
        products: [] // Carrito vacío inicialmente
    };

    carts.push(newCart);
    writeFile(cartsPath, carts);
    res.status(201).json(newCart); // Retornar el nuevo carrito creado
});

// GET /:cid - Listar productos de un carrito específico
router.get('/:cid', (req, res) => {
    const { cid } = req.params;
    const carts = readFile(cartsPath);
    const cart = carts.find(cart => cart.id === cid);

    if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    res.json(cart.products); // Retornar los productos del carrito
});

// POST /:cid/product/:pid - Agregar un producto a un carrito
router.post('/:cid/product/:pid', (req, res) => {
    const { cid, pid } = req.params;
    const carts = readFile(cartsPath);

    // Buscar el carrito
    const cart = carts.find(cart => cart.id === cid);
    if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    // Buscar si el producto ya existe en el carrito
    const existingProduct = cart.products.find(p => p.product === pid);
    if (existingProduct) {
        // Incrementar la cantidad si el producto ya existe
        existingProduct.quantity += 1;
    } else {
        // Agregar un nuevo producto con cantidad inicial 1
        cart.products.push({ product: pid, quantity: 1 });
    }

    writeFile(cartsPath, carts);
    res.status(201).json(cart); // Retornar el carrito actualizado
});

module.exports = router;