// kong의 로또번호 맞추기 - 메인 JavaScript 파일
// 2025.6.7 - HTML에서 분리, 클래스 구조로 리팩토링

// 상수 정의
const LOTTO_MAX_NUMBER = 45;
const LOTTO_PICK_COUNT = 6;

/**
 * 음력 달력 관리 클래스
 * 양력-음력 변환 기능 담당
 */
class LunarCalendarManager {
    constructor() {
        this.calendar = null;
    }

    /**
     * 라이브러리 로드 확인
     */
    isLibraryLoaded() {
        return typeof KoreanLunarCalendar !== 'undefined';
    }

    /**
     * 양력을 음력으로 변환
     */
    convertToLunar() {
        try {
            if (!this.isLibraryLoaded()) {
                const resultElement = document.getElementById('lunarResult');
                if (resultElement) {
                    resultElement.textContent = '라이브러리가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.';
                    resultElement.className = 'result';
                }
                console.error('KoreanLunarCalendar is not loaded yet');
                return;
            }

            this.calendar = new KoreanLunarCalendar();
            
            console.log("--- 양력 -> 음력 변환 예시 (JS) ---");
            
            const solarDateInput = document.getElementById('solarDate').value;
            if (!solarDateInput) {
                alert('날짜를 선택해주세요.');
                return;
            }
            
            const [year, month, day] = solarDateInput.split('-').map(Number);
            
            this.calendar.setSolarDate(year, month, day);
            const lunarDate = this.calendar.getLunarCalendar();
            
            const result = `양력 ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} >> 음력 ${lunarDate.year}-${String(lunarDate.month).padStart(2, '0')}-${String(lunarDate.day).padStart(2, '0')} (${lunarDate.intercalation ? '윤달' : '평달'})`;
            
            console.log(result);
            const resultElement = document.getElementById('lunarResult');
            if (resultElement) {
                resultElement.textContent = result;
                resultElement.className = 'result';
            }
            
        } catch (error) {
            console.error('음력 변환 중 오류 발생:', error);
            const resultElement = document.getElementById('lunarResult');
            if (resultElement) {
                resultElement.textContent = '변환 중 오류가 발생했습니다: ' + error.message;
                resultElement.className = 'result';
            }
        }
    }

    /**
     * 현재 날짜의 음력 정보 가져오기
     */
    getCurrentLunarInfo() {
        if (!this.isLibraryLoaded()) {
            throw new Error('KoreanLunarCalendar is not loaded yet');
        }

        const today = new Date();
        this.calendar = new KoreanLunarCalendar();
        this.calendar.setSolarDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
        return this.calendar.getLunarCalendar();
    }
}

/**
 * 음력 기반 로또 분석 및 추천 클래스
 */
class LunarLottoAnalyzer {
    constructor(dataManager, lunarManager) {
        this.dataManager = dataManager;
        this.lunarManager = lunarManager;
    }

    /**
     * 음력 기반 번호 추천 생성
     */
    generateLunarBasedNumbers() {
        if (!this.dataManager.hasData()) {
            document.getElementById('lunarRecommendation').textContent = '로또 데이터가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.';
            return;
        }

        try {
            if (!this.lunarManager.isLibraryLoaded()) {
                document.getElementById('lunarRecommendation').textContent = '음력 라이브러리가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.';
                console.error('KoreanLunarCalendar is not loaded yet');
                return;
            }

            const todayLunar = this.lunarManager.getCurrentLunarInfo();
            console.log('🌙 현재 음력 정보:', todayLunar);

            const lunarAnalysis = this.analyzeLunarPatterns(todayLunar);
            const recommendedSets = this.generateLunarRecommendedSets(lunarAnalysis);
            this.displayLunarRecommendation(todayLunar, lunarAnalysis, recommendedSets);

        } catch (error) {
            console.error('음력 기반 추천 중 오류 발생:', error);
            document.getElementById('lunarRecommendation').textContent = '추천 생성 중 오류가 발생했습니다: ' + error.message;
        }
    }

