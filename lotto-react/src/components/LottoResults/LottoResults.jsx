import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const scaleAnimation = keyframes`
  0% { transform: scale(0) rotate(180deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

const bounceHover = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

const ResultsSection = styled.div`
  margin-top: 30px;
`;

const WinningNumbersContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 20px;
  animation: ${scaleAnimation} 0.6s ease-out;
`;

const RoundTitle = styled.h3`
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const NumbersGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const NumberBall = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: white;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  box-shadow: 0 4px 15px rgba(238, 90, 36, 0.3);
  transition: transform 0.3s ease;
  cursor: pointer;
  animation: ${scaleAnimation} 0.5s ease-out;
  animation-delay: ${props => props.delay || 0}s;

  &:hover {
    animation: ${bounceHover} 0.6s ease;
  }

  @media (max-width: 768px) {
    width: 45px;
    height: 45px;
    font-size: 1rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
`;

const LottoResults = ({ results = [], title = "추천 번호" }) => {
  const [animatedResults, setAnimatedResults] = useState([]);

  useEffect(() => {
    if (results.length > 0) {
      // 애니메이션을 위해 순차적으로 결과 표시
      setAnimatedResults([]);
      results.forEach((result, index) => {
        setTimeout(() => {
          setAnimatedResults(prev => [...prev, result]);
        }, index * 200);
      });
    }
  }, [results]);

  if (results.length === 0) {
    return (
      <ResultsSection>
        <EmptyState>
          번호 생성 버튼을 클릭하여 추천 번호를 확인해보세요! 🎲
        </EmptyState>
      </ResultsSection>
    );
  }

  return (
    <ResultsSection>
      {animatedResults.map((numbers, index) => (
        <WinningNumbersContainer key={index}>
          <RoundTitle>{index + 1}번 {title}</RoundTitle>
          <NumbersGrid>
            {numbers.map((number, numberIndex) => (
              <NumberBall 
                key={numberIndex} 
                delay={numberIndex * 0.1}
              >
                {number}
              </NumberBall>
            ))}
          </NumbersGrid>
        </WinningNumbersContainer>
      ))}
    </ResultsSection>
  );
};

export default LottoResults; 