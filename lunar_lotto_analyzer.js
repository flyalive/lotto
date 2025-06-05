/**
 * 음력 로또 번호 상관관계 분석기
 * lotto_data_with_lunar.json을 기반으로 음력 정보와 당첨 번호의 패턴을 분석
 */

class LunarLottoAnalyzer {
    constructor() {
        this.lottoData = [];
        this.analysisResults = {};
    }

    /**
     * 음력 로또 데이터 로드
     */
    async loadData() {
        try {
            const response = await fetch('lotto_data_with_lunar.json');
            if (!response.ok) {
                throw new Error('데이터 로드 실패');
            }
            this.lottoData = await response.json();
            console.log(`✅ ${this.lottoData.length}개의 음력 로또 데이터 로드 완료`);
            return true;
        } catch (error) {
            console.error('❌ 데이터 로드 오류:', error);
            return false;
        }
    }

    /**
     * 음력 월별 번호 출현 빈도 분석
     */
    analyzeLunarMonthPatterns() {
        const monthPatterns = {};
        const monthStats = {};

        this.lottoData.forEach(draw => {
            if (draw.lunar_calendar && !draw.lunar_calendar.error) {
                const month = draw.lunar_calendar.korean_month;
                
                if (!monthPatterns[month]) {
                    monthPatterns[month] = {};
                    monthStats[month] = { totalDraws: 0, numberCount: {} };
                }

                monthStats[month].totalDraws++;

                // 일반 번호 분석
                draw.numbers.forEach(number => {
                    monthPatterns[month][number] = (monthPatterns[month][number] || 0) + 1;
                    monthStats[month].numberCount[number] = (monthStats[month].numberCount[number] || 0) + 1;
                });

                // 보너스 번호 분석 (가중치 0.5)
                if (draw.bonus) {
                    monthPatterns[month][draw.bonus] = (monthPatterns[month][draw.bonus] || 0) + 0.5;
                    monthStats[month].numberCount[draw.bonus] = (monthStats[month].numberCount[draw.bonus] || 0) + 0.5;
                }
            }
        });

        // 월별 선호 번호 계산
        const monthPreferences = {};
        for (const month in monthStats) {
            const totalNumbers = monthStats[month].totalDraws * 6; // 6개 번호 * 추첨 횟수
            monthPreferences[month] = {};
            
            for (let num = 1; num <= 45; num++) {
                const count = monthStats[month].numberCount[num] || 0;
                const frequency = count / totalNumbers;
                const expectedFrequency = 1 / 45; // 기대 빈도 (1/45)
                const bias = frequency / expectedFrequency; // 편향도
                
                monthPreferences[month][num] = {
                    count: count,
                    frequency: frequency,
                    bias: bias,
                    preference: bias > 1.1 ? 'high' : bias < 0.9 ? 'low' : 'normal'
                };
            }
        }

        return { monthPatterns, monthStats, monthPreferences };
    }

    /**
     * 간지년별 번호 패턴 분석
     */
    analyzeGanzhiPatterns() {
        const ganzhiPatterns = {};
        const ganzhiStats = {};

        this.lottoData.forEach(draw => {
            if (draw.lunar_calendar && !draw.lunar_calendar.error) {
                const ganzhi = draw.lunar_calendar.ganzhi_year;
                
                if (!ganzhiPatterns[ganzhi]) {
                    ganzhiPatterns[ganzhi] = {};
                    ganzhiStats[ganzhi] = { totalDraws: 0, numberCount: {} };
                }

                ganzhiStats[ganzhi].totalDraws++;

                draw.numbers.forEach(number => {
                    ganzhiPatterns[ganzhi][number] = (ganzhiPatterns[ganzhi][number] || 0) + 1;
                    ganzhiStats[ganzhi].numberCount[number] = (ganzhiStats[ganzhi].numberCount[number] || 0) + 1;
                });

                if (draw.bonus) {
                    ganzhiPatterns[ganzhi][draw.bonus] = (ganzhiPatterns[ganzhi][draw.bonus] || 0) + 0.5;
                    ganzhiStats[ganzhi].numberCount[draw.bonus] = (ganzhiStats[ganzhi].numberCount[draw.bonus] || 0) + 0.5;
                }
            }
        });

        return { ganzhiPatterns, ganzhiStats };
    }

    /**
     * 24절기별 번호 패턴 분석
     */
    analyzeSolarTermPatterns() {
        const termPatterns = {};
        const termStats = {};

        this.lottoData.forEach(draw => {
            if (draw.lunar_calendar && !draw.lunar_calendar.error && draw.lunar_calendar.solar_term) {
                const term = draw.lunar_calendar.solar_term;
                
                if (!termPatterns[term]) {
                    termPatterns[term] = {};
                    termStats[term] = { totalDraws: 0, numberCount: {} };
                }

                termStats[term].totalDraws++;

                draw.numbers.forEach(number => {
                    termPatterns[term][number] = (termPatterns[term][number] || 0) + 1;
                    termStats[term].numberCount[number] = (termStats[term].numberCount[number] || 0) + 1;
                });

                if (draw.bonus) {
                    termPatterns[term][draw.bonus] = (termPatterns[term][draw.bonus] || 0) + 0.5;
                    termStats[term].numberCount[draw.bonus] = (termStats[term].numberCount[draw.bonus] || 0) + 0.5;
                }
            }
        });

        return { termPatterns, termStats };
    }

