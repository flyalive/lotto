import { useState, useEffect } from 'react';
import styled from 'styled-components';
import useLunarCalendar from '../../hooks/useLunarCalendar';

const LunarConverterContainer = styled.div`
  margin: 20px auto;
  padding: 15px;
  background-color: #e8f4fd;
  border-radius: 8px;
  border-left: 4px solid #2196F3;
  max-width: 600px;
  text-align: left;
`;

const Title = styled.h4`
  margin: 0 0 10px 0;
  color: #1976D2;
`;

const Description = styled.p`
  margin: 10px 0;
  color: #666;
`;

const InputGroup = styled.div`
  margin: 10px 0;
`;

const DateInput = styled.input`
  margin: 5px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ConvertButton = styled.button`
  margin: 5px;
  padding: 8px 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #1976D2;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Result = styled.div`
  font-weight: bold;
  color: #1976D2;
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(25, 118, 210, 0.1);
  border-radius: 4px;
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(211, 47, 47, 0.1);
  border-radius: 4px;
`;

const LunarConverter = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const { convertDateStringToLunar, isLibraryLoaded } = useLunarCalendar();

  // 오늘 날짜로 초기화
  useEffect(() => {
    const today = new Date();
    const todayString = today.getFullYear() + '-' + 
                       String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(today.getDate()).padStart(2, '0');
    setSelectedDate(todayString);
  }, []);

  const handleConvert = () => {
    setError('');
    setResult('');

    if (!isLibraryLoaded()) {
      setError('라이브러리가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
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
  };

  return (
    <LunarConverterContainer>
      <Title>🌙 음력 변환 데모</Title>
      <Description>양력 날짜를 입력하면 음력으로 변환해드립니다.</Description>
      
      <InputGroup>
        <DateInput
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          placeholder="오늘 날짜가 자동 설정됩니다"
        />
        <ConvertButton 
          onClick={handleConvert}
          disabled={!selectedDate || !isLibraryLoaded()}
        >
          음력으로 변환
        </ConvertButton>
      </InputGroup>
      
      {result && <Result>{result}</Result>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </LunarConverterContainer>
  );
};

export default LunarConverter; 