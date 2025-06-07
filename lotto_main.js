// kong의 로또번호 맞추기 - 메인 JavaScript 파일
// 2025.6.7 - HTML에서 분리

// 전역 변수로 로또 데이터 저장
let globalLottoData = [];

// 음력 변환 함수
function convertToLunar() {
    try {
        // 라이브러리가 로드되었는지 확인
        if (typeof KoreanLunarCalendar === 'undefined') {
            document.getElementById('lunarResult').textContent = '라이브러리가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.';
            console.error('KoreanLunarCalendar is not loaded yet');
            return;
        }

        // KoreanLunarCalendar 객체 생성
        const calendar = new KoreanLunarCalendar();
        
        console.log("--- 양력 -> 음력 변환 예시 (JS) ---");
        
        // 입력된 양력 날짜 가져오기
        const solarDateInput = document.getElementById('solarDate').value;
        if (!solarDateInput) {
            alert('날짜를 선택해주세요.');
            return;
        }
        
        const [year, month, day] = solarDateInput.split('-').map(Number);
        
        // 변환할 양력 날짜 설정
        calendar.setSolarDate(year, month, day);
        
        // 변환 결과 가져오기
        const lunarDate = calendar.getLunarCalendar();
        
        // 결과 출력
        // 월과 일은 두 자리로 표시되도록 padStart 사용
        const result = `양력 ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} >> 음력 ${lunarDate.year}-${String(lunarDate.month).padStart(2, '0')}-${String(lunarDate.day).padStart(2, '0')} (윤달: ${lunarDate.intercalation ? '윤달' : '평달'})`;
        
        console.log(result);
        document.getElementById('lunarResult').textContent = result;
        
    } catch (error) {
        console.error('음력 변환 중 오류 발생:', error);
        document.getElementById('lunarResult').textContent = '변환 중 오류가 발생했습니다: ' + error.message;
    }
}

// 음력 기반 번호 추천 시스템
function generateLunarBasedNumbers() {
    if (globalLottoData.length === 0) {
        document.getElementById('lunarRecommendation').textContent = '로또 데이터가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.';
        return;
    }

    try {
        // 라이브러리가 로드되었는지 확인
        if (typeof KoreanLunarCalendar === 'undefined') {
            document.getElementById('lunarRecommendation').textContent = '음력 라이브러리가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.';
            console.error('KoreanLunarCalendar is not loaded yet');
            return;
        }

        // 현재 날짜의 음력 정보 계산
        const today = new Date();
        const calendar = new KoreanLunarCalendar();
        calendar.setSolarDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
        const todayLunar = calendar.getLunarCalendar();

        console.log('🌙 현재 음력 정보:', todayLunar);

        // 음력 기반 패턴 분석
        const lunarAnalysis = analyzeLunarPatterns(todayLunar);
        
        // 추천 번호 생성
        const recommendedSets = generateLunarRecommendedSets(lunarAnalysis);
        
        // 결과 표시
        displayLunarRecommendation(todayLunar, lunarAnalysis, recommendedSets);

    } catch (error) {
        console.error('음력 기반 추천 중 오류 발생:', error);
        document.getElementById('lunarRecommendation').textContent = '추천 생성 중 오류가 발생했습니다: ' + error.message;
    }
}

// 음력 패턴 분석 함수
function analyzeLunarPatterns(todayLunar) {
    const patterns = {
        sameMonth: {},      // 같은 음력 월
        sameTenDay: {},     // 같은 순 (초순/중순/말순)
        sameDay: {},        // 같은 음력 일
        overall: {}         // 전체 빈도
    };

    // 전체 번호 빈도 계산
    for (let i = 1; i <= 45; i++) {
        patterns.overall[i] = 0;
        patterns.sameMonth[i] = 0;
        patterns.sameTenDay[i] = 0;
        patterns.sameDay[i] = 0;
    }

    globalLottoData.forEach(draw => {
        if (draw.lunar_info) {
            const lunar = draw.lunar_info;
            
            // 모든 번호 처리 (일반 번호 + 보너스)
            const allNumbers = [...draw.numbers];
            if (draw.bonus) {
                allNumbers.push(draw.bonus);
            }

            allNumbers.forEach(number => {
                // 전체 빈도
                patterns.overall[number]++;

                // 같은 음력 월
                if (lunar.lunar_month === todayLunar.month) {
                    patterns.sameMonth[number]++;
                }

                // 같은 순 (초순: 1-10일, 중순: 11-20일, 말순: 21-30일)
                const todayTenDay = Math.ceil(todayLunar.day / 10);
                const drawTenDay = Math.ceil(lunar.lunar_day / 10);
                if (todayTenDay === drawTenDay) {
                    patterns.sameTenDay[number]++;
                }

                // 같은 음력 일
                if (lunar.lunar_day === todayLunar.day) {
                    patterns.sameDay[number]++;
                }
            });
        }
    });

    return patterns;
}

