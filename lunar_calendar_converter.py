#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
로또 데이터 한국 음력 변환기
양력 날짜를 한국 전통 음력으로 변환하는 프로그램
"""

import json
import datetime
from typing import Dict, List, Tuple, Optional

class KoreanLunarCalendar:
    """한국 음력 변환 클래스"""
    
    def __init__(self):
        # 음력 변환을 위한 기본 데이터 (1900-2100년)
        # 실제 구현에서는 더 정확한 천문학적 데이터가 필요
        self.lunar_month_days = [29, 30]  # 음력 월의 기본 일수
        self.lunar_year_months = 12  # 기본 음력 년의 월수
        
        # 한국 전통 음력 월 이름
        self.korean_month_names = {
            1: "정월", 2: "이월", 3: "삼월", 4: "사월",
            5: "오월", 6: "유월", 7: "칠월", 8: "팔월", 
            9: "구월", 10: "시월", 11: "동월", 12: "섣달"
        }
        
        # 간지(천간지지) 계산을 위한 데이터
        self.heavenly_stems = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"]
        self.earthly_branches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"]
        self.zodiac_animals = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"]
        
        # 24절기 데이터 (근사치)
        self.solar_terms = {
            "입춘": (2, 4), "우수": (2, 19), "경칩": (3, 6), "춘분": (3, 21),
            "청명": (4, 5), "곡우": (4, 20), "입하": (5, 6), "소만": (5, 21),
            "망종": (6, 6), "하지": (6, 21), "소서": (7, 7), "대서": (7, 23),
            "입추": (8, 8), "처서": (8, 23), "백로": (9, 8), "추분": (9, 23),
            "한로": (10, 8), "상강": (10, 23), "입동": (11, 7), "소설": (11, 22),
            "대설": (12, 7), "동지": (12, 22), "소한": (1, 6), "대한": (1, 20)
        }

    def gregorian_to_lunar_approximate(self, year: int, month: int, day: int) -> Dict:
        """
        양력을 음력으로 변환 (근사치 계산법)
        정확한 변환을 위해서는 천문학적 계산이나 외부 라이브러리 필요
        """
        # 기준일: 1900년 1월 31일 = 음력 1900년 1월 1일
        base_date = datetime.date(1900, 1, 31)
        target_date = datetime.date(year, month, day)
        
        # 일수 차이 계산
        days_diff = (target_date - base_date).days
        
        # 음력 년도 추정 (평균 354일/년)
        lunar_year = 1900 + int(days_diff / 354)
        
        # 음력 월, 일 추정 (더 정확한 계산 필요)
        remaining_days = days_diff % 354
        lunar_month = int(remaining_days / 29.5) + 1
        lunar_day = int(remaining_days % 29.5) + 1
        
        # 범위 조정
        if lunar_month > 12:
            lunar_month = 12
        if lunar_day > 30:
            lunar_day = 30
        if lunar_day < 1:
            lunar_day = 1
            
        return {
            'year': lunar_year,
            'month': lunar_month, 
            'day': lunar_day
        }

    def get_ganzhi_year(self, year: int) -> str:
        """간지(干支) 년도 계산"""
        # 기준: 1984년 = 갑자년
        base_year = 1984
        cycle_position = (year - base_year) % 60
        
        stem_index = cycle_position % 10
        branch_index = cycle_position % 12
        
        stem = self.heavenly_stems[stem_index]
        branch = self.earthly_branches[branch_index]
        animal = self.zodiac_animals[branch_index]
        
        return f"{stem}{branch}({animal})년"

    def get_korean_month_name(self, month: int) -> str:
        """한국 전통 월 이름 반환"""
        return self.korean_month_names.get(month, f"{month}월")

    def get_solar_term(self, month: int, day: int) -> Optional[str]:
        """24절기 확인"""
        for term, (term_month, term_day) in self.solar_terms.items():
            if month == term_month and abs(day - term_day) <= 2:
                return term
        return None

    def convert_to_korean_lunar(self, gregorian_date: str) -> Dict:
        """양력 날짜를 한국 음력으로 변환"""
        try:
            # 날짜 파싱
            date_obj = datetime.datetime.strptime(gregorian_date, "%Y-%m-%d")
            year, month, day = date_obj.year, date_obj.month, date_obj.day
            
            # 음력 변환
            lunar_info = self.gregorian_to_lunar_approximate(year, month, day)
            
            # 간지년 계산
            ganzhi_year = self.get_ganzhi_year(lunar_info['year'])
            
            # 한국 전통 월 이름
            korean_month = self.get_korean_month_name(lunar_info['month'])
            
            # 24절기 확인
            solar_term = self.get_solar_term(month, day)
            
            # 요일 계산
            weekdays = ["월", "화", "수", "목", "금", "토", "일"]
            weekday = weekdays[date_obj.weekday()]
            
            return {
                'original_date': gregorian_date,
                'lunar_year': lunar_info['year'],
                'lunar_month': lunar_info['month'],
                'lunar_day': lunar_info['day'],
                'ganzhi_year': ganzhi_year,
                'korean_month': korean_month,
                'korean_date': f"음력 {lunar_info['year']}년 {korean_month} {lunar_info['day']}일",
                'full_korean_date': f"{ganzhi_year} 음력 {korean_month} {lunar_info['day']}일 ({weekday}요일)",
                'solar_term': solar_term,
                'weekday': weekday
            }
            
        except Exception as e:
            return {
                'original_date': gregorian_date,
                'error': f"변환 오류: {str(e)}"
            }

def process_lotto_data(input_file: str = 'lotto_data.json', 
                      output_file: str = 'lotto_data_with_lunar.json') -> bool:
    """로또 데이터 파일을 읽어서 음력 정보를 추가"""
    
    try:
        # JSON 파일 읽기
        with open(input_file, 'r', encoding='utf-8') as f:
            lotto_data = json.load(f)
        
        print(f"📅 총 {len(lotto_data)}개의 로또 데이터를 처리합니다...")
        
        # 음력 변환기 초기화
        lunar_converter = KoreanLunarCalendar()
        
        # 각 로또 데이터에 음력 정보 추가
        processed_count = 0
        for i, draw in enumerate(lotto_data):
            if 'date' in draw:
                lunar_info = lunar_converter.convert_to_korean_lunar(draw['date'])
                draw['lunar_calendar'] = lunar_info
                processed_count += 1
                
                # 진행 상황 표시
                if (i + 1) % 100 == 0:
                    print(f"⏳ {i + 1}/{len(lotto_data)} 처리 완료...")
        
        # 변환된 데이터 저장
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(lotto_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 처리 완료! {processed_count}개 데이터가 변환되었습니다.")
        print(f"📁 결과 파일: {output_file}")
        
        return True
        
    except FileNotFoundError:
        print(f"❌ 파일을 찾을 수 없습니다: {input_file}")
        return False
    except json.JSONDecodeError:
        print(f"❌ JSON 파일 형식이 올바르지 않습니다: {input_file}")
        return False
    except Exception as e:
        print(f"❌ 처리 중 오류 발생: {str(e)}")
        return False

def analyze_lunar_patterns(data_file: str = 'lotto_data_with_lunar.json'):
    """음력 패턴 분석"""
    
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            lotto_data = json.load(f)
        
        print("\n🔍 음력 패턴 분석 결과:")
        print("=" * 50)
        
        # 간지년별 통계
        ganzhi_stats = {}
        month_stats = {}
        solar_term_stats = {}
        
        for draw in lotto_data:
            if 'lunar_calendar' in draw and 'error' not in draw['lunar_calendar']:
                lunar = draw['lunar_calendar']
                
                # 간지년 통계
                ganzhi = lunar.get('ganzhi_year', 'Unknown')
                ganzhi_stats[ganzhi] = ganzhi_stats.get(ganzhi, 0) + 1
                
                # 음력 월 통계  
                korean_month = lunar.get('korean_month', 'Unknown')
                month_stats[korean_month] = month_stats.get(korean_month, 0) + 1
                
                # 24절기 통계
                solar_term = lunar.get('solar_term')
                if solar_term:
                    solar_term_stats[solar_term] = solar_term_stats.get(solar_term, 0) + 1
        
        # 결과 출력
        print("\n📊 간지년별 로또 추첨 횟수:")
        for ganzhi, count in sorted(ganzhi_stats.items()):
            print(f"  {ganzhi}: {count}회")
        
        print("\n📊 음력 월별 로또 추첨 횟수:")
        for month, count in sorted(month_stats.items()):
            print(f"  {month}: {count}회")
        
        if solar_term_stats:
            print("\n📊 24절기 중 로또 추첨:")
            for term, count in sorted(solar_term_stats.items()):
                print(f"  {term}: {count}회")
        
    except Exception as e:
        print(f"❌ 분석 중 오류: {str(e)}")

def show_sample_conversions(data_file: str = 'lotto_data_with_lunar.json', sample_size: int = 5):
    """변환 결과 샘플 표시"""
    
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            lotto_data = json.load(f)
        
        print(f"\n📋 변환 결과 샘플 ({sample_size}개):")
        print("=" * 80)
        
        for i, draw in enumerate(lotto_data[:sample_size]):
            if 'lunar_calendar' in draw:
                lunar = draw['lunar_calendar']
                print(f"\n🎱 {draw['draw_no']}회차:")
                print(f"   양력: {draw['date']}")
                if 'error' not in lunar:
                    print(f"   음력: {lunar['full_korean_date']}")
                    if lunar.get('solar_term'):
                        print(f"   절기: {lunar['solar_term']}")
                    print(f"   당첨번호: {draw['numbers']}")
                else:
                    print(f"   변환 실패: {lunar['error']}")
        
    except Exception as e:
        print(f"❌ 샘플 표시 중 오류: {str(e)}")

if __name__ == "__main__":
    print("🌙 로또 데이터 한국 음력 변환기")
    print("=" * 50)
    
    # 1. 데이터 변환 실행
    success = process_lotto_data()
    
    if success:
        # 2. 변환 결과 샘플 표시
        show_sample_conversions()
        
        # 3. 음력 패턴 분석
        analyze_lunar_patterns()
        
        print("\n✨ 모든 작업이 완료되었습니다!")
        print("💡 이제 음력 날짜 정보를 활용한 패턴 분석이 가능합니다.")
    else:
        print("\n❌ 변환 작업이 실패했습니다.")

# 추가 유틸리티 함수들

def get_lunar_date_only(gregorian_date: str) -> str:
    """간단히 음력 날짜만 반환"""
    converter = KoreanLunarCalendar()
    result = converter.convert_to_korean_lunar(gregorian_date)
    return result.get('korean_date', '변환 실패')

def find_draws_by_lunar_month(month_name: str, data_file: str = 'lotto_data_with_lunar.json') -> List:
    """특정 음력 월의 로또 추첨 찾기"""
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            lotto_data = json.load(f)
        
        results = []
        for draw in lotto_data:
            if ('lunar_calendar' in draw and 
                'error' not in draw['lunar_calendar'] and
                draw['lunar_calendar'].get('korean_month') == month_name):
                results.append(draw)
        
        return results
    except:
        return []

def find_draws_by_ganzhi_year(ganzhi_year: str, data_file: str = 'lotto_data_with_lunar.json') -> List:
    """특정 간지년의 로또 추첨 찾기"""
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            lotto_data = json.load(f)
        
        results = []
        for draw in lotto_data:
            if ('lunar_calendar' in draw and 
                'error' not in draw['lunar_calendar'] and
                draw['lunar_calendar'].get('ganzhi_year') == ganzhi_year):
                results.append(draw)
        
        return results
    except:
        return []

# 사용 예제
"""
# 기본 사용법
python lunar_converter.py

# 특정 파일로 작업
process_lotto_data('my_lotto_data.json', 'my_output.json')

# 특정 날짜 변환
converter = KoreanLunarCalendar()
result = converter.convert_to_korean_lunar('2024-12-21')
print(result['full_korean_date'])

# 정월 추첨 찾기
jeongwol_draws = find_draws_by_lunar_month('정월')
print(f"정월 추첨: {len(jeongwol_draws)}회")
"""