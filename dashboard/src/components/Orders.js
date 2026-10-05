import React, { useContext } from "react";
import { Link } from "react-router-dom";

import GeneralContext from "./GeneralContext";
import usePortfolioData from "./usePortfolioData";

const Orders = () => {
  const { ordersVersion } = useContext(GeneralContext);
  const {
    data: orders,
    isLoading,
    error,
  } = usePortfolioData("/allOrders", ordersVersion);

  if (isLoading) return <p className="title">Loading orders...</p>;
  if (error)
    return <p className="title loss">Could not load orders: {error}</p>;

  if (orders.length === 0) {
    return (
      <div className="orders">
        <div className="no-orders">
          <p>You haven't placed any orders yet</p>

          <Link to={"/"} className="btn">
            Get started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <h3 className="title">Orders ({orders.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString("en-IN")
                    : "-"}
                </td>
                <td className={order.mode === "BUY" ? "profit" : "loss"}>
                  {order.mode}
                </td>
                <td>{order.name}</td>
                <td>{order.qty}</td>
                <td>{Number(order.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Orders;
