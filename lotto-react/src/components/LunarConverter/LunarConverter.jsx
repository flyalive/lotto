import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FeatureCard, 
  FeatureIcon, 
  FeatureTitle, 
  FeatureDescription, 
  InputGroup, 
  DateInput, 
  PrimaryButton 
} from '../../styles/GlobalStyles';
import useLunarCalendar from '../../hooks/useLunarCalendar';

const Result = styled.div`
  font-weight: bold;
  color: #1976D2;
  margin-top: 20px;
  padding: 15px;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0.05));
  border-radius: 12px;
  border-left: 4px solid #1976D2;
  animation: fadeIn 0.5s ease-in;
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  margin-top: 20px;
  padding: 15px;
  background: linear-gradient(135deg, rgba(211, 47, 47, 0.1), rgba(211, 47, 47, 0.05));
  border-radius: 12px;
  border-left: 4px solid #d32f2f;
  animation: fadeIn 0.5s ease-in;
`;

const LunarConverter = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { convertDateStringToLunar, isLibraryLoaded } = useLunarCalendar();

  // 오늘 날짜로 초기화
  useEffect(() => {
    const today = new Date();
    const todayString = today.getFullYear() + '-' + 
                       String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(today.getDate()).padStart(2, '0');
    setSelectedDate(todayString);
  }, []);

  const handleConvert = async () => {
    setError('');
    setResult('');
    setIsLoading(true);

    // UI 반응성을 위한 지연
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!isLibraryLoaded()) {
      setError('라이브러리가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      setIsLoading(false);
      return;
    }

    const conversion = convertDateStringToLunar(selectedDate);
    
    if (conversion.success) {
      setResult(conversion.formatted);
      console.log("--- 양력 -> 음력 변환 결과 ---");
      console.log(conversion.formatted);
    } else {
      setError(conversion.error);
    }
    
    setIsLoading(false);
  };

  return (
    <FeatureCard>
      <FeatureIcon className="calendar">📅</FeatureIcon>
      <FeatureTitle>음력 변환 데모</FeatureTitle>
      <FeatureDescription>
        양력 날짜를 입력하면 음력으로 변환해드립니다.
      </FeatureDescription>
      
      <InputGroup>
        <DateInput
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          placeholder="오늘 날짜가 자동 설정됩니다"
        />
        <PrimaryButton 
          onClick={handleConvert}
          disabled={!selectedDate || !isLibraryLoaded() || isLoading}
        >
          {isLoading ? '변환 중...' : '음력으로 변환'}
        </PrimaryButton>
      </InputGroup>
      
      {result && <Result>{result}</Result>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FeatureCard>
  );
};

export default LunarConverter; 