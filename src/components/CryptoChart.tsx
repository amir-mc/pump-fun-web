import type { ApexOptions } from "apexcharts";
import React, { useMemo } from "react";
import Chart from "react-apexcharts";


// Mock OHLCV data: [timestamp, open, high, low, close]
const mockData = [
  [1697308800000, 30000, 30500, 29500, 30200],
  [1697312400000, 30200, 30800, 30100, 30700],
  [1697316000000, 30700, 31000, 30600, 30850],
  [1697319600000, 30850, 31200, 30750, 31100],
  [1697323200000, 31100, 31500, 31000, 31400],
  [1697323200000, 31400, 30000, 30000, 29999],
];

// Format data for ApexCharts
const seriesData = mockData.map(c => ({
  x: new Date(c[0]),
  y: [c[1], c[2], c[3], c[4]],
}));

const CryptoChart: React.FC = () => {
  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: "candlestick",
      height: 400,
      background: "#0d1117",
    },
    theme: { mode: "dark" },
    xaxis: { type: "datetime" },
    yaxis: { tooltip: { enabled: true } },
  }), []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-white mb-2">BTC/USDT (Mock)</h2>
      <Chart options={options} series={[{ data: seriesData }]} type="candlestick" height={400} />
    </div>
  );
};

export default CryptoChart;
