
const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0.01
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stock", stockSchema);
