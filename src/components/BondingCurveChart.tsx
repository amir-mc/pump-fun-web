// components/BondingCurveChart.tsx
import React from 'react';
import Chart from 'react-apexcharts';

interface CurveData {
  curveAddress: string;
  virtualTokens: number;
  virtualSol: number;
  realTokens: number;
  realSol: number;
  totalSupply: number;
  complete: boolean;
  creator: string | null;
  lastUpdated: string;
  currentPriceSOL: number;
  currentPriceUSD: number;
  currentMarketCapSOL: number;
  currentMarketCapUSD: number;
  launchPriceSOL: number;
  launchPriceUSD: number;
  launchTimestamp: string;
  launchMarketCapUSD: number;
  launchMarketCapSOL: number;
  percentageFromLaunch: number;
  athSOL: number;
  athUSD: number;
  athTimestamp: string;
  percentageFromATH: number;
  athMarketCapUSD: number;
  athMarketCapSOL: number;
  priceHistory: any[];
  solPrice: number;
  timestamp: string;
}

interface BondingCurveChartProps {
  curveData: CurveData;
  chartType: 'dual' | 'price' | 'marketcap';
  onChartTypeChange: (type: 'dual' | 'price' | 'marketcap') => void;
}

// تابع برای شبیه‌سازی تاریخچه قیمت بر اساس تراکنش‌ها
const simulatePriceHistory = (priceHistory: any[], solPrice: number) => {
  if (!priceHistory || priceHistory.length === 0) return [];

  console.log('📊 Simulating price history from', priceHistory.length, 'records');

  // اگر داده‌های کافی نداریم، از همان priceHistory استفاده می‌کنیم
  if (priceHistory.length <= 1) {
    return priceHistory.map(point => ({
      x: point.x,
      y: point.y,
      marketCapUSD: point.marketCapUSD,
      priceSOL: point.y,
      priceUSD: point.y * solPrice
    }));
  }

  // شبیه‌سازی progressive price history
  const simulatedHistory = [];
  let runningVirtualSol = priceHistory[0].virtualSolReserves;
  let runningVirtualToken = priceHistory[0].virtualTokenReserves;

  for (let i = 0; i < priceHistory.length; i++) {
    const record = priceHistory[i];
    
    // محاسبه قیمت بر اساس virtual reserves فعلی
    const virtualSol = runningVirtualSol / 1e9; // تبدیل به SOL
    const virtualToken = runningVirtualToken / 1e9; // تبدیل به توکن (فرض بر 9 رقم اعشار)
    
    let priceSOL = 0;
    if (virtualToken > 0) {
      priceSOL = virtualSol / virtualToken;
    }

    const totalSupply = record.tokenTotalSupply / 1e9;
    const marketCapSOL = priceSOL * totalSupply;
    const marketCapUSD = marketCapSOL * solPrice;

    simulatedHistory.push({
      x: record.x,
      y: priceSOL,
      marketCapUSD: marketCapUSD,
      priceSOL: priceSOL,
      priceUSD: priceSOL * solPrice,
      virtualSolReserves: runningVirtualSol,
      virtualTokenReserves: runningVirtualToken,
      tokenTotalSupply: record.tokenTotalSupply
    });

    // به روزرسانی virtual reserves برای رکورد بعدی (اگر وجود دارد)
    if (i < priceHistory.length - 1) {
      const nextRecord = priceHistory[i + 1];
      
      // تقریب تغییرات - اینجا نیاز به داده‌های دقیق تر tokenDiff داریم
      // برای حالا از تغییرات نسبی استفاده می‌کنیم
      const solChange = nextRecord.virtualSolReserves - record.virtualSolReserves;
      const tokenChange = nextRecord.virtualTokenReserves - record.virtualTokenReserves;
      
      runningVirtualSol += solChange;
      runningVirtualToken += tokenChange;
    }
  }

  console.log('✅ Simulated history points:', simulatedHistory.length);
  return simulatedHistory;
};

