// CryptoChart.tsx
import React, { useEffect, useState, useRef } from 'react';
import BondingCurveChart from './BondingCurveChart';
import ComprehensiveAnalysisView from './ComprehensiveAnalysisView';

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
  tokenName: string;
  tokenSymbol: string;
  initialPriceSOL?: number;
  initialPriceUSD?: number;
  initialTimestamp?: string;
  percentageFromInitial?: number;
  timeToATH?: string;
  timeToATHMinutes?: number;
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
  tokenName: string;
  tokenSymbol: string;
  percentageFromInitial?: number;
  timeToATH?: string;
}

interface ComprehensiveAnalysis {
  totalTokens: number;
  analysisPeriod: string;
  averageGainToCurrent: number;
  medianGainToCurrent: number;
  performers: {
    gainersFromInitial: number;
    losersFromInitial: number;
    neutralFromInitial: number;
  };
  performanceCategories: {
    megaGainers: number;
    highGainers: number;
    moderateGainers: number;
    slightGainers: number;
    neutral: number;
    slightLosers: number;
    moderateLosers: number;
    bigLosers: number;
    totalLosers: number;
  };
  averageTimeToATH: number;
  fastestTimeToATH: number;
  slowestTimeToATH: number;
  topPerformers: any[];
  worstPerformers: any[];
  fastestRisers: any[];
  totalInitialMarketCap: number;
  totalATHMarketCap: number;
  totalCurrentMarketCap: number;
  totalValueChange: number;
  rawData: any[];
}

// تابع کمکی برای بررسی و فرمت اعداد
const safeNumber = (num: number | undefined | null, defaultValue: number = 0): number => {
  if (num === undefined || num === null || isNaN(num)) return defaultValue;
  return num;
};

const safeString = (str: string | undefined | null, defaultValue: string = 'N/A'): string => {
  if (!str) return defaultValue;
  return str;
};