    /**
     * 음력 일자별 패턴 분석 (초순/중순/말순)
     */
    analyzeLunarDayPatterns() {
        const dayRangePatterns = {};
        const dayRangeStats = {};

        this.lottoData.forEach(draw => {
            if (draw.lunar_calendar && !draw.lunar_calendar.error) {
                const day = draw.lunar_calendar.lunar_day;
                let range;
                
                if (day <= 10) range = '초순';
                else if (day <= 20) range = '중순';
                else range = '말순';
                
                if (!dayRangePatterns[range]) {
                    dayRangePatterns[range] = {};
                    dayRangeStats[range] = { totalDraws: 0, numberCount: {} };
                }

                dayRangeStats[range].totalDraws++;

                draw.numbers.forEach(number => {
                    dayRangePatterns[range][number] = (dayRangePatterns[range][number] || 0) + 1;
                    dayRangeStats[range].numberCount[number] = (dayRangeStats[range].numberCount[number] || 0) + 1;
                });

                if (draw.bonus) {
                    dayRangePatterns[range][draw.bonus] = (dayRangePatterns[range][draw.bonus] || 0) + 0.5;
                    dayRangeStats[range].numberCount[draw.bonus] = (dayRangeStats[range].numberCount[draw.bonus] || 0) + 0.5;
                }
            }
        });

        return { dayRangePatterns, dayRangeStats };
    }

    /**
     * 요일별 패턴 분석
     */
    analyzeWeekdayPatterns() {
        const weekdayPatterns = {};
        const weekdayStats = {};

        this.lottoData.forEach(draw => {
            if (draw.lunar_calendar && !draw.lunar_calendar.error) {
                const weekday = draw.lunar_calendar.weekday + '요일';
                
                if (!weekdayPatterns[weekday]) {
                    weekdayPatterns[weekday] = {};
                    weekdayStats[weekday] = { totalDraws: 0, numberCount: {} };
                }

                weekdayStats[weekday].totalDraws++;

                draw.numbers.forEach(number => {
                    weekdayPatterns[weekday][number] = (weekdayPatterns[weekday][number] || 0) + 1;
                    weekdayStats[weekday].numberCount[number] = (weekdayStats[weekday].numberCount[number] || 0) + 1;
                });

                if (draw.bonus) {
                    weekdayPatterns[weekday][draw.bonus] = (weekdayPatterns[weekday][draw.bonus] || 0) + 0.5;
                    weekdayStats[weekday].numberCount[draw.bonus] = (weekdayStats[weekday].numberCount[draw.bonus] || 0) + 0.5;
                }
            }
        });

        return { weekdayPatterns, weekdayStats };
    }

    /**
     * 전체 상관관계 분석 실행
     */
    async runFullAnalysis() {
        console.log('🌙 음력 로또 상관관계 분석 시작...');
        
        const success = await this.loadData();
        if (!success) return null;

        this.analysisResults = {
            lunarMonth: this.analyzeLunarMonthPatterns(),
            ganzhi: this.analyzeGanzhiPatterns(),
            solarTerm: this.analyzeSolarTermPatterns(),
            lunarDay: this.analyzeLunarDayPatterns(),
            weekday: this.analyzeWeekdayPatterns()
        };

        console.log('✅ 분석 완료!');
        return this.analysisResults;
    }

    /**
     * 분석 결과를 사람이 읽기 쉬운 형태로 출력
     */
    printAnalysisReport() {
        if (!this.analysisResults.lunarMonth) {
            console.log('❌ 분석 결과가 없습니다. runFullAnalysis()를 먼저 실행하세요.');
            return;
        }

        console.log('\n📊 음력 로또 상관관계 분석 보고서');
        console.log('=' * 60);

        // 1. 음력 월별 선호 번호
        console.log('\n🌙 음력 월별 선호 번호 TOP 5:');
        const monthPrefs = this.analysisResults.lunarMonth.monthPreferences;
        
        Object.keys(monthPrefs).forEach(month => {
            const numbers = Object.entries(monthPrefs[month])
                .filter(([num, data]) => data.preference === 'high')
                .sort((a, b) => b[1].bias - a[1].bias)
                .slice(0, 5);
            
            if (numbers.length > 0) {
                console.log(`  ${month}: ${numbers.map(([num, data]) => 
                    `${num}(${(data.bias * 100).toFixed(1)}%)`).join(', ')}`);
            }
        });

        // 2. 간지년별 특징
        console.log('\n🐲 간지년별 추첨 현황:');
        const ganzhiStats = this.analysisResults.ganzhi.ganzhiStats;
        Object.entries(ganzhiStats)
            .sort((a, b) => b[1].totalDraws - a[1].totalDraws)
            .slice(0, 10)
            .forEach(([ganzhi, stats]) => {
                console.log(`  ${ganzhi}: ${stats.totalDraws}회`);
            });

        // 3. 24절기별 특징
        console.log('\n🌱 24절기별 추첨 현황:');
        const termStats = this.analysisResults.solarTerm.termStats;
        Object.entries(termStats)
            .sort((a, b) => b[1].totalDraws - a[1].totalDraws)
            .forEach(([term, stats]) => {
                console.log(`  ${term}: ${stats.totalDraws}회`);
            });

        // 4. 음력 일자 범위별
        console.log('\n📅 음력 일자별 추첨 현황:');
        const dayStats = this.analysisResults.lunarDay.dayRangeStats;
        Object.entries(dayStats).forEach(([range, stats]) => {
            console.log(`  ${range}: ${stats.totalDraws}회`);
        });

        // 5. 요일별
        console.log('\n📆 요일별 추첨 현황:');
        const weekdayStats = this.analysisResults.weekday.weekdayStats;
        Object.entries(weekdayStats)
            .sort((a, b) => b[1].totalDraws - a[1].totalDraws)
            .forEach(([weekday, stats]) => {
                console.log(`  ${weekday}: ${stats.totalDraws}회`);
            });
    }