// 음력 기반 추천 번호 세트 생성
function generateLunarRecommendedSets(analysis) {
    const sets = [];

    for (let setNum = 1; setNum <= 3; setNum++) {
        const numbers = [];
        
        // 각 패턴별로 높은 빈도 번호 선택
        const monthTop = getTopNumbers(analysis.sameMonth, 2);
        const tenDayTop = getTopNumbers(analysis.sameTenDay, 2);
        const dayTop = getTopNumbers(analysis.sameDay, 1);
        const overallTop = getTopNumbers(analysis.overall, 1);

        // 중복 제거하면서 번호 추가
        const candidates = [...monthTop, ...tenDayTop, ...dayTop, ...overallTop];
        const uniqueCandidates = [...new Set(candidates)];

        // 6개가 안 되면 랜덤으로 채우기
        while (uniqueCandidates.length < 6) {
            const randomNum = Math.floor(Math.random() * 45) + 1;
            if (!uniqueCandidates.includes(randomNum)) {
                uniqueCandidates.push(randomNum);
            }
        }

        // 6개 선택하여 정렬
        const finalNumbers = uniqueCandidates.slice(0, 6).sort((a, b) => a - b);
        sets.push(finalNumbers);
    }

    return sets;
}

// 상위 빈도 번호 추출
function getTopNumbers(frequencyObj, count) {
    const sorted = Object.entries(frequencyObj)
        .sort(([,a], [,b]) => b - a)
        .filter(([,freq]) => freq > 0)
        .map(([num,]) => parseInt(num))
        .slice(0, count);
    
    return sorted;
}

