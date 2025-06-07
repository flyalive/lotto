import { useState } from 'react';
import styled from 'styled-components';
import { 
  FeatureCard, 
  FeatureIcon, 
  FeatureTitle, 
  FeatureDescription, 
  InputGroup,
  SelectInput,
  AccentButton 
} from '../../styles/GlobalStyles';
import { MONTH_NAMES, LOTTO_MAX_NUMBER, LOTTO_PICK_COUNT } from '../../utils/constants';
import useLottoData from '../../hooks/useLottoData';
import LottoResults from '../LottoResults/LottoResults';

const AnalysisPanel = styled.div`
  background: linear-gradient(135deg, rgba(255, 236, 210, 0.7), rgba(252, 182, 159, 0.3));
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  border-left: 4px solid #fcb69f;
  font-size: 0.95rem;
  line-height: 1.6;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  
  .label {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 5px;
  }
  
  .value {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #00f2fe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const MonthlyAnalysis = () => {
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [results, setResults] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  
  const { lottoData, hasData } = useLottoData();

  const analyzeMonthlyPatterns = (targetMonth) => {
    const analysis = {
      monthName: MONTH_NAMES[targetMonth],
      totalDraws: 0,
      numberFrequency: {},
      hotNumbers: [],
      coldNumbers: [],
      averageSum: 0,
      rangeProbability: {
        low: 0,    // 1-15
        mid: 0,    // 16-30
        high: 0    // 31-45
      }
    };

    // 번호 빈도 초기화
    for (let i = 1; i <= LOTTO_MAX_NUMBER; i++) {
      analysis.numberFrequency[i] = 0;
    }

    let totalSum = 0;
    let totalNumbers = 0;

    // 해당 음력 월 데이터 필터링 및 분석
    lottoData.forEach(draw => {
      if (draw.lunar_info && draw.lunar_info.lunar_month === targetMonth) {
        analysis.totalDraws++;
        
        draw.numbers.forEach(number => {
          analysis.numberFrequency[number]++;
          totalSum += number;
          totalNumbers++;
        });
        
        if (draw.bonus) {
          analysis.numberFrequency[draw.bonus] += 0.5;
          totalSum += draw.bonus * 0.5;
          totalNumbers += 0.5;
        }
      }
    });

    // 평균 계산
    if (totalNumbers > 0) {
      analysis.averageSum = (totalSum / totalNumbers * LOTTO_PICK_COUNT).toFixed(1);
    }

    // 번호별 빈도 정렬
    const sortedByFreq = Object.entries(analysis.numberFrequency)
      .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
      .sort((a, b) => b.frequency - a.frequency);

    analysis.hotNumbers = sortedByFreq.slice(0, 10);
    analysis.coldNumbers = sortedByFreq.slice(-10).reverse();

    // 구간별 확률 계산
    const lowCount = sortedByFreq.filter(item => item.number >= 1 && item.number <= 15).reduce((sum, item) => sum + item.frequency, 0);
    const midCount = sortedByFreq.filter(item => item.number >= 16 && item.number <= 30).reduce((sum, item) => sum + item.frequency, 0);
    const highCount = sortedByFreq.filter(item => item.number >= 31 && item.number <= 45).reduce((sum, item) => sum + item.frequency, 0);
    
    const totalCount = lowCount + midCount + highCount;
    if (totalCount > 0) {
      analysis.rangeProbability.low = ((lowCount / totalCount) * 100).toFixed(1);
      analysis.rangeProbability.mid = ((midCount / totalCount) * 100).toFixed(1);
      analysis.rangeProbability.high = ((highCount / totalCount) * 100).toFixed(1);
    }

    return analysis;
  };

  const generateMonthlyCustomSets = (analysis) => {
    const sets = [];
    
    for (let setNum = 1; setNum <= 5; setNum++) {
      const numbers = [];
      
      // 핫 넘버 우선 선택 (2-3개)
      const hotCount = Math.floor(Math.random() * 2) + 2;
      const selectedHot = analysis.hotNumbers
        .slice(0, 8)
        .sort(() => 0.5 - Math.random())
        .slice(0, hotCount)
        .map(item => item.number);
      
      numbers.push(...selectedHot);
      
      // 구간별 균형 맞추기
      const remainingSlots = LOTTO_PICK_COUNT - numbers.length;
      const ranges = [
        { min: 1, max: 15, name: 'low' },
        { min: 16, max: 30, name: 'mid' },
        { min: 31, max: 45, name: 'high' }
      ];
      
      const sortedRanges = ranges.sort((a, b) => 
        parseFloat(analysis.rangeProbability[b.name]) - parseFloat(analysis.rangeProbability[a.name])
      );
      
      let addedFromRanges = 0;
      for (let range of sortedRanges) {
        if (addedFromRanges >= remainingSlots) break;
        
        const rangeNumbers = [];
        for (let i = range.min; i <= range.max; i++) {
          if (!numbers.includes(i)) {
            rangeNumbers.push(i);
          }
        }
        
        if (rangeNumbers.length > 0) {
          const selectedFromRange = rangeNumbers[Math.floor(Math.random() * rangeNumbers.length)];
          numbers.push(selectedFromRange);
          addedFromRanges++;
        }
      }
      
      // 남은 자리는 콜드 넘버나 랜덤으로 채우기
      while (numbers.length < LOTTO_PICK_COUNT) {
        let candidate;
        if (Math.random() < 0.3 && analysis.coldNumbers.length > 0) {
          const coldCandidates = analysis.coldNumbers.filter(item => !numbers.includes(item.number));
          if (coldCandidates.length > 0) {
            candidate = coldCandidates[Math.floor(Math.random() * coldCandidates.length)].number;
          }
        }
        
        if (!candidate) {
          do {
            candidate = Math.floor(Math.random() * LOTTO_MAX_NUMBER) + 1;
          } while (numbers.includes(candidate));
        }
        
        numbers.push(candidate);
      }
      
      numbers.sort((a, b) => a - b);
      sets.push(numbers);
    }
    
    return sets;
  };

  const handleGenerate = async () => {
    if (!hasData) {
      return;
    }

    setIsGenerating(true);
    setResults([]);
    setAnalysisData(null);

    try {
      // UI 반응성을 위한 지연
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log(`📅 ${selectedMonth}월 맞춤 번호 생성 시작...`);
      
      const monthlyAnalysis = analyzeMonthlyPatterns(selectedMonth);
      const customSets = generateMonthlyCustomSets(monthlyAnalysis);
      
      setAnalysisData(monthlyAnalysis);
      setResults(customSets);
      
      console.log(`📊 ${monthlyAnalysis.monthName} 상세 분석:`, monthlyAnalysis);

    } catch (error) {
      console.error('월별 맞춤 번호 생성 중 오류 발생:', error);
      setAnalysisData({ error: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <FeatureCard>
      <FeatureIcon className="analysis">📊</FeatureIcon>
      <FeatureTitle>음력 월별 맞춤 번호 생성</FeatureTitle>
      <FeatureDescription>
        특정 음력 월의 과거 당첨 패턴을 분석하여 해당 월에 최적화된 번호를 추천합니다.
      </FeatureDescription>
      
      <InputGroup>
        <SelectInput 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        >
          {MONTH_NAMES.slice(1).map((monthName, index) => (
            <option key={index + 1} value={index + 1}>
              {monthName} ({index + 1}월)
            </option>
          ))}
        </SelectInput>
        <AccentButton 
          onClick={handleGenerate}
          disabled={!hasData || isGenerating}
        >
          {isGenerating && <LoadingSpinner />}
          {isGenerating ? '분석 중...' : '해당 월 맞춤 번호 생성'}
        </AccentButton>
      </InputGroup>
      
      {analysisData && !analysisData.error && (
        <AnalysisPanel>
          <div>📅 <strong>{analysisData.monthName}</strong> 분석 결과</div>
          
          <StatGrid>
            <StatCard>
              <div className="label">총 추첨 횟수</div>
              <div className="value">{analysisData.totalDraws}회</div>
            </StatCard>
            <StatCard>
              <div className="label">번호 합계 평균</div>
              <div className="value">{analysisData.averageSum}</div>
            </StatCard>
            <StatCard>
              <div className="label">낮은구간(1-15)</div>
              <div className="value">{analysisData.rangeProbability.low}%</div>
            </StatCard>
            <StatCard>
              <div className="label">중간구간(16-30)</div>
              <div className="value">{analysisData.rangeProbability.mid}%</div>
            </StatCard>
            <StatCard>
              <div className="label">높은구간(31-45)</div>
              <div className="value">{analysisData.rangeProbability.high}%</div>
            </StatCard>
          </StatGrid>
          
          <div style={{ marginTop: '15px' }}>
            <div>• 자주 나온 번호: {analysisData.hotNumbers.slice(0, 5).map(item => item.number).join(', ')}</div>
            <div>• 적게 나온 번호: {analysisData.coldNumbers.slice(0, 5).map(item => item.number).join(', ')}</div>
          </div>
        </AnalysisPanel>
      )}
      
      {analysisData?.error && (
        <AnalysisPanel style={{ borderLeftColor: '#d32f2f', background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.1), rgba(211, 47, 47, 0.05))' }}>
          ❌ 분석 중 오류가 발생했습니다: {analysisData.error}
        </AnalysisPanel>
      )}
      
      <LottoResults results={results} title={`${MONTH_NAMES[selectedMonth]} 맞춤`} />
    </FeatureCard>
  );
};

export default MonthlyAnalysis; 