import styled from 'styled-components';
import LunarConverter from './components/LunarConverter/LunarConverter';
import useLottoData from './hooks/useLottoData';
import './styles.css';

const AppContainer = styled.div`
  font-family: Arial, sans-serif;
  margin: 20px auto;
  padding: 25px;
  background-color: #f5f5f5;
  max-width: 800px;
  text-align: center;
`;

const MainTitle = styled.h3`
  color: #333;
  margin-bottom: 30px;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const LoadingMessage = styled.div`
  padding: 20px;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  color: #856404;
`;

const ErrorMessage = styled.div`
  padding: 20px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
`;

const Footer = styled.div`
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
  
  p {
    font-size: 14px;
    color: #777;
    margin: 5px 0;
  }
`;

function App() {
  const { loading, error, hasData } = useLottoData();

  if (loading) {
    return (
      <AppContainer>
        <MainTitle>로또 번호 맞추기 (대박 나세요!!)</MainTitle>
        <LoadingMessage>
          🔄 로또 데이터를 불러오는 중입니다...
        </LoadingMessage>
      </AppContainer>
    );
  }

  if (error) {
    return (
      <AppContainer>
        <MainTitle>로또 번호 맞추기 (대박 나세요!!)</MainTitle>
        <ErrorMessage>
          ❌ 데이터 로드 중 오류가 발생했습니다: {error}
        </ErrorMessage>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <MainTitle>로또 번호 맞추기 (대박 나세요!!)</MainTitle>
      
      <MainContent>
        <LunarConverter />
        
        {/* TODO: 추가할 컴포넌트들 */}
        {/* <LunarRecommendation /> */}
        {/* <MonthlyAnalysis /> */}
        {/* <LottoResults /> */}
        
        {hasData && (
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            color: '#155724'
          }}>
            ✅ 로또 데이터가 성공적으로 로드되었습니다!
          </div>
        )}
      </MainContent>

      <Footer>
        <p>이 프로그램은 개인의 공부를 위해서 만들었으며, 영리목적으로 사용할 수 없습니다.</p>
        <p>2024. 4. 7. 수정</p>
        <p>2025. 4. 7. Perplexity, Claude, VScode로 수정</p>
        <p>2025. 6. 5. 그룹1,2,3의 적용변경및 음력날짜 적용</p>
        <p>2025. 6. 7. 음력으로 월별 맞춤 번호 생성 기능 추가(cursor, claude를 사용)</p>
        <p>2025. 6. 7. React로 리팩토링</p>
        <p>nanireu@gmail.com</p>
      </Footer>
    </AppContainer>
  );
}

export default App;
