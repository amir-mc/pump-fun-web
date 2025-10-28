// CryptoChart.tsx
import React, { useEffect, useState, useRef } from 'react';
import BondingCurveChart from './BondingCurveChart';

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

interface TopATHData {
  curveAddress: string;
  athSOL: number;
  athUSD: number;
  athTimestamp: string;
  athMarketCapUSD: number;
  athMarketCapSOL: number;
  currentPriceSOL: number;
  currentPriceUSD: number;
  currentMarketCapSOL: number;
  currentMarketCapUSD: number;
  percentageFromATH: number;
  lastUpdated: string;
}

const CryptoChart: React.FC = () => {
  const [curveData, setCurveData] = useState<CurveData | null>(null);
  const [allCurves, setAllCurves] = useState<CurveData[]>([]);
  const [topATH, setTopATH] = useState<TopATHData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'all' | 'ath'>('all');
  const [chartType, setChartType] = useState<'dual' | 'price' | 'marketcap'>('dual');
  const [availableCurves, setAvailableCurves] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socketUrl = 'ws://localhost:8080';
    ws.current = new WebSocket(socketUrl);

    ws.current.onopen = () => {
      console.log('✅ Connected to WebSocket server');
      setIsConnected(true);
      
      // درخواست اولیه برای همه curves
      if (ws.current) {
        ws.current.send(JSON.stringify({
          type: 'GET_ALL_CURVES'
        }));
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        console.log('📨 Received WebSocket message:', data.type);
        
        if (data.type === 'CONNECTION_STATUS') {
          console.log('🔗 Connection status:', data);
        } else if (data.type === 'CURVE_DATA') {
          console.log('📊 Setting curve data:', data.data.curveAddress);
          setCurveData(data.data);
          setActiveTab('single');
        } else if (data.type === 'ALL_CURVES_DATA') {
          console.log('🌟 Setting all curves data:', data.data.length);
          setAllCurves(data.data);
        } else if (data.type === 'TOP_ATH_DATA') {
          console.log('🏆 Setting top ATH data:', data.data.length);
          setTopATH(data.data);
        } else if (data.type === 'AVAILABLE_CURVES') {
          console.log('📋 Setting available curves:', data.data.length);
          setAvailableCurves(data.data);
        } else if (data.type === 'ERROR') {
          console.error('❌ WebSocket error:', data.message);
          if (data.availableCurves) {
            setAvailableCurves(data.availableCurves);
          }
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

  const loadSingleCurve = (curveAddress: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      setActiveTab('single');
      ws.current.send(JSON.stringify({
        type: 'GET_CURVE_DATA',
        curveAddress
      }));
    }
  };

  const loadAvailableCurves = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'GET_AVAILABLE_CURVES'
      }));
    }
  };

  if (activeTab === 'single' && !curveData) {
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
        <button 
          onClick={loadAllCurves}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#238636',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Browse All Curves
        </button>
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
        📊 Advanced Bonding Curve Analytics (Corrected ATH Formula)
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
          🏆 Top ATH (Corrected)
        </button>
        <button 
          onClick={loadAvailableCurves}
          style={{
            padding: '10px 20px',
            background: '#161b22',
            color: 'white',
            border: '1px solid #30363d',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* محتوای تب‌ها */}
      {activeTab === 'single' && curveData && (
        <SingleCurveView 
          curveData={curveData} 
          chartType={chartType}
          onChartTypeChange={setChartType}
        />
      )}

      {activeTab === 'all' && (
        <AllCurvesView 
          curves={allCurves} 
          onCurveClick={loadSingleCurve} 
        />
      )}

      {activeTab === 'ath' && (
        <TopATHView 
          curves={topATH} 
          onCurveClick={loadSingleCurve} 
        />
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

      {/* اطلاعات پایین صفحه */}
      <div style={{
        marginTop: '30px',
        padding: '15px',
        background: '#161b22',
        borderRadius: '10px',
        border: '1px solid #30363d',
        fontSize: '12px',
        color: '#8b949e',
        textAlign: 'center'
      }}>
        <div>📊 <strong>Corrected ATH Formula:</strong> Using transaction-by-transaction virtual reserves simulation</div>
        <div>🔢 <strong>Total Curves:</strong> {availableCurves.length} available | {allCurves.length} loaded</div>
        <div>🔄 <strong>Last Update:</strong> {new Date().toLocaleString()}</div>
      </div>
    </div>
  );
};

// کامپوننت برای نمایش single curve
interface SingleCurveViewProps {
  curveData: CurveData;
  chartType: 'dual' | 'price' | 'marketcap';
  onChartTypeChange: (type: 'dual' | 'price' | 'marketcap') => void;
}

const SingleCurveView: React.FC<SingleCurveViewProps> = ({ 
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

  // تبدیل string به Date برای استفاده در چارت
  const launchDate = new Date(curveData.launchTimestamp);
  const lastUpdatedDate = new Date(curveData.lastUpdated);

  // محاسبه درصد تغییر از لانچ
  const percentageFromLaunch = curveData.launchPriceSOL > 0 
    ? ((curveData.currentPriceSOL - curveData.launchPriceSOL) / curveData.launchPriceSOL) * 100 
    : 0;

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
            {curveData.currentPriceSOL.toFixed(8)} SOL
          </p>
          <p style={{ fontSize: '18px', color: '#8b949e' }}>
            ${curveData.currentPriceUSD.toFixed(6)} USD
          </p>
        </div>

        {/* کارت قیمت لانچ */}
        <div style={{
          background: '#161b22',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #30363d'
        }}>
          <h3>🚀 Launch Price</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd33d' }}>
            {curveData.launchPriceSOL.toFixed(8)} SOL
          </p>
          <p style={{ fontSize: '18px', color: '#8b949e' }}>
            ${curveData.launchPriceUSD.toLocaleString()} USD
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: percentageFromLaunch >= 0 ? '#3fb950' : '#ff7b72'
          }}>
            {percentageFromLaunch >= 0 ? '📈' : '📉'} {percentageFromLaunch.toFixed(2)}% from launch
          </p>
          <p style={{ fontSize: '12px', color: '#8b949e' }}>
            Date: {launchDate.toLocaleDateString()}
          </p>
        </div>

        {/* کارت ATH - با داده‌های اصلاح شده از سرور */}
        <div style={{
          background: '#161b22',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #30363d'
        }}>
          <h3>🏆 All Time High (Corrected)</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff7b72' }}>
            {displayATHSOL.toFixed(8)} SOL
          </p>
          <p style={{ fontSize: '18px', color: '#8b949e' }}>
            ${displayATHUSD.toLocaleString()} USD
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: curveData.percentageFromATH >= 0 ? '#3fb950' : '#ff7b72'
          }}>
            {curveData.percentageFromATH >= 0 ? '📈' : '📉'} {curveData.percentageFromATH.toFixed(2)}% from ATH
          </p>
          <p style={{ fontSize: '12px', color: '#8b949e' }}>
            Date: {displayATHTimestamp.toLocaleDateString()}
          </p>
          <p style={{ fontSize: '10px', color: '#8b949e', fontStyle: 'italic' }}>
            ATH Market Cap: ${displayATHMarketCapUSD.toLocaleString()}
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
      <BondingCurveChart
        curveData={curveData}
        chartType={chartType}
        onChartTypeChange={onChartTypeChange}
      />

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
            <strong>Launch Date:</strong>
            <p>{launchDate.toLocaleString()}</p>
          </div>
          <div>
            <strong>Last Updated:</strong>
            <p>{lastUpdatedDate.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

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
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => onCurveClick(curve.curveAddress)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1c2128';
                e.currentTarget.style.borderColor = '#58a6ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#161b22';
                e.currentTarget.style.borderColor = '#30363d';
              }}
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
                    ATH: ${curve.athUSD.toLocaleString()} USD
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b949e' }}>
                    ATH: {curve.athSOL.toFixed(8)} SOL
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
  curves: TopATHData[]; 
  onCurveClick: (address: string) => void;
}> = ({ curves, onCurveClick }) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        🏆 Top ATH Curves - Corrected Formula ({curves.length})
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
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => onCurveClick(curve.curveAddress)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1c2128';
                e.currentTarget.style.borderColor = '#ff7b72';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#161b22';
                e.currentTarget.style.borderColor = '#30363d';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>#{index + 1}. {formatAddress(curve.curveAddress)}</strong>
                  <div style={{ fontSize: '14px', color: '#8b949e' }}>
                    ATH Price: {curve.athSOL.toFixed(8)} SOL (${curve.athUSD.toLocaleString()} USD)
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b949e' }}>
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
                  <div style={{ fontSize: '12px', color: '#8b949e' }}>
                    Current: {curve.currentPriceSOL.toFixed(8)} SOL
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