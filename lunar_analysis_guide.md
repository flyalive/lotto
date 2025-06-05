# 🌙 음력 로또 데이터 분석 및 활용 가이드

## 📁 생성되는 JSON 파일 구조

### `lotto_data_lunar.json` 필드 설명

| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| `draw_no` | number | 로또 회차 | 1166 |
| `solar_date` | string | 양력 날짜 | "2025-04-05" |
| `lunar_date` | string | 음력 날짜 | "2025-03-08" |
| `lunar_year` | number | 음력 연도 | 2025 |
| `lunar_month` | number | 음력 월 | 3 |
| `lunar_day` | number | 음력 일 | 8 |
| `solar_term` | string | 24절기 | "청명" |
| `gan_ji_year` | string | 연도 간지 | "을사" |
| `gan_ji_month` | string | 월 간지 | "기묘" |
| `gan_ji_day` | string | 일 간지 | "정해" |
| `numbers` | array | 당첨번호 | [14, 23, 25, 27, 29, 42] |
| `bonus` | number | 보너스번호 | 16 |
| `is_leap_month` | boolean | 윤달 여부 | false |

## 🔍 음력 기반 분석 방법

### 1. 음력 월별 패턴 분석
```javascript
// 음력 1월(정월)에 특정 번호가 자주 나오는가?
const lunarMonthAnalysis = {
    1: "정월 - 새해 길상 번호",
    7: "칠월 - 칠석 관련 번호", 
    8: "팔월 - 한가위 관련 번호",
    12: "섣달 - 연말 특수 번호"
};
```

### 2. 24절기별 패턴 분석
```javascript
const solarTermAnalysis = {
    "입춘": "봄의 시작 - 새로운 번호 트렌드",
    "청명": "맑은 기운 - 밝은 번호대 선호?",
    "하지": "양기 최고조 - 높은 번호 출현?", 
    "동지": "음기 최고조 - 낮은 번호 출현?"
};
```

### 3. 간지(干支) 기반 분석
```javascript
const ganJiAnalysis = {
    heavenly: ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"],
    earthly: ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"],
    elements: {
        "갑을": "목(木) - 3, 8번대",
        "병정": "화(火) - 2, 7번대", 
        "무기": "토(土) - 5, 10번대",
        "경신": "금(金) - 4, 9번대",
        "임계": "수(水) - 1, 6번대"
    }
};
```

## 🎯 실용적 활용 방법

### 1. 현재 음력 날짜 기반 예측
```javascript
function getLunarBasedRecommendation(currentLunarDate) {
    const { lunar_month, solar_term, gan_ji_day } = currentLunarDate;
    
    // 음력 월 가중치
    const monthWeight = getLunarMonthWeight(lunar_month);
    
    // 절기 가중치  
    const termWeight = getSolarTermWeight(solar_term);
    
    // 간지 가중치
    const ganJiWeight = getGanJiWeight(gan_ji_day);
    
    return combineWeights(monthWeight, termWeight, ganJiWeight);
}
```

### 2. 전통 명절 특수 분석
```javascript
const traditionalHolidays = {
    "설날": "음력 1월 1일 - 새해 첫 복",
    "대보름": "음력 1월 15일 - 보름달 기운",
    "한식": "동지 후 105일 - 새 생명력",
    "단오": "음력 5월 5일 - 양기 왕성",
    "칠석": "음력 7월 7일 - 견우직녀",
    "한가위": "음력 8월 15일 - 풍요로운 추수"
};
```

### 3. 오행(五行) 상생상극 이론 적용
```javascript
const fiveElements = {
    wood: [3, 8, 13, 18, 23, 28, 33, 38, 43],     // 목
    fire: [2, 7, 12, 17, 22, 27, 32, 37, 42],     // 화  
    earth: [5, 10, 15, 20, 25, 30, 35, 40, 45],   // 토
    metal: [4, 9, 14, 19, 24, 29, 34, 39, 44],    // 금
    water: [1, 6, 11, 16, 21, 26, 31, 36, 41]     // 수
};

// 상생: 목→화→토→금→수→목
// 상극: 목→토, 화→금, 토→수, 금→목, 수→화
```