// 음력 추천 결과 표시
function displayLunarRecommendation(todayLunar, analysis, recommendedSets) {
    const tenDayNames = ['초순', '중순', '말순'];
    const tenDay = tenDayNames[Math.ceil(todayLunar.day / 10) - 1];

    const recommendationText = `
        🌙 오늘은 음력 ${todayLunar.year}년 ${todayLunar.month}월 ${todayLunar.day}일 (${tenDay})입니다.
        ${todayLunar.intercalation ? '(윤달)' : ''}
        과거 동일 조건 데이터를 분석하여 추천 번호를 생성했습니다.
    `;

    document.getElementById('lunarRecommendation').innerHTML = recommendationText.replace(/\n/g, '<br>');

    // 추천 번호 목록 표시
    const lunarListElement = document.getElementById('lunarLottoList');
    lunarListElement.innerHTML = '';

    recommendedSets.forEach((numbers, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>🌙 음력 추천 ${index + 1}번: <span class="lotto-number">${numbers.join(', ')}</span></strong>`;
        lunarListElement.appendChild(listItem);
    });

    // 콘솔에 상세 분석 결과 출력
    console.log('🔍 음력 패턴 분석 결과:', analysis);
}

// 음력 월별 맞춤 번호 생성 함수
function generateMonthlyCustomNumbers() {
    if (globalLottoData.length === 0) {
        document.getElementById('monthlyAnalysisResult').textContent = '로또 데이터가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.';
        return;
    }

    const selectedMonth = parseInt(document.getElementById('lunarMonthSelect').value);
    
    try {
        console.log(`📅 ${selectedMonth}월 맞춤 번호 생성 시작...`);
        
        // 선택된 음력 월의 과거 데이터 분석
        const monthlyAnalysis = analyzeMonthlyPatterns(selectedMonth);
        
        // 해당 월 맞춤 추천 번호 생성
        const customSets = generateMonthlyCustomSets(monthlyAnalysis, selectedMonth);
        
        // 결과 표시
        displayMonthlyAnalysis(selectedMonth, monthlyAnalysis, customSets);
        
    } catch (error) {
        console.error('월별 맞춤 번호 생성 중 오류 발생:', error);
        document.getElementById('monthlyAnalysisResult').textContent = '번호 생성 중 오류가 발생했습니다: ' + error.message;
    }
}

// 특정 음력 월의 패턴 분석 함수
function analyzeMonthlyPatterns(targetMonth) {
    const monthNames = ['', '정월', '이월', '삼월', '사월', '오월', '유월', '칠월', '팔월', '구월', '시월', '동월', '섣달'];
    
    const analysis = {
        monthName: monthNames[targetMonth],
        totalDraws: 0,              // 해당 월 총 추첨 횟수
        numberFrequency: {},        // 번호별 출현 빈도
        hotNumbers: [],             // 해당 월 자주 나온 번호들
        coldNumbers: [],            // 해당 월 적게 나온 번호들
        averageSum: 0,              // 해당 월 번호 합계 평균
        rangeProbability: {         // 번호 구간별 확률
            low: 0,    // 1-15
            mid: 0,    // 16-30
            high: 0    // 31-45
        }
    };

    // 1-45 번호 빈도 초기화
    for (let i = 1; i <= 45; i++) {
        analysis.numberFrequency[i] = 0;
    }

    let totalSum = 0;
    let totalNumbers = 0;

    // 해당 음력 월 데이터 필터링 및 분석
    globalLottoData.forEach(draw => {
        if (draw.lunar_info && draw.lunar_info.lunar_month === targetMonth) {
            analysis.totalDraws++;
            
            // 일반 번호 분석
            draw.numbers.forEach(number => {
                analysis.numberFrequency[number]++;
                totalSum += number;
                totalNumbers++;
            });
            
            // 보너스 번호는 0.5 가중치로 포함
            if (draw.bonus) {
                analysis.numberFrequency[draw.bonus] += 0.5;
                totalSum += draw.bonus * 0.5;
                totalNumbers += 0.5;
            }
        }
    });

    // 평균 계산
    if (totalNumbers > 0) {
        analysis.averageSum = (totalSum / totalNumbers * 6).toFixed(1); // 6개 번호 기준 평균 합계
    }

    // 번호별 빈도 정렬
    const sortedByFreq = Object.entries(analysis.numberFrequency)
        .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
        .sort((a, b) => b.frequency - a.frequency);

    // 상위 10개를 핫 넘버, 하위 10개를 콜드 넘버로 분류
    analysis.hotNumbers = sortedByFreq.slice(0, 10);
    analysis.coldNumbers = sortedByFreq.slice(-10).reverse();

    // 구간별 확률 계산
    const lowCount = sortedByFreq.filter(item => item.number >= 1 && item.number <= 15).reduce((sum, item) => sum + item.frequency, 0);
    const midCount = sortedByFreq.filter(item => item.number >= 16 && item.number <= 30).reduce((sum, item) => sum + item.frequency, 0);
    const highCount = sortedByFreq.filter(item => item.number >= 31 && item.number <= 45).reduce((sum, item) => sum + item.frequency, 0);
    
    const totalCount = lowCount + midCount + highCount;
    if (totalCount > 0) {
        analysis.rangeProbability.low = ((lowCount / totalCount) * 100).toFixed(1);
        analysis.rangeProbability.mid = ((midCount / totalCount) * 100).toFixed(1);
        analysis.rangeProbability.high = ((highCount / totalCount) * 100).toFixed(1);
    }

    return analysis;
}

// 월별 맞춤 번호 세트 생성 함수
function generateMonthlyCustomSets(analysis, targetMonth) {
    const sets = [];
    
    for (let setNum = 1; setNum <= 5; setNum++) {
        const numbers = [];
        
        // 전략 1: 핫 넘버 우선 선택 (2-3개)
        const hotCount = Math.floor(Math.random() * 2) + 2; // 2-3개
        const selectedHot = analysis.hotNumbers
            .slice(0, 8) // 상위 8개 중에서
            .sort(() => 0.5 - Math.random())
            .slice(0, hotCount)
            .map(item => item.number);
        
        numbers.push(...selectedHot);
        
        // 전략 2: 구간별 균형 맞추기
        const remainingSlots = 6 - numbers.length;
        const ranges = [
            { min: 1, max: 15, name: 'low' },
            { min: 16, max: 30, name: 'mid' },
            { min: 31, max: 45, name: 'high' }
        ];
        
        // 확률이 높은 구간부터 우선 선택
        const sortedRanges = ranges.sort((a, b) => 
            parseFloat(analysis.rangeProbability[b.name]) - parseFloat(analysis.rangeProbability[a.name])
        );
        
        let addedFromRanges = 0;
        for (let range of sortedRanges) {
            if (addedFromRanges >= remainingSlots) break;
            
            // 해당 구간에서 아직 선택되지 않은 번호 중 랜덤 선택
            const rangeNumbers = [];
            for (let i = range.min; i <= range.max; i++) {
                if (!numbers.includes(i)) {
                    rangeNumbers.push(i);
                }
            }
            
            if (rangeNumbers.length > 0) {
                const selectedFromRange = rangeNumbers[Math.floor(Math.random() * rangeNumbers.length)];
                numbers.push(selectedFromRange);
                addedFromRanges++;
            }
        }
        
        // 전략 3: 남은 자리는 콜드 넘버나 랜덤으로 채우기
        while (numbers.length < 6) {
            let candidate;
            if (Math.random() < 0.3 && analysis.coldNumbers.length > 0) {
                // 30% 확률로 콜드 넘버 선택
                const coldCandidates = analysis.coldNumbers.filter(item => !numbers.includes(item.number));
                if (coldCandidates.length > 0) {
                    candidate = coldCandidates[Math.floor(Math.random() * coldCandidates.length)].number;
                }
            }
            
            if (!candidate) {
                // 랜덤 선택
                do {
                    candidate = Math.floor(Math.random() * 45) + 1;
                } while (numbers.includes(candidate));
            }
            
            numbers.push(candidate);
        }
        
        // 번호 정렬
        numbers.sort((a, b) => a - b);
        sets.push(numbers);
    }
    
    return sets;
}

// 월별 분석 결과 표시 함수
function displayMonthlyAnalysis(selectedMonth, analysis, customSets) {
    const monthNames = ['', '정월', '이월', '삼월', '사월', '오월', '유월', '칠월', '팔월', '구월', '시월', '동월', '섣달'];
    
    const analysisText = `
        📅 ${analysis.monthName} 분석 결과
        • 총 ${analysis.totalDraws}회 추첨 데이터 분석
        • 번호 합계 평균: ${analysis.averageSum}
        • 구간별 출현 확률: 낮은구간(1-15) ${analysis.rangeProbability.low}%, 중간구간(16-30) ${analysis.rangeProbability.mid}%, 높은구간(31-45) ${analysis.rangeProbability.high}%
        • 자주 나온 번호: ${analysis.hotNumbers.slice(0, 5).map(item => item.number).join(', ')}
        • 적게 나온 번호: ${analysis.coldNumbers.slice(0, 5).map(item => item.number).join(', ')}
    `;
    
    document.getElementById('monthlyAnalysisResult').innerHTML = analysisText.replace(/\n/g, '<br>');
    
    // 추천 번호 목록 표시
    const monthlyListElement = document.getElementById('monthlyLottoList');
    monthlyListElement.innerHTML = '';
    
    customSets.forEach((numbers, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>📅 ${analysis.monthName} 맞춤 ${index + 1}번: <span class="lotto-number">${numbers.join(', ')}</span></strong>`;
        monthlyListElement.appendChild(listItem);
    });
    
    // 콘솔에 상세 분석 결과 출력
    console.log(`📊 ${analysis.monthName} 상세 분석:`, analysis);
}

