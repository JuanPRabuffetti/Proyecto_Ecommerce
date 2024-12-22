// Este código puede ser ejecutado una sola vez para inicializar el contador
const Counter = require('./models/counter');

async function initializeCounter() {
  await Counter.findOneAndUpdate(
    { collectionName: 'products' },
    { $setOnInsert: { collectionName: 'products', counter: 0 } },
    { upsert: true }
  );
}

initializeCounter()
  .then(() => console.log('Contador inicializado'))
  .catch((error) => console.error('Error al inicializar el contador', error));
