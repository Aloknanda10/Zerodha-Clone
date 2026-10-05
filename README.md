# Zerodha Clone

A full-stack clone of the Zerodha trading platform, split into three apps:

| App | Path | Stack | Port |
| --- | --- | --- | --- |
| REST API | `backend/` | Node.js, Express, MongoDB (Mongoose) | 3002 |
| Landing site | `frontend/` | React, React Router, Bootstrap | 3000 |
| Trading dashboard | `dashboard/` | React, Axios, Chart.js, Material UI | 3001 |

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Server and database status |
| GET | `/allHoldings` | All holdings |
| GET | `/allPositions` | All open positions |
| GET | `/allOrders` | All orders, newest first |
| POST | `/newOrder` | Place an order. Body: `{ name, qty, price, mode }` where `mode` is `BUY` or `SELL` |

Invalid input returns `400` with a list of validation errors; unknown routes return `404`; unexpected failures return `500` without leaking internals.

## Running locally

Requires Node.js 18+ and MongoDB (local or Atlas).

```bash
# 1. API
cd backend
cp .env.example .env      # then set MONGO_URL
npm install
npm run seed              # loads sample holdings and positions
npm run dev

# 2. Landing site
cd ../frontend
npm install
npm start

# 3. Dashboard
cd ../dashboard
npm install
npm start
```

## Images

The landing site expects these files in `frontend/public/media/images/` (not included in the repo):

appstoreBadge.svg, coin.png, console.png, ecosystem.png, education.svg, googlePlayBadge.svg, homeHero.png, intradayTrades.svg, kite.png, kiteconnect.png, largestBroker.svg, logo.svg, nithinKamath.jpg, pressLogos.png, pricingEquity.svg, smallcaseLogo.png, varsity.png

Missing images are hidden instead of showing a broken icon.

## Tests

```bash
cd backend
npm test
```

## Credits

Base project from the Apna College Delta course ([original repo](https://github.com/apna-college/Zerodha)).

My additions: input validation, centralized error handling, proper 400/404/500 responses, automated tests, seed scripts, environment-based config, and bug fixes (see commit history).
