import React, { useState, useContext } from "react";

import api, { getErrorMessage } from "../api";
import GeneralContext from "./GeneralContext";

import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid }) => {
  const { closeBuyWindow, orderPlaced } = useContext(GeneralContext);

  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const qty = Number(stockQuantity);
  const price = Number(stockPrice);
  const marginRequired = qty > 0 && price > 0 ? qty * price : 0;

  const handleBuyClick = async () => {
    if (!Number.isInteger(qty) || qty <= 0) {
      setError("Quantity must be a whole number greater than 0");
      return;
    }
    if (!(price > 0)) {
      setError("Price must be greater than 0");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await api.post("/newOrder", { name: uid, qty, price, mode: "BUY" });
      orderPlaced();
      closeBuyWindow();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" id="buy-window">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              step="1"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              min="0"
              step="0.05"
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
            />
          </fieldset>
        </div>
        {error && (
          <p
            role="alert"
            style={{ color: "#df514c", fontSize: "0.8rem", margin: "8px 0 0" }}
          >
            {error}
          </p>
        )}
      </div>

      <div className="buttons">
        <span>Margin required ₹{marginRequired.toFixed(2)}</span>
        <div>
          <button
            type="button"
            className="btn btn-blue"
            onClick={handleBuyClick}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Placing..." : "Buy"}
          </button>
          <button
            type="button"
            className="btn btn-grey"
            onClick={closeBuyWindow}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
