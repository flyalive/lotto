import { useState, useEffect } from 'react';

/**
 * 로또 데이터 관리 Custom Hook
 */
const useLottoData = () => {
  const [lottoData, setLottoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * 로또 데이터 로드
   */
  const loadLottoData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/lotto_data_korean_lunar.json');
      if (!response.ok) {
        throw new Error('JSON 파일을 불러오는 데 실패했습니다.');
      }
      const data = await response.json();
      setLottoData(data);
      console.log(`✅ ${data.length}개의 로또 데이터가 로드되었습니다.`);
    } catch (err) {
      console.error('로또 데이터를 불러오는 중 오류 발생:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 출현 빈도 계산
   */
  const calculateFrequency = () => {
    const frequency = {};

    lottoData.forEach(draw => {
      draw.numbers.forEach(number => {
        frequency[number] = (frequency[number] || 0) + 1;
      });
      // 보너스 번호는 가중치 0.5로 빈도에 포함
      if (draw.bonus !== undefined) {
        frequency[draw.bonus] = (frequency[draw.bonus] || 0) + 0.5;
      }
    });

    return frequency;
  };

  useEffect(() => {
    loadLottoData();
  }, []);

  return {
    lottoData,
    loading,
    error,
    hasData: lottoData.length > 0,
    calculateFrequency,
    refetch: loadLottoData
  };
};

export default useLottoData; 