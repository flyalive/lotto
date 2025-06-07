import { useState, useCallback } from 'react';
import KoreanLunarCalendar from 'korean-lunar-calendar';

/**
 * 음력 달력 관리 Custom Hook
 */
const useLunarCalendar = () => {
  const [calendar] = useState(new KoreanLunarCalendar());

  /**
   * 라이브러리 로드 확인
   */
  const isLibraryLoaded = useCallback(() => {
    return typeof KoreanLunarCalendar !== 'undefined';
  }, []);

  /**
   * 양력을 음력으로 변환
   */
  const convertToLunar = useCallback((year, month, day) => {
    try {
      if (!isLibraryLoaded()) {
        throw new Error('KoreanLunarCalendar is not loaded yet');
      }

      calendar.setSolarDate(year, month, day);
      const lunarDate = calendar.getLunarCalendar();
      
      return {
        success: true,
        data: lunarDate,
        formatted: `양력 ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} >> 음력 ${lunarDate.year}-${String(lunarDate.month).padStart(2, '0')}-${String(lunarDate.day).padStart(2, '0')} (윤달: ${lunarDate.intercalation ? '윤달' : '평달'})`
      };
    } catch (error) {
      console.error('음력 변환 중 오류 발생:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }, [calendar, isLibraryLoaded]);

  /**
   * 현재 날짜의 음력 정보 가져오기
   */
  const getCurrentLunarInfo = useCallback(() => {
    if (!isLibraryLoaded()) {
      throw new Error('KoreanLunarCalendar is not loaded yet');
    }

    const today = new Date();
    return convertToLunar(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    );
  }, [convertToLunar, isLibraryLoaded]);

  /**
   * 날짜 문자열을 파싱하여 음력으로 변환
   */
  const convertDateStringToLunar = useCallback((dateString) => {
    if (!dateString) {
      return { success: false, error: '날짜를 선택해주세요.' };
    }

    const [year, month, day] = dateString.split('-').map(Number);
    return convertToLunar(year, month, day);
  }, [convertToLunar]);

  return {
    isLibraryLoaded,
    convertToLunar,
    getCurrentLunarInfo,
    convertDateStringToLunar
  };
};

export default useLunarCalendar; 