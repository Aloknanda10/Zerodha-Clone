import React from "react";

import usePortfolioData from "./usePortfolioData";

// 31428.95 -> "31.43k"
const compact = (value) =>
  Math.abs(value) >= 1000 ? `${(value / 1000).toFixed(2)}k` : value.toFixed(2);

const Summary = () => {
  const { data: holdings, isLoading, error } = usePortfolioData("/allHoldings");

  const investment = holdings.reduce((sum, s) => sum + s.avg * s.qty, 0);
  const currentValue = holdings.reduce((sum, s) => sum + s.price * s.qty, 0);
  const pnl = currentValue - investment;
  const pnlPercent = investment > 0 ? (pnl / investment) * 100 : 0;

  return (
    <>
      <div className="username">
        <h6>Hi, User!</h6>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Equity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>3.74k</h3>
            <p>Margin available</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Margins used <span>0</span>{" "}
            </p>
            <p>
              Opening balance <span>3.74k</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Holdings ({holdings.length})</p>
        </span>

        {isLoading && <p>Loading holdings...</p>}
        {error && <p className="loss">Could not load holdings: {error}</p>}

        {!isLoading && !error && (
          <div className="data">
            <div className="first">
              <h3 className={pnl >= 0 ? "profit" : "loss"}>
                {compact(pnl)}{" "}
                <small>
                  {pnl >= 0 ? "+" : ""}
                  {pnlPercent.toFixed(2)}%
                </small>
              </h3>
              <p>P&L</p>
            </div>
            <hr />

            <div className="second">
              <p>
                Current Value <span>{compact(currentValue)}</span>
              </p>
              <p>
                Investment <span>{compact(investment)}</span>
              </p>
            </div>
          </div>
        )}
        <hr className="divider" />
      </div>
    </>
  );
};

export default Summary;
