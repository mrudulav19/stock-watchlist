
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/stocks";

function App() {
  const [stocks, setStocks] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  async function fetchStocks() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load stocks.");
      }

      const data = await response.json();
      setStocks(data);
    } catch (err) {
      setError(err.message || "Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStocks();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          symbol,
          companyName,
          price: Number(price)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add stock.");
      }

      setStocks((current) => [data, ...current]);
      setSymbol("");
      setCompanyName("");
      setPrice("");
      setMessage("Stock added successfully!");
    } catch (err) {
      setError(err.message || "Unable to add stock.");
    }
  }

  async function handleDelete(id) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to remove stock.");
      }

      setStocks((current) =>
        current.filter((stock) => stock._id !== id)
      );
      setMessage("Stock removed successfully!");
    } catch (err) {
      setError(err.message || "Unable to remove stock.");
    }
  }

async function handleUpdate(event) {
  event.preventDefault();
  setError("");
  setMessage("");

  const form = event.currentTarget;
  const formData = new FormData(form);

  const companyName = formData.get("companyName");
  const price = Number(formData.get("price"));

  try {
    const response = await fetch(`${API_URL}/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, price })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to update stock.");
    }

    setStocks((current) =>
      current.map((stock) =>
        stock._id === editingId ? data : stock
      )
    );

    setEditingId(null);
    setMessage("Stock updated successfully!");
  } catch (err) {
    setError(err.message || "Unable to update stock.");
  }
}

  return (
    <main className="app">
      <header className="header">
        <div>
          <p className="eyebrow">PERSONAL FINANCE TOOL</p>
          <h1>Stock Watchlist</h1>
          <p className="subtitle">
            Your favourite companies, all in one place.
          </p>
        </div>

        <div className="count">
          <strong>{stocks.length}</strong>
          <span>WATCHING</span>
        </div>
      </header>

      <section className="panel">
        <h2>Add a stock</h2>

        <form onSubmit={handleSubmit} className="stock-form">
          <label>
            Stock symbol
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g. INFY"
              maxLength={20}
              required
            />
          </label>

          <label>
            Company name
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Infosys"
              maxLength={100}
              required
            />
          </label>

          <label>
            Sample price (₹)
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1500"
              required
            />
          </label>

          <button type="submit">+ Add stock</button>
        </form>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Your watchlist</h2>
          <button
            className="refresh"
            type="button"
            onClick={fetchStocks}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading stocks...</p>
        ) : stocks.length === 0 ? (
          <p>No stocks yet. Add your first one above.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Company</th>
                  <th>Sample price</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock._id}>
                    <td className="symbol">{stock.symbol}</td>
                    <td>{stock.companyName}</td>
                    <td>
                      ₹{Number(stock.price).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                    
                  
<td>
  {editingId === stock._id ? (
    <form onSubmit={handleUpdate} className="edit-form">
      <input
        name="companyName"
        defaultValue={stock.companyName}
        placeholder="Company name"
        required
        maxLength={100}
      />
      <input
        name="price"
        type="number"
        defaultValue={stock.price}
        min="0.01"
        step="0.01"
        required
      />
      <button type="submit">Save</button>
      <button
        type="button"
        className="refresh"
        onClick={() => setEditingId(null)}
      >
        Cancel
      </button>
    </form>
  ) : (
    <>
      <button
        type="button"
        onClick={() => setEditingId(stock._id)}
      >
        Edit
      </button>{" "}
      <button
        className="delete"
        type="button"
        onClick={() => handleDelete(stock._id)}
      >
        Remove
      </button>
    </>
  )}
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="disclaimer">
          Sample prices only — this app does not show live market data.
        </p>
      </section>
    </main>
  );
}

export default App;
