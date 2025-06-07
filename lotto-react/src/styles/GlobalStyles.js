import styled, { createGlobalStyle, keyframes } from 'styled-components';

// 키프레임 애니메이션 정의
export const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

export const ripple = keyframes`
  to {
    transform: scale(4);
    opacity: 0;
  }
`;

export const scaleHover = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// 글로벌 스타일
export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
  }

  @media (max-width: 768px) {
    body {
      padding: 10px;
    }
  }
`;

// 공통 컴포넌트 스타일
export const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

export const Header = styled.div`
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  padding: 30px;
  text-align: center;
  color: white;
`;

export const MainTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
`;

export const Content = styled.div`
  padding: 40px;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const FeatureCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 25px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${fadeIn} 0.6s ease-in;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const FeatureIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 20px;
  
  &.calendar {
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  }
  
  &.random {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  }
  
  &.analysis {
    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  }
`;

export const FeatureTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 15px;
`;

export const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
`;

export const InputGroup = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const DateInput = styled.input`
  padding: 12px 16px;
  border: 2px solid #e0e6ed;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background: #f8f9fa;

  &:focus {
    outline: none;
    border-color: #4facfe;
    background: white;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const SelectInput = styled.select`
  padding: 12px 16px;
  border: 2px solid #e0e6ed;
  border-radius: 10px;
  font-size: 1rem;
  background: #f8f9fa;
  cursor: pointer;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #4facfe;
    background: white;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }
`;

export const SecondaryButton = styled(Button)`
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(245, 87, 108, 0.4);
  }
`;

export const AccentButton = styled(Button)`
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(79, 172, 254, 0.4);
  }
`;

export const Footer = styled.div`
  background: #f8f9fa;
  padding: 20px;
  text-align: center;
  color: #666;
  border-top: 1px solid #e0e6ed;

  p {
    margin-bottom: 10px;
  }
`;

export const Disclaimer = styled.p`
  font-size: 0.9rem;
  color: #999;
  font-style: italic;
`; 