// lotto_data_korean_lunar.json 파일에서 데이터를 불러와 출현 빈도를 계산
async function loadLottoData() {
    try {
        const response = await fetch('lotto_data_korean_lunar.json'); // Korean Lunar Calendar로 변환된 최신 데이터 로드
        if (!response.ok) {
            throw new Error('JSON 파일을 불러오는 데 실패했습니다.');
        }
        const lottoData = await response.json(); // JSON 데이터 파싱
        globalLottoData = lottoData; // 전역 변수로 저장 (음력 기반 추천에 사용)
        calculateFrequency(lottoData); // 출현 빈도 계산
    } catch (error) {
        console.error('로또 데이터를 불러오는 중 오류 발생:', error);
    }
}

// 출현 빈도를 계산하는 함수
function calculateFrequency(lottoData) {
    const frequency = {};

    // 각 회차의 번호를 순회하며 빈도 계산
    lottoData.forEach(draw => {
        draw.numbers.forEach(number => {
            frequency[number] = (frequency[number] || 0) + 1;
        });
        // 보너스 번호는 가중치 0.5로 빈도에 포함
        if (draw.bonus !== undefined) {
            frequency[draw.bonus] = (frequency[draw.bonus] || 0) + 0.5;
        }
    });

    // 출현 빈도에 따라 로또 번호를 그룹화
    groupLottoNumbers(frequency);
}