    /**
     * 음력 패턴 분석
     */
    analyzeLunarPatterns(todayLunar) {
        const patterns = {
            sameMonth: {},
            sameTenDay: {},
            sameDay: {},
            overall: {}
        };

        // 전체 번호 빈도 초기화
        for (let i = 1; i <= LOTTO_MAX_NUMBER; i++) {
            patterns.overall[i] = 0;
            patterns.sameMonth[i] = 0;
            patterns.sameTenDay[i] = 0;
            patterns.sameDay[i] = 0;
        }

        this.dataManager.getLottoData().forEach(draw => {
            if (draw.lunar_info) {
                const lunar = draw.lunar_info;
                const allNumbers = [...draw.numbers];
                if (draw.bonus) {
                    allNumbers.push(draw.bonus);
                }

                allNumbers.forEach(number => {
                    patterns.overall[number]++;

                    if (lunar.lunar_month === todayLunar.month) {
                        patterns.sameMonth[number]++;
                    }

                    const todayTenDay = Math.ceil(todayLunar.day / 10);
                    const drawTenDay = Math.ceil(lunar.lunar_day / 10);
                    if (todayTenDay === drawTenDay) {
                        patterns.sameTenDay[number]++;
                    }

                    if (lunar.lunar_day === todayLunar.day) {
                        patterns.sameDay[number]++;
                    }
                });
            }
        });

        return patterns;
    }

    /**
     * 음력 기반 추천 번호 세트 생성
     */
    generateLunarRecommendedSets(analysis) {
        const sets = [];

        for (let setNum = 1; setNum <= 3; setNum++) {
            const numbers = [];
            
            const monthTop = this.getTopNumbers(analysis.sameMonth, 2);
            const tenDayTop = this.getTopNumbers(analysis.sameTenDay, 2);
            const dayTop = this.getTopNumbers(analysis.sameDay, 1);
            const overallTop = this.getTopNumbers(analysis.overall, 1);

            const candidates = [...monthTop, ...tenDayTop, ...dayTop, ...overallTop];
            const uniqueCandidates = [...new Set(candidates)];

            while (uniqueCandidates.length < LOTTO_PICK_COUNT) {
                const randomNum = Math.floor(Math.random() * LOTTO_MAX_NUMBER) + 1;
                if (!uniqueCandidates.includes(randomNum)) {
                    uniqueCandidates.push(randomNum);
                }
            }

            const finalNumbers = uniqueCandidates.slice(0, LOTTO_PICK_COUNT).sort((a, b) => a - b);
            sets.push(finalNumbers);
        }

        return sets;
    }

    /**
     * 상위 빈도 번호 추출
     */
    getTopNumbers(frequencyObj, count) {
        return Object.entries(frequencyObj)
            .sort(([,a], [,b]) => b - a)
            .filter(([,freq]) => freq > 0)
            .map(([num,]) => parseInt(num))
            .slice(0, count);
    }

    /**
     * 음력 추천 결과 표시 (모던 UI 버전)
     */
    displayLunarRecommendation(todayLunar, analysis, recommendedSets) {
        const tenDayNames = ['초순', '중순', '말순'];
        const tenDay = tenDayNames[Math.ceil(todayLunar.day / 10) - 1];

        const recommendationText = `🌙 오늘은 음력 ${todayLunar.year}년 ${todayLunar.month}월 ${todayLunar.day}일 (${tenDay})입니다.
${todayLunar.intercalation ? '(윤달)' : ''}
과거 동일 조건 데이터를 분석하여 추천 번호를 생성했습니다.`;

        // 정보 패널 업데이트
        const infoPanelElement = document.getElementById('lunarRecommendation');
        if (infoPanelElement) {
            infoPanelElement.innerHTML = recommendationText.split('\n').map(line => `<div>${line}</div>`).join('');
        }

        // 로또 결과 컨테이너 생성/업데이트
        const resultsContainer = document.getElementById('lunarLottoResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';

            recommendedSets.forEach((numbers, index) => {
                const winningContainer = document.createElement('div');
                winningContainer.className = 'winning-numbers-container';
                
                const roundTitle = document.createElement('h3');
                roundTitle.className = 'round-title';
                roundTitle.textContent = `${index + 1}번 음력 추천`;
                
                const numbersGrid = document.createElement('div');
                numbersGrid.className = 'numbers-grid';
                
                numbers.forEach((number, numberIndex) => {
                    const numberBall = document.createElement('div');
                    numberBall.className = 'number-ball';
                    numberBall.textContent = number;
                    numberBall.style.animationDelay = `${numberIndex * 0.1}s`;
                    numbersGrid.appendChild(numberBall);
                });
                
                winningContainer.appendChild(roundTitle);
                winningContainer.appendChild(numbersGrid);
                resultsContainer.appendChild(winningContainer);
            });
        }

        console.log('🔍 음력 패턴 분석 결과:', analysis);
    }
}