    /**
     * 특정 음력 조건에 맞는 추천 번호 생성
     */
    generateLunarBasedNumbers(targetMonth = null, targetGanzhi = null, targetTerm = null) {
        if (!this.analysisResults.lunarMonth) {
            console.log('❌ 분석 결과가 없습니다.');
            return null;
        }

        let recommendedNumbers = [];
        let sourceData = {};

        // 조건에 따른 데이터 선택
        if (targetMonth && this.analysisResults.lunarMonth.monthPreferences[targetMonth]) {
            sourceData = this.analysisResults.lunarMonth.monthPreferences[targetMonth];
        } else if (targetGanzhi && this.analysisResults.ganzhi.ganzhiPatterns[targetGanzhi]) {
            // 간지년 데이터를 빈도 기반으로 변환
            const ganzhiData = this.analysisResults.ganzhi.ganzhiPatterns[targetGanzhi];
            const totalCount = Object.values(ganzhiData).reduce((sum, count) => sum + count, 0);
            
            sourceData = {};
            Object.entries(ganzhiData).forEach(([num, count]) => {
                const frequency = count / totalCount;
                const expectedFreq = 1 / 45;
                sourceData[num] = {
                    count: count,
                    frequency: frequency,
                    bias: frequency / expectedFreq,
                    preference: frequency / expectedFreq > 1.1 ? 'high' : 'normal'
                };
            });
        }

        if (Object.keys(sourceData).length === 0) {
            console.log('❌ 해당 조건의 데이터가 없습니다.');
            return null;
        }

        // 선호도 높은 번호들 추출
        const highPrefNumbers = Object.entries(sourceData)
            .filter(([num, data]) => data.preference === 'high')
            .sort((a, b) => b[1].bias - a[1].bias)
            .map(([num]) => parseInt(num));

        const normalNumbers = Object.entries(sourceData)
            .filter(([num, data]) => data.preference === 'normal')
            .sort((a, b) => b[1].bias - a[1].bias)
            .map(([num]) => parseInt(num));

        // 번호 조합: 고선호 3개 + 일반 2개 + 랜덤 1개
        recommendedNumbers = [
            ...highPrefNumbers.slice(0, 3),
            ...normalNumbers.slice(0, 2),
            Math.floor(Math.random() * 45) + 1
        ];

        // 중복 제거 및 부족한 번호 채우기
        recommendedNumbers = [...new Set(recommendedNumbers)];
        while (recommendedNumbers.length < 6) {
            const randomNum = Math.floor(Math.random() * 45) + 1;
            if (!recommendedNumbers.includes(randomNum)) {
                recommendedNumbers.push(randomNum);
            }
        }

        return recommendedNumbers.sort((a, b) => a - b).slice(0, 6);
    }

    /**
     * 현재 날짜 기준 음력 정보로 번호 추천
     */
    getCurrentLunarRecommendation() {
        // 이 기능은 실제 음력 변환 라이브러리가 필요
        // 현재는 샘플로 정월 기준 추천
        return this.generateLunarBasedNumbers('정월');
    }
}

// 사용 예제 및 실행 함수
async function demonstrateLunarAnalysis() {
    const analyzer = new LunarLottoAnalyzer();
    
    // 전체 분석 실행
    await analyzer.runFullAnalysis();
    
    // 보고서 출력
    analyzer.printAnalysisReport();
    
    // 정월 기준 추천 번호
    console.log('\n🎯 정월 기준 추천 번호:');
    const recommendation = analyzer.generateLunarBasedNumbers('정월');
    console.log(recommendation);
    
    return analyzer;
}

// 브라우저 환경에서 사용할 수 있도록 전역 객체에 등록
if (typeof window !== 'undefined') {
    window.LunarLottoAnalyzer = LunarLottoAnalyzer;
    window.demonstrateLunarAnalysis = demonstrateLunarAnalysis;
}

// Node.js 환경에서 사용할 수 있도록 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LunarLottoAnalyzer, demonstrateLunarAnalysis };
} 