// 출현 빈도에 따라 로또 번호를 그룹화하는 함수
function groupLottoNumbers(frequency) {
    const lottoByWinCount = {};

    for (const [number, count] of Object.entries(frequency)) {
        if (!lottoByWinCount[count]) {
            lottoByWinCount[count] = [];
        }
        lottoByWinCount[count].push(Number(number));
    }

    // 그룹화된 데이터를 기반으로 로또 번호 세트를 생성
    groupAndGenerateLottoSets(lottoByWinCount);
}

// 그룹화된 데이터를 기반으로 로또 번호 세트를 생성하는 함수
function groupAndGenerateLottoSets(lottoByWinCount) {
    const groupedLottoByWinCount = { group1: {}, group2: {}, group3: {} };

    // 당첨 횟수를 기준으로 오름차순 정렬
    const sortedKeys = Object.keys(lottoByWinCount).sort((a, b) => Number(a) - Number(b));
    const groupSize = Math.ceil(sortedKeys.length / 3);

    // 그룹 분할 (group1: 최저 당첨, group2: 중간 당첨, group3: 최다 당첨)
    for (let i = 0; i < sortedKeys.length; i++) {
        const key = sortedKeys[i];
        if (i < groupSize) {
            groupedLottoByWinCount.group1[key] = lottoByWinCount[key];
        } else if (i < groupSize * 2) {
            groupedLottoByWinCount.group2[key] = lottoByWinCount[key];
        } else {
            groupedLottoByWinCount.group3[key] = lottoByWinCount[key];
        }
    }

    // 로또 번호 세트 생성 및 표시
    displayLottoSets(groupedLottoByWinCount);
}

// 로또 번호 세트를 생성하고 화면에 표시하는 함수
function displayLottoSets(groupedLottoByWinCount) {
    const numbersList = document.getElementById('lottoNumbersList');

    // 로또 번호 세트 생성 함수
    function generateLottoSet() {
        const randomValues = [];

        // 각 그룹에서 번호를 선택
        ['group1', 'group2', 'group3'].forEach((group, index) => {
            const count = index === 0 ? 3 : index === 1 ? 2 : 1; // group1: 3개, group2: 2개, group3: 1개
            const keys = Object.keys(groupedLottoByWinCount[group]);

            for (let i = 0; i < count; i++) {
                if (keys.length === 0) break;

                const randomIndex = Math.floor(Math.random() * keys.length);
                const randomKey = keys[randomIndex];
                const values = groupedLottoByWinCount[group][randomKey];
                const randomValue = values[Math.floor(Math.random() * values.length)];

                if (!randomValues.includes(randomValue)) {
                    randomValues.push(randomValue);
                } else {
                    i--; // 중복이면 다시 시도
                }
            }
        });

        // 번호를 오름차순으로 정렬
        return randomValues.sort((a, b) => a - b);
    }

    // 5세트의 로또 번호 생성
    for (let i = 1; i <= 5; i++) {
        const lottoSet = generateLottoSet();
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${i}번 로또번호: <span class="lotto-number">${lottoSet.join(', ')}</span></strong>`;
        numbersList.appendChild(listItem);
    }
}

// 페이지 로드 시 실행되는 초기화 함수
function initializeLottoApp() {
    // 라이브러리 로드 확인
    if (typeof KoreanLunarCalendar !== 'undefined') {
        console.log('✅ Korean Lunar Calendar 라이브러리가 성공적으로 로드되었습니다.');
    } else {
        console.warn('⚠️ Korean Lunar Calendar 라이브러리 로드에 실패했습니다.');
    }
    
    // 오늘 날짜를 음력 변환 데모 입력 필드에 자동 설정
    const today = new Date();
    const todayString = today.getFullYear() + '-' + 
                       String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(today.getDate()).padStart(2, '0');
    
    const solarDateInput = document.getElementById('solarDate');
    if (solarDateInput) {
        solarDateInput.value = todayString;
        console.log(`📅 오늘 날짜 자동 설정: ${todayString}`);
    }
    
    // 로또 데이터 로드
    loadLottoData();
}

// 페이지 로드 시 초기화 실행
window.onload = initializeLottoApp; 