/**
 * 월별 맞춤 로또 분석 및 추천 클래스
 */
class MonthlyLottoAnalyzer {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.monthNames = ['', '정월', '이월', '삼월', '사월', '오월', '유월', '칠월', '팔월', '구월', '시월', '동월', '섣달'];
    }

    /**
     * 월별 맞춤 번호 생성
     */
    generateMonthlyCustomNumbers() {
        if (!this.dataManager.hasData()) {
            document.getElementById('monthlyAnalysisResult').textContent = '로또 데이터가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.';
            return;
        }

        const selectedMonth = parseInt(document.getElementById('lunarMonthSelect').value);
        
        try {
            console.log(`📅 ${selectedMonth}월 맞춤 번호 생성 시작...`);
            
            const monthlyAnalysis = this.analyzeMonthlyPatterns(selectedMonth);
            const customSets = this.generateMonthlyCustomSets(monthlyAnalysis, selectedMonth);
            this.displayMonthlyAnalysis(selectedMonth, monthlyAnalysis, customSets);
            
        } catch (error) {
            console.error('월별 맞춤 번호 생성 중 오류 발생:', error);
            document.getElementById('monthlyAnalysisResult').textContent = '번호 생성 중 오류가 발생했습니다: ' + error.message;
        }
    }

    /**
     * 특정 음력 월의 패턴 분석
     */
    analyzeMonthlyPatterns(targetMonth) {
        const analysis = {
            monthName: this.monthNames[targetMonth],
            totalDraws: 0,
            numberFrequency: {},
            hotNumbers: [],
            coldNumbers: [],
            averageSum: 0,
            rangeProbability: {
                low: 0,    // 1-15
                mid: 0,    // 16-30
                high: 0    // 31-45
            }
        };

        // 번호 빈도 초기화
        for (let i = 1; i <= LOTTO_MAX_NUMBER; i++) {
            analysis.numberFrequency[i] = 0;
        }

        let totalSum = 0;
        let totalNumbers = 0;

        // 해당 음력 월 데이터 필터링 및 분석
        this.dataManager.getLottoData().forEach(draw => {
            if (draw.lunar_info && draw.lunar_info.lunar_month === targetMonth) {
                analysis.totalDraws++;
                
                draw.numbers.forEach(number => {
                    analysis.numberFrequency[number]++;
                    totalSum += number;
                    totalNumbers++;
                });
                
                if (draw.bonus) {
                    analysis.numberFrequency[draw.bonus] += 0.5;
                    totalSum += draw.bonus * 0.5;
                    totalNumbers += 0.5;
                }
            }
        });

        // 평균 계산
        if (totalNumbers > 0) {
            analysis.averageSum = (totalSum / totalNumbers * LOTTO_PICK_COUNT).toFixed(1);
        }

        // 번호별 빈도 정렬
        const sortedByFreq = Object.entries(analysis.numberFrequency)
            .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
            .sort((a, b) => b.frequency - a.frequency);

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

    /**
     * 월별 맞춤 번호 세트 생성
     */
    generateMonthlyCustomSets(analysis, targetMonth) {
        const sets = [];
        
        for (let setNum = 1; setNum <= 5; setNum++) {
            const numbers = [];
            
            // 핫 넘버 우선 선택 (2-3개)
            const hotCount = Math.floor(Math.random() * 2) + 2;
            const selectedHot = analysis.hotNumbers
                .slice(0, 8)
                .sort(() => 0.5 - Math.random())
                .slice(0, hotCount)
                .map(item => item.number);
            
            numbers.push(...selectedHot);
            
            // 구간별 균형 맞추기
            const remainingSlots = LOTTO_PICK_COUNT - numbers.length;
            const ranges = [
                { min: 1, max: 15, name: 'low' },
                { min: 16, max: 30, name: 'mid' },
                { min: 31, max: 45, name: 'high' }
            ];
            
            const sortedRanges = ranges.sort((a, b) => 
                parseFloat(analysis.rangeProbability[b.name]) - parseFloat(analysis.rangeProbability[a.name])
            );
            
            let addedFromRanges = 0;
            for (let range of sortedRanges) {
                if (addedFromRanges >= remainingSlots) break;
                
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
            
            // 남은 자리는 콜드 넘버나 랜덤으로 채우기
            while (numbers.length < LOTTO_PICK_COUNT) {
                let candidate;
                if (Math.random() < 0.3 && analysis.coldNumbers.length > 0) {
                    const coldCandidates = analysis.coldNumbers.filter(item => !numbers.includes(item.number));
                    if (coldCandidates.length > 0) {
                        candidate = coldCandidates[Math.floor(Math.random() * coldCandidates.length)].number;
                    }
                }
                
                if (!candidate) {
                    do {
                        candidate = Math.floor(Math.random() * LOTTO_MAX_NUMBER) + 1;
                    } while (numbers.includes(candidate));
                }
                
                numbers.push(candidate);
            }
            
            numbers.sort((a, b) => a - b);
            sets.push(numbers);
        }
        
        return sets;
    }

    /**
     * 월별 분석 결과 표시 (모던 UI 버전)
     */
    displayMonthlyAnalysis(selectedMonth, analysis, customSets) {
        // 분석 패널 업데이트
        const analysisElement = document.getElementById('monthlyAnalysisResult');
        if (analysisElement) {
            const analysisHTML = `
                <div>📅 <strong>${analysis.monthName}</strong> 분석 결과</div>
                
                <div class="stat-grid">
                    <div class="stat-card">
                        <div class="label">총 추첨 횟수</div>
                        <div class="value">${analysis.totalDraws}회</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">번호 합계 평균</div>
                        <div class="value">${analysis.averageSum}</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">낮은구간(1-15)</div>
                        <div class="value">${analysis.rangeProbability.low}%</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">중간구간(16-30)</div>
                        <div class="value">${analysis.rangeProbability.mid}%</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">높은구간(31-45)</div>
                        <div class="value">${analysis.rangeProbability.high}%</div>
                    </div>
                </div>
                
                <div style="margin-top: 15px;">
                    <div>• 자주 나온 번호: ${analysis.hotNumbers.slice(0, 5).map(item => item.number).join(', ')}</div>
                    <div>• 적게 나온 번호: ${analysis.coldNumbers.slice(0, 5).map(item => item.number).join(', ')}</div>
                </div>
            `;
            analysisElement.innerHTML = analysisHTML;
        }
        
        // 로또 결과 컨테이너 생성/업데이트
        const resultsContainer = document.getElementById('monthlyLottoResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';

            customSets.forEach((numbers, index) => {
                const winningContainer = document.createElement('div');
                winningContainer.className = 'winning-numbers-container';
                
                const roundTitle = document.createElement('h3');
                roundTitle.className = 'round-title';
                roundTitle.textContent = `${index + 1}번 ${analysis.monthName} 맞춤`;
                
                const numbersGrid = document.createElement('div');
                numbersGrid.className = 'numbers-grid';
                
                numbers.forEach((number, numberIndex) => {
                    const numberBall = document.createElement('div');
                    numberBall.className = 'number-ball';
                    numberBall.textContent = number;
                    numberBall.style.animationDelay = `${numberIndex * 0.1}s`;
                    numbersGrid.appendChild(numberBall);
                });
                
                winningContainer.appendChild(roundTitle);
                winningContainer.appendChild(numbersGrid);
                resultsContainer.appendChild(winningContainer);
            });
        }
        
        console.log(`📊 ${analysis.monthName} 상세 분석:`, analysis);
    }
}

/**
 * 로또 데이터 관리 클래스
 */
class LottoDataManager {
    constructor() {
        this.lottoData = [];
    }

    /**
     * 데이터가 로드되었는지 확인
     */
    hasData() {
        return this.lottoData.length > 0;
    }

    /**
     * 로또 데이터 가져오기
     */
    getLottoData() {
        return this.lottoData;
    }

    /**
     * 로또 데이터 로드
     */
    async loadLottoData() {
        try {
            const response = await fetch('lotto_data_korean_lunar.json');
            if (!response.ok) {
                throw new Error('JSON 파일을 불러오는 데 실패했습니다.');
            }
            this.lottoData = await response.json();
            console.log(`✅ ${this.lottoData.length}개의 로또 데이터가 로드되었습니다.`);
            return true;
        } catch (error) {
            console.error('로또 데이터를 불러오는 중 오류 발생:', error);
            return false;
        }
    }

    /**
     * 출현 빈도 계산
     */
    calculateFrequency() {
        const frequency = {};

        this.lottoData.forEach(draw => {
            draw.numbers.forEach(number => {
                frequency[number] = (frequency[number] || 0) + 1;
            });
            // 보너스 번호는 가중치 0.5로 빈도에 포함
            if (draw.bonus !== undefined) {
                frequency[draw.bonus] = (frequency[draw.bonus] || 0) + 0.5;
            }
        });

        return frequency;
    }
}

/**
 * 기본 로또 번호 생성 클래스
 */
class LottoNumberGenerator {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    /**
     * 출현 빈도에 따라 로또 번호를 그룹화
     */
    groupLottoNumbers(frequency) {
        const lottoByWinCount = {};

        for (const [number, count] of Object.entries(frequency)) {
            if (!lottoByWinCount[count]) {
                lottoByWinCount[count] = [];
            }
            lottoByWinCount[count].push(Number(number));
        }

        return this.groupAndGenerateLottoSets(lottoByWinCount);
    }

    /**
     * 그룹화된 데이터를 기반으로 로또 번호 세트를 생성
     */
    groupAndGenerateLottoSets(lottoByWinCount) {
        const groupedLottoByWinCount = { group1: {}, group2: {}, group3: {} };

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

        return groupedLottoByWinCount;
    }

    /**
     * 로또 번호 세트 생성
     */
    generateLottoSet(groupedLottoByWinCount) {
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

        return randomValues.sort((a, b) => a - b);
    }

    /**
     * 로또 번호 세트를 생성하고 화면에 표시
     */
    displayLottoSets() {
        if (!this.dataManager.hasData()) {
            console.error('로또 데이터가 로드되지 않았습니다.');
            return;
        }

        const frequency = this.dataManager.calculateFrequency();
        const groupedLottoByWinCount = this.groupLottoNumbers(frequency);
        const numbersList = document.getElementById('lottoNumbersList');

        // 5세트의 로또 번호 생성
        for (let i = 1; i <= 5; i++) {
            const lottoSet = this.generateLottoSet(groupedLottoByWinCount);
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>${i}번 로또번호: <span class="lotto-number">${lottoSet.join(', ')}</span></strong>`;
            numbersList.appendChild(listItem);
        }
    }
}

/**
 * 메인 로또 앱 클래스
 */
class LottoApp {
    constructor() {
        this.dataManager = new LottoDataManager();
        this.lunarManager = new LunarCalendarManager();
        this.lunarAnalyzer = new LunarLottoAnalyzer(this.dataManager, this.lunarManager);
        this.monthlyAnalyzer = new MonthlyLottoAnalyzer(this.dataManager);
        this.numberGenerator = new LottoNumberGenerator(this.dataManager);
    }

    /**
     * 앱 초기화
     */
    async initialize() {
        // 라이브러리 로드 확인
        if (this.lunarManager.isLibraryLoaded()) {
            console.log('✅ Korean Lunar Calendar 라이브러리가 성공적으로 로드되었습니다.');
        } else {
            console.warn('⚠️ Korean Lunar Calendar 라이브러리 로드에 실패했습니다.');
        }
        
        // 오늘 날짜를 음력 변환 데모 입력 필드에 자동 설정
        this.setTodayDate();
        
        // 로또 데이터 로드
        const success = await this.dataManager.loadLottoData();
        if (success) {
            this.numberGenerator.displayLottoSets();
        }
    }

    /**
     * 오늘 날짜 자동 설정
     */
    setTodayDate() {
        const today = new Date();
        const todayString = today.getFullYear() + '-' + 
                           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(today.getDate()).padStart(2, '0');
        
        const solarDateInput = document.getElementById('solarDate');
        if (solarDateInput) {
            solarDateInput.value = todayString;
            console.log(`📅 오늘 날짜 자동 설정: ${todayString}`);
        }
    }
}

// 전역 앱 인스턴스
let lottoApp;

// 전역 함수들 (HTML에서 호출용)
function convertToLunar() {
    if (lottoApp) {
        lottoApp.lunarManager.convertToLunar();
    }
}

function generateLunarBasedNumbers() {
    if (lottoApp) {
        lottoApp.lunarAnalyzer.generateLunarBasedNumbers();
    }
}

function generateMonthlyCustomNumbers() {
    if (lottoApp) {
        lottoApp.monthlyAnalyzer.generateMonthlyCustomNumbers();
    }
}

// 페이지 로드 시 실행되는 초기화 함수
async function initializeLottoApp() {
    lottoApp = new LottoApp();
    await lottoApp.initialize();
}

// 페이지 로드 시 초기화 실행
window.onload = initializeLottoApp; 
