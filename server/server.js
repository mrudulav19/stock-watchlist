
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Stock = require("./models/Stock");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test endpoint
app.get("/", (req, res) => {
  res.json({ message: "Stock Watchlist API is running!" });
});

// GET: retrieve stocks from MongoDB
app.get("/api/stocks", async (req, res) => {
  try {
    const stocks = await Stock.find().sort({ createdAt: -1 });
    res.json(stocks);
  } catch (error) {
    console.error("Fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch stocks." });
  }
});

// POST: create a stock in MongoDB
app.post("/api/stocks", async (req, res) => {
  try {
    const { symbol, companyName, price } = req.body;

    if (
      typeof symbol !== "string" ||
      !symbol.trim() ||
      typeof companyName !== "string" ||
      !companyName.trim() ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return res.status(400).json({
        message: "Enter a symbol, company name, and valid positive price."
      });
    }

    const stock = await Stock.create({
      symbol: symbol.trim().toUpperCase(),
      companyName: companyName.trim(),
      price
    });

    res.status(201).json(stock);
  } catch (error) {
    console.error("Create error:", error.message);
    res.status(500).json({ message: "Failed to save stock." });
  }
});

app.put("/api/stocks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, price } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid stock ID."
      });
    }

    if (
      typeof companyName !== "string" ||
      !companyName.trim() ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return res.status(400).json({
        message: "Enter a valid company name and positive price."
      });
    }

    const updatedStock = await Stock.findByIdAndUpdate(
      id,
      {
        companyName: companyName.trim(),
        price
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedStock) {
      return res.status(404).json({
        message: "Stock not found."
      });
    }

    res.json(updatedStock);
  } catch (error) {
    console.error("Update stock error:", error);
    res.status(500).json({
      message: "Failed to update stock."
    });
  }
});

// DELETE: remove a stock from MongoDB
app.delete("/api/stocks/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid stock ID." });
    }

    const stock = await Stock.findByIdAndDelete(req.params.id);

    if (!stock) {
      return res.status(404).json({ message: "Stock not found." });
    }

    res.json({ message: "Stock deleted successfully." });
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({ message: "Failed to delete stock." });
  }
});

// Connect to MongoDB before starting the server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