const formatNumber = (num: number | undefined | null, decimals: number = 2): string => {
  const safeNum = safeNumber(num);
  return safeNum.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

const formatPercentage = (num: number | undefined | null): string => {
  const safeNum = safeNumber(num);
  return `${safeNum >= 0 ? '🟢' : '🔴'} ${safeNum.toFixed(2)}%`;
};

const CryptoChart: React.FC = () => {
  const [curveData, setCurveData] = useState<CurveData | null>(null);
  const [allCurves, setAllCurves] = useState<CurveData[]>([]);
  const [topATH, setTopATH] = useState<TopATHData[]>([]);
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState<ComprehensiveAnalysis | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'all' | 'ath' | 'analysis'>('all');
  const [chartType, setChartType] = useState<'dual' | 'price' | 'marketcap'>('dual');
  const [availableCurves, setAvailableCurves] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socketUrl = 'ws://localhost:8080';
    ws.current = new WebSocket(socketUrl);

    ws.current.onopen = () => {
      console.log('✅ Connected to WebSocket server');
      setIsConnected(true);
      
      // درخواست اولیه برای همه curves
      if (ws.current) {
        setIsLoading(true);
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
          setIsLoading(false);
        } else if (data.type === 'ALL_CURVES_DATA') {
          console.log('🌟 Setting all curves data:', data.data.length);
          setAllCurves(data.data);
          setIsLoading(false);
        } else if (data.type === 'TOP_ATH_DATA') {
          console.log('🏆 Setting top ATH data:', data.data.length);
          setTopATH(data.data);
          setIsLoading(false);
        } else if (data.type === 'COMPREHENSIVE_ANALYSIS') {
          console.log('📈 Setting comprehensive analysis data');
          setComprehensiveAnalysis(data.data);
          setIsLoading(false);
        } else if (data.type === 'AVAILABLE_CURVES') {
          console.log('📋 Setting available curves:', data.data.length);
          setAvailableCurves(data.data);
        } else if (data.type === 'ERROR') {
          console.error('❌ WebSocket error:', data.message);
          if (data.availableCurves) {
            setAvailableCurves(data.availableCurves);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
        setIsLoading(false);
      }
    };

    ws.current.onclose = () => {
      console.log('❌ Disconnected from WebSocket server');
      setIsConnected(false);
      setIsLoading(false);
    };

    ws.current.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setIsConnected(false);
      setIsLoading(false);
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
      setIsLoading(true);
      ws.current.send(JSON.stringify({
        type: 'GET_ALL_CURVES'
      }));
    }
  };

  const loadTopATH = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      setActiveTab('ath');
      setIsLoading(true);
      ws.current.send(JSON.stringify({
        type: 'GET_TOP_ATH',
        limit: 10
      }));
    }
  };

  const loadComprehensiveAnalysis = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      setActiveTab('analysis');
      setIsLoading(true);
      ws.current.send(JSON.stringify({
        type: 'GET_COMPREHENSIVE_ANALYSIS'
      }));
    }
  };

  const loadSingleCurve = (curveAddress: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      setActiveTab('single');
      setIsLoading(true);
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

  const formatAddress = (address: string | null) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  if (isLoading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        background: '#0d1117',
        minHeight: '100vh',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '20px' }}>🔄 Loading...</div>
        <div style={{ fontSize: '16px', color: '#8b949e' }}>
          {activeTab === 'single' && 'Loading curve data...'}
          {activeTab === 'all' && 'Loading all curves...'}
          {activeTab === 'ath' && 'Loading top ATH data...'}
          {activeTab === 'analysis' && 'Generating comprehensive analysis...'}
        </div>
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#58a6ff' }}>
          Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}
        </div>
      </div>
    );
  }

  if (activeTab === 'single' && !curveData) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        background: '#0d1117',
        minHeight: '100vh',
        color: 'white'
      }}>
        <div>📊 No curve data selected</div>
        <div style={{ marginTop: '10px', color: '#8b949e' }}>Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</div>
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
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#58a6ff' }}>
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
          onClick={loadAllCurves}
          style={{
            padding: '12px 24px',
            background: activeTab === 'all' ? '#238636' : '#161b22',
            color: 'white',
            border: '1px solid #30363d',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'all') {
              e.currentTarget.style.background = '#1c2128';
              e.currentTarget.style.borderColor = '#58a6ff';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'all') {
              e.currentTarget.style.background = '#161b22';
              e.currentTarget.style.borderColor = '#30363d';
            }
          }}
        >
          🌟 All Curves
        </button>
        <button 
          onClick={loadTopATH}
          style={{
            padding: '12px 24px',
            background: activeTab === 'ath' ? '#238636' : '#161b22',
            color: 'white',
            border: '1px solid #30363d',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'ath') {
              e.currentTarget.style.background = '#1c2128';
              e.currentTarget.style.borderColor = '#ff7b72';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'ath') {
              e.currentTarget.style.background = '#161b22';
              e.currentTarget.style.borderColor = '#30363d';
            }
          }}
        >
          🏆 Top ATH
        </button>
        <button 
          onClick={loadComprehensiveAnalysis}
          style={{
            padding: '12px 24px',
            background: activeTab === 'analysis' ? '#238636' : '#161b22',
            color: 'white',
            border: '1px solid #30363d',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'analysis') {
              e.currentTarget.style.background = '#1c2128';
              e.currentTarget.style.borderColor = '#ffd33d';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'analysis') {
              e.currentTarget.style.background = '#161b22';
              e.currentTarget.style.borderColor = '#30363d';
            }
          }}
        >
          📈 Comprehensive Analysis
        </button>
        <button 
          onClick={loadAvailableCurves}
          style={{
            padding: '12px 16px',
            background: '#161b22',
            color: 'white',
            border: '1px solid #30363d',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1c2128';
            e.currentTarget.style.borderColor = '#58a6ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#161b22';
            e.currentTarget.style.borderColor = '#30363d';
          }}
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* محتوای تب‌ها */}
      {activeTab === 'single' && curveData && (
        <SingleCurveView 
          curveData={curveData} 
          chartType={chartType}
          onChartTypeChange={setChartType}
          onBack={loadAllCurves}
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

      {activeTab === 'analysis' && (
        <ComprehensiveAnalysisView analysis={comprehensiveAnalysis} />
      )}

      {/* وضعیت اتصال */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        padding: '10px 15px',
        background: isConnected ? '#238636' : '#da3633',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 1000,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}>
        <div style={{ fontWeight: 'bold' }}>
          {isConnected ? '✅ Connected' : '❌ Disconnected'}
        </div>
        <div style={{ fontSize: '10px', opacity: 0.9 }}>
          SOL: ${safeNumber(curveData?.solPrice, 172)}
        </div>
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
        <div>📊 <strong>Advanced Analytics:</strong> Real-time bonding curve analysis with corrected ATH calculations</div>
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
  onBack: () => void;
}

const SingleCurveView: React.FC<SingleCurveViewProps> = ({ 
  curveData, 
  chartType,
  onChartTypeChange,
  onBack
}) => {
  const formatAddress = (address: string | null) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  // استفاده از توابع ایمن برای داده‌ها
  const displayATHSOL = safeNumber(curveData.athSOL);
  const displayATHUSD = safeNumber(curveData.athUSD);
  const displayATHMarketCapUSD = safeNumber(curveData.athMarketCapUSD);
  const displayATHTimestamp = curveData.athTimestamp ? new Date(curveData.athTimestamp) : new Date();

  // تبدیل string به Date برای استفاده در چارت
  const launchDate = curveData.launchTimestamp ? new Date(curveData.launchTimestamp) : new Date();
  const lastUpdatedDate = curveData.lastUpdated ? new Date(curveData.lastUpdated) : new Date();

  return (
    <div>
      {/* هدر با دکمه بازگشت */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <button 
          onClick={onBack}
          style={{
            padding: '8px 16px',
            background: '#161b22',
            color: 'white',
            border: '1px solid #30363d',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1c2128';
            e.currentTarget.style.borderColor = '#58a6ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#161b22';
            e.currentTarget.style.borderColor = '#30363d';
          }}
        >
          ← Back to All
        </button>
        <h2 style={{ margin: 0, color: '#58a6ff' }}>
          📊 {safeString(curveData.tokenName, 'Unknown')} ({safeString(curveData.tokenSymbol, 'UNK')})
        </h2>
        <div style={{ fontSize: '12px', color: '#8b949e', marginLeft: 'auto' }}>
          {formatAddress(curveData.curveAddress)}
        </div>
      </div>
      
      {/* کارت‌های خلاصه */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* کارت قیمت فعلی */}
        <div style={{
          background: 'linear-gradient(135deg, #161b22 0%, #1a1f2e 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #30363d',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ color: '#58a6ff', marginBottom: '15px' }}>💰 Current Price</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#58a6ff', margin: '10px 0' }}>
            {formatNumber(curveData.currentPriceSOL, 8)} SOL
          </p>
          <p style={{ fontSize: '18px', color: '#8b949e', margin: '5px 0' }}>
            ${formatNumber(curveData.currentPriceUSD, 6)} USD
          </p>
          <div style={{ 
            fontSize: '14px', 
            color: safeNumber(curveData.percentageFromLaunch) >= 0 ? '#3fb950' : '#ff7b72',
            marginTop: '10px'
          }}>
            {safeNumber(curveData.percentageFromLaunch) >= 0 ? '📈' : '📉'} {formatPercentage(curveData.percentageFromLaunch)}
          </div>
        </div>

        {/* کارت قیمت لانچ */}
        <div style={{
          background: 'linear-gradient(135deg, #161b22 0%, #1a1f2e 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #30363d',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ color: '#ffd33d', marginBottom: '15px' }}>🚀 Launch Price</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd33d', margin: '10px 0' }}>
            {formatNumber(curveData.launchPriceSOL, 8)} SOL
          </p>
          <p style={{ fontSize: '18px', color: '#8b949e', margin: '5px 0' }}>
            ${formatNumber(curveData.launchPriceUSD, 6)} USD
          </p>
          <p style={{ fontSize: '12px', color: '#8b949e', margin: '5px 0' }}>
            Date: {launchDate.toLocaleDateString()}
          </p>
        </div>

        {/* کارت ATH - با داده‌های اصلاح شده از سرور */}
        <div style={{
          background: 'linear-gradient(135deg, #161b22 0%, #1a1f2e 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #30363d',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ color: '#ff7b72', marginBottom: '15px' }}>🏆 All Time High</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff7b72', margin: '10px 0' }}>
            {formatNumber(displayATHSOL, 8)} SOL
          </p>
          <p style={{ fontSize: '18px', color: '#8b949e', margin: '5px 0' }}>
            ${formatNumber(displayATHUSD, 6)} USD
          </p>
          <div style={{ 
            fontSize: '14px', 
            color: safeNumber(curveData.percentageFromATH) >= 0 ? '#3fb950' : '#ff7b72',
            margin: '10px 0'
          }}>
            {safeNumber(curveData.percentageFromATH) >= 0 ? '📈' : '📉'} {formatPercentage(curveData.percentageFromATH)}
          </div>
          <p style={{ fontSize: '12px', color: '#8b949e', margin: '5px 0' }}>
            Date: {displayATHTimestamp.toLocaleDateString()}
          </p>
        </div>

        {/* کارت مارکت کپ */}
        <div style={{
          background: 'linear-gradient(135deg, #161b22 0%, #1a1f2e 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #30363d',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ color: '#3fb950', marginBottom: '15px' }}>📈 Market Cap</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3fb950', margin: '10px 0' }}>
            ${formatNumber(curveData.currentMarketCapUSD, 0)}
          </p>
          <p style={{ fontSize: '18px', color: '#8b949e', margin: '5px 0' }}>
            {formatNumber(curveData.currentMarketCapSOL, 6)} SOL
          </p>
          <div style={{ 
            fontSize: '14px', 
            color: safeNumber(curveData.percentageFromATH) >= 0 ? '#3fb950' : '#ff7b72',
            marginTop: '10px'
          }}>
            From ATH: {formatPercentage(curveData.percentageFromATH)}
          </div>
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
        padding: '25px',
        borderRadius: '12px',
        border: '1px solid #30363d',
        marginTop: '30px'
      }}>
        <h3 style={{ color: '#58a6ff', marginBottom: '20px' }}>🔍 Detailed Information</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '20px' 
        }}>
          <div>
            <strong style={{ color: '#8b949e' }}>Total Supply:</strong>
            <p style={{ color: 'white', margin: '5px 0' }}>
              {safeNumber(curveData.totalSupply).toLocaleString()} tokens
            </p>
          </div>
          <div>
            <strong style={{ color: '#8b949e' }}>Virtual Tokens:</strong>
            <p style={{ color: 'white', margin: '5px 0' }}>
              {safeNumber(curveData.virtualTokens).toLocaleString()}
            </p>
          </div>
          <div>
            <strong style={{ color: '#8b949e' }}>Virtual SOL:</strong>
            <p style={{ color: 'white', margin: '5px 0' }}>
              {formatNumber(curveData.virtualSol, 6)} SOL
            </p>
          </div>
          <div>
            <strong style={{ color: '#8b949e' }}>Real Tokens:</strong>
            <p style={{ color: 'white', margin: '5px 0' }}>
              {safeNumber(curveData.realTokens).toLocaleString()}
            </p>
          </div>
          <div>
            <strong style={{ color: '#8b949e' }}>Real SOL:</strong>
            <p style={{ color: 'white', margin: '5px 0' }}>
              {formatNumber(curveData.realSol, 6)} SOL
            </p>
          </div>
          <div>
            <strong style={{ color: '#8b949e' }}>Complete:</strong>
            <p style={{ color: 'white', margin: '5px 0' }}>
              {curveData.complete ? '✅ Yes' : '❌ No'}
            </p>
          </div>
          <div>
            <strong style={{ color: '#8b949e' }}>Creator:</strong>
            <p style={{ color: 'white', margin: '5px 0' }}>
              {formatAddress(curveData.creator)}
            </p>
          </div>
          <div>
            <strong style={{ color: '#8b949e' }}>Launch Date:</strong>
            <p style={{ color: 'white', margin: '5px 0' }}>
              {launchDate.toLocaleString()}
            </p>
          </div>
          <div>
            <strong style={{ color: '#8b949e' }}>Last Updated:</strong>
            <p style={{ color: 'white', margin: '5px 0' }}>
              {lastUpdatedDate.toLocaleString()}
            </p>
          </div>
          {curveData.initialPriceSOL && (
            <div>
              <strong style={{ color: '#8b949e' }}>Initial Price:</strong>
              <p style={{ color: 'white', margin: '5px 0' }}>
                {formatNumber(curveData.initialPriceSOL, 8)} SOL
              </p>
            </div>
          )}
          {curveData.timeToATH && (
            <div>
              <strong style={{ color: '#8b949e' }}>Time to ATH:</strong>
              <p style={{ color: 'white', margin: '5px 0' }}>
                {safeString(curveData.timeToATH)}
              </p>
            </div>
          )}
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
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#58a6ff' }}>
        🌟 All Curves ({curves.length})
      </h2>
      
      {curves.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          color: '#8b949e', 
          padding: '40px',
          background: '#161b22',
          borderRadius: '12px',
          border: '1px solid #30363d'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>📊 No curves data available</div>
          <div style={{ fontSize: '14px' }}>Try refreshing the data or check the connection</div>
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
                background: 'linear-gradient(135deg, #161b22 0%, #1a1f2e 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #30363d',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onClick={() => onCurveClick(curve.curveAddress)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1c2128';
                e.currentTarget.style.borderColor = '#58a6ff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(88, 166, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #161b22 0%, #1a1f2e 100%)';
                e.currentTarget.style.borderColor = '#30363d';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#58a6ff', marginBottom: '8px' }}>
                    #{index + 1}. {safeString(curve.tokenName, 'Unknown')} ({safeString(curve.tokenSymbol, 'UNK')})
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '5px' }}>
                    {formatAddress(curve.curveAddress)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#8b949e' }}>
                    Market Cap: <strong style={{ color: '#3fb950' }}>${formatNumber(curve.currentMarketCapUSD, 0)}</strong>
                  </div>
                  <div style={{ fontSize: '14px', color: '#8b949e' }}>
                    Price: <strong style={{ color: '#ffd33d' }}>{formatNumber(curve.currentPriceSOL, 8)} SOL</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                  <div style={{ 
                    color: safeNumber(curve.percentageFromATH) >= 0 ? '#3fb950' : '#ff7b72',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    marginBottom: '5px'
                  }}>
                    {formatPercentage(curve.percentageFromATH)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '3px' }}>
                    ATH: ${formatNumber(curve.athUSD, 0)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b949e' }}>
                    ATH: {formatNumber(curve.athSOL, 8)} SOL
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
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#ff7b72' }}>
        🏆 Top ATH Curves - Corrected Formula ({curves.length})
      </h2>
      
      {curves.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          color: '#8b949e', 
          padding: '40px',
          background: '#161b22',
          borderRadius: '12px',
          border: '1px solid #30363d'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>🏆 No ATH data available</div>
          <div style={{ fontSize: '14px' }}>Try refreshing the data or check the connection</div>
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
                background: 'linear-gradient(135deg, #161b22 0%, #1a1f2e 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #30363d',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onClick={() => onCurveClick(curve.curveAddress)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1c2128';
                e.currentTarget.style.borderColor = '#ff7b72';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 123, 114, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #161b22 0%, #1a1f2e 100%)';
                e.currentTarget.style.borderColor = '#30363d';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#ff7b72', marginBottom: '8px' }}>
                    #{index + 1}. {safeString(curve.tokenName, 'Unknown')} ({safeString(curve.tokenSymbol, 'UNK')})
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '5px' }}>
                    {formatAddress(curve.curveAddress)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#8b949e', marginBottom: '3px' }}>
                    ATH Price: <strong style={{ color: '#ff7b72' }}>{formatNumber(curve.athSOL, 8)} SOL</strong>
                  </div>
                  <div style={{ fontSize: '14px', color: '#8b949e' }}>
                    ATH Value: <strong style={{ color: '#ff7b72' }}>${formatNumber(curve.athUSD, 0)} USD</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '5px' }}>
                    Date: {curve.athTimestamp ? new Date(curve.athTimestamp).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                  <div style={{ fontWeight: 'bold', color: '#58a6ff', fontSize: '16px', marginBottom: '5px' }}>
                    ${formatNumber(curve.currentMarketCapUSD, 0)}
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: safeNumber(curve.percentageFromATH) >= 0 ? '#3fb950' : '#ff7b72',
                    marginBottom: '5px'
                  }}>
                    {formatPercentage(curve.percentageFromATH)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b949e' }}>
                    Current: {formatNumber(curve.currentPriceSOL, 8)} SOL
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