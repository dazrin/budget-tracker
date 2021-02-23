// Dependancies
const mongoose = require("mongoose");

// Define Schema as mongoose Schema
const { Schema } = mongoose;

// Define transaction model as a new mongoose Schema
const transactionSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: "Enter a name for transaction"
    },
    value: {
      type: Number,
      required: "Enter an amount"
    },
    date: {
      type: Date,
      default: Date.now
    },
  },
);

// Define Transaction as transaction model schema
const Transaction = mongoose.model("Transaction", transactionSchema);

// Export model
module.exports = Transaction;
