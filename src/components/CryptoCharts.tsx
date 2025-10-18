import React, { useEffect, useState, useRef } from 'react';
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
  lastUpdated: Date;
  
  // قیمت و مارکت کپ
  currentPriceSOL: number;
  currentPriceUSD: number;
  currentMarketCapSOL: number;
  currentMarketCapUSD: number;
  
  // ATH
  athSOL: number;
  athUSD: number;
  athTimestamp: Date;
  percentageFromATH: number;
  
  // متا داده
  solPrice: number;
  timestamp: string;
}

interface PriceHistory {
  timestamp: Date;
  priceSOL: number;
  priceUSD: number;
  marketCapUSD: number;
}

const CryptoChart: React.FC = () => {
  const [curveData, setCurveData] = useState<CurveData | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [allCurves, setAllCurves] = useState<CurveData[]>([]);
  const [topATH, setTopATH] = useState<CurveData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'all' | 'ath'>('single');
  const [chartType, setChartType] = useState<'price' | 'marketcap'>('price');
  const ws = useRef<WebSocket | null>(null);

  const defaultCurveAddress = "pztfcvhCdyKwe9amAvd32fdo1E9gKMPw39m6yjaFYno";

  useEffect(() => {
    const socketUrl = 'ws://localhost:8080';
    ws.current = new WebSocket(socketUrl);

    ws.current.onopen = () => {
      console.log('✅ Connected to WebSocket server');
      setIsConnected(true);
      
      // درخواست اولیه برای داده single curve
      if (ws.current) {
        ws.current.send(JSON.stringify({
          type: 'GET_CURVE_DATA',
          curveAddress: defaultCurveAddress
        }));
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        console.log('📨 Received WebSocket message:', data.type);
        
        if (data.type === 'CURVE_DATA') {
          console.log('📊 Setting curve data:', data.data);
          setCurveData(data.data);
          
          // شبیه‌سازی تاریخچه قیمت (در حالت واقعی از سرور دریافت می‌شود)
          simulatePriceHistory(data.data);
        } else if (data.type === 'ALL_CURVES_DATA') {
          console.log('🌟 Setting all curves data:', data.data.length);
          setAllCurves(data.data);
        } else if (data.type === 'TOP_ATH_DATA') {
          console.log('🏆 Setting top ATH data:', data.data.length);
          setTopATH(data.data);
        } else if (data.type === 'ERROR') {
          console.error('❌ WebSocket error:', data.message);
        }
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('❌ Disconnected from WebSocket server');
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // شبیه‌سازی تاریخچه قیمت (در حالت واقعی از سرور دریافت می‌شود)
  const simulatePriceHistory = (curveData: CurveData) => {
    const history: PriceHistory[] = [];
    const now = new Date();
    
    // ایجاد داده‌های تاریخی مصنوعی
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // نوسان قیمت تصادفی حول قیمت فعلی
      const randomFactor = 0.8 + Math.random() * 0.4;
      const priceSOL = curveData.currentPriceSOL * randomFactor;
      const priceUSD = priceSOL * curveData.solPrice;
      const marketCapUSD = curveData.currentMarketCapUSD * randomFactor;
      
      history.push({
        timestamp: date,
        priceSOL,
        priceUSD,
        marketCapUSD
      });
    }
    
    setPriceHistory(history);
  };

  const loadAllCurves = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      setActiveTab('all');
      ws.current.send(JSON.stringify({
        type: 'GET_ALL_CURVES'
      }));
    }
  };

  const loadTopATH = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      setActiveTab('ath');
      ws.current.send(JSON.stringify({
        type: 'GET_TOP_ATH',
        limit: 10
      }));
    }
  };

  const loadSingleCurve = (curveAddress: string = defaultCurveAddress) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      setActiveTab('single');
      ws.current.send(JSON.stringify({
        type: 'GET_CURVE_DATA',
        curveAddress
      }));
    }
  };

  // تنظیمات چارت قیمت
  const priceChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
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
      }
    },
    colors: ['#58a6ff'],
    stroke: {
      width: 3,
      curve: 'smooth'
    },
    title: {
      text: 'Price History (SOL)',
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
    grid: {
      borderColor: '#30363d',
      strokeDashArray: 4
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: 'dd MMM yyyy HH:mm'
      }
    },
    markers: {
      size: 0
    }
  };

  // تنظیمات چارت مارکت کپ
  const marketCapChartOptions: ApexCharts.ApexOptions = {
    ...priceChartOptions,
    colors: ['#3fb950'],
    title: {
      text: 'Market Cap History (USD)',
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
    }
  };

  // داده‌های چارت قیمت
  const priceChartSeries = [{
    name: 'Price (SOL)',
    data: priceHistory.map(point => ({
      x: point.timestamp.getTime(),
      y: point.priceSOL
    }))
  }];

  // داده‌های چارت مارکت کپ
  const marketCapChartSeries = [{
    name: 'Market Cap (USD)',
    data: priceHistory.map(point => ({
      x: point.timestamp.getTime(),
      y: point.marketCapUSD
    }))
  }];

  if (!curveData && activeTab === 'single') {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        background: '#0d1117',
        minHeight: '100vh',
        color: 'white'
      }}>
        <div>🔄 Loading bonding curve data...</div>
        <div>Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      background: '#0d1117',
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        📊 Advanced Bonding Curve Analytics
      </h1>

      {/* تب‌ها */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => loadSingleCurve()}
          style={{
            padding: '10px 20px',
            background: activeTab === 'single' ? '#238636' : '#161b22',
            color: 'white',
            border: '1px solid #30363d',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          📈 Single Curve
        </button>
        <button 
          onClick={loadAllCurves}
          style={{
            padding: '10px 20px',
            background: activeTab === 'all' ? '#238636' : '#161b22',
            color: 'white',
            border: '1px solid #30363d',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🌟 All Curves
        </button>
        <button 
          onClick={loadTopATH}
          style={{
            padding: '10px 20px',
            background: activeTab === 'ath' ? '#238636' : '#161b22',
            color: 'white',
            border: '1px solid #30363d',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🏆 Top ATH
        </button>
      </div>

      {/* محتوای تب‌ها */}
      {activeTab === 'single' && curveData && (
        <SingleCurveView 
          curveData={curveData} 
          priceChartOptions={priceChartOptions}
          marketCapChartOptions={marketCapChartOptions}
          priceChartSeries={priceChartSeries}
          marketCapChartSeries={marketCapChartSeries}
          chartType={chartType}
          setChartType={setChartType}
        />
      )}

      {activeTab === 'all' && (
        <AllCurvesView curves={allCurves} onCurveClick={loadSingleCurve} />
      )}

      {activeTab === 'ath' && (
        <TopATHView curves={topATH} onCurveClick={loadSingleCurve} />
      )}

      {/* وضعیت اتصال */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        padding: '10px',
        background: isConnected ? '#238636' : '#da3633',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        {isConnected ? '✅ Connected' : '❌ Disconnected'}
        <br />
        <small>SOL: ${curveData?.solPrice || 172}</small>
      </div>
    </div>
  );
};

// کامپوننت برای نمایش single curve با چارت
interface SingleCurveViewProps {
  curveData: CurveData;
  priceChartOptions: ApexCharts.ApexOptions;
  marketCapChartOptions: ApexCharts.ApexOptions;
  priceChartSeries: ApexCharts.ApexOptions['series'];
  marketCapChartSeries: ApexCharts.ApexOptions['series'];
  chartType: 'price' | 'marketcap';
  setChartType: (type: 'price' | 'marketcap') => void;
}

const SingleCurveView: React.FC<SingleCurveViewProps> = ({ 
  curveData, 
  priceChartOptions, 
  marketCapChartOptions, 
  priceChartSeries, 
  marketCapChartSeries,
  chartType,
  setChartType
}) => {
  const formatAddress = (address: string | null) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        📊 {formatAddress(curveData.curveAddress)}
      </h2>
      
      {/* کارت‌های خلاصه */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* کارت قیمت فعلی */}
        <div style={{
          background: '#161b22',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #30363d'
        }}>
          <h3>💰 Current Price</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#58a6ff' }}>
            {curveData.currentPriceSOL.toFixed(10)} SOL
          </p>
          <p style={{ fontSize: '18px', color: '#8b949e' }}>
            ${curveData.currentPriceUSD.toFixed(6)} USD
          </p>
        </div>

        {/* کارت ATH */}
        <div style={{
          background: '#161b22',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #30363d'
        }}>
          <h3>🚀 All Time High</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff7b72' }}>
            {curveData.athSOL.toFixed(6)} SOL
          </p>
          <p style={{ fontSize: '18px', color: '#8b949e' }}>
            ${curveData.athUSD.toLocaleString()} USD
          </p>
          <p style={{ fontSize: '14px', color: '#8b949e' }}>
            Date: {new Date(curveData.athTimestamp).toLocaleDateString()}
          </p>
        </div>

        {/* کارت مارکت کپ */}
        <div style={{
          background: '#161b22',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #30363d'
        }}>
          <h3>📈 Market Cap</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3fb950' }}>
            ${curveData.currentMarketCapUSD.toLocaleString()}
          </p>
          <p style={{ fontSize: '18px', color: '#8b949e' }}>
            {curveData.currentMarketCapSOL.toFixed(6)} SOL
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: curveData.percentageFromATH >= 0 ? '#3fb950' : '#ff7b72'
          }}>
            From ATH: {curveData.percentageFromATH.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* چارت */}
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
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: 0 }}>📊 Price & Market Cap Chart</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setChartType('price')}
              style={{
                padding: '8px 16px',
                background: chartType === 'price' ? '#238636' : '#30363d',
                color: 'white',
                border: '1px solid #30363d',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Price
            </button>
            <button
              onClick={() => setChartType('marketcap')}
              style={{
                padding: '8px 16px',
                background: chartType === 'marketcap' ? '#238636' : '#30363d',
                color: 'white',
                border: '1px solid #30363d',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Market Cap
            </button>
          </div>
        </div>

        {chartType === 'price' ? (
          <Chart
            options={priceChartOptions}
            series={priceChartSeries}
            type="line"
            height={350}
          />
        ) : (
          <Chart
            options={marketCapChartOptions}
            series={marketCapChartSeries}
            type="line"
            height={350}
          />
        )}
      </div>

      {/* اطلاعات جزئی */}
      <div style={{
        background: '#161b22',
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid #30363d'
      }}>
        <h3>🔍 Detailed Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <strong>Total Supply:</strong>
            <p>{curveData.totalSupply.toLocaleString()} tokens</p>
          </div>
          <div>
            <strong>Virtual Tokens:</strong>
            <p>{curveData.virtualTokens.toLocaleString()}</p>
          </div>
          <div>
            <strong>Virtual SOL:</strong>
            <p>{curveData.virtualSol.toFixed(6)} SOL</p>
          </div>
          <div>
            <strong>Real Tokens:</strong>
            <p>{curveData.realTokens.toLocaleString()}</p>
          </div>
          <div>
            <strong>Real SOL:</strong>
            <p>{curveData.realSol.toFixed(6)} SOL</p>
          </div>
          <div>
            <strong>Complete:</strong>
            <p>{curveData.complete ? '✅ Yes' : '❌ No'}</p>
          </div>
          <div>
            <strong>Creator:</strong>
            <p>{formatAddress(curveData.creator)}</p>
          </div>
          <div>
            <strong>Last Updated:</strong>
            <p>{new Date(curveData.lastUpdated).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// کامپوننت‌های AllCurvesView و TopATHView مانند قبل باقی می‌مانند...
// (کدهای قبلی را اینجا قرار دهید)

// کامپوننت برای نمایش همه curves
const AllCurvesView: React.FC<{ 
  curves: CurveData[]; 
  onCurveClick: (address: string) => void;
}> = ({ curves, onCurveClick }) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        🌟 All Curves ({curves.length})
      </h2>
      
      {curves.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#8b949e' }}>
          🔄 Loading curves data...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '15px'
        }}>
          {curves.map((curve, index) => (
            <div 
              key={curve.curveAddress}
              style={{
                background: '#161b22',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid #30363d',
                cursor: 'pointer'
              }}
              onClick={() => onCurveClick(curve.curveAddress)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>#{index + 1}. {formatAddress(curve.curveAddress)}</strong>
                  <div style={{ fontSize: '14px', color: '#8b949e' }}>
                    Market Cap: ${curve.currentMarketCapUSD.toLocaleString()} | 
                    Price: {curve.currentPriceSOL.toFixed(8)} SOL
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    color: curve.percentageFromATH >= 0 ? '#3fb950' : '#ff7b72',
                    fontWeight: 'bold'
                  }}>
                    {curve.percentageFromATH.toFixed(2)}% from ATH
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b949e' }}>
                    ATH: ${curve.athUSD.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// کامپوننت برای نمایش top ATH
const TopATHView: React.FC<{ 
  curves: CurveData[]; 
  onCurveClick: (address: string) => void;
}> = ({ curves, onCurveClick }) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        🏆 Top ATH Curves ({curves.length})
      </h2>
      
      {curves.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#8b949e' }}>
          🔄 Loading ATH data...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '15px'
        }}>
          {curves.map((curve, index) => (
            <div 
              key={curve.curveAddress}
              style={{
                background: '#161b22',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid #30363d',
                cursor: 'pointer'
              }}
              onClick={() => onCurveClick(curve.curveAddress)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>#{index + 1}. {formatAddress(curve.curveAddress)}</strong>
                  <div style={{ fontSize: '14px', color: '#8b949e' }}>
                    ATH: ${curve.athUSD.toLocaleString()} | 
                    Date: {new Date(curve.athTimestamp).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: '#58a6ff' }}>
                    ${curve.currentMarketCapUSD.toLocaleString()}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: curve.percentageFromATH >= 0 ? '#3fb950' : '#ff7b72'
                  }}>
                    {curve.percentageFromATH.toFixed(2)}% from ATH
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CryptoChart;