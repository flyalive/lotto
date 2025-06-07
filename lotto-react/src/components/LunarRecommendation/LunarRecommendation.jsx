import { useState } from 'react';
import styled from 'styled-components';
import { 
  FeatureCard, 
  FeatureIcon, 
  FeatureTitle, 
  FeatureDescription, 
  SecondaryButton 
} from '../../styles/GlobalStyles';
import { TEN_DAY_NAMES, LOTTO_MAX_NUMBER, LOTTO_PICK_COUNT } from '../../utils/constants';
import useLottoData from '../../hooks/useLottoData';
import useLunarCalendar from '../../hooks/useLunarCalendar';
import LottoResults from '../LottoResults/LottoResults';

const InfoPanel = styled.div`
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(0, 242, 254, 0.05));
  border-radius: 12px;
  padding: 15px;
  margin: 20px 0;
  border-left: 4px solid #4facfe;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #f5576c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LunarRecommendation = () => {
  const [results, setResults] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisInfo, setAnalysisInfo] = useState('');
  
  const { lottoData, hasData } = useLottoData();
  const { getCurrentLunarInfo, isLibraryLoaded } = useLunarCalendar();

  const analyzeLunarPatterns = (todayLunar) => {
    const patterns = {
      sameMonth: {},
      sameTenDay: {},
      sameDay: {},
      overall: {}
    };

    // 전체 번호 빈도 초기화
    for (let i = 1; i <= LOTTO_MAX_NUMBER; i++) {
      patterns.overall[i] = 0;
      patterns.sameMonth[i] = 0;
      patterns.sameTenDay[i] = 0;
      patterns.sameDay[i] = 0;
    }

    lottoData.forEach(draw => {
      if (draw.lunar_info) {
        const lunar = draw.lunar_info;
        const allNumbers = [...draw.numbers];
        if (draw.bonus) {
          allNumbers.push(draw.bonus);
        }

        allNumbers.forEach(number => {
          patterns.overall[number]++;

          if (lunar.lunar_month === todayLunar.month) {
            patterns.sameMonth[number]++;
          }

          const todayTenDay = Math.ceil(todayLunar.day / 10);
          const drawTenDay = Math.ceil(lunar.lunar_day / 10);
          if (todayTenDay === drawTenDay) {
            patterns.sameTenDay[number]++;
          }

          if (lunar.lunar_day === todayLunar.day) {
            patterns.sameDay[number]++;
          }
        });
      }
    });

    return patterns;
  };

  const getTopNumbers = (frequencyObj, count) => {
    return Object.entries(frequencyObj)
      .sort(([,a], [,b]) => b - a)
      .filter(([,freq]) => freq > 0)
      .map(([num,]) => parseInt(num))
      .slice(0, count);
  };

  const generateLunarRecommendedSets = (analysis) => {
    const sets = [];

    for (let setNum = 1; setNum <= 5; setNum++) {
      const monthTop = getTopNumbers(analysis.sameMonth, 2);
      const tenDayTop = getTopNumbers(analysis.sameTenDay, 2);
      const dayTop = getTopNumbers(analysis.sameDay, 1);
      const overallTop = getTopNumbers(analysis.overall, 1);

      const candidates = [...monthTop, ...tenDayTop, ...dayTop, ...overallTop];
      const uniqueCandidates = [...new Set(candidates)];

      while (uniqueCandidates.length < LOTTO_PICK_COUNT) {
        const randomNum = Math.floor(Math.random() * LOTTO_MAX_NUMBER) + 1;
        if (!uniqueCandidates.includes(randomNum)) {
          uniqueCandidates.push(randomNum);
        }
      }

      const finalNumbers = uniqueCandidates.slice(0, LOTTO_PICK_COUNT).sort((a, b) => a - b);
      sets.push(finalNumbers);
    }

    return sets;
  };

  const handleGenerate = async () => {
    if (!hasData) {
      return;
    }

    setIsGenerating(true);
    setResults([]);
    setAnalysisInfo('');

    try {
      // UI 반응성을 위한 지연
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!isLibraryLoaded()) {
        throw new Error('음력 라이브러리가 아직 로드되지 않았습니다.');
      }

      const todayLunarResult = getCurrentLunarInfo();
      
      if (!todayLunarResult.success) {
        throw new Error(todayLunarResult.error);
      }

      const todayLunar = todayLunarResult.data;
      console.log('🌙 현재 음력 정보:', todayLunar);

      const lunarAnalysis = analyzeLunarPatterns(todayLunar);
      const recommendedSets = generateLunarRecommendedSets(lunarAnalysis);

      const tenDayNames = TEN_DAY_NAMES;
      const tenDay = tenDayNames[Math.ceil(todayLunar.day / 10) - 1];

      const info = `🌙 오늘은 음력 ${todayLunar.year}년 ${todayLunar.month}월 ${todayLunar.day}일 (${tenDay})입니다.
${todayLunar.intercalation ? '(윤달)' : ''}
과거 동일 조건 데이터를 분석하여 추천 번호를 생성했습니다.`;

      setAnalysisInfo(info);
      setResults(recommendedSets);

      console.log('🔍 음력 패턴 분석 결과:', lunarAnalysis);

    } catch (error) {
      console.error('음력 기반 추천 중 오류 발생:', error);
      setAnalysisInfo(`❌ 추천 생성 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <FeatureCard>
      <FeatureIcon className="random">🎲</FeatureIcon>
      <FeatureTitle>음력 기반 번호 추천</FeatureTitle>
      <FeatureDescription>
        현재 날짜의 음력 정보를 바탕으로 과거 패턴을 분석하여 번호를 추천합니다.
      </FeatureDescription>
      
      <SecondaryButton 
        onClick={handleGenerate}
        disabled={!hasData || !isLibraryLoaded() || isGenerating}
      >
        {isGenerating && <LoadingSpinner />}
        {isGenerating ? '분석 중...' : '음력 기반 추천 번호 생성'}
      </SecondaryButton>
      
      {analysisInfo && (
        <InfoPanel>
          {analysisInfo.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </InfoPanel>
      )}
      
      <LottoResults results={results} title="음력 추천" />
    </FeatureCard>
  );
};

export default LunarRecommendation; 