const BondingCurveChart: React.FC<BondingCurveChartProps> = ({ 
  curveData, 
  chartType,
  onChartTypeChange 
}) => {
  const formatAddress = (address: string | null) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  // استفاده از داده‌های ATH که از سرور با فرمول اصلاح شده آمده
  const displayATHSOL = curveData.athSOL;
  const displayATHUSD = curveData.athUSD;
  const displayATHMarketCapUSD = curveData.athMarketCapUSD;
  const displayATHTimestamp = new Date(curveData.athTimestamp);

  // شبیه‌سازی تاریخچه قیمت واقعی
  const simulatedHistory = simulatePriceHistory(curveData.priceHistory, curveData.solPrice);
  const chartData = simulatedHistory.length > 0 ? simulatedHistory : curveData.priceHistory;

  console.log('📈 Chart data points:', chartData.length);
  console.log('📊 First point:', chartData[0]);
  console.log('📊 Last point:', chartData[chartData.length - 1]);

  // پیدا کردن ATH واقعی از داده‌های شبیه‌سازی شده
  const findRealATH = (data: any[]) => {
    if (data.length === 0) return { price: 0, marketCap: 0, timestamp: 0 };
    
    let maxPrice = 0;
    let maxMarketCap = 0;
    let athTimestamp = data[0].x;
    
    data.forEach(point => {
      if (point.y > maxPrice) {
        maxPrice = point.y;
        maxMarketCap = point.marketCapUSD;
        athTimestamp = point.x;
      }
    });
    
    return { price: maxPrice, marketCap: maxMarketCap, timestamp: athTimestamp };
  };

  const realATH = findRealATH(chartData);
  const effectiveATHSOL = realATH.price > 0 ? realATH.price : displayATHSOL;
  const effectiveATHMarketCapUSD = realATH.marketCap > 0 ? realATH.marketCap : displayATHMarketCapUSD;
  const effectiveATHTimestamp = realATH.timestamp > 0 ? new Date(realATH.timestamp) : displayATHTimestamp;

  // تبدیل string به Date برای استفاده در چارت
  const launchDate = new Date(curveData.launchTimestamp);

  // تنظیمات چارت دو محوره (Dual Y-Axis)
  const dualChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'line',
      height: 450,
      background: '#161b22',
      foreColor: '#8b949e',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      animations: {
        enabled: true,
        speed: 800
      }
    },
    colors: ['#58a6ff', '#3fb950'],
    stroke: {
      width: [3, 3],
      curve: 'smooth'
    },
    title: {
      text: `Price & Market Cap History - ${formatAddress(curveData.curveAddress)}`,
      align: 'left',
      style: {
        color: '#ffffff',
        fontSize: '16px'
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#8b949e'
        }
      }
    },
    yaxis: [
      {
        seriesName: 'Price',
        axisTicks: {
          show: true,
          color: '#58a6ff'
        },
        axisBorder: {
          show: true,
          color: '#58a6ff'
        },
        labels: {
          style: {
            colors: '#58a6ff'
          },
          formatter: (value) => value.toFixed(8)
        },
        title: {
          text: 'Price (SOL)',
          style: {
            color: '#58a6ff',
            fontSize: '12px'
          }
        },
        tooltip: {
          enabled: true
        }
      },
      {
        seriesName: 'Market Cap',
        opposite: true,
        axisTicks: {
          show: true,
          color: '#3fb950'
        },
        axisBorder: {
          show: true,
          color: '#3fb950'
        },
        labels: {
          style: {
            colors: '#3fb950'
          },
          formatter: (value) => `$${value >= 1000000 ? (value/1000000).toFixed(1) + 'M' : value >= 1000 ? (value/1000).toFixed(1) + 'K' : value.toFixed(0)}`
        },
        title: {
          text: 'Market Cap (USD)',
          style: {
            color: '#3fb950',
            fontSize: '12px'
          }
        }
      }
    ],
    grid: {
      borderColor: '#30363d',
      strokeDashArray: 4
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: 'dd MMM yyyy HH:mm'
      },
      shared: true,
      intersect: false
    },
    markers: {
      size: 0
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      labels: {
        colors: '#8b949e'
      }
    },
    annotations: {
      points: [{
        x: launchDate.getTime(),
        y: curveData.launchPriceSOL,
        yAxisIndex: 0,
        marker: {
          size: 6,
          fillColor: '#ffd33d',
          strokeColor: '#ffd33d',
          strokeWidth: 2
        },
        label: {
          borderColor: '#ffd33d',
          offsetY: 0,
          style: {
            color: '#fff',
            background: '#ffd33d',
            fontSize: '11px'
          },
          text: `Launch: ${curveData.launchPriceSOL.toFixed(8)} SOL`
        }
      },
      {
        x: effectiveATHTimestamp.getTime(),
        y: effectiveATHSOL,
        yAxisIndex: 0,
        marker: {
          size: 6,
          fillColor: '#ff7b72',
          strokeColor: '#ff7b72',
          strokeWidth: 2
        },
        label: {
          borderColor: '#ff7b72',
          offsetY: 0,
          style: {
            color: '#fff',
            background: '#ff7b72',
            fontSize: '11px'
          },
          text: `ATH: ${effectiveATHSOL.toFixed(8)} SOL`
        }
      }]
    }
  };

  // تنظیمات چارت قیمت تنها
  const priceChartOptions: ApexCharts.ApexOptions = {
    ...dualChartOptions,
    colors: ['#58a6ff'],
    title: {
      text: `Price History (SOL) - ${formatAddress(curveData.curveAddress)}`,
      align: 'left',
      style: {
        color: '#ffffff',
        fontSize: '16px'
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#8b949e'
        },
        formatter: (value) => value.toFixed(8)
      },
      title: {
        text: 'Price (SOL)',
        style: {
          color: '#8b949e'
        }
      }
    },
    annotations: {
      points: [{
        x: launchDate.getTime(),
        y: curveData.launchPriceSOL,
        marker: {
          size: 6,
          fillColor: '#ffd33d',
          strokeColor: '#ffd33d',
          strokeWidth: 2
        },
        label: {
          borderColor: '#ffd33d',
          offsetY: 0,
          style: {
            color: '#fff',
            background: '#ffd33d',
            fontSize: '12px'
          },
          text: `Launch: ${curveData.launchPriceSOL.toFixed(8)} SOL`
        }
      },
      {
        x: effectiveATHTimestamp.getTime(),
        y: effectiveATHSOL,
        marker: {
          size: 6,
          fillColor: '#ff7b72',
          strokeColor: '#ff7b72',
          strokeWidth: 2
        },
        label: {
          borderColor: '#ff7b72',
          offsetY: 0,
          style: {
            color: '#fff',
            background: '#ff7b72',
            fontSize: '12px'
          },
          text: `ATH: ${effectiveATHSOL.toFixed(8)} SOL`
        }
      }]
    }
  };

  // تنظیمات چارت مارکت کپ تنها
  const marketCapChartOptions: ApexCharts.ApexOptions = {
    ...dualChartOptions,
    colors: ['#3fb950'],
    title: {
      text: `Market Cap History (USD) - ${formatAddress(curveData.curveAddress)}`,
      align: 'left',
      style: {
        color: '#ffffff',
        fontSize: '16px'
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#8b949e'
        },
        formatter: (value) => `$${value.toLocaleString()}`
      },
      title: {
        text: 'Market Cap (USD)',
        style: {
          color: '#8b949e'
        }
      }
    },
    annotations: {
      points: [{
        x: launchDate.getTime(),
        y: curveData.launchMarketCapUSD,
        marker: {
          size: 6,
          fillColor: '#ffd33d',
          strokeColor: '#ffd33d',
          strokeWidth: 2
        },
        label: {
          borderColor: '#ffd33d',
          offsetY: 0,
          style: {
            color: '#fff',
            background: '#ffd33d',
            fontSize: '12px'
          },
          text: `Launch: $${curveData.launchMarketCapUSD.toLocaleString()}`
        }
      },
      {
        x: effectiveATHTimestamp.getTime(),
        y: effectiveATHMarketCapUSD,
        marker: {
          size: 6,
          fillColor: '#ff7b72',
          strokeColor: '#ff7b72',
          strokeWidth: 2
        },
        label: {
          borderColor: '#ff7b72',
          offsetY: 0,
          style: {
            color: '#fff',
            background: '#ff7b72',
            fontSize: '12px'
          },
          text: `ATH: $${effectiveATHMarketCapUSD.toLocaleString()}`
        }
      }]
    }
  };

  // داده‌های چارت دو محوره
  const dualChartSeries = [
    {
      name: 'Price (SOL)',
      type: 'line',
      data: chartData.map(point => ({
        x: point.x,
        y: point.y
      }))
    },
    {
      name: 'Market Cap (USD)',
      type: 'line',
      data: chartData.map(point => ({
        x: point.x,
        y: point.marketCapUSD
      }))
    }
  ];

  // داده‌های چارت قیمت تنها
  const priceChartSeries = [{
    name: 'Price (SOL)',
    data: chartData.map(point => ({
      x: point.x,
      y: point.y
    }))
  }];

  // داده‌های چارت مارکت کپ تنها
  const marketCapChartSeries = [{
    name: 'Market Cap (USD)',
    data: chartData.map(point => ({
      x: point.x,
      y: point.marketCapUSD
    }))
  }];

  // انتخاب options و series بر اساس chartType
  const getChartOptions = () => {
    switch (chartType) {
      case 'dual': return dualChartOptions;
      case 'price': return priceChartOptions;
      case 'marketcap': return marketCapChartOptions;
      default: return dualChartOptions;
    }
  };

  const getChartSeries = () => {
    switch (chartType) {
      case 'dual': return dualChartSeries;
      case 'price': return priceChartSeries;
      case 'marketcap': return marketCapChartSeries;
      default: return dualChartSeries;
    }
  };

  const getLegendText = () => {
    switch (chartType) {
      case 'dual':
        return (
          <>
            <span style={{ color: '#58a6ff' }}>●</span> Price (SOL) • 
            <span style={{ color: '#3fb950' }}> ●</span> Market Cap (USD) • 
          </>
        );
      case 'price':
        return (
          <>
            <span style={{ color: '#58a6ff' }}>●</span> Price (SOL) •
          </>
        );
      case 'marketcap':
        return (
          <>
            <span style={{ color: '#3fb950' }}>●</span> Market Cap (USD) •
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      background: '#161b22',
      padding: '20px',
      borderRadius: '10px',
      border: '1px solid #30363d',
      marginBottom: '30px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h3 style={{ margin: 0 }}>📊 Bonding Curve Analytics (Simulated History)</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onChartTypeChange('dual')}
            style={{
              padding: '8px 12px',
              background: chartType === 'dual' ? '#238636' : '#30363d',
              color: 'white',
              border: '1px solid #30363d',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📊 Both
          </button>
          <button
            onClick={() => onChartTypeChange('price')}
            style={{
              padding: '8px 12px',
              background: chartType === 'price' ? '#238636' : '#30363d',
              color: 'white',
              border: '1px solid #30363d',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            💰 Price
          </button>
          <button
            onClick={() => onChartTypeChange('marketcap')}
            style={{
              padding: '8px 12px',
              background: chartType === 'marketcap' ? '#238636' : '#30363d',
              color: 'white',
              border: '1px solid #30363d',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📈 Market Cap
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '15px', color: '#8b949e', fontSize: '14px' }}>
        {getLegendText()}
        <span style={{ color: '#ffd33d' }}> ●</span> Launch • 
        <span style={{ color: '#ff7b72' }}> ●</span> ATH (Simulated)
        <div style={{ fontSize: '12px', marginTop: '5px' }}>
          Data Points: {chartData.length} | ATH: {effectiveATHSOL.toFixed(8)} SOL
        </div>
      </div>

      <Chart
        options={getChartOptions()}
        series={getChartSeries()}
        type="line"
        height={450}
      />
    </div>
  );
};

export default BondingCurveChart;