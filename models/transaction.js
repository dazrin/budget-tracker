// Dependancies
const mongoose = require('mongoose');

// Deconstruct + store Schema from mongoose
const { Schema } = mongoose;

// Define Schema of Transaction
const transactionSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: 'Enter a name for transaction',
    },
    value: {
      type: Number,
      required: 'Enter an amount',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
);

// Assign transaction Schema as a model
const Transaction = mongoose.model('Transaction', transactionSchema);

// Export Transaction model
module.exports = Transaction;