## 📊 음력 데이터 분석 예시 코드

```javascript
// 음력 로또 데이터 분석 클래스
class LunarLottoAnalyzer {
    constructor(lunarData) {
        this.data = lunarData;
    }
    
    // 음력 월별 번호 빈도 분석
    analyzeLunarMonthPatterns() {
        const monthlyPatterns = {};
        
        for (let month = 1; month <= 12; month++) {
            monthlyPatterns[month] = {};
            
            this.data
                .filter(draw => draw.lunar_month === month)
                .forEach(draw => {
                    draw.numbers.forEach(num => {
                        monthlyPatterns[month][num] = 
                            (monthlyPatterns[month][num] || 0) + 1;
                    });
                });
        }
        
        return monthlyPatterns;
    }
    
    // 24절기별 분석
    analyzeSolarTermPatterns() {
        const termPatterns = {};
        
        this.data.forEach(draw => {
            const term = draw.solar_term;
            if (!termPatterns[term]) termPatterns[term] = {};
            
            draw.numbers.forEach(num => {
                termPatterns[term][num] = 
                    (termPatterns[term][num] || 0) + 1;
            });
        });
        
        return termPatterns;
    }
    
    // 간지별 분석
    analyzeGanJiPatterns() {
        const ganJiPatterns = {};
        
        this.data.forEach(draw => {
            const ganJi = draw.gan_ji_day;
            if (!ganJiPatterns[ganJi]) ganJiPatterns[ganJi] = {};
            
            draw.numbers.forEach(num => {
                ganJiPatterns[ganJi][num] = 
                    (ganJiPatterns[ganJi][num] || 0) + 1;
            });
        });
        
        return ganJiPatterns;
    }
    
    // 오행별 분석
    analyzeFiveElementsPatterns() {
        const elements = {
            wood: [], fire: [], earth: [], metal: [], water: []
        };
        
        this.data.forEach(draw => {
            const ganJi = draw.gan_ji_day;
            const element = this.getElementFromGanJi(ganJi);
            
            draw.numbers.forEach(num => {
                elements[element].push(num);
            });
        });
        
        return elements;
    }
    
    getElementFromGanJi(ganJi) {
        const heavenly = ganJi[0];
        const elementMap = {
            '갑': 'wood', '을': 'wood',
            '병': 'fire', '정': 'fire', 
            '무': 'earth', '기': 'earth',
            '경': 'metal', '신': 'metal',
            '임': 'water', '계': 'water'
        };
        return elementMap[heavenly] || 'earth';
    }
}
```

## 🎨 시각화 및 대시보드 아이디어

### 1. 음력 캘린더 히트맵
- 음력 날짜별 당첨번호 분포 시각화
- 절기별 색상 구분
- 길일/흉일 표시

### 2. 간지 원형 차트  
- 60간지의 원형 배치
- 각 간지별 당첨 빈도 표시
- 오행별 색상 구분

### 3. 24절기 나선형 그래프
- 1년 24절기의 나선형 배치  
- 절기별 특징적 번호 하이라이트
- 계절별 트렌드 표시

## ⚠️ 주의사항 및 한계

### 1. 통계적 한계
- 음력 변환의 정확도 문제
- 표본 크기의 제약 (절기별 약 48회)
- 문화적 편견 가능성

### 2. 실용적 고려사항
- 과도한 복잡성 경계
- 검증 가능한 패턴 위주 분석
- 재미와 학습 목적 우선

### 3. 개선 방향
- 더 정확한 음력 변환 알고리즘
- 한국천문연구원 데이터 활용
- 머신러닝 기반 패턴 발견

## 🚀 다음 단계 제안

1. **음력 변환기 실행** → `lotto_data_lunar.json` 생성
2. **기초 패턴 분석** → 음력 월별, 절기별 빈도 확인  
3. **흥미로운 패턴 발견** → 통계적 유의성 검증
4. **실용적 활용** → 현재 음력 정보 기반 예측 시스템 구축

이렇게 음력 데이터를 활용하면 기존 양력 기반 분석과는 완전히 다른 관점에서 로또 번호를 분석할 수 있습니다! 🌙✨