// ComprehensiveAnalysisView.tsx
import React from 'react';

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

interface ComprehensiveAnalysisViewProps {
  analysis: ComprehensiveAnalysis | null;
}

const ComprehensiveAnalysisView: React.FC<ComprehensiveAnalysisViewProps> = ({ analysis }) => {
  if (!analysis) {
    return (
      <div style={{ textAlign: 'center', color: '#8b949e', padding: '40px' }}>
        <div>🔄 Loading comprehensive analysis...</div>
        <div style={{ fontSize: '14px', marginTop: '10px' }}>
          Analyzing token performance data...
        </div>
      </div>
    );
  }

  const successRate = (analysis.performers.gainersFromInitial / analysis.totalTokens) * 100;
  const portfolioReturn = analysis.averageGainToCurrent;

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
        📈 Comprehensive Token Analysis
      </h2>

      {/* خلاصه اجرایی */}
      <div style={{
        background: 'linear-gradient(135deg, #161b22 0%, #1c2128 100%)',
        padding: '25px',
        borderRadius: '15px',
        border: '1px solid #30363d',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h3>🎯 Executive Summary</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#58a6ff' }}>
              {analysis.totalTokens}
            </div>
            <div style={{ fontSize: '14px', color: '#8b949e' }}>Total Tokens Analyzed</div>
          </div>
          <div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: portfolioReturn >= 0 ? '#3fb950' : '#ff7b72' 
            }}>
              {portfolioReturn >= 0 ? '🟢' : '🔴'} {portfolioReturn.toFixed(2)}%
            </div>
            <div style={{ fontSize: '14px', color: '#8b949e' }}>Average Portfolio Return</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffd33d' }}>
              {successRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '14px', color: '#8b949e' }}>Success Rate</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#a371f7' }}>
              {analysis.averageTimeToATH.toFixed(1)}m
            </div>
            <div style={{ fontSize: '14px', color: '#8b949e' }}>Avg Time to ATH</div>
          </div>
        </div>
      </div>

      {/* کارت‌های اصلی */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* کارت عملکرد کلی */}
        <div style={{
          background: '#161b22',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #30363d'
        }}>
          <h3>📊 Overall Performance</h3>
          <div style={{ marginTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#8b949e' }}>Gainers:</span>
              <span style={{ color: '#3fb950', fontWeight: 'bold' }}>
                {analysis.performers.gainersFromInitial} ({((analysis.performers.gainersFromInitial / analysis.totalTokens) * 100).toFixed(1)}%)
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#8b949e' }}>Losers:</span>
              <span style={{ color: '#ff7b72', fontWeight: 'bold' }}>
                {analysis.performers.losersFromInitial} ({((analysis.performers.losersFromInitial / analysis.totalTokens) * 100).toFixed(1)}%)
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#8b949e' }}>Neutral:</span>
              <span style={{ color: '#8b949e', fontWeight: 'bold' }}>
                {analysis.performers.neutralFromInitial}
              </span>
            </div>
          </div>
        </div>

        {/* کارت توزیع سود */}
        <div style={{
          background: '#161b22',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #30363d'
        }}>
          <h3>💰 Return Distribution</h3>
          <div style={{ marginTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#ff6d00', fontSize: '12px' }}>+1000%+</span>
              <span style={{ color: '#ff6d00', fontWeight: 'bold' }}>{analysis.performanceCategories.megaGainers}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#ff9e00', fontSize: '12px' }}>+100% to +999%</span>
              <span style={{ color: '#ff9e00', fontWeight: 'bold' }}>{analysis.performanceCategories.highGainers}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#ffd33d', fontSize: '12px' }}>+10% to +99%</span>
              <span style={{ color: '#ffd33d', fontWeight: 'bold' }}>{analysis.performanceCategories.moderateGainers}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#3fb950', fontSize: '12px' }}>+1% to +9%</span>
              <span style={{ color: '#3fb950', fontWeight: 'bold' }}>{analysis.performanceCategories.slightGainers}</span>
            </div>
          </div>
        </div>

        {/* کارت مارکت کپ */}
        <div style={{
          background: '#161b22',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #30363d'
        }}>
          <h3>📈 Market Cap Evolution</h3>
          <div style={{ marginTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#8b949e' }}>Initial:</span>
              <span style={{ color: '#8b949e' }}>${analysis.totalInitialMarketCap.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#8b949e' }}>ATH:</span>
              <span style={{ color: '#ff7b72' }}>${analysis.totalATHMarketCap.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#8b949e' }}>Current:</span>
              <span style={{ color: '#3fb950' }}>${analysis.totalCurrentMarketCap.toLocaleString()}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '8px',
              paddingTop: '8px',
              borderTop: '1px solid #30363d'
            }}>
              <span style={{ color: '#8b949e' }}>Total Change:</span>
              <span style={{ 
                color: analysis.totalValueChange >= 0 ? '#3fb950' : '#ff7b72',
                fontWeight: 'bold'
              }}>
                {analysis.totalValueChange >= 0 ? '🟢' : '🔴'} ${analysis.totalValueChange.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* بهترین و بدترین عملکردها */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* بهترین عملکردها */}
        <div style={{
          background: '#161b22',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #30363d'
        }}>
          <h3 style={{ color: '#3fb950' }}>🏆 Top 5 Performers</h3>
          {analysis.topPerformers.map((token, index) => (
            <div key={index} style={{ 
              padding: '12px', 
              marginBottom: '10px', 
              background: '#0d1117',
              borderRadius: '8px',
              border: '1px solid #30363d'
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                {token.tokenName || 'Unknown'} ({token.tokenSymbol || 'N/A'})
              </div>
              <div style={{ color: '#3fb950', fontSize: '16px', fontWeight: 'bold', margin: '5px 0' }}>
                🟢 +{token.gainToCurrent.toFixed(2)}%
              </div>
              <div style={{ fontSize: '12px', color: '#8b949e' }}>
                Initial: ${token.initialPriceUSD?.toFixed(6) || '0.000000'} → Current: ${(token.currentMarketCapUSD / 1000).toFixed(2)}K
              </div>
            </div>
          ))}
        </div>

        {/* بدترین عملکردها */}
        <div style={{
          background: '#161b22',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #30363d'
        }}>
          <h3 style={{ color: '#ff7b72' }}>📉 Worst 5 Performers</h3>
          {analysis.worstPerformers.map((token, index) => (
            <div key={index} style={{ 
              padding: '12px', 
              marginBottom: '10px', 
              background: '#0d1117',
              borderRadius: '8px',
              border: '1px solid #30363d'
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                {token.tokenName || 'Unknown'} ({token.tokenSymbol || 'N/A'})
              </div>
              <div style={{ color: '#ff7b72', fontSize: '16px', fontWeight: 'bold', margin: '5px 0' }}>
                🔴 {token.gainToCurrent.toFixed(2)}%
              </div>
              <div style={{ fontSize: '12px', color: '#8b949e' }}>
                Initial: ${token.initialPriceUSD?.toFixed(6) || '0.000000'} → Current: ${(token.currentMarketCapUSD / 1000).toFixed(2)}K
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* بینش‌های سرمایه‌گذاری */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1f2e 0%, #161b22 100%)',
        padding: '25px',
        borderRadius: '15px',
        border: '1px solid #30363d'
      }}>
        <h3>💡 Investment Insights</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3fb950' }}>
              {successRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '14px', color: '#8b949e' }}>of tokens are profitable</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#58a6ff' }}>
              ${(analysis.totalValueChange / analysis.totalTokens).toFixed(0)}
            </div>
            <div style={{ fontSize: '14px', color: '#8b949e' }}>average gain per token</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd33d' }}>
              {analysis.averageTimeToATH.toFixed(1)}m
            </div>
            <div style={{ fontSize: '14px', color: '#8b949e' }}>to reach peak value</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: portfolioReturn >= 0 ? '#3fb950' : '#ff7b72' 
            }}>
              {portfolioReturn >= 0 ? '+' : ''}{portfolioReturn.toFixed(2)}%
            </div>
            <div style={{ fontSize: '14px', color: '#8b949e' }}>portfolio return</div>
          </div>
        </div>

        {/* شبیه‌سازی پورتفولیو */}
        {analysis.totalTokens >= 5 && (
          <div style={{
            marginTop: '25px',
            padding: '20px',
            background: '#0d1117',
            borderRadius: '10px',
            border: '1px solid #30363d'
          }}>
            <h4>📊 Portfolio Simulation</h4>
            <div style={{ fontSize: '14px', color: '#8b949e', marginBottom: '15px' }}>
              If you invested $100 in each of {analysis.totalTokens} tokens:
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              <div>
                <div style={{ color: '#8b949e', fontSize: '12px' }}>Total Investment</div>
                <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                  ${(analysis.totalTokens * 100).toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ color: '#8b949e', fontSize: '12px' }}>Expected Value</div>
                <div style={{ color: '#3fb950', fontSize: '18px', fontWeight: 'bold' }}>
                  ${(analysis.totalTokens * 100 * (1 + portfolioReturn / 100)).toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ color: '#8b949e', fontSize: '12px' }}>Expected Return</div>
                <div style={{ 
                  color: portfolioReturn >= 0 ? '#3fb950' : '#ff7b72', 
                  fontSize: '18px', 
                  fontWeight: 'bold' 
                }}>
                  {portfolioReturn >= 0 ? '🟢' : '🔴'} ${(analysis.totalTokens * 100 * (portfolioReturn / 100)).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveAnalysisView;