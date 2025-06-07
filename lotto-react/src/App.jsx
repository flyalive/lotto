import { 
  GlobalStyle,
  Container, 
  Header, 
  MainTitle, 
  Subtitle,
  Content,
  Footer,
  Disclaimer
} from './styles/GlobalStyles';
import LunarConverter from './components/LunarConverter/LunarConverter';
import LunarRecommendation from './components/LunarRecommendation/LunarRecommendation';
import MonthlyAnalysis from './components/MonthlyAnalysis/MonthlyAnalysis';
import useLottoData from './hooks/useLottoData';
import styled from 'styled-components';

const LoadingMessage = styled.div`
  padding: 40px;
  text-align: center;
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  border: 1px solid #ffeaa7;
  border-radius: 16px;
  color: #856404;
  font-size: 1.1rem;
  margin: 20px;
`;

const ErrorMessage = styled.div`
  padding: 40px;
  text-align: center;
  background: linear-gradient(135deg, #f8d7da, #f5c6cb);
  border: 1px solid #f5c6cb;
  border-radius: 16px;
  color: #721c24;
  font-size: 1.1rem;
  margin: 20px;
`;

const SuccessMessage = styled.div`
  padding: 20px;
  text-align: center;
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  border: 1px solid #c3e6cb;
  border-radius: 16px;
  color: #155724;
  font-size: 1rem;
  margin: 20px 0;
  font-weight: 600;
`;

function App() {
  const { loading, error, hasData, lottoData } = useLottoData();

  if (loading) {
    return (
      <>
        <GlobalStyle />
        <Container>
          <Header>
            <MainTitle>🎰 로또 번호 맞추기</MainTitle>
            <Subtitle>대박 나세요!</Subtitle>
          </Header>
          <LoadingMessage>
            🔄 로또 데이터를 불러오는 중입니다...
            <br />
            <small style={{ opacity: 0.8, marginTop: '10px', display: 'block' }}>
              약 1,000개 이상의 데이터를 분석하고 있어요!
            </small>
          </LoadingMessage>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <GlobalStyle />
        <Container>
          <Header>
            <MainTitle>🎰 로또 번호 맞추기</MainTitle>
            <Subtitle>대박 나세요!</Subtitle>
          </Header>
          <ErrorMessage>
            ❌ 데이터 로드 중 오류가 발생했습니다
            <br />
            <small style={{ opacity: 0.8, marginTop: '10px', display: 'block' }}>
              {error}
            </small>
          </ErrorMessage>
        </Container>
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <Container>
        <Header>
          <MainTitle>🎰 로또 번호 맞추기</MainTitle>
          <Subtitle>대박 나세요!</Subtitle>
        </Header>
        
        <Content>
          {hasData && (
            <SuccessMessage>
              ✅ {lottoData.length}개의 로또 데이터가 성공적으로 로드되었습니다!
            </SuccessMessage>
          )}
          
          <LunarConverter />
          <LunarRecommendation />
          <MonthlyAnalysis />
        </Content>

        <Footer>
          <p><strong>이 프로그램은 개인의 공부를 위해서 만들었으며, 영리목적으로 사용할 수 없습니다.</strong></p>
          <Disclaimer>2024. 4. 7. 수정</Disclaimer>
          <Disclaimer>2025. 4. 7. Perplexity, Claude, VScode로 수정</Disclaimer>
          <Disclaimer>2025. 6. 5. 그룹1,2,3의 적용변경및 음력날짜 적용</Disclaimer>
          <Disclaimer>2025. 6. 7. 음력으로 월별 맞춤 번호 생성 기능 추가(cursor, claude를 사용)</Disclaimer>
          <Disclaimer>2025. 6. 7. React로 리팩토링 & 모던 UI 적용</Disclaimer>
          <Disclaimer>nanireu@gmail.com</Disclaimer>
        </Footer>
      </Container>
    </>
  );
}

export default App;
