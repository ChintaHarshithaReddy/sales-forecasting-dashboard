# sales-forecasting-dashboard

Interactive sales forecasting dashboard with revenue projections, pipeline tracking, and regional performance — built with React and Recharts.

## Features

- **Revenue chart** — actuals vs. forecast, with a confidence band that widens over the forecast horizon
- **KPI strip** — trailing revenue, forecast, open pipeline, win rate
- **Pipeline by stage** — funnel-style breakdown with deal counts
- **Bookings by region** — actual vs. target
- **Top open deals** — table with stage, value, win probability, and close date

All data in this repo is sample data. Swap in real numbers in `src/SalesForecastDashboard.jsx`.

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

## Tech stack

- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Recharts](https://recharts.org) for charts
- [Lucide](https://lucide.dev) for icons
