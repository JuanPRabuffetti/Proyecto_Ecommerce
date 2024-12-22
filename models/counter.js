// models/counter.js
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  collectionName: { type: String, required: true },
  counter: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
